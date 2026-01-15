export default async function handler(req, res) {
    const { path } = req.query;

    // We strictly proxy only to our known backend
    const BACKEND_URL = "http://api-blood-alliance.duckdns.org:30267";

    // Reconstruct the full target URL
    // req.query.path will contain the rest of the URL from the rewrite
    const targetUrl = `${BACKEND_URL}/${path}`;

    console.log(`[PROXY] Forwarding ${req.method} to: ${targetUrl}`);

    try {
        const fetchOptions = {
            method: req.method,
            headers: {
                ...req.headers,
                // Ensure host is correct for the target
                'host': 'api-blood-alliance.duckdns.org:30267',
                // Remove Vercel specific headers that might confuse the target
                'x-vercel-id': undefined,
                'x-real-ip': undefined,
                'x-forwarded-for': undefined,
            },
        };

        // Don't include body for GET/HEAD
        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.text();

        // Forward headers from backend
        Object.entries(response.headers).forEach(([key, value]) => {
            res.setHeader(key, value);
        });

        // Set security headers for Vercel
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

        return res.status(response.status).send(data);
    } catch (error) {
        console.error('[PROXY] Error:', error);
        return res.status(502).json({
            success: false,
            message: "Proxy Gateway Error",
            error: error.message
        });
    }
}
