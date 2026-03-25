// src/layout.js

import React from 'react';
import { AppShell } from '@toolpad/core';
import { Box } from '@mui/material';

export default function Layout({ children }) {
    console.log("✅ Custom layout is loaded!");
  return (
    <AppShell
      title="STS"  // ✅ Change this to your app name
      icon={
        <Box
          component="img"
          src="/logo.png"            // ✅ Your custom logo here
          alt="App Logo"
          sx={{ width: 32, height: 32 }}
        />
      }
    >
      {children}
    </AppShell>
  );
}
