const React = require('React');

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material"

import logo from "./public/CanBiocinLogo.avif"

const pb = require('../proto/probiotics_pb.js');
const supplier = require('../proto/supplier_pb.js');
const money = require('../proto/money_pb.js');
const { create, toBinary, fromBinary} = require('@bufbuild/protobuf')
const timestamp = require('@bufbuild/protobuf/wkt')

import { App } from './App';

import { Auth0Provider } from '@auth0/auth0-react';
import { GrpcProvider } from './GrpcContext';
import { allScopes } from './scopes.js';

import logger from './logger.js';


const theme = createTheme({
  palette: {
    primary: {
      main: "rgb(116,160,63)",
    },
    error: {
      main: "rgb(255,204,204)",
      contrastText: "rgb(0,0,0)", 
    }
  },
});

const root = createRoot(document.getElementById('root'));

root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
      <Auth0Provider
        domain="dev-1utgu7vgaanrc6i1.us.auth0.com"
        clientId="oap7jeVwl5rHZYMynkLfZIQ1uhpQINdu"
        authorizationParams={{
          audience: "canbiocin",
          redirect_uri: window.location.origin,
          scope: allScopes(),
        }}
        useRefreshTokens={true}
        useRefreshTokensFallback={true}
      >
        <GrpcProvider>
        <App/>
        </GrpcProvider>
      </Auth0Provider>
  </ThemeProvider>
);
