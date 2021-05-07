# SSL Cert + Validation
data "aws_route53_zone" "wellcomecollection_digirati_io" {
  name = local.domain
}
