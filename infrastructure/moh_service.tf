locals {
  secret_env_vars = {
    "ConnectionStrings__Moh" = "moh/production/mohreports-connstr"
  }
}

resource "aws_ecr_repository" "moh" {
  name = "moh"
  tags = local.common_tags
}

# ECS Cluster
resource "aws_ecs_cluster" "moh" {
  name = "moh"
  tags = local.common_tags
}

# Logging container using fluentbit
module "log_router_container" {
  source    = "git::https://github.com/wellcomecollection/terraform-aws-ecs-service.git//modules/firelens?ref=v2.6.3"
  namespace = "moh"
}

module "log_router_permissions" {
  source    = "git::https://github.com/wellcomecollection/terraform-aws-ecs-service.git//modules/secrets?ref=v2.6.3"
  secrets   = module.log_router_container.shared_secrets_logging
  role_name = module.moh_task_definition.task_execution_role_name
}

# Create container definitions
module "moh_container_definition" {
  source = "git::https://github.com/wellcomecollection/terraform-aws-ecs-service.git//modules/container_definition?ref=v2.6.3"
  name   = "moh-web"

  image = "${aws_ecr_repository.moh.repository_url}:production"
  port_mappings = [{
    containerPort = 80
    hostPort      = 80
    protocol      = "tcp"
  }]

  secrets = local.secret_env_vars

  environment = {
    "ASPNETCORE_ENVIRONMENT" = "Production"
  }

  log_configuration = module.log_router_container.container_log_configuration

  tags = local.common_tags
}

# Create task definition
module "moh_task_definition" {
  source = "git::https://github.com/wellcomecollection/terraform-aws-ecs-service.git//modules/task_definition?ref=v2.6.3"

  cpu    = 1024
  memory = 4096

  container_definitions = [
    module.log_router_container.container_definition,
    module.moh_container_definition.container_definition
  ]

  launch_types = ["FARGATE"]
  task_name    = "moh-web"
}

# secrets
module "app_container_secrets_permissions" {
  source    = "git::github.com/wellcomecollection/terraform-aws-ecs-service.git//modules/secrets?ref=v2.6.3"
  secrets   = local.secret_env_vars
  role_name = module.moh_task_definition.task_execution_role_name
}

# Create service
module "service" {
  source = "git::https://github.com/wellcomecollection/terraform-aws-ecs-service.git//modules/service?ref=v2.6.3"

  cluster_arn  = aws_ecs_cluster.moh.arn
  service_name = "moh-web"

  task_definition_arn = module.moh_task_definition.arn

  subnets            = data.terraform_remote_state.platform_infra.outputs.moh_vpc_private_subnets
  security_group_ids = [aws_security_group.moh.id, ]

  target_group_arn = aws_alb_target_group.service.arn
  container_port   = 80
  container_name   = "moh-web"
}

resource "aws_iam_role_policy" "moh_read_moh_text_bucket" {
  name   = "moh-read-moh_text-bucket"
  role   = module.moh_task_definition.task_role_name
  policy = data.aws_iam_policy_document.moh_text_read.json
}

resource "aws_alb_target_group" "service" {
  name        = "moh-web"
  target_type = "ip"
  protocol    = "HTTP"

  deregistration_delay = 10
  port                 = 80
  vpc_id               = local.vpc_id

  health_check {
    path                = "/management/healthcheck"
    port                = 80
    protocol            = "HTTP"
    matcher             = 200
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_alb_listener_rule" "https" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 1

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.service.arn
  }

  condition {
    host_header {
      values = [local.hostname]
    }
  }

  condition {
    path_pattern {
      values = ["/*"]
    }
  }
}

resource "aws_route53_record" "service" {
  zone_id = data.aws_route53_zone.wellcomecollection_digirati_io.id
  name    = local.hostname
  type    = "A"

  alias {
    name                   = aws_alb.this.dns_name
    zone_id                = aws_alb.this.zone_id
    evaluate_target_health = false
  }
}