import { MongoClient } from 'mongodb';

// Cache the connection & URL globally (Lambda Freeze)
let cachedClient = null;
let cachedBackendUrl = null;
let cacheTime = 0;

// Configuration
const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = "ClansData";
const COLLECTION_NAME = "system_config";
const CONFIG_KEY = "backend_tunnel_url";

export default async function handler(req, res) {
    const { force } = req.query;

    // Return cached URL if fresh (< 60 seconds) AND not forced
    if (!force && cachedBackendUrl && (Date.now() - cacheTime < 60000)) {
        return res.status(200).json({ url: cachedBackendUrl });
    }

    try {
        if (!cachedClient) {
            cachedClient = new MongoClient(MONGO_URL);
            await cachedClient.connect();
        }

        const db = cachedClient.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const doc = await collection.findOne({ key: CONFIG_KEY });

        if (doc && doc.value) {
            cachedBackendUrl = doc.value;
            cacheTime = Date.now();
            return res.status(200).json({ url: cachedBackendUrl });
        } else {
            return res.status(404).json({ error: "Backend URL not found in DB" });
        }
    } catch (error) {
        console.error("Config Fetch Error:", error);
        return res.status(500).json({ error: "Failed to fetch configuration" });
    }
}
