import { requireAuth } from '../lib/auth.js';

export default async function handler(req, res) {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Token');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Require authentication with explicit audit log view privileges
    // Only lohithreddy1819@gmail.com (Alliance Owner) or users explicitly granted canViewLogs
    const auth = await requireAuth(req, res, null, { requireLogsAccess: true });
    if (!auth) return;

    // Strict immutability guarantee: no editing or deleting allowed
    if (req.method !== 'GET') {
        return res.status(405).json({
            error: 'Method not allowed. Audit logs are strictly immutable and cannot be edited or deleted.'
        });
    }

    const { db } = auth;
    const logsCollection = db.collection('audit_logs');

    try {
        const { action, search, date, limit = '50', page = '1' } = req.query || {};

        const filter = {};

        // Filter by action type
        if (action && action !== 'all') {
            filter.action = String(action).toUpperCase().trim();
        }

        // Filter by text search (user email, target, or details)
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [
                { performedBy: regex },
                { target: regex },
                { details: regex },
                { action: regex }
            ];
        }

        // Filter by specific date (YYYY-MM-DD)
        if (date && date.trim()) {
            const [y, m, d] = date.split('-').map(Number);
            const startOfDay = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
            const endOfDay = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
            filter.timestamp = { $gte: startOfDay, $lte: endOfDay };
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
        const skip = (pageNum - 1) * limitNum;

        const [logs, totalCount, statsAgg] = await Promise.all([
            logsCollection.find(filter)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limitNum)
                .toArray(),
            logsCollection.countDocuments(filter),
            logsCollection.aggregate([
                {
                    $facet: {
                        total: [{ $count: "count" }],
                        clanChanges: [
                            { $match: { action: { $in: ['CLAN_REORDER', 'CLAN_EDIT', 'CLAN_DELETE', 'CLAN_ADD'] } } },
                            { $count: "count" }
                        ],
                        userChanges: [
                            { $match: { action: { $in: ['USER_CREATE', 'USER_EDIT', 'USER_DELETE'] } } },
                            { $count: "count" }
                        ],
                        today: [
                            {
                                $match: {
                                    timestamp: {
                                        $gte: new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                }
                            },
                            { $count: "count" }
                        ]
                    }
                }
            ]).toArray()
        ]);

        const facet = statsAgg[0] || {};
        const stats = {
            total: facet.total?.[0]?.count || 0,
            clanChanges: facet.clanChanges?.[0]?.count || 0,
            userChanges: facet.userChanges?.[0]?.count || 0,
            today: facet.today?.[0]?.count || 0
        };

        const sanitizedLogs = logs.map(doc => ({
            id: doc._id.toString(),
            timestamp: doc.timestamp,
            performedBy: doc.performedBy,
            userRole: doc.userRole,
            action: doc.action,
            target: doc.target,
            details: doc.details,
            ip: doc.ip || null
        }));

        return res.status(200).json({
            success: true,
            logs: sanitizedLogs,
            total: totalCount,
            page: pageNum,
            totalPages: Math.ceil(totalCount / limitNum),
            stats
        });
    } catch (err) {
        console.error('Audit logs fetch error:', err);
        return res.status(500).json({ error: 'Failed to retrieve audit logs', details: err.message });
    }
}
