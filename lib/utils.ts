// Utility functions for Church's Texas Chicken Turkey Reservation System
import { Restaurant, TimeSlot } from './types';
import { format, parse, addMinutes } from 'date-fns';

/**
 * Generate time slots for pickup based on store hours and pickup config
 */
export function generateTimeSlots(restaurant: Restaurant): TimeSlot[] {
    const { pickupDate, storeHours, pickupConfig } = restaurant;

    // Get day of week from pickup date
    const date = new Date(pickupDate);
    const dayOfWeek = format(date, 'EEEE').toLowerCase();

    const hours = storeHours[dayOfWeek];
    if (!hours || hours.closed) {
        return [];
    }

    // Parse store hours
    const openTime = parse(hours.open, 'HH:mm', date);
    const closeTime = parse(hours.close, 'HH:mm', date);

    // Calculate first and last pickup times
    const firstPickupTime = addMinutes(openTime, pickupConfig.bufferAfterOpen);
    const lastPickupTime = addMinutes(closeTime, -pickupConfig.bufferBeforeClose);

    // Generate slots
    const slots: TimeSlot[] = [];
    let currentTime = firstPickupTime;

    while (currentTime <= lastPickupTime) {
        slots.push({
            time: format(currentTime, 'HH:mm'),
            display: format(currentTime, 'h:mm a')
        });
        currentTime = addMinutes(currentTime, pickupConfig.slotInterval);
    }

    return slots;
}

/**
 * Format phone number to (XXX) XXX-XXXX
 */
export function formatPhoneNumber(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

    if (!match) return value;

    const [, area, prefix, line] = match;

    if (line) {
        return `(${area}) ${prefix}-${line}`;
    } else if (prefix) {
        return `(${area}) ${prefix}`;
    } else if (area) {
        return `(${area}`;
    }

    return value;
}

/**
 * Generate unique confirmation ID
 */
export function generateConfirmationId(): string {
    const prefix = 'CTX';
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${year}-${random}`;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 3959; // Earth's radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Format currency with tax disclaimer
 */
export function formatPrice(amount: number, showDisclaimer: boolean = true): string {
    const formatted = `$${amount.toFixed(2)}`;
    return showDisclaimer ? `${formatted} (excludes tax)` : formatted;
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

/**
 * Validate phone number (10 digits)
 */
export function isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
}

/**
 * Format date for display
 */
export function formatPickupDate(dateString: string): string {
    // Append T12:00:00 to force noon local time, avoiding timezone shifts
    // e.g. "2026-11-25" -> "2026-11-25T12:00:00"
    const date = new Date(`${dateString}T12:00:00`);
    return format(date, 'EEEE, MMMM d, yyyy');
}

/**
 * Search locations by query
 */
export function searchLocations(
    restaurants: Restaurant[],
    query: string
): Restaurant[] {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
        return [];
    }

    const results = restaurants.filter(restaurant => {
        // Search by location ID (exact match)
        if (restaurant.locationId === normalizedQuery) {
            return true;
        }

        // Search by state (exact match, case-insensitive)
        if (restaurant.address.state.toLowerCase() === normalizedQuery) {
            return true;
        }

        // Search by city (partial match)
        if (restaurant.address.city.toLowerCase().includes(normalizedQuery)) {
            return true;
        }

        // Search by restaurant name (partial match)
        if (restaurant.restaurantName.toLowerCase().includes(normalizedQuery)) {
            return true;
        }

        return false;
    });

    // Sort results: exact location ID first, then by type, then alphabetically
    return results.sort((a, b) => {
        // Exact location ID match goes first
        if (a.locationId === normalizedQuery) return -1;
        if (b.locationId === normalizedQuery) return 1;

        // State matches second (group by state)
        const aStateMatch = a.address.state.toLowerCase() === normalizedQuery;
        const bStateMatch = b.address.state.toLowerCase() === normalizedQuery;

        if (aStateMatch && !bStateMatch) return -1;
        if (!aStateMatch && bStateMatch) return 1;

        // If both are state matches, sort by city then name
        if (aStateMatch && bStateMatch) {
            const cityCompare = a.address.city.localeCompare(b.address.city);
            if (cityCompare !== 0) return cityCompare;
        }

        // Otherwise sort alphabetically by name
        return a.restaurantName.localeCompare(b.restaurantName);
    });
}
