import { Routes, Route } from 'react-router';
import { AppLayout } from '@/components';
import {
  HomePage,
  PuzzlesPage,
  PlayPageComputer,
  ReviewGamePage,
  TournamentsPage,
  PlayPage,
} from '@/pages';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useRef } from 'react';
import { useLoginMutation } from '@/api/auth';
import { getAccessToken } from '@/store/auth.ts';

function App() {
  const { ready, authenticated, user } = usePrivy();
  const { mutateAsync } = useLoginMutation();
  const didLoginRef = useRef(false);

  useEffect(() => {
    if (didLoginRef.current) return;
    console.log(user);
    if (authenticated && ready && user?.id && user?.wallet?.address) {
      //  && !getAccessToken() - add
      didLoginRef.current = true;
      mutateAsync({
        provider: 'monad',
        providerAppId: user?.id,
        providerUserId: user?.wallet?.address,
      }).catch((e) => {
        console.error('Login mutation error', e);
        didLoginRef.current = false; // разрешим повтор через последующие изменения
      });
    }
  }, [authenticated, ready, user?.wallet?.address, mutateAsync]);

  return (
    <Routes>
      {/* корневой layout для всех страниц */}
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="puzzles" element={<PuzzlesPage />} />
        <Route path="tournaments" element={<TournamentsPage />} />
        <Route path="play" element={<PlayPage />}></Route>
        <Route path="play/computer" element={<PlayPageComputer />}></Route>
        <Route path="play/computer/review/:id" element={<ReviewGamePage />} />
        <Route path="*" element={<h1>404</h1>} />
      </Route>
    </Routes>
  );
}

export default App;
