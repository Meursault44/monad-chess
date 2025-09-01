import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@chakra-ui/react';
import { useAuthStore } from '@/store/auth';
import { profileUpdateRating } from '@/api/profile.ts';
import { useLoginMutation } from '@/api/auth';
import { useMemo } from 'react';

export const AuthButtons = () => {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { mutateAsync } = useLoginMutation();

  const userAddress = useMemo(
    () =>
      user?.linkedAccounts.find((i) => i?.providerApp?.id === 'cmd8euall0037le0my79qpz42')
        ?.embeddedWallets[0]?.address,
    [user?.linkedAccounts],
  );

  if (!ready) return null;

  return authenticated && accessToken ? (
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
    <Button
      w={'100%'}
      h={'54px'}
      onClick={() => {
        if (!authenticated) {
          login();
        } else {
          if (authenticated && ready && user?.id && userAddress) {
            mutateAsync({
              provider: 'monad',
              providerAppId: user?.id,
              providerUserId: userAddress,
            })
              .then(async () => {
                profileUpdateRating();
              })
              .catch((e) => {
                console.error('Login mutation error', e);
              });
          }
        }
      }}
    >
      Login
    </Button>
  );
};
