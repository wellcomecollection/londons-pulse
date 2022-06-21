resource "aws_key_pair" "this" {
  key_name   = "moh"
  public_key = file("files/key.pub")

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group" "ssh" {
  name        = "moh-bastion"
  description = "SSH access"
  vpc_id      = data.terraform_remote_state.platform_infra.outputs.moh_vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = local.ip_whitelist
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "moh-ssh-access",
  }
}

# Bastion - t2.micro amazon linux 2
data "aws_iam_policy_document" "assume_role_policy_ec2" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "bastion" {
  name               = "moh-bastion"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy_ec2.json
}

data "aws_iam_policy_document" "bastion_abilities" {
  statement {
    sid = "allowLoggingToCloudWatch"

    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = ["*"]
  }
}

resource "aws_iam_policy" "bastion_abilities" {
  name        = "moh-bastion-abilities"
  description = "Bastion userdata abilities"
  policy      = data.aws_iam_policy_document.bastion_abilities.json
}

resource "aws_iam_role_policy_attachment" "bastion_abilities" {
  role       = aws_iam_role.bastion.name
  policy_arn = aws_iam_policy.bastion_abilities.arn
}

resource "aws_iam_instance_profile" "bastion" {
  name = "moh-bastion"
  role = aws_iam_role.bastion.name
}

resource "aws_launch_configuration" "bastion" {
  name_prefix          = "moh-bastion"
  image_id             = "ami-063d4ab14480ac177"
  instance_type        = "t2.micro"
  iam_instance_profile = aws_iam_instance_profile.bastion.name
  key_name             = aws_key_pair.this.key_name

  security_groups = [
    aws_security_group.moh.id,
    aws_security_group.ssh.id,
  ]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "bastion" {
  name                 = "moh-bastion"
  launch_configuration = aws_launch_configuration.bastion.name

  max_size            = "1"
  min_size            = "1"
  vpc_zone_identifier = data.terraform_remote_state.platform_infra.outputs.moh_vpc_public_subnets

  default_cooldown = 0

  lifecycle {
    create_before_destroy = true
  }

  tag {
    key                 = "Name"
    value               = "moh-bastion"
    propagate_at_launch = true
  }

  tag {
    key                 = "Project"
    value               = local.project
    propagate_at_launch = true
  }
}
