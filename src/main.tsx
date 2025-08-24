import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PrivyProvider } from '@privy-io/react-auth';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/api/client.ts';
import { BrowserRouter } from 'react-router';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProvider
      appId="cmeaisv1z00eqjs0duq5t7ubq"
      clientId="client-WY6PnyAid539GH8CeBnG53TqwB6TzHGZ7Ut3pRiG5J2tu"
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
        loginMethodsAndOrder: {
          primary: ['privy:cmd8euall0037le0my79qpz42'],
        },
      }}
    >
      <ChakraProvider value={defaultSystem}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ChakraProvider>
    </PrivyProvider>
  </StrictMode>,
);
