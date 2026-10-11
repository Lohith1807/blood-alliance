import { MongoClient } from 'mongodb';

// Cache the connection & URL globally (Lambda Freeze)
let cachedClient = null;
let cachedBackendUrl = null;
let cacheTime = 0;

const MONGO_URL = process.env.MONGO_URL || process.env.MONGODB_URI;
const DB_NAME = "ClansData";
const COLLECTION_NAME = "system_config";
const CONFIG_KEY = "backend_tunnel_url";

async function getBackendUrl() {
    if (!MONGO_URL) {
        throw new Error("MONGO_URL or MONGODB_URI environment variable is not defined");
    }
    // Return cached URL if fresh (< 60 seconds)
    if (cachedBackendUrl && (Date.now() - cacheTime < 60000)) {
        return cachedBackendUrl;
    }

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
        console.log(`[PROXY-CONFIG] Refreshed Backend URL: ${cachedBackendUrl}`);
        return cachedBackendUrl;
    }

    console.warn(`[PROXY-CONFIG] No URL found in DB, falling back to IP`);
    return "http://2.56.246.81:30267"; // Fallback
}

export default async function handler(req, res) {
    const { path, ...queryParams } = req.query;

    // Simple health check for the proxy itself
    if (path === 'internal-ping' || req.url.includes('internal-ping')) {
        return res.status(200).json({
            status: "Proxy is ALIVE",
            timestamp: new Date().toISOString(),
            method: req.method,
            headers: req.headers
        });
    }

    if (!path) {
        return res.status(400).send("Missing path - Usage: /coc-api/[target-path]");
    }

    try {
        // Dynamic URL Discovery
        const rawBackendUrl = await getBackendUrl();
        const BACKEND_URL = rawBackendUrl.replace(/\/+$/, '');

        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(queryParams)) {
            if (key !== 'path') searchParams.append(key, value);
        }
        const queryString = searchParams.toString();
        const normalizedPath = path.startsWith('/') ? path : '/' + path;
        
        // CRITICAL FIX: Ensure the path is encoded so characters like '#' (fragments) 
        // are not stripped by the fetch client before reaching the backend.
        const safePath = normalizedPath.split('/').map(seg => encodeURIComponent(seg)).join('/');
        const targetUrl = `${BACKEND_URL}${safePath}${queryString ? '?' + queryString : ''}`;

        console.log(`[PROXY-INVOKE] ${req.method} -> ${targetUrl}`);

        const fetchOptions = {
            method: req.method,
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
            },
        };

        // Forward Cookies from Client to Backend (Critical for Session)
        if (req.headers.cookie) {
            fetchOptions.headers['Cookie'] = req.headers.cookie;
        }

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, fetchOptions);

        // Handle Setup-Cookie from Backend
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
            // Modify SameSite if needed, or just pass valid attributes
            // Removing 'Secure' if localhost might be needed but Tunnel is HTTPS so it's fine.
            res.setHeader('Set-Cookie', setCookieHeader);
        }

        const data = await response.text();

        console.log(`[PROXY-SUCCESS] ${response.status} | URL: ${targetUrl}`);

        // CORS for Credentials
        const origin = req.headers.origin || req.headers.host;
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        // Forward Content-Type from backend
        const contentType = response.headers.get('content-type');
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }

        return res.status(response.status).send(data);

    } catch (error) {
        console.error(`[PROXY-ERROR] ${error.name}: ${error.message}`);
        return res.status(502).json({
            error: "CONNECTION_FAILED",
            message: error.message
        });
    }
}
