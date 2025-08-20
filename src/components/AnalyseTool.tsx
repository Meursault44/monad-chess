import { type FC, useMemo, useState, useEffect } from 'react';
import { useChessStore } from '../store/chess.ts';
import { Button, VStack, Text, HStack, RadioGroup, Separator } from '@chakra-ui/react';

const sideItems = [
    { label: 'White',  value: 'w' as const },
    { label: 'Black',  value: 'b' as const },
    { label: 'Random', value: 'random' as const },
];

export const AnalyseTool: FC = () => {
    const timeline   = useChessStore(s => s.timelineSan);
    const currentPly = useChessStore(s => s.currentPly);
    const turn       = useChessStore(s => s.turn);

    // управление партией (из стора)
    const phase      = useChessStore(s => s.phase);        // 'idle' | 'playing' | 'finished'
    const playerSide = useChessStore(s => s.playerSide);   // 'w' | 'b' | null
    const setPlayer  = useChessStore(s => s.setPlayerSide);
    const startGame  = useChessStore(s => s.startGame);
    const resetGame  = useChessStore(s => s.resetGame);

    const undo       = useChessStore(s => s.undo);
    const redo       = useChessStore(s => s.redo);
    const goToPly    = useChessStore(s => s.goToPly);

    const [choice, setChoice] = useState<'w' | 'b' | 'random'>('random');
    useEffect(() => {
        if (phase !== 'playing') setChoice('random');
    }, [phase]);

    const data = useMemo(() => {
        const rows: Array<{
            key: number; move: number; wMove: string | ''; bMove: string | '';
            whitePly: number; blackPly: number;
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
        <div className="h-[860px] w-[300px] flex flex-col my-auto bg-[#4E3371] shrink-0">
            {/* Панель управления */}
            <VStack align="stretch" p="10px" spacing="8px">
                <Text color="white" fontWeight="bold">Game control</Text>

                {/* ✅ Новый Radio API из Chakra v3 */}
                <RadioGroup.Root
                    value={choice}
                    onValueChange={(e) => {
                        const v = e.value as 'w' | 'b' | 'random';
                        setChoice(v);
                        // чтобы доска переворачивалась ещё до старта партии
                        if (phase !== 'playing') setPlayer(v);
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
                        onClick={() => { setPlayer(choice); startGame(); }}
                        disabled={phase === 'playing'}
                    >
                        Start game
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        colorScheme="red"
                        onClick={resetGame}
                    >
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
            <div className="flex flex-col w-full overflow-y-auto h-[520px]">
                {data.map((i) => {
                    const whiteActive = currentPly === i.whitePly;
                    const blackActive = currentPly === i.blackPly;
                    return (
                        <div key={i.key} className="flex w-full gap-5">
                            <div className="flex justify-center grow-0 shrink-0 basis-[13%] bg-[#5B3F7C] text-[#E8DABD] w-[30px]">
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
                <Button size="sm" onClick={() => undo()}>&larr; Назад</Button>
                <Button size="sm" onClick={() => redo()}>&rarr; Вперёд</Button>
                <Text color="white">{turn === 'w' ? "Your move" : "Opponent's move"}</Text>
            </VStack>
        </div>
    );
};
