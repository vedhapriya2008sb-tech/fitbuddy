import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-container container not-found-wrapper">
      <div class="card not-found-card">
        <span class="error-code">404</span>
        <h1 class="not-found-title">Page Out of Range</h1>
        <p class="not-found-desc">
          Looks like this workout routine or page has moved or doesn't exist. Let's get you back on track to your training session!
        </p>
        <div class="actions-row">
          <a routerLink="/" class="btn btn-secondary">Return Home</a>
          <a routerLink="/dashboard" class="btn btn-primary">Go to Dashboard</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 200px);
    }
    .not-found-card {
      text-align: center;
      max-width: 520px;
      padding: 3.5rem 2rem;
    }
    .error-code {
      font-family: 'Outfit', sans-serif;
      font-size: 5rem;
      font-weight: 900;
      line-height: 1;
      background: linear-gradient(135deg, #10b981, #06b6d4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
      display: block;
    }
    .not-found-title {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    .not-found-desc {
      color: var(--text-secondary);
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .actions-row {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
  `]
})
export class NotFoundComponent {}
