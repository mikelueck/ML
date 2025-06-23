# Service account for canbiocin application
resource "google_service_account" "canbiocin_service_account" {
  account_id   = "canbiocin-${var.environment}"
  display_name = "Canbiocin Service Account - ${var.environment}"
  description  = "Service account for canbiocin application in ${var.environment} environment"
  project      = var.project_id
}

# IAM binding for Cloud Run service account
resource "google_project_iam_binding" "canbiocin_cloud_run" {
  project = var.project_id
  role    = "roles/run.invoker"

  members = [
    "serviceAccount:${google_service_account.canbiocin_service_account.email}",
  ]
}

# IAM binding for Artifact Registry access
resource "google_project_iam_binding" "canbiocin_artifact_registry" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"

  members = [
    "serviceAccount:${google_service_account.canbiocin_service_account.email}",
  ]
}

# IAM binding for Cloud Logging
resource "google_project_iam_binding" "canbiocin_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"

  members = [
    "serviceAccount:${google_service_account.canbiocin_service_account.email}",
  ]
}

# IAM binding for Cloud Monitoring
resource "google_project_iam_binding" "canbiocin_monitoring" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"

  members = [
    "serviceAccount:${google_service_account.canbiocin_service_account.email}",
  ]
} 