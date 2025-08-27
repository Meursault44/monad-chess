import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PrivyProvider } from '@privy-io/react-auth';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '@/theme';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/api/client.ts';
import { BrowserRouter } from 'react-router';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/500.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';
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
      <ChakraProvider value={system}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ChakraProvider>
    </PrivyProvider>
  </StrictMode>,
);
