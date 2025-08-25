import { VStack } from '@chakra-ui/react';
import { Link as ChakraLink, Image } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';
import HorizontalLogo from '/HorizontalLogo.svg';
import PuzzleLogo from '/puzzle2.png';
import play from '/play.png';
import bots from '/bots.png';
import tournaments from '/tournaments.png';

import { AuthButtons } from '@/components/AuthButton.tsx';

export const Sidebar = () => {
  return (
    <VStack
      h="100vh"
      w="210px"
      bg="#25232C"
      justify="space-between"
      color={'white'}
      borderRadius={'0 15px 15px 0'}
      align="stretch"
    >
      <VStack align="stretch" justify={'center'}>
        <ChakraLink
          as={RouterLink}
          to="/"
          color={'white'}
          display={'flex'}
          justifyContent={'center'}
          padding={'30px 0 20px 0'}
        >
          <Image src={HorizontalLogo} alt="icon" width={'140px'} />
        </ChakraLink>
        <ChakraLink
          as={RouterLink}
          to="/"
          color={'white'}
          p={'10px'}
          gap={'0.5rem'}
          height={'50px'}
          _hover={{
            backgroundColor: '#1E1C24',
            textDecoration: 'none',
          }}
          _focus={{
            outline: 'none',
          }}
        >
          <Image src={play} alt="" width="40px" /> Play online
        </ChakraLink>
        <ChakraLink
          as={RouterLink}
          to="/play/computer"
          color={'white'}
          height={'50px'}
          p={'10px'}
          gap={'0.5rem'}
          _hover={{
            backgroundColor: '#1E1C24',
            textDecoration: 'none',
          }}
          _focus={{
            outline: 'none',
          }}
        >
          <Image src={bots} alt="" width="39px" ml={'2px'} /> Play bots
        </ChakraLink>
        <ChakraLink
          as={RouterLink}
          to="/puzzles"
          color={'white'}
          height={'50px'}
          p={'10px'}
          gap={'0.5rem'}
          _hover={{
            backgroundColor: '#1E1C24',
            textDecoration: 'none',
          }}
          _focus={{
            outline: 'none',
          }}
        >
          <Image src={PuzzleLogo} alt="" width="37px" ml={'4px'} />
          Puzzles
        </ChakraLink>
        <ChakraLink
          as={RouterLink}
          to="/"
          height={'50px'}
          color={'white'}
          p={'10px'}
          gap={'0.5rem'}
          _hover={{
            backgroundColor: '#1E1C24',
            textDecoration: 'none',
          }}
          _focus={{
            outline: 'none',
          }}
        >
          <Image src={tournaments} alt="" width="34px" ml={'6px'} pr={'6px'} /> Tournaments
        </ChakraLink>
      </VStack>
      <AuthButtons />
    </VStack>
  );
};
