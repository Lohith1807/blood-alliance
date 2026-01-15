export default async function handler(req, res) {
    const { path } = req.query;

    if (!path) {
        return res.status(400).json({ error: "Missing path parameter" });
    }

    const BACKEND_URL = "http://api-blood-alliance.duckdns.org:30267";

    // Reconstruct the full target URL
    // We need to handle potential query string that was part of the original request
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const searchParams = urlObj.searchParams;
    searchParams.delete('path'); // Remove the bridge param
    const queryString = searchParams.toString();

    const targetUrl = `${BACKEND_URL}/${path}${queryString ? '?' + queryString : ''}`;

    console.log(`[PROXY] ${req.method} -> ${targetUrl}`);

    try {
        const fetchOptions = {
            method: req.method,
            headers: {
                // Sensitive headers like host are often blocked or restricted in serverless fetch
                // We'll let fetch handle host/connection but keep others
                'Accept': req.headers['accept'] || '*/*',
                'Content-Type': req.headers['content-type'] || 'application/json',
                'User-Agent': req.headers['user-agent'] || 'Vercel-Proxy',
            },
        };

        // Forward credentials if needed (cookies)
        if (req.headers.cookie) {
            fetchOptions.headers['cookie'] = req.headers.cookie;
        }

        // Handle Body
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            if (req.body) {
                fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
            }
        }

        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.text();

        // Forward headers safely
        response.headers.forEach((value, key) => {
            // Skip problematic hop-by-hop headers
            if (!['content-encoding', 'content-length', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
                res.setHeader(key, value);
            }
        });

        // Ensure CORS for the client
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cookie');

        return res.status(response.status).send(data);
    } catch (error) {
        console.error('[PROXY] Fatal Error:', error);
        return res.status(502).json({
            success: false,
            message: "Proxy failed to reach backend",
            error: error.message
        });
    }
}
