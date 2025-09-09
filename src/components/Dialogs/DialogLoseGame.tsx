import { Button, CloseButton, Dialog, Portal, VStack } from '@chakra-ui/react';
import { useDialogsStore } from '@/store/dialogs';
import { useEffect } from 'react';
import { useSoundEffects } from '@/hooks';
import { Link } from 'react-router';
import { useReviewGameStore } from '@/store/reviewGame.ts';
import { MoveCountAnalysis } from '@/components/MoveCountAnalysis.tsx';

export const DialogLoseGame = () => {
  const { dialogLoseGame, setDialogLoseGame } = useDialogsStore();
  const { playGameLoseLongSfx } = useSoundEffects();
  const roomId = useReviewGameStore((s) => s.id);

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
            <Dialog.Content maxW="450px">
              <Dialog.Header>
                <Dialog.Title>You lose!!!</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body display={'flex'} justifyContent={'center'}>
                {roomId && (
                  <VStack gap={'20px'}>
                    <MoveCountAnalysis />
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
                        onClick={() => setDialogLoseGame(false)}
                      >
                        Game Analysis
                      </Link>
                    </Button>
                  </VStack>
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
