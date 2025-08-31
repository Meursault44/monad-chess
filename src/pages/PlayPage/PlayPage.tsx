import { Heading, VStack } from '@chakra-ui/react';
import { PlaceholderBouncer } from '@/components/PlaceholderBouncer.tsx';

export const PlayPage = () => {
  return (
    <VStack w="100%" justify={'center'}>
      <Heading color={'white'}>
        The Play Online Page is under development, but something will be here very soon...
      </Heading>
      <PlaceholderBouncer />
    </VStack>
  );
};
