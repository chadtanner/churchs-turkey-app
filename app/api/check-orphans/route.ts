import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
    try {
        // 1. Get all valid restaurant IDs
        const restaurantsRef = collection(db, 'restaurants');
        const rSnapshot = await getDocs(restaurantsRef);
        const validIds = new Set(rSnapshot.docs.map(d => d.data().locationId));

        // 2. Get all reservations
        const reservationsRef = collection(db, 'reservations');
        const resSnapshot = await getDocs(reservationsRef);

        const orphans: any[] = [];

        resSnapshot.forEach(doc => {
            const data = doc.data();
            if (!validIds.has(data.locationId)) {
                orphans.push({
                    id: doc.id,
                    locationId: data.locationId,
                    restaurantName: data.restaurantName
                });
            }
        });

        return NextResponse.json({
            totalReservations: resSnapshot.size,
            validLocationCount: validIds.size,
            orphanCount: orphans.length,
            orphans: orphans.slice(0, 10) // Show first 10
        });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
