import { Routes, Route } from 'react-router';
import { AppLayout } from '@/components';
import { HomePage, PuzzlesPage, PlayPageComputer } from '@/pages';

function App() {
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
