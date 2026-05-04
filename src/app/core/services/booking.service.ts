import { Injectable, computed, signal } from '@angular/core';
import type { Booking, BookingStatus } from '../models/models';
import { ListingService } from './listing.service';

function parseYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly bookings = signal<Booking[]>([]);

  readonly allBookings = computed(() => this.bookings());

  constructor(private readonly listings: ListingService) {}

  private activeStatuses(): BookingStatus[] {
    return ['pending', 'confirmed'];
  }

  listingIsBlocked(listingId: string, checkIn: string, checkOut: string): boolean {
    const inD = parseYmd(checkIn);
    const outD = parseYmd(checkOut);
    return this.bookings().some((b) => {
      if (b.listingId !== listingId) return false;
      if (!this.activeStatuses().includes(b.status)) return false;
      const bIn = parseYmd(b.checkIn);
      const bOut = parseYmd(b.checkOut);
      return rangesOverlap(inD, outD, bIn, bOut);
    });
  }

  quote(listingId: string, checkIn: string, checkOut: string, guests: number): {
    nights: number;
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    total: number;
  } | null {
    const listing = this.listings.getById(listingId);
    if (!listing) return null;
    const start = parseYmd(checkIn);
    const end = parseYmd(checkOut);
    if (!(start < end)) return null;
    if (guests < 1 || guests > listing.maxGuests) return null;

    let nights = 0;
    for (let d = new Date(start); d < end; d = addDays(d, 1)) nights++;

    const subtotal = nights * listing.nightlyPrice;
    const cleaningFee = listing.cleaningFee;
    const serviceFee = Math.round((subtotal + cleaningFee) * (listing.serviceFeePercent / 100));
    const total = subtotal + cleaningFee + serviceFee;
    return { nights, subtotal, cleaningFee, serviceFee, total };
  }

  createBooking(input: {
    listingId: string;
    guestId: string;
    hostId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }): { ok: true; booking: Booking } | { ok: false; reason: string } {
    const listing = this.listings.getById(input.listingId);
    if (!listing) return { ok: false, reason: 'Listing not found.' };
    if (this.listingIsBlocked(input.listingId, input.checkIn, input.checkOut)) {
      return { ok: false, reason: 'Those dates are no longer available.' };
    }
    const q = this.quote(input.listingId, input.checkIn, input.checkOut, input.guests);
    if (!q) return { ok: false, reason: 'Invalid stay details.' };

    const status: BookingStatus = listing.instantBook ? 'confirmed' : 'pending';
    const booking: Booking = {
      id: `b-${crypto.randomUUID().slice(0, 8)}`,
      listingId: input.listingId,
      guestId: input.guestId,
      hostId: input.hostId,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests: input.guests,
      subtotal: q.subtotal,
      cleaningFee: q.cleaningFee,
      serviceFee: q.serviceFee,
      total: q.total,
      status,
      createdAt: new Date().toISOString(),
    };
    this.bookings.update((arr) => [booking, ...arr]);
    return { ok: true, booking };
  }

  cancel(bookingId: string, userId: string): boolean {
    let changed = false;
    this.bookings.update((arr) =>
      arr.map((b) => {
        if (b.id !== bookingId) return b;
        if (b.guestId !== userId && b.hostId !== userId) return b;
        if (b.status !== 'pending' && b.status !== 'confirmed') return b;
        changed = true;
        return { ...b, status: 'cancelled' as const };
      }),
    );
    return changed;
  }

  confirm(bookingId: string, hostId: string): boolean {
    let ok = false;
    this.bookings.update((arr) =>
      arr.map((b) => {
        if (b.id !== bookingId || b.hostId !== hostId) return b;
        if (b.status !== 'pending') return b;
        ok = true;
        return { ...b, status: 'confirmed' as const };
      }),
    );
    return ok;
  }

  completePastBookings(todayYmd = ymd(new Date())): void {
    this.bookings.update((arr) =>
      arr.map((b) => {
        if (b.status !== 'confirmed') return b;
        if (b.checkOut <= todayYmd) return { ...b, status: 'completed' as const };
        return b;
      }),
    );
  }

  guestTrips(guestId: string): Booking[] {
    return this.bookings().filter((b) => b.guestId === guestId);
  }

  hostReservations(hostId: string): Booking[] {
    return this.bookings().filter((b) => b.hostId === hostId);
  }

  filterAvailableListings<T extends { id: string }>(
    listings: T[],
    checkIn: string | null,
    checkOut: string | null,
  ): T[] {
    if (!checkIn || !checkOut) return listings;
    return listings.filter((l) => !this.listingIsBlocked(l.id, checkIn, checkOut));
  }
}
