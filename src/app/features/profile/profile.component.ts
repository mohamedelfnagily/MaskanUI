import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  readonly auth = inject(AuthService);
  hostNote = signal(
    'Host tools unlock listing creation, reservation approvals, and calendar management (in-memory for now).',
  );
}
