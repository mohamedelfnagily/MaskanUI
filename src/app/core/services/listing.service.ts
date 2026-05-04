import { Injectable, computed, signal } from '@angular/core';
import { SEED_LISTINGS } from '../data/seed';
import type { Listing, PropertyType, SearchFilters } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ListingService {
  private readonly listings = signal<Listing[]>([...SEED_LISTINGS]);

  readonly allListings = computed(() => this.listings());

  getById(id: string): Listing | undefined {
    return this.listings().find((l) => l.id === id);
  }

  create(listing: Omit<Listing, 'id' | 'createdAt' | 'ratingAvg' | 'reviewCount'>): Listing {
    const next: Listing = {
      ...listing,
      id: `l-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      ratingAvg: 0,
      reviewCount: 0,
    };
    this.listings.update((arr) => [next, ...arr]);
    return next;
  }

  update(id: string, patch: Partial<Listing>): Listing | undefined {
    let updated: Listing | undefined;
    this.listings.update((arr) =>
      arr.map((l) => {
        if (l.id !== id) return l;
        updated = { ...l, ...patch, id: l.id };
        return updated;
      }),
    );
    return updated;
  }

  remove(id: string): void {
    this.listings.update((arr) => arr.filter((l) => l.id !== id));
  }

  search(filters: SearchFilters): Listing[] {
    const q = filters.query.trim().toLowerCase();
    const guestTotal = filters.adults + filters.children;

    return this.listings().filter((l) => {
      if (q) {
        const blob = `${l.title} ${l.description} ${l.location.city} ${l.location.country}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      if (filters.propertyType !== 'any' && l.propertyType !== filters.propertyType) return false;
      if (filters.instantBookOnly && !l.instantBook) return false;
      if (filters.minPrice != null && l.nightlyPrice < filters.minPrice) return false;
      if (filters.maxPrice != null && l.nightlyPrice > filters.maxPrice) return false;
      if (guestTotal > l.maxGuests) return false;
      return true;
    });
  }

  hostListings(hostId: string): Listing[] {
    return this.listings().filter((l) => l.hostId === hostId);
  }

  propertyTypeLabel(t: PropertyType): string {
    switch (t) {
      case 'entire_place':
        return 'Entire place';
      case 'private_room':
        return 'Private room';
      case 'shared_room':
        return 'Shared room';
      default:
        return t;
    }
  }
}
