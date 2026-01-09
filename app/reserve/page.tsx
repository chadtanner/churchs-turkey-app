'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, addDoc, doc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Restaurant, TimeSlot } from '@/lib/types';
import { generateTimeSlots, formatPickupDate, formatPrice, calculateDistance } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function ReservePage() {
    const [step, setStep] = useState<'location' | 'details' | 'confirmation'>('location');
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [nearbyLocations, setNearbyLocations] = useState<Restaurant[]>([]);

    // Fetch restaurants on mount
    useEffect(() => {
        async function fetchRestaurants() {
            try {
                const q = query(
                    collection(db, 'restaurants'),
                    where('isActive', '==', true),
                    where('reservationsEnabled', '==', true)
                );
                const querySnapshot = await getDocs(q);
                const restaurantData: Restaurant[] = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data() as Restaurant;
                    if (data.turkeyInventory > 0) {
                        restaurantData.push(data);
                    }
                });

                setRestaurants(restaurantData);
                setFilteredRestaurants(restaurantData);
            } catch (error) {
                console.error('Error fetching restaurants:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchRestaurants();
    }, []);

    // Request geolocation (auto-detect)
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    // Fail silently for auto-detect, user can click button to retry
                    console.log('Auto-geolocation not available:', error);
                }
            );
        }
    }, []);

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
                setIsLocating(false);
                setSearchQuery(''); // Clear manual search when using location
            },
            (error) => {
                console.error('Geolocation error:', error);
                let errorMessage = 'Unable to get your location. Please try searching by city or zip code.';
                if (error.code === 1) { // PERMISSION_DENIED
                    errorMessage = 'Location access denied. Please enable location services for this site or search manually.';
                }
                alert(errorMessage);
                setIsLocating(false);
            }
        );
    };

    // Filter and Sort restaurants
    useEffect(() => {
        let results = [...restaurants];

        // 1. Filter by Search Query (if exists)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            results = results.filter(r =>
                r.address.city.toLowerCase().includes(query) ||
                r.address.state.toLowerCase().includes(query) ||
                r.address.zipCode.includes(query) ||
                r.restaurantName.toLowerCase().includes(query)
            );

            // If searching, we don't enforce distance limit, but we do sort by distance if location available
            if (userLocation) {
                results.sort((a, b) => {
                    const distA = calculateDistance(userLocation.lat, userLocation.lon, a.address.latitude, a.address.longitude);
                    const distB = calculateDistance(userLocation.lat, userLocation.lon, b.address.latitude, b.address.longitude);
                    return distA - distB;
                });
            }
        }
        // 2. Filter by Location (if available and no search query)
        else if (userLocation) {
            // Calculate distance for all
            const withDistance = results.map(r => ({
                ...r,
                distance: calculateDistance(userLocation.lat, userLocation.lon, r.address.latitude, r.address.longitude)
            }));

            // Sort by distance
            withDistance.sort((a, b) => a.distance - b.distance);

            // Filter to 50 miles
            const nearby = withDistance.filter(r => r.distance <= 50);

            if (nearby.length > 0) {
                results = nearby;
            } else {
                // FALLBACK: If nothing within 50 miles, return top 5 closest
                // We keep results as is (sorted by distance), effectively showing closest
                // But we might want to communicate this to the user in the UI
            }

            // Map back to Restaurant type (remove extra distance prop if we added it, 
            // though keeping it effectively just sorts the original array if we used map logic differently)
            // Actually, simplified sorting on the original array is easier:
            results.sort((a, b) => {
                const distA = calculateDistance(userLocation.lat, userLocation.lon, a.address.latitude, a.address.longitude);
                const distB = calculateDistance(userLocation.lat, userLocation.lon, b.address.latitude, b.address.longitude);
                return distA - distB;
            });
        }

        setFilteredRestaurants(results);
    }, [searchQuery, userLocation, restaurants]);

    // Derived state for display logic
    const showNearbyFallback = userLocation && !searchQuery && filteredRestaurants.length > 0 &&
        calculateDistance(userLocation.lat, userLocation.lon, filteredRestaurants[0].address.latitude, filteredRestaurants[0].address.longitude) > 50;

    const handleSelectLocation = (restaurant: Restaurant) => {
        setSelectedRestaurant(restaurant);
        setStep('details');
    };

    if (loading) {
        return (
            <div className="container section-spacing">
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
                    <p className="text-body-lg" style={{ color: 'var(--gray-600)' }}>
                        Loading available locations...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container section-spacing">
            <h1 className="text-h1" style={{
                marginBottom: 'var(--spacing-8)',
                color: 'var(--gray-900)',
                textAlign: 'center'
            }}>
                Reserve Your Turkey
            </h1>

            {/* Step 1: Location Selection */}
            {step === 'location' && (
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <Card style={{ marginBottom: 'var(--spacing-6)' }}>
                        <h2 className="text-h3" style={{ marginBottom: 'var(--spacing-4)', color: 'var(--gray-900)' }}>
                            Find Your Location
                        </h2>

                        <div className="flex-stack-mobile flex-row-desktop" style={{ marginBottom: 'var(--spacing-4)' }}>
                            <div className="w-full-mobile" style={{ flex: 1 }}>
                                <Input
                                    type="text"
                                    placeholder="Search by city, state, or zip code..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="secondary"
                                onClick={handleUseLocation}
                                disabled={isLocating}
                                className="w-full-mobile w-auto-desktop"
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                {isLocating ? 'Locating...' : '📍 Use my location'}
                            </Button>
                        </div>

                        {userLocation && (
                            <div style={{
                                padding: 'var(--spacing-3)',
                                background: 'var(--gray-100)',
                                borderRadius: 'var(--radius)',
                                fontSize: '0.875rem',
                                color: 'var(--gray-700)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-2)'
                            }}>
                                <span>📍 Showing locations near you</span>
                                {showNearbyFallback && (
                                    <span style={{ color: 'var(--warning)', fontWeight: 500 }}>
                                        (No locations within 50 miles. Showing closest options.)
                                    </span>
                                )}
                            </div>
                        )}
                    </Card>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                        {filteredRestaurants.length === 0 ? (
                            <Card style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
                                <p className="text-body" style={{ color: 'var(--gray-600)' }}>
                                    No locations found. Try a different search term.
                                </p>
                            </Card>
                        ) : (
                            filteredRestaurants.slice(0, 10).map((restaurant) => {
                                const distance = userLocation
                                    ? calculateDistance(userLocation.lat, userLocation.lon, restaurant.address.latitude, restaurant.address.longitude)
                                    : null;

                                return (
                                    <Card
                                        key={restaurant.locationId}
                                        bordered
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleSelectLocation(restaurant)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div style={{ flex: 1 }}>
                                                <h3 className="text-h4" style={{ marginBottom: 'var(--spacing-2)', color: 'var(--gray-900)' }}>
                                                    {restaurant.restaurantName}
                                                </h3>
                                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>
                                                    {restaurant.address.street}, {restaurant.address.city}, {restaurant.address.state} {restaurant.address.zipCode}
                                                </p>
                                                <div style={{ display: 'flex', gap: 'var(--spacing-4)', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                                    {distance && (
                                                        <span>📍 {distance.toFixed(1)} miles away</span>
                                                    )}
                                                    <span>📅 Pickup: {formatPickupDate(restaurant.pickupDate)}</span>
                                                    <span>🍗 {restaurant.turkeyInventory} available</span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--og-heat)' }}>
                                                    {formatPrice(restaurant.turkeyPrice, false)}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                                    (excludes tax)
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Step 2: Reservation Details */}
            {step === 'details' && selectedRestaurant && (
                <ReservationForm
                    restaurant={selectedRestaurant}
                    onBack={() => setStep('location')}
                    onComplete={() => setStep('confirmation')}
                />
            )}

            {/* Step 3: Confirmation */}
            {step === 'confirmation' && (
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    <Card style={{ padding: 'var(--spacing-8)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-4)' }}>✅</div>
                        <h2 className="text-h2" style={{ marginBottom: 'var(--spacing-4)', color: 'var(--gray-900)' }}>
                            Reservation Complete!
                        </h2>
                        <p className="text-body" style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-6)' }}>
                            This is a prototype - in production, you would receive a confirmation email with your reservation details.
                        </p>
                        <Button variant="primary" onClick={() => {
                            setStep('location');
                            setSelectedRestaurant(null);
                        }}>
                            Make Another Reservation
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
}

// Reservation Form Component
function ReservationForm({
    restaurant,
    onBack,
    onComplete
}: {
    restaurant: Restaurant;
    onBack: () => void;
    onComplete: () => void;
}) {
    const [quantity, setQuantity] = useState(1);
    const [selectedTime, setSelectedTime] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const timeSlots = generateTimeSlots(restaurant);
    const maxQuantity = Math.min(restaurant.turkeyInventory, restaurant.reservationLimit);
    const totalPrice = quantity * restaurant.turkeyPrice;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Create reservation and update inventory in a transaction
            const confirmedReservation = await runTransaction(db, async (transaction) => {
                // Get restaurant document
                const restaurantRef = doc(db, 'restaurants', restaurant.restaurantNumber);
                const restaurantDoc = await transaction.get(restaurantRef);

                if (!restaurantDoc.exists()) {
                    throw new Error('Restaurant not found');
                }

                const restaurantData = restaurantDoc.data() as Restaurant;

                // Check if enough inventory
                if (restaurantData.turkeyInventory < quantity) {
                    throw new Error('Not enough inventory available');
                }

                // Create reservation
                const reservationData = {
                    confirmationId: `CTX-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                    restaurantNumber: restaurant.restaurantNumber,
                    restaurantName: restaurant.restaurantName,
                    restaurantAddress: `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.state} ${restaurant.address.zipCode}`,
                    customer: {
                        firstName,
                        lastName,
                        email,
                        phone
                    },
                    reservation: {
                        turkeyQuantity: quantity,
                        pickupDate: restaurant.pickupDate,
                        pickupTime: selectedTime,
                        pickupDateTime: new Date(`${restaurant.pickupDate}T${selectedTime}`)
                    },
                    status: 'confirmed',
                    emailSent: false,
                    emailSentAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    metadata: {
                        ipAddress: null,
                        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
                        source: 'web'
                    }
                };

                // Add reservation
                const reservationRef = doc(collection(db, 'reservations'));
                transaction.set(reservationRef, reservationData);

                // Update restaurant inventory and metadata
                transaction.update(restaurantRef, {
                    turkeyInventory: restaurantData.turkeyInventory - quantity,
                    'metadata.turkeysReserved': (restaurantData.metadata?.turkeysReserved || 0) + quantity,
                    updatedAt: new Date()
                });

                return reservationData;
            });

            // Send Confirmation Email
            try {
                await fetch('/api/email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        reservation: {
                            customerName: `${confirmedReservation.customer.firstName} ${confirmedReservation.customer.lastName}`,
                            customerEmail: confirmedReservation.customer.email,
                            confirmationId: confirmedReservation.confirmationId,
                            quantity: confirmedReservation.reservation.turkeyQuantity,
                            totalAmount: confirmedReservation.reservation.turkeyQuantity * restaurant.turkeyPrice,
                            pickupTime: confirmedReservation.reservation.pickupTime
                        },
                        restaurant: restaurant
                    })
                });
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError);
                // We don't block the UI success state if email fails
            }

            console.log('Reservation created successfully!');
            onComplete();
        } catch (error) {
            console.error('Error creating reservation:', error);
            alert('Failed to create reservation. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <Card style={{ marginBottom: 'var(--spacing-6)' }}>
                <h3 className="text-h3" style={{ marginBottom: 'var(--spacing-4)', color: 'var(--gray-900)' }}>
                    {restaurant.restaurantName}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    {restaurant.address.street}, {restaurant.address.city}, {restaurant.address.state} {restaurant.address.zipCode}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: 'var(--spacing-2)' }}>
                    📅 Pickup: {formatPickupDate(restaurant.pickupDate)}
                </p>
            </Card>

            <form onSubmit={handleSubmit}>
                <Card style={{ marginBottom: 'var(--spacing-6)' }}>
                    <h3 className="text-h4" style={{ marginBottom: 'var(--spacing-4)', color: 'var(--gray-900)' }}>
                        Reservation Details
                    </h3>

                    <div className="form-group">
                        <label className="form-label">Pickup Time *</label>
                        <select
                            className="input-field"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            required
                        >
                            <option value="">Select a time...</option>
                            {timeSlots.map((slot) => (
                                <option key={slot.time} value={slot.time}>
                                    {slot.display}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Quantity *</label>
                        <select
                            className="input-field"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            required
                        >
                            {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
                                <option key={num} value={num}>
                                    {num} {num === 1 ? 'turkey' : 'turkeys'}
                                </option>
                            ))}
                        </select>
                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: 'var(--spacing-2)' }}>
                            Maximum {maxQuantity} per order
                        </p>
                    </div>

                    <div style={{
                        padding: 'var(--spacing-4)',
                        background: 'var(--gray-50)',
                        borderRadius: 'var(--radius)',
                        marginTop: 'var(--spacing-4)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-2)' }}>
                            <span>Price per turkey:</span>
                            <span style={{ fontWeight: 600 }}>{formatPrice(restaurant.turkeyPrice)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700 }}>
                            <span>Total:</span>
                            <span style={{ color: 'var(--og-heat)' }}>{formatPrice(totalPrice)}</span>
                        </div>
                    </div>
                </Card>

                <Card style={{ marginBottom: 'var(--spacing-6)' }}>
                    <h3 className="text-h4" style={{ marginBottom: 'var(--spacing-4)', color: 'var(--gray-900)' }}>
                        Your Information
                    </h3>

                    <Input
                        label="First Name *"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />

                    <Input
                        label="Last Name *"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />

                    <Input
                        label="Email *"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input
                        label="Phone Number *"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 555-5555"
                        required
                    />

                    <div style={{ marginTop: 'var(--spacing-4)' }}>
                        <label style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-2)', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                required
                                style={{ marginTop: '4px' }}
                            />
                            <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                I agree to the Terms of Service and Privacy Policy. Payment of {formatPrice(totalPrice)} due at pickup.
                            </span>
                        </label>
                    </div>
                </Card>

                <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
                    <Button type="button" variant="secondary" onClick={onBack} style={{ flex: 1 }}>
                        Back
                    </Button>
                    <Button type="submit" variant="primary" disabled={!agreedToTerms || submitting} style={{ flex: 1 }}>
                        {submitting ? 'Processing...' : 'Complete Reservation'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
