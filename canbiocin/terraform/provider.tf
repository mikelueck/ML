provider "google" {
  project = var.project_id
  region =  var.region
}

// Environment variables provided by setupenv.sh
provider "auth0" {}
