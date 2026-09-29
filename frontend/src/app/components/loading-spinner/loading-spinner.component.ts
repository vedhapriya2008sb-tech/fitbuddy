import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="spinner-container">
      <div class="pulse-ring"></div>
      <div class="spinner"></div>
      @if (message) {
        <p class="spinner-text">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      position: relative;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 3px solid rgba(16, 185, 129, 0.15);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.85s linear infinite;
    }
    .pulse-ring {
      position: absolute;
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: var(--primary-glow);
      animation: pulse 1.7s ease-in-out infinite;
      z-index: 0;
    }
    .spinner-text {
      margin-top: 1.25rem;
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-secondary);
      text-align: center;
      max-width: 380px;
      z-index: 1;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(0.85); opacity: 0.2; }
      50% { transform: scale(1.15); opacity: 0.45; }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message: string = 'Loading...';
}
