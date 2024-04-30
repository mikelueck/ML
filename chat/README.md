bazel run //chat/envoy:tar-docker
docker run -d --name envoy -p 10000:10000 -p 8080:8080 envoy:v0.0.1 

bazel run //chat/backend/test:tar-docker
docker run -d --name chat-server chat-server:v0.0.1

Should be able to check envoy status here:
http://localhost:10000/clusters

bazel run //chat/client:dev

Should be able to run localhost

Might have to change the IP for the chat server in envoy.yaml (check Docker network information)

"""
address:
  socket_address:
    address: 172.17.0.3 
    port_value: 8080
"""
