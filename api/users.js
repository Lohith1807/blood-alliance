import { ObjectId } from 'mongodb';
import { requireAuth, hashPassword } from '../lib/auth.js';
import { logActivity } from '../lib/auditLog.js';

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

    // Role check: Check module permission for user-management
    const auth = await requireAuth(req, res, null, { requiredModule: 'user-management' });
    if (!auth) return; // Response handled by requireAuth

    const { db } = auth;
    const usersCollection = db.collection('users');

    try {
        // 1. GET USERS LIST
        if (req.method === 'GET') {
            const users = await usersCollection.find({}, {
                projection: { passwordHash: 0, salt: 0 }
            }).sort({ createdAt: -1 }).toArray();

            const sanitizedUsers = users.map(u => ({
                id: u._id.toString(),
                email: u.email,
                role: u.role,
                isOwner: u.email?.toLowerCase() === 'lohithreddy1819@gmail.com',
                canViewLogs: u.email?.toLowerCase() === 'lohithreddy1819@gmail.com' || Boolean(u.canViewLogs),
                canManageCommands: u.email?.toLowerCase() === 'lohithreddy1819@gmail.com' || Boolean(u.canManageCommands),
                assignedClans: Array.isArray(u.assignedClans) ? u.assignedClans : [],
                createdAt: u.createdAt || null,
                updatedAt: u.updatedAt || null
            }));

            return res.status(200).json({
                success: true,
                users: sanitizedUsers
            });
        }

        // 2. CREATE NEW USER
        if (req.method === 'POST') {
            const { email, password, role, canViewLogs, canManageCommands, assignedClans } = req.body || {};

            if (!email || !password || !role) {
                return res.status(400).json({ error: 'Email, password, and role are required' });
            }

            const cleanEmail = String(email).trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanEmail)) {
                return res.status(400).json({ error: 'Please enter a valid email address' });
            }

            if (password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters long' });
            }

            const cleanRole = String(role).trim().toLowerCase();
            const validRoles = ['admin', 'mod', 'staff', 'leader'];
            if (!validRoles.includes(cleanRole)) {
                return res.status(400).json({ error: 'Role must be one of: "admin", "mod", "staff", or "leader"' });
            }

            // Check duplicate email
            const existing = await usersCollection.findOne({ email: cleanEmail });
            if (existing) {
                return res.status(409).json({ error: 'A user with this email address already exists' });
            }

            const sanitizedClans = Array.isArray(assignedClans) 
                ? assignedClans.map(t => String(t).trim().toUpperCase()).filter(Boolean)
                : [];

            const { salt, hash } = hashPassword(password);
            const newUser = {
                email: cleanEmail,
                passwordHash: hash,
                salt: salt,
                role: cleanRole,
                assignedClans: sanitizedClans,
                canViewLogs: auth.user.isOwner ? Boolean(canViewLogs) : false,
                canManageCommands: (auth.user.isOwner && cleanRole === 'admin') ? Boolean(canManageCommands) : false,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await usersCollection.insertOne(newUser);

            await logActivity(db, {
                user: auth.user,
                action: 'USER_CREATE',
                target: cleanEmail,
                details: `Created user ${cleanEmail} with role '${cleanRole}'${sanitizedClans.length ? ` (assigned to ${sanitizedClans.length} clans: ${sanitizedClans.join(', ')})` : ''}${newUser.canViewLogs ? ' (granted log access)' : ''}${newUser.canManageCommands ? ' (granted command management)' : ''}`,
                req
            });

            return res.status(201).json({
                success: true,
                message: 'User created successfully',
                user: {
                    id: result.insertedId.toString(),
                    email: cleanEmail,
                    role: cleanRole,
                    assignedClans: newUser.assignedClans,
                    canViewLogs: newUser.canViewLogs,
                    canManageCommands: newUser.canManageCommands,
                    createdAt: newUser.createdAt
                }
            });
        }

        // 3. EDIT USER
        if (req.method === 'PUT') {
            const { id, email, role, password, canViewLogs, canManageCommands } = req.body || {};

            if (!id) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            let objId;
            try {
                objId = new ObjectId(id);
            } catch {
                return res.status(400).json({ error: 'Invalid User ID format' });
            }

            const existingUser = await usersCollection.findOne({ _id: objId });
            if (!existingUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Guard against modifying Alliance Owner by anyone else
            if (existingUser.email?.toLowerCase() === 'lohithreddy1819@gmail.com' && !auth.user.isOwner) {
                return res.status(403).json({ error: 'Cannot modify the Alliance Owner account' });
            }

            const updateFields = { updatedAt: new Date() };

            // Update Email
            if (email) {
                const cleanEmail = String(email).trim().toLowerCase();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(cleanEmail)) {
                    return res.status(400).json({ error: 'Please enter a valid email address' });
                }

                // Check duplicate if email is being changed
                if (cleanEmail !== existingUser.email) {
                    const duplicate = await usersCollection.findOne({ email: cleanEmail });
                    if (duplicate) {
                        return res.status(409).json({ error: 'Another user already has this email address' });
                    }
                    updateFields.email = cleanEmail;
                }
            }

            // Update Role
            if (role) {
                const cleanRole = String(role).trim().toLowerCase();
                const validRoles = ['admin', 'mod', 'staff', 'leader'];
                if (!validRoles.includes(cleanRole)) {
                    return res.status(400).json({ error: 'Role must be one of: "admin", "mod", "staff", or "leader"' });
                }

                // Guard against demoting the last admin
                if (existingUser.role === 'admin' && cleanRole !== 'admin') {
                    const adminCount = await usersCollection.countDocuments({ role: 'admin' });
                    if (adminCount <= 1) {
                        return res.status(400).json({ error: 'Cannot demote the last remaining administrator account' });
                    }
                }
                updateFields.role = cleanRole;
            }

            // Update Assigned Clans
            const { assignedClans } = req.body;
            if (assignedClans !== undefined) {
                updateFields.assignedClans = Array.isArray(assignedClans)
                    ? assignedClans.map(t => String(t).trim().toUpperCase()).filter(Boolean)
                    : [];
            }

            // Only Owner can modify canViewLogs permission
            if (auth.user.isOwner && canViewLogs !== undefined) {
                updateFields.canViewLogs = Boolean(canViewLogs);
            }

            // Only Owner can modify canManageCommands permission (only applicable to admins)
            if (auth.user.isOwner && canManageCommands !== undefined) {
                const targetRole = updateFields.role || existingUser.role;
                updateFields.canManageCommands = targetRole === 'admin' ? Boolean(canManageCommands) : false;
            }

            // Update Password if provided
            if (password) {
                if (password.length < 6) {
                    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
                }
                const { salt, hash } = hashPassword(password);
                updateFields.passwordHash = hash;
                updateFields.salt = salt;
            }

            await usersCollection.updateOne({ _id: objId }, { $set: updateFields });

            const updatedUser = await usersCollection.findOne({ _id: objId });

            const changedFields = Object.keys(updateFields).filter(k => k !== 'updatedAt').join(', ');
            await logActivity(db, {
                user: auth.user,
                action: 'USER_EDIT',
                target: existingUser.email,
                details: `Updated user account fields: ${changedFields}`,
                req
            });

            return res.status(200).json({
                success: true,
                message: 'User updated successfully',
                user: {
                    id: updatedUser._id.toString(),
                    email: updatedUser.email,
                    role: updatedUser.role,
                    assignedClans: Array.isArray(updatedUser.assignedClans) ? updatedUser.assignedClans : [],
                    canViewLogs: updatedUser.canViewLogs || false,
                    canManageCommands: updatedUser.canManageCommands || false,
                    updatedAt: updatedUser.updatedAt
                }
            });
        }

        // 4. DELETE USER
        if (req.method === 'DELETE') {
            const { id } = req.query || req.body || {};

            if (!id) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            let objId;
            try {
                objId = new ObjectId(id);
            } catch {
                return res.status(400).json({ error: 'Invalid User ID format' });
            }

            const existingUser = await usersCollection.findOne({ _id: objId });
            if (!existingUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Guard against deleting Alliance Owner
            if (existingUser.email?.toLowerCase() === 'lohithreddy1819@gmail.com') {
                return res.status(403).json({ error: 'The Alliance Owner account cannot be deleted' });
            }

            // Guard against deleting the last admin
            if (existingUser.role === 'admin') {
                const adminCount = await usersCollection.countDocuments({ role: 'admin' });
                if (adminCount <= 1) {
                    return res.status(400).json({ error: 'Cannot delete the last remaining administrator account' });
                }
            }

            await usersCollection.deleteOne({ _id: objId });

            // Invalidate any active sessions for the deleted user
            await db.collection('sessions').deleteMany({ userId: objId }).catch(() => {});

            await logActivity(db, {
                user: auth.user,
                action: 'USER_DELETE',
                target: existingUser.email,
                details: `Deleted user account ${existingUser.email} (role: ${existingUser.role})`,
                req
            });

            return res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Users API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
