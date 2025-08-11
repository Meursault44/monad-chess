import './App.css'
import { Chessboard, defaultPieces } from 'react-chessboard';
import { useRef, useState } from 'react';
import { Chess } from 'chess.js'
import wP from './assets/wP.png'
import bP from './assets/bP.png'
import wN from './assets/wN.png'
import bN from './assets/bN.png'
import wB from './assets/wB.png'
import bB from './assets/bB.png'
import wK from './assets/mikeWK.png'
import bK from './assets/bK.png'
import wR from './assets/wR.png'
import bR from './assets/bR.png'

function App() {
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;

    const customPieces = {
        ...defaultPieces,
        // exported from react-chessboard
        wP: () => <img src={wP} style={{width: '80%', marginTop: '8px'}} alt="white Pawn"/>,
        bP: () => <img src={bP} style={{width: '80%', marginTop: '8px'}} alt="black Pawn"/>,
        wN: () => <img src={wN} style={{width: '105%'}} alt="white knight"/>,
        bN: () => <img src={bN} style={{width: '105%'}} alt="black knight"/>,
        wB: () => <img src={wB} style={{width: '90%', marginTop: '3px'}} alt="white bishop"/>,
        bB: () => <img src={bB} style={{width: '90%', marginTop: '3px'}} alt="blac bishop"/>,
        wK: () => <img src={wK} style={{width: '72%'}} alt="white king"/>,
        bK: () => <img src={bK} style={{width: '82%'}} alt="black king"/>,
        wR: () => <img src={wR} style={{width: '90%', marginLeft: '8px', marginTop: '8px'}} alt="white rook"/>,
        bR: () => <img src={bR} style={{width: '90%', marginLeft: '8px', marginTop: '8px'}} alt="black rook"/>,
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
