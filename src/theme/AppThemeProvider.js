import React, { createContext, useContext, useMemo, useState } from 'react';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

const ThemeModeContext = createContext(null);

const paletteByMode = (mode) => ({
  mode,
  ...(mode === 'light'
    ? {
        primary: { main: '#1d4ed8' },
        secondary: { main: '#0f172a' },
        background: { default: '#eef2ff', paper: '#ffffff' },
      }
    : {
        primary: { main: '#60a5fa' },
        secondary: { main: '#cbd5e1' },
        background: { default: '#020617', paper: '#0f172a' },
      }),
});

export const AppThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');

  const toggleMode = () => {
    const nextMode = mode === 'light' ? 'dark' : 'light';
    localStorage.setItem('themeMode', nextMode);
    setMode(nextMode);
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: paletteByMode(mode),
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: `'Poppins', 'Segoe UI', sans-serif`,
          h4: { fontWeight: 700 },
          h5: { fontWeight: 700 },
          h6: { fontWeight: 600 },
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                textTransform: 'none',
                fontWeight: 600,
              },
            },
          },
        },
      }),
    [mode]
  );

  const value = useMemo(() => ({ mode, toggleMode }), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within AppThemeProvider');
  }

  return context;
};
