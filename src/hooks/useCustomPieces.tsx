import { Image } from '@chakra-ui/react';
import { wP, bP, wN, bN, wB, bB, wK, bK, wR, bR, bQ, wQ } from '../assets/pieces';

export const useCustomPieces = () => {
  const customPieces = {
    wP: () => (
      <Image src={wP} style={{ width: '80%', margin: 'auto', marginTop: '8px' }} alt="white Pawn" />
    ),
    bP: () => (
      <Image src={bP} style={{ width: '80%', margin: 'auto', marginTop: '8px' }} alt="black Pawn" />
    ),
    wN: () => <Image src={wN} style={{ width: '105%' }} alt="white knight" />,
    bN: () => <Image src={bN} style={{ width: '105%' }} alt="black knight" />,
    wB: () => <Image src={wB} style={{ width: '90%', marginTop: '3px' }} alt="white bishop" />,
    bB: () => <Image src={bB} style={{ width: '90%', marginTop: '3px' }} alt="blac bishop" />,
    wK: () => <Image src={wK} style={{ width: '82%', margin: 'auto' }} alt="white king" />,
    bK: () => <Image src={bK} style={{ width: '82%', margin: 'auto' }} alt="black king" />,
    wQ: () => <Image src={wQ} style={{ width: '73%', margin: 'auto' }} alt="white queen" />,
    bQ: () => <Image src={bQ} style={{ width: '73%', margin: 'auto' }} alt="black queen" />,
    wR: () => (
      <Image
        src={wR}
        style={{ width: '90%', marginLeft: '8px', marginTop: '8px' }}
        alt="white rook"
      />
    ),
    bR: () => (
      <Image
        src={bR}
        style={{ width: '90%', marginLeft: '8px', marginTop: '8px' }}
        alt="black rook"
      />
    ),
  };

  return customPieces;
};
