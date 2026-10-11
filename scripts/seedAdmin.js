import clientPromise from '../lib/mongodb.js';
import { hashPassword } from '../lib/auth.js';

async function seedAdmin() {
    console.log('='.repeat(50));
    console.log('🔐 Seeding Initial Administrator Account');
    console.log('='.repeat(50));

    const email = (process.env.ADMIN_EMAIL || 'lohithreddy1819@gmail.com').toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD || 'LOHITHREDDY18@';
    const role = 'admin';

    try {
        const client = await clientPromise;
        const db = client.db('ClansData');
        const usersCollection = db.collection('users');

        // Check if user already exists
        const existing = await usersCollection.findOne({ email });

        const { salt, hash } = hashPassword(password);

        if (existing) {
            console.log(`ℹ️  Account with email ${email} already exists. Updating role to 'admin' and refreshing credentials...`);
            await usersCollection.updateOne(
                { _id: existing._id },
                {
                    $set: {
                        role: 'admin',
                        passwordHash: hash,
                        salt: salt,
                        updatedAt: new Date()
                    }
                }
            );
            console.log(`✅ Administrator account updated successfully. Role: admin.`);
        } else {
            console.log(`Creating new administrator account for ${email}...`);
            const result = await usersCollection.insertOne({
                email,
                passwordHash: hash,
                salt: salt,
                role: 'admin',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`✅ Administrator account created successfully with ID: ${result.insertedId}`);
        }

        // Verify that the account can be found
        const verified = await usersCollection.findOne({ email });
        console.log(`✅ Verification check: Email: ${verified.email}, Role: ${verified.role}`);
        console.log('='.repeat(50));
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to seed administrator account:', error);
        process.exit(1);
    }
}

seedAdmin();
