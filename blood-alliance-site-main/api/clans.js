import { MongoClient } from 'mongodb';

const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://lohithreddy1819april_db_user:nHYI3nUFGWztAPwR@clansdata.auhlwu2.mongodb.net/?appName=ClansData';
let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) return cachedClient;
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    cachedClient = client;
    return client;
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const client = await connectToDatabase();
        const db = client.db('ClansData');
        const collection = db.collection('clans');

        const { tag } = req.query;

        if (tag) {
            // Fetch single clan from MongoDB
            const clanTag = tag.startsWith('#') ? tag : `#${tag}`;
            const clan = await collection.findOne({ _id: clanTag });

            if (!clan) {
                return res.status(404).json({ error: 'Clan not found in database' });
            }
            return res.status(200).json(clan);
        }

        // Fetch all clans from MongoDB
        const clans = await collection.find({}).toArray();

        // Remove MongoDB internal _id if you want to keep CoC API structure clean
        // (but we're using tag as the _id, so it's fine)

        return res.status(200).json({
            success: true,
            count: clans.length,
            source: 'mongodb',
            clans: clans
        });
    } catch (error) {
        console.error('MongoDB API Error:', error);
        return res.status(500).json({ error: 'Failed to fetch clan data from database' });
    }
}
