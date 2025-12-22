import React, { createContext, useContext } from 'react';

import { createClient } from "@connectrpc/connect"
import { createGrpcWebTransport } from "@connectrpc/connect-web"
import { CanbiocinService } from "../proto/service_pb.js";

import { useAuth0, requiresAuth } from "./auth.js";

import { getGrpcClient } from './grpc.js';
import { scopeForMethod, scopes } from './scopes.js';

var GrpcContext = createContext(null);

export function useGrpc() {
  return useContext(GrpcContext)
}

export function GrpcProvider({children}) {
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [foundScopes, setFoundScopes]  = React.useState(new Map())
  const [token, setToken]  = React.useState("")
  const [hasAccess, setHasAccess] = React.useState(requiresAuth ? false : true)

  const getScopes = (t) => {
    if (t && t.split('.').length > 1) {
      const payloadBase64 = t.split('.')[1]
      const decodePayload = JSON.parse(atob(payloadBase64))
      let scopes = decodePayload.scope;

      let s = new Map();
      if (typeof scopes === 'string') {
        scopes = scopes.split(" ")
      }
      for (let i = 0; i < scopes.length; i++) {
        s.set(scopes[i])
      }
      setFoundScopes(s)
      return s
    }
  }

  // Some minimal set of scopes needed to use the app at all
  const checkAccess = (s) => {
    let access = (isAuthenticated ? 
              hasScope(scopes.READ_RECIPE, s) ||
              hasScope(scopes.READ_INGREDIENT, s) ||
              hasScope(scopes.READ_OTHER, s) : false)
    setHasAccess(access)
  }

  const getToken = async (s) => {
    if (requiresAuth) {
      try {
        const t = await getAccessTokenSilently({ 
          ignoreCache: true,
          authorizationParams: {
            audience: "canbiocin",
          },
        });
        if (token != t) {
          setToken(t)
          let s = getScopes(t)
          checkAccess(s)
        }
        return t
      } catch(e) {
        if (window.location.href != window.location.origin + "/") {
          window.location.href = window.location.origin
        }
        throw e
      }
    }
    return ""
  }

  React.useEffect(() => {
    if (!isLoading) {
      getToken()
    }
  }, [isLoading, isAuthenticated])

  const hasScope = (requiredScope, s) => {
    if (requiresAuth) {
      if (s) {
        return s.has(requiredScope)
      }
      return foundScopes.has(requiredScope)
    }
    return true
  }

  const callApi = async (method, req) => {
    let headers = new Headers();
    if (requiresAuth) {
      const token = await getToken(scopeForMethod(method))

      headers.set("Authorization", `Bearer ${token}`);
    }

    return await getGrpcClient()[method](req, {headers: headers})
  }

  return (
    <GrpcContext.Provider value={{
        grpcRequest: callApi, 
        hasScope: hasScope,
        hasAccess: hasAccess}}>
    {children}
    </GrpcContext.Provider>
  )
}
