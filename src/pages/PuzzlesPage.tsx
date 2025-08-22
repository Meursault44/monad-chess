import { useQuery } from '@tanstack/react-query';
import { getRandomPuzzle } from '@/api/puzzles';
import ChessBoardWrapper from '@/components/ChessBoardWrapper.tsx';
import { Button } from '@chakra-ui/react';
import { usePuzzleEngine } from '@/hooks/usePuzzleEngine';
import { useChessStore } from '@/store/chess.ts';

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

  return (
    <div className="flex w-[1170px] gap-6">
      <ChessBoardWrapper onOpponentTurn={opponentLogic} validateMove={validateMove} />
      <div className="my-auto flex h-[860px] w-[300px] shrink-0 flex-col bg-[#4E3371]">
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
        >
          {!puzzle ? 'Start' : 'Next Puzzle'}
        </Button>
        {phase === 'playing' && (
          <div className={'text-white'}>{side === 'w' ? 'White move' : 'Black move'}</div>
        )}
      </div>
    </div>
  );
};
