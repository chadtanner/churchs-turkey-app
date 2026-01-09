'use client';

import { useState } from 'react';
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
    restaurantNumber: string;
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

export default function ReservationsView() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setSearching(true);
        setSearched(true);
        setReservations([]);

        try {
            // Parse search term: split by comma, trim whitespace
            const locationIds = searchTerm.split(',').map(s => s.trim()).filter(Boolean);

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
                    where('restaurantNumber', 'in', chunk),
                    orderBy('restaurantNumber'), // Grouping sort
                    orderBy('createdAt', 'desc') // Latest first
                );

                const snapshot = await getDocs(q);
                const chunkData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Reservation[];

                allReservations = [...allReservations, ...chunkData];
            }

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
        const key = `${res.restaurantName} (#${res.restaurantNumber})`;
        if (!groupedReservations[key]) {
            groupedReservations[key] = [];
        }
        groupedReservations[key].push(res);
    });

    // CSV Export
    const downloadCSV = () => {
        if (reservations.length === 0) return;

        const headers = ['Confirmation ID', 'Location ID', 'Location Name', 'Customer Name', 'Email', 'Phone', 'Qty', 'Pickup Date', 'Pickup Time'];
        const rows = reservations.map(res => [
            res.confirmationId,
            res.restaurantNumber,
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
        link.setAttribute('download', `reservations_export_${new Date().toISOString().split('T')[0]}.csv`);
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
                            placeholder="e.g. 1001, 1002"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="primary" onClick={handleSearch} disabled={searching} style={{ height: '3rem', marginBottom: 'var(--spacing-4)' }}>
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
                        <Button variant="secondary" onClick={downloadCSV}>
                            ⬇ Export CSV
                        </Button>
                    )}
                </div>
            )}

            {/* Grouped Lists */}
            {Object.entries(groupedReservations).map(([locationTitle, locationReservations]) => (
                <div key={locationTitle} style={{ marginBottom: 'var(--spacing-8)' }}>
                    <h4 className="text-h4" style={{
                        background: 'var(--gray-200)',
                        padding: 'var(--spacing-3) var(--spacing-4)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--gray-900)',
                        marginBottom: 'var(--spacing-3)'
                    }}>
                        {locationTitle} <span style={{ fontWeight: 400, color: 'var(--gray-600)' }}>({locationReservations.length} orders)</span>
                    </h4>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left' }}>
                                    <th style={{ padding: 'var(--spacing-3)' }}>Confirmation</th>
                                    <th style={{ padding: 'var(--spacing-3)' }}>Customer</th>
                                    <th style={{ padding: 'var(--spacing-3)' }}>Contact</th>
                                    <th style={{ padding: 'var(--spacing-3)' }}>Details</th>
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
                                        <td style={{ padding: 'var(--spacing-3)' }}>
                                            <span style={{
                                                background: 'var(--honey-butter)',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700
                                            }}>
                                                {res.reservation.turkeyQuantity} Turkey{res.reservation.turkeyQuantity > 1 ? 's' : ''}
                                            </span>
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
