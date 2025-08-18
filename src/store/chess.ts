import { create } from 'zustand'
import { Chess } from 'chess.js';
import type { Color } from 'chess.js';

type MovesFn = Chess['moves'];
type MoveFn = Chess['move'];
type GetFn = Chess['get'];

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
    get: GetFn;
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
        moves: chessGame.moves.bind(chessGame),
        move: chessGame.move.bind(chessGame),
        get: chessGame.get.bind(chessGame),
    }

})
