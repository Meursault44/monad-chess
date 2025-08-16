import { type ReactNode, type FC } from 'react';
import { Sidebar } from "@/components/Sidebar.tsx";
import { HStack } from "@chakra-ui/react";
import { DialogWinGame } from "@/components/Dialogs";

type AppLayoutType = {
    children: ReactNode;
}

export const AppLayout: FC<AppLayoutType> = ({ children }) => {
    return <HStack>
        <Sidebar />
        {children}
        <DialogWinGame />
    </HStack>
}