import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PrivyProvider } from '@privy-io/react-auth';
import { ChakraProvider, defaultSystem  } from "@chakra-ui/react"
import { AppLayout } from '@/components'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <PrivyProvider
          appId="cmeaisv1z00eqjs0duq5t7ubq"
          clientId="client-WY6PnyAid539GH8CeBnG53TqwB6TzHGZ7Ut3pRiG5J2tu"
          config={{
              // Create embedded wallets for users who don't have a wallet
              embeddedWallets: {
                  ethereum: {
                      createOnLogin: 'users-without-wallets'
                  }
              }
          }}
      >
          <ChakraProvider value={defaultSystem}>
              <AppLayout>
                  <App />
              </AppLayout>
          </ChakraProvider>
      </PrivyProvider>
  </StrictMode>,
)
