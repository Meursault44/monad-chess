import type { FC } from 'react';
import avatar from '../assets/default_avatar.jpg';
import { Image } from '@chakra-ui/react';
import { HStack } from '@chakra-ui/react';

type PlayerRow = {
  src?: string;
  name: string;
  m?: string;
};

export const PlayerRow: FC<PlayerRow> = ({ src = avatar, name, m }) => {
  return (
    <HStack height={'50px'} margin={m ?? 'auto'}>
      <Image src={src} alt="avatar" h={'100%'} />
      <div className={'text-white'}>{name}</div>
    </HStack>
  );
};
