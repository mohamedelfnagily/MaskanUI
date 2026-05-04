import { CurrencyPipe, DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { Listing } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { ListingService } from '../../core/services/listing.service';
import { MessageService } from '../../core/services/message.service';
import { ReviewService } from '../../core/services/review.service';
import { SearchSessionService } from '../../core/services/search-session.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-listing-detail',
  imports: [FormsModule, RouterLink, CurrencyPipe, DatePipe, DecimalPipe, NgClass],
  templateUrl: './listing-detail.component.html',
  styleUrl: './listing-detail.component.scss',
})
export class ListingDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly listings = inject(ListingService);
  private readonly bookings = inject(BookingService);
  readonly auth = inject(AuthService);
  private readonly messages = inject(MessageService);
  readonly wishlists = inject(WishlistService);
  private readonly reviews = inject(ReviewService);
  readonly search = inject(SearchSessionService);

  listing: Listing | undefined;
  activeImage?: string;
  checkIn = '';
  checkOut = '';
  guests = 1;
  error = '';

  readonly reviewList = computed(() => (this.listing ? this.reviews.forListing(this.listing.id) : []));

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.listing = this.listings.getById(id);
    this.activeImage = this.listing?.images[0];
    const f = this.search.filters();
    this.checkIn = f.checkIn ?? '';
    this.checkOut = f.checkOut ?? '';
    this.guests = Math.max(1, f.adults + f.children);
    if (this.listing) this.guests = Math.min(this.guests, this.listing.maxGuests);
  }

  selectImage(url: string): void {
    this.activeImage = url;
  }

  toggleWish(): void {
    if (!this.listing || !this.auth.currentUser()) return;
    this.wishlists.toggle(this.listing.id);
  }

  contactHost(): void {
    if (!this.listing || !this.auth.currentUser()) {
      void this.router.navigate(['/login']);
      return;
    }
    const u = this.auth.currentUser()!;
    if (u.id === this.listing.hostId) return;
    const t = this.messages.ensureThreadForListing(this.listing.id, u.id, this.listing.hostId);
    void this.router.navigate(['/messages', t.id]);
  }

  reserve(): void {
    this.error = '';
    if (!this.listing) return;
    if (!this.auth.currentUser()) {
      void this.router.navigate(['/login']);
      return;
    }
    if (!this.checkIn || !this.checkOut) {
      this.error = 'Choose check-in and check-out dates.';
      return;
    }
    if (this.bookings.listingIsBlocked(this.listing.id, this.checkIn, this.checkOut)) {
      this.error = 'Those dates overlap an existing reservation.';
      return;
    }
    const q = this.bookings.quote(this.listing.id, this.checkIn, this.checkOut, this.guests);
    if (!q) {
      this.error = 'Invalid guest count or date range.';
      return;
    }
    void this.router.navigate(['/book', this.listing.id], {
      queryParams: { checkIn: this.checkIn, checkOut: this.checkOut, guests: this.guests },
    });
  }
}
