import type { FC } from 'react';
import { Box, HStack, Image, Text } from '@chakra-ui/react';
import assistent from '@/assets/assistent.png';
import { ThreeDotsWave } from '@/components/ThreeDotsWave.tsx';

type AssistantType = {
  message: string;
  isPending?: boolean;
  minHeight?: string;
};

export const Assistant: FC<AssistantType> = ({ message, isPending = false, minHeight }) => {
  return (
    <HStack
      mx="10px"
      alignItems="flex-end"
      w={'calc(100% - 20px)'}
      minHeight={minHeight ?? '160px'}
    >
      <Image src={assistent} alt="" width={'110px'} />

      <Box
        position="relative"
        flex="1"
        bg="white"
        color="black"
        px="10px"
        py="8px"
        borderRadius="10px"
        boxShadow="md"
        minHeight={'104px'}
        display={'flex'}
        alignItems={'center'}
      >
        <Box w={'100%'} display={'flex'} justifyContent={'center'}>
          {isPending ? (
            <ThreeDotsWave />
          ) : (
            <Text lineHeight="1.2" fontSize="16px">
              {message}
            </Text>
          )}
        </Box>

        {/* хвостик слева — указывает на ассистента */}
        <Box
          as="svg"
          w="15px"
          h="22px"
          position="absolute"
          bottom="20px"
          left="-15px"
          transform="translateY(-50%)"
          color="white" // цвет хвостика = фону пузыря
          pointerEvents="none"
          style={{ filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.06))' }}
          aria-hidden
        >
          <path d="M0 14C8.4 14 12.8333 4.66667 15 0V22C15 22 3.5 22 0 14Z" fill="currentColor" />
        </Box>
      </Box>
    </HStack>
  );
};
