import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { Booking } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { ListingService } from '../../core/services/listing.service';
import { ReviewService } from '../../core/services/review.service';

@Component({
  selector: 'app-trips',
  imports: [RouterLink, CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './trips.component.html',
  styleUrl: './trips.component.scss',
})
export class TripsComponent {
  readonly auth = inject(AuthService);
  private readonly bookings = inject(BookingService);
  readonly listings = inject(ListingService);
  readonly reviews = inject(ReviewService);

  readonly rows = computed(() => {
    const u = this.auth.currentUser();
    if (!u) return [];
    return this.bookings
      .guestTrips(u.id)
      .slice()
      .sort((a, b) => +new Date(b.checkIn) - +new Date(a.checkIn));
  });

  reviewBookingId = signal<string | null>(null);
  rating = signal(5);
  comment = signal('');

  openReview(b: Booking): void {
    if (!this.reviews.canReview(b.id, this.auth.currentUser()!.id)) return;
    this.reviewBookingId.set(b.id);
    this.rating.set(5);
    this.comment.set('');
  }

  closeReview(): void {
    this.reviewBookingId.set(null);
  }

  submitReview(): void {
    const u = this.auth.currentUser();
    const bid = this.reviewBookingId();
    if (!u || !bid) return;
    const b = this.bookings.allBookings().find((x) => x.id === bid);
    if (!b) return;
    const res = this.reviews.addReview({
      listingId: b.listingId,
      authorId: u.id,
      bookingId: bid,
      rating: this.rating(),
      comment: this.comment(),
    });
    if (res.ok) this.closeReview();
  }

  cancel(b: Booking): void {
    const u = this.auth.currentUser();
    if (!u) return;
    this.bookings.cancel(b.id, u.id);
  }
}
