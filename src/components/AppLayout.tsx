import { type FC } from 'react';
import { Sidebar } from "@/components/Sidebar.tsx";
import { HStack } from "@chakra-ui/react";
import { DialogWinGame } from "@/components/Dialogs";
import { Outlet } from "react-router";

export const AppLayout: FC = () => {
    return <HStack>
        <Sidebar />
        <Outlet />
        <DialogWinGame />
    </HStack>
}