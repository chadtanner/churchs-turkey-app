'use client';

import { useState, useEffect } from 'react';
import { Restaurant } from '@/lib/types';
import { searchLocations } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface AdminLocationSearchProps {
    restaurants: Restaurant[];
    onLocationSelect?: (restaurant: Restaurant) => void;
}

export default function AdminLocationSearch({
    restaurants,
    onLocationSelect
}: AdminLocationSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        const timer = setTimeout(() => {
            const results = searchLocations(restaurants, searchQuery);
            setSearchResults(results);
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, restaurants]);

    const handleClear = () => {
        setSearchQuery('');
        setSearchResults([]);
    };

    const getStatusBadge = (restaurant: Restaurant) => {
        if (!restaurant.reservationsEnabled) {
            return <Badge variant="neutral">⚫ Disabled</Badge>;
        }
        if (restaurant.turkeyInventory === 0) {
            return <Badge variant="success">🟢 Sold Out</Badge>;
        }

        const reserved = restaurant.metadata?.turkeysReserved || 0;
        const total = restaurant.metadata?.totalTurkeyCapacity || 12;
        const percentage = (reserved / total) * 100;

        if (percentage >= 75) {
            return <Badge variant="warning">🟠 {restaurant.turkeyInventory}/{total}</Badge>;
        }
        if (percentage >= 50) {
            return <Badge variant="info">🟡 {restaurant.turkeyInventory}/{total}</Badge>;
        }
        if (percentage === 0) {
            return <Badge variant="error">🔴 {restaurant.turkeyInventory}/{total}</Badge>;
        }
        return <Badge variant="neutral">{restaurant.turkeyInventory}/{total}</Badge>;
    };

    return (
        <div style={{
            marginBottom: 'var(--spacing-6)',
            padding: 'var(--spacing-4)',
            background: 'var(--mayo)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
            <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                marginBottom: 'var(--spacing-2)',
                color: 'var(--gray-900)'
            }}>
                🔍 Location Search
            </h3>

            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by location ID (6 digits), state, city, or name..."
                    className="input-field"
                    aria-label="Search locations"
                />

                {searchQuery && (
                    <button
                        onClick={handleClear}
                        style={{
                            position: 'absolute',
                            right: 'var(--spacing-3)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--gray-500)',
                            cursor: 'pointer',
                            fontSize: '1.25rem',
                            padding: 'var(--spacing-1)'
                        }}
                        aria-label="Clear search"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div style={{
                fontSize: '0.75rem',
                color: 'var(--gray-500)',
                marginTop: 'var(--spacing-1)'
            }}>
                Examples: "100000" (location ID), "TX" (state), "Dallas" (city)
            </div>

            {isSearching && (
                <div style={{ marginTop: 'var(--spacing-3)', color: 'var(--gray-600)' }}>
                    Searching...
                </div>
            )}

            {!isSearching && searchQuery && searchResults.length === 0 && (
                <div style={{
                    marginTop: 'var(--spacing-3)',
                    padding: 'var(--spacing-4)',
                    background: 'var(--gray-100)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--gray-700)'
                }}>
                    <p style={{ fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>
                        No locations found for "{searchQuery}"
                    </p>
                    <p style={{ fontSize: '0.875rem' }}>Try searching by:</p>
                    <ul style={{ fontSize: '0.875rem', marginTop: 'var(--spacing-1)' }}>
                        <li>• Location ID (e.g., 100000)</li>
                        <li>• State code (e.g., TX, CA, FL)</li>
                        <li>• City name (e.g., Dallas, Atlanta)</li>
                        <li>• Neighborhood (e.g., Downtown, Midtown)</li>
                    </ul>
                </div>
            )}

            {!isSearching && searchResults.length > 0 && (
                <div style={{ marginTop: 'var(--spacing-3)' }}>
                    <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--gray-600)',
                        marginBottom: 'var(--spacing-3)'
                    }}>
                        Found {searchResults.length} location{searchResults.length !== 1 ? 's' : ''}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                        {searchResults.map(restaurant => (
                            <div
                                key={restaurant.locationId}
                                style={{
                                    padding: 'var(--spacing-4)',
                                    border: '2px solid var(--gray-200)',
                                    borderRadius: 'var(--radius-lg)',
                                    cursor: onLocationSelect ? 'pointer' : 'default',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => onLocationSelect?.(restaurant)}
                                onMouseEnter={(e) => {
                                    if (onLocationSelect) {
                                        e.currentTarget.style.borderColor = 'var(--honey-butter)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--gray-200)';
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'start',
                                    marginBottom: 'var(--spacing-2)'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--spacing-2)',
                                            marginBottom: 'var(--spacing-1)'
                                        }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontFamily: 'monospace',
                                                background: 'var(--gray-100)',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: 'var(--radius-sm)'
                                            }}>
                                                #{restaurant.locationId}
                                            </span>
                                            {getStatusBadge(restaurant)}
                                        </div>

                                        <h4 style={{
                                            fontWeight: 600,
                                            fontSize: '1.125rem',
                                            marginBottom: 'var(--spacing-1)',
                                            color: 'var(--gray-900)'
                                        }}>
                                            {restaurant.restaurantName}
                                        </h4>

                                        <p style={{
                                            fontSize: '0.875rem',
                                            color: 'var(--gray-600)'
                                        }}>
                                            {restaurant.address.street}, {restaurant.address.city}, {restaurant.address.state} {restaurant.address.zipCode}
                                        </p>

                                        <div style={{
                                            display: 'flex',
                                            gap: 'var(--spacing-4)',
                                            marginTop: 'var(--spacing-2)',
                                            fontSize: '0.75rem',
                                            color: 'var(--gray-500)'
                                        }}>
                                            <span>Restaurant #{restaurant.restaurantNumber}</span>
                                            <span>•</span>
                                            <span>Price: ${restaurant.turkeyPrice.toFixed(2)}</span>
                                            <span>•</span>
                                            <span>Pickup: {restaurant.pickupDate}</span>
                                        </div>
                                    </div>
                                </div>

                                {!restaurant.reservationsEnabled && (
                                    <div style={{
                                        marginTop: 'var(--spacing-2)',
                                        padding: 'var(--spacing-2)',
                                        background: '#FEE2E2',
                                        border: '1px solid #FCA5A5',
                                        borderRadius: 'var(--radius)',
                                        fontSize: '0.875rem'
                                    }}>
                                        <span style={{ fontWeight: 500, color: '#991B1B' }}>Disabled:</span>
                                        <span style={{ color: '#B91C1C' }}> {restaurant.disabledReason}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
