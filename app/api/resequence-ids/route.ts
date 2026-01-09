import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc, query, where } from 'firebase/firestore';
import { Restaurant, Reservation } from '@/lib/types';

export async function GET() {
    try {
        const BATCH_LIMIT = 400; // conservative limit
        let batch = writeBatch(db);
        let opCount = 0;
        let processedCount = 0;
        let updateCount = 0;
        let reservationUpdateCount = 0;

        // Helper to commit batch
        const checkCommit = async () => {
            if (opCount >= BATCH_LIMIT) {
                await batch.commit();
                batch = writeBatch(db);
                opCount = 0;
            }
        };

        // 1. Fetch all restaurants
        const restaurantsRef = collection(db, 'restaurants');
        const snapshot = await getDocs(restaurantsRef);

        // 2. Sort by locationId to ensure stable re-ordering
        const restaurants = snapshot.docs
            .map(d => {
                const data = d.data();
                return {
                    docId: d.id, // currently usually same as locationId (as string)
                    data: data as Restaurant,
                    numericId: parseInt(data.locationId)
                };
            })
            .filter(r => !isNaN(r.numericId))
            .sort((a, b) => a.numericId - b.numericId);

        console.log(`Found ${restaurants.length} restaurants to process.`);

        const START_ID = 100000;

        for (let i = 0; i < restaurants.length; i++) {
            const r = restaurants[i];
            const oldId = r.data.locationId;
            const newId = (START_ID + i).toString();

            if (oldId === newId) {
                // Already correct position (e.g. 100000 -> 100000)
                processedCount++;
                continue;
            }

            // Move Required
            updateCount++;

            // A. Create New Restaurant Doc
            const newDocRef = doc(db, 'restaurants', newId);
            const newData = {
                ...r.data,
                locationId: newId,
                restaurantNumber: newId // Assuming these should track together
            };
            batch.set(newDocRef, newData);
            opCount++;

            // B. Find and Update Reservations
            // Fetch reservations for OLD ID
            // NOTE: We do this inside the loop. It is slow but safe for data integrity script.
            const resQuery = query(collection(db, 'reservations'), where('locationId', '==', oldId));
            const resSnapshot = await getDocs(resQuery);

            if (!resSnapshot.empty) {
                resSnapshot.forEach(resDoc => {
                    batch.update(resDoc.ref, { locationId: newId });
                    reservationUpdateCount++;
                    opCount++;
                });
            }

            // Check commit inside reservation loop? 
            // Better to check "await checkCommit()" after adding these ops. 
            // Ideally we wouldn't split a "move" across batches but for this scale it's okay if it fails halfway, we can re-run.
            // (If we fail after creating new but before deleting old, we have duplicate. Next run would see dupes. 
            //  We should delete old *in same batch* as new if possible, or just accept manual cleanup risk).
            // Given the batch limit, if a location has > 400 reservations, we might explode.
            // Assuming max 12 turkeys -> max 12 reservations. We are SAFE.

            // C. Delete Old Restaurant Doc
            const oldDocRef = doc(db, 'restaurants', r.docId);
            batch.delete(oldDocRef);
            opCount++;

            await checkCommit();
            processedCount++;
        }

        // Final commit
        if (opCount > 0) {
            await batch.commit();
        }

        return NextResponse.json({
            success: true,
            totalProcessed: processedCount,
            restaurantsMoved: updateCount,
            reservationsMigrated: reservationUpdateCount
        });

    } catch (error) {
        console.error("Resequence error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
