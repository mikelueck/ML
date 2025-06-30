import { createClient } from "@connectrpc/connect"
import { createGrpcWebTransport } from "@connectrpc/connect-web"
import { CanbiocinService } from "../proto/service_pb.js";

const transport = createGrpcWebTransport({
  baseUrl: "http://34.8.40.109:80",
  //baseUrl: "http://localhost:8080",
});

const client = createClient(CanbiocinService, transport)

export function getGrpcClient() {
  return client
}
