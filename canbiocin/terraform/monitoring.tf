# Logging sink for canbiocin application logs
resource "google_logging_project_sink" "canbiocin_logs" {
  name        = "canbiocin-logs-${var.environment}"
  destination = "storage.googleapis.com/${google_storage_bucket.canbiocin_logs.name}"
  #filter      = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${google_cloud_run_v2_service.canbiocin_server.name}\""
  project     = var.project_id

  unique_writer_identity = true
}

# Storage bucket for log retention
resource "google_storage_bucket" "canbiocin_logs" {
  name          = "${var.project_id}-canbiocin-logs-${var.environment}"
  location      = "US"
  force_destroy = true
  project       = var.project_id

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type = "Delete"
    }
  }
}

# IAM binding for logging sink to write to storage
resource "google_storage_bucket_iam_binding" "canbiocin_logs_writer" {
  bucket = google_storage_bucket.canbiocin_logs.name
  role   = "roles/storage.objectCreator"

  members = [
    google_logging_project_sink.canbiocin_logs.writer_identity,
  ]
}

resource "google_monitoring_monitored_project" "primary" {
  metrics_scope = var.project_id
  name          = var.project_id
}

/*
# Uptime check for canbiocin application
resource "google_monitoring_uptime_check_config" "canbiocin_uptime" {
  display_name = "Canbiocin Uptime Check - ${var.environment}"
  project      = var.project_id

  http_check {
    port = 443
    use_ssl = true
    path = "/health"
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      host = google_cloud_run_v2_service.canbiocin_server.uri
    }
  }

  timeout_ms = 10000
}

# Alert policy for high error rate
resource "google_monitoring_alert_policy" "canbiocin_error_rate" {
  display_name = "Canbiocin High Error Rate - ${var.environment}"
  project      = var.project_id
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "Error rate is high"

    condition_threshold {
      filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${google_cloud_run_v2_service.canbiocin_server.name}\" AND metric.type=\"run.googleapis.com/request_count\""

      comparison = "COMPARISON_GREATER_THAN"
      threshold_value = 0.05

      duration = "300s"

      aggregations {
        alignment_period = "60s"
        per_series_aligner = "ALIGN_RATE"
        cross_series_reducer = "REDUCE_MEAN"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.canbiocin_email.name]
}

# Alert policy for high latency
resource "google_monitoring_alert_policy" "canbiocin_latency" {
  display_name = "Canbiocin High Latency - ${var.environment}"
  project      = var.project_id
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "Request latency is high"

    condition_threshold {
      filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${google_cloud_run_v2_service.canbiocin_server.name}\" AND metric.type=\"run.googleapis.com/request_latencies\""

      comparison = "COMPARISON_GREATER_THAN"
      threshold_value = 5000

      duration = "300s"

      aggregations {
        alignment_period = "60s"
        per_series_aligner = "ALIGN_MEAN"
        cross_series_reducer = "REDUCE_MEAN"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.canbiocin_email.name]
}

# Email notification channel
resource "google_monitoring_notification_channel" "canbiocin_email" {
  display_name = "Canbiocin Email Alerts - ${var.environment}"
  type         = "email"
  project      = var.project_id

  labels = {
    email_address = "admin@example.com"  # Replace with actual email
  }
}

# Dashboard for canbiocin metrics
resource "google_monitoring_dashboard" "canbiocin_dashboard" {
  dashboard_json = jsonencode({
    displayName = "Canbiocin Dashboard - ${var.environment}"
    gridLayout = {
      widgets = [
        {
          title = "Request Count"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "metric.type=\"run.googleapis.com/request_count\" AND resource.labels.service_name=\"${google_cloud_run_v2_service.canbiocin_server.name}\""
                }
              }
            }]
          }
        },
        {
          title = "Request Latency"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "metric.type=\"run.googleapis.com/request_latencies\" AND resource.labels.service_name=\"${google_cloud_run_v2_service.canbiocin_server.name}\""
                }
              }
            }]
          }
        },
        {
          title = "Error Rate"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "metric.type=\"run.googleapis.com/request_count\" AND resource.labels.service_name=\"${google_cloud_run_v2_service.canbiocin_server.name}\" AND metric.labels.response_code_class=\"4xx\""
                }
              }
            }]
          }
        }
      ]
    }
  })
  project = var.project_id
} 
*/
