import { requireAuth } from '../lib/auth.js';
import { logActivity } from '../lib/auditLog.js';

// Dedicated Bot Endpoints as requested
const PERMISSIONS_URL = 'http://clashbotdata.duckdns.org:3015/permissions';
const GUILD_ROLES_URL = 'http://clashbotdata.duckdns.org:3015/guild/roles';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || '1153720899715993681';

// In-memory cache for resolved Discord user details
const userCache = new Map();

// Helper to format Discord user avatar URL
function formatAvatarUrl(userId, avatarHash) {
    if (!avatarHash) {
        try {
            const index = Number((BigInt(userId) >> 22n) % 6n);
            return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
        } catch {
            return 'https://cdn.discordapp.com/embed/avatars/0.png';
        }
    }
    const ext = avatarHash.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=128`;
}

// Fetch with timeout helper
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        return res;
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

// Fetch single Discord user by ID to resolve their username & avatar
async function resolveDiscordUser(userId) {
    if (!userId) return null;
    const cleanId = String(userId).trim();
    if (userCache.has(cleanId)) {
        return userCache.get(cleanId);
    }

    if (DISCORD_BOT_TOKEN) {
        try {
            // Try guild member endpoint first for server nickname
            const memberRes = await fetchWithTimeout(
                `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${cleanId}`,
                { headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` } },
                4000
            );

            if (memberRes.ok) {
                const memberData = await memberRes.json();
                const u = memberData.user || {};
                const info = {
                    id: cleanId,
                    username: u.username || cleanId,
                    globalName: u.global_name || null,
                    nickname: memberData.nick || null,
                    displayName: memberData.nick || u.global_name || u.username || cleanId,
                    avatar: u.avatar || null,
                    avatarUrl: formatAvatarUrl(cleanId, memberData.avatar || u.avatar),
                    roles: memberData.roles || []
                };
                userCache.set(cleanId, info);
                return info;
            }

            // Fallback to global user endpoint
            const userRes = await fetchWithTimeout(
                `https://discord.com/api/v10/users/${cleanId}`,
                { headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` } },
                4000
            );

            if (userRes.ok) {
                const u = await userRes.json();
                const info = {
                    id: cleanId,
                    username: u.username || cleanId,
                    globalName: u.global_name || null,
                    nickname: null,
                    displayName: u.global_name || u.username || cleanId,
                    avatar: u.avatar || null,
                    avatarUrl: formatAvatarUrl(cleanId, u.avatar),
                    roles: []
                };
                userCache.set(cleanId, info);
                return info;
            }
        } catch (err) {
            console.warn(`[BotCommandsAPI] Could not resolve Discord user ${cleanId}:`, err.message);
        }
    }

    const fallback = {
        id: cleanId,
        username: `User_${cleanId.slice(-4)}`,
        displayName: `User (${cleanId})`,
        avatarUrl: formatAvatarUrl(cleanId, null),
        roles: []
    };
    userCache.set(cleanId, fallback);
    return fallback;
}

export default async function handler(req, res) {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Token');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Authenticate strictly for command management
        // Access: Only bot owners and specifically selected admins
        const auth = await requireAuth(req, res, null, { requireCommandManagementAccess: true });
        if (!auth) return;

        const { db, user } = auth;

        // ==========================================
        // 1. GET REQUESTS
        // ==========================================
        if (req.method === 'GET') {
            const { action, q, command } = req.query || {};

            // 1A. SEARCH DISCORD MEMBERS / USERS BY USERNAME OR ID
            if (action === 'search-user') {
                const queryStr = String(q || '').trim();
                if (!queryStr) {
                    return res.status(200).json({ success: true, users: [] });
                }

                const results = [];
                const seenIds = new Set();

                // If input looks like a Discord Snowflake ID (16-20 digits), resolve directly
                if (/^\d{16,20}$/.test(queryStr)) {
                    const resolved = await resolveDiscordUser(queryStr);
                    if (resolved) {
                        results.push(resolved);
                        seenIds.add(resolved.id);
                    }
                }

                // Query Discord guild member search if token configured
                if (DISCORD_BOT_TOKEN) {
                    try {
                        const searchRes = await fetchWithTimeout(
                            `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/search?query=${encodeURIComponent(queryStr)}&limit=15`,
                            { headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` } },
                            5000
                        );

                        if (searchRes.ok) {
                            const members = await searchRes.json();
                            if (Array.isArray(members)) {
                                for (const m of members) {
                                    const u = m.user || {};
                                    if (!u.id || seenIds.has(u.id)) continue;
                                    seenIds.add(u.id);

                                    const userObj = {
                                        id: u.id,
                                        username: u.username || u.id,
                                        globalName: u.global_name || null,
                                        nickname: m.nick || null,
                                        displayName: m.nick || u.global_name || u.username || u.id,
                                        avatar: u.avatar || null,
                                        avatarUrl: formatAvatarUrl(u.id, m.avatar || u.avatar),
                                        roles: m.roles || []
                                    };
                                    userCache.set(u.id, userObj);
                                    results.push(userObj);
                                }
                            }
                        }
                    } catch (searchErr) {
                        console.error('[BotCommandsAPI] Discord member search failed:', searchErr.message);
                    }
                }

                return res.status(200).json({
                    success: true,
                    query: queryStr,
                    users: results
                });
            }

            // 1B. GET SINGLE COMMAND PERMISSIONS FROM BOT SERVER
            if (command) {
                const cleanCmd = String(command).trim().toLowerCase();
                const botRes = await fetchWithTimeout(`${PERMISSIONS_URL}/${encodeURIComponent(cleanCmd)}`, {}, 6000);
                if (botRes.ok) {
                    const data = await botRes.json();
                    return res.status(200).json({ success: true, command: cleanCmd, data });
                }
                return res.status(botRes.status).json({ error: `Command "${cleanCmd}" not found on permissions endpoint` });
            }

            // 1C. GET ALL COMMANDS PERMISSIONS & GUILD ROLES FROM BOT SERVER
            // 1. Fetch permissions exclusively from http://clashbotdata.duckdns.org:3015/permissions
            const pRes = await fetchWithTimeout(PERMISSIONS_URL, {
                headers: { 'Accept': 'application/json' }
            }, 8000);

            if (!pRes.ok) {
                return res.status(502).json({
                    error: `Failed to fetch permissions from ${PERMISSIONS_URL} (HTTP ${pRes.status})`
                });
            }

            const permissions = await pRes.json();
            if (!permissions || typeof permissions !== 'object') {
                return res.status(502).json({
                    error: `Invalid permissions data format received from ${PERMISSIONS_URL}`
                });
            }

            // 2. Fetch guild roles exclusively from http://clashbotdata.duckdns.org:3015/guild/roles
            let roles = [];
            let guildInfo = { id: DISCORD_GUILD_ID, name: 'Blood Alliance' };

            try {
                const rRes = await fetchWithTimeout(GUILD_ROLES_URL, {
                    headers: { 'Accept': 'application/json' }
                }, 8000);

                if (rRes.ok) {
                    const rolesData = await rRes.json();
                    roles = Array.isArray(rolesData.roles) ? rolesData.roles : [];
                    if (rolesData.guildId) guildInfo.id = rolesData.guildId;
                    if (rolesData.guildName) guildInfo.name = rolesData.guildName;
                }
            } catch (err) {
                console.warn(`[BotCommandsAPI] Guild roles fetch from ${GUILD_ROLES_URL} warning:`, err.message);
            }

            // 3. Resolve any members currently specified across commands
            const memberIdsToResolve = new Set();
            for (const cmdConfig of Object.values(permissions)) {
                if (!cmdConfig || !cmdConfig.members) continue;
                if (Array.isArray(cmdConfig.members)) {
                    for (const m of cmdConfig.members) {
                        const id = typeof m === 'object' && m !== null ? (m.id || m.userId) : m;
                        if (id && typeof id === 'string' && /^\d+$/.test(id)) {
                            memberIdsToResolve.add(id);
                        }
                    }
                } else if (typeof cmdConfig.members === 'object') {
                    for (const id of Object.values(cmdConfig.members)) {
                        if (id && typeof id === 'string' && /^\d+$/.test(id)) {
                            memberIdsToResolve.add(id);
                        }
                    }
                }
            }

            const resolvedMembers = {};
            const resolvePromises = Array.from(memberIdsToResolve).slice(0, 30).map(async (uid) => {
                const info = await resolveDiscordUser(uid);
                if (info) resolvedMembers[uid] = info;
            });
            await Promise.allSettled(resolvePromises);

            return res.status(200).json({
                success: true,
                permissions,
                roles,
                guildInfo,
                resolvedMembers,
                commandCount: Object.keys(permissions).length,
                rolesCount: roles.length
            });
        }

        // ==========================================
        // 2. PUT: UPDATE COMMAND PERMISSIONS
        // ==========================================
        if (req.method === 'PUT') {
            const { command, roles, members } = req.body || {};

            if (!command || typeof command !== 'string') {
                return res.status(400).json({ error: 'Command name is required' });
            }

            const cleanCmd = command.trim().toLowerCase().replace(/^(\/|;|!|\?)/, '');
            if (!cleanCmd) {
                return res.status(400).json({ error: 'Invalid command name' });
            }

            // Sanitize roles: { [roleName]: roleId }
            const sanitizedRoles = {};
            if (roles && typeof roles === 'object' && !Array.isArray(roles)) {
                for (const [name, id] of Object.entries(roles)) {
                    if (name && id) {
                        sanitizedRoles[String(name).trim()] = String(id).trim();
                    }
                }
            }

            // Sanitize members: array of member IDs
            let sanitizedMembers = [];
            if (Array.isArray(members)) {
                sanitizedMembers = members.map(m => {
                    if (typeof m === 'object' && m !== null) {
                        return String(m.id || m.userId || '').trim();
                    }
                    return String(m).trim();
                }).filter(Boolean);
            } else if (members && typeof members === 'object') {
                sanitizedMembers = Object.values(members).map(v => String(v).trim()).filter(Boolean);
            }

            // Deduplicate members
            sanitizedMembers = Array.from(new Set(sanitizedMembers));

            const updatePayload = {
                command: cleanCmd,
                roles: sanitizedRoles,
                members: sanitizedMembers
            };

            // Write exclusively to the live bot endpoint: PUT http://clashbotdata.duckdns.org:3015/permissions/:command
            const updateUrl = `${PERMISSIONS_URL}/${encodeURIComponent(cleanCmd)}`;
            const updateRes = await fetchWithTimeout(
                updateUrl,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(updatePayload)
                },
                8000
            );

            if (!updateRes.ok) {
                const errBody = await updateRes.json().catch(() => ({}));
                return res.status(updateRes.status).json({
                    error: errBody.error || `Failed to update permissions at ${updateUrl}: HTTP ${updateRes.status}`
                });
            }

            const updateResult = await updateRes.json().catch(() => ({}));

            // Log activity in MongoDB audit log
            await logActivity(db, {
                user,
                action: 'COMMAND_PERMISSIONS_UPDATE',
                target: `/${cleanCmd}`,
                details: `Updated permissions for command "/${cleanCmd}": Allowed Roles: [${Object.keys(sanitizedRoles).join(', ') || 'None'}], Allowed Members: [${sanitizedMembers.join(', ') || 'None'}]`,
                req
            });

            return res.status(200).json({
                success: true,
                message: `Permissions for command "/${cleanCmd}" updated successfully!`,
                command: cleanCmd,
                data: updateResult.data || {
                    roles: sanitizedRoles,
                    members: sanitizedMembers
                }
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('[BotCommandsAPI] Internal Error:', err);
        return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
    }
}
