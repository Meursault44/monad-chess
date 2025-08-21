import { useCallback, useEffect, useMemo, useState } from 'react';
import type { OpponentLogic } from '@/hooks/useRandomOpponent';

export type LichessPuzzle = {
  id: string;
  fen: string;
  moves: string[]; // UCI: ['f6g4','e7f8','g8f8','d1d8'] начиная с side-to-move в FEN
  gameUrl?: string;
};

export function usePuzzleEngine(puzzle: LichessPuzzle | null) {
  const [idx, setIdx] = useState(0); // индекс следующего правильного UCI в puzzle.moves

  // guard для доски
  const validateMove = useCallback(
    (uci: string) => {
      if (!puzzle) return true;
      const expected = puzzle.moves[idx];
      return uci === expected;
    },
    [puzzle?.id, idx],
  );

  // логика «оппонента»: если следующий ход по скрипту принадлежит текущему turn и он не игрок, делаем его
  const opponentLogic: OpponentLogic = useCallback(
    (ctx) => {
      if (!puzzle) return;
      if (ctx.phase !== 'playing' || !ctx.atTip) return;

      const expected = puzzle.moves[idx];
      console.log(expected);
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
      if (ctx.playerSide && ctx.turn !== ctx.playerSide) {
        console.log(ctx.playerSide);
        const mv = ctx.applyMove({ from, to, promotion: promo });
        ctx.updateData();
        if (mv) ctx.playMoveOpponentSfx();
        console.log(idx);
        setIdx((i) => i + 1);
      }
    },
    [puzzle, idx],
  );

  useEffect(() => {
    setIdx(0);
  }, [puzzle?.id, setIdx]);

  // Когда игрок успешно сделал правильный ход — увеличим idx (сработает валидация на доске, см. ниже)
  const onPlayerAccepted = useCallback(() => {
    setIdx((i) => i + 1);
  }, []);

  const isSolved = useMemo(() => !!puzzle && idx >= puzzle.moves.length, [puzzle?.id, idx]);

  return { validateMove, opponentLogic, isSolved, onPlayerAccepted };
}
