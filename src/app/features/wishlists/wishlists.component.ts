import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ListingCardComponent } from '../../shared/listing-card/listing-card.component';

@Component({
  selector: 'app-wishlists',
  imports: [RouterLink, ListingCardComponent],
  templateUrl: './wishlists.component.html',
  styleUrl: './wishlists.component.scss',
})
export class WishlistsComponent {
  readonly auth = inject(AuthService);
  readonly wishlists = inject(WishlistService);
}
