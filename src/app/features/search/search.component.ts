import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListingCardComponent } from '../../shared/listing-card/listing-card.component';
import { BookingService } from '../../core/services/booking.service';
import { ListingService } from '../../core/services/listing.service';
import { SearchSessionService } from '../../core/services/search-session.service';
import type { PropertyType } from '../../core/models/models';

@Component({
  selector: 'app-search',
  imports: [FormsModule, ListingCardComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  private readonly listings = inject(ListingService);
  private readonly bookings = inject(BookingService);
  readonly search = inject(SearchSessionService);

  minPrice: number | null = null;
  maxPrice: number | null = null;

  readonly results = computed(() => {
    const f = this.search.filters();
    const merged = {
      ...f,
      minPrice: this.minPrice ?? f.minPrice,
      maxPrice: this.maxPrice ?? f.maxPrice,
    };
    const base = this.listings.search(merged);
    return this.bookings.filterAvailableListings(base, merged.checkIn, merged.checkOut);
  });

  applyFilters(): void {
    this.search.patch({
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
    });
  }

  setType(t: PropertyType | 'any'): void {
    this.search.patch({ propertyType: t });
  }

  toggleInstant(): void {
    const f = this.search.filters();
    this.search.patch({ instantBookOnly: !f.instantBookOnly });
  }
}
