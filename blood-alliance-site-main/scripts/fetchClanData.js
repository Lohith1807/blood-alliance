import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clash of Clans API configuration
const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6Ijk2YTcwMTE0LTZiYjUtNDdkNi04MzMyLTM1Y2ZjYjkxYTFhNCIsImlhdCI6MTc2ODQwMzQyNCwic3ViIjoiZGV2ZWxvcGVyL2U3ODVmM2M0LWZmNDQtODVlYS1hYzA2LTA0MGM5YzE3YjVlMiIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjQ5LjQzLjIwMy4xMjYiXSwidHlwZSI6ImNsaWVudCJ9XX0.CwdoRhI_cGbO_jsM4MXqYDABP5KYbgxOlTcAYV-JtR9wfJXMP9dKOSIFBxF3l6gbNLgu8rpa4QCyIe1FJA8kbA';
const BASE_URL = 'https://api.clashofclans.com/v1';

// List of clan tags to fetch (from clans.json)
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

async function fetchAllClansData() {
    console.log('='.repeat(50));
    console.log('🔄 Starting Clan Data Download');
    console.log('='.repeat(50));

    const allClansData = [];

    for (const tag of CLAN_TAGS) {
        try {
            const clanData = await fetchClanData(tag);
            allClansData.push(clanData);
            console.log(`✅ Successfully fetched: ${clanData.name} (${clanData.members}/50 members)`);

            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`❌ Error fetching ${tag}:`, error.message);
        }
    }

    // Save all clans data as an array
    const outputPath = path.join(__dirname, '..', 'clan_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(allClansData, null, 4), 'utf8');

    console.log('='.repeat(50));
    console.log(`✅ Saved ${allClansData.length} clans to clan_data.json`);
    console.log('='.repeat(50));

    return allClansData;
}

// Run the fetch
fetchAllClansData();
