import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@chakra-ui/react';

export const AuthButtons = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();
  if (!ready) return null;

  return authenticated ? (
    <Button onClick={logout} m={'40px 25px'} h={'54px'}>
      Logout
    </Button>
  ) : (
    <Button m={'40px 25px'} h={'54px'} onClick={login}>
      Login
    </Button>
  );
};
