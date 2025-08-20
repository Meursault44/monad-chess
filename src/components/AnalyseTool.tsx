import { type FC, useMemo } from 'react';
import { useChessStore } from '../store/chess.ts';
import { Button, VStack, Text } from '@chakra-ui/react';

export const AnalyseTool: FC = () => {
    const timeline = useChessStore(s => s.timelineSan); // полный список
    const currentPly = useChessStore(s => s.currentPly); // текущая позиция
    console.log(currentPly)
    const turn = useChessStore(s => s.turn);

    const undo = useChessStore(s => s.undo);
    const redo = useChessStore(s => s.redo);
    const goToPly = useChessStore(s => s.goToPly);

    const data = useMemo(() => {
        const tableData: Array<{
            key: number;
            move: number;
            wMove: string | '';
            bMove: string | '';
            whitePly: number;
            blackPly: number;
        }> = [];
        for (let i = 0; i < timeline.length; i += 2) {
            const row = i / 2;
            tableData.push({
                key: row + 1,
                move: row + 1,
                wMove: timeline[i] ?? '',
                bMove: timeline[i + 1] ?? '',
                whitePly: i + 1, // ply нумеруем с 1 для «подсветки последнего»
                blackPly: i + 2,
            });
        }
        return tableData;
    }, [timeline]);

    return (
        <div className="h-[860px] w-[300px] flex flex-col my-auto bg-[#4E3371] shrink-0">
            <div className="flex flex-col w-full overflow-y-auto h-[600px]">
                {data.map((i) => {

                    const whiteActive = currentPly === i.whitePly;
                    const blackActive = currentPly === i.blackPly;

                    console.log(blackActive)

                    return (
                        <div key={i.key} className="flex w-full gap-5">
                            <div className="flex justify-center grow-0 shrink-0 basis-[13%] bg-[#5B3F7C] text-[#E8DABD] w-[30px]">
                                {i.move}
                            </div>
                            <div
                                onClick={() => goToPly(i.whitePly)}
                                className={`cursor-pointer text-white ${whiteActive && 'bg-amber-500'} w-[40px] text-center`}
                            >
                                {i.wMove}
                            </div>

                            <div
                                onClick={() => i.bMove && goToPly(i.blackPly)}
                                className={`cursor-pointer text-white ${blackActive && 'bg-amber-500'} w-[40px] text-center`}
                            >
                                {i.bMove}
                            </div>
                        </div>
                    );
                })}
            </div>

            <VStack align="stretch" p="10px">
                <Button size="sm" onClick={() => undo()}>&larr; Назад</Button>
                <Button size="sm" onClick={() => redo()}>&rarr; Вперёд</Button>
                <Text color="white">{turn === 'w' ? "Your move" : "Opponent's move"}</Text>
            </VStack>
        </div>
    );
};
