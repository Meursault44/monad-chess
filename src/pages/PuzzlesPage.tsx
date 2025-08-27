import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRandomPuzzle, getPuzzleGreetings } from '@/api/puzzles';
import ChessBoardWrapper from '@/components/ChessBoardWrapper.tsx';
import { Button, Heading, Image, HStack, VStack, Progress, Text, Box } from '@chakra-ui/react';
import { usePuzzleEngine } from '@/hooks/usePuzzleEngine';
import { useChessStore } from '@/store/chess.ts';
import PuzzleLogo from '/puzzle2.png';
import { usePuzzlesStore } from '@/store/puzzles.ts';
import assistent from '@/assets/assistent.png';
import { AnalyseToolWrapper } from '@/components/AnalyseToolWrapper.tsx';

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

  const { data: greetings, refetch: refetchGreetings } = useQuery({
    queryKey: ['puzzles/greetings'],
    queryFn: getPuzzleGreetings,
  });
  console.log(greetings);

  const side = sideToMoveFromFen(puzzle?.puzzle?.fen);
  const { validateMove, opponentLogic, clearState } = usePuzzleEngine(puzzle?.puzzle, side);

  const startFromFen = useChessStore((s) => s.startFromFen);
  const phase = useChessStore((s) => s.phase);
  const setAssistantMessage = usePuzzlesStore((s) => s.setAssistantMessage);
  const assistantMessage = usePuzzlesStore((s) => s.assistantMessage);
  const rating = usePuzzlesStore((s) => s.rating);
  const ratingChange = usePuzzlesStore((s) => s.ratingChange);
  const setRatingChange = usePuzzlesStore((s) => s.setRatingChange);

  useEffect(() => {
    if (greetings) {
      setAssistantMessage(greetings?.greeting?.text);
    }
  }, [greetings, setAssistantMessage]);

  return (
    <div className="flex gap-[3rem]">
      <ChessBoardWrapper
        onOpponentTurn={opponentLogic}
        validateMove={validateMove}
        mode={'puzzle'}
      />
      <AnalyseToolWrapper title={'Puzzles'} logoSrc={PuzzleLogo}>
        <HStack mx="10px" alignItems="flex-end">
          <Image src={assistent} alt="" width={'110px'} />

          <Box
            position="relative"
            flex="1"
            bg="white"
            color="black"
            px="10px"
            py="8px"
            borderRadius="10px"
            boxShadow="md"
          >
            <Text lineHeight="1.2" fontSize="16px">
              {assistantMessage}
            </Text>

            {/* хвостик слева — указывает на ассистента */}
            <Box
              as="svg"
              viewBox="0 0 15 22"
              w="15px"
              h="22px"
              position="absolute"
              bottom="20px"
              left="-15px"
              transform="translateY(-50%)"
              color="white" // цвет хвостика = фону пузыря
              pointerEvents="none"
              style={{ filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.06))' }}
              aria-hidden
            >
              <path
                d="M0 14C8.4 14 12.8333 4.66667 15 0V22C15 22 3.5 22 0 14Z"
                fill="currentColor"
              />
            </Box>
          </Box>
        </HStack>
        <VStack alignItems={'flex-start'}>
          <HStack>
            <Heading color={'white'}>{rating || ''}</Heading>
            {!!ratingChange && ratingChange > 0 && (
              <Heading color={'green'}> +{ratingChange}</Heading>
            )}
            {!!ratingChange && ratingChange < 0 && <Heading color={'red'}> {ratingChange}</Heading>}
          </HStack>
          <Progress.Root value={Number(rating) % 100} minW="320px">
            <HStack>
              <Progress.Track h={'20px'} borderRadius={'10px'} flex={'1'}>
                <Progress.Range bg={'#836EF9'} />
              </Progress.Track>
              <Text fontSize={'20px'} color={'white'}>
                {!!rating && Math.trunc(rating / 100) - 5} lvl
              </Text>
            </HStack>
          </Progress.Root>
        </VStack>
        <Box>
          <Button
            onClick={async () => {
              const res = await refetch(); // дождались новые данные
              const next = res.data;
              if (next?.puzzle?.fen) {
                setAssistantMessage(next?.instruction?.text);
                clearState();
                const sideNext = sideToMoveFromFen(next.puzzle.fen);
                startFromFen(next.puzzle.fen, sideNext); // теперь стартуем именно НОВЫЙ пазл
                setRatingChange(null);
              }
            }}
            bg={'#25232C'}
            _hover={{
              backgroundColor: '#4F4372',
            }}
            h={'50px'}
            w={'320px'}
            mx={'10px'}
            fontSize={'18px'}
          >
            {!puzzle ? 'Solve Puzzles' : 'Next Puzzle'}
          </Button>
          {phase === 'playing' && (
            <div className={'text-white'}>{side === 'w' ? 'White move' : 'Black move'}</div>
          )}
        </Box>
      </AnalyseToolWrapper>
    </div>
  );
};
