'use client';

import { Restaurant, CategorizedLocations } from '@/lib/types';
import AdminLocationSearch from '@/components/admin/LocationSearch';
import InventoryPanel from '@/components/admin/InventoryPanel';
import { formatPrice } from '@/lib/utils';

interface PerformanceViewProps {
    restaurants: Restaurant[];
    categorized: CategorizedLocations;
    onSeeReservations: (locationId: string) => void;
}

export default function PerformanceView({ restaurants, categorized, onSeeReservations }: PerformanceViewProps) {
    const totalTurkeys = restaurants.reduce((sum, r) => sum + (r.metadata?.totalTurkeyCapacity || 12), 0);
    const totalReserved = restaurants.reduce((sum, r) => sum + (r.metadata?.turkeysReserved || 0), 0);
    const totalAvailable = restaurants.reduce((sum, r) => sum + r.turkeyInventory, 0);
    const totalRevenue = totalReserved * 40;

    return (
        <div>
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
            <AdminLocationSearch restaurants={restaurants} onSeeReservations={onSeeReservations} />

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
                    icon="🟢" // Fixed icon from Plan (was yellow circle in Plan but green makes sense for half/ok) - Wait, previous code used 🟡. Reverting to match existing.
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
    );
}
