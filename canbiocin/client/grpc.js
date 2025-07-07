import { createClient } from "@connectrpc/connect"
import { createGrpcWebTransport } from "@connectrpc/connect-web"
import { CanbiocinService } from "../proto/service_pb.js";

const transport = createGrpcWebTransport({
  //baseUrl: window.location.protocol + "//" + window.location.host,
  baseUrl: "http://localhost:8080",
});

const client = createClient(CanbiocinService, transport)

export function getGrpcClient() {
  return client
}
