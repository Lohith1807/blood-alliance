import { MongoClient } from 'mongodb';

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = "ClansData";
const COLLECTION_NAME = "system_config";
const CONFIG_KEY = "backend_tunnel_url";

export default async function handler(req, res) {
    const report = {
        step1_mongo_connect: "PENDING",
        step2_find_config: "PENDING",
        step3_tunnel_url: "PENDING",
        step4_health_check: "PENDING",
        final_status: "FAIL"
    };

    let client;
    try {
        // Step 1: Connect to Mongo
        if (!MONGO_URL) throw new Error("MONGO_URL env var is missing");
        client = new MongoClient(MONGO_URL);
        await client.connect();
        report.step1_mongo_connect = "SUCCESS";

        // Step 2: Config
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);
        const doc = await collection.findOne({ key: CONFIG_KEY });
        report.step2_find_config = doc ? "FOUND" : "NOT_FOUND";

        // Step 3: Get URL
        const tunnelUrl = doc?.value;
        report.step3_tunnel_url = tunnelUrl || "NULL (Falling back to IP)";

        if (!tunnelUrl) {
            return res.status(200).json(report);
        }

        // Step 4: Validate Tunnel
        const target = `${tunnelUrl}/health`;
        report.target_tested = target;

        const response = await fetch(target, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        report.step4_health_check = `HTTP ${response.status}`;
        if (response.ok) {
            report.final_status = "SUCCESS";
        }

        const data = await response.json();
        report.remote_data = data;

        return res.status(200).json(report);

    } catch (error) {
        report.error = error.message;
        report.stack = error.stack;
        return res.status(500).json(report);
    } finally {
        if (client) await client.close();
    }
}
