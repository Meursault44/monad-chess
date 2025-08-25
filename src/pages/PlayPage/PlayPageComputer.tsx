import { useEffect } from 'react';
import { HStack } from '@chakra-ui/react';
import { AnalyseTool, PlayerRow } from '@/components';
import ChessBoardWrapper from '@/components/ChessBoardWrapper.tsx';
import { useRandomOpponent } from '@/hooks/useRandomOpponent';
import { useChessStore } from '@/store/chess.ts';

export const PlayPageComputer = () => {
  const bot = useRandomOpponent(1500);
  const resetGame = useChessStore((s) => s.resetGame);

  useEffect(() => {
    return () => {
      resetGame();
    };
  }, []);

  return (
    <HStack justify={'center'} gap={'3rem'}>
      <div className="my-auto flex flex-col">
        <PlayerRow />
        <ChessBoardWrapper onOpponentTurn={bot} showDialogWinGame={true} />
        <PlayerRow />
      </div>
      <AnalyseTool />
    </HStack>
  );
};
