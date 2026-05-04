import { Injectable, signal } from '@angular/core';
import { emptySearchFilters, type SearchFilters } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SearchSessionService {
  readonly filters = signal<SearchFilters>(emptySearchFilters());

  patch(partial: Partial<SearchFilters>): void {
    this.filters.update((f) => ({ ...f, ...partial }));
  }

  reset(): void {
    this.filters.set(emptySearchFilters());
  }
}
