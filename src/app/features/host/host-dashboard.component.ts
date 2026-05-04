import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { ListingService } from '../../core/services/listing.service';

@Component({
  selector: 'app-host-dashboard',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './host-dashboard.component.html',
  styleUrl: './host-dashboard.component.scss',
})
export class HostDashboardComponent {
  readonly auth = inject(AuthService);
  private readonly bookings = inject(BookingService);
  readonly listings = inject(ListingService);

  readonly myListings = computed(() => {
    const u = this.auth.currentUser();
    if (!u) return [];
    return this.listings.hostListings(u.id);
  });

  readonly incoming = computed(() => {
    const u = this.auth.currentUser();
    if (!u) return [];
    return this.bookings
      .hostReservations(u.id)
      .slice()
      .sort((a, b) => +new Date(b.checkIn) - +new Date(a.checkIn));
  });

  confirm(id: string): void {
    const u = this.auth.currentUser();
    if (!u) return;
    this.bookings.confirm(id, u.id);
  }
}
