import React, { createContext, useContext } from 'react';

const Auth0Context = createContext(null);

export const useAuth0 = () => {
  // Return mock data for development
  return {
    isAuthenticated: true,
    user: {
      name: 'Mock User',
      email: 'mock@example.com',
    },
    loginWithRedirect: () => console.log('Mock login called'),
    logout: () => console.log('Mock logout called'),
    getAccessTokenSilently: async () => 'mock-token',
  };
};

export const Auth0Provider = ({ children }) => {
  return <Auth0Context.Provider value={null}>{children}</Auth0Context.Provider>;
};

