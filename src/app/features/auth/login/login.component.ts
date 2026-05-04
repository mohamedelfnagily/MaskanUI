import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  displayName = '';
  registerMode = signal(false);
  asHost = signal(false);
  error = signal('');

  quick(id: string): void {
    this.auth.loginAs(id);
    void this.router.navigate(['/']);
  }

  submit(): void {
    this.error.set('');
    if (this.registerMode()) {
      if (!this.displayName.trim() || !this.email.trim()) {
        this.error.set('Name and email are required.');
        return;
      }
      this.auth.register(this.displayName.trim(), this.email.trim(), this.asHost());
      void this.router.navigate(['/']);
      return;
    }
    const ok = this.auth.loginWithEmail(this.email, this.password);
    if (!ok) {
      this.error.set('Unknown email — try a demo account or register.');
      return;
    }
    void this.router.navigate(['/']);
  }
}
