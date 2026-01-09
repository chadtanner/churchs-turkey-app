import React from 'react';

interface CardProps {
    children: React.ReactNode;
    bordered?: boolean;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}

export default function Card({ children, bordered = false, className = '', style, onClick }: CardProps) {
    const cardClass = bordered ? 'card-bordered' : 'card';

    return (
        <div className={`${cardClass} ${className}`} style={style} onClick={onClick}>
            {children}
        </div>
    );
}
