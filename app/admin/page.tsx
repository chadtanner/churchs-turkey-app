'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLocationSearch from '@/components/admin/LocationSearch';
import InventoryPanel from '@/components/admin/InventoryPanel';
import { Restaurant, LocationStatus, CategorizedLocations } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

function categorizeLocations(restaurants: Restaurant[]): CategorizedLocations {
    const categorized: CategorizedLocations = {
        noReservations: [],
        lowReservations: [],
        halfReserved: [],
        threeQuartersReserved: [],
        soldOut: [],
        other: []
    };

    for (const location of restaurants) {
        const totalReserved = location.metadata?.turkeysReserved || 0;
        const totalInventory = location.metadata?.totalTurkeyCapacity || 12;
        const percentageReserved = totalInventory > 0 ? (totalReserved / totalInventory) * 100 : 0;

        const status: LocationStatus = {
            location,
            totalReserved,
            totalInventory,
            percentageReserved
        };

        if (totalReserved === 0) {
            categorized.noReservations.push(status);
        } else if (location.turkeyInventory === 0) {
            categorized.soldOut.push(status);
        } else if (percentageReserved >= 75) {
            categorized.threeQuartersReserved.push(status);
        } else if (percentageReserved >= 50) {
            categorized.halfReserved.push(status);
        } else {
            // 1-49% reserved
            categorized.lowReservations.push(status);
        }
    }

    // Sort each category
    categorized.noReservations.sort((a, b) => b.totalInventory - a.totalInventory);
    categorized.lowReservations.sort((a, b) => b.percentageReserved - a.percentageReserved);
    categorized.halfReserved.sort((a, b) => b.percentageReserved - a.percentageReserved);
    categorized.threeQuartersReserved.sort((a, b) => b.percentageReserved - a.percentageReserved);
    categorized.soldOut.sort((a, b) => b.totalReserved - a.totalReserved);

    return categorized;
}

export default function AdminDashboard() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [categorized, setCategorized] = useState<CategorizedLocations>({
        noReservations: [],
        lowReservations: [],
        halfReserved: [],
        threeQuartersReserved: [],
        soldOut: [],
        other: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRestaurants() {
            try {
                const querySnapshot = await getDocs(collection(db, 'restaurants'));
                const restaurantData: Restaurant[] = [];

                querySnapshot.forEach((doc) => {
                    restaurantData.push(doc.data() as Restaurant);
                });

                setRestaurants(restaurantData);
                setCategorized(categorizeLocations(restaurantData));
            } catch (error) {
                console.error('Error fetching restaurants:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchRestaurants();
    }, []);

    if (loading) {
        return (
            <div style={{ background: 'var(--gray-50)', minHeight: '100vh' }}>
                <div className="container section-spacing">
                    <h1 className="text-h1" style={{ marginBottom: 'var(--spacing-8)', color: 'var(--gray-900)' }}>
                        Admin Dashboard
                    </h1>
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
                        <p className="text-body-lg" style={{ color: 'var(--gray-600)' }}>
                            Loading restaurant data from Firebase...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const totalTurkeys = restaurants.reduce((sum, r) => sum + (r.metadata?.totalTurkeyCapacity || 12), 0);
    const totalReserved = restaurants.reduce((sum, r) => sum + (r.metadata?.turkeysReserved || 0), 0);
    const totalAvailable = restaurants.reduce((sum, r) => sum + r.turkeyInventory, 0);
    const totalRevenue = totalReserved * 40;

    return (
        <div style={{ background: 'var(--gray-50)', minHeight: '100vh' }}>
            <div className="container section-spacing">
                <h1 className="text-h1" style={{
                    marginBottom: 'var(--spacing-8)',
                    color: 'var(--gray-900)'
                }}>
                    Admin Dashboard
                </h1>

                {/* Summary Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: 'var(--spacing-6)',
                    marginBottom: 'var(--spacing-8)'
                }}>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 700,
                            color: 'var(--og-heat)',
                            marginBottom: 'var(--spacing-2)'
                        }}>
                            {totalAvailable}
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            color: 'var(--gray-600)',
                            fontWeight: 500
                        }}>
                            Turkeys Available
                        </div>
                    </div>

                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 700,
                            color: 'var(--jalapeno)',
                            marginBottom: 'var(--spacing-2)'
                        }}>
                            {totalReserved}
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            color: 'var(--gray-600)',
                            fontWeight: 500
                        }}>
                            Turkeys Reserved
                        </div>
                    </div>

                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 700,
                            color: 'var(--honey-butter)',
                            marginBottom: 'var(--spacing-2)'
                        }}>
                            {formatPrice(totalRevenue, false)}
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            color: 'var(--gray-600)',
                            fontWeight: 500
                        }}>
                            Total Revenue (Pre-Tax)
                        </div>
                    </div>

                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 700,
                            color: 'var(--h2o)',
                            marginBottom: 'var(--spacing-2)'
                        }}>
                            {categorized.soldOut.length}
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            color: 'var(--gray-600)',
                            fontWeight: 500
                        }}>
                            Locations Sold Out
                        </div>
                    </div>
                </div>

                {/* Location Search */}
                <AdminLocationSearch restaurants={restaurants} />

                {/* Inventory Status Panels */}
                <div>
                    <h2 className="text-h2" style={{
                        marginBottom: 'var(--spacing-6)',
                        color: 'var(--gray-900)'
                    }}>
                        Inventory Status
                    </h2>

                    <InventoryPanel
                        title="NO RESERVATIONS (0%)"
                        icon="🔴"
                        color="red"
                        locations={categorized.noReservations}
                        type="no-reservations"
                    />

                    <InventoryPanel
                        title="LOW RESERVATIONS (1-49%)"
                        icon="🔵"
                        color="blue"
                        locations={categorized.lowReservations}
                        type="low"
                    />

                    <InventoryPanel
                        title="HALF RESERVED (50-74%)"
                        icon="🟡"
                        color="yellow"
                        locations={categorized.halfReserved}
                        type="half"
                    />

                    <InventoryPanel
                        title="THREE-QUARTERS RESERVED (75-99%)"
                        icon="🟠"
                        color="orange"
                        locations={categorized.threeQuartersReserved}
                        type="three-quarters"
                    />

                    <InventoryPanel
                        title="SOLD OUT (100%)"
                        icon="🟢"
                        color="green"
                        locations={categorized.soldOut}
                        type="sold-out"
                    />
                </div>
            </div>
        </div>
    );
}
