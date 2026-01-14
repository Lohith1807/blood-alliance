import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clash of Clans API configuration
const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6Ijk2YTcwMTE0LTZiYjUtNDdkNi04MzMyLTM1Y2ZjYjkxYTFhNCIsImlhdCI6MTc2ODQwMzQyNCwic3ViIjoiZGV2ZWxvcGVyL2U3ODVmM2M0LWZmNDQtODVlYS1hYzA2LTA0MGM5YzE3YjVlMiIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjQ5LjQzLjIwMy4xMjYiXSwidHlwZSI6ImNsaWVudCJ9XX0.CwdoRhI_cGbO_jsM4MXqYDABP5KYbgxOlTcAYV-JtR9wfJXMP9dKOSIFBxF3l6gbNLgu8rpa4QCyIe1FJA8kbA';
const BASE_URL = 'https://api.clashofclans.com/v1';

// MongoDB connection URL
const MONGO_URL = 'mongodb+srv://lohithreddy1819april_db_user:nHYI3nUFGWztAPwR@clansdata.auhlwu2.mongodb.net/?appName=ClansData';

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

        // Still save a local backup just in case
        const outputPath = path.join(__dirname, '..', 'clan_data.json');
        fs.writeFileSync(outputPath, JSON.stringify(allClansData, null, 4), 'utf8');
        console.log(`\n💾 Local backup saved to clan_data.json`);

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
