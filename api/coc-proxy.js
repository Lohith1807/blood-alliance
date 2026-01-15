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

    const BACKEND_URL = "http://api-blood-alliance.duckdns.org:30267";

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
        if (key !== 'path') searchParams.append(key, value);
    }
    const queryString = searchParams.toString();
    const normalizedPath = path.startsWith('/') ? path : '/' + path;
    const targetUrl = `${BACKEND_URL}${normalizedPath}${queryString ? '?' + queryString : ''}`;

    console.log(`[PROXY-INVOKE] ${req.method} -> ${targetUrl}`);

    try {
        const controller = new AbortController();
        // Short timeout for initial debugging to avoid Vercel 10s ceiling
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const fetchOptions = {
            method: req.method,
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
            },
            signal: controller.signal,
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.text();
        clearTimeout(timeoutId);

        console.log(`[PROXY-SUCCESS] ${response.status} | URL: ${targetUrl}`);

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        return res.status(response.status).send(data);
    } catch (error) {
        console.error(`[PROXY-ERROR] ${error.name}: ${error.message} (Target: ${targetUrl})`);

        const isTimeout = error.name === 'AbortError';
        return res.status(isTimeout ? 504 : 502).json({
            error: isTimeout ? "GATEWAY_TIMEOUT" : "CONNECTION_FAILED",
            message: error.message,
            diagnostic: {
                target: targetUrl,
                proxyTime: new Date().toISOString()
            }
        });
    }
}
