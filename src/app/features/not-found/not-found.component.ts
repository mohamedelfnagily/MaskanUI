import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="page">
      <h1>Page not found</h1>
      <p>The route you opened does not exist in this demo.</p>
      <a routerLink="/" class="m-btn m-btn--primary">Go home</a>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 720px;
        margin: 0 auto;
      }
    `,
  ],
})
export class NotFoundComponent {}
