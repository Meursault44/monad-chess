import { type FC, useMemo, useState, useEffect } from 'react';
import { useChessStore } from '../store/chess.ts';
import { Button, VStack, Text, HStack, RadioGroup, Separator } from '@chakra-ui/react';

const sideItems = [
  { label: 'White', value: 'w' as const },
  { label: 'Black', value: 'b' as const },
  { label: 'Random', value: 'random' as const },
];

type AnalyseToolType = {
  startGame: () => void;
};

export const AnalyseTool: FC<AnalyseToolType> = ({ startGame }) => {
  const timeline = useChessStore((s) => s.timelineSan);
  const currentPly = useChessStore((s) => s.currentPly);
  const turn = useChessStore((s) => s.turn);

  // управление партией (из стора)
  const phase = useChessStore((s) => s.phase); // 'idle' | 'playing' | 'finished'
  const playerSide = useChessStore((s) => s.playerSide); // 'w' | 'b' | null
  const setPlayer = useChessStore((s) => s.setPlayerSide);
  const resetGame = useChessStore((s) => s.resetGame);

  const undo = useChessStore((s) => s.undo);
  const redo = useChessStore((s) => s.redo);
  const goToPly = useChessStore((s) => s.goToPly);

  const data = useMemo(() => {
    const rows: Array<{
      key: number;
      move: number;
      wMove: string | '';
      bMove: string | '';
      whitePly: number;
      blackPly: number;
    }> = [];
    for (let i = 0; i < timeline.length; i += 2) {
      const row = i / 2;
      rows.push({
        key: row + 1,
        move: row + 1,
        wMove: timeline[i] ?? '',
        bMove: timeline[i + 1] ?? '',
        whitePly: i + 1,
        blackPly: i + 2,
      });
    }
    return rows;
  }, [timeline]);

  return (
    <div className="my-auto flex h-[860px] w-[300px] shrink-0 flex-col bg-[#4E3371]">
      {/* Панель управления */}
      <VStack align="stretch" p="10px" spacing="8px">
        <Text color="white" fontWeight="bold">
          Game control
        </Text>

        {/* ✅ Новый Radio API из Chakra v3 */}
        <RadioGroup.Root
          disabled={phase === 'playing'}
          onValueChange={(e) => {
            const v = e.value as 'w' | 'b' | 'random';
            setPlayer(v);
          }}
        >
          <HStack gap="3">
            {sideItems.map((item) => (
              <RadioGroup.Item key={item.value} value={item.value}>
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>{item.label}</RadioGroup.ItemText>
              </RadioGroup.Item>
            ))}
          </HStack>
        </RadioGroup.Root>

        <div className="flex gap-2">
          <Button
            size="sm"
            colorScheme="purple"
            onClick={() => {
              startGame();
            }}
            disabled={phase === 'playing'}
          >
            Start game
          </Button>
          <Button size="sm" variant="outline" colorScheme="red" onClick={resetGame}>
            Reset
          </Button>
        </div>

        <Text color="white" fontSize="sm" opacity={0.9}>
          Status: {phase === 'playing' ? 'Playing' : 'Not started'}
          {playerSide ? ` • You: ${playerSide === 'w' ? 'White' : 'Black'}` : ''}
        </Text>
      </VStack>

      <Separator my="2" borderColor="#5B3F7C" />

      {/* Список ходов */}
      <div className="flex h-[520px] w-full flex-col overflow-y-auto">
        {data.map((i) => {
          const whiteActive = currentPly === i.whitePly;
          const blackActive = currentPly === i.blackPly;
          return (
            <div key={i.key} className="flex w-full gap-5">
              <div className="flex w-[30px] shrink-0 grow-0 basis-[13%] justify-center bg-[#5B3F7C] text-[#E8DABD]">
                {i.move}
              </div>
              <div
                onClick={() => goToPly(i.whitePly)}
                className={`cursor-pointer text-white ${whiteActive ? 'bg-amber-500' : ''} w-[40px] text-center`}
              >
                {i.wMove}
              </div>
              <div
                onClick={() => i.bMove && goToPly(i.blackPly)}
                className={`cursor-pointer text-white ${blackActive ? 'bg-amber-500' : ''} w-[40px] text-center`}
              >
                {i.bMove}
              </div>
            </div>
          );
        })}
      </div>

      {/* Навигация */}
      <VStack align="stretch" p="10px" spacing="8px">
        <Button size="sm" onClick={() => undo()}>
          &larr; Назад
        </Button>
        <Button size="sm" onClick={() => redo()}>
          &rarr; Вперёд
        </Button>
        <Text color="white">{turn === 'w' ? 'Your move' : "Opponent's move"}</Text>
      </VStack>
    </div>
  );
};
