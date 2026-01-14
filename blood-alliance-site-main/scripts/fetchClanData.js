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

            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }

            process.env[key] = value;
        }
    });
}

// Configuration
const API_KEY = process.env.COC_API_KEY;
const BASE_URL = 'https://api.clashofclans.com/v1';
const MONGO_URL = process.env.MONGO_URL;

if (!API_KEY) {
    console.error('❌ COC_API_KEY is not defined in .env');
    process.exit(1);
}

if (!MONGO_URL) {
    console.error('❌ MONGO_URL is not defined in .env');
    process.exit(1);
}

// List of clan tags to fetch
const CLAN_TAGS = [
    '#CYQVL002',    // Blood Bound
    '#2L80LY0CP',   // CLASHING COBRAS
    '#2PRJYL99P',   // Blood Lust
    '#2L80RLGJ8',   // ☠️#Team☠Legend☠
    '#2Y9G28C9Q',   // Impéríal_Kingz
    '#2YUPCY9GV',   // dragon warriors
];

async function fetchClanData(clanTag) {
    const encodedTag = encodeURIComponent(clanTag);
    const url = `${BASE_URL}/clans/${encodedTag}`;

    console.log(`Fetching data for clan: ${clanTag}...`);

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch clan ${clanTag}: ${response.status} - ${errorText}`);
    }

    return response.json();
}

async function syncAllData() {
    console.log('='.repeat(50));
    console.log('🔄 Starting Live COC to MongoDB Sync');
    console.log('='.repeat(50));

    const mongoClient = new MongoClient(MONGO_URL);
    const allClansData = [];

    try {
        await mongoClient.connect();
        console.log('✅ Connected to MongoDB');
        const db = mongoClient.db('ClansData');
        const collection = db.collection('clans');

        for (const tag of CLAN_TAGS) {
            try {
                const clanData = await fetchClanData(tag);

                // Prepare document for MongoDB
                const document = {
                    _id: clanData.tag,
                    ...clanData,
                    updatedAt: new Date()
                };

                // Sync to MongoDB immediately
                await collection.replaceOne({ _id: clanData.tag }, document, { upsert: true });
                console.log(` ✅ Synced: ${clanData.name} to Database`);

                allClansData.push(clanData);

                // Delay to be nice to COC API
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(` ❌ Error syncing ${tag}:`, error.message);
            }
        }

    } catch (error) {
        console.error('❌ Database connection failed:', error);
    } finally {
        await mongoClient.close();
        console.log('='.repeat(50));
        console.log('🚀 Sync operation complete');
        console.log('='.repeat(50));
    }
}

syncAllData();
