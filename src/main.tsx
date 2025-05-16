
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Configure the query client with better error handling and logging
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      // Instead of using onError directly, we need to use the meta option
      meta: {
        onError: (error: Error) => {
          console.error('Query error:', error);
        },
      },
    },
    mutations: {
      // Similarly for mutations, we use meta for onError
      meta: {
        onError: (error: Error) => {
          console.error('Mutation error:', error);
        },
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </BrowserRouter>
);
