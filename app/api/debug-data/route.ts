import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

export async function GET() {
    try {
        const targetId = '100053';

        // 1. Get Restaurant Data
        const restRef = doc(db, 'restaurants', targetId);
        const restSnap = await getDoc(restRef);

        if (!restSnap.exists()) {
            return NextResponse.json({ error: "Restaurant not found" });
        }

        const rData = restSnap.data();

        // 2. Get Reservations
        const resQuery = query(collection(db, 'reservations'), where('locationId', '==', targetId));
        const resSnap = await getDocs(resQuery);

        const reservations = resSnap.docs.map(d => ({
            id: d.id,
            qty: d.data().reservation.turkeyQuantity
        }));

        const totalReservedFromDocs = reservations.reduce((sum, r) => sum + r.qty, 0);

        return NextResponse.json({
            restaurant: {
                id: targetId,
                metadataReserved: rData?.metadata?.turkeysReserved,
                inventoryInvalid: rData?.turkeyInventory,
                capacity: rData?.metadata?.totalTurkeyCapacity
            },
            reservationsCount: reservations.length,
            reservationsSum: totalReservedFromDocs,
            match: totalReservedFromDocs === rData?.metadata?.turkeysReserved
        });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
