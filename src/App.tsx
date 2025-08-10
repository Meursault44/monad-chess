import './App.css'
import { Chessboard, defaultPieces } from 'react-chessboard';
import { useRef, useState } from 'react';
import { Chess } from 'chess.js'
import wP from './assets/BillMonday.png'
import bP from './assets/Keone.png'
import wN from './assets/whiteKnight.png'
import bN from './assets/blackKnight.png'
import wB from './assets/whiteBishop.png'
import bB from './assets/blackBishop.png'

function App() {
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;

    const customPieces = {
        ...defaultPieces,
        // exported from react-chessboard
        wP: () => <img src={wP} style={{width: '70%'}} alt="white Pawn"/>,
        bP: () => <img src={bP} style={{width: '70%'}} alt="black Pawn"/>,
        wN: () => <img src={wN} style={{width: '105%'}} alt="white knight"/>,
        bN: () => <img src={bN} style={{width: '105%'}} alt="black knight"/>,
        wB: () => <img src={wB} style={{width: '65%'}} alt="white bishop"/>,
        bB: () => <img src={bB} style={{width: '65%'}} alt="blac bishop"/>,
    };
    // track the current position of the chess game in state to trigger a re-render of the chessboard
    const [chessPosition, setChessPosition] = useState(chessGame.fen());

    // make a random "CPU" move
    function makeRandomMove() {
        // get all possible moves`
        const possibleMoves = chessGame.moves();

        // exit if the game is over
        if (chessGame.isGameOver()) {
            return;
        }

        // pick a random move
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

        // make the move
        chessGame.move(randomMove);

        // update the position state
        setChessPosition(chessGame.fen());
    }

    // handle piece drop
    function onPieceDrop({
                             sourceSquare,
                             targetSquare
                         }) {
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

            // make random cpu move after a short delay
            setTimeout(makeRandomMove, 500);

            // return true as the move was successful
            return true;
        } catch {
            // return false as the move was not successful
            return false;
        }
    }

    // set the chessboard options
    const chessboardOptions = {
        position: chessPosition,
        onPieceDrop,
        id: 'play-vs-random',
        pieces: customPieces,
        darkSquareStyle: {
            backgroundColor: '#9778B4'
        },
        lightSquareStyle: {
            backgroundColor: '#E7DBF0'
        }
    };
  return (
    <div style={{width: '60%', margin: 'auto'}}>
       <Chessboard options={chessboardOptions} />
    </div>
  )
}

export default App
