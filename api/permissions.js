import { requireAuth, getModulePermissions, DEFAULT_MODULE_PERMISSIONS } from '../lib/auth.js';
import { logActivity } from '../lib/auditLog.js';

export default async function handler(req, res) {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Token');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET can be queried by any logged-in user so the frontend knows what modules they can see
        const auth = await requireAuth(req, res);
        if (!auth) return;

        const { db, user } = auth;
        const settingsCollection = db.collection('settings');

        // GET current permissions
        if (req.method === 'GET') {
            const permissions = await getModulePermissions(db);
            return res.status(200).json({
                success: true,
                permissions,
                availableRoles: ['admin', 'mod', 'staff', 'leader'],
                availableModules: [
                    { id: 'manage-clans', name: 'Manage Clan List & Order', description: 'Reorder clans, add new clans, edit or remove clans' },
                    { id: 'ticket-management', name: 'Discord Ticket Management', description: 'Live roster verification, applications, and FWA tickets' },
                    { id: 'user-management', name: 'User Management', description: 'Create and edit alliance staff, mods, and leader accounts' },
                    { id: 'audit-logs', name: 'Audit & Activity Logs', description: 'System-wide activity, change tracking, and audit history' },
                    { id: 'clan-rules', name: 'Clan Rules Management', description: 'Configure custom clan rules and protocols per assigned clan' },
                    { id: 'module-permissions', name: 'Module Permissions', description: 'Configure role-based access for all alliance modules' }
                ]
            });
        }

        // PUT: Update permissions (Restricted to Owner and Admin)
        if (req.method === 'PUT') {
            if (!user.isOwner && user.role !== 'admin') {
                return res.status(403).json({ error: 'Only Alliance Admins or Owner can modify module permissions' });
            }

            const { permissions } = req.body || {};
            if (!permissions || typeof permissions !== 'object') {
                return res.status(400).json({ error: 'Invalid permissions payload' });
            }

            // Sanitize permissions
            const validRoles = ['admin', 'mod', 'staff', 'leader'];
            const sanitized = {};
            for (const [modKey, roles] of Object.entries(permissions)) {
                if (Array.isArray(roles)) {
                    sanitized[modKey] = roles.filter(r => validRoles.includes(r));
                }
            }

            const merged = { ...DEFAULT_MODULE_PERMISSIONS, ...sanitized };

            await settingsCollection.updateOne(
                { _id: 'module_permissions' },
                {
                    $set: {
                        permissions: merged,
                        updatedAt: new Date(),
                        updatedBy: user.email
                    }
                },
                { upsert: true }
            );

            await logActivity(db, {
                user,
                action: 'PERMISSIONS_UPDATE',
                target: 'Module Access Control',
                details: `Updated permissions matrix for ${Object.keys(sanitized).length} modules`,
                req
            });

            return res.status(200).json({
                success: true,
                message: 'Module permissions updated successfully',
                permissions: merged
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Permissions API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
