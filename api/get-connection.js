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
    const backendUrl = process.env.COC_BACKEND_URL || "http://217.148.167.14:3002";
    return res.status(200).json({ url: backendUrl });
}
