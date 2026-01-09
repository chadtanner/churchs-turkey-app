import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
    try {
        const restaurantsRef = collection(db, 'restaurants');
        const snapshot = await getDocs(restaurantsRef);

        const ids = snapshot.docs
            .map(doc => parseInt(doc.data().locationId))
            .filter(id => !isNaN(id));

        // Let's look at the "Low" ones (e.g. 100k to 100400)
        // versus "High" ones.
        const lowIDs = ids.filter(id => id >= 100000 && id <= 100400).sort((a, b) => a - b);
        const highIDs = ids.filter(id => id > 100400).sort((a, b) => a - b);

        let lowSequential = true;
        if (lowIDs.length > 1) {
            for (let i = 0; i < lowIDs.length - 1; i++) {
                if (lowIDs[i + 1] !== lowIDs[i] + 1) {
                    lowSequential = false;
                }
            }
        }

        return NextResponse.json({
            totalCount: ids.length,
            lowCount: lowIDs.length,
            lowSequential,
            lowSample: lowIDs.slice(0, 5),
            highCount: highIDs.length,
            highSample: highIDs.slice(0, 5)
        });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
