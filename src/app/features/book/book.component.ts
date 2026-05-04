import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { ListingService } from '../../core/services/listing.service';

@Component({
  selector: 'app-book',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './book.component.html',
  styleUrl: './book.component.scss',
})
export class BookComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly listings = inject(ListingService);
  private readonly bookings = inject(BookingService);
  readonly auth = inject(AuthService);

  listingId = '';
  checkIn = '';
  checkOut = '';
  guests = 1;
  error = '';

  constructor() {
    this.listingId = this.route.snapshot.paramMap.get('listingId') ?? '';
    const q = this.route.snapshot.queryParamMap;
    this.checkIn = q.get('checkIn') ?? '';
    this.checkOut = q.get('checkOut') ?? '';
    this.guests = Math.max(1, Number(q.get('guests') ?? '1'));
  }

  get listing() {
    return this.listings.getById(this.listingId);
  }

  get quote() {
    return this.listing ? this.bookings.quote(this.listing.id, this.checkIn, this.checkOut, this.guests) : null;
  }

  confirmPay(): void {
    this.error = '';
    const u = this.auth.currentUser();
    const l = this.listing;
    if (!u || !l) {
      this.error = 'Please log in.';
      return;
    }
    const res = this.bookings.createBooking({
      listingId: l.id,
      guestId: u.id,
      hostId: l.hostId,
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      guests: this.guests,
    });
    if (!res.ok) {
      this.error = res.reason;
      return;
    }
    void this.router.navigate(['/trips']);
  }
}
