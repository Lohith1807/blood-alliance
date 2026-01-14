import clientPromise from '../lib/mongodb';

export default async function handler(req, res) {
    // 1. CORS & Security Headers
    const origin = req.headers.origin;
    const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

    if (isDev && origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (process.env.ALLOWED_ORIGIN && origin === process.env.ALLOWED_ORIGIN) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    if (origin) {
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Safe Database Connection
        const client = await clientPromise;
        const db = client.db('ClansData');
        const collection = db.collection('players');

        // Allow filtering by clan tag
        const { clanTag } = req.query;
        let query = {};

        if (clanTag) {
            // 3. Input Sanitization
            const cleanTag = String(clanTag).trim();
            query.assignedClanTag = cleanTag;
        }

        const players = await collection.find(query).toArray();

        return res.status(200).json({
            success: true,
            count: players.length,
            source: 'mongodb',
            players: players
        });
    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
