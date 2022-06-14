resource "aws_db_subnet_group" "db" {
  name       = "moh-db"
  subnet_ids = data.terraform_remote_state.platform_infra.outputs.moh_vpc_private_subnets
  tags       = local.common_tags
}

data "aws_subnet" "private_subnets" {
  for_each = toset(data.terraform_remote_state.platform_infra.outputs.moh_vpc_private_subnets)
  id       = each.value
}

resource "aws_security_group" "moh_mssql_access" {
  description = "MOH Access to MSSQL"
  vpc_id      = local.vpc_id
  name        = "moh-mssql-access"

  ingress {
    protocol    = "tcp"
    from_port   = "1433"
    to_port     = "1433"
    cidr_blocks = [for s in data.aws_subnet.private_subnets : s.cidr_block]
  }

  tags = merge(
    local.common_tags,
    {
      Name = "moh-mssql-access",
    }
  )
}

data "aws_secretsmanager_secret_version" "admin_creds" {
  secret_id = "moh/production/db_admin"
}

resource "aws_db_instance" "mssql" {
  engine                     = "sqlserver-se"
  engine_version             = "15.00.4073.23.v1"
  identifier                 = "moh"
  instance_class             = "db.m5.large"
  allocated_storage          = 40
  username                   = jsondecode(data.aws_secretsmanager_secret_version.admin_creds.secret_string)["admin_username"]
  password                   = jsondecode(data.aws_secretsmanager_secret_version.admin_creds.secret_string)["admin_password"]
  storage_type               = "gp2"
  backup_retention_period    = "7"
  skip_final_snapshot        = true
  maintenance_window         = "sun:01:50-sun:02:20"
  backup_window              = "02:47-03:17"
  auto_minor_version_upgrade = false
  publicly_accessible        = false
  ca_cert_identifier         = "rds-ca-2019"
  license_model              = "license-included"
  option_group_name          = aws_db_option_group.mssql_backup_restore.id

  vpc_security_group_ids = [
    aws_security_group.moh.id,
    aws_security_group.moh_mssql_access.id,
  ]

  db_subnet_group_name = aws_db_subnet_group.db.name

  tags = local.common_tags
}

# allow native backup/restore
data "aws_iam_policy_document" "assume_role_policy_rds" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type        = "Service"
      identifiers = ["rds.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "moh_rds_role" {
  name               = "moh-rds"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy_rds.json
}

data "aws_iam_policy_document" "moh_rds_abilities" {
  statement {
    actions = [
      "s3:ListBucket",
      "s3:GetBucketLocation",
    ]

    resources = ["arn:aws:s3:::moh-temporary"]
  }

  statement {
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:ListMultipartUploadParts",
      "s3:AbortMultipartUpload"
    ]

    resources = ["arn:aws:s3:::moh-temporary/*"]
  }
}

resource "aws_iam_policy" "moh_rds_abilities" {
  name        = "moh-rds-abilities"
  description = "MoH RDS abilities"
  policy      = data.aws_iam_policy_document.moh_rds_abilities.json
}

resource "aws_iam_role_policy_attachment" "moh_rds_abilities" {
  role       = aws_iam_role.moh_rds_role.name
  policy_arn = aws_iam_policy.moh_rds_abilities.arn
}

resource "aws_db_option_group" "mssql_backup_restore" {
  name                     = "sqlserver-se-15-00-backup-restore"
  option_group_description = "MSSQL Option Group with Native BackupRestore"
  engine_name              = "sqlserver-se"
  major_engine_version     = "15.00"

  option {
    option_name = "SQLSERVER_BACKUP_RESTORE"

    option_settings {
      name  = "IAM_ROLE_ARN"
      value = aws_iam_role.moh_rds_role.arn
    }
  }
}
