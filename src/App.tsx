import { Routes, Route } from 'react-router';
import { AppLayout } from '@/components';
import { HomePage, PuzzlesPage, PlayPageComputer } from '@/pages';
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
    if (authenticated && ready && user?.wallet?.address) {
      // && !getAccessToken() - add this in check later
      didLoginRef.current = true;
      mutateAsync({ address: user.wallet.address }).catch((e) => {
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
        <Route path="play">
          <Route path={'computer'} element={<PlayPageComputer />}></Route>
        </Route>
        <Route path="*" element={<h1>404</h1>} />
      </Route>
    </Routes>
  );
}

export default App;
