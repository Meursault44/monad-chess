import confetti from 'canvas-confetti';
import { useCallback, useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { checkPuzzleMove, analyzePuzzle } from '@/api/puzzles.ts';
import { useChessStore } from '@/store/chess.ts';
import { usePuzzlesStore } from '@/store/puzzles.ts';
import { useSoundEffects } from '@/hooks';
import { usePuzzleEffects } from '@/store/puzzleEffects.ts';

export type LichessPuzzle = {
  id: string;
  fen: string;
  solution: string[]; // UCI: ['f6g4','e7f8','g8f8','d1d8'] начиная с side-to-move в FEN
  gameUrl?: string;
};

export function usePuzzleEngine(puzzle: LichessPuzzle | null) {
  const [idx, setIdx] = useState(0); // индекс следующего правильного UCI в puzzle.moves
  const [idxBack, setIdxBack] = useState(0);

  const setPhase = useChessStore((s) => s.setPhase);
  const undoHard = useChessStore((s) => s.undoHard);
  const setPuzzleRating = usePuzzlesStore((s) => s.setRating);
  const setRatingChange = usePuzzlesStore((s) => s.setRatingChange);
  const setAssistantMessage = usePuzzlesStore((s) => s.setAssistantMessage);
  const setIsPendingAssistantMessage = usePuzzlesStore((s) => s.setIsPendingAssistantMessage);
  const { playPuzzleCorrectSfx } = useSoundEffects();

  const triggerWinAnimation = usePuzzleEffects((s) => s.triggerWinAnimation);

  const { mutate } = useMutation({
    mutationFn: checkPuzzleMove,
  });

  const { mutate: mutateAnalyze, isPending: isLoadingAnalyze } = useMutation({
    mutationFn: analyzePuzzle,
  });

  // guard для доски
  const validateMove = useCallback(
    (uci: string) => {
      if (!puzzle?.solution) return false;

      mutate(
        { id: puzzle?.id, move: uci, step: idxBack },
        {
          onSuccess: (res) => {
            if (res?.finished) {
              setPhase('idle');
              playPuzzleCorrectSfx();
              triggerWinAnimation(!!Number(uci.slice(-1)) ? uci.slice(-2) : uci.slice(-3, -1));
              confetti({ particleCount: 80, spread: 70, origin: { x: 0.15, y: 0.85 } });
              confetti({ particleCount: 80, spread: 70, origin: { x: 0.15, y: 0.45 } });
              confetti({ particleCount: 80, spread: 70, origin: { x: 0.8, y: 0.4 } });
              confetti({ particleCount: 80, spread: 70, origin: { x: 0.8, y: 0.8 } });
              confetti({ particleCount: 80, spread: 70, origin: { x: 0.53, y: 0.6 } });

              setIdx(0);
              setIdxBack(0);
              setPuzzleRating(res.new_rating);
              setRatingChange(res.rating_change);
            } else if (res?.correct) {
              setRatingChange(null);
              setIdxBack((i) => i + 1);
            } else if (!res?.correct) {
              setRatingChange(res.rating_change);
              setPuzzleRating(res.new_rating);
              if (idx > idxBack) {
                setIdx(idxBack);
                undoHard();
              }
            }
          },
        },
      );

      mutateAnalyze(
        { id: puzzle?.id, move: uci, step: idxBack, isGreeting: false },
        {
          onSuccess: (res) => {
            setAssistantMessage(res?.text || res?.text);
          },
        },
      );

      const expected = puzzle.solution[idx];
      if (uci === expected) {
        setIdx((i) => i + 1);
        return true;
      }
      return false;
    },
    [puzzle?.id, idx, idxBack, setIdxBack, setIdx, setPhase],
  );

  // логика «оппонента»: если следующий ход по скрипту принадлежит текущему turn и он не игрок, делаем его
  const opponentLogic = useCallback(
    (ctx) => {
      if (!puzzle) return;
      if (ctx.phase !== 'playing' || !ctx.atTip) return;

      const expected = puzzle.solution[idx];
      if (!expected) return; // решения закончились

      // чья очередь согласно expected?
      // Мы просто смотрим на текущий turn движка: если сейчас ход того, кто должен сделать expected,
      // и это не игрок (т.е. игрок уже сделал правильный ход и увеличил idx), то сыграем.
      // expected в UCI -> {from,to,promotion}
      const from = expected.slice(0, 2);
      const to = expected.slice(2, 4);
      const promo = expected[4] as any;

      // когда наступает ход соперника?
      // Если idx чётный — ходит сторона, указанная в FEN на старте. Доверимся движку: просто делаем «наш» expected,
      // когда ход не игрока.
      if (ctx.playerSide && ctx.turn !== ctx.playerSide && idx % 2 === 0) {
        const mv = ctx.applyMove({ from, to, promotion: promo });
        ctx.updateData();
        if (mv) ctx.playMoveOpponentSfx();
        setIdx((i) => i + 1);
        setIdxBack((i) => i + 1);
      }
    },
    [puzzle, idx],
  );

  useEffect(() => {
    setIsPendingAssistantMessage(isLoadingAnalyze);
  }, [isLoadingAnalyze, setIsPendingAssistantMessage]);

  const clearState = useCallback(() => {
    setIdx(0);
    setIdxBack(0);
  }, [setIdx, setIdxBack]);

  return { validateMove, opponentLogic, clearState };
}
