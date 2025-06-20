const React = require('React');

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material"

const pb = require('../proto/probiotics_pb.js');
const supplier = require('../proto/supplier_pb.js');
const money = require('../proto/money_pb.js');
const { create, toBinary, fromBinary} = require('@bufbuild/protobuf')
const timestamp = require('@bufbuild/protobuf/wkt')

import { App } from './App';

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
    <App/>
  </ThemeProvider>
);

