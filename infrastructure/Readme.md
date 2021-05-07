# Infrastructure

Infrastructure is very light, consisting of:

* MSSQL RDS instance
* Fargate ECS service running MoH dotnet application
* S3 bucket for text files
* Load balancer, redirecting `moh.wellcomecollection.digirati.io` to ECS service.
  * Load balancer uses wildcard certificate for `*.wellcomecollection.digirati.io` from [iiif-builder-infrastructure](https://github.com/wellcomecollection/iiif-builder-infrastructure) repo.

> Note: Networking infrastructure (VPC + Subnets) are managed in the central [platform-infrastructure](https://github.com/wellcomecollection/platform-infrastructure/) repository.
