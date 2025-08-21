import { useEffect, useRef } from 'react';
import { Button, CloseButton, Dialog, Portal } from '@chakra-ui/react';
import congrats from '@/assets/congrats.mp4';
import { useDialogsStore } from '@/store/dialogs';

export const DialogWinGame = () => {
  const videoRef = useRef(null);
  const { dialogWinGame, setDialogWinGame } = useDialogsStore();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0.1; // 50% громкости
    }
  }, [dialogWinGame]);

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
                <video
                  ref={videoRef}
                  src={congrats} // файл в public/videos
                  controls
                  preload="metadata"
                  width={960}
                  height={540}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
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
