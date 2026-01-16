import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Rules from './components/Rules';
import Footer from './components/Footer';
import { ClanProvider } from './context/ClanContext';
import { Loader2 } from 'lucide-react';

// Lazy Load Heavy Components
const ClanList = lazy(() => import('./components/ClanList'));
const PlayerTracker = lazy(() => import('./components/PlayerTracker'));
const ClanDetail = lazy(() => import('./components/ClanDetail'));
const PlayerProfile = lazy(() => import('./components/PlayerProfile'));

// Loading Fallback Component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    color: 'var(--rh-red)'
  }}>
    <Loader2 size={40} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  return (
    <ClanProvider>
      <BrowserRouter>
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
          <div className="bg-grid"></div>
          <div className="bg-noise"></div>
          <div className="scanline"></div>

          <Navbar />

          <main>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* HOME ROUTE */}
                <Route path="/" element={
                  <>
                    <Hero />
                    <ClanList />
                    <Rules />
                  </>
                } />

                {/* TRACKER ROUTE */}
                <Route path="/tracker" element={<PlayerTracker />} />

                {/* CLAN DETAIL ROUTE */}
                <Route path="/clan/:tag" element={<ClanDetail />} />

                {/* PLAYER PROFILE ROUTE */}
                <Route path="/player" element={<PlayerProfile />} />
                <Route path="/player/:playerTag" element={<PlayerProfile />} />

                {/* FALLBACK */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </ClanProvider>
  );
}

export default App;
