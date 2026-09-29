import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="home-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container hero-content">
          <div class="badge badge-primary hero-badge">
            <span class="pulse-dot"></span> Powered by Google Gemini AI & FastAPI
          </div>
          <h1 class="hero-title">
            Transform Your Fitness With <span class="gradient-text">Precision AI Plans</span>
          </h1>
          <p class="hero-subtitle">
            Say goodbye to cookie-cutter fitness routines. FitBuddy AI generates individualized, age-appropriate workout splits and science-backed nutrition guidance tailored specifically to your goals, equipment, and experience.
          </p>

          <div class="hero-actions">
            @if (authService.isAuthenticated()) {
              <a routerLink="/dashboard" class="btn btn-primary btn-lg">
                <span>Go to Dashboard</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
              <a routerLink="/generate-plan" class="btn btn-secondary btn-lg">Generate New Routine</a>
            } @else {
              <a routerLink="/register" class="btn btn-primary btn-lg">
                <span>Start Your Free Plan</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
              <a routerLink="/login" class="btn btn-secondary btn-lg">Sign In</a>
            }
          </div>

          <!-- Highlight Metric Badges -->
          <div class="hero-metrics">
            <div class="metric-pill">
              <span class="metric-val">100%</span>
              <span class="metric-lbl">Customized Routine</span>
            </div>
            <div class="metric-pill">
              <span class="metric-val">&lt; 5s</span>
              <span class="metric-lbl">Instant Generation</span>
            </div>
            <div class="metric-pill">
              <span class="metric-val">0</span>
              <span class="metric-lbl">Gimmicks or Fads</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Core Features Section -->
      <section class="features-section">
        <div class="container">
          <div class="section-header">
            <span class="badge badge-cyan">Intelligent Capabilities</span>
            <h2 class="section-title">Built For Real Athletic Progress</h2>
            <p class="section-subtitle">
              Combining modern exercise science with Google Gemini AI to help you achieve sustainable results safely.
            </p>
          </div>

          <div class="grid-3">
            <div class="card feature-card">
              <div class="feature-icon icon-emerald">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 5v14M18 5v14M4 9h4M16 9h4M2 13h4M18 13h4M6 12h12"/>
                </svg>
              </div>
              <h3 class="feature-title">AI Workout Schedules</h3>
              <p class="feature-desc">
                Custom routines designed for your exact schedule—from 2-day functional mobility to 6-day hypertrophy splits, complete with sets, reps, and rest intervals.
              </p>
            </div>

            <div class="card feature-card">
              <div class="feature-icon icon-cyan">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                  <path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path>
                  <circle cx="12" cy="12" r="6"></circle>
                </svg>
              </div>
              <h3 class="feature-title">Nutrition & Hydration</h3>
              <p class="feature-desc">
                Actionable calorie targets, macronutrient breakdowns, hydration benchmarks, and pre/post-workout meal ideas tailored to fuel your performance.
              </p>
            </div>

            <div class="card feature-card">
              <div class="feature-icon icon-amber">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3 class="feature-title">Activity & Streak Tracking</h3>
              <p class="feature-desc">
                Log completed workouts, track active training minutes and estimated calories, and maintain consistent workout streaks on your personal dashboard.
              </p>
            </div>

            <div class="card feature-card">
              <div class="feature-icon icon-purple">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="12 8 8 12 12 16 12 8"></polygon>
                </svg>
              </div>
              <h3 class="feature-title">Equipment Adaptation</h3>
              <p class="feature-desc">
                Whether you train in a fully equipped gym, have a single pair of dumbbells at home, or rely on bodyweight calisthenics, your plan matches what you have.
              </p>
            </div>

            <div class="card feature-card">
              <div class="feature-icon icon-rose">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 class="feature-title">Safe Form & Alternatives</h3>
              <p class="feature-desc">
                Every movement includes coaching cues and safe, low-impact beginner variations to ensure joint longevity and injury prevention.
              </p>
            </div>

            <div class="card feature-card">
              <div class="feature-icon icon-emerald">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
              <h3 class="feature-title">Saved Routine Library</h3>
              <p class="feature-desc">
                Archive multiple plans, switch active programs as your fitness evolves, or review historical routines whenever you need variation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="how-section">
        <div class="container">
          <div class="section-header">
            <span class="badge badge-amber">Simple 3-Step Process</span>
            <h2 class="section-title">How FitBuddy AI Works</h2>
          </div>

          <div class="steps-grid">
            <div class="step-card">
              <div class="step-number">01</div>
              <h3 class="step-title">Share Your Fitness Profile</h3>
              <p class="step-desc">
                Complete a fast questionnaire detailing your age, goal (weight loss, muscle gain, endurance), equipment, and any joint limitations.
              </p>
            </div>

            <div class="step-card">
              <div class="step-number">02</div>
              <h3 class="step-title">Gemini AI Synthesizes Plan</h3>
              <p class="step-desc">
                Our FastAPI engine feeds your parameters into Google Gemini AI, producing a comprehensive day-by-day split and fueling guide.
              </p>
            </div>

            <div class="step-card">
              <div class="step-number">03</div>
              <h3 class="step-title">Track, Log, & Progress</h3>
              <p class="step-desc">
                Execute your workouts, log duration and completion, and watch your consistency grow on your interactive dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom CTA Banner -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-box">
            <h2 class="cta-title">Ready to Kickstart Your Fitness Journey?</h2>
            <p class="cta-subtitle">
              Join today and generate your first personalized AI workout routine in seconds.
            </p>
            <div class="cta-buttons">
              @if (authService.isAuthenticated()) {
                <a routerLink="/questionnaire" class="btn btn-primary btn-lg">Generate Routine Now</a>
              } @else {
                <a routerLink="/register" class="btn btn-primary btn-lg">Create Free Account</a>
              }
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .hero-section {
      padding: 5rem 0 4rem 0;
      text-align: center;
      position: relative;
    }
    .hero-content {
      max-width: 860px;
    }
    .hero-badge {
      margin-bottom: 1.5rem;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--primary);
      display: inline-block;
      animation: pulse-ring 1.8s infinite;
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.9); opacity: 0.8; }
      50% { transform: scale(1.4); opacity: 1; }
      100% { transform: scale(0.9); opacity: 0.8; }
    }
    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 1.5rem;
      line-height: 1.15;
    }
    .gradient-text {
      background: linear-gradient(135deg, #10b981 20%, #06b6d4 80%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-subtitle {
      font-size: 1.18rem;
      color: var(--text-secondary);
      line-height: 1.7;
      margin-bottom: 2.5rem;
      max-width: 720px;
      margin-left: auto;
      margin-right: auto;
    }
    .hero-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
      margin-bottom: 3.5rem;
      flex-wrap: wrap;
    }
    .hero-metrics {
      display: flex;
      justify-content: center;
      gap: 2.5rem;
      border-top: 1px solid var(--border);
      padding-top: 2.5rem;
      flex-wrap: wrap;
    }
    .metric-pill {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .metric-val {
      font-family: 'Outfit', sans-serif;
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--text-primary);
    }
    .metric-lbl {
      font-size: 0.82rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .features-section, .how-section {
      padding: 5rem 0;
    }
    .section-header {
      text-align: center;
      max-width: 650px;
      margin: 0 auto 3.5rem auto;
    }
    .section-title {
      font-size: 2.4rem;
      margin: 0.75rem 0;
      letter-spacing: -0.02em;
    }
    .section-subtitle {
      color: var(--text-secondary);
      font-size: 1.05rem;
    }

    .feature-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      height: 100%;
    }
    .feature-icon {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-emerald {
      background: var(--primary-subtle);
      color: var(--primary);
      border: 1px solid rgba(16, 185, 129, 0.25);
    }
    .icon-cyan {
      background: var(--accent-cyan-subtle);
      color: var(--accent-cyan);
      border: 1px solid rgba(6, 182, 212, 0.25);
    }
    .icon-amber {
      background: var(--accent-amber-subtle);
      color: var(--accent-amber);
      border: 1px solid rgba(245, 158, 11, 0.25);
    }
    .icon-purple {
      background: rgba(168, 85, 247, 0.12);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.25);
    }
    .icon-rose {
      background: var(--accent-rose-subtle);
      color: var(--accent-rose);
      border: 1px solid rgba(244, 63, 94, 0.25);
    }
    .feature-title {
      font-size: 1.25rem;
      font-weight: 700;
    }
    .feature-desc {
      color: var(--text-secondary);
      font-size: 0.92rem;
      line-height: 1.6;
    }

    .steps-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }
    .step-card {
      background-color: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 2.25rem;
      position: relative;
    }
    .step-number {
      font-family: 'Outfit', sans-serif;
      font-size: 3rem;
      font-weight: 900;
      color: rgba(255, 255, 255, 0.06);
      position: absolute;
      top: 1.25rem;
      right: 1.5rem;
      line-height: 1;
    }
    .step-title {
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
      position: relative;
      z-index: 1;
    }
    .step-desc {
      color: var(--text-secondary);
      font-size: 0.92rem;
      line-height: 1.6;
      position: relative;
      z-index: 1;
    }

    .cta-section {
      padding: 3rem 0 6rem 0;
    }
    .cta-box {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1));
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: var(--radius-lg);
      padding: 3.5rem 2rem;
      text-align: center;
      box-shadow: var(--shadow-glow);
    }
    .cta-title {
      font-size: 2.2rem;
      margin-bottom: 1rem;
    }
    .cta-subtitle {
      color: var(--text-secondary);
      font-size: 1.05rem;
      margin-bottom: 2rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }
      .steps-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent {
  authService = inject(AuthService);
}
