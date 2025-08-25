import { useQuery } from '@tanstack/react-query';
import { getRandomPuzzle } from '@/api/puzzles';
import ChessBoardWrapper from '@/components/ChessBoardWrapper.tsx';
import { Button, Heading, Image, HStack, VStack, Progress } from '@chakra-ui/react';
import { usePuzzleEngine } from '@/hooks/usePuzzleEngine';
import { useChessStore } from '@/store/chess.ts';
import { useAuthStore } from '@/store/auth.ts';
import PuzzleLogo from '/puzzle2.png';

function sideToMoveFromFen(fen?: string): 'w' | 'b' | '' {
  if (!fen) return '';
  const botSide = fen.split(' ')[1] as 'w' | 'b';
  return botSide === 'w' ? 'b' : 'w';
}

export const PuzzlesPage = () => {
  const { data: puzzle, refetch } = useQuery({
    queryKey: ['puzzle'],
    queryFn: getRandomPuzzle, // ← без параметров
    enabled: false, // ← НЕ фетчить на маунте
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const side = sideToMoveFromFen(puzzle?.fen);
  const { validateMove, opponentLogic, clearState } = usePuzzleEngine(puzzle, side);

  const startFromFen = useChessStore((s) => s.startFromFen);
  const phase = useChessStore((s) => s.phase);
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex gap-[3rem]">
      <ChessBoardWrapper
        onOpponentTurn={opponentLogic}
        validateMove={validateMove}
        mode={'puzzle'}
      />
      <VStack
        my={'auto'}
        h={'90vh'}
        w={'300px'}
        border={'2px white solid'}
        borderRadius={'10px'}
        bg={'#17171A'}
      >
        <HStack
          background={'rgba(0,0,0,0.3)'}
          w={'100%'}
          height={'80px'}
          justify={'center'}
          padding={'10px 40px'}
        >
          <Image src={PuzzleLogo} alt="" width={'40px'} />
          <Heading color={'white'}>Puzzles</Heading>
        </HStack>
        <VStack alignItems={'flex-start'}>
          <Heading color={'white'}>{user?.puzzle_rating || ''}</Heading>
          <Progress.Root defaultValue={30} minW="240px">
            <Progress.Track>
              <Progress.Range bg={'#836EF9'} />
            </Progress.Track>
          </Progress.Root>
        </VStack>
        <div>
          <Button
            onClick={async () => {
              const res = await refetch(); // дождались новые данные
              const next = res.data;
              if (next?.fen) {
                clearState();
                const sideNext = sideToMoveFromFen(next.fen);
                startFromFen(next.fen, sideNext); // теперь стартуем именно НОВЫЙ пазл
              }
            }}
            bg={'#25232C'}
            h={'50px'}
            w={'240px'}
            mx={'10px'}
            fontSize={'18px'}
          >
            {!puzzle ? 'Solve Puzzles' : 'Next Puzzle'}
          </Button>
          {phase === 'playing' && (
            <div className={'text-white'}>{side === 'w' ? 'White move' : 'Black move'}</div>
          )}
        </div>
      </VStack>
    </div>
  );
};
