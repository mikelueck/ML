resource "google_storage_bucket" "static_site" {
  name          = "canbiocin-static-site-${var.environment}-${var.project_id}"
  location      = var.region
  project       = var.project_id
  force_destroy = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }

  uniform_bucket_level_access = true
}

resource "google_storage_bucket_iam_binding" "static_site_public" {
  bucket = google_storage_bucket.static_site.name
  role   = "roles/storage.objectViewer"
  members = [
    "allUsers",
  ]
}

output "static_site_bucket_name" {
  description = "Name of the static site GCS bucket"
  value       = google_storage_bucket.static_site.name
} 

resource "google_compute_backend_bucket" "static_site" {
  name        = "canbiocin-static-site-${var.environment}-${var.project_id}"
  bucket_name = google_storage_bucket.static_site.name
  enable_cdn  = false
  project     = var.project_id
}
