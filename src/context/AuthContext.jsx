import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'ba_auth_session';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [expiresAt, setExpiresAt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionExpiredMessage, setSessionExpiredMessage] = useState('');

    // Clear session locally
    const clearLocalSession = useCallback((expired = false) => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {}
        setUser(null);
        setToken(null);
        setExpiresAt(null);
        if (expired) {
            setSessionExpiredMessage('Your session has expired. Please log in again.');
        }
    }, []);

    // Manual logout
    const logout = useCallback(async () => {
        const currentToken = token || (() => {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                return saved ? JSON.parse(saved).token : null;
            } catch {
                return null;
            }
        })();

        if (currentToken) {
            try {
                await fetch('/api/auth?action=logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentToken}`
                    },
                    body: JSON.stringify({ token: currentToken })
                });
            } catch (err) {
                console.error('Logout error:', err);
            }
        }

        clearLocalSession(false);
    }, [token, clearLocalSession]);

    // Check expiration and validate session with backend
    const checkSessionValidity = useCallback(async (savedSession) => {
        if (!savedSession || !savedSession.token || !savedSession.expiresAt) {
            clearLocalSession(false);
            setLoading(false);
            return false;
        }

        const now = Date.now();
        const expTime = new Date(savedSession.expiresAt).getTime();

        // Check if fixed 7-day period has passed
        if (now >= expTime) {
            console.warn('Session reached absolute 7-day expiration limit');
            clearLocalSession(true);
            setLoading(false);
            return false;
        }

        // Verify with backend
        try {
            const res = await fetch('/api/auth', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${savedSession.token}`
                }
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                const isExpired = data.expired || res.status === 401;
                clearLocalSession(isExpired);
                setLoading(false);
                return false;
            }

            const data = await res.json();
            if (data.success && data.user) {
                setUser(data.user);
                setToken(savedSession.token);
                setExpiresAt(savedSession.expiresAt);
                setLoading(false);
                return true;
            } else {
                clearLocalSession(false);
                setLoading(false);
                return false;
            }
        } catch (err) {
            console.error('Failed to verify session with backend:', err);
            // On offline network, if expiration date has not passed yet, keep local session
            if (now < expTime) {
                setUser(savedSession.user);
                setToken(savedSession.token);
                setExpiresAt(savedSession.expiresAt);
            } else {
                clearLocalSession(true);
            }
            setLoading(false);
            return false;
        }
    }, [clearLocalSession]);

    // Initialize session on mount
    useEffect(() => {
        let saved = null;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) saved = JSON.parse(raw);
        } catch (e) {
            console.error('Failed to read auth session from storage', e);
        }

        if (saved) {
            checkSessionValidity(saved);
        } else {
            setLoading(false);
        }
    }, [checkSessionValidity]);

    // Periodic timer to detect session expiration (every 30 seconds)
    useEffect(() => {
        if (!expiresAt) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const expTime = new Date(expiresAt).getTime();
            if (now >= expTime) {
                clearLocalSession(true);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [expiresAt, clearLocalSession]);

    // Login action
    const login = async (email, password) => {
        setSessionExpiredMessage('');
        const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Failed to authenticate');
        }

        const sessionPayload = {
            token: data.token,
            expiresAt: data.expiresAt,
            user: data.user
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionPayload));
        } catch (e) {
            console.error('Failed to persist session in localStorage:', e);
        }

        setToken(data.token);
        setExpiresAt(data.expiresAt);
        setUser(data.user);

        return data;
    };

    const [permissions, setPermissions] = useState({
        'manage-clans': ['admin', 'mod'],
        'ticket-management': ['admin', 'mod', 'staff'],
        'user-management': ['admin'],
        'audit-logs': ['admin'],
        'clan-rules': ['admin', 'leader'],
        'module-permissions': ['admin']
    });

    // Fetch dynamic module permissions from backend
    const fetchPermissions = useCallback(async (authToken) => {
        const activeToken = authToken || token;
        if (!activeToken) return;

        try {
            const res = await fetch('/api/permissions', {
                headers: { 'Authorization': `Bearer ${activeToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.permissions) {
                    setPermissions(data.permissions);
                }
            }
        } catch (err) {
            console.error('Failed to load module permissions:', err);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchPermissions(token);
        }
    }, [token, fetchPermissions]);

    const isOwner = user?.email?.toLowerCase() === 'lohithreddy1819@gmail.com' || Boolean(user?.isOwner);
    const canViewLogs = isOwner || Boolean(user?.canViewLogs);
    const assignedClans = Array.isArray(user?.assignedClans) ? user.assignedClans : [];

    // RBAC module access checker
    const hasModuleAccess = useCallback((moduleKey) => {
        if (!user) return false;
        if (isOwner) return true;

        if (moduleKey === 'audit-logs') {
            return canViewLogs || (permissions['audit-logs'] && permissions['audit-logs'].includes(user.role));
        }

        const allowed = permissions[moduleKey];
        if (Array.isArray(allowed)) {
            return allowed.includes(user.role);
        }
        return false;
    }, [user, isOwner, canViewLogs, permissions]);

    const value = {
        user,
        token,
        expiresAt,
        isAuthenticated: Boolean(user && token),
        isAdmin: user?.role === 'admin' || isOwner,
        isMod: user?.role === 'mod',
        isStaff: user?.role === 'staff',
        isLeader: user?.role === 'leader',
        isOwner,
        canViewLogs,
        assignedClans,
        permissions,
        hasModuleAccess,
        fetchPermissions,
        loading,
        sessionExpiredMessage,
        clearSessionExpiredMessage: () => setSessionExpiredMessage(''),
        login,
        logout,
        checkSessionValidity
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
