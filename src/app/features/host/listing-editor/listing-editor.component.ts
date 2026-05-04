import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { Listing, PropertyType } from '../../../core/models/models';
import { AuthService } from '../../../core/services/auth.service';
import { ListingService } from '../../../core/services/listing.service';

@Component({
  selector: 'app-listing-editor',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './listing-editor.component.html',
  styleUrl: './listing-editor.component.scss',
})
export class ListingEditorComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly listings = inject(ListingService);
  readonly auth = inject(AuthService);

  readonly listingId = this.route.snapshot.paramMap.get('id');
  readonly mode: 'new' | 'edit' = this.listingId ? 'edit' : 'new';

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    propertyType: ['entire_place' as PropertyType, Validators.required],
    city: ['', Validators.required],
    country: ['', Validators.required],
    maxGuests: [2, [Validators.required, Validators.min(1)]],
    bedrooms: [1, [Validators.required, Validators.min(0)]],
    beds: [1, [Validators.required, Validators.min(1)]],
    baths: [1, [Validators.required, Validators.min(0)]],
    nightlyPrice: [100, [Validators.required, Validators.min(1)]],
    cleaningFee: [25, [Validators.required, Validators.min(0)]],
    serviceFeePercent: [14, [Validators.required, Validators.min(0)]],
    instantBook: [true],
    amenities: ['Wifi, Kitchen, Workspace'],
    imageSeeds: ['new1,new2,new3'],
  });

  error = '';

  constructor() {
    if (this.mode === 'edit' && this.listingId) {
      const l = this.listings.getById(this.listingId);
      if (l) this.patchFromListing(l);
    }
  }

  private patchFromListing(l: Listing): void {
    this.form.patchValue({
      title: l.title,
      description: l.description,
      propertyType: l.propertyType,
      city: l.location.city,
      country: l.location.country,
      maxGuests: l.maxGuests,
      bedrooms: l.bedrooms,
      beds: l.beds,
      baths: l.baths,
      nightlyPrice: l.nightlyPrice,
      cleaningFee: l.cleaningFee,
      serviceFeePercent: l.serviceFeePercent,
      instantBook: l.instantBook,
      amenities: l.amenities.join(', '),
      imageSeeds: l.images
        .map((u) => {
          const parts = u.split('/');
          const i = parts.indexOf('seed');
          return i >= 0 ? parts[i + 1] ?? 'x' : 'x';
        })
        .join(','),
    });
  }

  save(): void {
    this.error = '';
    const u = this.auth.currentUser();
    if (!u?.isHost) {
      this.error = 'Only hosts can publish listings.';
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Please complete required fields.';
      return;
    }
    const v = this.form.getRawValue();
    const seeds = v.imageSeeds
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const images = seeds.map((s) => `https://picsum.photos/seed/${s}/800/560`);
    const base = {
      hostId: u.id,
      title: v.title,
      description: v.description,
      propertyType: v.propertyType,
      location: {
        city: v.city,
        country: v.country,
        lat: 31.6,
        lng: -8.0,
      },
      maxGuests: v.maxGuests,
      bedrooms: v.bedrooms,
      beds: v.beds,
      baths: v.baths,
      nightlyPrice: v.nightlyPrice,
      cleaningFee: v.cleaningFee,
      serviceFeePercent: v.serviceFeePercent,
      images: images.length ? images : ['https://picsum.photos/seed/maskan/800/560'],
      amenities: v.amenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      instantBook: v.instantBook,
    };

    if (this.mode === 'new') {
      const created = this.listings.create(base);
      void this.router.navigate(['/host']);
      return;
    }
    if (this.listingId) {
      this.listings.update(this.listingId, base);
      void this.router.navigate(['/host']);
    }
  }
}
