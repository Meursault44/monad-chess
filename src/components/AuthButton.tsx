import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@chakra-ui/react';
import { useAuthStore } from '@/store/auth';

export const AuthButtons = () => {
  const { ready, authenticated, login, logout } = usePrivy();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  if (!ready) return null;

  return authenticated ? (
    <Button
      onClick={async () => {
        logout();
        setAccessToken(null);
      }}
      w={'100%'}
      h={'54px'}
    >
      Logout
    </Button>
  ) : (
    <Button w={'100%'} h={'54px'} onClick={login}>
      Login
    </Button>
  );
};
