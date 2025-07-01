import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useEffect } from 'react';
import { useAudio } from './lib/stores/useAudio';
import MainMenu from './pages/MainMenu';
import DifficultySelect from './pages/DifficultySelect';
import SoloModeSelect from './pages/SoloModeSelect';
import Game from './pages/Game';
import GameResults from './pages/GameResults';
import GameHistory from './pages/GameHistory';
import NotFound from './pages/not-found';

function App() {
  // Preload sounds
  useEffect(() => {
    // Preload audio files
    const hitSound = new Audio('/sounds/hit.mp3');
    const successSound = new Audio('/sounds/success.mp3');

    // Preload by triggering a load
    hitSound.load();
    successSound.load();

    // Set volume to 0 during preload
    hitSound.volume = 0;
    successSound.volume = 0;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/difficulty" element={<DifficultySelect />} />
          <Route path="/solo-mode" element={<SoloModeSelect />} />
          <Route path="/game" element={<Game />} />
          <Route path="/results" element={<GameResults />} />
          <Route path="/history" element={<GameHistory />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;