'use client';

import { useState, useEffect } from 'react';
import { Restaurant } from '@/lib/types';
import { searchLocations } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface AdminLocationSearchProps {
    restaurants: Restaurant[];
    onLocationSelect?: (restaurant: Restaurant) => void;
    onSeeReservations?: (locationId: string) => void;
}

export default function AdminLocationSearch({
    restaurants,
    onLocationSelect,
    onSeeReservations
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
        const reserved = restaurant.metadata?.turkeysReserved || 0;
        const total = restaurant.metadata?.totalTurkeyCapacity || 12;
        const percentage = (reserved / total) * 100;

        let badge;
        if (restaurant.turkeyInventory === 0) {
            badge = <Badge variant="success">🟢 Sold Out</Badge>;
        } else if (percentage >= 75) {
            badge = <Badge variant="warning">🟠 {restaurant.turkeyInventory}/{total}</Badge>;
        } else if (percentage >= 50) {
            badge = <Badge variant="attention">🟡 {restaurant.turkeyInventory}/{total}</Badge>;
        } else if (percentage === 0) {
            badge = <Badge variant="error">🔴 {restaurant.turkeyInventory}/{total}</Badge>;
        } else {
            badge = <Badge variant="info">🔵 {restaurant.turkeyInventory}/{total}</Badge>;
        }

        if (!restaurant.reservationsEnabled) {
            return (
                <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                    {badge}
                    <Badge variant="neutral">⚫ Disabled</Badge>
                </div>
            );
        }

        return badge;
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
                Examples: "100000" (location ID), "TX" (state), "Dallas" (city), "Broadway" (name)
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
                                            flexWrap: 'wrap',
                                            alignItems: 'center',
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

                                            {onSeeReservations && (
                                                (restaurant.metadata?.turkeysReserved || 0) > 0 ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onSeeReservations(restaurant.locationId);
                                                        }}
                                                        style={{
                                                            marginLeft: 'auto',
                                                            background: 'var(--gray-900)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: 'var(--radius-sm)',
                                                            padding: '0.25rem 0.75rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        See Reservations →
                                                    </button>
                                                ) : (
                                                    <button
                                                        disabled
                                                        style={{
                                                            marginLeft: 'auto',
                                                            background: 'var(--gray-200)',
                                                            color: 'var(--gray-500)',
                                                            border: 'none',
                                                            borderRadius: 'var(--radius-sm)',
                                                            padding: '0.25rem 0.75rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            cursor: 'not-allowed',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        No Reservations
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
