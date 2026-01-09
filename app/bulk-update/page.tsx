'use client';

import { useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Button from '@/components/ui/Button';

export default function BulkUpdatePage() {
    const [updating, setUpdating] = useState(false);
    const [result, setResult] = useState<string>('');

    const handleBulkUpdate = async () => {
        setUpdating(true);
        setResult('');

        try {
            // Get all restaurants
            const querySnapshot = await getDocs(collection(db, 'restaurants'));

            let updated = 0;
            let errors = 0;

            // Update each restaurant
            for (const docSnapshot of querySnapshot.docs) {
                try {
                    const restaurantRef = doc(db, 'restaurants', docSnapshot.id);
                    await updateDoc(restaurantRef, {
                        reservationLimit: 2,
                        turkeyPrice: 40,
                        updatedAt: new Date()
                    });
                    updated++;
                } catch (error) {
                    console.error(`Error updating ${docSnapshot.id}:`, error);
                    errors++;
                }
            }

            setResult(`✅ Bulk update complete!\n\n` +
                `Updated: ${updated} locations\n` +
                `Errors: ${errors}\n\n` +
                `Changes applied:\n` +
                `- Reservation Limit: 2 turkeys per order\n` +
                `- Turkey Price: $40.00`);
        } catch (error) {
            console.error('Bulk update error:', error);
            setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div style={{ background: 'var(--gray-50)', minHeight: '100vh' }}>
            <div className="container section-spacing">
                <h1 className="text-h1" style={{ marginBottom: 'var(--spacing-8)', color: 'var(--gray-900)' }}>
                    Bulk Update Restaurants
                </h1>

                <div className="card" style={{ maxWidth: '600px' }}>
                    <h2 className="text-h3" style={{ marginBottom: 'var(--spacing-4)', color: 'var(--gray-900)' }}>
                        Update All Locations
                    </h2>

                    <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-6)' }}>
                        This will update ALL restaurant locations with the following settings:
                    </p>

                    <ul style={{
                        marginBottom: 'var(--spacing-6)',
                        paddingLeft: 'var(--spacing-6)',
                        color: 'var(--gray-700)'
                    }}>
                        <li><strong>Reservation Limit:</strong> 2 turkeys per order</li>
                        <li><strong>Turkey Price:</strong> $40.00</li>
                    </ul>

                    <Button
                        variant="primary"
                        onClick={handleBulkUpdate}
                        disabled={updating}
                        fullWidth
                    >
                        {updating ? 'Updating...' : 'Run Bulk Update'}
                    </Button>

                    {result && (
                        <div style={{
                            marginTop: 'var(--spacing-6)',
                            padding: 'var(--spacing-4)',
                            background: result.startsWith('✅') ? 'var(--jalapeno-light)' : 'var(--og-heat-light)',
                            borderRadius: 'var(--radius)',
                            whiteSpace: 'pre-line',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem'
                        }}>
                            {result}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
