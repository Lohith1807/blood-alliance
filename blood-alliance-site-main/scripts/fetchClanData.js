import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually parse .env file
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        let [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            let value = valueParts.join('=');
            key = key.trim();
            value = value.trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    });
}

// Configuration
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
    console.error('❌ MONGO_URL is not defined in .env');
    process.exit(1);
}

// List of clan tags (preserved for reference)
const CLAN_TAGS = [
    '#CYQVL002',    // Blood Bound
    '#2L80LY0CP',   // CLASHING COBRAS
    '#2PRJYL99P',   // Blood Lust
    '#2L80RLGJ8',   // ☠️#Team☠Legend☠
    '#2Y9G28C9Q',   // Impéríal_Kingz
    '#2YUPCY9GV',   // dragon warriors
];

async function syncAllData() {
    console.log('='.repeat(50));
    console.log('🔄 MongoDB Connection Test & Sync Utility');
    console.log('='.repeat(50));

    const mongoClient = new MongoClient(MONGO_URL);

    try {
        await mongoClient.connect();
        console.log('✅ Connected to MongoDB');
        const db = mongoClient.db('ClansData');
        const collection = db.collection('clans');

        // Example: logic to insert data manually could go here
        // Since CoC API is removed, this script no longer fetches live data.
        console.log('ℹ️  Clash of Clans API integration has been removed.');
        console.log('ℹ️  Use Manual Upload via MongoDB Compass or scripts/storeClanData.js');

    } catch (error) {
        console.error('❌ Database connection failed:', error);
    } finally {
        await mongoClient.close();
        console.log('='.repeat(50));
        console.log('🚀 Operation complete');
        console.log('='.repeat(50));
    }
}

syncAllData();
