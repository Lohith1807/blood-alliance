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

async function syncAllData() {
    console.log('='.repeat(50));
    console.log('🔄 MongoDB Dynamic Clan Loader');
    console.log('='.repeat(50));

    const mongoClient = new MongoClient(MONGO_URL);

    try {
        await mongoClient.connect();
        console.log('✅ Connected to MongoDB');
        const db = mongoClient.db('ClansData');
        const collection = db.collection('clans');

        // Dynamic Fetch: Get all clan tags from the database
        console.log('🔍 Fetching clan list from database...');
        const clans = await collection.find({}, { projection: { _id: 1, name: 1 } }).toArray();

        if (clans.length === 0) {
            console.warn('⚠️ No clans found in database.');
        } else {
            console.log(`✅ Found ${clans.length} clans:`);
            const clanTags = clans.map(c => c._id);

            // Loop through dynamically fetched tags
            for (const tag of clanTags) {
                const clanName = clans.find(c => c._id === tag)?.name || 'Unknown';
                console.log(`   🔸 Detected: ${clanName} (${tag})`);

                // Placeholder for future logic
                // e.g., await updateClan(tag);
            }
        }

        console.log('\nℹ️  Note: Clash of Clans API integration is removed.');
        console.log('ℹ️  This script now verifies database connectivity and lists existing clans.');

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
