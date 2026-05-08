import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import App from './App';
import './index.css';

// Register and manage service worker for PWA
if ('serviceWorker' in navigator) {
  let refreshing = false;

  const updateSW = () => {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        registration.update();
      }
    });
  };

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js?t=' + Date.now())
      .then((registration) => {
        console.log('SW registered:', registration);

        // Check for updates every 5 minutes
        setInterval(updateSW, 5 * 60 * 1000);

        // Detect when a new SW is waiting
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller && !refreshing) {
                refreshing = true;
                window.location.reload();
              }
            });
          }
        });
      })
      .catch((error) => console.error('SW registration failed:', error));
  });

  // Reload when controller changes
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);