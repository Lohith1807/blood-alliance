import React, { Component, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Rules from './components/Rules';
import Footer from './components/Footer';
import { ClanProvider } from './context/ClanContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Retry lazy-loaded route chunks once and recover from stale deploy chunk hashes
const lazyRetry = (importer) =>
  lazy(() =>
    importer().catch((err) => {
      const reloadKey = 'ba_chunk_reload';
      const hasReloaded = sessionStorage.getItem(reloadKey);
      if (!hasReloaded) {
        sessionStorage.setItem(reloadKey, '1');
        window.location.reload();
        return new Promise(() => {});
      }
      sessionStorage.removeItem(reloadKey);
      throw err;
    })
  );

class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-primary)'
        }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            This page failed to load. Please reload to get the latest version.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy Load Heavy Components
const ClanList = lazyRetry(() => import('./components/ClanList'));
const PlayerTracker = lazyRetry(() => import('./components/PlayerTracker'));
const ClanDetail = lazyRetry(() => import('./components/ClanDetail'));
const PlayerProfile = lazyRetry(() => import('./components/PlayerProfile'));

// Authenticated & Access Components
const Login = lazyRetry(() => import('./components/Login'));
const ManageClans = lazyRetry(() => import('./components/ManageClans'));
const TicketManagement = lazyRetry(() => import('./components/TicketManagement'));
const UserManagement = lazyRetry(() => import('./components/UserManagement'));
const AuditLogs = lazyRetry(() => import('./components/AuditLogs'));
const ClanRulesManagement = lazyRetry(() => import('./components/ClanRulesManagement'));
const ModulePermissions = lazyRetry(() => import('./components/ModulePermissions'));
const CommandManagement = lazyRetry(() => import('./components/CommandManagement'));

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
    <AuthProvider>
      <ClanProvider>
        <BrowserRouter>
          <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
            <div className="bg-grid"></div>

            <Navbar />

            <main>
              <RouteErrorBoundary>
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

                  {/* AUTHENTICATION ROUTE */}
                  <Route path="/login" element={<Login />} />

                  {/* AUTHENTICATED MODULE ROUTES */}
                  <Route path="/manage-clans" element={
                    <ProtectedRoute requiredModule="manage-clans">
                      <ManageClans />
                    </ProtectedRoute>
                  } />

                  <Route path="/ticket-management" element={
                    <ProtectedRoute requiredModule="ticket-management">
                      <TicketManagement />
                    </ProtectedRoute>
                  } />

                  <Route path="/user-management" element={
                    <ProtectedRoute requiredModule="user-management">
                      <UserManagement />
                    </ProtectedRoute>
                  } />

                  <Route path="/audit-logs" element={
                    <ProtectedRoute requiredModule="audit-logs" requireLogsAccess={true}>
                      <AuditLogs />
                    </ProtectedRoute>
                  } />

                  <Route path="/clan-rules" element={
                    <ProtectedRoute requiredModule="clan-rules">
                      <ClanRulesManagement />
                    </ProtectedRoute>
                  } />

                  <Route path="/module-permissions" element={
                    <ProtectedRoute requiredModule="module-permissions">
                      <ModulePermissions />
                    </ProtectedRoute>
                  } />

                  <Route path="/command-management" element={
                    <ProtectedRoute requiredModule="command-management" requireCommandManagementAccess={true}>
                      <CommandManagement />
                    </ProtectedRoute>
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
              </RouteErrorBoundary>
            </main>

            <Footer />
          </div>
        </BrowserRouter>
      </ClanProvider>
    </AuthProvider>
  );
}

export default App;
