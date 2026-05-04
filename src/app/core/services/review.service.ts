import { Injectable, computed, signal } from '@angular/core';
import type { Review } from '../models/models';
import { BookingService } from './booking.service';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly reviews = signal<Review[]>([
    {
      id: 'r-1',
      listingId: 'l-1',
      authorId: 'u-guest',
      bookingId: 'seed-b-1',
      rating: 5,
      comment: 'Gorgeous space and thoughtful touches. Would book again.',
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    },
    {
      id: 'r-2',
      listingId: 'l-2',
      authorId: 'u-guest',
      bookingId: 'seed-b-2',
      rating: 5,
      comment: 'The pool area is magical at night. Host communication was excellent.',
      createdAt: new Date(Date.now() - 86400000 * 55).toISOString(),
    },
  ]);

  readonly allReviews = computed(() => this.reviews());

  constructor(private readonly bookings: BookingService) {}

  forListing(listingId: string): Review[] {
    return this.reviews().filter((r) => r.listingId === listingId).sort((a, b) => +b.createdAt - +a.createdAt);
  }

  canReview(bookingId: string, userId: string): boolean {
    const b = this.bookings.allBookings().find((x) => x.id === bookingId);
    if (!b || b.guestId !== userId) return false;
    if (b.status !== 'completed') return false;
    return !this.reviews().some((r) => r.bookingId === bookingId);
  }

  addReview(input: { listingId: string; authorId: string; bookingId: string; rating: number; comment: string }):
    | { ok: true; review: Review }
    | { ok: false; reason: string } {
    if (!this.canReview(input.bookingId, input.authorId)) {
      return { ok: false, reason: 'You can only review completed stays once.' };
    }
    const review: Review = {
      id: `r-${crypto.randomUUID().slice(0, 8)}`,
      listingId: input.listingId,
      authorId: input.authorId,
      bookingId: input.bookingId,
      rating: input.rating,
      comment: input.comment.trim(),
      createdAt: new Date().toISOString(),
    };
    this.reviews.update((arr) => [review, ...arr]);
    return { ok: true, review };
  }
}
