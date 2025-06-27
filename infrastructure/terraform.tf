provider "aws" {
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
  required_version = ">= 1.8"

  backend "s3" {
    bucket = "dlcs-remote-state"
    key    = "moh/terraform.tfstate"
    region = "eu-west-1"

    profile = "wcdev"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.41.0"
    }
  }
}