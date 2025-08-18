import { create } from 'zustand'
import { Chess } from 'chess.js';
import type { Color, Square } from 'chess.js';

type MovesFn = Chess['moves'];
type MoveFn = Chess['move'];

type ChessStoreState = {
    history: string[];
    position: string;
    isCheck: boolean;
    turn: Color;
}

type ChessStoreActions = {
    updateData: () => void;
    getGameStatus: () => 'black' | 'white' | 'draw' | 'playing';
    moves: MovesFn;
    move: MoveFn;
    checkPremove: (args: { from: Square; to: Square; }) => boolean;
}

type ChessStore = ChessStoreState & ChessStoreActions;

export const useChessStore = create<ChessStore>()((set) => {
    const chessGame = new Chess();

    return {
        history: chessGame.history(),
        position: chessGame.fen(),
        isCheck: false,
        turn: chessGame.turn(),
        updateData: () => set({
            history: chessGame.history(),
            position: chessGame.fen(),
            isCheck: chessGame.isCheck(),
            turn: chessGame.turn(),
        }),
        getGameStatus: () => {
            if (chessGame.isGameOver()) {
                if (chessGame.isCheckmate()) {
                    // Победитель — противоположный цвет от того, чей сейчас ход
                    return chessGame.turn() === 'w' ? 'black' : 'white';
                } else {
                    return ('draw');
                }
            }
            return ('playing');
        },
        checkPremove: ({ from, to }) => {
            let fen = chessGame.fen();

            fen = fen.replace(/\s(w|b)\s/, (match, p1) => p1 === 'w' ? ' b ' : ' w '); // replacement of the move of pieces to the opposite side

            const game = new Chess(fen);
            const moves = game.moves({ square: from as Square, verbose: true });

            return moves.some(m => m.to === to);
        },
        moves: chessGame.moves.bind(chessGame),
        move: chessGame.move.bind(chessGame),
    }

})
