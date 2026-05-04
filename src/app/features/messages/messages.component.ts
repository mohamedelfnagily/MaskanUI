import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ListingService } from '../../core/services/listing.service';
import { MessageService } from '../../core/services/message.service';

@Component({
  selector: 'app-messages',
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent {
  readonly auth = inject(AuthService);
  readonly messages = inject(MessageService);
  readonly listings = inject(ListingService);
  private readonly route = inject(ActivatedRoute);

  readonly threadId = toSignal(this.route.paramMap.pipe(map((p) => p.get('threadId'))), {
    initialValue: null,
  });

  draft = signal('');

  readonly activeThread = computed(() => {
    const id = this.threadId();
    if (!id) return undefined;
    return this.messages.getThread(id);
  });

  readonly activeMsgs = computed(() => {
    const id = this.threadId();
    if (!id) return [];
    return this.messages.messagesFor(id);
  });

  constructor() {
    effect(() => {
      this.threadId();
      this.draft.set('');
    });
  }

  send(): void {
    const id = this.threadId();
    if (!id) return;
    const text = this.draft().trim();
    if (!text) return;
    this.messages.send(id, text);
    this.draft.set('');
  }
}
