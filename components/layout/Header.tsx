'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
    return (
        <header style={{
            background: '#FFFFFF',
            color: '#2D3748',
            padding: 'var(--spacing-3) 0',
            boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
            borderBottom: '1px solid #E5E7EB'
        }}>
            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Link href="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none'
                }}>
                    <Image
                        src="/images/churchs-logo.png"
                        alt="Church's Texas Chicken"
                        width={90}
                        height={30}
                        style={{ height: 'auto' }}
                        priority
                    />
                </Link>

                <nav style={{ display: 'flex', gap: 'var(--spacing-6)' }}>
                    <Link href="/" style={{
                        color: '#2D3748',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '1.125rem',
                        transition: 'color 0.2s ease'
                    }} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A525'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#2D3748'}>
                        Home
                    </Link>
                    <Link href="/reserve" style={{
                        color: '#2D3748',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '1.125rem',
                        transition: 'color 0.2s ease'
                    }} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A525'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#2D3748'}>
                        Reserve
                    </Link>
                    <Link href="/admin" style={{
                        color: '#2D3748',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '1.125rem',
                        transition: 'color 0.2s ease'
                    }} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A525'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#2D3748'}>
                        Admin
                    </Link>
                </nav>
            </div>
        </header>
    );
}
