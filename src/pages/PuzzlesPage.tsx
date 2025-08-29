import { useEffect, useState, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getRandomPuzzle, getPuzzleGreetings, analyzePuzzle } from '@/api/puzzles';
import { Button, Heading, Image, HStack, VStack, Progress, Text, Box } from '@chakra-ui/react';
import { usePuzzleEngine } from '@/hooks/usePuzzleEngine';
import { useChessStore } from '@/store/chess.ts';
import { usePuzzleEffects } from '@/store/puzzleEffects.ts';
import PuzzleLogo from '/puzzle2.png';
import { usePuzzlesStore } from '@/store/puzzles.ts';
import assistent from '@/assets/assistent.png';
import { AnalyseToolWrapper } from '@/components/AnalyseToolWrapper.tsx';
import { ThreeDotsWave } from '@/components/ThreeDotsWave.tsx';
import { ChessBoardWithMotion } from '@/components/ChessBoardWithMotion.tsx';
import RippleLayer from '@/components/RippleLayer';
import { AnimatedNumber } from '@/components/AnimatedNumber.tsx';

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

  const {
    data: greetings,
    isPending: isPendingGreetings,
    refetch: refetchGreetings,
  } = useQuery({
    queryKey: ['puzzles/greetings'],
    queryFn: getPuzzleGreetings,
  });

  const {
    mutate,
    isPending: isPendingAnalyze,
    data: dataAnalyze,
  } = useMutation({
    mutationFn: analyzePuzzle,
  });

  const side = sideToMoveFromFen(puzzle?.puzzle?.fen);
  const { validateMove, opponentLogic, clearState } = usePuzzleEngine(puzzle?.puzzle, side);

  const startFromFen = useChessStore((s) => s.startFromFen);
  const phase = useChessStore((s) => s.phase);
  const setAssistantMessage = usePuzzlesStore((s) => s.setAssistantMessage);
  const assistantMessage = usePuzzlesStore((s) => s.assistantMessage);
  const rating = usePuzzlesStore((s) => s.rating);
  const [ratingLocal, setRatingLocal] = useState(rating);
  const ratingChange = usePuzzlesStore((s) => s.ratingChange);
  const isPendingAssistantMessage = usePuzzlesStore((s) => s.isPendingAssistantMessage);
  const setIsPendingAssistantMessage = usePuzzlesStore((s) => s.setIsPendingAssistantMessage);
  const setRatingChange = usePuzzlesStore((s) => s.setRatingChange);
  const animationDone = usePuzzleEffects((s) => s.animationDone);
  const setAnimationDone = usePuzzleEffects((s) => s.setAnimationDone);
  const triggerWinAnimation = usePuzzleEffects((s) => s.triggerWinAnimation);

  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (greetings) {
      setAssistantMessage(greetings?.greeting?.text);
    }
  }, [greetings, setAssistantMessage, isPendingGreetings, setIsPendingAssistantMessage]);

  useEffect(() => {
    if (isPendingAnalyze || isPendingGreetings) {
      setIsPendingAssistantMessage(true);
    } else {
      setIsPendingAssistantMessage(false);
    }
  }, [isPendingAnalyze, isPendingGreetings, setIsPendingAssistantMessage]);

  useEffect(() => {
    if (dataAnalyze?.text) {
      setAssistantMessage(dataAnalyze?.text);
    }
  }, [dataAnalyze?.text, setAssistantMessage]);

  useEffect(() => {
    if (animationDone) {
      setRatingLocal(rating);
      setAnimationDone(false);
      triggerWinAnimation(null);
    }
    if ((!ratingLocal && rating) || ratingLocal > rating) {
      setRatingLocal(rating || 1);
    }
  }, [animationDone, setRatingLocal, rating, ratingLocal]);

  return (
    <div className="flex gap-[3rem]">
      <ChessBoardWithMotion
        onOpponentTurn={opponentLogic}
        validateMove={validateMove}
        mode={'puzzle'}
        targetEl={progressRef.current}
      />
      <AnalyseToolWrapper title={'Puzzles'} logoSrc={PuzzleLogo}>
        <HStack mx="10px" alignItems="flex-end" w={'calc(100% - 20px)'} minHeight={'160px'}>
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
            minHeight={'104px'}
            display={'flex'}
            alignItems={'center'}
          >
            <Box w={'100%'} display={'flex'} justifyContent={'center'}>
              {isPendingAssistantMessage ? (
                <ThreeDotsWave />
              ) : (
                <Text lineHeight="1.2" fontSize="16px">
                  {assistantMessage}
                </Text>
              )}
            </Box>

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
        <RippleLayer color="#836EF9" />
        <VStack alignItems={'flex-start'}>
          <HStack>
            <Heading color="white">
              <AnimatedNumber value={ratingLocal ?? 0} />
            </Heading>
            {!!ratingChange && ratingChange > 0 && (
              <Heading color={'rgba(38, 181, 97, 1)'}> +{ratingChange}</Heading>
            )}
            {!!ratingChange && ratingChange < 0 && (
              <Heading color={'rgba(210, 56, 70, 1)'}> {ratingChange}</Heading>
            )}
          </HStack>
          <div ref={progressRef}>
            <Progress.Root value={Number(ratingLocal) % 100} minW="320px">
              <HStack>
                <Progress.Track h={'20px'} borderRadius={'10px'} flex={'1'}>
                  <Progress.Range bg={'#836EF9'} />
                </Progress.Track>
                <Text fontSize={'20px'} color={'white'}>
                  {!!rating && Math.trunc(rating / 100) - 5} lvl
                </Text>
              </HStack>
            </Progress.Root>
          </div>
        </VStack>
        <Box>
          <Button
            onClick={async () => {
              const res = await refetch(); // дождались новые данные
              const next = res.data;
              mutate({ id: next?.puzzle?.id, isGreeting: true });
              if (next?.puzzle?.fen) {
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
