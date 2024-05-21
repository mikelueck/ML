terraform {
  backend "gcs" {
    bucket = "slackbotml-devops" # GCS bucket name to store terraform tfstate
    prefix = "SlackBotML" # Prefix name should be unique for each Terraform project having same remote state bucket.
  }
}
