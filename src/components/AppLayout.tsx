import { type FC } from 'react';
import { Sidebar } from '@/components/Sidebar.tsx';
import { HStack } from '@chakra-ui/react';
import { DialogWinGame, DialogLoseGame } from '@/components/Dialogs';
import { Outlet } from 'react-router';

export const AppLayout: FC = () => {
  return (
    <HStack gap={'3rem'} paddingRight={'3rem'}>
      <Sidebar />
      <Outlet />
      <DialogWinGame />
      <DialogLoseGame />
    </HStack>
  );
};
