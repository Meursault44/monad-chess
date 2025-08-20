import { HStack } from '@chakra-ui/react';
import { AnalyseTool, PlayerRow } from '@/components';
import ChessBoardWithLogic from '@/components/ChessBoardWrapper.tsx';

export const HomePage = () => {
    return (
        <HStack w="1150px" justify={'center'} gap={10}>
            <div className="my-auto flex flex-col">
                <PlayerRow />
                <ChessBoardWithLogic />
                <PlayerRow />
            </div>
            <AnalyseTool />
        </HStack>
    );
};
