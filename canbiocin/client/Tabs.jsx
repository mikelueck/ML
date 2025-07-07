import React, { lazy } from 'react';

import PropTypes from 'prop-types';

import { Box,
         Tab,
         Tabs,
         Tooltip,
} from '@mui/material';

const Ingredients = lazy(() => import('./Ingredients'));
const Recipes = lazy(() => import('./Recipes'));

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

const NUMTABS=3;

function getTabFromHash(hash) {
  if (hash.length > 1) {
    let tab = hash.substring(1)
    let index = parseInt(tab)
    if (!isNaN(index) && index < NUMTABS) {
      return index;
    }
  }
  return 0;
}

export default function () {
  const [value, setValue] = React.useState(getTabFromHash(window.location.hash));

  const handleChange = (event, newValue) => {
    setValue(newValue);
    window.location.hash="#" + newValue;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Recipies" {...a11yProps(0)} />
          <Tab label="Ingredients" {...a11yProps(1)} />
          <Tab label="Suppliers" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Recipes />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Ingredients />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        Suppliers
      </CustomTabPanel>
    </Box>
  )
}
