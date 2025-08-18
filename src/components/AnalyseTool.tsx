import { type FC, useMemo } from 'react';
import { useChessStore } from '../store/chess.ts';
import {Button, VStack} from "@chakra-ui/react"

export const AnalyseTool: FC = () => {
    const history = useChessStore(state => state.history);

    const data = useMemo(() => {
        const tableData = [];

        for (let i = 0; i < history.length; i += 2) {
            tableData.push({
                key: (i / 2) + 1,
                move: (i / 2) + 1,
                wMove: history[i],
                bMove: history[i + 1] || "",
            });
        }
        return tableData
    }, [history])


    return <div className="h-[860px] w-[300px] flex flex-col my-auto bg-[#4E3371] shrink-0">
        <div className={'flex flex-col w-full overflow-y-auto h-[600px]'}>
            {data.map(i => <div key={i.key} className={'flex w-full'}>
                <div className={'flex justify-center grow-0 shrink-0 basis-[13%] bg-[#5B3F7C] text-[#E8DABD]'}>{i.move}</div>
                <div className={'flex justify-center grow-0 shrink-0 basis-[43.5%] text-[#E7DBCC]'}>{i.wMove}</div>
                <div className={'flex content-center grow-0 shrink-0 basis-[43.5%] text-[#E7DBCC]'}>{i.bMove}</div>
            </div>)}
        </div>
        <VStack align="stretch" p={'10px'}>
            <Button>Play</Button>
        </VStack>
    </div>
}