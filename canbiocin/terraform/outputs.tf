# Network outputs
output "vpc_name" {
  description = "Name of the VPC"
  value       = google_compute_network.canbiocin_vpc.name
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = google_compute_network.canbiocin_vpc.id
}

output "subnet_names" {
  description = "Names of all subnets"
  value       = google_compute_subnetwork.canbiocin_subnets[*].name
}

output "subnet_cidrs" {
  description = "CIDR ranges of all subnets"
  value       = google_compute_subnetwork.canbiocin_subnets[*].ip_cidr_range
}

# Artifact Registry outputs
output "artifact_registry_name" {
  description = "Name of the main Artifact Registry repository"
  value       = google_artifact_registry_repository.canbiocin_repo.name
}

output "artifact_registry_location" {
  description = "Location of the Artifact Registry repository"
  value       = google_artifact_registry_repository.canbiocin_repo.location
}

output "artifact_registry_repository_id" {
  description = "Repository ID of the Artifact Registry"
  value       = google_artifact_registry_repository.canbiocin_repo.repository_id
}

output "static_ip" {
  description = "Static IP address"
  value       = google_compute_global_address.static_ip_address.address
}

# Load Balancer outputs
output "load_balancer_ip_http" {
  description = "IP address of the load balancer"
  value       = google_compute_global_forwarding_rule.canbiocin_lb_http.ip_address
}

output "load_balancer_ip_https" {
  description = "IP address of the load balancer"
  value       = google_compute_global_forwarding_rule.canbiocin_lb_https.ip_address
}

output "load_balancer_name_http" {
  description = "Name of the load balancer"
  value       = google_compute_global_forwarding_rule.canbiocin_lb_http.name
}

output "load_balancer_name_https" {
  description = "Name of the load balancer"
  value       = google_compute_global_forwarding_rule.canbiocin_lb_https.name
}

# Firestore outputs
output "firestore_database_name" {
  description = "Name of the Firestore database"
  value       = google_firestore_database.canbiocin_firestore.name
}

output "firestore_location" {
  description = "Location of the Firestore database"
  value       = google_firestore_database.canbiocin_firestore.location_id
}

# Service Account outputs
output "service_account_email" {
  description = "Email of the service account"
  value       = google_service_account.canbiocin_service_account.email
}

output "service_account_name" {
  description = "Name of the service account"
  value       = google_service_account.canbiocin_service_account.name
}

# SSL Certificate outputs
output "ssl_certificate_name" {
  description = "Name of the managed SSL certificate"
  value       = google_compute_managed_ssl_certificate.canbiocin_ssl_cert.name
}

# Health Check outputs
output "health_check_name" {
  description = "Name of the health check"
  value       = google_compute_health_check.canbiocin_health_check.name
}

# Router outputs
output "router_name" {
  description = "Name of the Cloud Router"
  value       = google_compute_router.canbiocin_router.name
}

output "nat_name" {
  description = "Name of the Cloud NAT"
  value       = google_compute_router_nat.canbiocin_nat.name
}

# MIG outputs
output "instance_template_name" {
  description = "Name of the instance template"
  value       = google_compute_instance_template.canbiocin_template.name
}

output "mig_names" {
  description = "Names of all Managed Instance Groups"
  value       = google_compute_region_instance_group_manager.canbiocin_migs[*].name
}

output "mig_instance_groups" {
  description = "Instance group URLs for all MIGs"
  value       = google_compute_region_instance_group_manager.canbiocin_migs[*].instance_group
}

output "backend_service_name" {
  description = "Name of the backend service"
  value       = google_compute_backend_service.canbiocin_backend.name
}

# Updated Cloud Run outputs (now MIG-based)
output "service_name" {
  description = "Name of the service (MIG-based)"
  value       = google_compute_backend_service.canbiocin_backend.name
}

output "service_url" {
  description = "URL of the service (load balancer)"
  value       = "https://${google_compute_managed_ssl_certificate.canbiocin_ssl_cert.managed[0].domains[0]}"
}

output "service_location" {
  description = "Location of the service (region)"
  value       = var.region
} 
