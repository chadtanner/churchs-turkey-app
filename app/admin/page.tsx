'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Restaurant, LocationStatus, CategorizedLocations } from '@/lib/types';
import PerformanceView from './components/PerformanceView';
import ReservationsView from './components/ReservationsView';

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
    const [activeTab, setActiveTab] = useState<'performance' | 'reservations'>('performance');

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

    return (
        <div style={{ background: 'var(--gray-50)', minHeight: '100vh' }}>
            <div className="container section-spacing">
                <h1 className="text-h1" style={{
                    marginBottom: 'var(--spacing-8)',
                    color: 'var(--gray-900)'
                }}>
                    Admin Dashboard
                </h1>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-1)',
                    marginBottom: 'var(--spacing-8)',
                    borderBottom: '2px solid var(--gray-200)'
                }}>
                    <button
                        onClick={() => setActiveTab('performance')}
                        style={{
                            padding: 'var(--spacing-4) var(--spacing-6)',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'performance' ? '3px solid var(--honey-butter)' : '3px solid transparent',
                            color: activeTab === 'performance' ? 'var(--gray-900)' : 'var(--gray-500)',
                            fontWeight: 600,
                            fontSize: '1.125rem',
                            cursor: 'pointer',
                            marginBottom: '-2px' // Overlap border
                        }}
                    >
                        Performance
                    </button>
                    <button
                        onClick={() => setActiveTab('reservations')}
                        style={{
                            padding: 'var(--spacing-4) var(--spacing-6)',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'reservations' ? '3px solid var(--honey-butter)' : '3px solid transparent',
                            color: activeTab === 'reservations' ? 'var(--gray-900)' : 'var(--gray-500)',
                            fontWeight: 600,
                            fontSize: '1.125rem',
                            cursor: 'pointer',
                            marginBottom: '-2px'
                        }}
                    >
                        Reservations
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'performance' ? (
                    <PerformanceView restaurants={restaurants} categorized={categorized} />
                ) : (
                    <ReservationsView />
                )}
            </div>
        </div>
    );
}
