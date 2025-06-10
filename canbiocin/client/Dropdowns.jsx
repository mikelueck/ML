const React = require('React');

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { getGrpcClient } from './grpc.js';

const FONT_SIZE=9;
const WIDTH_PADDING=50;
const DEFAULT_WIDTH = 150 + WIDTH_PADDING;

export function FixedOptionsDropdown({value, options, changeOption}) {
  const [v, setV] = React.useState(value);

  let id_prefix = "ingredient-type"
  let label = "Ingredient Type"

  const computeWidth = (v) => {
    let w = (v.length * FONT_SIZE) + WIDTH_PADDING;
    if (w < DEFAULT_WIDTH) return DEFAULT_WIDTH
    return w
  }

  const [inputWidth, setInputWidth] = React.useState(computeWidth(value))

  const updateWidth = (v) => {
    if (v) {
      setInputWidth(computeWidth(v))
    }
  }

  const handleChange = (event, newValue) => {
    setV(newValue.label)
    if (changeOption) {
       changeOption(newValue);
    }
    updateWidth(newValue.label)
  }

  return (
    <Autocomplete
      componentsProps={{ popper: { style: { width: 'fit-content' } } }}
      sx={{ width: `${inputWidth}px` }}
      id="{id_prefix}-select"
      options={options}
      filterOptions={(options, state) => options}
      value={v}
      renderInput={(params) => <TextField {...params} label={label} variant="outlined" />}
      onChange={handleChange}
      disableClearable
      blurOnSelect
      size='small'
    />
  )
}

const computeWidth = (v) => {
  if (!v) return DEFAULT_WIDTH
  let w = (v.length * FONT_SIZE) + WIDTH_PADDING;
  if (w < DEFAULT_WIDTH) return DEFAULT_WIDTH
  return w
}


export function SppDropdown({value, onChange}) {
  const [options, setOptions] = React.useState([]);
  const [v, setV] = React.useState(value);

  let id_prefix = "spp"
  let label = "Spp"

  const [inputWidth, setInputWidth] = React.useState(computeWidth(value))

  const updateWidth = (v) => {
    setInputWidth(computeWidth(v))
  }

  React.useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await getGrpcClient().listProbioticSpp({});
        setOptions(response.spps)
      } catch (error) {
        console.log(error);
      } finally {
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (event, newValue) => {
    if (onChange) {
       onChange(newValue);
    }
    setV(newValue)
    updateWidth(newValue)
  }

  return (
    <Autocomplete
      componentsProps={{ popper: { style: { width: 'fit-content' } } }}
      sx={{ width: `${inputWidth}px` }}
      id="{id_prefix}-select"
      options={options}
      filterOptions={(options, state) => options}
      value={value}
      renderInput={(params) => <TextField {...params} label={label} variant="outlined" />}
      onChange={handleChange}
      disableClearable
      blurOnSelect
      size='small'
    />
  )
}

export function CategoryDropdown({value, onChange}) {
  const [options, setOptions] = React.useState([]);
  const [v, setV] = React.useState(value);

  let id_prefix = "category"
  let label = "Category"

  const [inputWidth, setInputWidth] = React.useState(computeWidth(value))

  const updateWidth = (v) => {
    setInputWidth(computeWidth(v))
  }

  React.useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await getGrpcClient().listPrebioticCategory({});
        setOptions(response.categories)
      } catch (error) {
        console.log(error);
      } finally {
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (event, newValue) => {
    if (onChange) {
       onChange(newValue);
    }
    setV(newValue)
    updateWidth(newValue)
  }

  return (
    <Autocomplete
      componentsProps={{ popper: { style: { width: 'fit-content' } } }}
      sx={{ width: `${inputWidth}px` }}
      id="{id_prefix}-select"
      options={options}
      filterOptions={(options, state) => options}
      value={value}
      renderInput={(params) => <TextField {...params} label={label} variant="outlined" />}
      onChange={handleChange}
      disableClearable
      blurOnSelect
      size='small'
    />
  )
}
