import React, { useState, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Rules from './components/Rules';
import Footer from './components/Footer';
import { ClanProvider, useClans } from './context/ClanContext';
import { Loader2 } from 'lucide-react';

// Lazy Load Heavy Components
const ClanList = lazy(() => import('./components/ClanList'));
const PlayerTracker = lazy(() => import('./components/PlayerTracker'));
const ClanDetail = lazy(() => import('./components/ClanDetail'));

// Inner App component that uses the context
function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const { selectedClan, setSelectedClan, loading } = useClans();

  const handleClanSelect = (clanTag) => {
    setSelectedClan(clanTag);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromClan = () => {
    setSelectedClan(null);
  };

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      <div className="bg-grid"></div>
      <div className="bg-noise"></div>
      <div className="scanline"></div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main>
        <Suspense fallback={<PageLoader />}>
          {selectedClan ? (
            <ClanDetail clanTag={selectedClan} onBack={handleBackFromClan} />
          ) : activeTab === 'home' ? (
            <>
              <Hero setActiveTab={setActiveTab} />
              <ClanList onClanSelect={handleClanSelect} />
              <Rules />
            </>
          ) : (
            <PlayerTracker />
          )}
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

// Main App wrapped with ClanProvider
function App() {
  return (
    <ClanProvider>
      <AppContent />
    </ClanProvider>
  );
}

export default App;
