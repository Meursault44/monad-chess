import { wP, bP, wN, bN, wB, bB, wK, bK, wR, bR, bQ, wQ } from '../assets/pieces';

export const useCustomPieces = () => {
  const customPieces = {
    wP: () => <img src={wP} style={{width: '80%', margin: 'auto', marginTop: '8px'}} alt="white Pawn"/>,
    bP: () => <img src={bP} style={{width: '80%', margin: 'auto', marginTop: '8px'}} alt="black Pawn"/>,
    wN: () => <img src={wN} style={{width: '105%'}} alt="white knight"/>,
    bN: () => <img src={bN} style={{width: '105%'}} alt="black knight"/>,
    wB: () => <img src={wB} style={{width: '90%', marginTop: '3px'}} alt="white bishop"/>,
    bB: () => <img src={bB} style={{width: '90%', marginTop: '3px'}} alt="blac bishop"/>,
    wK: () => <img src={wK} style={{width: '82%', margin: 'auto'}} alt="white king"/>,
    bK: () => <img src={bK} style={{width: '82%', margin: 'auto'}} alt="black king"/>,
    wQ: () => <img src={wQ} style={{width: '73%', margin: 'auto'}} alt="white queen"/>,
    bQ: () => <img src={bQ} style={{width: '73%', margin: 'auto'}} alt="black queen"/>,
    wR: () => <img src={wR} style={{width: '90%', marginLeft: '8px', marginTop: '8px'}} alt="white rook"/>,
    bR: () => <img src={bR} style={{width: '90%', marginLeft: '8px', marginTop: '8px'}} alt="black rook"/>
  };

  return customPieces;
};