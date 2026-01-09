import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';

export default function Home() {
    return (
        <div>
            {/* Hero Product Section */}
            <section style={{ background: 'var(--gray-50)', padding: 'var(--spacing-8) 0' }}>
                <div className="container">
                    <div className="grid-stack-mobile grid-2-cols" style={{
                        alignItems: 'start'
                    }}>
                        {/* Left: Image */}
                        <div style={{ position: 'sticky', top: 'var(--spacing-8)' }}>
                            <Image
                                src="/images/turkey-hero-v2.png"
                                alt="Smoked Turkey"
                                width={600}
                                height={600}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: 'var(--radius-xl)',
                                    boxShadow: 'var(--shadow-2xl)'
                                }}
                                priority
                            />
                        </div>

                        {/* Right: Details */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--spacing-5)'
                        }}>
                            <div style={{
                                display: 'inline-block',
                                width: 'fit-content',
                                padding: '0.5rem 1rem',
                                background: 'var(--honey-butter)',
                                color: 'var(--black-pepper)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                borderRadius: 'var(--radius-full)'
                            }}>
                                Limited Time Offer
                            </div>

                            <h1 className="text-h1" style={{ fontWeight: 700, margin: 0, color: 'var(--gray-900)' }}>
                                <em>Church's</em><span style={{ fontWeight: 300, fontSize: '0.6em', verticalAlign: 'super' }}>®</span> Smoked Turkey Is Here!
                            </h1>

                            <p style={{ fontSize: '1.75rem', color: 'var(--gray-600)', fontWeight: 500, margin: 0 }}>
                                Pre-Seasoned, Pre-Cooked, Frozen
                            </p>

                            <div>
                                <p style={{ color: 'var(--gray-700)', marginBottom: 'var(--spacing-3)', fontSize: '1.125rem', lineHeight: 1.6 }}>
                                    Make your Thanksgiving easier with our expertly smoked, fully cooked turkey.
                                    Each turkey is carefully prepared and smoked to perfection, delivering rich flavor your family will love.
                                </p>

                                <ul style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 'var(--spacing-3) 0 0 0'
                                }}>
                                    {[
                                        '10-12 lb turkey, serves 8-10 people',
                                        'Slow-smoked with premium wood chips',
                                        'Thawing and heating instructions included'
                                    ].map((feature, index) => (
                                        <li key={index} style={{
                                            display: 'flex',
                                            alignItems: 'start',
                                            gap: 'var(--spacing-2)',
                                            padding: 'var(--spacing-1) 0',
                                            fontSize: '1rem',
                                            color: 'var(--gray-700)',
                                            lineHeight: 1.5
                                        }}>
                                            <span style={{
                                                color: 'var(--jalapeno)',
                                                fontWeight: 700,
                                                flexShrink: 0
                                            }}>✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: 'var(--spacing-2)'
                                }}>
                                    <span style={{
                                        fontSize: '3rem',
                                        fontWeight: 700,
                                        color: 'var(--og-heat)',
                                        lineHeight: 1
                                    }}>$40.00</span>
                                    <span style={{
                                        fontSize: '1rem',
                                        color: 'var(--gray-600)'
                                    }}>(excludes tax)</span>
                                </div>
                            </div>

                            <Link href="/reserve" style={{ textDecoration: 'none' }}>
                                <Button variant="primary" size="lg" fullWidth>
                                    Make Reservation
                                </Button>
                            </Link>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--spacing-2)',
                                padding: 'var(--spacing-3)',
                                background: 'var(--gray-50)',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--gray-200)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-2)',
                                    fontSize: '0.875rem',
                                    color: 'var(--gray-700)'
                                }}>
                                    <span style={{ fontSize: '1.125rem' }}>📅</span>
                                    <span>Pickup: November 25, 2026</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-2)',
                                    fontSize: '0.875rem',
                                    color: 'var(--gray-700)'
                                }}>
                                    <span style={{ fontSize: '1.125rem' }}>📍</span>
                                    <span>50+ participating locations nationwide</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-2)',
                                    fontSize: '0.875rem',
                                    color: 'var(--gray-700)'
                                }}>
                                    <span style={{ fontSize: '1.125rem' }}>⚠️</span>
                                    <span>Limited availability – Reserve today!</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="section-spacing">
                <div className="container">
                    <h2 className="text-h2" style={{
                        textAlign: 'center',
                        marginBottom: 'var(--spacing-12)',
                        color: 'var(--gray-900)'
                    }}>
                        How It Works
                    </h2>

                    <div className="grid-stack-mobile" style={{
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
                    }}>
                        {[
                            {
                                step: '1',
                                title: 'Find Your Location',
                                description: 'Search for the nearest Church\'s Texas Chicken participating in our Thanksgiving turkey promotion.'
                            },
                            {
                                step: '2',
                                title: 'Reserve Your Turkey',
                                description: 'Select your pickup time, choose quantity, and provide your contact information.'
                            },
                            {
                                step: '3',
                                title: 'Pick Up & Enjoy',
                                description: 'Pick up your smoked turkey, thaw, heat and enjoy a stress-free Thanksgiving!'
                            }
                        ].map((item) => (
                            <div key={item.step} style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    margin: '0 auto var(--spacing-4)',
                                    background: 'var(--honey-butter)',
                                    color: 'var(--black-pepper)',
                                    borderRadius: 'var(--radius-full)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                    fontWeight: 700
                                }}>
                                    {item.step}
                                </div>
                                <h3 className="text-h4" style={{
                                    marginBottom: 'var(--spacing-2)',
                                    color: 'var(--gray-900)'
                                }}>
                                    {item.title}
                                </h3>
                                <p className="text-body" style={{ color: 'var(--gray-600)' }}>
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Key Features Section */}
            <section className="section-spacing" style={{ background: 'var(--gray-50)' }}>
                <div className="container">
                    <h2 className="text-h2" style={{
                        textAlign: 'center',
                        marginBottom: 'var(--spacing-12)',
                        color: 'var(--gray-900)'
                    }}>
                        Why Choose Our Smoked Turkey?
                    </h2>

                    <div className="grid-stack-mobile grid-4-cols">
                        {[
                            {
                                icon: '🔥',
                                title: 'Expert Smoking',
                                description: 'Slow-smoked for hours with premium wood chips for authentic, rich flavor.'
                            },
                            {
                                icon: '⏱️',
                                title: 'Save Time',
                                description: 'Minimal prep, no stress. Just thaw, heat and serve for a perfect Thanksgiving.'
                            },
                            {
                                icon: '👨‍🍳',
                                title: 'Restaurant Quality',
                                description: 'Prepared by our expert chefs using time-tested recipes and techniques.'
                            },
                            {
                                icon: '💰',
                                title: 'Great Value',
                                description: 'Premium quality at an affordable price. Feed 8-10 people for just $40.'
                            }
                        ].map((feature, index) => (
                            <div key={index} className="card" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-3)' }}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-h4" style={{
                                    marginBottom: 'var(--spacing-2)',
                                    color: 'var(--gray-900)'
                                }}>
                                    {feature.title}
                                </h3>
                                <p className="text-body" style={{ color: 'var(--gray-600)' }}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-spacing">
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 className="text-h2" style={{
                        marginBottom: 'var(--spacing-4)',
                        color: 'var(--gray-900)'
                    }}>
                        Ready to Reserve Your Turkey?
                    </h2>
                    <p className="text-body-lg" style={{
                        marginBottom: 'var(--spacing-8)',
                        color: 'var(--gray-600)',
                        maxWidth: '600px',
                        margin: '0 auto var(--spacing-8)'
                    }}>
                        Don't wait – turkeys are limited and selling fast. Reserve yours today for a
                        stress-free, delicious Thanksgiving celebration.
                    </p>
                    <Link href="/reserve" style={{ textDecoration: 'none' }}>
                        <Button variant="primary" size="lg">
                            Make Your Reservation Now
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
