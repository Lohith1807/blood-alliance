import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ClanList from './components/ClanList';
import PlayerTracker from './components/PlayerTracker';
import Rules from './components/Rules';
import Footer from './components/Footer';
import ClanDetail from './components/ClanDetail';
import { ClanProvider, useClans } from './context/ClanContext';

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      <div className="bg-grid"></div>
      <div className="bg-noise"></div>
      <div className="scanline"></div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main>
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
