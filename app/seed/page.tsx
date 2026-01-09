'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import Button from '@/components/ui/Button';

export default function SeedDataPage() {
    const [status, setStatus] = useState<string>('');
    const [isSeeding, setIsSeeding] = useState(false);

    const seedDatabase = async () => {
        setIsSeeding(true);
        setStatus('🔄 Starting seeding process...\n');

        try {
            // Fetch seed data
            setStatus(prev => prev + '📊 Loading seed data...\n');
            const response = await fetch('/seed-data-restaurants.json');
            const seedData = await response.json();
            const restaurants = seedData.restaurants;

            setStatus(prev => prev + `✅ Found ${restaurants.length} restaurants\n\n`);

            // Seed restaurants in batches (Firestore batch limit is 500)
            const batchSize = 500;
            let processedCount = 0;

            for (let i = 0; i < restaurants.length; i += batchSize) {
                const batch = writeBatch(db);
                const batchRestaurants = restaurants.slice(i, i + batchSize);

                for (const restaurant of batchRestaurants) {
                    const docRef = doc(db, 'restaurants', restaurant.restaurantNumber);
                    batch.set(docRef, {
                        ...restaurant,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    processedCount++;
                }

                await batch.commit();
                setStatus(prev => prev + `   ✓ Processed ${processedCount}/${restaurants.length} restaurants\n`);
            }

            setStatus(prev => prev + `\n✅ Successfully seeded ${processedCount} restaurants!\n\n`);

            // Create system config
            setStatus(prev => prev + '⚙️  Creating system configuration...\n');
            await setDoc(doc(db, 'systemConfig', 'settings'), {
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

            setStatus(prev => prev + '✅ System configuration created!\n\n');
            setStatus(prev => prev + '🎉 Firebase seeding completed successfully!\n\n');
            setStatus(prev => prev + '📝 Next steps:\n');
            setStatus(prev => prev + '   1. Check Firebase Console to verify data\n');
            setStatus(prev => prev + '   2. Visit /admin to see the dashboard with real data\n');

        } catch (error) {
            setStatus(prev => prev + `\n❌ Error: ${error}\n`);
            console.error('Seeding error:', error);
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <div className="container section-spacing">
            <h1 className="text-h1" style={{ marginBottom: 'var(--spacing-8)', color: 'var(--gray-900)' }}>
                Seed Firebase Database
            </h1>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <p className="text-body" style={{ marginBottom: 'var(--spacing-6)', color: 'var(--gray-700)' }}>
                    This will upload all 50 restaurant locations from the seed data file to your Firebase Firestore database.
                </p>

                <Button
                    variant="primary"
                    size="lg"
                    onClick={seedDatabase}
                    disabled={isSeeding}
                    style={{ marginBottom: 'var(--spacing-6)' }}
                >
                    {isSeeding ? 'Seeding Database...' : 'Seed Database'}
                </Button>

                {status && (
                    <div style={{
                        background: 'var(--gray-900)',
                        color: 'var(--mayo)',
                        padding: 'var(--spacing-4)',
                        borderRadius: 'var(--radius)',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '400px',
                        overflowY: 'auto'
                    }}>
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
}
