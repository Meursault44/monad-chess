import { CloseButton, Dialog, Portal } from '@chakra-ui/react';
import { useDialogsStore } from '@/store/dialogs';
import { AuthButtons } from '@/components/AuthButton.tsx';

export const DialogLogin = () => {
  const { dialogLogin, setDialogLogin } = useDialogsStore();

  return (
    <>
      <Dialog.Root open={dialogLogin} onOpenChange={(e) => setDialogLogin(e?.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Please log in to continue</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body display={'flex'} justifyContent={'center'}>
                <AuthButtons />
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
