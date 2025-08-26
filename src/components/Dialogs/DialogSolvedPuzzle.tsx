import { CloseButton, Dialog, Portal } from '@chakra-ui/react';
import { useDialogsStore } from '@/store/dialogs';
import { useEffect } from 'react';
import { useSoundEffects } from '@/hooks';

export const DialogSolvedPuzzle = () => {
  const { dialogSolvedPuzzle, setDialogSolvedPuzzle } = useDialogsStore();
  const { playPuzzleCorrectSfx } = useSoundEffects();

  useEffect(() => {
    if (dialogSolvedPuzzle) {
      playPuzzleCorrectSfx();
    }
  }, [playPuzzleCorrectSfx, dialogSolvedPuzzle]);

  return (
    <>
      <Dialog.Root open={dialogSolvedPuzzle} onOpenChange={(e) => setDialogSolvedPuzzle(e?.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="400px">
              <Dialog.Header>
                <Dialog.Title>You have successfully solved the puzzle !!!</Dialog.Title>
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
