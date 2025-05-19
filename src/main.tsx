
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App.tsx';
import './index.css';
import { TeamsContextProvider } from './contexts/TeamContext';
import { AuthProvider } from './hooks/useAuth.tsx';  // Updated to import from .tsx file
import { Toaster } from 'sonner';

// Configure the query client with better error handling and logging
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      meta: {
        onError: (error: Error) => {
          console.error('Query error:', error);
        },
      },
    },
    mutations: {
      meta: {
        onError: (error: Error) => {
          console.error('Mutation error:', error);
        },
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TeamsContextProvider>
          <App />
          <Toaster position="top-right" />
        </TeamsContextProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
