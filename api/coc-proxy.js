import { MongoClient } from 'mongodb';

// Cache the connection & URL globally (Lambda Freeze)
let cachedClient = null;
let cachedBackendUrl = null;
let cacheTime = 0;

const MONGO_URL = process.env.MONGO_URL || process.env.MONGODB_URI;
const DB_NAME = "ClansData";
const COLLECTION_NAME = "system_config";
const CONFIG_KEY = "backend_tunnel_url";

// In-memory TTL cache for GET requests (2 minutes)
const responseCache = new Map();
const CACHE_TTL_MS = 120 * 1000;

async function getBackendUrl() {
    return process.env.COC_BACKEND_URL || "http://bloodalliance.duckdns.org:3002";
}

export default async function handler(req, res) {
    const { path, refresh, ...queryParams } = req.query;
    const bypassCache = refresh === 'true';

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

        // Serve from in-memory cache for GET requests if fresh
        if (req.method === 'GET' && !bypassCache) {
            const cached = responseCache.get(targetUrl);
            if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
                res.setHeader('X-Cache', 'HIT');
                res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=60');
                if (cached.contentType) res.setHeader('Content-Type', cached.contentType);
                return res.status(cached.status).send(cached.data);
            }
        }

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

        if (req.method === 'GET' && response.ok) {
            responseCache.set(targetUrl, {
                status: response.status,
                data,
                contentType,
                ts: Date.now()
            });
            res.setHeader('X-Cache', bypassCache ? 'BYPASS' : 'MISS');
            res.setHeader('Cache-Control', bypassCache ? 'no-store' : 'public, s-maxage=120, stale-while-revalidate=60');
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
