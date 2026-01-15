export default async function handler(req, res) {
    const { path, ...queryParams } = req.query;

    // Fallback if vercel rewrite didn't pass path correctly
    const cleanPath = path || req.url.split('?')[0].replace('/coc-api/', '').replace('/api/coc-proxy', '');

    const BACKEND_URL = "http://api-blood-alliance.duckdns.org:30267";

    // Reconstruct query string
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
        if (key !== 'path') searchParams.append(key, value);
    }
    const queryString = searchParams.toString();

    // Safety check for path slashes
    const normalizedPath = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
    const targetUrl = `${BACKEND_URL}/${normalizedPath}${queryString ? '?' + queryString : ''}`;

    console.log(`[PROXY-INVOKE] Method: ${req.method} | Path: ${cleanPath} | Target: ${targetUrl}`);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const fetchOptions = {
            method: req.method,
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': req.headers['content-type'] || 'application/json',
                'User-Agent': 'Vercel-Forward-Proxy',
            },
            signal: controller.signal,
        };

        if (req.method !== 'GET' && req.method !== 'HEAD') {
            const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
            if (bodyStr && bodyStr !== '{}') {
                fetchOptions.body = bodyStr;
            }
        }

        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.text();
        clearTimeout(timeoutId);

        console.log(`[PROXY-RESPONSE] Status: ${response.status} | Bytes: ${data.length}`);

        // Safe header forwarding
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        if (response.headers.get('set-cookie')) {
            res.setHeader('Set-Cookie', response.headers.get('set-cookie'));
        }

        return res.status(response.status).send(data);
    } catch (error) {
        console.error(`[PROXY-FATAL] ${error.name}: ${error.message} (Target: ${targetUrl})`);

        const isTimeout = error.name === 'AbortError';
        return res.status(isTimeout ? 504 : 502).json({
            success: false,
            error: isTimeout ? "Gateway Timeout" : "Bad Gateway",
            message: error.message,
            targetUrl: targetUrl
        });
    }
}
