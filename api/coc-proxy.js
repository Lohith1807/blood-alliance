export default async function handler(req, res) {
    const { path, ...queryParams } = req.query;

    if (!path) {
        return res.status(400).send("Missing path");
    }

    const BACKEND_URL = "http://api-blood-alliance.duckdns.org:30267";

    // Reconstruct query string from all params EXCEPT 'path'
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
        searchParams.append(key, value);
    }
    const queryString = searchParams.toString();
    const targetUrl = `${BACKEND_URL}/${path}${queryString ? '?' + queryString : ''}`;

    console.log(`[PROXY-START] ${req.method} ${targetUrl}`);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const fetchOptions = {
            method: req.method,
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': req.headers['content-type'] || 'application/json',
                'User-Agent': 'Vercel-Proxy-Agent',
            },
            signal: controller.signal,
            // Only set credentials if necessary, but backend might not support it well via proxy
            // credentials: 'omit' 
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, fetchOptions);
        clearTimeout(timeoutId);

        const data = await response.text();
        console.log(`[PROXY-END] ${response.status} from ${targetUrl} (Size: ${data.length})`);

        // Forward headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cookie');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        return res.status(response.status).send(data);
    } catch (error) {
        console.error(`[PROXY-ERROR] ${error.message} - URL: ${targetUrl}`);
        const status = error.name === 'AbortError' ? 504 : 502;
        return res.status(status).json({
            error: "Proxy connection failed",
            details: error.message,
            url: targetUrl
        });
    }
}
