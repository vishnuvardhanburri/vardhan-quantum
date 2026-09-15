'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0075FF',
    },
    secondary: {
      main: '#2D3748',
    },
    background: {
      default: '#0F1525',
      paper: 'rgba(15, 21, 37, 0.8)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A0AEC0',
    },
    divider: 'rgba(226, 232, 240, 0.1)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700 },
    h2: { fontSize: '1.75rem', fontWeight: 700 },
    h3: { fontSize: '1.5rem', fontWeight: 600 },
    h4: { fontSize: '1.25rem', fontWeight: 600 },
    h5: { fontSize: '1.1rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)',
          backdropFilter: 'blur(120px)',
          borderRadius: '20px',
          border: '1px solid rgba(226, 232, 240, 0.1)',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)',
          backdropFilter: 'blur(120px)',
          borderRight: '1px solid rgba(226, 232, 240, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 21, 37, 0.8)',
          backdropFilter: 'blur(120px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.1)',
          boxShadow: 'none',
        },
      },
    },
  },
});

export default theme;
