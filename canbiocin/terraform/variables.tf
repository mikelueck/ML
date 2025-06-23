variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "zones" {
  description = "The GCP zones for multi-zone deployment"
  type        = list(string)
  #default     = ["us-central1-a", "us-central1-b", "us-central1-c"]
  default     = ["us-central1-a"]
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_cidrs" {
  description = "CIDR blocks for subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "canbiocin_image" {
  description = "Docker image for canbiocin server"
  type        = string
  default     = "backend"
}

variable "canbiocin_version" {
  description = "Version tag for canbiocin server"
  type        = string
  default     = "latest"
}

variable "envoy_image" {
  description = "Docker image for canbiocin server"
  type        = string
  default     = "envoy"
}

variable "envoy_version" {
  description = "Version tag for canbiocin server"
  type        = string
  default     = "latest"
}


variable "firestore_location" {
  description = "Location for Firestore database"
  type        = string
  default     = "us-central1"
}

variable "firestore_type" {
  description = "Type of Firestore database (FIRESTORE_NATIVE or DATASTORE_MODE)"
  type        = string
  default     = "FIRESTORE_NATIVE"
}

# MIG Configuration
variable "machine_type" {
  description = "Machine type for MIG instances"
  type        = string
  default     = "t2a-standard-2"
}

variable "instance_count_per_zone" {
  description = "Number of instances per zone in each MIG"
  type        = number
  default     = 1
}

variable "disk_size_gb" {
  description = "Boot disk size in GB for MIG instances"
  type        = number
  default     = 20
}

variable "static_site_version" {
  description = "Version tag for static site deployment"
  type        = string
  default     = "latest"
}

