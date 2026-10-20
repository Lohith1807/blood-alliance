import { requireAuth } from '../lib/auth.js';
import { logActivity } from '../lib/auditLog.js';

const BOT_SERVER_URL = 'http://clashbotdata.duckdns.org:3015/clanrules';

async function fetchFromBot(path = '', options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
        const url = path ? `${BOT_SERVER_URL}/${path.replace(/^\/+/, '')}` : BOT_SERVER_URL;
        const res = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });
        clearTimeout(timeout);
        if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            return { error: errBody.error || `HTTP ${res.status}` };
        }
        return await res.json();
    } catch (err) {
        clearTimeout(timeout);
        return { error: err.message };
    }
}

export default async function handler(req, res) {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Token');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Authenticate with clan-rules module check
        const auth = await requireAuth(req, res, null, { requiredModule: 'clan-rules' });
        if (!auth) return;

        const { db, user } = auth;
        const clansCollection = db.collection('clans');

        const isSuperUser = user.isOwner || user.role === 'admin';
        const userAssignedClans = Array.isArray(user.assignedClans)
            ? user.assignedClans.map(t => String(t).toUpperCase().trim())
            : [];

        // 1. GET CLAN RULES
        if (req.method === 'GET') {
            const { tag } = req.query || {};

            // Fetch current bot data
            const botData = await fetchFromBot();
            const botClans = (botData && botData.clans) ? botData.clans : {};
            const defaultRules = (botData && botData.default) ? botData.default : {
                title: '{clanName} Rules',
                image: '',
                thumbnail: '',
                footer: { text: '', iconURL: '' },
                color: '#E74C3C',
                rules: []
            };

            // If a single clan tag is queried
            if (tag) {
                const cleanTag = String(tag).trim();
                const clanTag = cleanTag.startsWith('#') ? cleanTag.toUpperCase() : `#${cleanTag.toUpperCase()}`;

                // Authorization check: leader must have this clan assigned
                if (!isSuperUser && !userAssignedClans.includes(clanTag)) {
                    return res.status(403).json({
                        error: 'You do not have permission to view or manage rules for this clan.'
                    });
                }

                // Check bot endpoint for specific clan
                const specificBot = await fetchFromBot(encodeURIComponent(clanTag));
                const clanFromDb = await clansCollection.findOne({
                    $or: [{ _id: clanTag }, { tag: clanTag }]
                });

                const ruleData = (!specificBot.error && specificBot.rules) 
                    ? specificBot 
                    : (botClans[clanTag] || clanFromDb?.clanRules || defaultRules);

                return res.status(200).json({
                    success: true,
                    clan: {
                        tag: clanTag,
                        name: clanFromDb?.name || clanTag,
                        badgeUrls: clanFromDb?.badgeUrls,
                        rulesData: ruleData
                    }
                });
            }

            // Fetch all accessible clans from MongoDB
            let mongoFilter = {};
            if (!isSuperUser) {
                if (userAssignedClans.length === 0) {
                    return res.status(200).json({
                        success: true,
                        clans: [],
                        isSuperUser: false,
                        message: 'No clans assigned to your account. Please contact an Alliance Admin.'
                    });
                }
                mongoFilter = {
                    $or: [
                        { _id: { $in: userAssignedClans } },
                        { tag: { $in: userAssignedClans } }
                    ]
                };
            }

            const dbClans = await clansCollection.find(mongoFilter).sort({ order: 1, name: 1 }).toArray();

            // Fetch all users to determine who has access to each clan
            const allUsers = await db.collection('users').find({}, { projection: { passwordHash: 0, salt: 0 } }).toArray();

            const combinedClans = dbClans.map((c, index) => {
                const cTag = (c.tag || c._id).toUpperCase();
                const bClan = botClans[cTag] || c.clanRules || {};

                // Find users who have access to this specific clan
                const clanAccessibleUsers = allUsers.filter(u => {
                    const uEmail = u.email?.toLowerCase();
                    const isUserOwner = uEmail === 'lohithreddy1819@gmail.com' || Boolean(u.isOwner);
                    if (isUserOwner || u.role === 'admin') return true;
                    const assigned = Array.isArray(u.assignedClans)
                        ? u.assignedClans.map(t => String(t).toUpperCase().trim())
                        : [];
                    return assigned.includes(cTag);
                }).map(u => ({
                    id: u._id.toString(),
                    email: u.email,
                    role: u.role,
                    isOwner: u.email?.toLowerCase() === 'lohithreddy1819@gmail.com' || Boolean(u.isOwner),
                    isSpecificLeader: u.role === 'leader' || (Array.isArray(u.assignedClans) && u.assignedClans.includes(cTag))
                }));

                return {
                    tag: cTag,
                    name: c.name,
                    order: c.order !== undefined ? c.order : index,
                    clanLevel: c.clanLevel || 1,
                    badgeUrls: c.badgeUrls,
                    accessibleUsers: clanAccessibleUsers,
                    title: bClan.title || `${c.name} Rules`,
                    color: bClan.color || '#E74C3C',
                    image: bClan.image || '',
                    thumbnail: bClan.thumbnail || '',
                    footer: bClan.footer || { text: '', iconURL: '' },
                    rules: Array.isArray(bClan.rules) ? bClan.rules : []
                };
            });

            return res.status(200).json({
                success: true,
                count: combinedClans.length,
                isSuperUser,
                defaultRules,
                clans: combinedClans
            });
        }

        // 2. PUT / POST: UPDATE CLAN RULES (via Bot Server + DB backup)
        if (req.method === 'PUT' || req.method === 'POST') {
            const { tag, title, color, image, thumbnail, footer, rules } = req.body || {};

            if (!tag) {
                return res.status(400).json({ error: 'Clan tag is required' });
            }

            const cleanTag = String(tag).trim();
            const clanTag = cleanTag.startsWith('#') ? cleanTag.toUpperCase() : `#${cleanTag.toUpperCase()}`;

            // Authorization: If user is leader, verify tag is in assignedClans
            if (!isSuperUser && !userAssignedClans.includes(clanTag)) {
                return res.status(403).json({
                    error: `Forbidden: You do not have permission to edit rules for clan ${clanTag}`
                });
            }

            const clanFromDb = await clansCollection.findOne({
                $or: [{ _id: clanTag }, { tag: clanTag }]
            });

            const cleanRules = Array.isArray(rules) 
                ? rules.map(r => String(r).trim()).filter(Boolean)
                : [];

            const payload = {
                title: title || `${clanFromDb?.name || clanTag} Rules`,
                image: image ? String(image).trim() : '',
                thumbnail: thumbnail ? String(thumbnail).trim() : '',
                footer: {
                    text: footer?.text ? String(footer.text).trim() : '',
                    iconURL: footer?.iconURL ? String(footer.iconURL).trim() : ''
                },
                color: color || '#E74C3C',
                rules: cleanRules
            };

            // Post to bot server endpoint: http://clashbotdata.duckdns.org:3015/clanrules/:tag
            const botResponse = await fetchFromBot(encodeURIComponent(clanTag), {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            // Sync to MongoDB clans collection as backup & fast caching
            await clansCollection.updateOne(
                { $or: [{ _id: clanTag }, { tag: clanTag }] },
                {
                    $set: {
                        clanRules: payload,
                        clanRulesUpdatedAt: new Date(),
                        clanRulesUpdatedBy: user.email
                    }
                }
            );

            await logActivity(db, {
                user,
                action: 'CLAN_RULES_EDIT',
                target: `${clanFromDb?.name || clanTag} (${clanTag})`,
                details: `Updated clan rules on bot server and database (${cleanRules.length} rules, title: '${payload.title}')`,
                req
            });

            return res.status(200).json({
                success: true,
                message: `Rules updated successfully for ${clanFromDb?.name || clanTag}`,
                data: payload,
                botResponse
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Clan Rules API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
