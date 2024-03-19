provider "aws" {
  assume_role {
    role_arn = "arn:aws:iam::653428163053:role/digirati-developer"
  }

  region = local.region

  profile = "wcdev"
  default_tags {
    tags = {
      Terraform = true
      Project   = local.project
    }
  }
}

terraform {
  required_version = ">= 0.14"

  backend "s3" {
    bucket = "dlcs-remote-state"
    key    = "moh/terraform.tfstate"
    region = "eu-west-1"

    role_arn = "arn:aws:iam::653428163053:role/digirati-developer"

    profile = "wcdev"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.41.0"
    }
  }
}