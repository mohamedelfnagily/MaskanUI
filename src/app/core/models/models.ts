export type PropertyType = 'entire_place' | 'private_room' | 'shared_room';

export interface GeoPoint {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export interface Listing {
  id: string;
  hostId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  location: GeoPoint;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  nightlyPrice: number;
  cleaningFee: number;
  serviceFeePercent: number;
  images: string[];
  amenities: string[];
  instantBook: boolean;
  ratingAvg: number;
  reviewCount: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isHost: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  listingId: string;
  guestId: string;
  hostId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
  status: BookingStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  listingId: string;
  authorId: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  sentAt: string;
}

export interface MessageThread {
  id: string;
  listingId: string;
  guestId: string;
  hostId: string;
  bookingId?: string;
  subject: string;
  updatedAt: string;
}

export interface SearchFilters {
  query: string;
  checkIn: string | null;
  checkOut: string | null;
  adults: number;
  children: number;
  infants: number;
  pets: number;
  minPrice: number | null;
  maxPrice: number | null;
  propertyType: PropertyType | 'any';
  instantBookOnly: boolean;
}

export const emptySearchFilters = (): SearchFilters => ({
  query: '',
  checkIn: null,
  checkOut: null,
  adults: 1,
  children: 0,
  infants: 0,
  pets: 0,
  minPrice: null,
  maxPrice: null,
  propertyType: 'any',
  instantBookOnly: false,
});
