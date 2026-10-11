/**
 * Audit Logging Helper — Records immutable activity records for system modifications.
 * 
 * Tracks:
 * - Clan additions, edits, deletions, and position reorders
 * - User additions, updates, role changes, and deletions
 */

export async function logActivity(db, { user, action, target, details, req }) {
    if (!db) return;

    try {
        const logsCollection = db.collection('audit_logs');

        // Extract client IP if request is provided
        let ip = null;
        if (req) {
            ip = req.headers['x-forwarded-for'] || 
                 req.headers['x-real-ip'] || 
                 req.socket?.remoteAddress || 
                 null;
            if (typeof ip === 'string' && ip.includes(',')) {
                ip = ip.split(',')[0].trim();
            }
        }

        const logDoc = {
            timestamp: new Date(),
            performedBy: user?.email ? String(user.email).toLowerCase().trim() : 'system',
            userRole: user?.role || 'unknown',
            action: String(action).toUpperCase().trim(),
            target: target ? String(target).trim() : 'N/A',
            details: typeof details === 'object' ? JSON.stringify(details) : String(details || ''),
            ip: ip
        };

        await logsCollection.insertOne(logDoc);
    } catch (err) {
        // Never let logging failure break the primary mutation
        console.error('[AUDIT-LOG] Failed to record activity log:', err.message);
    }
}
