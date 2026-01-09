import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { Restaurant } from '@/lib/types';

export async function GET() {
    try {
        const batchSize = 450;
        const restaurantsRef = collection(db, 'restaurants');
        const reservationsRef = collection(db, 'reservations'); // New collection reference

        // 1. Fetch All Restaurants
        const rSnapshot = await getDocs(restaurantsRef);
        const restaurants = rSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Restaurant));

        // 2. Fetch All Reservations (to delete)
        const resSnapshot = await getDocs(reservationsRef);

        let batch = writeBatch(db);
        let opCount = 0;
        let deletedCount = 0;

        const commitBatch = async () => {
            if (opCount > 0) {
                await batch.commit();
                batch = writeBatch(db);
                opCount = 0;
            }
        };

        // --- STEP A: DELETE ALL RESERVATIONS ---
        for (const d of resSnapshot.docs) {
            batch.delete(d.ref);
            opCount++;
            deletedCount++;
            if (opCount >= batchSize) await commitBatch();
        }

        // --- STEP B: RESET ALL INVENTORY ---
        // We will do this as we process seeding to save ops, 
        // OR we can do a blanket reset first if we want to be safe.
        // Let's do a blanket reset first to ensure clean state.
        for (const d of rSnapshot.docs) {
            batch.update(d.ref, {
                'metadata.turkeysReserved': 0,
                'turkeyInventory': 12
            });
            opCount++;
            if (opCount >= batchSize) await commitBatch();
        }
        await commitBatch();

        // --- STEP C: SEED NEW DATA ---
        // We need:
        // Sold Out (12) - 20 locs
        // High (9-11) - 20 locs
        // Half (6-8) - 20 locs
        // Low (1-5) - 40 locs
        // None - Rest (~350)

        const sortedRestaurants = restaurants.sort((a, b) => parseInt(a.locationId) - parseInt(b.locationId));

        // Slices
        let idx = 0;
        const soldOutGroup = sortedRestaurants.slice(idx, idx += 20);
        const highGroup = sortedRestaurants.slice(idx, idx += 20);
        const halfGroup = sortedRestaurants.slice(idx, idx += 20);
        const lowGroup = sortedRestaurants.slice(idx, idx += 40);
        // rest are empty

        const seedLocation = (r: Restaurant, min: number, max: number) => {
            const qty = Math.floor(Math.random() * (max - min + 1)) + min;
            if (qty === 0) return; // Should not happen given ranges

            // Create 1 or more reservations to sum up to qty?
            // To be realistic, huge numbers probably from multiple people.
            // But simplify: 1-3 reservations per location.
            let remaining = qty;

            while (remaining > 0) {
                // Determine this order size (max 5, or remaining)
                const orderSize = Math.min(remaining, Math.floor(Math.random() * 3) + 1);

                // Create Reservation
                const resRef = doc(collection(db, 'reservations'));
                const confirmNum = Math.floor(Math.random() * 10000000000000).toString().padStart(13, '0');
                const confirmId = `CTC${confirmNum}`;

                batch.set(resRef, {
                    confirmationId: confirmId,
                    locationId: r.locationId,
                    restaurantName: r.restaurantName,
                    customer: {
                        firstName: 'Seeded',
                        lastName: `User ${confirmNum.slice(-4)}`,
                        email: `user${confirmNum.slice(-6)}@example.com`,
                        phone: '555-0123'
                    },
                    reservation: {
                        turkeyQuantity: orderSize,
                        pickupDate: '2026-11-25',
                        pickupTime: '12:00'
                    },
                    createdAt: serverTimestamp()
                });
                opCount++;

                remaining -= orderSize;
            }

            // Update Restaurant Metadata
            const restRef = doc(db, 'restaurants', r.id!); // we know id exists from fetch
            batch.update(restRef, {
                'metadata.turkeysReserved': qty,
                'turkeyInventory': 12 - qty
            });
            opCount++;
        };

        // Process Groups
        for (const r of soldOutGroup) {
            seedLocation(r, 12, 12);
            if (opCount >= batchSize) await commitBatch();
        }
        for (const r of highGroup) {
            seedLocation(r, 9, 11);
            if (opCount >= batchSize) await commitBatch();
        }
        for (const r of halfGroup) {
            seedLocation(r, 6, 8);
            if (opCount >= batchSize) await commitBatch();
        }
        for (const r of lowGroup) {
            seedLocation(r, 1, 5);
            if (opCount >= batchSize) await commitBatch();
        }

        await commitBatch();

        return NextResponse.json({
            success: true,
            deletedOldReservations: deletedCount,
            message: "Reset and seeded: 20 Sold Out, 20 High, 20 Half, 40 Low."
        });

    } catch (error) {
        console.error("Reset Seed Error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
