locals {
  region   = "eu-west-1"
  domain   = "wellcomecollection.digirati.io"
  hostname = "moh.${local.domain}"
  project  = "moh"
  common_tags = {
    Terraform = true
    Project   = local.project
  }

  vpc_id = data.terraform_remote_state.platform_infra.outputs.moh_vpc_id
}