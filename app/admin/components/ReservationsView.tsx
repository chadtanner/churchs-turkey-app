'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatPickupDate } from '@/lib/utils';

// Define the shape of our Reservation (subset of what's in DB + flattened for display)
interface Reservation {
    id: string; // Firestore doc ID
    confirmationId: string;
    locationId: string;
    restaurantName: string;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    reservation: {
        turkeyQuantity: number;
        pickupDate: string;
        pickupTime: string;
    };
    createdAt: any; // Timestamp
}

interface ReservationsViewProps {
    initialSearchTerm?: string;
}

export default function ReservationsView({ initialSearchTerm = '' }: ReservationsViewProps) {
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [searching, setSearching] = useState(false);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [searched, setSearched] = useState(false);

    // Effect to trigger search if initialSearchTerm is provided and changed
    useEffect(() => {
        if (initialSearchTerm) {
            setSearchTerm(initialSearchTerm);
            // We need to wait for state update or pass directly.
            // Let's create a reusable search function that accepts a term
            doSearch(initialSearchTerm);
        }
    }, [initialSearchTerm]);

    const doSearch = async (term: string) => {
        if (!term.trim()) return;
        setSearching(true);
        setSearched(true);
        setReservations([]);

        try {
            // Parse search term: split by comma, trim whitespace
            const locationIds = term.split(',').map(s => s.trim()).filter(Boolean);

            if (locationIds.length === 0) {
                setSearching(false);
                return;
            }

            // Firestore "in" query allows up to 10 values. If more, we'd need to batch, but for now 10 is plenty.
            // If user searches 100+ IDs, we might error, but assuming reasonable usage.
            const chunks = [];
            for (let i = 0; i < locationIds.length; i += 10) {
                chunks.push(locationIds.slice(i, i + 10));
            }

            let allReservations: Reservation[] = [];

            for (const chunk of chunks) {
                const q = query(
                    collection(db, 'reservations'),
                    where('locationId', 'in', chunk),
                    orderBy('locationId') // Grouping sort (valid with where on same field)
                );

                const snapshot = await getDocs(q);
                const chunkData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Reservation[];

                allReservations = [...allReservations, ...chunkData];
            }

            // Client-side sort by restaurantNumber (grouping) then createdAt (desc)
            // Note: Since we fetched chunks, sorting the combined array is safer.
            allReservations.sort((a, b) => {
                if (a.locationId !== b.locationId) {
                    return a.locationId.localeCompare(b.locationId);
                }
                // Descending sort by date
                const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt);
                const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt);
                return dateB.getTime() - dateA.getTime();
            });

            setReservations(allReservations);

        } catch (error) {
            console.error("Error searching reservations:", error);
            alert("Failed to search reservations. Check console.");
        } finally {
            setSearching(false);
        }
    };

    // Group reservations by Location
    const groupedReservations: { [key: string]: Reservation[] } = {};
    reservations.forEach(res => {
        const key = `${res.restaurantName} (#${res.locationId})`;
        if (!groupedReservations[key]) {
            groupedReservations[key] = [];
        }
        groupedReservations[key].push(res);
    });

    // CSV Export
    const downloadCSV = (data: Reservation[] = reservations, filenameSuffix: string = 'all') => {
        if (data.length === 0) return;

        const headers = ['Confirmation ID', 'Location ID', 'Location Name', 'Customer Name', 'Email', 'Phone', 'Qty', 'Pickup Date', 'Pickup Time'];
        const rows = data.map(res => [
            res.confirmationId,
            res.locationId,
            `"${res.restaurantName}"`, // Quote incase of commas
            `"${res.customer.firstName} ${res.customer.lastName}"`,
            res.customer.email,
            res.customer.phone,
            res.reservation.turkeyQuantity,
            res.reservation.pickupDate,
            res.reservation.pickupTime
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `reservations_${filenameSuffix}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            {/* Search Bar */}
            <Card style={{ marginBottom: 'var(--spacing-6)' }}>
                <h3 className="text-h3" style={{ marginBottom: 'var(--spacing-4)', color: 'var(--gray-900)' }}>
                    Search Reservations
                </h3>
                <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <Input
                            label="Location IDs (comma separated)"
                            placeholder="e.g. 100011, 100046"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="primary" onClick={() => doSearch(searchTerm)} disabled={searching} style={{ height: '3rem', marginBottom: 'var(--spacing-4)' }}>
                        {searching ? 'Searching...' : 'Search Locations'}
                    </Button>
                </div>
            </Card>

            {/* Results Header with Export */}
            {searched && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
                    <h2 className="text-h3" style={{ color: 'var(--gray-900)' }}>
                        {reservations.length} Result{reservations.length !== 1 ? 's' : ''} Found
                    </h2>
                    {reservations.length > 0 && (
                        <Button variant="secondary" onClick={() => downloadCSV(reservations, 'all')}>
                            ⬇ Export All CSV
                        </Button>
                    )}
                </div>
            )}

            {/* Grouped Lists */}
            {Object.entries(groupedReservations).map(([locationTitle, locationReservations]) => (
                <div key={locationTitle} style={{ marginBottom: 'var(--spacing-8)' }}>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 'var(--spacing-3)',
                        background: 'var(--gray-200)',
                        padding: 'var(--spacing-3) var(--spacing-4)',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: 'var(--spacing-3)'
                    }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <h4 className="text-h4" style={{ color: 'var(--gray-900)', margin: 0, lineHeight: 1.3 }}>
                                {locationTitle.split('(')[0].trim()}
                            </h4>
                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: '2px' }}>
                                {/* Extract the ID part that was in the title or just reconstruct it comfortably */}
                                {/* The key was constructed as `${res.restaurantName} (#${res.locationId})` */}
                                {/* Let's keep it simple: showing the ID and count on a second line is clearer for mobile */}
                                #{locationReservations[0]?.locationId} • {locationReservations.length} order{locationReservations.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => downloadCSV(locationReservations, locationReservations[0]?.locationId || 'location')}
                            style={{
                                padding: '0.25rem 0.75rem',
                                height: 'auto',
                                fontSize: '0.875rem',
                                whiteSpace: 'nowrap',
                                flex: '0 0 auto' // Prevent shrinking
                            }}
                        >
                            ⬇ Export CSV
                        </Button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left' }}>
                                    <th style={{ padding: 'var(--spacing-3)' }}>Confirmation</th>
                                    <th style={{ padding: 'var(--spacing-3)' }}>Customer</th>
                                    <th style={{ padding: 'var(--spacing-3)' }}>Contact</th>
                                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>Reserved</th>
                                    <th style={{ padding: 'var(--spacing-3)' }}>Pickup</th>
                                </tr>
                            </thead>
                            <tbody>
                                {locationReservations.map(res => (
                                    <tr key={res.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                        <td style={{ padding: 'var(--spacing-3)', fontFamily: 'monospace', fontWeight: 600 }}>
                                            {res.confirmationId}
                                        </td>
                                        <td style={{ padding: 'var(--spacing-3)' }}>
                                            <div style={{ fontWeight: 500 }}>{res.customer.firstName} {res.customer.lastName}</div>
                                        </td>
                                        <td style={{ padding: 'var(--spacing-3)' }}>
                                            <div>{res.customer.email}</div>
                                            <div style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>{res.customer.phone}</div>
                                        </td>
                                        <td style={{ padding: 'var(--spacing-3)', textAlign: 'center', fontWeight: 600, fontSize: '1rem' }}>
                                            {res.reservation.turkeyQuantity}
                                        </td>
                                        <td style={{ padding: 'var(--spacing-3)' }}>
                                            <div>{formatPickupDate(res.reservation.pickupDate)}</div>
                                            <div style={{ color: 'var(--gray-500)' }}>{res.reservation.pickupTime}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            {searched && reservations.length === 0 && !searching && (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-12)', color: 'var(--gray-500)' }}>
                    No reservations found for these locations.
                </div>
            )}
        </div>
    );
}
