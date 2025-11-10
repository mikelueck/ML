terraform {
  required_version = ">=1.8.2"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.27.0"
    }

    auth0 = {
      source = "auth0/auth0"
      version = ">=1.32.0"
    }
  }
}

