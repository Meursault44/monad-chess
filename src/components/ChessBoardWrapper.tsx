import { useState, useEffect, useMemo, useCallback } from 'react';
import { Chessboard, type SquareHandlerArgs, type PieceDropHandlerArgs } from 'react-chessboard';
import type { Square } from 'chess.js';
import { useChessStore } from '@/store/chess';
import { useDialogsStore } from '@/store/dialogs';
import { useSoundEffects, useCustomPieces } from '@/hooks';
import PromotionOverlay from '@/components/PromotionOverlay';
import type { OpponentLogic, OpponentCtx } from '@/hooks/useRandomOpponent';
import { type PieceHandlerArgs } from 'react-chessboard';

type SquaresStylesType = Partial<Record<Square, React.CSSProperties>>;

type OnPieceDragType = ({ isSparePiece, piece, square }: PieceHandlerArgs) => void;

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

// helper: SVG “крестик” в кружке как data URL
const makeErrorBadgeDataUrl = (fill = '#ef4444') => {
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
    <circle cx='12' cy='12' r='12' fill='${fill}'/>
    <path d='M8 8l8 8M16 8l-8 8' stroke='white' stroke-width='2' stroke-linecap='round'/>
  </svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

const makeSuccessBadgeDataUrl = (fill = '#22c55e') => {
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
    <circle cx='12' cy='12' r='12' fill='${fill}'/>
    <path d='M7 12.5l3.5 3.5L17 9'
      fill='none' stroke='white' stroke-width='2.5'
      stroke-linecap='round' stroke-linejoin='round'/>
  </svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

// helper: генерируем CSS для нужного id
const makeBadgeCss = (
  square?: string,
  variant?: string,
  opts?: { top?: number; right?: number; size?: number },
) => {
  if (!square) return '';
  const top = opts?.top ?? 12; // px: насколько “выезжает” сверху
  const right = opts?.right ?? 12; // px: насколько “выезжает” справа
  const size = opts?.size ?? 34; // px: диаметр бейджа
  const bg = variant === 'success' ? makeSuccessBadgeDataUrl() : makeErrorBadgeDataUrl();

  const id = `click-or-drag-to-move-square-${square}`;
  return `
    /* сам квадрат должен быть контейнером для ::after */
    #${id} { position: relative; overflow: visible !important; }

    /* бейдж */
    #${id}::after {
      content: "";
      position: absolute;
      top: -${top}px;
      right: -${right}px;
      width: ${size}px;
      height: ${size}px;
      background-image: ${bg};
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center;
      pointer-events: none;
      z-index: 30;
    }
  `;
};

type CustomCss = string | string[];

export default function ChessBoardWithLogic({
  onOpponentTurn,
  validateMove,
  showDialogWinGame,
  onMyMove,
  mode,
}: {
  onOpponentTurn?: OpponentLogic;
  onMyMove?: (from: Square, to: Square, promotion: string) => void;
  validateMove?: (uci: string) => boolean;
  showDialogWinGame?: boolean;
  mode?: 'puzzle' | 'game';
}) {
  // --- Store API ---
  const position = useChessStore((s) => s.position);
  const turn = useChessStore((s) => s.turn);
  const isCheck = useChessStore((s) => s.isCheck);
  const currentPly = useChessStore((s) => s.currentPly);
  const undoHard = useChessStore((s) => s.undoHard);

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
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [possibleMovesSquares, setPossibleMovesSquares] = useState<SquaresStylesType>({});
  const [premoveSquares, setPremoveSquares] = useState<SquaresStylesType>({});
  const [premove, setPremove] = useState<{ from: string; to: string } | null>(null);
  const [blinkSquares, setBlinkSquares] = useState<SquaresStylesType>({});
  const [puzzleMovesSquares, setPuzzleMovesSquares] = useState<SquaresStylesType>({});
  const [rcSquares, setRcSquares] = useState<SquaresStylesType>({});
  const [badgeCss, setBadgeCss] = useState<CustomCss>('');

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

  const [isLock, setIsLock] = useState(false);

  // === ВЕСЬ КОД ПРОТИВНИКА УДАЛЕН ИЗ КОМПОНЕНТА ===
  // Вызываем переданную логику с контекстом. Если пропс не указан — ничего не делаем.
  useEffect(() => {
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

  const highlightingTheKingUnderCheck = useCallback(() => {
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
  }, [findPiece, setBlinkSquares]);

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
      const uciTry = toUci(promotionMove.from, promotionMove.to, piece);
      if (validateMove && !validateMove(uciTry)) {
        playIllegalSfx();
        return; // просто игнор
      }
      const moveInfo = applyMove({
        from: promotionMove.from,
        to: promotionMove.to,
        promotion: piece,
      });
      updateData();

      setPossibleMovesSquares({});
      setRcSquares({});

      playMoveSound({ moveInfo, isCheck });
      if (getGameStatus() === playerSide && showDialogWinGame) setDialogWinGame(true);
    } finally {
      setPromotionMove(null);
      setMoveFrom(null);
    }
  }

  const tryPuzzleMove = (from: Square, to: Square) => {
    const uciTry = toUci(from, to);
    const isValid = validateMove?.(uciTry);

    if (isValid) {
      try {
        const moveInfo = applyMove({ from: from, to: to, promotion: 'q' });
        if (!moveInfo) throw new Error('Invalid move');

        updateData();

        setMoveFrom(null);
        setPossibleMovesSquares({});

        playMoveSound({ moveInfo, isCheck });
        setBadgeCss(makeBadgeCss(to, 'success'));
        setPuzzleMovesSquares({
          [from]: { backgroundColor: 'rgba(172, 206, 89, .85)' },
          [to]: { backgroundColor: 'rgba(172, 206, 89, .85)' },
        });
        if (getGameStatus() === playerSide && showDialogWinGame) {
          setDialogWinGame(true);
        }
        return true;
      } catch {
        playIllegalSfx();
        if (isCheck) {
          highlightingTheKingUnderCheck();
        }
        return false;
      }
    } else {
      try {
        const moveInfo = applyMove({ from: from, to: to, promotion: 'q' });
        if (!moveInfo) throw new Error('Invalid move');

        updateData();

        setMoveFrom(null);
        setPossibleMovesSquares({});

        playMoveSound({ moveInfo, isCheck });
        setBadgeCss(makeBadgeCss(to, 'error'));
        setPuzzleMovesSquares({
          [from]: { backgroundColor: 'rgba(255, 119, 105, .8)' },
          [to]: { backgroundColor: 'rgba(255, 119, 105, .8)' },
        });
        setIsLock(true);
        return true;
      } catch {
        playIllegalSfx();
        if (isCheck) {
          highlightingTheKingUnderCheck();
        }
        return false;
      }
    }
  };

  // клики по клеткам (запрещаем, если партия не началась или не наш ход)
  function onSquareClick({ square, piece }: SquareHandlerArgs) {
    if (phase !== 'playing' || !isPlayerTurn()) return;

    setRcSquares({});

    if (!moveFrom && piece) {
      const has = getMoveOptions(square as Square);
      if (has) setMoveFrom(square);
      return;
    }

    const ms = moves({ square: moveFrom as Square, verbose: true }) as any[];
    const ok = ms.find((m) => m.from === moveFrom && m.to === square);

    if (!ok) {
      const has = getMoveOptions(square as Square);
      setMoveFrom(has ? square : null);
      return;
    }

    if (isPromotionMove(moveFrom as Square, square as Square)) {
      setPromotionMove({ from: moveFrom as Square, to: square as Square, color: turn });
      return;
    }

    try {
      const moveInfo = applyMove({ from: moveFrom, to: square, promotion: 'q' });
      updateData();

      playMoveSound({ moveInfo, isCheck });
      setPossibleMovesSquares({});

      if (getGameStatus() === playerSide && showDialogWinGame) {
        setDialogWinGame(true);
      }
    } catch {
      console.log('err');
    }

    setMoveFrom(null);
  }

  const onSquareClickPuzzle = ({ square, piece }: SquareHandlerArgs) => {
    if (phase !== 'playing' || !isPlayerTurn()) return;

    setRcSquares({});

    if (!moveFrom && piece) {
      const has = getMoveOptions(square as Square);
      if (has) setMoveFrom(square);
      return;
    }

    const ms = moves({ square: moveFrom as Square, verbose: true }) as any[];
    const ok = ms.find((m) => m.from === moveFrom && m.to === square);

    if (!ok) {
      const has = getMoveOptions(square as Square);
      setMoveFrom(has ? square : null);
      return;
    }

    if (isPromotionMove(moveFrom as Square, square as Square)) {
      setPromotionMove({ from: moveFrom as Square, to: square as Square, color: turn });
      return;
    }

    tryPuzzleMove(moveFrom, square);
    setMoveFrom(null);
  };

  // dnd (тоже блокируем до старта/в чужой ход)
  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!targetSquare || sourceSquare === targetSquare || phase !== 'playing') return false;

    if (isPromotionMove(sourceSquare as Square, targetSquare as Square)) {
      setPromotionMove({ from: sourceSquare as Square, to: targetSquare as Square, color: turn });
      return true;
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

      onMyMove?.(sourceSquare, targetSquare, 'q');
      updateData();

      setMoveFrom(null);
      setPossibleMovesSquares({});

      playMoveSound({ moveInfo, isCheck });
      if (getGameStatus() === playerSide && showDialogWinGame) {
        setDialogWinGame(true);
      }
      return true;
    } catch {
      playIllegalSfx();
      if (isCheck) {
        highlightingTheKingUnderCheck();
      }
      return false;
    }
  }

  const onPieceDropPuzzle = ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    if (!targetSquare || sourceSquare === targetSquare || phase !== 'playing') return false;

    if (isPromotionMove(sourceSquare as Square, targetSquare as Square)) {
      setPromotionMove({ from: sourceSquare as Square, to: targetSquare as Square, color: turn });
      return true;
    }

    return tryPuzzleMove(sourceSquare, targetSquare);
  };
  const onPieceDrag: OnPieceDragType = ({ square }) => {
    if (phase !== 'playing' || !square) return;
    setRcSquares({});
    getMoveOptions(square);
  };

  const chessboardOptions = {
    onPieceDrop: mode === 'puzzle' ? onPieceDropPuzzle : onPieceDrop,
    onSquareClick: mode === 'puzzle' ? onSquareClickPuzzle : onSquareClick,
    position,
    squareStyles: {
      ...lastMoveStyles,
      ...possibleMovesSquares,
      ...premoveSquares,
      ...rcSquares,
      ...blinkSquares,
      ...puzzleMovesSquares,
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
    onPieceDrag,
    pieces: customPieces,
    animationDuration: animMs,
    boardOrientation: playerSide === 'b' ? 'black' : 'white',
    darkSquareStyle: { backgroundColor: '#4F4372' },
    lightSquareStyle: { backgroundColor: '#D9D9D9' },
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

  useEffect(() => {
    if (currentPly === 0) {
      setPuzzleMovesSquares({});
      setPossibleMovesSquares({});
      setRcSquares({});
      setPremoveSquares({});
      setBlinkSquares({});
      setBadgeCss('');
    }
  }, [currentPly]);

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
        margin: 'auto',
        width: '90vh',
        height: '90vh',
      }}
    >
      <style>{badgeCss}</style>
      <Chessboard options={chessboardOptions} />
      {isLock && (
        <div
          onClick={(e) => {
            // откат последнего хода и снятие блокировки
            e.stopPropagation();
            undoHard?.(1);
            updateData();
            setPuzzleMovesSquares({});
            setIsLock(false);
            setBadgeCss('');
          }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 50,
            cursor: 'pointer',
          }}
          aria-label="Wrong move overlay — click to undo"
        />
      )}
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
