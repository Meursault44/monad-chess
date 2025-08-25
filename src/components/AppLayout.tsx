import { type FC } from 'react';
import { Sidebar } from '@/components/Sidebar.tsx';
import { HStack } from '@chakra-ui/react';
import { DialogWinGame, DialogSolvedPuzzle } from '@/components/Dialogs';
import { Outlet } from 'react-router';

export const AppLayout: FC = () => {
  return (
    <HStack gap={'3rem'}>
      <Sidebar />
      <Outlet />
      <DialogWinGame />
      <DialogSolvedPuzzle />
    </HStack>
  );
};
