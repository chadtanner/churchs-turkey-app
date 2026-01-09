import Link from 'next/link';

export default function Footer() {
    return (
        <footer style={{
            background: 'var(--black-pepper)',
            color: 'var(--mayo)',
            padding: 'var(--spacing-12) 0 var(--spacing-6)'
        }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: 'var(--spacing-8)',
                    marginBottom: 'var(--spacing-8)'
                }}>
                    <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-4)' }}>
                            About
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li style={{ marginBottom: 'var(--spacing-2)' }}>
                                <Link href="#" style={{
                                    color: 'var(--gray-400)',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    transition: 'color 0.2s ease'
                                }}>
                                    Our Story
                                </Link>
                            </li>
                            <li style={{ marginBottom: 'var(--spacing-2)' }}>
                                <Link href="#" style={{
                                    color: 'var(--gray-400)',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem'
                                }}>
                                    Locations
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-4)' }}>
                            Support
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li style={{ marginBottom: 'var(--spacing-2)' }}>
                                <Link href="#" style={{
                                    color: 'var(--gray-400)',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem'
                                }}>
                                    Contact Us
                                </Link>
                            </li>
                            <li style={{ marginBottom: 'var(--spacing-2)' }}>
                                <Link href="#" style={{
                                    color: 'var(--gray-400)',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem'
                                }}>
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-4)' }}>
                            Legal
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li style={{ marginBottom: 'var(--spacing-2)' }}>
                                <Link href="#" style={{
                                    color: 'var(--gray-400)',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem'
                                }}>
                                    Privacy Policy
                                </Link>
                            </li>
                            <li style={{ marginBottom: 'var(--spacing-2)' }}>
                                <Link href="#" style={{
                                    color: 'var(--gray-400)',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem'
                                }}>
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div style={{
                    paddingTop: 'var(--spacing-6)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: 'var(--gray-400)'
                }}>
                    © {new Date().getFullYear()} Church's Texas Chicken. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
