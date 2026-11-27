import clientPromise from '../lib/mongodb.js';
import { requireAuth } from '../lib/auth.js';
import { logActivity } from '../lib/auditLog.js';

const DISCORD_DB_NAME = 'discord';
const CLAN_DETAILS_COLLECTION = 'clandetails';

const DISCORD_EMOJI_MAP = {
    ':orange_circle:': '🟠',
    ':purple_circle:': '🟣',
    ':crossed_swords:': '⚔️',
    ':white_check_mark:': '✅',
    ':punch_tone1:': '👊🏻',
    ':dart:': '🎯'
};

function normalizeDiscordEmojis(value) {
    if (typeof value !== 'string') return '';
    let out = value.replace(/:star:\uFE0F?/g, '⭐');
    for (const [code, emoji] of Object.entries(DISCORD_EMOJI_MAP)) {
        out = out.split(code).join(emoji);
    }
    return out;
}

function normalizeScenarioMap(obj) {
    const src = obj && typeof obj === 'object' ? obj : {};
    return {
        win: normalizeDiscordEmojis(src.win ?? ''),
        lose: normalizeDiscordEmojis(src.lose ?? ''),
        bl: normalizeDiscordEmojis(src.bl ?? ''),
        mis: normalizeDiscordEmojis(src.mis ?? '')
    };
}

