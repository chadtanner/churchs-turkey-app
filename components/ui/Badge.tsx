import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'attention';
}

export default function Badge({ children, variant = 'neutral' }: BadgeProps) {
    const variantClass = `badge-${variant}`;

    return (
        <span className={`badge ${variantClass}`}>
            {children}
        </span>
    );
}
