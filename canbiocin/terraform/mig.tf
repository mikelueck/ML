# Instance template for canbiocin backend and Envoy
resource "google_compute_instance_template" "canbiocin_template" {
  name_prefix  = "canbiocin-template-${var.environment}-"
  machine_type = var.machine_type
  project      = var.project_id

  # Use Container-Optimized OS for better container support
  disk {
    source_image = "cos-cloud/cos-arm64-stable"
    auto_delete  = true
    boot         = true
    disk_size_gb = var.disk_size_gb
  }

  # Network interface
  network_interface {
    subnetwork = google_compute_subnetwork.canbiocin_subnets[0].id
  }

  # Metadata for startup script
  metadata = {
    startup-script = templatefile("${path.module}/startup-script.sh", {
      project_id = var.project_id
      environment = var.environment
      region = var.region
      canbiocin_image = var.canbiocin_image
      canbiocin_version = var.canbiocin_version
      envoy_image = var.envoy_image
      envoy_version = var.envoy_version
      artifact_registry_repo = google_artifact_registry_repository.canbiocin_repo.repository_id
    })
  }

  # Service account
  service_account {
    email  = google_service_account.canbiocin_service_account.email
    scopes = ["cloud-platform"]
  }

  # Tags for firewall rules
  tags = ["canbiocin-server", "canbiocin-internal"]

  # Lifecycle to allow updates
  lifecycle {
    create_before_destroy = true
  }
}

# Managed Instance Groups per zone
resource "google_compute_region_instance_group_manager" "canbiocin_migs" {
  count              = length(var.zones)
  name               = "canbiocin-mig-${var.environment}-${count.index + 1}"
  base_instance_name = "canbiocin-${var.environment}-${count.index + 1}"
  region             = var.region
  project            = var.project_id

  version {
    instance_template = google_compute_instance_template.canbiocin_template.id
  }

  # Auto-healing policy
  auto_healing_policies {
    //health_check      = google_compute_health_check.canbiocin_health_check.id
    health_check      = google_compute_health_check.canbiocin_health_check.id
    initial_delay_sec = 300
  }

  # Update policy
  update_policy {
    type                  = "PROACTIVE"
    minimal_action        = "REPLACE"
    max_surge_fixed       = 1
    max_unavailable_fixed = 0
  }

  # Distribution policy for multi-zone
  distribution_policy_zones = [var.zones[count.index]]

  # Target size
  target_size = var.instance_count_per_zone

  named_port {
    name = "envoy"
    port = "8080"
  }

  named_port {
    name = "envoyadmin"
    port = "10000"
  }
}

# Load balancer for external access
resource "google_compute_global_forwarding_rule" "canbiocin_lb_https" {
  name       = "canbiocin-lb-https-${var.environment}"
  target     = google_compute_target_https_proxy.canbiocin_https_proxy.id
  port_range = "443"
  project    = var.project_id
}

resource "google_compute_global_forwarding_rule" "canbiocin_lb_http" {
  name       = "canbiocin-lb-http-${var.environment}"
  target     = google_compute_target_http_proxy.canbiocin_http_proxy.id
  port_range = "80"
  project    = var.project_id
}

# HTTPS proxy for load balancer
resource "google_compute_target_https_proxy" "canbiocin_https_proxy" {
  name             = "canbiocin-https-proxy-${var.environment}"
  url_map          = google_compute_url_map.canbiocin_url_map.id
  ssl_certificates = [google_compute_managed_ssl_certificate.canbiocin_ssl_cert.id]
  project          = var.project_id
}

# HTTPS proxy for load balancer
resource "google_compute_target_http_proxy" "canbiocin_http_proxy" {
  name             = "canbiocin-http-proxy-${var.environment}"
  url_map          = google_compute_url_map.canbiocin_url_map.id
  project          = var.project_id
}

# URL map for load balancer
resource "google_compute_url_map" "canbiocin_url_map" {
  name            = "canbiocin-url-map-${var.environment}"
  default_service = google_compute_backend_service.canbiocin_backend.id
  project         = var.project_id

  path_matcher {
    name            = "prod"
    default_service = google_compute_backend_service.canbiocin_backend.id

    path_rule {
      paths   = ["/*"]
      service = google_compute_backend_bucket.static_site.id
    }

    path_rule {
      paths   = ["/CanbiocinService/*"] 
      service = google_compute_backend_service.canbiocin_backend.id
    }
  }

  host_rule {
    hosts        = ["*"]
    path_matcher = "prod"
  }
}

# Backend service for MIG instances
resource "google_compute_backend_service" "canbiocin_backend" {
  name        = "canbiocin-backend-${var.environment}"
  protocol    = "HTTP"
  port_name   = "envoy"
  timeout_sec = 30
  project     = var.project_id

  # Add all MIGs as backends
  dynamic "backend" {
    for_each = google_compute_region_instance_group_manager.canbiocin_migs
    content {
      group = backend.value.instance_group
    }
  }

  health_checks = [google_compute_health_check.canbiocin_health_check.id]

  # Session affinity for better performance
  session_affinity = "CLIENT_IP"
}

resource "google_compute_health_check" "canbiocin_health_check" {
  name               = "canbiocin-health-check-${var.environment}"
  timeout_sec        = 5
  check_interval_sec = 5
  project            = var.project_id

  grpc_health_check {
    port         = 8080
  }
}

# Managed SSL certificate
resource "google_compute_managed_ssl_certificate" "canbiocin_ssl_cert" {
  name    = "canbiocin-ssl-cert-${var.environment}"
  project = var.project_id

  managed {
    domains = ["canbiocin-${var.environment}.${var.project_id}.run.app"]
  }
}

# Firewall rule for Envoy admin interface
resource "google_compute_firewall" "canbiocin_envoy_admin" {
  name    = "canbiocin-envoy-admin-${var.environment}"
  network = google_compute_network.canbiocin_vpc.name
  project = var.project_id

  allow {
    protocol = "tcp"
    ports    = ["8080"]
  }

  source_ranges = var.subnet_cidrs
  target_tags   = ["canbiocin-server"]
} 
