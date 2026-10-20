import crypto from 'crypto';
import clientPromise from './mongodb.js';

const DB_NAME = 'ClansData';
const SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (168 hours)

export function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return { salt, hash };
}

export function verifyPassword(password, salt, expectedHash) {
    if (!password || !salt || !expectedHash) return false;
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    try {
        return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(expectedHash, 'hex'));
    } catch {
        return false;
    }
}

export async function getDb() {
    const client = await clientPromise;
    return client.db(DB_NAME);
}

export async function createSession(db, user) {
    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    const expiresAt = now + SESSION_LIFETIME_MS;

    const sessionDoc = {
        token,
        userId: user._id,
        email: user.email.toLowerCase().trim(),
        role: user.role,
        createdAt: new Date(now),
        createdAtMs: now,
        expiresAt: new Date(expiresAt),
        expiresAtMs: expiresAt,
    };

    await db.collection('sessions').insertOne(sessionDoc);

    const isOwner = user.email?.toLowerCase() === 'lohithreddy1819@gmail.com';
    const canViewLogs = isOwner || Boolean(user.canViewLogs);
    const assignedClans = Array.isArray(user.assignedClans) ? user.assignedClans : [];

    return {
        token,
        createdAt: sessionDoc.createdAt,
        expiresAt: sessionDoc.expiresAt,
        expiresAtMs: sessionDoc.expiresAtMs,
        user: {
            email: user.email,
            role: user.role,
            isOwner,
            canViewLogs,
            assignedClans
        }
    };
}

export const DEFAULT_MODULE_PERMISSIONS = {
    'manage-clans': ['admin', 'mod'],
    'ticket-management': ['admin', 'mod', 'staff'],
    'user-management': ['admin'],
    'audit-logs': ['admin'],
    'clan-rules': ['admin', 'leader'],
    'module-permissions': ['admin']
};

export async function getModulePermissions(db) {
    try {
        const permsDoc = await db.collection('settings').findOne({ _id: 'module_permissions' });
        if (permsDoc && permsDoc.permissions) {
            return { ...DEFAULT_MODULE_PERMISSIONS, ...permsDoc.permissions };
        }
    } catch (err) {
        console.error('Failed to fetch module permissions:', err);
    }
    return DEFAULT_MODULE_PERMISSIONS;
}

export async function validateSession(db, token) {
    if (!token) {
        return { valid: false, error: 'Authentication token missing', code: 'UNAUTHORIZED' };
    }

    const session = await db.collection('sessions').findOne({ token });
    if (!session) {
        return { valid: false, error: 'Invalid session token', code: 'UNAUTHORIZED' };
    }

    const now = Date.now();
    const expiresAt = session.expiresAtMs || new Date(session.expiresAt).getTime();

    // Absolute 7-day expiration check
    if (now > expiresAt) {
        // Invalidate expired session
        await db.collection('sessions').deleteOne({ token }).catch(() => {});
        return {
            valid: false,
            expired: true,
            error: 'Your session has expired. Please log in again.',
            code: 'SESSION_EXPIRED'
        };
    }

    // Verify user exists and get current role
    const user = await db.collection('users').findOne({ _id: session.userId });
    if (!user) {
        await db.collection('sessions').deleteOne({ token }).catch(() => {});
        return { valid: false, error: 'User not found', code: 'UNAUTHORIZED' };
    }

    const isOwner = user.email?.toLowerCase() === 'lohithreddy1819@gmail.com';
    const canViewLogs = isOwner || Boolean(user.canViewLogs);
    const assignedClans = Array.isArray(user.assignedClans) ? user.assignedClans : [];

    return {
        valid: true,
        session,
        user: {
            id: user._id,
            email: user.email,
            role: user.role,
            isOwner,
            canViewLogs,
            assignedClans
        }
    };
}

export async function invalidateSession(db, token) {
    if (!token) return { success: true };
    await db.collection('sessions').deleteOne({ token });
    return { success: true };
}

export function extractBearerToken(req) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7).trim();
    }
    // Also support custom header or cookie
    if (req.headers['x-session-token']) {
        return req.headers['x-session-token'];
    }
    return null;
}

export async function requireAuth(req, res, requiredRole = null, options = {}) {
    const token = extractBearerToken(req);
    if (!token) {
        res.status(401).json({ error: 'Authentication required. Please log in.', code: 'UNAUTHORIZED' });
        return null;
    }

    const db = await getDb();
    const authResult = await validateSession(db, token);

    if (!authResult.valid) {
        res.status(401).json({ error: authResult.error, code: authResult.code || 'UNAUTHORIZED' });
        return null;
    }

    // Owner always has full access to all modules and actions
    if (authResult.user.isOwner) {
        return { db, user: authResult.user, session: authResult.session };
    }

    // Check specific module permission if requested
    if (options.requiredModule) {
        const permissions = await getModulePermissions(db);
        const allowedRoles = permissions[options.requiredModule] || [];
        if (!allowedRoles.includes(authResult.user.role)) {
            res.status(403).json({
                error: `Forbidden: Your role (${authResult.user.role}) does not have permission to access ${options.requiredModule}`,
                code: 'FORBIDDEN'
            });
            return null;
        }
    } else if (requiredRole && authResult.user.role !== requiredRole) {
        res.status(403).json({ error: 'Forbidden: Insufficient privileges', code: 'FORBIDDEN' });
        return null;
    }

    if (options.requireLogsAccess) {
        const canView = authResult.user.isOwner || authResult.user.canViewLogs;
        if (!canView) {
            res.status(403).json({ error: 'Forbidden: Only the Alliance Owner or authorized members can access logs', code: 'FORBIDDEN' });
            return null;
        }
    }

    return { db, user: authResult.user, session: authResult.session };
}
