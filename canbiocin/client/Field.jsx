const React = require('React');
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

function addInputProp(props, name, value) {
  if (!props.slotProps) {
    props.slotProps = {}
  }

  if (!props.slotProps.input) {
    props.slotProps.input = {}
  }

  props.slotProps.input[name] = value
  
}

const FONT_SIZE = 11
const DEFAULT_INPUT_WIDTH = 100
const DEFAULT_MULTILINE_INPUT_WIDTH = 300

export function Field(props) {
  let textProps = { id: props.id,
                    label: props.label,
                    value: props.value,
                    sx: props.sx,
                    size: props.size,
                    variant: props.variant,
                    multiline: props.multiline,
                    rows: props.rows,
                    type: props.type,
                    fullWidth: props.fullWidth,
                    onChange: props.onChange,
                    error: props.error,

                    // Disable browser autocomplete
                    inputProps: {
                      autoComplete: 'off',
                      style: {},
                    }
                  }

    if (!props.sx && !props.multiline) {
      let width = DEFAULT_INPUT_WIDTH
      if (props.value && props.value.toString().length * FONT_SIZE > DEFAULT_INPUT_WIDTH) {
        width = ((props.value.length + 1) * FONT_SIZE)
      }
      textProps.inputProps.style.width = `${width}px`
    }
    if (!props.sx && props.multiline) {
      textProps.inputProps.style.width = `${DEFAULT_MULTILINE_INPUT_WIDTH}px`
    }

    if (!props.label) {
      textProps.hiddenLabel = true
    }
    if (props.units) {
      addInputProp(textProps, "endAdornment", <InputAdornment position="end">{props.units}</InputAdornment>)
    }
    if (props.dollars) {
      addInputProp(textProps, "startAdornment", <InputAdornment position="start">$</InputAdornment>)
    }
    if (!props.editable) {
      addInputProp(textProps, "readOnly", true)
    }
    if (props.disabled) {
      addInputProp(textProps, "disabled", true)
    }

  return (
    <TextField 
      {...textProps}
    />
  )
}
