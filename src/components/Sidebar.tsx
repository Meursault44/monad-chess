import { VStack, HStack } from '@chakra-ui/react';
import { Link as ChakraLink, Image } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';
import Logo from '/Logo.png';
import PuzzleLogo from '/puzzle2.png';
import play from '/play.png';
import bots from '/bots.png';
import tournaments from '/tournaments.png';
import profile from '/profile.svg';

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
      flexShrink={0}
    >
      <VStack align="stretch" justify={'center'}>
        <ChakraLink
          as={RouterLink}
          to="/"
          color={'white'}
          display={'flex'}
          padding={'30px 10px 20px 10px'}
          _hover={{
            textDecoration: 'none',
          }}
          _focus={{
            outline: 'none',
          }}
        >
          <Image src={Logo} alt="icon" width={'50px'} />
          Monad-Chess
        </ChakraLink>
        <ChakraLink
          as={RouterLink}
          to="/play"
          color={'white'}
          p={'10px'}
          gap={'0.5rem'}
          fontSize={'18px'}
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
          gap={'0.4rem'}
          fontSize={'18px'}
          _hover={{
            backgroundColor: '#1E1C24',
            textDecoration: 'none',
          }}
          _focus={{
            outline: 'none',
          }}
        >
          <Image src={bots} alt="" width="39px" ml={'2px'} />
          Play bots
        </ChakraLink>
        <ChakraLink
          as={RouterLink}
          to="/puzzles"
          color={'white'}
          height={'50px'}
          p={'10px'}
          gap={'0.5rem'}
          fontSize={'18px'}
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
          to="/profile"
          height={'50px'}
          color={'white'}
          p={'10px'}
          gap={'0.4rem'}
          fontSize={'18px'}
          _hover={{
            backgroundColor: '#1E1C24',
            textDecoration: 'none',
          }}
          _focus={{
            outline: 'none',
          }}
        >
          <Image src={profile} alt="" width="36px" ml={'6px'} pr={'4px'} /> Profile
        </ChakraLink>
        <ChakraLink
          as={RouterLink}
          to="/tournaments"
          height={'50px'}
          color={'white'}
          p={'10px'}
          gap={'0.5rem'}
          fontSize={'18px'}
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
      <HStack mb={'40px'} p={'0 20px'} display={'flex'} justifyContent={'center'}>
        <AuthButtons />
      </HStack>
    </VStack>
  );
};
