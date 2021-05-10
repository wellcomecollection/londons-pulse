resource "aws_s3_bucket" "moh_text" {
  bucket = "wellcomecollection-moh-text"
  acl    = "private"
}

data "aws_iam_policy_document" "moh_text_read" {
  statement {
    actions = [
      "s3:GetObject",
      "s3:ListBucket",
      "s3:GetObjectVersion"
    ]

    resources = [
      aws_s3_bucket.moh_text.arn,
      "${aws_s3_bucket.moh_text.arn}/*",
    ]
  }
}
