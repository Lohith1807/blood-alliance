import clientPromise from '../lib/mongodb.js';

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

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=59');

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
        const collection = db.collection('clans');

        const { tag } = req.query;

        if (tag) {
            // 3. Input Sanitization: Force string type to prevent NoSQL injection
            const cleanTag = String(tag).trim();
            const clanTag = cleanTag.startsWith('#') ? cleanTag : `#${cleanTag}`;

            const clan = await collection.findOne({ _id: clanTag });

            if (!clan) {
                return res.status(404).json({ error: 'Clan not found' });
            }
            return res.status(200).json(clan);
        }

        // Fetch all clans
        // Use projection to only fetch needed fields if possible, to save bandwidth
        // For now, we fetch everything as the schema is small
        const clans = await collection.find({}).toArray();

        return res.status(200).json({
            success: true,
            count: clans.length,
            source: 'mongodb',
            clans: clans
        });
    } catch (error) {
        console.error('Database Error:', error);
        // Do not return actual error details to client for security
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
