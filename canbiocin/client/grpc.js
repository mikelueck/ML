import { createClient } from "@connectrpc/connect"
import { createGrpcWebTransport } from "@connectrpc/connect-web"
import { CanbiocinService } from "../proto/service_pb.js";

import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

const isLocalhost = () => {
  return (window.location.hostname === 'localhost' ||
  // [::1] is the IPv6 localhost address
  window.location.hostname === '[::1]' ||
  // 127.0.0.1/8 is considered localhost for IPv4.
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  ))
};

const transport = createGrpcWebTransport({
  baseUrl: isLocalhost() ? "http://localhost:8080" : window.location.protocol + "//" + window.location.host,
});

export const GrpcRequest = () => {
  const { getAccessTokenSilently, loginWithPopup, getAccessTokenWithPopup } =
    useAuth0();

  {
    client: getGrpcClient()
  }
}

const client = createClient(CanbiocinService, transport)

export function getGrpcClient() {
  return client
}
