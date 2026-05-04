import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BookingService } from './core/services/booking.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly bookings = inject(BookingService);

  constructor() {
    this.bookings.completePastBookings();
  }
}
