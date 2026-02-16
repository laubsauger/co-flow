import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { GestureList } from '@/features/gestures/GestureList';
import { GestureDetail } from '@/features/gestures/GestureDetail';
import { PlayerView } from '@/features/player/PlayerView';

import { FlowList } from '@/features/flows/FlowList';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <div className="space-y-8">
            <FlowList />
            <GestureList />
          </div>
        } />
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
