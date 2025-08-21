import avatar from '../assets/Asuka.jpg';
import { Image } from '@chakra-ui/react';

export const PlayerRow = () => {
  return (
    <div className={'flex h-[50px] gap-2'}>
      <Image src={avatar} alt="avatar" h={'100%'} />
      <div className={'text-white'}>Asuka Langley</div>
      <div className={'text-white opacity-[0.6]'}>(800)</div>
    </div>
  );
};
