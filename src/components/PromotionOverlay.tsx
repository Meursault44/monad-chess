import type { Square } from 'chess.js';
import { CloseButton } from '@chakra-ui/react';

type PromotionMove = { from: Square; to: Square; color: 'w' | 'b' } | null;

type PiecesMap = Partial<
  Record<`w${'Q' | 'R' | 'B' | 'N'}` | `b${'Q' | 'R' | 'B' | 'N'}`, () => JSX.Element>
>;

type Props = {
  move: PromotionMove; // текущее состояние промо
  left: number; // смещение слева (px) для столбца целевой клетки
  squareWidth: number; // ширина клетки (px)
  pieces: PiecesMap; // из useCustomPieces()
  onSelect: (p: 'q' | 'r' | 'b' | 'n') => void; // выбор фигуры
  onClose: () => void; // закрытие диалога
};

export default function PromotionOverlay({
  move,
  left,
  squareWidth,
  pieces,
  onSelect,
  onClose,
}: Props) {
  if (!move) return null;

  return (
    <div
      className="absolute top-0 z-[1000]"
      onClick={onClose}
      onContextMenu={(e) => {
        e.preventDefault();
        onClose();
      }}
      // клик по фону рядом с колонкой — тоже закроет
      style={{ insetInline: 0 /* чтобы ловить клик по пустому месту над доской */ }}
    >
      <div
        className="absolute top-0 flex flex-col bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left, width: squareWidth, zIndex: 1001 }}
        onClick={(e) => e.stopPropagation()} // чтобы клик по кнопкам не закрывал
      >
        {(['q', 'r', 'n', 'b'] as const).map((p) => {
          const key = `${move.color}${p.toUpperCase()}` as keyof PiecesMap;
          const PieceCmp = pieces[key];
          return (
            <button
              key={p}
              onClick={() => onSelect(p)}
              onContextMenu={(e) => e.preventDefault()}
              className="flex aspect-square w-full items-center justify-center p-0 hover:bg-neutral-500 active:scale-[0.98]"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              {PieceCmp ? <PieceCmp /> : <span className="text-xl">{p.toUpperCase()}</span>}
            </button>
          );
        })}
        <CloseButton aria-label="Закрыть выбор фигуры" onClick={onClose} m="2" />
      </div>
    </div>
  );
}
