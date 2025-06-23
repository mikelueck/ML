terraform {
  backend "gcs" {
    bucket = "canbiocin-devops" # GCS bucket name to store terraform tfstate
    prefix = "Canbiocin" # Prefix name should be unique for each Terraform project having same remote state bucket.
  }
}

