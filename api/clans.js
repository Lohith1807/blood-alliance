import { ObjectId } from 'mongodb';
import clientPromise from '../lib/mongodb.js';
import { requireAuth } from '../lib/auth.js';
import { logActivity } from '../lib/auditLog.js';

export default async function handler(req, res) {
    // 1. CORS & Security Headers
    const origin = req.headers.origin;
    const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

    if (isDev && origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (process.env.ALLOWED_ORIGIN && origin === process.env.ALLOWED_ORIGIN) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    if (origin) {
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Token');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const client = await clientPromise;
        const db = client.db('ClansData');
        const collection = db.collection('clans');

        // PUBLIC GET
        if (req.method === 'GET') {
            res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
            const { tag } = req.query;

            if (tag) {
                const cleanTag = String(tag).trim();
                const clanTag = cleanTag.startsWith('#') ? cleanTag : `#${cleanTag}`;

                let clan = await collection.findOne({ _id: clanTag });
                if (!clan) {
                    // Also try finding by tag field or ObjectId if _id is not tag
                    clan = await collection.findOne({ tag: clanTag });
                }

                if (!clan) {
                    return res.status(404).json({ error: 'Clan not found' });
                }
                return res.status(200).json(clan);
            }

            // Fetch all clans, sorting by order if present
            const clans = await collection.find({}).sort({ order: 1, name: 1 }).toArray();

            return res.status(200).json({
                success: true,
                count: clans.length,
                source: 'mongodb',
                clans: clans
            });
        }

        // MUTATIONS (POST, PUT, PATCH, DELETE) REQUIRE AUTH (admin or mod)
        const auth = await requireAuth(req, res);
        if (!auth) return; // response handled by requireAuth

        // REORDER CLANS (PATCH or POST with action === 'reorder')
        if (req.method === 'PATCH' || (req.method === 'POST' && req.body?.action === 'reorder')) {
            const { orderedIds, orderedTags } = req.body || {};
            const list = orderedTags || orderedIds || [];

            if (!Array.isArray(list) || list.length === 0) {
                return res.status(400).json({ error: 'orderedTags array is required' });
            }

            // Bulk write to update order indices
            const operations = list.map((tagOrId, index) => {
                let filter = { _id: tagOrId };
                if (typeof tagOrId === 'string' && tagOrId.length === 24 && !tagOrId.startsWith('#')) {
                    try {
                        filter = { $or: [{ _id: new ObjectId(tagOrId) }, { _id: tagOrId }, { tag: tagOrId }] };
                    } catch {
                        filter = { _id: tagOrId };
                    }
                } else if (tagOrId.startsWith('#')) {
                    filter = { $or: [{ _id: tagOrId }, { tag: tagOrId }] };
                }

                return {
                    updateMany: {
                        filter,
                        update: { $set: { order: index, updatedAt: new Date() } }
                    }
                };
            });

            await collection.bulkWrite(operations);

            await logActivity(db, {
                user: auth.user,
                action: 'CLAN_REORDER',
                target: `${list.length} Clans`,
                details: `Updated sequence and display order for ${list.length} clans`,
                req
            });

            const updatedClans = await collection.find({}).sort({ order: 1, name: 1 }).toArray();
            return res.status(200).json({
                success: true,
                message: 'Clan order updated successfully',
                clans: updatedClans
            });
        }

        // ADD CLAN (POST)
        if (req.method === 'POST') {
            const { tag, name, description, clanLevel, badgeUrls, type, clanPoints, requiredTownhallLevel } = req.body || {};

            if (!tag || !name) {
                return res.status(400).json({ error: 'Clan tag and name are required' });
            }

            const cleanTag = String(tag).trim();
            const clanTag = cleanTag.startsWith('#') ? cleanTag.toUpperCase() : `#${cleanTag.toUpperCase()}`;

            // Check duplicate
            const existing = await collection.findOne({
                $or: [{ _id: clanTag }, { tag: clanTag }]
            });

            if (existing) {
                return res.status(409).json({ error: `A clan with tag ${clanTag} already exists` });
            }

            // Determine next order number
            const lastClan = await collection.find({}).sort({ order: -1 }).limit(1).toArray();
            const nextOrder = (lastClan[0]?.order ?? 0) + 1;

            const newClan = {
                _id: clanTag,
                tag: clanTag,
                name: String(name).trim(),
                description: description || '',
                clanLevel: Number(clanLevel) || 1,
                clanPoints: Number(clanPoints) || 0,
                requiredTownhallLevel: Number(requiredTownhallLevel) || 1,
                type: type || 'open',
                badgeUrls: badgeUrls || {
                    small: 'https://api-assets.clashofclans.com/badges/70/4eWfNqf2rN1E0k0gQ2F5t-hF9U2G_h1l3X9K7w2A5A.png',
                    medium: 'https://api-assets.clashofclans.com/badges/200/4eWfNqf2rN1E0k0gQ2F5t-hF9U2G_h1l3X9K7w2A5A.png',
                    large: 'https://api-assets.clashofclans.com/badges/512/4eWfNqf2rN1E0k0gQ2F5t-hF9U2G_h1l3X9K7w2A5A.png'
                },
                members: 0,
                memberList: [],
                order: nextOrder,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await collection.insertOne(newClan);

            await logActivity(db, {
                user: auth.user,
                action: 'CLAN_ADD',
                target: `${newClan.name} (${newClan.tag})`,
                details: `Added new clan ${newClan.name} (${newClan.tag}) at position #${newClan.order}`,
                req
            });

            return res.status(201).json({
                success: true,
                message: 'Clan added successfully',
                clan: newClan
            });
        }

        // EDIT CLAN (PUT)
        if (req.method === 'PUT') {
            const { tag, name, description, clanLevel, type, requiredTownhallLevel, order } = req.body || {};

            if (!tag) {
                return res.status(400).json({ error: 'Clan tag is required' });
            }

            const cleanTag = String(tag).trim();
            const clanTag = cleanTag.startsWith('#') ? cleanTag.toUpperCase() : `#${cleanTag.toUpperCase()}`;

            const updateData = { updatedAt: new Date() };
            if (name) updateData.name = String(name).trim();
            if (description !== undefined) updateData.description = String(description).trim();
            if (clanLevel !== undefined) updateData.clanLevel = Number(clanLevel);
            if (type !== undefined) updateData.type = String(type);
            if (requiredTownhallLevel !== undefined) updateData.requiredTownhallLevel = Number(requiredTownhallLevel);
            if (order !== undefined) updateData.order = Number(order);

            const result = await collection.updateOne(
                { $or: [{ _id: clanTag }, { tag: clanTag }] },
                { $set: updateData }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Clan not found' });
            }

            const updatedClan = await collection.findOne({ $or: [{ _id: clanTag }, { tag: clanTag }] });

            const changedFields = Object.keys(updateData).filter(k => k !== 'updatedAt').join(', ');
            await logActivity(db, {
                user: auth.user,
                action: 'CLAN_EDIT',
                target: `${updatedClan?.name || clanTag} (${clanTag})`,
                details: `Updated fields: ${changedFields}`,
                req
            });

            return res.status(200).json({
                success: true,
                message: 'Clan updated successfully',
                clan: updatedClan
            });
        }

        // REMOVE CLAN (DELETE)
        if (req.method === 'DELETE') {
            const tag = req.query?.tag || req.body?.tag;

            if (!tag) {
                return res.status(400).json({ error: 'Clan tag is required' });
            }

            const cleanTag = String(tag).trim();
            const clanTag = cleanTag.startsWith('#') ? cleanTag.toUpperCase() : `#${cleanTag.toUpperCase()}`;

            const clanToDelete = await collection.findOne({
                $or: [{ _id: clanTag }, { tag: clanTag }]
            });

            const result = await collection.deleteOne({
                $or: [{ _id: clanTag }, { tag: clanTag }]
            });

            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'Clan not found' });
            }

            await logActivity(db, {
                user: auth.user,
                action: 'CLAN_DELETE',
                target: clanToDelete?.name ? `${clanToDelete.name} (${clanTag})` : clanTag,
                details: `Deleted clan ${clanToDelete?.name || clanTag} from alliance`,
                req
            });

            return res.status(200).json({
                success: true,
                message: `Clan ${clanTag} removed successfully`
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Clans API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
