bazel run :tar-docker
bazel run //canbiocin/envoy:tar-docker

docker compose up -d

#docker network create my-envoy-network
#
#docker rm canbiocin-backend
#
#docker run \
#  -d \
#  --name canbiocin-backend \
#  --network my-envoy-network \
#  -v /Users/mikelueck/.gcp/dev.json:/app/credentials.json \
#  -e GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json \
#  -p 8082:8082 \
#  localhost:4000/canbiocin_server:latest
#
#docker rm envoy-proxy
#
#docker run \
#  -d \
#  --name envoy-proxy \
#  --network my-envoy-network \
#  -p 8080:8080 \
#  -p 10000:10000 \
#  envoy:v0.0.1

bazel run //canbiocin/client:dev
