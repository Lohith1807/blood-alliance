import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection URL
const MONGO_URL = 'mongodb+srv://lohithreddy1819april_db_user:nHYI3nUFGWztAPwR@clansdata.auhlwu2.mongodb.net/?appName=ClansData';

async function storeClanData() {
    const client = new MongoClient(MONGO_URL);

    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Connected successfully!');

        // Read the clan data from JSON file
        const clanDataPath = path.join(__dirname, '..', 'clan_data.json');
        const clanDataRaw = fs.readFileSync(clanDataPath, 'utf8');
        const clanData = JSON.parse(clanDataRaw);

        // Get the database and collection
        const db = client.db('ClansData');
        const collection = db.collection('clans');

        // Use clan tag as the _id (key)
        const document = {
            _id: clanData.tag,  // Using clan tag as the unique key
            ...clanData,
            updatedAt: new Date()
        };

        // Upsert the document (insert or update if exists)
        const result = await collection.replaceOne(
            { _id: clanData.tag },
            document,
            { upsert: true }
        );

        if (result.upsertedCount > 0) {
            console.log(`✅ Inserted new clan data with tag: ${clanData.tag}`);
        } else if (result.modifiedCount > 0) {
            console.log(`✅ Updated existing clan data with tag: ${clanData.tag}`);
        } else {
            console.log(`ℹ️ Clan data with tag ${clanData.tag} already exists and is unchanged`);
        }

        console.log('Clan Name:', clanData.name);
        console.log('Members:', clanData.members);

    } catch (error) {
        console.error('Error storing clan data:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed.');
    }
}

storeClanData();
