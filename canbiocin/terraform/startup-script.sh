#!/bin/bash

# Startup script for canbiocin instances with Envoy proxy

set -e

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
fi

HOME=/tmp docker-credential-gcr configure-docker --registries ${region}-docker.pkg.dev

# Pull and start the canbiocin backend container
docker --config /tmp/.docker pull ${region}-docker.pkg.dev/${project_id}/${artifact_registry_repo}/${canbiocin_image}:${canbiocin_version}


# Ideally this is done with docker compose but it doesn't seem to be available
# on GCP COS images.  I would need to install it here and I just don't want 
# to take the time
docker network create my-envoy-network

echo "Running ${region}-docker.pkg.dev/${project_id}/${artifact_registry_repo}/${canbiocin_image}:${canbiocin_version}"
docker --config /tmp/.docker run -d \
  --name canbiocin-backend \
  --network my-envoy-network \
  --restart unless-stopped \
  --log-driver=gcplogs \
  -p 8082:8082 \
  -e ENVIRONMENT=${environment} \
  -e PROJECT_ID=${project_id} \
  -e REGION=${region} \
  ${region}-docker.pkg.dev/${project_id}/${artifact_registry_repo}/${canbiocin_image}:${canbiocin_version}


# Pull and start Envoy proxy
docker --config /tmp/.docker pull ${region}-docker.pkg.dev/${project_id}/${artifact_registry_repo}/${envoy_image}:${envoy_version}

docker --config /tmp/.docker run -d \
  --name envoy-proxy \
  --network my-envoy-network \
  --restart unless-stopped \
  -p 8080:8080 \
  -p 10000:10000 \
  ${region}-docker.pkg.dev/${project_id}/${artifact_registry_repo}/${envoy_image}:${envoy_version}

# Wait for services to be ready
sleep 30

curl http://localhost:10000/clusters

netstat -an | grep "tcp" | grep "LISTEN" | awk '{print $4}' | grep -wo "....$"
curl http://localhost:10000/clusters
