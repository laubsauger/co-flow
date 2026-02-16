import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { GestureList } from '@/features/gestures/GestureList';
import { GestureDetail } from '@/features/gestures/GestureDetail';
import { PlayerView } from '@/features/player/PlayerView';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<GestureList />} />
        <Route path="/gestures/:id" element={<GestureDetail />} />
        <Route path="/play" element={<PlayerView />} />
        {/* Fallback */}
        <Route path="*" element={<GestureList />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased text-foreground">
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
