import { useEffect, useState, useRef, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getRandomPuzzle, getPuzzleGreetings, analyzePuzzle } from '@/api/puzzles';
import { Button, Heading, HStack, VStack, Progress, Text, Box } from '@chakra-ui/react';
import { usePuzzleEngine } from '@/hooks/usePuzzleEngine';
import { useChessStore } from '@/store/chess.ts';
import { usePuzzleEffects } from '@/store/puzzleEffects.ts';
import PuzzleLogo from '/puzzle2.png';
import { usePuzzlesStore } from '@/store/puzzles.ts';
import { AnalyseToolWrapper } from '@/components';
import { ThreeDotsWave } from '@/components/ThreeDotsWave.tsx';
import { ChessBoardWithMotion } from '@/components/ChessBoardWithMotion.tsx';
import RippleLayer from '@/components/RippleLayer';
import { AnimatedNumber } from '@/components/AnimatedNumber.tsx';
import { Assistant } from '@/components/Assistant.tsx';
import { useAuthStore } from '@/store/auth.ts';
import { ErrorBadge, SuccessBadge } from '@/utils/badges.tsx';

function sideToMoveFromFen(fen?: string): 'w' | 'b' | '' {
  if (!fen) return '';
  const botSide = fen.split(' ')[1] as 'w' | 'b';
  return botSide === 'w' ? 'b' : 'w';
}

export const PuzzlesPage = () => {
  const {
    data: puzzle,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['puzzle'],
    queryFn: getRandomPuzzle, // ← без параметров
    enabled: false, // ← НЕ фетчить на маунте
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const {
    data: greetings,
    isFetching: isFetchingGreetings,
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
  const accessToken = useAuthStore((s) => s.accessToken);

  const progressRef = useRef<HTMLDivElement>(null);

  const topContent = useMemo(() => {
    if (!puzzle?.puzzle?.fen) return;
    if (ratingChange && ratingChange > 0) {
      return (
        <HStack w={'100%'}>
          <SuccessBadge />
          <Text fontWeight={600}>Solved</Text>
        </HStack>
      );
    }
    if (ratingChange && ratingChange < 0) {
      return (
        <HStack w={'100%'}>
          <ErrorBadge />
          <Text fontWeight={600}>Incorrect</Text>
        </HStack>
      );
    }
    const side = puzzle?.puzzle?.fen.split(' ')[1] as 'w' | 'b';
    const text = side === 'w' ? 'Black to move' : 'White to move';
    return (
      <HStack w={'100%'}>
        <Box
          h={'24px'}
          w={'24px'}
          borderRadius={'5px'}
          border={'gray 3px solid'}
          backgroundColor={side === 'w' ? 'black' : 'white'}
        ></Box>
        <Text fontWeight={600}>{text}</Text>
      </HStack>
    );
  }, [puzzle?.puzzle?.fen, ratingChange]);

  useEffect(() => {
    if (greetings) {
      setAssistantMessage(greetings?.greeting?.text);
    }
  }, [greetings, setAssistantMessage, isFetchingGreetings, setIsPendingAssistantMessage]);

  useEffect(() => {
    if (isPendingAnalyze || isFetchingGreetings) {
      setIsPendingAssistantMessage(true);
    } else {
      setIsPendingAssistantMessage(false);
    }
  }, [isPendingAnalyze, isFetchingGreetings, setIsPendingAssistantMessage]);

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

  useEffect(() => {
    if (accessToken) {
      refetchGreetings();
    }
  }, [accessToken, refetchGreetings]);

  return (
    <div className="flex gap-[3rem]">
      <ChessBoardWithMotion
        onOpponentTurn={opponentLogic}
        validateMove={validateMove}
        mode={'puzzle'}
        targetEl={progressRef.current}
      />
      <AnalyseToolWrapper title={'Puzzles'} logoSrc={PuzzleLogo}>
        <VStack gap={'1.2rem'}>
          <Assistant
            message={assistantMessage}
            isPending={isPendingAssistantMessage}
            minHeight={'250px'}
            topContent={topContent}
          />
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
                    {!!rating && Math.trunc(rating / 100) - 4} lvl
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
              disabled={isFetching}
            >
              {isFetching ? (
                <ThreeDotsWave bgColor={'white'} />
              ) : !puzzle ? (
                'Solve Puzzles'
              ) : (
                'Next Puzzle'
              )}
            </Button>
          </Box>
        </VStack>
      </AnalyseToolWrapper>
    </div>
  );
};
