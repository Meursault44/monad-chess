import { useRef, useEffect } from 'react';

export type OpponentCtx = {
  phase: 'idle' | 'playing' | 'finished';
  playerSide: 'w' | 'b' | null;
  turn: 'w' | 'b';
  currentPly: number;
  atTip: boolean;
  // store API
  moves: (args?: any) => any[];
  applyMove: (args: { from: string; to: string; promotion?: 'q' | 'r' | 'b' | 'n' }) => any;
  updateData: () => void;
  getGameStatus: () => 'idle' | 'playing' | 'w' | 'b' | 'finished' | string;
  // sfx
  playMoveOpponentSfx: () => void;
};

export type OpponentLogic = (ctx: OpponentCtx) => void;

export function useRandomOpponent(delayMs = 1500): OpponentLogic {
  const lastBotPlyRef = useRef<number>(-1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Чистим таймеры, если родитель размонтируется
  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  return (ctx: OpponentCtx) => {
    if (ctx.phase !== 'playing') return;
    if (!ctx.playerSide) return; // играем только против заданной стороны
    if (!ctx.atTip) return; // не мешаем перемотке
    if (ctx.turn === ctx.playerSide) return; // сейчас ход игрока

    // защита от повторного срабатывания на ту же позицию
    if (lastBotPlyRef.current === ctx.currentPly) return;
    lastBotPlyRef.current = ctx.currentPly;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const possible = ctx.moves({ verbose: true }) as any[];
      if (!possible?.length) return;
      const rnd = possible[Math.floor(Math.random() * possible.length)];
      const mv = ctx.applyMove({ from: rnd.from, to: rnd.to, promotion: 'q' });
      ctx.updateData();
      if (mv) ctx.playMoveOpponentSfx();
    }, delayMs);
  };
}
