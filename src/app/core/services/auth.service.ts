import { Injectable, signal } from '@angular/core';
import { SEED_USERS } from '../data/seed';
import type { User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly users = [...SEED_USERS];
  readonly currentUser = signal<User | null>(this.users[0] ?? null);

  loginAs(userId: string): void {
    const u = this.users.find((x) => x.id === userId);
    if (u) this.currentUser.set(u);
  }

  loginWithEmail(email: string, _password: string): boolean {
    const u = this.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u) return false;
    this.currentUser.set(u);
    return true;
  }

  logout(): void {
    this.currentUser.set(null);
  }

  register(displayName: string, email: string, asHost: boolean): User {
    const id = `u-${crypto.randomUUID().slice(0, 8)}`;
    const user: User = {
      id,
      email,
      displayName,
      avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(id)}`,
      isHost: asHost,
    };
    this.users.push(user);
    this.currentUser.set(user);
    return user;
  }

  allUsers(): User[] {
    return [...this.users];
  }

  getUser(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }
}
