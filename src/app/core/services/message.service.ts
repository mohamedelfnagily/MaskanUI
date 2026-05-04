import { Injectable, computed, signal } from '@angular/core';
import type { Message, MessageThread } from '../models/models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly threads = signal<MessageThread[]>([
    {
      id: 't-1',
      listingId: 'l-1',
      guestId: 'u-guest',
      hostId: 'u-host',
      subject: 'Question about check-in time',
      updatedAt: new Date().toISOString(),
    },
  ]);

  private readonly messages = signal<Message[]>([
    {
      id: 'm-1',
      threadId: 't-1',
      senderId: 'u-guest',
      body: 'Hi Hana — is flexible arrival OK if our flight is delayed?',
      sentAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'm-2',
      threadId: 't-1',
      senderId: 'u-host',
      body: 'Yes, just message me when you land and I will share the lockbox code.',
      sentAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ]);

  readonly inbox = computed(() => {
    const u = this.auth.currentUser();
    if (!u) return [];
    return this.threads()
      .filter((t) => t.guestId === u.id || t.hostId === u.id)
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  });

  constructor(private readonly auth: AuthService) {}

  getThread(threadId: string): MessageThread | undefined {
    return this.threads().find((t) => t.id === threadId);
  }

  messagesFor(threadId: string): Message[] {
    return this.messages()
      .filter((m) => m.threadId === threadId)
      .sort((a, b) => +new Date(a.sentAt) - +new Date(b.sentAt));
  }

  ensureThreadForListing(listingId: string, guestId: string, hostId: string, bookingId?: string): MessageThread {
    const existing = this.threads().find(
      (t) => t.listingId === listingId && t.guestId === guestId && t.hostId === hostId,
    );
    if (existing) return existing;
    const thread: MessageThread = {
      id: `t-${crypto.randomUUID().slice(0, 8)}`,
      listingId,
      guestId,
      hostId,
      bookingId,
      subject: 'New conversation',
      updatedAt: new Date().toISOString(),
    };
    this.threads.update((arr) => [thread, ...arr]);
    return thread;
  }

  send(threadId: string, body: string): Message | null {
    const u = this.auth.currentUser();
    if (!u) return null;
    const t = this.getThread(threadId);
    if (!t || (t.guestId !== u.id && t.hostId !== u.id)) return null;
    const msg: Message = {
      id: `msg-${crypto.randomUUID().slice(0, 8)}`,
      threadId,
      senderId: u.id,
      body: body.trim(),
      sentAt: new Date().toISOString(),
    };
    this.messages.update((arr) => [...arr, msg]);
    this.threads.update((arr) =>
      arr.map((x) => (x.id === threadId ? { ...x, updatedAt: msg.sentAt } : x)),
    );
    return msg;
  }
}
