import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { DashboardSummary } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, DatePipe],
  template: `
    <div class="page-container container">
      @if (isLoading()) {
        <app-loading-spinner message="Loading your fitness dashboard & metrics..."></app-loading-spinner>
      } @else {
        <!-- Welcome Banner -->
        <div class="welcome-header">
          <div>
            <span class="badge badge-primary">Fitness Dashboard</span>
            <h1 class="welcome-title">Welcome back, {{ authService.currentUser()?.name }}!</h1>
            <p class="welcome-sub">Here is your daily training activity and personalized AI guidance.</p>
          </div>

          <div class="quick-actions">
            <a routerLink="/history" class="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <span>Log Workout</span>
            </a>
            <a routerLink="/generate-plan" class="btn btn-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span>Generate Routine</span>
            </a>
          </div>
        </div>

        <!-- 4 Stat Cards Grid -->
        <div class="grid-4 stats-grid">
          <div class="card stat-card">
            <div class="stat-icon icon-emerald">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 5v14M18 5v14M4 9h4M16 9h4M2 13h4M18 13h4M6 12h12"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Total Workouts</span>
              <h3 class="stat-number">{{ summary()?.total_workouts || 0 }}</h3>
              <span class="stat-sub">{{ summary()?.completed_workouts || 0 }} completed</span>
            </div>
          </div>

          <div class="card stat-card">
            <div class="stat-icon icon-cyan">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Time Exercised</span>
              <h3 class="stat-number">{{ summary()?.total_minutes || 0 }} <span class="unit">min</span></h3>
              <span class="stat-sub">Across all sessions</span>
            </div>
          </div>

          <div class="card stat-card">
            <div class="stat-icon icon-amber">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Calories Burned</span>
              <h3 class="stat-number">{{ summary()?.estimated_calories || 0 }} <span class="unit">kcal</span></h3>
              <span class="stat-sub">Estimated energy output</span>
            </div>
          </div>

          <div class="card stat-card">
            <div class="stat-icon icon-rose">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Workout Streak</span>
              <h3 class="stat-number">{{ summary()?.current_streak_days || 0 }} <span class="unit">days</span></h3>
              <span class="stat-sub">Keep the momentum going!</span>
            </div>
          </div>
        </div>

        <!-- Main Dashboard Split: Active Routine & Recent Sessions -->
        <div class="dashboard-split mt-8">
          <!-- Left Column: Active Workout Plan & Nutrition -->
          <div class="dash-left">
            @if (summary()?.active_plan) {
              <div class="card active-routine-card">
                <div class="routine-top">
                  <div>
                    <span class="badge badge-primary">Active AI Routine</span>
                    <h2 class="routine-title">{{ summary()?.active_plan?.plan_title }}</h2>
                    <p class="routine-desc">{{ summary()?.active_plan?.plan_description }}</p>
                  </div>
                  <a [routerLink]="['/plans', summary()?.active_plan?.id]" class="btn btn-secondary btn-sm">
                    <span>Full Schedule</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </a>
                </div>

                <div class="days-preview">
                  @for (day of summary()?.active_plan?.workout_schedule; track $index) {
                    <div class="day-chip">
                      <span class="chip-day">{{ day.day }}</span>
                      <span class="chip-focus">{{ day.focus }}</span>
                    </div>
                  }
                </div>
              </div>
            } @else {
              <div class="card empty-routine-card">
                <div class="empty-icon">🤖</div>
                <h3>No Active Workout Plan</h3>
                <p>Generate your first customized fitness and nutrition program using our Gemini AI generator.</p>
                <a routerLink="/questionnaire" class="btn btn-primary mt-4">Start Fitness Questionnaire</a>
              </div>
            }

            <!-- Latest Nutrition Guidance Card -->
            @if (summary()?.latest_nutrition) {
              <div class="card nutrition-preview-card mt-6">
                <div class="nut-prev-header">
                  <span class="badge badge-cyan">Nutrition Protocol</span>
                  <h3>{{ summary()?.latest_nutrition?.guidance_title }}</h3>
                </div>
                <div class="nut-items">
                  <div class="nut-item">
                    <span class="item-label">Strategy:</span>
                    <span class="item-val">{{ summary()?.latest_nutrition?.guidance_content?.daily_calories_focus }}</span>
                  </div>
                  <div class="nut-item">
                    <span class="item-label">Hydration Target:</span>
                    <span class="item-val">{{ summary()?.latest_nutrition?.guidance_content?.hydration_guidelines }}</span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Right Column: Recent Sessions History -->
          <div class="dash-right">
            <div class="card sessions-card">
              <div class="sessions-header">
                <h3>Recent Workout Activity</h3>
                <a routerLink="/history" class="view-all-link">View All Workouts</a>
              </div>

              @if (summary()?.recent_sessions && summary()!.recent_sessions.length > 0) {
                <div class="sessions-list">
                  @for (session of summary()?.recent_sessions; track session.id) {
                    <div class="session-item">
                      <div class="session-info">
                        <div class="session-top">
                          <h4 class="session-name">{{ session.workout_name }}</h4>
                          <span class="badge" [ngClass]="getStatusBadgeClass(session.completion_status)">
                            {{ session.completion_status }}
                          </span>
                        </div>
                        <div class="session-meta">
                          <span>⏱️ {{ session.duration }} mins</span>
                          @if (session.calories_burned) {
                            <span>🔥 {{ session.calories_burned }} kcal</span>
                          }
                          <span>📅 {{ session.workout_date | date:'shortDate' }}</span>
                        </div>
                        @if (session.notes) {
                          <p class="session-note">{{ session.notes }}</p>
                        }
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-sessions">
                  <p>No workouts recorded yet.</p>
                  <a routerLink="/history" class="btn btn-outline btn-sm mt-3">Log Your First Workout</a>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .welcome-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .welcome-title {
      font-size: 2.2rem;
      margin: 0.35rem 0;
    }
    .welcome-sub {
      color: var(--text-secondary);
      font-size: 1.05rem;
    }
    .quick-actions {
      display: flex;
      gap: 0.85rem;
    }

    .stats-grid {
      margin-bottom: 2.5rem;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.5rem;
    }
    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
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
    .icon-rose {
      background: var(--accent-rose-subtle);
      color: var(--accent-rose);
      border: 1px solid rgba(244, 63, 94, 0.25);
    }
    .stat-label {
      font-size: 0.82rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .stat-number {
      font-family: 'Outfit', sans-serif;
      font-size: 1.85rem;
      font-weight: 800;
      line-height: 1.1;
      margin: 0.2rem 0;
    }
    .stat-number .unit {
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-muted);
    }
    .stat-sub {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .dashboard-split {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 2rem;
      align-items: start;
    }
    .routine-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      gap: 1rem;
    }
    .routine-title {
      font-size: 1.45rem;
      margin: 0.35rem 0;
    }
    .routine-desc {
      color: var(--text-secondary);
      font-size: 0.92rem;
      line-height: 1.5;
    }
    .days-preview {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .day-chip {
      background-color: var(--bg-dark);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 0.75rem 1rem;
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
    }
    .chip-day {
      font-weight: 700;
      color: var(--primary);
    }
    .chip-focus {
      color: var(--text-secondary);
    }

    .empty-routine-card {
      text-align: center;
      padding: 3rem 2rem;
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .empty-routine-card h3 {
      font-size: 1.4rem;
      margin-bottom: 0.5rem;
    }
    .empty-routine-card p {
      color: var(--text-secondary);
      max-width: 420px;
      margin: 0 auto;
    }

    .nutrition-preview-card {
      padding: 1.5rem;
    }
    .nut-prev-header h3 {
      font-size: 1.25rem;
      margin-top: 0.4rem;
    }
    .nut-items {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .nut-item {
      font-size: 0.88rem;
    }
    .item-label {
      color: var(--text-muted);
      font-weight: 600;
      margin-right: 0.35rem;
    }
    .item-val {
      color: var(--text-secondary);
    }

    .sessions-card {
      padding: 1.75rem;
    }
    .sessions-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border);
    }
    .sessions-header h3 {
      font-size: 1.25rem;
    }
    .view-all-link {
      font-size: 0.85rem;
      color: var(--primary);
      font-weight: 600;
    }
    .view-all-link:hover {
      text-decoration: underline;
    }
    .sessions-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .session-item {
      background-color: var(--bg-dark);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1rem;
    }
    .session-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.4rem;
    }
    .session-name {
      font-size: 0.98rem;
      font-weight: 700;
    }
    .session-meta {
      display: flex;
      gap: 0.85rem;
      font-size: 0.82rem;
      color: var(--text-muted);
    }
    .session-note {
      font-size: 0.82rem;
      color: var(--text-secondary);
      margin-top: 0.4rem;
      font-style: italic;
    }
    .empty-sessions {
      text-align: center;
      padding: 2.5rem 1rem;
      color: var(--text-muted);
    }

    .mt-4 { margin-top: 1rem; }
    .mt-6 { margin-top: 1.5rem; }
    .mt-8 { margin-top: 2rem; }

    @media (max-width: 960px) {
      .dashboard-split {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  authService = inject(AuthService);

  isLoading = signal(true);
  summary = signal<DashboardSummary | null>(null);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'completed': return 'badge-primary';
      case 'in_progress': return 'badge-amber';
      case 'skipped': return 'badge-rose';
      default: return 'badge-cyan';
    }
  }
}
