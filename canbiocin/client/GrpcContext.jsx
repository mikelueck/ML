import React, { createContext, useContext } from 'react';

import { createClient } from "@connectrpc/connect"
import { createGrpcWebTransport } from "@connectrpc/connect-web"
import { CanbiocinService } from "../proto/service_pb.js";

import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

import { getGrpcClient } from './grpc.js';
import { scope } from './scopes.js';

var GrpcContext = createContext(null);

export function useGrpc() {
  return useContext(GrpcContext)
}

export function GrpcProvider({children}) {
  const { getAccessTokenSilently } = useAuth0();
  const [scopes, setScopes]  = React.useState(new Map())
  const [token, setToken]  = React.useState("")

  React.useEffect(() => {
    const getScopes = async () => {
      if (token && token.split('.').length > 1) {
        const payloadBase64 = token.split('.')[1]
        const decodePayload = JSON.parse(atob(payloadBase64))
        let scopes = decodePayload.scope;

        let s = new Map();
        if (typeof scopes === 'string') {
          scopes = scopes.split(" ")
        }
        for (let i = 0; i < scopes.length; i++) {
          s.set(scopes[i])
        }
        setScopes(s)
      }
    }
    getScopes()
  }, [token])

  const getToken = async (s) => {
    const t = await getAccessTokenSilently({ 
      ignoreCache: true,
      authorizationParams: {
        audience: "canbiocin",
      },
    });
    if (token != t) {
      setToken(t)
    }
    return t
  }

  const hasScope = (requiredScope) => {
    return scopes.has(requiredScope)
  }

  const callApi = async (method, req) => {
    const token = await getToken(scope(method))

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${token}`);

    return await getGrpcClient()[method](req, {headers: headers})
  }

  return (
    <GrpcContext.Provider value={{grpcRequest: callApi, hasScope: hasScope}}>
    {children}
    </GrpcContext.Provider>
  )
}
