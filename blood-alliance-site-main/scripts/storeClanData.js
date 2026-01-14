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

// MongoDB connection URL
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
    console.error('❌ MONGO_URL is not defined in .env');
    process.exit(1);
}

async function storeClanData() {
    const client = new MongoClient(MONGO_URL);

    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Connected successfully!');

        // Read the clan data from JSON file
        const clanDataPath = path.join(__dirname, '..', 'clan_data.json');

        if (!fs.existsSync(clanDataPath)) {
            console.error('❌ clan_data.json not found. Please run fetchClanData.js first.');
            return;
        }

        const clanDataRaw = fs.readFileSync(clanDataPath, 'utf8');
        const clans = JSON.parse(clanDataRaw);

        if (!Array.isArray(clans)) {
            console.error('❌ clan_data.json is not an array.');
            return;
        }

        // Get the database and collection
        const db = client.db('ClansData');
        const collection = db.collection('clans');

        console.log(`Processing ${clans.length} clans...`);

        // Perform bulk operations for efficiency
        const operations = clans.map(clan => ({
            replaceOne: {
                filter: { _id: clan.tag },
                replacement: {
                    _id: clan.tag,
                    ...clan,
                    updatedAt: new Date()
                },
                upsert: true
            }
        }));

        const result = await collection.bulkWrite(operations);

        console.log(`✅ MongoDB Sync Complete:`);
        console.log(`   - Total processed: ${clans.length}`);
        console.log(`   - Upserted: ${result.upsertedCount}`);
        console.log(`   - Modified: ${result.modifiedCount}`);

    } catch (error) {
        console.error('Error storing clan data:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed.');
    }
}

storeClanData();
