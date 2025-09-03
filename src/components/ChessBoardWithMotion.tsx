import { useRef, useState, useEffect, useCallback } from 'react';
import type { Square } from 'chess.js';
import { motion, useAnimate } from 'motion/react';
import { Text } from '@chakra-ui/react';
import { usePuzzleEffects } from '@/store/puzzleEffects.ts';
import ChessBoardWrapper from '@/components/ChessBoardWrapper.tsx';
import { useChessStore } from '@/store/chess';

/** математика клеток */
const fileToIndex = (file: string) =>
  Math.max(0, Math.min(7, file.charCodeAt(0) - 'a'.charCodeAt(0)));

function squareToGrid(square: Square, orientation: 'white' | 'black' = 'white') {
  const file = square[0]!;
  const rank = Number(square[1]!);
  let x = fileToIndex(file);
  let y = 8 - rank;
  if (orientation === 'black') {
    x = 7 - x;
    y = rank - 1;
  }
  return { x, y };
}

export const ChessBoardWithMotion = ({
  onOpponentTurn,
  validateMove,
  showDialogWinGame,
  onMyMove,
  mode,
  targetEl,
}: {
  onOpponentTurn?: any;
  onMyMove?: (from: Square, to: Square, promotion: string) => void;
  validateMove?: (uci: string) => boolean;
  showDialogWinGame?: boolean;
  mode?: 'puzzle' | 'game';
  targetEl?: HTMLElement | null;
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const [scope, animate] = useAnimate(); // контейнер (геометрия, полёт)
  const fillRef = useRef<HTMLDivElement>(null); // внутренняя заливка (clip-path)
  const [showExactly, setShowExactly] = useState(false);
  const setAnimationDone = usePuzzleEffects((s) => s.setAnimationDone);

  const playerSide = useChessStore((s) => s.playerSide); // 'w' | 'b' | null
  const orientation: 'white' | 'black' = playerSide === 'b' ? 'black' : 'white';

  const [animBadge, setAnimBadge] = useState<{
    id: number;
    square: Square;
    label: string;
  } | null>(null);

  const triggerRipple = usePuzzleEffects((s) => s.triggerRipple);
  const winAnimationData = usePuzzleEffects((s) => s.winAnimationData);

  /** прямоугольник клетки */
  const getSquareRect = useCallback(
    (sq: Square) => {
      const wrap = wrapperRef.current;
      const board = boardRef.current;
      if (!wrap || !board) return null;

      const br = board.getBoundingClientRect();
      const wr = wrap.getBoundingClientRect();

      const size = Math.min(br.width, br.height);
      const sqSize = size / 8;

      const boardLeft = br.left - wr.left + (br.width - size) / 2;
      const boardTop = br.top - wr.top + (br.height - size) / 2;

      const { x, y } = squareToGrid(sq, orientation);

      return {
        left: boardLeft + x * sqSize,
        top: boardTop + y * sqSize,
        width: sqSize,
        height: sqSize,
      };
    },
    [orientation],
  );

  useEffect(() => {
    if (winAnimationData) {
      setAnimBadge({ id: Date.now(), square: winAnimationData, label: '+10' });
    }
  }, [winAnimationData]);

  useEffect(() => {
    const run = async () => {
      if (!animBadge) return;

      // ждём 1 кадр, чтобы refs были готовы
      await new Promise(requestAnimationFrame);
      if (!scope.current || !fillRef.current) return;

      // отменяем хвосты прошлых анимаций и жёстко сбрасываем
      scope.current.getAnimations?.().forEach((a: Animation) => a.cancel());
      fillRef.current.getAnimations?.().forEach((a: Animation) => a.cancel());

      await animate(
        scope.current,
        { opacity: 0, left: 0, top: 0, width: 0, height: 0, borderRadius: 0 },
        { duration: 0 },
      );
      await animate(
        fillRef.current,
        { clipPath: 'inset(50% 50% 50% 50% round 0px)', borderRadius: 0 },
        { duration: 0 },
      );

      const wrap = wrapperRef.current;
      if (!wrap) return;

      const sr = getSquareRect(animBadge.square);
      if (!sr) return;

      const badgeW = 46;
      const badgeH = 46;

      const wr = wrap.getBoundingClientRect();
      let targetX = wr.width;
      let targetY = wr.height / 2;
      if (targetEl) {
        const tr = targetEl.getBoundingClientRect();
        // центр Progress в координатах wrapperRef:
        targetX = tr.left - wr.left - 10 - badgeW / 2;
        targetY = tr.top - wr.top + tr.height / 2 - badgeH / 2;
      }

      // позиционируем контейнер в границы клетки (контейнер без clip-path)
      await animate(
        scope.current,
        {
          left: sr.left,
          top: sr.top,
          width: sr.width,
          height: sr.height,
          opacity: 1,
          borderRadius: 0,
        },
        { duration: 0 },
      );

      // показываем бейдж "Exactly" (он не обрезается, clip-path на fillRef)
      setShowExactly(true);

      // заливка из центра: раскрываем mask только у fillRef
      await animate(
        fillRef.current,
        { clipPath: 'inset(0% 0% 0% 0% round 0px)' },
        { duration: 0.28, ease: 'easeOut' },
      );

      // короткая пауза на чтение
      await animate(scope.current, { opacity: 1 }, { duration: 0.001, delay: 1 });

      // скрываем бейдж "Exactly" перед сжатием
      setShowExactly(false);

      // делаем круглую маску у заливки (мгновенно), чтобы тени были круглыми
      await animate(
        fillRef.current,
        { clipPath: 'inset(0% 0% 0% 0% round 999px)', borderRadius: 999 },
        { duration: 0 },
      );

      // SHRINK: сжатие контейнера в кружок в углу клетки
      await animate(
        scope.current,
        {
          left: sr.left + sr.width - 30,
          top: sr.top - 20,
          width: badgeW,
          height: badgeH,
          borderRadius: 999,
        },
        { type: 'spring', stiffness: 320, damping: 24 },
      );

      // полёт к панели (фикс. длительность, без хвоста)
      await animate(
        scope.current,
        { left: targetX, top: targetY },
        { duration: 0.3, ease: 'easeOut' },
      );

      // ripple сразу по прилёту и мгновенно скрываем
      triggerRipple();
      setAnimationDone(true);
      await animate(scope.current, { opacity: 0 }, { duration: 0 });

      setAnimBadge(null);
    };

    run();
  }, [animBadge?.id, animate, getSquareRect, scope]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        margin: 'auto',
        width: '90vh',
        height: '90vh',
      }}
    >
      {/* анимируемый контейнер (без clip-path, overflow: visible — чтобы бейдж торчал наружу) */}
      {animBadge && (
        <motion.div
          ref={scope}
          initial={{ opacity: 0, left: 0, top: 0, width: 0, height: 0 }}
          style={{
            position: 'absolute',
            overflow: 'visible',
            zIndex: 50,
            padding: '0 10px',
            color: '#fff',
            pointerEvents: 'none',
            boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
            willChange: 'left, top, width, height, opacity',
          }}
        >
          {/* Слой заливки: к нему применяем clip-path */}
          <div
            ref={fillRef}
            style={{
              position: 'absolute',
              inset: 0,
              background: '#836EF9',
              borderRadius: 0,
              willChange: 'clip-path, border-radius',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Центровой текст +10 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              <Text fontSize={showExactly ? '22px' : '14px'}>{animBadge?.label}</Text>
            </div>
          </div>

          {/* Бейдж Exactly — не клипается, т.к. clip-path на fillRef, а не на контейнере */}
          {showExactly && (
            <Text
              position="absolute"
              top={-3}
              right={-4}
              background="#fff"
              color="#111"
              fontSize="14px"
              px="8px"
              py="6px"
              borderRadius={999}
              fontWeight={700}
              boxShadow="0 2px 10px rgba(0,0,0,0.12)"
              border="1px solid rgba(0,0,0,0.06)"
              pointerEvents="none"
            >
              Exactly
            </Text>
          )}
        </motion.div>
      )}

      {/* доска */}
      <div
        ref={boardRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChessBoardWrapper
          onOpponentTurn={onOpponentTurn}
          validateMove={validateMove}
          mode={'puzzle'}
        />
      </div>
    </div>
  );
};
