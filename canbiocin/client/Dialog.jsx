const React = require('React');

import { Button, 
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
