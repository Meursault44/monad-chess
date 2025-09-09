import { Routes, Route } from 'react-router';
import { AppLayout } from '@/components';
import {
  HomePage,
  PuzzlesPage,
  PlayPageComputer,
  ReviewGamePage,
  TournamentsPage,
  PlayPage,
  ProfilePage,
} from '@/pages';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useMemo } from 'react';
import { useLoginMutation } from '@/api/auth';
import { profileUpdateRating } from '@/api/profile.ts';
import { useQuery } from '@tanstack/react-query';
import { checkWallet } from '@/api/monadGamesIdWallet.ts';
import { useAuthStore } from '@/store/auth.ts';
import { useDialogsStore } from '@/store/dialogs.ts';

function App() {
  const { ready, authenticated, user } = usePrivy();
  const { mutateAsync } = useLoginMutation();
  const setUserName = useAuthStore((s) => s.setUserName);
  const { setDialogLogin } = useDialogsStore();

  const userAddress = useMemo(
    () =>
      user?.linkedAccounts.find((i) => i?.providerApp?.id === 'cmd8euall0037le0my79qpz42')
        ?.embeddedWallets[0]?.address,
    [user],
  );

  const { data: walletCheck, isFetching } = useQuery({
    queryKey: ['checkWallet', userAddress],
    queryFn: () => checkWallet(userAddress!), // передаём address в API функцию
    enabled: !!userAddress, // чтобы не дергался запрос без адреса
  });

  console.log(walletCheck);
  console.log(user);

  useEffect(() => {
    if (walletCheck?.hasUsername) {
      setUserName(walletCheck?.user?.username);
      setDialogLogin(false);
    }
    if (!isFetching && !walletCheck?.hasUsername) {
      setUserName(null);
    }
  }, [walletCheck?.user?.username, isFetching]);

  useEffect(() => {
    if (authenticated && ready && user?.id && userAddress && walletCheck?.user?.username) {
      //  && !accessToken - add
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
  }, [authenticated, ready, user, userAddress, mutateAsync, walletCheck?.user?.username]);

  return (
    <Routes>
      {/* корневой layout для всех страниц */}
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="puzzles" element={<PuzzlesPage />} />
        <Route path="tournaments" element={<TournamentsPage />} />
        <Route path="play" element={<PlayPage />}></Route>
        <Route path="profile" element={<ProfilePage />}></Route>
        <Route path="play/computer" element={<PlayPageComputer />}></Route>
        <Route path="play/computer/review/:id" element={<ReviewGamePage />} />
        <Route path="*" element={<h1>404</h1>} />
      </Route>
    </Routes>
  );
}

export default App;
