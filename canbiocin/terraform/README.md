# Canbiocin Terraform Infrastructure

This directory contains the Terraform configuration for deploying the Canbiocin application on Google Cloud Platform (GCP).

## Architecture Overview

The infrastructure includes:

- **VPC with 3 subnets** across multiple zones for high availability
- **Firestore database** for data persistence
- **Artifact Registry** for container image storage
- **Cloud Run** for serverless application hosting
- **Load Balancer** with SSL termination
- **VPC Access Connector** for private networking
- **Cloud Build** for CI/CD automation
- **Monitoring and Logging** with alerting

## Prerequisites

1. **Google Cloud SDK** installed and configured
2. **Terraform** (version >= 1.0) installed
3. **GCP Project** with billing enabled
4. **Required APIs** enabled:
   - Cloud Run API
   - Artifact Registry API
   - Firestore API
   - Cloud Build API
   - Compute Engine API
   - VPC Access API
   - Monitoring API
   - Logging API

## Quick Start

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

### 2. Configure Variables

Create a `terraform.tfvars` file with your project details:

```hcl
project_id = "your-gcp-project-id"
region     = "us-central1"
environment = "dev"
```

### 3. Plan and Apply

```bash
terraform plan
terraform apply
```

## Infrastructure Components

### Networking (`networking.tf`)

- **VPC**: Custom VPC with regional routing
- **Subnets**: 3 subnets across different zones
- **Cloud Router & NAT**: For internet access from private subnets
- **Firewall Rules**: Security rules for internal and external access
- **VPC Access Connector**: For Cloud Run to access VPC resources

### Database (`firestore.tf`)

- **Firestore Database**: Native Firestore with backup and recovery
- **Indexes**: Optimized indexes for common queries
- **IAM Permissions**: Service account access to Firestore

### Container Registry (`artifact-registry.tf`)

- **Artifact Registry**: Docker image storage with cleanup policies
- **IAM Permissions**: Cloud Build and Cloud Run access
- **Development Repository**: Separate repo for development images

### Monitoring (`monitoring.tf`)

- **Logging**: Centralized log collection and retention
- **Monitoring**: Uptime checks and alerting
- **Dashboards**: Custom monitoring dashboards
- **Alerts**: Error rate and latency monitoring

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `project_id` | GCP Project ID | (required) |
| `environment` | Environment name | `dev` |
| `region` | GCP Region | `us-central1` |
| `zones` | GCP Zones | `["us-central1-a", "us-central1-b", "us-central1-c"]` |
| `vpc_cidr` | VPC CIDR block | `10.0.0.0/16` |
| `subnet_cidrs` | Subnet CIDR blocks | `["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]` |
| `firestore_location` | Firestore location | `us-central1` |
| `firestore_type` | Firestore type | `FIRESTORE_NATIVE` |

## Deployment

### Development Environment

```bash
terraform workspace new dev
terraform apply -var="environment=dev"
```

### Production Environment

```bash
terraform workspace new prod
terraform apply -var="environment=prod"
```

## Building and Deploying Applications

### Using Cloud Build

The infrastructure includes Cloud Build triggers that automatically build and deploy the application when code is pushed to the repository.

**Development builds** (triggered on `develop` branch):
- Uses `cloudbuild.yaml`
- Deploys to development environment
- Uses development Artifact Registry

**Production builds** (triggered on `main` branch):
- Uses `cloudbuild-prod.yaml`
- Includes security scanning
- Deploys to production environment
- Uses production Artifact Registry

### Manual Deployment

```bash
# Build and push image
gcloud builds submit --config cloudbuild.yaml

# Deploy to Cloud Run
gcloud run deploy canbiocin-server-${ENVIRONMENT} \
  --image us-central1-docker.pkg.dev/PROJECT_ID/canbiocin-dev/backend:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
```

## Monitoring and Logging

### Accessing Logs

```bash
# View Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=canbiocin-server-dev" --limit=50

# View Firestore logs
gcloud logging read "resource.type=cloud_datastore_database" --limit=50
```

### Monitoring Dashboard

Access the monitoring dashboard in the Google Cloud Console:
1. Go to Monitoring > Dashboards
2. Look for "Canbiocin Dashboard - {environment}"

### Alerts

The infrastructure includes alerting for:
- High error rates (>5%)
- High latency (>5 seconds)
- Service downtime

## Security

### Network Security

- Private subnets with NAT for outbound internet access
- VPC Access Connector for Cloud Run to access private resources
- Firewall rules limiting access to necessary ports
- Load balancer with SSL termination

### IAM Security

- Dedicated service accounts with minimal permissions
- Principle of least privilege applied
- Separate service accounts for different environments

### Container Security

- Immutable tags in Artifact Registry
- Security scanning in production builds
- Private container registry access

## Cost Optimization

### Recommendations

1. **Use appropriate instance sizes** for Cloud Run
2. **Enable auto-scaling** to scale to zero when not in use
3. **Monitor resource usage** and adjust limits
4. **Use lifecycle policies** in Artifact Registry
5. **Enable log retention policies** to manage storage costs

### Estimated Costs (Monthly)

- **Firestore**: $5-50 (depending on data and operations)
- **Artifact Registry**: $5-20 (depending on storage)
- **Load Balancer**: $20-50
- **VPC Access Connector**: $10-30
- **Monitoring**: $10-30

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure service accounts have proper IAM roles
2. **VPC Access Issues**: Check VPC Access Connector configuration
3. **Build Failures**: Verify Cloud Build service account permissions
4. **SSL Certificate Issues**: Check domain configuration for managed certificates

### Useful Commands

```bash
# Check Terraform state
terraform state list

# View specific resource
terraform state show google_cloud_run_v2_service.canbiocin_server

# Refresh state
terraform refresh

# Destroy specific resource
terraform destroy -target=google_cloud_run_v2_service.canbiocin_server
```

## Contributing

When making changes to the infrastructure:

1. Create a new branch for your changes
2. Test changes in development environment first
3. Update documentation as needed
4. Submit a pull request with detailed description

## Support

For issues with the infrastructure:
1. Check the troubleshooting section
2. Review Cloud Build logs
3. Check Terraform state
4. Contact the infrastructure team 
