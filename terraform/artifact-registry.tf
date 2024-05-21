
resource "google_artifact_registry_repository" "SlackBotRepo" {
  location    = var.region
  repository_id = "gcf-source"
  description = "SlackBot Cloud Function repository"
  format = "docker"
}

## Grant permissions for Cloud Function to push images
#resource "google_artifact_registry_repository_iam_binding" "cloud_function_iam_binding" {
#  repository = google_artifact_registry_repository.SlackBotRepo.name
#  location   = var.region
#  role       = "roles/artifactregistry.writer"
#  project    = var.project_id
#
#  members = [
#    "serviceAccount:${google_cloudfunctions_function.Cloud_function.service_account_email}"
#  ]
#}

