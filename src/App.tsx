import { Chessboard, defaultPieces, type SquareHandlerArgs, type PieceDropHandlerArgs } from 'react-chessboard';
import { useRef, useState, useEffect } from 'react';
import { Chess, type Square } from 'chess.js'
import wP from './assets/wP.png'
import bP from './assets/bP.png'
import wN from './assets/wN.png'
import bN from './assets/bN.png'
import wB from './assets/wB.png'
import bB from './assets/bB.png'
import wK from './assets/wK.png'
import bK from './assets/bK.png'
import wR from './assets/wR.png'
import bR from './assets/bR.png'
import { AnalyseTool } from './components'
import bQ from './assets/bQ.png'
import wQ from './assets/wQ.png';

function App() {
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;

    // track the current position of the chess game in state to trigger a re-render of the chessboard
    const [chessPosition, setChessPosition] = useState(chessGame.fen());
    const [moveFrom, setMoveFrom] = useState('');
    const [possibleMovesSquares, setPossibleMovesSquares] = useState({});
    const [optionSquares, setOptionSquares] = useState({});
    const [history, setHistory] = useState<string[]>([])

    const customPieces = {
        ...defaultPieces,
        // exported from react-chessboard
        wP: () => <img src={wP} style={{width: '80%', marginTop: '8px'}} alt="white Pawn"/>,
        bP: () => <img src={bP} style={{width: '80%', marginTop: '8px'}} alt="black Pawn"/>,
        wN: () => <img src={wN} style={{width: '105%'}} alt="white knight"/>,
        bN: () => <img src={bN} style={{width: '105%'}} alt="black knight"/>,
        wB: () => <img src={wB} style={{width: '90%', marginTop: '3px'}} alt="white bishop"/>,
        bB: () => <img src={bB} style={{width: '90%', marginTop: '3px'}} alt="blac bishop"/>,
        wK: () => <img src={wK} style={{width: '82%', margin: 'auto'}} alt="white king"/>,
        bK: () => <img src={bK} style={{width: '82%', margin: 'auto'}} alt="black king"/>,
        wQ: () => <img src={wQ} style={{width: '73%', margin: 'auto'}} alt="white queen"/>,
        bQ: () => <img src={bQ} style={{width: '73%', margin: 'auto'}} alt="black queen"/>,
        wR: () => <img src={wR} style={{width: '90%', marginLeft: '8px', marginTop: '8px'}} alt="white rook"/>,
        bR: () => <img src={bR} style={{width: '90%', marginLeft: '8px', marginTop: '8px'}} alt="black rook"/>,
    };

    const [isDown, setIsDown] = useState(false);



    // make a random "CPU" move
    function makeRandomMove() {
        // get all possible moves`
        const possibleMoves = chessGame.moves({ verbose: true });

        // exit if the game is over
        if (chessGame.isGameOver()) {
            return;
        }

        // pick a random move
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

        // make the move
        chessGame.move({ from: randomMove.from, to: randomMove.to, promotion: 'q' });
        setOptionSquares({
            [randomMove.from]: { background: 'rgba(250, 231, 49, 0.8)' },
            [randomMove.to]:   { background: 'rgba(250, 231, 49, 0.8)' },
        });


        // update the position state
        setChessPosition(chessGame.fen());
        setHistory(chessGame.history())
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
        console.log('a')
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
            chessGame.move({
                from: moveFrom,
                to: square,
                promotion: 'q'
            });
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

        // update the position state
        setChessPosition(chessGame.fen());
        setHistory(chessGame.history())

        // make random cpu move after a short delay
        setTimeout(makeRandomMove, 300);

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
            chessGame.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q' // always promote to a queen for example simplicity
            });

            // update the position state upon successful move to trigger a re-render of the chessboard
            setChessPosition(chessGame.fen());
            setHistory(chessGame.history())

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
            setTimeout(makeRandomMove, 2000);

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
        position: chessPosition,
        squareStyles: {...optionSquares, ...possibleMovesSquares},
        onMouseOverSquare: (p) => {
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

    console.log(chessGame.history())

    useEffect(() => {
        const down = () => setIsDown(true);
        const up = () => setIsDown(false);

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

  return (
      <div className={'flex h-[100vh] w-[100%] gap-6 justify-center'}>
          <div className={'w-[840px] h-[840px] my-auto'}>
              <Chessboard options={chessboardOptions} />
          </div>
          <AnalyseTool history={history} />
      </div>
  )
}

export default App
