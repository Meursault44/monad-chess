import type { ReactNode, FC } from 'react';
import { Heading, HStack, VStack, Image } from '@chakra-ui/react';

type AnalyseToolWrapperType = {
  logoSrc: string;
  title: string;
  children?: ReactNode;
};

export const AnalyseToolWrapper: FC<AnalyseToolWrapperType> = ({ logoSrc, title, children }) => {
  return (
    <VStack
      my={'auto'}
      h={'90vh'}
      w={'380px'}
      border={'2px white solid'}
      borderRadius={'10px'}
      position={'relative'}
      bg={'#17171A'}
    >
      <HStack
        background={'rgba(0,0,0,0.3)'}
        w={'100%'}
        height={'80px'}
        justify={'center'}
        padding={'10px 40px'}
        flexShrink={0}
      >
        <Image src={logoSrc} alt="" width={'40px'} />
        <Heading color={'white'} fontSize={'24px'}>
          {title}
        </Heading>
      </HStack>
      {children}
    </VStack>
  );
};
