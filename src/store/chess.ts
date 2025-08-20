import { create } from 'zustand'
import { Chess } from 'chess.js';
import type { Color, Square } from 'chess.js';

type MovesFn = Chess['moves'];
type FindPieceFn = Chess['findPiece'];

type ChessStoreState = {
    // 🔹 видимая история позиции (для доски) = первые currentPly ходов
    history: string[];
    // 🔹 полный таймлайн всех сделанных ходов (не меняется при перемотке)
    timelineSan: string[];
    currentPly: number;

    position: string;
    isCheck: boolean;
    turn: Color;
    initialFen: string;
};

type ChessStoreActions = {
    updateData: () => void;
    getGameStatus: () => 'black' | 'white' | 'draw' | 'playing';
    moves: MovesFn;

    // было:
    // move: MoveFn;  // больше не используем напрямую, только applyMove

    checkPremove: (args: { from: Square; to: Square; }) => boolean;

    // 🔹 новые высокоуровневые действия:
    applyMove: (args: { from: Square; to: Square; promotion?: 'q'|'r'|'b'|'n' }) => { san: string } | null;
    goToPly: (ply: number) => void;
    findPiece: FindPieceFn;
    undo: (n?: number) => number;
    redo: (n?: number) => number;
    loadFen: (fen: string) => void;
    getVisibleVerbose: () => any[]; // verbose moves на текущем currentPly
    getLastMoveSquares: () => { from: Square; to: Square } | null;
};

type ChessStore = ChessStoreState & ChessStoreActions;

export const useChessStore = create<ChessStore>()((set, get) => {
    const game = new Chess();

    const updateData = () => {
        // видимая история = первые currentPly элементов из полного таймлайна
        const { timelineSan, currentPly } = get();
        const visible = timelineSan.slice(0, currentPly);
        set({
            history: visible,
            position: game.fen(),
            isCheck: game.isCheck(),
            turn: game.turn(),
        });
    };

    // пересобрать позицию из initialFen и первых currentPly ходов таймлайна
    const rebuildToPly = (ply: number) => {
        const { initialFen, timelineSan } = get();
        game.load(initialFen);
        for (let i = 0; i < ply; i++) {
            const san = timelineSan[i];
            // если вдруг запись рассинхронизировалась, просто выходим
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
        history: game.history(),        // будет переопределяться updateData()
        timelineSan: [],                // полный список SAN
        currentPly: 0,                  // «курсор» внутри таймлайна

        position: game.fen(),
        isCheck: game.isCheck(),
        turn: game.turn(),
        initialFen: game.fen(),

        // ---------- actions ----------
        updateData,

        getGameStatus: () => {
            if (game.isGameOver()) {
                if (game.isCheckmate()) return game.turn() === 'w' ? 'black' : 'white';
                return 'draw';
            }
            return 'playing';
        },

        moves: game.moves.bind(game),

        checkPremove: ({ from, to }) => {
            let fen = game.fen();
            fen = fen.replace(/\s(w|b)\s/, (_m, p1) => p1 === 'w' ? ' b ' : ' w ');
            const g = new Chess(fen);
            const moves = g.moves({ square: from as Square, verbose: true });
            return moves.some(m => m.to === to);
        },

        // 🔹 делаем ход в текущей позиции
        applyMove: (args) => {
            try {
                const mv = game.move(args);
                if (!mv) return null;

                // если ход сделали не в конце — обрежем ветку future и перезапишем таймлайн
                const { timelineSan, currentPly } = get();
                const newTimeline = timelineSan.slice(0, currentPly);
                newTimeline.push(mv.san);

                set({ timelineSan: newTimeline, currentPly: currentPly + 1 });
                updateData();
                return { san: mv.san };
            } catch {
                return null;
            }
        },

        // 🔹 перейти к произвольному полуходу, не меняя полный таймлайн
        goToPly: (ply) => {
            const { timelineSan } = get();
            const clamped = Math.max(0, Math.min(ply, timelineSan.length));
            rebuildToPly(clamped);
        },
        findPiece: game.findPiece.bind(game),
        // 🔹 шаг назад
        undo: (n = 1) => {
            const { currentPly } = get();
            const want = Math.max(0, currentPly - n);
            rebuildToPly(want);
            return currentPly - want;
        },

        // 🔹 шаг вперёд
        redo: (n = 1) => {
            const { currentPly, timelineSan } = get();
            const want = Math.min(timelineSan.length, currentPly + n);
            rebuildToPly(want);
            return want - currentPly;
        },

        // 🔹 загрузить новую стартовую позицию (сброс таймлайна)
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

        // отдать from/to последнего видимого хода
        getLastMoveSquares: () => {
            const vis = get().getVisibleVerbose();
            const last = vis[vis.length - 1];
            if (!last) return null;
            return { from: last.from as Square, to: last.to as Square };
        },
    };
});
