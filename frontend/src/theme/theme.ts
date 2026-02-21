import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2E6B5A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5D4037',
    },
    success: {
      main: '#2E6B5A',
      light: '#E8F5E9',
    },
    error: {
      main: '#B22222',
    },
    background: {
      default: '#FAF9F6',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
    },
  },
  shape: {
    borderRadius: 8,
  },
});
