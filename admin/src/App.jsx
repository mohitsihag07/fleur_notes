import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AdminRoutes from './routes/AdminRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const getBasename = () => {
  const basename = import.meta.env.VITE_ROUTER_BASENAME;
  if (!basename) return '/';

  if (basename.startsWith('http://') || basename.startsWith('https://')) {
    try {
      return new URL(basename).pathname;
    } catch (e) {
      console.error('Failed to parse VITE_ROUTER_BASENAME as URL:', e);
      const match = basename.match(/^https?:\/\/[^\/]+(.*)/);
      if (match && match[1]) {
        return match[1];
      }
    }
  }
  return basename;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={getBasename()}>
        <AdminRoutes />
      </BrowserRouter>
      <Toaster
        position="top-right"
        containerStyle={{ zIndex: 99999 }}
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #1e293b',
            borderRadius: '0.75rem',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#0f172a',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#0f172a',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
};

export default App;