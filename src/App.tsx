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

function App() {
  const { ready, authenticated, user } = usePrivy();
  const { mutateAsync } = useLoginMutation();

  const userAddress = useMemo(
    () =>
      user?.linkedAccounts.find((i) => i?.providerApp?.id === 'cmd8euall0037le0my79qpz42')
        ?.embeddedWallets[0]?.address,
    [user],
  );

  useEffect(() => {
    if (authenticated && ready && user?.id && userAddress) {
      //  && !getAccessToken() - add
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
  }, [authenticated, ready, user, userAddress, mutateAsync]);

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
