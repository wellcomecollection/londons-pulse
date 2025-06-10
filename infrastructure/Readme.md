# Infrastructure

Infrastructure is very light, consisting of:

* MSSQL RDS instance
* Fargate ECS service running MoH dotnet application
* S3 bucket for text files
* Load balancer, redirecting `moh.wellcomecollection.digirati.io` to ECS service.
  * Load balancer uses wildcard certificate for `*.wellcomecollection.digirati.io` from [iiif-builder-infrastructure](https://github.com/wellcomecollection/iiif-builder-infrastructure) repo.

## Bastion host

If required a bastion host can be used to provide access to the infrastructure. The bastion host auto-scaling group is scaled to zero by default, and can be scaled up manually to provide access to the infrastructure. If required, the bastion host can be used to SSH into the ECS Fargate tasks to run commands or debug issues.

> Note: Networking infrastructure (VPC + Subnets) are managed in the central [platform-infrastructure](https://github.com/wellcomecollection/platform-infrastructure/) repository.
