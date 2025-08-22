import { useQuery } from '@tanstack/react-query';
import { getRandomPuzzle } from '@/api/puzzles';
import ChessBoardWrapper from '@/components/ChessBoardWrapper.tsx';
import { Button } from '@chakra-ui/react';
import { usePuzzleEngine } from '@/hooks/usePuzzleEngine';
import { useChessStore } from '@/store/chess.ts';
import { useEffect, useRef } from 'react';
import { useDialogsStore } from '@/store/dialogs.ts';

function sideToMoveFromFen(fen?: string): 'w' | 'b' | '' {
  if (!fen) return '';
  const botSide = fen.split(' ')[1] as 'w' | 'b';
  return botSide === 'w' ? 'b' : 'w';
}

export const PuzzlesPage = () => {
  const { data: puzzle, refetch } = useQuery({
    queryKey: ['puzzle', { minRating: 800, maxRating: 900 }],
    queryFn: getRandomPuzzle,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity, // данные не «протухают»
    gcTime: Infinity, // не удаляются из кэша
  });

  const side = sideToMoveFromFen(puzzle?.fen);
  const { validateMove, opponentLogic, isSolved, onPlayerAccepted } = usePuzzleEngine(puzzle, side);
  const { setDialogSolvedPuzzle } = useDialogsStore();

  const startFromFen = useChessStore((s) => s.startFromFen);
  const phase = useChessStore((s) => s.phase);
  const resetGame = useChessStore((s) => s.resetGame);

  useEffect(() => {
    if (isSolved) {
      setDialogSolvedPuzzle(true);
    }

    return () => {
      resetGame();
    };
  }, [isSolved]);

  return (
    <div className="flex w-[1170px] gap-6">
      <ChessBoardWrapper
        onOpponentTurn={opponentLogic}
        validateMove={validateMove}
        onPlayerAccepted={onPlayerAccepted}
      />
      <div className="my-auto flex h-[860px] w-[300px] shrink-0 flex-col bg-[#4E3371]">
        {phase === 'idle' ? (
          <Button
            onClick={() => {
              if (!puzzle?.fen) return;
              const sideNow = sideToMoveFromFen(puzzle.fen);
              startFromFen(puzzle.fen, sideNow);
            }}
          >
            Start
          </Button>
        ) : (
          <>
            <Button
              onClick={async () => {
                const res = await refetch(); // дождались новые данные
                const next = res.data;
                if (next?.fen) {
                  const sideNext = sideToMoveFromFen(next.fen);
                  startFromFen(next.fen, sideNext); // теперь стартуем именно НОВЫЙ пазл
                }
              }}
            >
              Next Puzzle
            </Button>
            <div className={'text-white'}>{side === 'w' ? 'White move' : 'Black move'}</div>
          </>
        )}
      </div>
    </div>
  );
};
