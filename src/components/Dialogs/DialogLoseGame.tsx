import { CloseButton, Dialog, Portal } from '@chakra-ui/react';
import { useDialogsStore } from '@/store/dialogs';
import { useEffect } from 'react';
import { useSoundEffects } from '@/hooks';

export const DialogLoseGame = () => {
  const { dialogLoseGame, setDialogLoseGame } = useDialogsStore();
  const { playGameLoseLongSfx } = useSoundEffects();

  useEffect(() => {
    if (dialogLoseGame) {
      playGameLoseLongSfx();
    }
  }, [playGameLoseLongSfx, dialogLoseGame]);

  return (
    <>
      <Dialog.Root open={dialogLoseGame} onOpenChange={(e) => setDialogLoseGame(e?.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="400px">
              <Dialog.Header>
                <Dialog.Title>You lose!!!</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>gg</Dialog.Body>
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
