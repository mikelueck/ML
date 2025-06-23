# Outputs for canbiocin infrastructure
output "canbiocin_vpc_name" {
  description = "Name of the VPC"
  value       = google_compute_network.canbiocin_vpc.name
}

output "canbiocin_subnet_names" {
  description = "Names of the subnets"
  value       = google_compute_subnetwork.canbiocin_subnets[*].name
}

output "canbiocin_artifact_registry" {
  description = "Artifact Registry repository for canbiocin"
  value       = google_artifact_registry_repository.canbiocin_repo.name
}

output "canbiocin_load_balancer_ip" {
  description = "IP address of the load balancer"
  value       = google_compute_global_forwarding_rule.canbiocin_lb.ip_address
}

output "canbiocin_service_account" {
  description = "Service account email for canbiocin"
  value       = google_service_account.canbiocin_service_account.email
}

output "canbiocin_firestore_database" {
  description = "Firestore database name"
  value       = google_firestore_database.canbiocin_firestore.name
}
