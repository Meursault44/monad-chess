import { HStack } from '@chakra-ui/react';
import { AnalyseTool, PlayerRow } from '@/components';
import ChessBoardWrapper from '@/components/ChessBoardWrapper.tsx';
import { useRandomOpponent } from '@/hooks/useRandomOpponent';

export const HomePage = () => {
  const bot = useRandomOpponent(1500);

  return (
    <HStack w="1150px" justify={'center'} gap={10}>
      <div className="my-auto flex flex-col">
        <PlayerRow />
        <ChessBoardWrapper onOpponentTurn={bot} showDialogWinGame={true} />
        <PlayerRow />
      </div>
      <AnalyseTool />
    </HStack>
  );
};
