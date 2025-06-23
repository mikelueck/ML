# Firestore database for canbiocin project
resource "google_firestore_database" "canbiocin_firestore" {
  name        = "(default)"
  location_id = var.firestore_location
  type        = var.firestore_type
  project     = var.project_id

  # Enable point-in-time recovery
  point_in_time_recovery_enablement = "POINT_IN_TIME_RECOVERY_ENABLED"

  # Enable delete protection
  delete_protection_state = "DELETE_PROTECTION_ENABLED"
}

resource "google_firestore_backup_schedule" "daily-backup" {
  project     = var.project_id
  database = google_firestore_database.canbiocin_firestore.name

  retention = "8467200s" // 14 weeks (maximum possible retention)

  daily_recurrence {}
}

# Firestore indexes for better query performance
resource "google_firestore_index" "canbiocin_recipes_index" {
  collection = "recipes"
  project    = var.project_id

  fields {
    field_path = "user_id"
    order      = "ASCENDING"
  }

  fields {
    field_path = "created_at"
    order      = "DESCENDING"
  }

  fields {
    field_path = "__name__"
    order      = "ASCENDING"
  }
}

resource "google_firestore_index" "canbiocin_prebiotics_index" {
  collection = "prebiotics"
  project    = var.project_id

  fields {
    field_path = "id"
    order      = "ASCENDING"
  }

  fields {
    field_path = "category"
    order      = "ASCENDING"
  }

  fields {
    field_path = "name"
    order      = "ASCENDING"
  }
}

resource "google_firestore_index" "canbiocin_probiotics_index" {
  collection = "probiotics"
  project    = var.project_id

  fields {
    field_path = "id"
    order      = "ASCENDING"
  }

  fields {
    field_path = "name"
    order      = "ASCENDING"
  }
}

resource "google_firestore_index" "canbiocin_postbiotics_index" {
  collection = "postbiotics"
  project    = var.project_id

  fields {
    field_path = "id"
    order      = "ASCENDING"
  }

  fields {
    field_path = "name"
    order      = "ASCENDING"
  }
}


# IAM binding for Cloud Run service to access Firestore
resource "google_project_iam_binding" "firestore_user" {
  project = var.project_id
  role    = "roles/datastore.user"

  members = [
    "serviceAccount:${google_service_account.canbiocin_service_account.email}",
  ]
}

# IAM binding for Firestore admin access (if needed)
resource "google_project_iam_binding" "firestore_admin" {
  project = var.project_id
  role    = "roles/datastore.owner"

  members = [
    "serviceAccount:${google_service_account.canbiocin_service_account.email}",
  ]
} 
