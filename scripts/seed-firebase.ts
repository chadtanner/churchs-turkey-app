/**
 * Firebase Data Seeding Script
 * 
 * This script seeds the Firebase Firestore database with restaurant data
 * from the seed-data-restaurants.json file.
 * 
 * Usage:
 * 1. Set up your Firebase project and add credentials to .env.local
 * 2. Run: npm run seed-firebase
 * 
 * Note: This requires Firebase Admin SDK for Node.js
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
if (!getApps().length) {
    // For local development, you can use a service account key
    // Download from Firebase Console > Project Settings > Service Accounts
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (serviceAccount && fs.existsSync(serviceAccount)) {
        initializeApp({
            credential: cert(serviceAccount)
        });
    } else {
        console.log('⚠️  No service account found. Using application default credentials.');
        console.log('   Make sure you have set up Firebase credentials.');
        initializeApp();
    }
}

const db = getFirestore();

async function seedRestaurants() {
    try {
        console.log('🔥 Starting Firebase seeding process...\n');

        // Read seed data
        const seedDataPath = path.join(process.cwd(), '..', 'seed-data', 'seed-data-restaurants.json');

        if (!fs.existsSync(seedDataPath)) {
            console.error('❌ Seed data file not found at:', seedDataPath);
            console.log('   Please make sure seed-data-restaurants.json exists in the seed-data directory.');
            process.exit(1);
        }

        const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));
        const restaurants = seedData.restaurants;

        console.log(`📊 Found ${restaurants.length} restaurants to seed\n`);

        // Seed restaurants collection
        const batch = db.batch();
        let count = 0;

        for (const restaurant of restaurants) {
            const docRef = db.collection('restaurants').doc(restaurant.restaurantNumber);
            batch.set(docRef, {
                ...restaurant,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            count++;

            if (count % 10 === 0) {
                console.log(`   Processed ${count}/${restaurants.length} restaurants...`);
            }
        }

        await batch.commit();
        console.log(`\n✅ Successfully seeded ${count} restaurants!\n`);

        // Create system config
        console.log('⚙️  Creating system configuration...');
        await db.collection('systemConfig').doc('settings').set({
            promotionActive: true,
            maxReservationsGlobal: 1000,
            emailSettings: {
                fromEmail: 'reservations@churchstexaschicken.com',
                fromName: 'Church\'s Texas Chicken',
                replyToEmail: 'support@churchstexaschicken.com',
                supportEmail: 'support@churchstexaschicken.com',
                supportPhone: '1-800-CHURCHS'
            },
            features: {
                allowCancellations: false,
                requireEmailVerification: false
            },
            lastUpdated: new Date(),
            updatedBy: 'seed-script'
        });

        console.log('✅ System configuration created!\n');

        console.log('🎉 Firebase seeding completed successfully!\n');
        console.log('📝 Next steps:');
        console.log('   1. Verify data in Firebase Console');
        console.log('   2. Set up Firestore indexes if needed');
        console.log('   3. Configure security rules\n');

    } catch (error) {
        console.error('❌ Error seeding Firebase:', error);
        process.exit(1);
    }
}

// Run the seeding
seedRestaurants();
