import { Button, CloseButton, Dialog, Portal } from '@chakra-ui/react';
import { useDialogsStore } from '@/store/dialogs';
import { AuthButtons } from '@/components/AuthButton.tsx';
import { Link } from 'react-router';
import { useAuthStore } from '@/store/auth.ts';
import { usePrivy } from '@privy-io/react-auth';

export const DialogLogin = () => {
  const { dialogLogin, setDialogLogin } = useDialogsStore();
  const { authenticated } = usePrivy();

  const userName = useAuthStore((s) => s.userName);
  console.log(userName);

  return (
    <>
      <Dialog.Root open={dialogLogin} onOpenChange={(e) => setDialogLogin(e?.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  {!userName && authenticated
                    ? 'create a username to continue'
                    : 'Please log in to continue'}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body display={'flex'} justifyContent={'center'}>
                {!userName?.length && authenticated ? (
                  <Button w={'100%'} h={'54px'}>
                    <Link to={'https://monad-games-id-site.vercel.app/'}>Create a username</Link>
                  </Button>
                ) : (
                  <AuthButtons />
                )}
              </Dialog.Body>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};
