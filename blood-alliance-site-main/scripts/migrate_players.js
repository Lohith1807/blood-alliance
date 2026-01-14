
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

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
    console.error('❌ MONGO_URL is not defined in .env');
    process.exit(1);
}

const migratePlayers = async () => {
    let client;
    try {
        console.log('🔌 Connecting to MongoDB...');
        client = new MongoClient(MONGO_URL);
        await client.connect();
        const db = client.db('ClansData');
        const collection = db.collection('players');

        // Read players.json
        const playersPath = path.resolve(__dirname, '../src/data/players.json');
        if (!fs.existsSync(playersPath)) {
            console.error('❌ src/data/players.json not found!');
            // If file is gone, maybe migration already happened?
            const count = await collection.countDocuments();
            console.log(`ℹ️ Current MongoDB count: ${count}`);
            return;
        }

        const playersData = JSON.parse(fs.readFileSync(playersPath, 'utf-8'));
        console.log(`📂 Found ${playersData.length} players in JSON file.`);

        if (playersData.length === 0) {
            console.log('⚠️ No players to migrate.');
            return;
        }

        // Use playerTag as the unique _id
        const operations = playersData.map(player => ({
            updateOne: {
                filter: { _id: player.playerTag },
                update: { $set: { ...player, _id: player.playerTag } },
                upsert: true
            }
        }));

        console.log('🚀 Uploading to MongoDB...');
        const result = await collection.bulkWrite(operations);
        console.log(`✅ Migration complete! Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        if (client) await client.close();
    }
};

migratePlayers();
