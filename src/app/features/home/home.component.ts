import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ListingCardComponent } from '../../shared/listing-card/listing-card.component';
import { BookingService } from '../../core/services/booking.service';
import { ListingService } from '../../core/services/listing.service';
import { SearchSessionService } from '../../core/services/search-session.service';

@Component({
  selector: 'app-home',
  imports: [FormsModule, RouterLink, ListingCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly listings = inject(ListingService);
  private readonly bookings = inject(BookingService);
  readonly search = inject(SearchSessionService);
  private readonly router = inject(Router);

  dest = '';
  checkIn = '';
  checkOut = '';
  adults = 1;

  readonly featured = computed(() => {
    const f = this.search.filters();
    const all = this.listings.allListings();
    return this.bookings.filterAvailableListings(all, f.checkIn, f.checkOut).slice(0, 8);
  });

  applyChip(kind: 'city' | 'amenity' | 'type', value: string): void {
    if (kind === 'city') this.search.patch({ query: value });
    if (kind === 'amenity') this.search.patch({ query: value });
    if (kind === 'type') this.search.patch({ propertyType: value as 'entire_place' | 'private_room' | 'any' });
    void this.router.navigate(['/search']);
  }

  submitSearch(): void {
    this.search.patch({
      query: this.dest,
      checkIn: this.checkIn || null,
      checkOut: this.checkOut || null,
      adults: this.adults,
    });
    void this.router.navigate(['/search']);
  }
}
