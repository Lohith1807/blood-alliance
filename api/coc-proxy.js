export default async function handler(req, res) {
    const { path, ...queryParams } = req.query;

    if (!path) {
        return res.status(400).send("Missing path");
    }

    const BACKEND_URL = "http://api-blood-alliance.duckdns.org:30267";

    // Reconstruct query string
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
        if (key !== 'path') searchParams.append(key, value);
    }
    const queryString = searchParams.toString();
    const normalizedPath = path.startsWith('/') ? path : '/' + path;
    const targetUrl = `${BACKEND_URL}${normalizedPath}${queryString ? '?' + queryString : ''}`;

    console.log(`[PROXY-ATTEMPT] ${req.method} ${targetUrl}`);

    try {
        const fetchOptions = {
            method: req.method,
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                // Use a real browser UA to avoid bot detection
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            // We'll set a longer timeout if Vercel allows, but usually restricted to 10-15s
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        // Use native fetch (Node 18+)
        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.text();

        console.log(`[PROXY-SUCCESS] ${response.status} from ${targetUrl}`);

        // Set mandatory CORS for Vercel
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        return res.status(response.status).send(data);
    } catch (error) {
        console.error(`[PROXY-FAIL] ${error.message} -> ${targetUrl}`);
        return res.status(504).json({
            error: "Gateway Timeout / Connection Failed",
            details: error.message,
            targetUrl: targetUrl
        });
    }
}