function buildDefaultRules(defaultDoc) {
    const data = defaultDoc?.data || {};
    return {
        title: data.title || '{clanName} Rules',
        image: data.image || '',
        thumbnail: data.thumbnail || '',
        footer: data.footer || { text: '', iconURL: '' },
        color: data.color || '#E74C3C',
        rules: Array.isArray(data.rules) ? data.rules : [],
        warrules: data.warrules || null
    };
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
        const client = await clientPromise;
        const clanDetailsCollection = client.db(DISCORD_DB_NAME).collection(CLAN_DETAILS_COLLECTION);

        const isSuperUser = user.isOwner || user.role === 'admin';
        const userAssignedClans = Array.isArray(user.assignedClans)
            ? user.assignedClans.map(t => String(t).toUpperCase().trim())
            : [];

        // 1. GET CLAN RULES
        if (req.method === 'GET') {
            const { tag, type } = req.query || {};

            const defaultDoc = await clanDetailsCollection.findOne({ key: '_defaultRules' });
            const defaultRules = buildDefaultRules(defaultDoc);
            const defaultWarRules = defaultRules.warrules || null;

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

                const [clanFromDb, detailDoc] = await Promise.all([
                    clansCollection.findOne({ $or: [{ _id: clanTag }, { tag: clanTag }] }),
                    clanDetailsCollection.findOne(
                        { key: clanTag },
                        { projection: { key: 1, 'data.rulesConfig': 1, 'data.pinmessage': 1, 'data.pinmessage2': 1, 'data.warcopy': 1 } }
                    )
                ]);

                const rulesConfig = detailDoc?.data?.rulesConfig;
                const pinmessage = normalizeScenarioMap(detailDoc?.data?.pinmessage);
                const pinmessage2 = normalizeScenarioMap(detailDoc?.data?.pinmessage2);
                const warcopy = normalizeScenarioMap(detailDoc?.data?.warcopy);

                // If specific warules query requested
                if (type === 'warules' || type === 'warrules') {
                    const warData = rulesConfig?.warrules || clanFromDb?.warRules || defaultWarRules;
                    return res.status(200).json({
                        success: true,
                        tag: clanTag,
                        warrules: warData
                    });
                }

                const ruleData = (rulesConfig && Array.isArray(rulesConfig.rules))
                    ? rulesConfig
                    : (clanFromDb?.clanRules || defaultRules);

                const warData = rulesConfig?.warrules || clanFromDb?.warRules || defaultWarRules;

                return res.status(200).json({
                    success: true,
                    clan: {
                        tag: clanTag,
                        name: clanFromDb?.name || clanTag,
                        badgeUrls: clanFromDb?.badgeUrls,
                        rulesData: ruleData,
                        warrules: warData,
                        pinmessage,
                        pinmessage2,
                        warcopy
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

            const [dbClans, detailDocs, allUsers] = await Promise.all([
                clansCollection.find(mongoFilter).sort({ order: 1, name: 1 }).toArray(),
                clanDetailsCollection.find(
                    { key: { $regex: /^#/ } },
                    { projection: { key: 1, 'data.rulesConfig': 1, 'data.pinmessage': 1, 'data.pinmessage2': 1, 'data.warcopy': 1 } }
                ).toArray(),
                db.collection('users').find({}, { projection: { passwordHash: 0, salt: 0 } }).toArray()
            ]);

            const detailsByTag = {};
            const pinByTag = {};
            const pin2ByTag = {};
            const warcopyByTag = {};
            for (const doc of detailDocs) {
                if (doc?.key) {
                    const k = String(doc.key).toUpperCase();
                    detailsByTag[k] = doc.data?.rulesConfig || null;
                    pinByTag[k] = doc.data?.pinmessage || null;
                    pin2ByTag[k] = doc.data?.pinmessage2 || null;
                    warcopyByTag[k] = doc.data?.warcopy || null;
                }
            }

            const combinedClans = dbClans.map((c, index) => {
                const cTag = (c.tag || c._id).toUpperCase();
                const dConfig = detailsByTag[cTag] || c.clanRules || {};
                const clanWarRules = detailsByTag[cTag]?.warrules || c.warRules || defaultWarRules || null;
                const clanPinMessage = normalizeScenarioMap(pinByTag[cTag]);
                const clanPinMessage2 = normalizeScenarioMap(pin2ByTag[cTag]);
                const clanWarCopy = normalizeScenarioMap(warcopyByTag[cTag]);

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
                    title: dConfig.title || `${c.name} Rules`,
                    color: dConfig.color || '#E74C3C',
                    image: dConfig.image || '',
                    thumbnail: dConfig.thumbnail || '',
                    footer: dConfig.footer || { text: '', iconURL: '' },
                    rules: Array.isArray(dConfig.rules) ? dConfig.rules : [],
                    warrules: clanWarRules,
                    pinmessage: clanPinMessage,
                    pinmessage2: clanPinMessage2,
                    warcopy: clanWarCopy
                };
            });

            return res.status(200).json({
                success: true,
                count: combinedClans.length,
                isSuperUser,
                defaultRules,
                defaultWarRules,
                clans: combinedClans
            });
        }

        // 2. PUT / POST: UPDATE CLAN RULES AND/OR WAR RULES (discord.clandetails + ClansData.clans)
        if (req.method === 'PUT' || req.method === 'POST') {
            const { tag, title, color, image, thumbnail, footer, rules, warrules, warRules, pinmessage, pinmessage2, warcopy, warmessage } = req.body || {};

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

            const [clanFromDb, detailDoc] = await Promise.all([
                clansCollection.findOne({ $or: [{ _id: clanTag }, { tag: clanTag }] }),
                clanDetailsCollection.findOne(
                    { key: clanTag },
                    { projection: { key: 1, 'data.rulesConfig': 1 } }
                )
            ]);

            const existingConfig = detailDoc?.data?.rulesConfig || clanFromDb?.clanRules || {};
            const mongoSet = {};
            const discordSet = {};
            const discordUnset = {};
            const updatedSummary = [];

            // A. Update Clan Embed Rules if provided
            let embedPayload = null;
            if (rules !== undefined || title !== undefined || color !== undefined || image !== undefined || thumbnail !== undefined || footer !== undefined) {
                const cleanRules = Array.isArray(rules) 
                    ? rules.map(r => String(r).trim()).filter(Boolean)
                    : (existingConfig.rules || []);

                embedPayload = {
                    title: title || `${clanFromDb?.name || clanTag} Rules`,
                    image: image !== undefined ? String(image).trim() : (existingConfig.image || ''),
                    thumbnail: thumbnail !== undefined ? String(thumbnail).trim() : (existingConfig.thumbnail || ''),
                    footer: {
                        text: footer?.text !== undefined ? String(footer.text).trim() : (existingConfig.footer?.text || ''),
                        iconURL: footer?.iconURL !== undefined ? String(footer.iconURL).trim() : (existingConfig.footer?.iconURL || '')
                    },
                    color: color || existingConfig.color || '#E74C3C',
                    rules: cleanRules
                };

                discordSet['data.rulesConfig.title'] = embedPayload.title;
                discordSet['data.rulesConfig.image'] = embedPayload.image;
                discordSet['data.rulesConfig.thumbnail'] = embedPayload.thumbnail;
                discordSet['data.rulesConfig.footer'] = embedPayload.footer;
                discordSet['data.rulesConfig.color'] = embedPayload.color;
                discordSet['data.rulesConfig.rules'] = embedPayload.rules;
                discordSet.updatedAt = new Date();

                mongoSet.clanRules = embedPayload;
                mongoSet.clanRulesUpdatedAt = new Date();
                mongoSet.clanRulesUpdatedBy = user.email;
                updatedSummary.push(`clan rules (${cleanRules.length} items)`);
            }

            // B. Update War Rules if provided
            const targetWarRules = warrules || warRules;
            if (targetWarRules && typeof targetWarRules === 'object') {
                discordSet['data.rulesConfig.warrules'] = targetWarRules;
                discordSet.updatedAt = new Date();

                mongoSet.warRules = targetWarRules;
                mongoSet.warRulesUpdatedAt = new Date();
                mongoSet.warRulesUpdatedBy = user.email;
                updatedSummary.push(`war rules (${Object.keys(targetWarRules).join(', ')})`);
            }

            // C. Update War Pin Message if provided
            if (pinmessage && typeof pinmessage === 'object') {
                const cleanPin = normalizeScenarioMap(pinmessage);
                discordSet['data.pinmessage'] = cleanPin;
                discordSet.updatedAt = new Date();
                updatedSummary.push('war pin messages');
            }

            // C2. Update optional War Pin Message 2 if provided (save only if non-empty, else unset)
            if (pinmessage2 && typeof pinmessage2 === 'object') {
                const cleanPin2 = normalizeScenarioMap(pinmessage2);
                const hasAnyPin2 = Object.values(cleanPin2).some(v => v.trim().length > 0);
                if (hasAnyPin2) {
                    discordSet['data.pinmessage2'] = cleanPin2;
                    discordSet.updatedAt = new Date();
                    updatedSummary.push('war pin message 2');
                } else {
                    discordUnset['data.pinmessage2'] = '';
                    discordSet.updatedAt = new Date();
                }
            }

            // D. Update Clan Mail (warcopy) if provided
            const targetWarCopy = warcopy || warmessage;
            if (targetWarCopy && typeof targetWarCopy === 'object') {
                const cleanCopy = normalizeScenarioMap(targetWarCopy);
                discordSet['data.warcopy'] = cleanCopy;
                discordSet.updatedAt = new Date();
                updatedSummary.push('clan mail');
            }

            const dbWrites = [];
            if (Object.keys(discordSet).length > 0 || Object.keys(discordUnset).length > 0) {
                const discordUpdate = {};
                if (Object.keys(discordSet).length > 0) discordUpdate.$set = discordSet;
                if (Object.keys(discordUnset).length > 0) discordUpdate.$unset = discordUnset;
                dbWrites.push(
                    clanDetailsCollection.updateOne(
                        { key: clanTag },
                        discordUpdate,
                        { upsert: true }
                    )
                );
            }
            if (Object.keys(mongoSet).length > 0) {
                dbWrites.push(
                    clansCollection.updateOne(
                        { $or: [{ _id: clanTag }, { tag: clanTag }] },
                        { $set: mongoSet }
                    )
                );
            }
            if (dbWrites.length > 0) {
                await Promise.all(dbWrites);
            }

            const detailsStr = updatedSummary.length > 0
                ? `Updated ${updatedSummary.join(' and ')} in discord.clandetails`
                : 'Clan rules update request processed';

            await logActivity(db, {
                user,
                action: 'CLAN_RULES_EDIT',
                target: `${clanFromDb?.name || clanTag} (${clanTag})`,
                details: detailsStr,
                req
            });

            return res.status(200).json({
                success: true,
                message: `Rules updated successfully for ${clanFromDb?.name || clanTag}`,
                data: embedPayload,
                warData: targetWarRules
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Clan Rules API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
