export let Auth0Provider;
export let useAuth0;
export const requiresAuth = false

if (!requiresAuth) {
  const mockAuth = require('./mockAuth0');
  Auth0Provider = mockAuth.Auth0Provider;
  useAuth0 = mockAuth.useAuth0;
} else {
  const realAuth = require('@auth0/auth0-react');
  Auth0Provider = realAuth.Auth0Provider;
  useAuth0 = realAuth.useAuth0;
}

