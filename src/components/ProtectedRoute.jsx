import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole = null, requireLogsAccess = false }) => {
    const { isAuthenticated, user, canViewLogs, isOwner, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '60vh',
                color: 'var(--rh-red)'
            }}>
                <Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole && !isOwner) {
        return <Navigate to="/" replace />;
    }

    if (requireLogsAccess && !canViewLogs) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
