import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Listing } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-listing-card',
  imports: [RouterLink, CurrencyPipe, DecimalPipe],
  templateUrl: './listing-card.component.html',
  styleUrl: './listing-card.component.scss',
})
export class ListingCardComponent {
  @Input({ required: true }) listing!: Listing;

  private readonly wishlists = inject(WishlistService);
  readonly auth = inject(AuthService);

  toggleHeart(ev: MouseEvent): void {
    ev.preventDefault();
    ev.stopPropagation();
    if (!this.auth.currentUser()) return;
    this.wishlists.toggle(this.listing.id);
  }

  isHearted(): boolean {
    return this.wishlists.isSaved(this.listing.id);
  }
}
