// TypeScript interfaces for Church's Texas Chicken Turkey Reservation System

export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
    timezone: string;
}

export interface StoreHours {
    [dayOfWeek: string]: {
        open: string;
        close: string;
        closed: boolean;
    };
}

export interface PickupConfig {
    bufferAfterOpen: number;
    bufferBeforeClose: number;
    slotInterval: number;
}

export interface Restaurant {
    restaurantNumber: string; // Keeping for backward compat in JSON, but moving to locationId
    locationId: string; // This is the new primary key
    restaurantName: string;
    address: Address;
    storeHours: StoreHours;
    pickupConfig: PickupConfig;
    pickupDate: string;
    turkeyInventory: number;
    reservationLimit: number;
    turkeyPrice: number;
    isActive: boolean;
    reservationsEnabled: boolean;
    disabledReason: string | null;
    disabledAt: string | null;
    disabledBy: string | null;
    metadata?: {
        totalTurkeyCapacity: number;
        turkeysReserved: number;
    };
}

export interface Customer {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export interface ReservationDetails {
    turkeyQuantity: number;
    pickupDate: string;
    pickupTime: string;
    pickupDateTime: Date;
}

export interface Reservation {
    id?: string;
    confirmationId: string;
    locationId: string; // Swapped from restaurantNumber
    restaurantName: string;
    restaurantAddress: string;
    customer: Customer;
    reservation: ReservationDetails;
    status: 'confirmed' | 'cancelled' | 'completed' | 'no-show';
    emailSent: boolean;
    emailSentAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    metadata: {
        ipAddress: string | null;
        userAgent: string | null;
        source: string;
    };
}

export interface SystemConfig {
    promotionActive: boolean;
    maxReservationsGlobal: number;
    emailSettings: {
        fromEmail: string;
        fromName: string;
        replyToEmail: string;
        supportEmail: string;
        supportPhone: string;
    };
    features: {
        allowCancellations: boolean;
        requireEmailVerification: boolean;
    };
    lastUpdated: Date;
    updatedBy: string;
}

export interface TimeSlot {
    time: string;
    display: string;
}

export interface LocationStatus {
    location: Restaurant;
    totalReserved: number;
    totalInventory: number;
    percentageReserved: number;
}

export interface CategorizedLocations {
    noReservations: LocationStatus[];
    lowReservations: LocationStatus[];
    halfReserved: LocationStatus[];
    threeQuartersReserved: LocationStatus[];
    soldOut: LocationStatus[];
    other: LocationStatus[];
}
