resource "google_storage_bucket" "bucket" {
  name     = format("%s-gcf-source", var.project_id)  # Every bucket name must be globally unique
  location = "US"
  uniform_bucket_level_access = true
}

#resource "google_storage_bucket_object" "object" {
#  name     = format("%s-function-source.zip", var.project_id)  # Every bucket name must be globally unique
#  bucket = google_storage_bucket.bucket.name
#  source = var.cf_project + "function-source.zip"  # Add path to the zipped function source code
#}

#resource "google_cloudfunctions2_function" "SlackBotML" {
#  name        = "SlackBotML"
#  location    = var.region
#  description = "My Slackbot"
#
#  build_config {
#    runtime     = "python312"
#    entry_point = var.cf_entrypoint
#    source {
#      storage_source {
#        bucket = google_storage_bucket.bucket.name
#        object = google_storage_bucket_object.object.name
#      }
#    }
#  }
#
#  service_config {
#    max_instance_count = 1
#    available_memory   = "256M"
#    timeout_seconds    = 60
#  }
#}

#resource "google_cloud_run_service_iam_member" "member" {
#  location = google_cloudfunctions2_function.SlackBotML.location
#  service  = google_cloudfunctions2_function.SlackBotML.name
#  role     = "roles/run.invoker"
#  member   = "allUsers"
#}

#output "function_uri" {
#  value = google_cloudfunctions2_function.SlackBotML.service_config[0].uri
#}
