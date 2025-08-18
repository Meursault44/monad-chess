import { Chessboard, type SquareHandlerArgs, type PieceDropHandlerArgs } from 'react-chessboard';
import { useState, useEffect } from 'react';
import { type Square } from 'chess.js'
import {useChessStore} from "../store/chess.ts";
import {useDialogsStore} from "@/store/dialogs.ts";
import { useSoundEffects, useCustomPieces } from '@/hooks'
import { AnalyseTool, PlayerRow } from "@/components";
import { HStack } from "@chakra-ui/react";

export const HomePage = () => {
    const chessGame = useChessStore();
    const { setDialogWinGame } = useDialogsStore();
    const { playMoveSound, playMoveOpponentSfx } = useSoundEffects();
    const customPieces = useCustomPieces();

    const [moveFrom, setMoveFrom] = useState('');
    const [possibleMovesSquares, setPossibleMovesSquares] = useState({});
    const [optionSquares, setOptionSquares] = useState({});

    const [isDown, setIsDown] = useState(false);

    // make a random "CPU" move
    function makeRandomMove() {
        // get all possible moves`
        if (chessGame.getGameStatus() !== 'playing') {
            return;
        }
        const possibleMoves = chessGame.moves({ verbose: true });

        // pick a random move
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

        // make the move
        chessGame.move({ from: randomMove.from, to: randomMove.to, promotion: 'q' });
        chessGame.updateData();

        playMoveOpponentSfx()
        setOptionSquares({
            [randomMove.from]: { background: 'rgba(250, 231, 49, 0.8)' },
            [randomMove.to]:   { background: 'rgba(250, 231, 49, 0.8)' },
        });
    }

    // get the move options for a square to show valid moves
    function getMoveOptions(square: Square) {
        // get the moves for the square
        const moves = chessGame.moves({
            square,
            verbose: true
        });

        // if no moves, clear the option squares
        if (moves.length === 0) {
            setPossibleMovesSquares({});
            return false;
        }

        // create a new object to store the option squares
        const newSquares: Record<string, React.CSSProperties> = {};

        // loop through the moves and set the option squares
        for (const move of moves) {
            newSquares[move.to] = {
                backgroundImage: `url(/MonadLogoBlack.svg)`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: chessGame.get(move.to) && chessGame.get(move.to)?.color !== chessGame.get(square)?.color ? '100%' : '50%',

                // smaller circle for moving
            };
        }

        // set the square clicked to move from to yellow
        newSquares[square] = {
            background: 'rgba(220, 255, 163, 0.8)'
        };

        // set the option squares
        setPossibleMovesSquares(newSquares);

        // return true to indicate that there are move options
        return true;
    }
    function onSquareClick({
                               square,
                               piece
                           }: SquareHandlerArgs) {
        // piece clicked to move
        if (!moveFrom && piece) {
            // get the move options for the square
            const hasMoveOptions = getMoveOptions(square as Square);

            // if move options, set the moveFrom to the square
            if (hasMoveOptions) {
                setMoveFrom(square);
            }

            // return early
            return;
        }

        // square clicked to move to, check if valid move
        const moves = chessGame.moves({
            square: moveFrom as Square,
            verbose: true
        });
        const foundMove = moves.find(m => m.from === moveFrom && m.to === square);

        // not a valid move
        if (!foundMove) {
            // check if clicked on new piece
            const hasMoveOptions = getMoveOptions(square as Square);

            // if new piece, setMoveFrom, otherwise clear moveFrom
            setMoveFrom(hasMoveOptions ? square : '');

            // return early
            return;
        }

        // is normal move
        try {
            const moveInfo = chessGame.move({
                from: moveFrom,
                to: square,
                promotion: 'q'
            });
            chessGame.updateData();

            playMoveSound({moveInfo, isCheck: chessGame.isCheck})

            const newSquares: Record<string, React.CSSProperties> = {};

            // set the square clicked to move from to yellow
            newSquares[moveFrom] = {
                background: 'rgba(250, 231, 49, 0.8)'
            };
            newSquares[square] = {
                background: 'rgba(250, 231, 49, 0.8)'
            };
            setPossibleMovesSquares({});
            setOptionSquares(newSquares);

            if (chessGame.getGameStatus() === 'white') {
                setDialogWinGame(true);
            }

        } catch {
            // if invalid, setMoveFrom and getMoveOptions
            const hasMoveOptions = getMoveOptions(square as Square);

            // if new piece, setMoveFrom, otherwise clear moveFrom
            if (hasMoveOptions) {
                setMoveFrom(square);
            }
            // return early
            return;
        }

        // make random cpu move after a short delay
        setTimeout(makeRandomMove, 2000);

        // clear moveFrom and optionSquares
        setMoveFrom('');
    }

    // handle piece drop
    function onPieceDrop({
                             sourceSquare,
                             targetSquare
                         }: PieceDropHandlerArgs) {
        // type narrow targetSquare potentially being null (e.g. if dropped off board)
        if (!targetSquare) {
            return false;
        }

        // try to make the move according to chess.js logic
        try {
            const moveInfo = chessGame.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q' // always promote to a queen for example simplicity
            });
            chessGame.updateData();

            // clear moveFrom and optionSquares
            setMoveFrom('');
            setPossibleMovesSquares({});

            const newSquares: Record<string, React.CSSProperties> = {};

            // set the square clicked to move from to yellow
            newSquares[sourceSquare] = {
                background: 'rgba(250, 231, 49, 0.8)'
            };
            newSquares[targetSquare] = {
                background: 'rgba(250, 231, 49, 0.8)'
            };
            setOptionSquares(newSquares);

            // make random cpu move after a short delay
            playMoveSound({moveInfo, isCheck: chessGame.isCheck})

            setTimeout(makeRandomMove, 2000);

            if (chessGame.getGameStatus() === 'white') {
                setDialogWinGame(true);
            }
            // return true as the move was successful
            return true;
        } catch {
            // return false as the move was not successful
            return false;
        }
    }

    // set the chessboard options
    const chessboardOptions = {
        onPieceDrop,
        onSquareClick,
        position: chessGame.position,
        squareStyles: {...optionSquares, ...possibleMovesSquares},
        onMouseOverSquare: (p) => {
            console.log(p)
            if (isDown) {
                onSquareClick(p)
            }
        },
        pieces: customPieces,
        darkSquareStyle: {
            backgroundColor: '#9778B4'
        },
        lightSquareStyle: {
            backgroundColor: '#E7DBF0'
        },
        id: 'click-or-drag-to-move'
    };


    useEffect(() => {
        const down = (e) => {
            if (e.button === 0) {
                setIsDown(true);
            }
        }
        const up = (e) => {
            if (e.button === 0) {
                setIsDown(false);
            }
        }

        // pointer лучше, чем mouse — работает и на тач/пен
        window.addEventListener("pointerdown", down);
        window.addEventListener("pointerup", up);
        window.addEventListener("blur", up); // если окно потеряло фокус — сброс

        return () => {
            window.removeEventListener("pointerdown", down);
            window.removeEventListener("pointerup", up);
            window.removeEventListener("blur", up);
        };
    }, []);

    return <HStack
            w="1150px"
            justify={'center'}
            gap={10}
        >
            <div className={'my-auto'}>
                <PlayerRow />
                <Chessboard options={chessboardOptions} />
                <PlayerRow />
            </div>
            <AnalyseTool />
        </HStack>
}