import React from 'react';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SnackbarKey, closeSnackbar } from 'notistack';

export const createCloseAction = (key: SnackbarKey) => (
  <IconButton 
    onClick={() => closeSnackbar(key)} 
    size="small"
    sx={{ color: 'white' }}
  >
    <CloseIcon />
  </IconButton>
);