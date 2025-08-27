import { CloseButton, Dialog, Portal } from '@chakra-ui/react';
import { useDialogsStore } from '@/store/dialogs';

export const DialogWinGame = () => {
  const { dialogWinGame, setDialogWinGame } = useDialogsStore();

  return (
    <>
      <Dialog.Root open={dialogWinGame} onOpenChange={(e) => setDialogWinGame(e?.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="960px">
              <Dialog.Header>
                <Dialog.Title>You won!!!</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <div>Congrats</div>
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
