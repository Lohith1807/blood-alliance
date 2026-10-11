import { requireAuth } from '../lib/auth.js';

const TICKET_DATA_URL = 'http://clashbotdata.duckdns.org:3015/ticketdata';
const BASE_SERVER_URL = 'http://clashbotdata.duckdns.org:3015';

// Format transcript link (returns absolute URL or null)
function formatTranscriptUrl(transcript) {
    if (!transcript) return null;
    const str = String(transcript).trim();
    if (!str) return null;
    if (str.startsWith('http://') || str.startsWith('https://')) {
        return str;
    }
    const cleanPath = str.replace(/^\/+/, '');
    return `${BASE_SERVER_URL}/${cleanPath}`;
}

// Fetch ticket data exclusively from the provided endpoint
async function fetchTicketData() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(TICKET_DATA_URL, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
        throw new Error(`Failed to fetch ticket data: HTTP ${response.status}`);
    }

    return await response.json();
}

function normalizeTickets(ticketData) {
    if (!ticketData) {
        return { categories: { fwa: [], warEntry: [], allianceApply: [] }, tickets: [], stats: {} };
    }

    const formatCategory = (catData, catName) => {
        if (!catData) return [];
        const items = Array.isArray(catData) ? catData : Object.values(catData);
        return items.map((t, idx) => {
            const ownerName = t.ticketOwnerName || (t.userId ? `User #${String(t.userId).slice(-4)}` : 'Unknown');
            const claimedName = t.claimedUserNickname || (t.claimedBy ? `Staff #${String(t.claimedBy).slice(-4)}` : null);

            return {
                ticketId: t.ticketId || t.id || `TICKET-${idx + 1}`,
                userId: t.userId || t.user_id || 'Unknown',
                userName: ownerName,
                userHandle: t.ticketOwnerName || t.userId || '',
                userAvatar: null,
                channelId: t.channelId || null,
                ticketOpenedDate: t.ticketOpenedDate || t.date || t.createdAt || null,
                claimedBy: t.claimedBy || t.claimed_by || null,
                claimedByName: claimedName,
                claimedByHandle: t.claimedUserNickname || t.claimedBy || null,
                claimedByAvatar: null,
                transcript: formatTranscriptUrl(t.transcript || t.transcriptUrl),
                category: catName,
                ticketType: catName === 'warEntry' ? 'War Entry' :
                            catName === 'allianceApply' ? 'Alliance Apply' :
                            'FWA'
            };
        });
    };

    const formatted = {
        fwa: formatCategory(ticketData.fwa, 'fwa'),
        warEntry: formatCategory(ticketData.warEntry, 'warEntry'),
        allianceApply: formatCategory(ticketData.allianceApply, 'allianceApply')
    };

    const allTickets = [
        ...formatted.fwa,
        ...formatted.warEntry,
        ...formatted.allianceApply
    ];

    const stats = {
        total: allTickets.length,
        claimed: allTickets.filter(t => Boolean(t.claimedBy)).length,
        unclaimed: allTickets.filter(t => !t.claimedBy).length,
        transcripts: allTickets.filter(t => Boolean(t.transcript)).length,
        fwaCount: formatted.fwa.length,
        warEntryCount: formatted.warEntry.length,
        allianceApplyCount: formatted.allianceApply.length
    };

    return { categories: formatted, tickets: allTickets, stats };
}

export default async function handler(req, res) {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Token');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Role check: requires auth (admin or mod)
    const auth = await requireAuth(req, res);
    if (!auth) return;

    try {
        if (req.method === 'GET') {
            const rawData = await fetchTicketData();
            const { categories, tickets, stats } = normalizeTickets(rawData);

            return res.status(200).json({
                success: true,
                source: TICKET_DATA_URL,
                categories,
                stats,
                tickets
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Ticket Data Fetch Error:', error.message);
        return res.status(502).json({
            error: 'Failed to fetch ticket data from endpoint',
            details: error.message
        });
    }
}
