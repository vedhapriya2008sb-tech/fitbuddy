import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container footer-content">
        <div class="footer-top">
          <div class="brand-col">
            <div class="brand">
              <div class="brand-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 5v14M18 5v14M4 9h4M16 9h4M2 13h4M18 13h4M6 12h12"/>
                </svg>
              </div>
              <span class="brand-name">FitBuddy <span class="highlight">AI</span></span>
            </div>
            <p class="brand-tagline">
              Your personalized, science-backed fitness and nutrition companion powered by Generative AI.
            </p>
          </div>

          <div class="links-col">
            <h4 class="col-title">Navigation</h4>
            <ul class="col-links">
              <li><a routerLink="/">Home</a></li>
              <li><a routerLink="/dashboard">Dashboard</a></li>
              <li><a routerLink="/generate-plan">AI Generator</a></li>
              <li><a routerLink="/history">Workout History</a></li>
            </ul>
          </div>

          <div class="links-col">
            <h4 class="col-title">Features</h4>
            <ul class="col-links">
              <li><span>Custom AI Routines</span></li>
              <li><span>Nutrition & Hydration</span></li>
              <li><span>Activity Tracking</span></li>
              <li><span>Streak Analytics</span></li>
            </ul>
          </div>
        </div>

        <div class="disclaimer-box">
          <p>
            <strong>Medical Disclaimer:</strong> FitBuddy AI provides automated workout schedules and general nutritional information for educational and fitness purposes only. It is not intended to substitute for clinical medical advice, diagnosis, or treatment. Always consult a physician or certified healthcare professional before beginning any new training regimen or dietary change.
          </p>
        </div>

        <div class="footer-bottom">
          <p>&copy; 2026 FitBuddy AI. All rights reserved.</p>
          <div class="footer-badges">
            <span class="badge badge-primary">FastAPI Backend</span>
            <span class="badge badge-cyan">Google Gemini AI</span>
            <span class="badge badge-amber">Angular Standalone</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: #060910;
      border-top: 1px solid var(--border);
      padding: 3.5rem 0 2rem 0;
      margin-top: auto;
    }
    .footer-top {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 3rem;
      margin-bottom: 2.5rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .brand-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      background: linear-gradient(135deg, #10b981, #06b6d4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
    }
    .brand-name {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 800;
    }
    .brand-name .highlight {
      color: var(--primary);
    }
    .brand-tagline {
      color: var(--text-secondary);
      font-size: 0.92rem;
      max-width: 380px;
    }
    .col-title {
      font-size: 0.95rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }
    .col-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .col-links a, .col-links span {
      color: var(--text-secondary);
      font-size: 0.9rem;
      transition: color 0.2s ease;
    }
    .col-links a:hover {
      color: var(--primary);
    }
    .disclaimer-box {
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px dashed var(--border);
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;
      margin-bottom: 2rem;
    }
    .disclaimer-box p {
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.6;
    }
    .disclaimer-box strong {
      color: var(--text-secondary);
    }
    .footer-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border);
      padding-top: 1.5rem;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .footer-badges {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    @media (max-width: 768px) {
      .footer-top {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      .footer-bottom {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
      .footer-badges {
        justify-content: center;
      }
    }
  `]
})
export class FooterComponent {}
