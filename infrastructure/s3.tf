resource "aws_s3_bucket" "moh_text" {
  bucket = "wellcomecollection-moh-text"
  acl    = "private"
}