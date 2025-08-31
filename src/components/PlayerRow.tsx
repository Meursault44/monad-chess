import type { FC } from 'react';
import avatar from '../assets/Asuka.jpg';
import { Image } from '@chakra-ui/react';
import { HStack } from '@chakra-ui/react';

type PlayerRow = {
  src?: string;
  m?: string;
};

export const PlayerRow: FC<PlayerRow> = ({ src = avatar, m }) => {
  return (
    <HStack height={'40px'} margin={m ?? 'auto'}>
      <Image src={src} alt="avatar" h={'100%'} />
      <div className={'text-white'}>Asuka Langley</div>
    </HStack>
  );
};
