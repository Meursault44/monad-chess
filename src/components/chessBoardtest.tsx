import { useRef, useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square } from 'chess.js';
import { motion, useAnimate } from 'motion/react';

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

export default function ChessBoardWithMotion() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const [scope, animate] = useAnimate();
  const [orientation] = useState<'white' | 'black'>('white');

  const [animBadge, setAnimBadge] = useState<{
    id: number;
    square: Square;
    label: string;
  } | null>(null);

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

  const triggerAnim = (square: Square, label = '+50 XP') =>
    setAnimBadge({ id: Date.now(), square, label });

  useEffect(() => {
    const run = async () => {
      if (!animBadge) return;

      // ждём 1 кадр, чтобы <motion.div ref={scope}> гарантированно смонтировался
      await new Promise(requestAnimationFrame);
      if (!scope.current) return;

      // отменяем хвосты прошлых анимаций и сбрасываем стиль
      scope.current.getAnimations?.().forEach((a: Animation) => a.cancel());
      await animate(
        scope.current,
        {
          opacity: 0,
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          borderRadius: 12,
          clipPath: 'inset(50% 50% 50% 50% round 12px)',
        },
        { duration: 0 },
      );

      const wrap = wrapperRef.current;
      const target = targetRef.current;
      if (!wrap || !target) return;

      const sr = getSquareRect(animBadge.square);
      if (!sr) return;

      const badgeW = Math.max(72, Math.min(120, sr.width * 0.9));
      const badgeH = 28;
      const corner = 6;

      const tr = target.getBoundingClientRect();
      const wr = wrap.getBoundingClientRect();
      const targetX = tr.left - wr.left + tr.width / 2 - badgeW / 2;
      const targetY = tr.top - wr.top + tr.height / 2 - badgeH / 2;

      // позиционируем в границы клетки, свернуто к центру (clip-path)
      await animate(
        scope.current,
        {
          left: sr.left,
          top: sr.top,
          width: sr.width,
          height: sr.height,
          opacity: 1,
          borderRadius: 12,
          clipPath: 'inset(50% 50% 50% 50% round 12px)',
        },
        { duration: 0 },
      );

      // заливка изнутри клетки
      await animate(
        scope.current,
        { clipPath: 'inset(0% 0% 0% 0% round 12px)' },
        { duration: 0.28, ease: 'easeOut' },
      );

      // короткая пауза
      await animate(scope.current, { opacity: 1 }, { duration: 0.001, delay: 0.25 });

      // сжатие в бейдж (clip-path уже раскрыт — не трогаем его пружиной)
      await animate(
        scope.current,
        {
          left: sr.left + (sr.width - badgeW - corner),
          top: sr.top + corner,
          width: badgeW,
          height: badgeH,
          borderRadius: 999,
        },
        { type: 'spring', stiffness: 320, damping: 24 },
      );

      // полёт к панели
      await animate(
        scope.current,
        { left: targetX, top: targetY, opacity: 0.2 },
        { type: 'spring', stiffness: 180, damping: 18 },
      );

      await animate(scope.current, { opacity: 0 }, { duration: 0.1 });
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
      {/* цель полёта */}
      <div
        ref={targetRef}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          borderRadius: 14,
          background: 'rgba(255,255,255,0.85)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
        }}
      >
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#111' }} />
        <div style={{ fontWeight: 600 }}>Очки</div>
      </div>

      {/* кнопка запуска */}
      <button
        onClick={() => triggerAnim('e4')}
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          zIndex: 40,
          padding: '10px 14px',
          borderRadius: 12,
          background: '#111',
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Анимация: e4 → Панель
      </button>

      {/* анимируемый слой */}
      {animBadge && (
        <motion.div
          ref={scope}
          initial={{ opacity: 0, left: 0, top: 0, width: 0, height: 0 }}
          style={{
            position: 'absolute',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 10px',
            background: 'rgba(17,17,17,0.9)',
            color: '#fff',
            pointerEvents: 'none',
            boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
            willChange: 'left, top, width, height, clip-path, opacity',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.85)',
              }}
            />
            <span>{animBadge?.label}</span>
          </div>
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
        <Chessboard id="monad-board" position="start" boardOrientation={orientation} />
      </div>
    </div>
  );
}
