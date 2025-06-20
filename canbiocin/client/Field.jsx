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
                        autoComplete: 'off'
                      }
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

  return (
    <TextField 
      {...textProps}
    />
  )
}
