import { useState, useEffect, useMemo } from 'react';
import { Chessboard, type SquareHandlerArgs, type PieceDropHandlerArgs } from 'react-chessboard';
import type { Square } from 'chess.js';
import { useChessStore } from '@/store/chess';
import { useDialogsStore } from '@/store/dialogs';
import { useSoundEffects, useCustomPieces } from '@/hooks';
import PromotionOverlay from '@/components/PromotionOverlay';
import type { OpponentLogic, OpponentCtx } from '@/bot/useRandomOpponent';

type SquaresStylesType = Partial<Record<Square, React.CSSProperties>>;

const lichessRing = (color = '#ff0000', stroke = 6, sizePct = 95): React.CSSProperties => {
  const r = 50 - stroke / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" shape-rendering="geometricPrecision">
    <circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" />
  </svg>`;
  return {
    backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: `${sizePct}% ${sizePct}%`,
  };
};

function toUci(from: string, to: string, promo?: 'q' | 'r' | 'b' | 'n') {
  return `${from}${to}${promo ?? ''}`;
}

export default function ChessBoardWithLogic({
  onOpponentTurn,
  validateMove,
  onPlayerAccepted,
  showDialogWinGame,
}: {
  onOpponentTurn?: OpponentLogic;
  validateMove?: (uci: string) => boolean;
  onPlayerAccepted?: () => void;
  showDialogWinGame?: boolean;
}) {
  // --- Store API ---
  const position = useChessStore((s) => s.position);
  const turn = useChessStore((s) => s.turn);
  const isCheck = useChessStore((s) => s.isCheck);
  const currentPly = useChessStore((s) => s.currentPly);

  const moves = useChessStore((s) => s.moves);
  const applyMove = useChessStore((s) => s.applyMove);
  const updateData = useChessStore((s) => s.updateData);
  const getGameStatus = useChessStore((s) => s.getGameStatus);
  const checkPremove = useChessStore((s) => s.checkPremove);
  const findPiece = useChessStore((s) => s.findPiece);
  const getLastMoveSquares = useChessStore((s) => s.getLastMoveSquares);

  // управление доступностью ходов
  const phase = useChessStore((s) => s.phase); // 'idle' | 'playing' | 'finished'
  const playerSide = useChessStore((s) => s.playerSide); // 'w' | 'b' | null
  const isPlayerTurn = useChessStore((s) => s.isPlayerTurn); // () => boolean
  const atTip = useChessStore((s) => s.currentPly === s.timelineSan.length);

  const { setDialogWinGame } = useDialogsStore();
  const { playMoveSound, playMoveOpponentSfx, playIllegalSfx } = useSoundEffects();
  const customPieces = useCustomPieces();

  // --- Local UI state ---
  const [animMs, setAnimMs] = useState(300);
  const [moveFrom, setMoveFrom] = useState('');
  const [possibleMovesSquares, setPossibleMovesSquares] = useState<SquaresStylesType>({});
  const [premoveSquares, setPremoveSquares] = useState<SquaresStylesType>({});
  const [premove, setPremove] = useState<{ from: string; to: string } | null>(null);
  const [blinkSquares, setBlinkSquares] = useState<SquaresStylesType>({});
  const [rcSquares, setRcSquares] = useState<SquaresStylesType>({});

  const lastMove = getLastMoveSquares(); // { from, to } | null

  const lastMoveStyles = useMemo<SquaresStylesType>(() => {
    if (!lastMove) return {};
    return {
      [lastMove.from]: { background: 'rgba(250, 231, 49, 0.8)' },
      [lastMove.to]: { background: 'rgba(250, 231, 49, 0.8)' },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMove?.from, lastMove?.to]);

  // overlay промо
  const [promotionMove, setPromotionMove] = useState<{
    from: Square;
    to: Square;
    color: 'w' | 'b';
  } | null>(null);

  // === ВЕСЬ КОД ПРОТИВНИКА УДАЛЕН ИЗ КОМПОНЕНТА ===
  // Вызываем переданную логику с контекстом. Если пропс не указан — ничего не делаем.
  useEffect(() => {
    console.log(turn);
    if (!onOpponentTurn) return;
    const ctx: OpponentCtx = {
      phase,
      playerSide,
      turn,
      currentPly,
      atTip,
      moves,
      applyMove,
      updateData,
      getGameStatus,
      playMoveOpponentSfx,
    };
    console.log(ctx);
    onOpponentTurn(ctx);
  }, [
    onOpponentTurn,
    phase,
    playerSide,
    turn,
    currentPly,
    atTip,
    moves,
    applyMove,
    updateData,
    getGameStatus,
    playMoveOpponentSfx,
  ]);

  // При уходе с «кончика» — сбрасываем локальные подсветки/премув
  useEffect(() => {
    if (!atTip) {
      setPremove(null);
      setPremoveSquares({});
      setPossibleMovesSquares({});
      setPromotionMove(null);
    }
  }, [atTip]);

  // подсказки ходов
  function getMoveOptions(square: Square) {
    const ms = moves({ square, verbose: true }) as any[];
    if (ms.length === 0) {
      setPossibleMovesSquares({});
      return false;
    }
    const ns: Record<string, React.CSSProperties> = {};
    for (const m of ms) {
      ns[m.to] = {
        backgroundImage: `url(/MonadLogoBlack.svg)`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: m.captured ? '100%' : '50%',
      };
    }
    ns[square] = { background: 'rgba(220, 255, 163, 0.8)' };
    setPossibleMovesSquares(ns);
    return true;
  }

  // промо helpers
  function findLegalMove(from: Square, to: Square) {
    const legal = moves({ square: from as Square, verbose: true }) as any[];
    return legal.find((m) => m.from === from && m.to === to);
  }
  function isPromotionMove(from: Square, to: Square) {
    const found = findLegalMove(from, to);
    return Boolean(found && typeof found.flags === 'string' && found.flags.includes('p'));
  }
  function fileToIndex(file: string, orientation: 'white' | 'black' = 'white') {
    const idx = Math.max(0, Math.min(7, file.charCodeAt(0) - 'a'.charCodeAt(0)));
    return orientation === 'white' ? idx : 7 - idx;
  }
  const boardOrientation: 'white' | 'black' = playerSide === 'b' ? 'black' : 'white';

  // размеры для overlay
  const squareWidth =
    document.querySelector(`[data-column="a"][data-row="1"]`)?.getBoundingClientRect()?.width ?? 0;

  const promotionSquareLeft = promotionMove?.to
    ? squareWidth *
      fileToIndex((promotionMove.to as string).match(/^[a-h]/)?.[0] ?? 'a', boardOrientation)
    : 0;

  // выбор фигуры (промо)
  function onPromotionPieceSelect(piece: 'q' | 'r' | 'b' | 'n') {
    if (!promotionMove) return;
    try {
      const moveInfo = applyMove({
        from: promotionMove.from,
        to: promotionMove.to,
        promotion: piece,
      });
      updateData();
      onPlayerAccepted?.();

      setPossibleMovesSquares({});
      setRcSquares({});

      playMoveSound({ moveInfo, isCheck });
      if (getGameStatus() === playerSide && showDialogWinGame) setDialogWinGame(true);
    } finally {
      setPromotionMove(null);
      setMoveFrom('');
    }
  }

  // клики по клеткам (запрещаем, если партия не началась или не наш ход)
  function onSquareClick({ square, piece }: SquareHandlerArgs) {
    if (phase !== 'playing' || !isPlayerTurn()) return;

    setRcSquares({});
    console.log(square, piece);

    if (!moveFrom && piece) {
      const has = getMoveOptions(square as Square);
      if (has) setMoveFrom(square);
      return;
    }

    const ms = moves({ square: moveFrom as Square, verbose: true }) as any[];
    const ok = ms.find((m) => m.from === moveFrom && m.to === square);

    if (!ok) {
      const has = getMoveOptions(square as Square);
      setMoveFrom(has ? square : '');
      return;
    }

    if (isPromotionMove(moveFrom as Square, square as Square)) {
      setPromotionMove({ from: moveFrom as Square, to: square as Square, color: turn });
      return;
    }

    const uciTry = toUci(moveFrom, square);
    if (validateMove && !validateMove(uciTry)) {
      // неверный ход в режиме пазла
      playIllegalSfx();
      return; // просто игнор
    }

    try {
      const moveInfo = applyMove({ from: moveFrom, to: square, promotion: 'q' });
      updateData();
      onPlayerAccepted?.();

      playMoveSound({ moveInfo, isCheck });
      setPossibleMovesSquares({});

      if (getGameStatus() === playerSide && showDialogWinGame) {
        setDialogWinGame(true);
      }
    } catch {
      const has = getMoveOptions(square as Square);
      if (has) setMoveFrom(square);
      return;
    }

    setMoveFrom('');
  }

  // dnd (тоже блокируем до старта/в чужой ход)
  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!targetSquare) return false;
    if (phase !== 'playing') return false;

    if (isPromotionMove(sourceSquare as Square, targetSquare as Square)) {
      setPromotionMove({ from: sourceSquare as Square, to: targetSquare as Square, color: turn });
      return true;
    }

    const uciTry = toUci(sourceSquare, targetSquare);
    if (validateMove && !validateMove(uciTry)) {
      playIllegalSfx();
      return false;
    }

    if (turn !== playerSide) {
      if (checkPremove({ from: sourceSquare, to: targetSquare })) {
        setPremove({ from: sourceSquare, to: targetSquare });
        setPremoveSquares({
          [sourceSquare]: { background: 'rgba(57, 84, 151, 0.8)' },
          [targetSquare]: { background: 'rgba(57, 84, 151, 0.8)' },
        });
        return false;
      }
    }

    try {
      const moveInfo = applyMove({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (!moveInfo) throw new Error('Invalid move');

      updateData();
      onPlayerAccepted?.();

      setMoveFrom('');
      setPossibleMovesSquares({});

      playMoveSound({ moveInfo, isCheck });
      if (getGameStatus() === playerSide && showDialogWinGame) {
        setDialogWinGame(true);
      }
      return true;
    } catch {
      if (targetSquare === sourceSquare) return false;
      playIllegalSfx();
      if (isCheck) {
        const sq = findPiece({ color: turn, type: 'k' });
        if (sq) {
          let count = 0;
          const id = setInterval(() => {
            setBlinkSquares((prev) =>
              count % 2 === 0
                ? { ...prev, [sq]: { background: 'rgba(235, 97, 80, .8)' } }
                : (() => {
                    const { [sq]: _, ...rest } = prev;
                    return rest;
                  })(),
            );
            count++;
            if (count > 6) clearInterval(id);
          }, 250);
        }
      }
      return false;
    }
  }

  const chessboardOptions = {
    onPieceDrop,
    onSquareClick,
    position,
    squareStyles: {
      ...lastMoveStyles,
      ...possibleMovesSquares,
      ...premoveSquares,
      ...rcSquares,
      ...blinkSquares,
    },
    onSquareRightClick: (data: any) => {
      const sq = data?.square as Square | undefined;
      if (!sq) return;
      setRcSquares((prev) => {
        if (prev[sq]) {
          const { [sq]: _, ...rest } = prev;
          return rest;
        }
        return {
          ...prev,
          [sq]: lichessRing('rgba(235, 97, 80, .8)'),
        };
      });
    },
    onMouseOverSquare: (p: SquareHandlerArgs) => {
      /* логика выделения/детекта стрелок оставлена без изменений и упрощена */
    },
    pieces: customPieces,
    animationDuration: animMs,
    boardOrientation: playerSide === 'b' ? 'black' : 'white',
    darkSquareStyle: { backgroundColor: '#9778B4' },
    lightSquareStyle: { backgroundColor: '#E7DBF0' },
    id: 'click-or-drag-to-move',
  } as const;

  // премув — применяем только на кончике истории и только в ход игрока
  useEffect(() => {
    if (phase !== 'playing') return;
    if (!atTip) return;
    if (!isPlayerTurn()) return;
    if (!premove) return;

    const ms = moves({ square: premove.from as Square, verbose: true }) as any[];
    const ok = ms.find((m) => m.from === premove.from && m.to === premove.to);
    if (!ok) {
      setPremove(null);
      setPremoveSquares({});
      return;
    }
    if (isPromotionMove(premove.from as Square, premove.to as Square)) {
      setPromotionMove({ from: premove.from as Square, to: premove.to as Square, color: turn });
      return;
    }
    applyMove({ from: premove.from, to: premove.to, promotion: 'q' });
    setPremove(null);
    setPremoveSquares({});
    updateData();
    if (getGameStatus() === playerSide && showDialogWinGame) setDialogWinGame(true);
  }, [phase, atTip, isPlayerTurn, turn, premove, moves, applyMove, updateData]);

  // отключаем анимацию во время промо-оверлея
  useEffect(() => {
    setAnimMs(promotionMove ? 0 : 300);
  }, [promotionMove]);

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        position: 'relative',
        margin: '10px auto',
      }}
    >
      <Chessboard options={chessboardOptions} />
      <PromotionOverlay
        move={promotionMove}
        left={promotionSquareLeft}
        squareWidth={squareWidth}
        pieces={customPieces as any}
        onSelect={onPromotionPieceSelect}
        onClose={() => {
          setPremove(null);
          setPremoveSquares({});
          setPossibleMovesSquares({});
          setPromotionMove(null);
        }}
      />
    </div>
  );
}
