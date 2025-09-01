import { Box, HStack, VStack, Text, Image } from '@chakra-ui/react';
import { wP, bP } from '@/assets/pieces'; // белый/чёрный король

type Side = 'w' | 'b' | null;

export const PlayAsPicker = ({ value, onChange }: { value: Side; onChange: (v: Side) => void }) => {
  const Item = ({
    label,
    isActive,
    onClick,
    icon,
  }: {
    label: string;
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
  }) => (
    <VStack
      as="button"
      type="button"
      onClick={onClick}
      gap="1"
      p="2"
      rounded="lg"
      w="64px"
      h="64px"
      justify="center"
      bg={isActive ? 'rgba(101, 213, 110, 0.12)' : '#25232C'}
      borderWidth="2px"
      borderColor={isActive ? 'green.400' : 'transparent'}
      outline={isActive ? '2px solid rgba(101, 213, 110, 0.5)' : 'none'}
      _hover={{ bg: isActive ? 'rgba(101, 213, 110, 0.18)' : '#4F4372' }}
      transition="all 120ms ease"
      cursor="pointer"
    >
      {icon}
      <Text fontSize="xs" color="whiteAlpha.700">
        {label}
      </Text>
    </VStack>
  );

  return (
    <HStack gap="3">
      <Item
        label="White"
        isActive={value === 'w'}
        onClick={() => onChange('w')}
        icon={<Image src={wP} alt="White" boxSize="28px" />}
      />
      <Item
        label="Random"
        isActive={value === null}
        onClick={() => onChange(null)}
        icon={
          <Box
            boxSize="28px"
            rounded="sm"
            bg="white"
            color="#25232C"
            fontWeight="900"
            display="grid"
            placeItems="center"
          >
            ?
          </Box>
        }
      />
      <Item
        label="Black"
        isActive={value === 'b'}
        onClick={() => onChange('b')}
        icon={<Image src={bP} alt="Black" boxSize="28px" />}
      />
    </HStack>
  );
};
