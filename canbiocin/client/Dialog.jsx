const React = require('React');

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { FixedOptionsDropdown } from './Dropdowns';
import { Field } from './Field';

import { Box,
         Button, 
         Dialog,
         DialogActions,
         DialogContent,
         DialogTitle,
         IconButton,
         Typography } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

export function ConfirmDialog({title, content, open, onClose, onConfirm}) {
  return (
    <>
    <Dialog
      open={open}
    >
    <DialogTitle>
      {title}
    </DialogTitle>
    <IconButton
      onClick={onClose}
      sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
      >
      <CloseIcon />
    </IconButton>
    <DialogContent dividers>
      <Typography gutterBottom>
        {content}
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button autoFocus onClick={onConfirm}>
        Confirm
      </Button>
    </DialogActions>
    </Dialog>
    </>
  )
}

export function OptionDialog({title, content, options, open, onClose, onSelect, onConfirm}) {
  const [value, setValue] = React.useState("");

  const onChange = (newValue) => {
    setValue(newValue.id)
    onSelect(newValue.id)
  }

  const onOk = () => {
    if (value.length > 0) {
      if (onConfirm) {
        onConfirm()
      }
    } else {
      alert("Please select a valid option");
    }
  }

  return (
    <>
    <Dialog
      open={open}
    >
    <DialogTitle>
      {title}
    </DialogTitle>
    <IconButton
      onClick={onClose}
      sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
      >
      <CloseIcon />
    </IconButton>
    <DialogContent dividers>
      <Typography gutterBottom>
        {content}
      </Typography>
      <Box>
      <FixedOptionsDropdown
        value={value}
        options={options}
        changeOption={onChange}
      />
      </Box>
    </DialogContent>
    <DialogActions>
      <Button autoFocus onClick={onOk}>
        Confirm
      </Button>
    </DialogActions>
    </Dialog>
    </>
  )
}

export function AlertDialog({title, content, open, onClose}) {
  return (
    <>
    <Dialog
      open={open}
    >
    <DialogTitle>
      {title}
    </DialogTitle>
    <IconButton
      onClick={onClose}
      sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
      >
      <CloseIcon />
    </IconButton>
    <DialogContent dividers>
      <Typography gutterBottom>
        {content}
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button autoFocus onClick={onClose}>
        Ok
      </Button>
    </DialogActions>
    </Dialog>
    </>
  )
}

export function InputDialog({obj, title, content, input_props, open, onClose, onChange, onConfirm}) {
  const [value, setValue] = React.useState("");

  const onUpdate = (event) => {
    setValue(event.target.value)
    onChange(event.target.value)
  }

  const onOk = () => {
    if (value.length > 0) {
      if (onConfirm) {
        onConfirm()
      }
    } else {
      alert("Please provide a valid value");
    }
  }

  return (
    <>
    <Dialog
      open={open}
    >
    <DialogTitle>
      {title}
    </DialogTitle>
    <IconButton
      onClick={onClose}
      sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
      >
      <CloseIcon />
    </IconButton>
    <DialogContent dividers>
      <Typography gutterBottom>
        {content}
      </Typography>
      <Box>
      <Field editable="true" onChange={onUpdate} />
      </Box>
    </DialogContent>
    <DialogActions>
      <Button autoFocus onClick={onOk}>
        Confirm
      </Button>
    </DialogActions>
    </Dialog>
    </>
  )
}
