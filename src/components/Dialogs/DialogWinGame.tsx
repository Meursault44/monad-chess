import { Button, CloseButton, Dialog, Portal } from '@chakra-ui/react';
import { useDialogsStore } from '@/store/dialogs';
import { useSoundEffects } from '@/hooks';
import { Link } from 'react-router';
import { useReviewGameStore } from '@/store/reviewGame.ts';
import { useEffect } from 'react';

export const DialogWinGame = () => {
  const { dialogWinGame, setDialogWinGame } = useDialogsStore();
  const roomId = useReviewGameStore((s) => s.id);

  const { playGameWinLongSfx } = useSoundEffects();

  useEffect(() => {
    if (dialogWinGame) {
      playGameWinLongSfx();
    }
  }, [playGameWinLongSfx, dialogWinGame]);

  return (
    <>
      <Dialog.Root open={dialogWinGame} onOpenChange={(e) => setDialogWinGame(e?.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="400px">
              <Dialog.Header>
                <Dialog.Title>You won!!!</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body display={'flex'} justifyContent={'center'}>
                {roomId && (
                  <Button
                    bg={'#25232C'}
                    _hover={{
                      backgroundColor: '#4F4372',
                    }}
                    h={'50px'}
                    mx={'10px'}
                    fontSize={'18px'}
                    w={'100%'}
                    p={0}
                  >
                    <Link
                      className={'flex h-full w-full items-center justify-center'}
                      to={`/play/computer/review/${roomId}`}
                      onClick={() => setDialogWinGame(false)}
                    >
                      Game Analysis
                    </Link>
                  </Button>
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
