import 'dotenv/config';
import { db } from '../db/index.js';
import { user } from '../db/schema/auth.js';
import { profiles, userRoleEnum } from '../db/schema/business.js';
import { eq } from 'drizzle-orm';

async function seed() {
    console.log('🌱 Starting database seeding...');

    try {
        // Create test users with different roles
        const testUsers = [
            {
                id: 'user_member_001',
                name: 'Ahmad Wijaya',
                email: 'ahmad.wijaya@koperasibk.co.id',
            },
            {
                id: 'user_pengadaan_001',
                name: 'Siti Nurhaliza',
                email: 'siti.nurhaliza@koperasibk.co.id',
            },
            {
                id: 'user_treasury_001',
                name: 'Budi Santoso',
                email: 'budi.santoso@koperasibk.co.id',
            },
            {
                id: 'user_manager_001',
                name: 'Diana Putri',
                email: 'diana.putri@koperasibk.co.id',
            },
            {
                id: 'user_bendahara_001',
                name: 'Eko Prasetyo',
                email: 'eko.prasetyo@koperasibk.co.id',
            },
            {
                id: 'user_ketua_001',
                name: 'Farah Amelia',
                email: 'farah.amelia@koperasibk.co.id',
            },
            {
                id: 'user_admin_001',
                name: 'System Administrator',
                email: 'admin@koperasibk.co.id',
            }
        ];

        console.log('👥 Creating test users...');
        for (const userData of testUsers) {
            // Check if user already exists
            const existingUser = await db.select().from(user).where(eq(user.email, userData.email)).limit(1);

            if (existingUser.length === 0) {
                await db.insert(user).values({
                    ...userData,
                    emailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                console.log(`✅ Created user: ${userData.name} (${userData.email})`);
            } else {
                console.log(`ℹ️  User already exists: ${userData.name} (${userData.email})`);
            }
        }

        // Create profiles with roles
        const profilesData = [
            {
                userId: 'user_member_001',
                accurateEmployeeId: 1001,
                fullName: 'Ahmad Wijaya',
                email: 'ahmad.wijaya@koperasibk.co.id',
                role: 'member' as const,
            },
            {
                userId: 'user_pengadaan_001',
                accurateEmployeeId: 2001,
                fullName: 'Siti Nurhaliza',
                email: 'siti.nurhaliza@koperasibk.co.id',
                role: 'staff_pengadaan' as const,
            },
            {
                userId: 'user_treasury_001',
                accurateEmployeeId: 2002,
                fullName: 'Budi Santoso',
                email: 'budi.santoso@koperasibk.co.id',
                role: 'staff_treasury' as const,
            },
            {
                userId: 'user_manager_001',
                accurateEmployeeId: 3001,
                fullName: 'Diana Putri',
                email: 'diana.putri@koperasibk.co.id',
                role: 'manager' as const,
            },
            {
                userId: 'user_bendahara_001',
                accurateEmployeeId: 4001,
                fullName: 'Eko Prasetyo',
                email: 'eko.prasetyo@koperasibk.co.id',
                role: 'bendahara' as const,
            },
            {
                userId: 'user_ketua_001',
                accurateEmployeeId: 4002,
                fullName: 'Farah Amelia',
                email: 'farah.amelia@koperasibk.co.id',
                role: 'ketua' as const,
            },
            {
                userId: 'user_admin_001',
                accurateEmployeeId: 5001,
                fullName: 'System Administrator',
                email: 'admin@koperasibk.co.id',
                role: 'admin' as const,
            }
        ];

        console.log('👔 Creating user profiles with roles...');
        for (const profileData of profilesData) {
            // Check if profile already exists
            const existingProfile = await db.select().from(profiles).where(eq(profiles.email, profileData.email)).limit(1);

            if (existingProfile.length === 0) {
                await db.insert(profiles).values({
                    ...profileData,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                console.log(`✅ Created profile: ${profileData.fullName} (${profileData.role})`);
            } else {
                console.log(`ℹ️  Profile already exists: ${profileData.fullName} (${profileData.role})`);
            }
        }

        console.log('🎉 Database seeding completed successfully!');

        // Display summary
        const totalUsers = await db.select().from(user);
        const totalProfiles = await db.select().from(profiles);

        console.log(`\n📊 Seeding Summary:`);
        console.log(`   Total Users: ${totalUsers.length}`);
        console.log(`   Total Profiles: ${totalProfiles.length}`);
        console.log('\n🔐 Login Credentials (for testing):');
        console.log('   Member: ahmad.wijaya@koperasibk.co.id');
        console.log('   Staff Pengadaan: siti.nurhaliza@koperasibk.co.id');
        console.log('   Staff Treasury: budi.santoso@koperasibk.co.id');
        console.log('   Manager: diana.putri@koperasibk.co.id');
        console.log('   Bendahara: eko.prasetyo@koperasibk.co.id');
        console.log('   Ketua: farah.amelia@koperasibk.co.id');
        console.log('   Admin: admin@koperasibk.co.id');

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
}

// Run the seed function
seed().then(() => {
    console.log('🌱 Seeding process finished.');
    process.exit(0);
}).catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
});