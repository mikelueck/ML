import React, { lazy } from 'react';

import PropTypes from 'prop-types';

import { Box,
         Grid,
         Tab,
         Tabs,
         Tooltip,
} from '@mui/material';

const Ingredients = lazy(() => import('./Ingredients'));
const Formulations = lazy(() => import('./Formulations'));
const Packaging = lazy(() => import('./Packaging'));

import { useAuth0 } from "./auth.js"
import LoginButton from "./Login";
import LogoutButton from "./Logout";
import Loading from "./Loading";

import { useGrpc } from './GrpcContext';
import { scopes } from './scopes.js';
import { getTabFromHash } from './hash_utils.js';
import { clearGridState, 
         INGREDIENTGRIDSTATE, 
         FORMULATIONGRIDSTATE,
         PACKAGINGGRIDSTATE } from './hash_utils.js';

function CustomTabPanel(props) {
  const { children, value, index, ... other } = props

  return (
     <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function () {
  const [value, setValue] = React.useState(getTabFromHash(window.location.hash));
  const { user, isAuthenticated, isLoading, error } = useAuth0();
  const { hasScope } = useGrpc();

  const handleChange = (event, newValue) => {
    // Changing tabs clears existing state 
    clearGridState(INGREDIENTGRIDSTATE)
    clearGridState(FORMULATIONGRIDSTATE)
    clearGridState(PACKAGINGGRIDSTATE)

    setValue(newValue);
    window.location.hash="#" + newValue;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Grid container>
          <Grid container size={11} sx={{ justifyContent: "flex-start"}} > 
          <Tabs value={value} onChange={handleChange} aria-label="">
            {hasScope(scopes.READ_RECIPE) ? <Tab label="Formulations" {...a11yProps(0)} /> : "" }
            {hasScope(scopes.READ_INGREDIENT) ? <Tab label="Ingredients" {...a11yProps(1)} /> : "" }
            {hasScope(scopes.READ_OTHER) ? <Tab label="Packaging" {...a11yProps(2)} /> : "" }
            <Tab label="Suppliers" {...a11yProps(3)} />
          </Tabs>
          </Grid>
          <Grid container size={1} sx={{ justifyContent: "flex-end"}} > 
            {isLoading ? <Loading/> : "" }
            {!isLoading && isAuthenticated ? <LogoutButton/> : <LoginButton/>}
          </Grid>
        </Grid>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Formulations />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Ingredients />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <Packaging />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        Suppliers
      </CustomTabPanel>
    </Box>
  )
}
