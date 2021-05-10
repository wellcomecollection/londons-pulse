locals {
  region   = "eu-west-1"
  domain   = "wellcomecollection.digirati.io"
  hostname = "moh.${local.domain}"
  project  = "moh"
  ip_whitelist = [
    "62.254.125.26/31", # Glasgow
    "62.254.125.28/30", # Glasgow
  ]
  common_tags = {
    Terraform = true
    Project   = local.project
  }

  vpc_id = data.terraform_remote_state.platform_infra.outputs.moh_vpc_id
}