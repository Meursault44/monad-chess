// store/chess.ts
import { create } from 'zustand';
import { Chess } from 'chess.js';
import type { Color, Square } from 'chess.js';

type MovesFn = Chess['moves'];
type FindPieceFn = Chess['findPiece'];

type GamePhase = 'idle' | 'playing' | 'finished';

type ChessStoreState = {
  history: string[];
  timelineSan: string[];
  currentPly: number;

  position: string;
  isCheck: boolean;
  turn: Color;
  initialFen: string;

  // 🔸 новое:
  phase: GamePhase;
  playerSide: Color | null; // 'w' | 'b' | null (ещё не выбрана)
};

type ChessStoreActions = {
  updateData: () => void;
  getGameStatus: () => Color | 'draw' | 'playing';
  moves: MovesFn;

  checkPremove: (args: { from: Square; to: Square }) => boolean;

  applyMove: (args: {
    from: Square;
    to: Square;
    promotion?: 'q' | 'r' | 'b' | 'n';
  }) => { san: string } | null;
  goToPly: (ply: number) => void;
  findPiece: FindPieceFn;
  undo: (n?: number) => number;
  redo: (n?: number) => number;
  loadFen: (fen: string) => void;
  getVisibleVerbose: () => any[];
  getLastMoveSquares: () => { from: Square; to: Square } | null;

  // 🔸 новое:
  setPlayerSide: (side: 'w' | 'b' | 'random') => void;
  startGame: () => void;
  isPlayerTurn: () => boolean;
  resetGame: () => void;
  startFromFen: (fen: string, side?: Color) => void;
};

type ChessStore = ChessStoreState & ChessStoreActions;

export const useChessStore = create<ChessStore>()((set, get) => {
  const game = new Chess();

  const updateData = () => {
    const { timelineSan, currentPly } = get();
    const visible = timelineSan.slice(0, currentPly);
    set({
      history: visible,
      position: game.fen(),
      isCheck: game.isCheck(),
      turn: game.turn(),
    });
  };

  const rebuildToPly = (ply: number) => {
    const { initialFen, timelineSan } = get();
    game.load(initialFen);
    for (let i = 0; i < ply; i++) {
      const san = timelineSan[i];
      if (!san) break;
      try {
        game.move(san);
      } catch {
        break;
      }
    }
    set({ currentPly: ply });
    updateData();
  };

  return {
    // ---------- state ----------
    history: game.history(),
    timelineSan: [],
    currentPly: 0,

    position: game.fen(),
    isCheck: game.isCheck(),
    turn: game.turn(),
    initialFen: game.fen(),

    // 🔸 новое:
    phase: 'idle',
    playerSide: null,

    // ---------- actions ----------
    updateData,

    getGameStatus: () => {
      if (game.isGameOver()) {
        if (game.isCheckmate()) return game.turn() === 'w' ? 'b' : 'w';
        return 'draw';
      }
      return 'playing';
    },

    moves: game.moves.bind(game),

    checkPremove: ({ from, to }) => {
      let fen = game.fen();
      fen = fen.replace(/\s(w|b)\s/, (_m, p1) => (p1 === 'w' ? ' b ' : ' w '));
      const g = new Chess(fen);
      const moves = g.moves({ square: from as Square, verbose: true });
      return moves.some((m) => m.to === to);
    },

    applyMove: (args) => {
      try {
        const { timelineSan, currentPly } = get();

        // Если мы не на "кончике" истории — сначала восстановим позицию на конце,
        // чтобы ничего не обрезать.
        if (currentPly !== timelineSan.length) {
          // используем уже объявленную внутри стора функцию
          rebuildToPly(timelineSan.length);
        }

        const mv = game.move(args);
        if (!mv) return null;

        // просто добавляем ход в КОНЕЦ полного таймлайна
        const newTimeline = [...get().timelineSan, mv.san];
        set({ timelineSan: newTimeline, currentPly: newTimeline.length });

        updateData();
        return { san: mv.san };
      } catch {
        return null;
      }
    },

    goToPly: (ply) => {
      const { timelineSan } = get();
      const clamped = Math.max(0, Math.min(ply, timelineSan.length));
      rebuildToPly(clamped);
    },

    findPiece: game.findPiece.bind(game),

    undo: (n = 1) => {
      const { currentPly } = get();
      const want = Math.max(0, currentPly - n);
      rebuildToPly(want);
      return currentPly - want;
    },

    redo: (n = 1) => {
      const { currentPly, timelineSan } = get();
      const want = Math.min(timelineSan.length, currentPly + n);
      rebuildToPly(want);
      return want - currentPly;
    },

    loadFen: (fen: string) => {
      game.load(fen);
      set({ initialFen: fen, timelineSan: [], currentPly: 0 });
      updateData();
    },

    getVisibleVerbose: () => {
      const { currentPly } = get();
      const all = game.history({ verbose: true }) as any[];
      return all.slice(0, currentPly);
    },

    getLastMoveSquares: () => {
      const vis = get().getVisibleVerbose();
      const last = vis[vis.length - 1];
      if (!last) return null;
      return { from: last.from as Square, to: last.to as Square };
    },

    // ---------- новое ----------
    setPlayerSide: (side) => {
      if (side === 'random') {
        const rnd = Math.random() < 0.5 ? 'w' : 'b';
        set({ playerSide: rnd as Color });
      } else {
        set({ playerSide: side as Color });
      }
    },

    startGame: () => {
      const { playerSide } = get();
      // если ещё не выбрали — по умолчанию random
      if (!playerSide) {
        const rnd = Math.random() < 0.5 ? 'w' : 'b';
        set({ playerSide: rnd as Color });
      }
      // сброс партии
      game.reset();
      set({
        phase: 'playing',
        timelineSan: [],
        currentPly: 0,
        initialFen: game.fen(),
      });
      updateData();
    },

    isPlayerTurn: () => {
      const { phase, playerSide } = get();
      return phase === 'playing' && !!playerSide && playerSide === game.turn();
    },

    resetGame: () => {
      game.reset();
      set({
        phase: 'idle',
        playerSide: null,
        timelineSan: [],
        currentPly: 0,
        initialFen: game.fen(),
      });
      updateData();
    },
    startFromFen: (fen, side) => {
      // загрузить позицию
      game.load(fen);
      // если side не задан — возьмём из fen
      const sideFromFen = game.turn() as Color;
      set({
        phase: 'playing',
        playerSide: side ?? sideFromFen,
        timelineSan: [],
        currentPly: 0,
        initialFen: game.fen(), // именно этот fen как «база»
      });
      get().updateData();
    },
  };
});
