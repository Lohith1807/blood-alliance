export default async function handler(req, res) {
    const TARGET = "http://api-blood-alliance.duckdns.org:30267/api/init";

    console.log("[TEST] Starting Direct Fetch to " + TARGET);
    const start = Date.now();

    try {
        const response = await fetch(TARGET, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        const text = await response.text();
        const duration = Date.now() - start;

        return res.status(200).json({
            status: "SUCCESS",
            httpCode: response.status,
            duration: duration + "ms",
            responseLength: text.length,
            preview: text.substring(0, 100)
        });

    } catch (error) {
        const duration = Date.now() - start;
        return res.status(500).json({
            status: "FAILED",
            duration: duration + "ms",
            error: error.message,
            cause: error.cause ? error.cause.message : "Unknown"
        });
    }
}
