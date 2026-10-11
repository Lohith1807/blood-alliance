import { getDb, createSession, validateSession, invalidateSession, extractBearerToken, verifyPassword } from '../lib/auth.js';

export default async function handler(req, res) {
    // CORS headers
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Token');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const db = await getDb();
        const action = req.query?.action || (req.body && req.body.action);

        // 1. LOGIN
        if (req.method === 'POST' && (!action || action === 'login')) {
            const { email, password } = req.body || {};

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const cleanEmail = String(email).trim().toLowerCase();
            const user = await db.collection('users').findOne({ email: cleanEmail });

            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const isValid = verifyPassword(password, user.salt, user.passwordHash);
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Create 7-day session
            const sessionData = await createSession(db, user);

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                token: sessionData.token,
                expiresAt: sessionData.expiresAt,
                expiresAtMs: sessionData.expiresAtMs,
                user: {
                    email: user.email,
                    role: user.role
                }
            });
        }

        // 2. LOGOUT
        if (req.method === 'POST' && action === 'logout') {
            const token = extractBearerToken(req) || req.body?.token;
            if (token) {
                await invalidateSession(db, token);
            }
            return res.status(200).json({ success: true, message: 'Logged out successfully' });
        }

        // 3. GET CURRENT USER / SESSION VALIDATION (GET /api/auth or GET /api/auth?action=me)
        if (req.method === 'GET') {
            const token = extractBearerToken(req);
            if (!token) {
                return res.status(401).json({ error: 'No session token provided', code: 'UNAUTHORIZED' });
            }

            const authResult = await validateSession(db, token);
            if (!authResult.valid) {
                return res.status(401).json({
                    error: authResult.error,
                    code: authResult.code || 'UNAUTHORIZED',
                    expired: authResult.expired || false
                });
            }

            return res.status(200).json({
                success: true,
                user: authResult.user,
                expiresAt: authResult.session.expiresAt,
                expiresAtMs: authResult.session.expiresAtMs
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Auth handler error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
