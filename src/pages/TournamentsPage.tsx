import { VStack, Heading } from '@chakra-ui/react';
import { PlaceholderBouncer } from '@/components/PlaceholderBouncer';

export const TournamentsPage = () => {
  return (
    <VStack w="100%" justify={'center'}>
      <Heading color={'white'}>
        The Tournaments Page is under development, but something will be here very soon...
      </Heading>
      <PlaceholderBouncer />
    </VStack>
  );
};
