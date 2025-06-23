# Artifact Registry for canbiocin project
resource "google_artifact_registry_repository" "canbiocin_repo" {
  location      = var.region
  repository_id = "canbiocin-${var.environment}"
  description   = "Canbiocin application container images"
  format        = "DOCKER"
  project       = var.project_id

  # Enable immutable tags for better security
  docker_config {
    #immutable_tags = true
  }

  # Configure cleanup policies
  cleanup_policies {
    id     = "keep-minimum-versions"
    action = "KEEP"
    most_recent_versions {
      keep_count = 10
    }
  }

  cleanup_policies {
    id     = "delete-old-versions"
    action = "DELETE"
    condition {
      older_than = "30d"
    }
  }
}
