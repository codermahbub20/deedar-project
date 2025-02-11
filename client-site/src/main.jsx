import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Provider } from 'react-redux';
import { RouterProvider } from "react-router-dom";
import router from './Router';
import store from '../src/ReduxCart/store';
import AuthProvider from './providers/AuthProviders';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>  {/* Provider should wrap AuthProvider */}
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
