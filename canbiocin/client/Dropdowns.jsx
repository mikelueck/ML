const React = require('React');

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { getGrpcClient } from './grpc.js';

const FONT_SIZE=9;
const WIDTH_PADDING=50;
const DEFAULT_WIDTH = 150 + WIDTH_PADDING;


export function SppDropdown({value, changeOption}) {
  const [options, setOptions] = React.useState([]);
  const [v, setV] = React.useState(value);

  let id_prefix = "spp"
  let label = "Spp"

  const computeWidth = (v) => {
    let w = (v.length * FONT_SIZE) + WIDTH_PADDING;
    if (w < DEFAULT_WIDTH) return DEFAULT_WIDTH
    return w
  }

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
    if (changeOption) {
       changeOption(newValue);
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

export function CategoryDropdown({value, changeOption}) {
  const [options, setOptions] = React.useState([]);
  const [v, setV] = React.useState(value);

  let id_prefix = "category"
  let label = "Category"

  const computeWidth = (v) => {
    let w = (v.length * FONT_SIZE) + WIDTH_PADDING;
    if (w < DEFAULT_WIDTH) return DEFAULT_WIDTH
    return w
  }

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
