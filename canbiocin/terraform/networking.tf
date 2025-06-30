# VPC for canbiocin project
resource "google_compute_network" "canbiocin_vpc" {
  name                    = "canbiocin-vpc-${var.environment}"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
  project                 = var.project_id
}

# Subnets across multiple zones
resource "google_compute_subnetwork" "canbiocin_subnets" {
  count         = length(var.zones)
  name          = "canbiocin-subnet-${var.environment}-${count.index + 1}"
  ip_cidr_range = var.subnet_cidrs[count.index]
  region        = var.region
  network       = google_compute_network.canbiocin_vpc.id
  project       = var.project_id

  # Enable flow logs for network monitoring
  #log_config {
  #  aggregation_interval = "INTERVAL_5_SEC"
  #  flow_sampling       = 0.5
  #  metadata            = "INCLUDE_ALL_METADATA"
  #}

  # Private Google access for services to reach Google APIs
  private_ip_google_access = true
}

# Cloud Router for NAT
resource "google_compute_router" "canbiocin_router" {
  name    = "canbiocin-router-${var.environment}"
  region  = var.region
  network = google_compute_network.canbiocin_vpc.id
  project = var.project_id
}

# Cloud NAT for private instances to access internet
resource "google_compute_router_nat" "canbiocin_nat" {
  name                               = "canbiocin-nat-${var.environment}"
  router                            = google_compute_router.canbiocin_router.name
  region                            = var.region
  project                           = var.project_id
  nat_ip_allocate_option            = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# Firewall rule for internal communication
resource "google_compute_firewall" "canbiocin_internal" {
  name    = "canbiocin-internal-${var.environment}"
  network = google_compute_network.canbiocin_vpc.name
  project = var.project_id

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = var.subnet_cidrs
  target_tags   = ["canbiocin-internal"]
}

# Firewall rule for health checks
resource "google_compute_firewall" "canbiocin_health_check" {
  name    = "canbiocin-health-check-${var.environment}"
  network = google_compute_network.canbiocin_vpc.name
  project = var.project_id

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "8080", "8082"]
  }

  source_ranges = ["35.191.0.0/16", "130.211.0.0/22"]
  target_tags   = ["canbiocin-server"]
}

# Firewall rule for external access to load balancer
resource "google_compute_firewall" "canbiocin_external" {
  name    = "canbiocin-external-${var.environment}"
  network = google_compute_network.canbiocin_vpc.name
  project = var.project_id

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["canbiocin-lb"]
} 
