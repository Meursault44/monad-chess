import { useEffect } from 'react'
import { AnalyseTool } from './components'
import {PlayerRow} from "./components/PlayerRow.tsx";
import { ChessboardWrapper } from './components/ChessboardWrapper.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { HStack } from "@chakra-ui/react";
import {
    usePrivy, type CrossAppAccountWithMetadata
} from "@privy-io/react-auth";


function App() {
    const { authenticated, user, ready, logout, login } = usePrivy();
    console.log(user)

    useEffect(() => {
        // Check if privy is ready and user is authenticated
        if (authenticated && user && ready) {
            // Check if user has linkedAccounts
            if (user.linkedAccounts.length > 0) {
                // Get the cross app account created using Monad Games ID
                const crossAppAccount: CrossAppAccountWithMetadata = user.linkedAccounts.filter(account => account.type === "cross_app" && account.providerApp.id === "cmd8euall0037le0my79qpz42")[0] as CrossAppAccountWithMetadata;

                // The first embedded wallet created using Monad Games ID, is the wallet address
                if (crossAppAccount?.embeddedWallets.length > 0) {
                    console.log(crossAppAccount?.embeddedWallets[0].address);
                }
            } else {
                console.log("You need to link your Monad Games ID account to continue.");
            }
        }
    }, [authenticated, user, ready]);

  return (
      <HStack
          w="100%"
          justify={'center'}
          gap={10}
      >
          <div className={'my-auto'}>
              <PlayerRow />
              <ChessboardWrapper />
              <PlayerRow />
          </div>
          <AnalyseTool />
      </HStack>
  )
}

export default App
