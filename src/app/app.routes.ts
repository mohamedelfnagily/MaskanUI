import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';
import { HomeComponent } from './features/home/home.component';
import { SearchComponent } from './features/search/search.component';
import { ListingDetailComponent } from './features/listing-detail/listing-detail.component';
import { BookComponent } from './features/book/book.component';
import { TripsComponent } from './features/trips/trips.component';
import { WishlistsComponent } from './features/wishlists/wishlists.component';
import { HostDashboardComponent } from './features/host/host-dashboard.component';
import { ListingEditorComponent } from './features/host/listing-editor/listing-editor.component';
import { MessagesComponent } from './features/messages/messages.component';
import { LoginComponent } from './features/auth/login/login.component';
import { ProfileComponent } from './features/profile/profile.component';
import { NotFoundComponent } from './features/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'search', component: SearchComponent },
      { path: 'listings/:id', component: ListingDetailComponent },
      { path: 'book/:listingId', component: BookComponent },
      { path: 'trips', component: TripsComponent },
      { path: 'wishlists', component: WishlistsComponent },
      { path: 'host', component: HostDashboardComponent },
      { path: 'host/listings/new', component: ListingEditorComponent },
      { path: 'host/listings/:id/edit', component: ListingEditorComponent },
      { path: 'messages/:threadId', component: MessagesComponent },
      { path: 'messages', component: MessagesComponent },
      { path: 'login', component: LoginComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '**', component: NotFoundComponent },
    ],
  },
];
