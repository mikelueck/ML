# Managed Instance Groups (MIG) Setup for Canbiocin

This Terraform configuration replaces the previous Cloud Run setup with Managed Instance Groups (MIG) per zone, providing better control over the infrastructure and allowing for custom configurations.

## Architecture Overview

The new setup consists of:

1. **Managed Instance Groups (MIG) per zone**: Each zone has its own MIG with configurable instance count
2. **Instance Template**: Defines the configuration for all instances including:
   - Container-Optimized OS (COS)
   - Envoy proxy running on port 8080
   - Canbiocin backend running on port 8081
3. **Load Balancer**: Global HTTPS load balancer distributing traffic across all MIGs
4. **Health Checks**: Automated health monitoring and instance replacement

## Components

### Instance Template (`mig.tf`)
- Uses Container-Optimized OS for better container support
- Runs both Envoy proxy and canbiocin backend containers
- Configurable machine type and disk size
- Includes startup script for container orchestration

### Managed Instance Groups
- One MIG per zone (configurable via `zones` variable)
- Auto-healing with health checks
- Proactive update policy for zero-downtime deployments
- Configurable instance count per zone

### Load Balancer
- Global HTTPS load balancer
- SSL certificate management
- Health checks for backend instances
- Session affinity for better performance

### Envoy Proxy
- Runs on each instance on port 8080
- Routes traffic to the canbiocin backend on port 8081
- Admin interface available on port 9901
- Configurable via `/etc/envoy/envoy.yaml`

## Configuration Variables

### New Variables
- `machine_type`: Machine type for MIG instances (default: "e2-medium")
- `instance_count_per_zone`: Number of instances per zone (default: 1)
- `disk_size_gb`: Boot disk size in GB (default: 20)

### Existing Variables
- `zones`: List of zones for MIG deployment
- `environment`: Environment name for resource naming
- `canbiocin_image` & `canbiocin_version`: Container image configuration

## Deployment

1. **Initialize Terraform**:
   ```bash
   terraform init
   ```

2. **Plan the deployment**:
   ```bash
   terraform plan -var="project_id=your-project-id"
   ```

3. **Apply the configuration**:
   ```bash
   terraform apply -var="project_id=your-project-id"
   ```

## Monitoring and Management

### Health Checks
- HTTP health checks on port 8080 at `/health`
- Auto-healing replaces unhealthy instances
- Health check logs available in Cloud Logging

### Scaling
- Manual scaling by updating `instance_count_per_zone`
- Automatic scaling can be added via autoscaler configuration

### Updates
- Zero-downtime updates via rolling replacement
- New instances are created before old ones are destroyed
- Health checks ensure only healthy instances receive traffic

## Security

### Network Security
- Instances run in private subnets
- NAT gateway for outbound internet access
- Firewall rules restrict access to necessary ports
- Load balancer provides SSL termination

### Service Account
- Dedicated service account for canbiocin instances
- Minimal required permissions
- No public access to instances

## Migration from Cloud Run

### Benefits
- Better control over infrastructure
- Custom container orchestration
- More predictable performance
- Lower cost for consistent workloads

### Considerations
- More complex configuration
- Requires manual scaling decisions
- Need to manage instance lifecycle
- Additional monitoring setup may be required

## Troubleshooting

### Instance Issues
1. Check instance logs in Cloud Logging
2. Verify startup script execution
3. Check container health with `docker ps`
4. Access Envoy admin interface on port 9901

### Load Balancer Issues
1. Verify health check configuration
2. Check SSL certificate status
3. Review backend service configuration
4. Monitor traffic distribution

### Network Issues
1. Verify VPC and subnet configuration
2. Check firewall rules
3. Validate NAT gateway setup
4. Review routing configuration 