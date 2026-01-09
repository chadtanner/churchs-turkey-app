'use client';

import { useState } from 'react';
import { LocationStatus } from '@/lib/types';

interface InventoryPanelProps {
    title: string;
    icon: string;
    color: string;
    locations: LocationStatus[];
    type: 'no-reservations' | 'low' | 'half' | 'three-quarters' | 'sold-out';
}

export default function InventoryPanel({
    title,
    icon,
    color,
    locations,
    type
}: InventoryPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const colorStyles = {
        'no-reservations': {
            bg: '#FEE2E2',
            border: '#DC2626',
            text: '#991B1B'
        },
        'low': {
            bg: '#DBEAFE',
            border: '#2563EB',
            text: '#1E3A8A'
        },
        'half': {
            bg: '#FEF3C7',
            border: '#D97706',
            text: '#78350F'
        },
        'three-quarters': {
            bg: '#FFEDD5',
            border: '#EA580C',
            text: '#7C2D12'
        },
        'sold-out': {
            bg: '#D1FAE5',
            border: '#059669',
            text: '#064E3B'
        }
    };

    const style = colorStyles[type];

    const exportCSV = () => {
        let csvContent = '';

        if (type === 'no-reservations') {
            csvContent = 'Location Name,Restaurant Number,City,State,Inventory,Pickup Date\n';
            locations.forEach(loc => {
                csvContent += `"${loc.location.restaurantName}",${loc.location.restaurantNumber},${loc.location.address.city},${loc.location.address.state},${loc.location.turkeyInventory},${loc.location.pickupDate}\n`;
            });
        } else if (type === 'sold-out') {
            csvContent = 'Location Name,Restaurant Number,City,State,Total Reserved\n';
            locations.forEach(loc => {
                csvContent += `"${loc.location.restaurantName}",${loc.location.restaurantNumber},${loc.location.address.city},${loc.location.address.state},${loc.totalReserved}\n`;
            });
        } else {
            csvContent = 'Location Name,Restaurant Number,City,State,Reserved,Total Inventory,Percentage\n';
            locations.forEach(loc => {
                csvContent += `"${loc.location.restaurantName}",${loc.location.restaurantNumber},${loc.location.address.city},${loc.location.address.state},${loc.totalReserved},${loc.totalInventory},${Math.round(loc.percentageReserved)}%\n`;
            });
        }

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-locations.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div style={{
            background: style.bg,
            border: `4px solid ${style.border}`,
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--spacing-6)',
            overflow: 'hidden'
        }}>
            <div
                style={{
                    padding: 'var(--spacing-4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.5)'
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: style.text,
                        marginBottom: 'var(--spacing-1)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '0.5ch'
                    }}>
                        <span>{icon} {title.split('(')[0].trim()}</span>
                        {title.includes('(') && (
                            <span style={{ fontSize: '1rem', opacity: 0.9 }}>
                                ({title.split('(')[1]}
                            </span>
                        )}
                    </h3>
                    <span style={{
                        fontSize: '0.875rem',
                        color: style.text,
                        opacity: 0.8
                    }}>
                        {locations.length} location{locations.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <button
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        color: style.text,
                        cursor: 'pointer'
                    }}
                >
                    {isExpanded ? '▲' : '▼'}
                </button>
            </div>

            {isExpanded && (
                <div style={{
                    padding: 'var(--spacing-4)',
                    background: 'var(--mayo)'
                }}>
                    <div style={{ marginBottom: 'var(--spacing-4)' }}>
                        <button
                            onClick={exportCSV}
                            className="btn btn-secondary btn-sm"
                        >
                            Export CSV
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.875rem'
                        }}>
                            <thead>
                                <tr style={{
                                    borderBottom: '2px solid var(--gray-200)',
                                    background: 'var(--gray-50)'
                                }}>
                                    <th style={{
                                        padding: 'var(--spacing-3)',
                                        textAlign: 'left',
                                        fontWeight: 600,
                                        color: 'var(--gray-700)'
                                    }}>ID</th>
                                    <th style={{
                                        padding: 'var(--spacing-3)',
                                        textAlign: 'left',
                                        fontWeight: 600,
                                        color: 'var(--gray-700)'
                                    }}>Location</th>
                                    <th style={{
                                        padding: 'var(--spacing-3)',
                                        textAlign: 'left',
                                        fontWeight: 600,
                                        color: 'var(--gray-700)'
                                    }}>City, State</th>
                                    {type !== 'no-reservations' && type !== 'sold-out' && (
                                        <>
                                            <th style={{
                                                padding: 'var(--spacing-3)',
                                                textAlign: 'center',
                                                fontWeight: 600,
                                                color: 'var(--gray-700)'
                                            }}>Reserved</th>
                                            <th style={{
                                                padding: 'var(--spacing-3)',
                                                textAlign: 'center',
                                                fontWeight: 600,
                                                color: 'var(--gray-700)'
                                            }}>Total</th>
                                            <th style={{
                                                padding: 'var(--spacing-3)',
                                                textAlign: 'center',
                                                fontWeight: 600,
                                                color: 'var(--gray-700)'
                                            }}>%</th>
                                            <th style={{
                                                padding: 'var(--spacing-3)',
                                                textAlign: 'left',
                                                fontWeight: 600,
                                                color: 'var(--gray-700)'
                                            }}>Progress</th>
                                        </>
                                    )}
                                    {type === 'no-reservations' && (
                                        <>
                                            <th style={{
                                                padding: 'var(--spacing-3)',
                                                textAlign: 'center',
                                                fontWeight: 600,
                                                color: 'var(--gray-700)'
                                            }}>Inventory</th>
                                            <th style={{
                                                padding: 'var(--spacing-3)',
                                                textAlign: 'left',
                                                fontWeight: 600,
                                                color: 'var(--gray-700)'
                                            }}>Pickup Date</th>
                                        </>
                                    )}
                                    {type === 'sold-out' && (
                                        <>
                                            <th style={{
                                                padding: 'var(--spacing-3)',
                                                textAlign: 'center',
                                                fontWeight: 600,
                                                color: 'var(--gray-700)'
                                            }}>Total Reserved</th>
                                            <th style={{
                                                padding: 'var(--spacing-3)',
                                                textAlign: 'center',
                                                fontWeight: 600,
                                                color: 'var(--gray-700)'
                                            }}>Status</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {locations.map(loc => (
                                    <tr
                                        key={loc.location.locationId}
                                        style={{
                                            borderBottom: '1px solid var(--gray-200)'
                                        }}
                                    >
                                        <td style={{
                                            padding: 'var(--spacing-3)',
                                            color: 'var(--gray-600)',
                                            fontFamily: 'monospace',
                                            fontSize: '0.8125rem'
                                        }}>
                                            {loc.location.locationId}
                                        </td>
                                        <td style={{
                                            padding: 'var(--spacing-3)',
                                            fontWeight: 500,
                                            color: 'var(--gray-900)'
                                        }}>
                                            {loc.location.restaurantName.replace('Church\'s Texas Chicken - ', '')}
                                        </td>
                                        <td style={{
                                            padding: 'var(--spacing-3)',
                                            color: 'var(--gray-600)'
                                        }}>
                                            {loc.location.address.city}, {loc.location.address.state}
                                        </td>
                                        {type !== 'no-reservations' && type !== 'sold-out' && (
                                            <>
                                                <td style={{
                                                    padding: 'var(--spacing-3)',
                                                    textAlign: 'center',
                                                    color: 'var(--gray-900)'
                                                }}>
                                                    {loc.totalReserved}
                                                </td>
                                                <td style={{
                                                    padding: 'var(--spacing-3)',
                                                    textAlign: 'center',
                                                    color: 'var(--gray-900)'
                                                }}>
                                                    {loc.totalInventory}
                                                </td>
                                                <td style={{
                                                    padding: 'var(--spacing-3)',
                                                    textAlign: 'center',
                                                    fontWeight: 600,
                                                    color: 'var(--gray-900)'
                                                }}>
                                                    {Math.round(loc.percentageReserved)}%
                                                </td>
                                                <td style={{ padding: 'var(--spacing-3)' }}>
                                                    <div style={{
                                                        width: '100%',
                                                        height: '20px',
                                                        background: 'var(--gray-200)',
                                                        borderRadius: 'var(--radius-full)',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            width: `${loc.percentageReserved}%`,
                                                            height: '100%',
                                                            background: style.border,
                                                            transition: 'width 0.3s ease'
                                                        }} />
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                        {type === 'no-reservations' && (
                                            <>
                                                <td style={{
                                                    padding: 'var(--spacing-3)',
                                                    textAlign: 'center',
                                                    color: 'var(--gray-900)'
                                                }}>
                                                    {loc.location.turkeyInventory}
                                                </td>
                                                <td style={{
                                                    padding: 'var(--spacing-3)',
                                                    color: 'var(--gray-600)'
                                                }}>
                                                    {loc.location.pickupDate}
                                                </td>
                                            </>
                                        )}
                                        {type === 'sold-out' && (
                                            <>
                                                <td style={{
                                                    padding: 'var(--spacing-3)',
                                                    textAlign: 'center',
                                                    fontWeight: 600,
                                                    color: 'var(--gray-900)'
                                                }}>
                                                    {loc.totalReserved}
                                                </td>
                                                <td style={{
                                                    padding: 'var(--spacing-3)',
                                                    textAlign: 'center',
                                                    fontSize: '1.25rem'
                                                }}>
                                                    🎉
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
