import { Injectable, computed, signal } from '@angular/core';
import type { Listing } from '../models/models';
import { AuthService } from './auth.service';
import { ListingService } from './listing.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  /** userId -> Set of listing ids */
  private readonly saved = signal<Record<string, string[]>>({});

  savedIdsForCurrentUser = computed(() => {
    const u = this.auth.currentUser();
    if (!u) return new Set<string>();
    return new Set(this.saved()[u.id] ?? []);
  });

  constructor(
    private readonly auth: AuthService,
    private readonly listings: ListingService,
  ) {}

  isSaved(listingId: string): boolean {
    const u = this.auth.currentUser();
    if (!u) return false;
    return new Set(this.saved()[u.id] ?? []).has(listingId);
  }

  toggle(listingId: string): void {
    const u = this.auth.currentUser();
    if (!u) return;
    this.saved.update((map) => {
      const cur = [...(map[u.id] ?? [])];
      const i = cur.indexOf(listingId);
      if (i >= 0) cur.splice(i, 1);
      else cur.push(listingId);
      return { ...map, [u.id]: cur };
    });
  }

  savedListings(): Listing[] {
    const u = this.auth.currentUser();
    if (!u) return [];
    const ids = new Set(this.saved()[u.id] ?? []);
    return this.listings.allListings().filter((l) => ids.has(l.id));
  }
}
