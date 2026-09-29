import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FitnessService } from '../../services/fitness.service';
import { WorkoutService } from '../../services/workout.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { DaySchedule, WorkoutPlan } from '../../models/fitness-plan.model';

@Component({
  selector: 'app-plan-details',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, DatePipe],
  template: `
    <div class="page-container container">
      @if (isLoading()) {
        <app-loading-spinner message="Loading workout plan schedule..."></app-loading-spinner>
      } @else if (!plan()) {
        <div class="card error-card">
          <h2>Workout Plan Not Found</h2>
          <p>The requested plan could not be located or you do not have permission to view it.</p>
          <a routerLink="/generate-plan" class="btn btn-primary mt-4">Return to AI Generator</a>
        </div>
      } @else {
        <!-- Plan Header Hero -->
        <div class="plan-header card-glass">
          <div class="plan-header-top">
            <div class="badges-row">
              @if (plan()!.is_active) {
                <span class="badge badge-primary">Active Program</span>
              } @else {
                <button (click)="makeActive()" class="badge badge-secondary cursor-pointer">Set as Active Routine</button>
              }
              <span class="badge badge-cyan">📅 {{ plan()!.workout_schedule.length }} Day Split</span>
              <span class="plan-timestamp">Generated on {{ plan()!.created_at | date:'mediumDate' }}</span>
            </div>

            <div class="actions-row">
              <button (click)="printPlan()" class="btn btn-secondary btn-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                <span>Print Plan</span>
              </button>
              <a routerLink="/generate-plan" class="btn btn-secondary btn-sm">All Plans</a>
            </div>
          </div>

          <h1 class="plan-main-title">{{ plan()!.plan_title }}</h1>
          <p class="plan-main-desc">{{ plan()!.plan_description }}</p>

          @if (plan()!.fitness_goal_summary) {
            <div class="summary-callout">
              <strong>Objective:</strong> {{ plan()!.fitness_goal_summary }}
            </div>
          }
        </div>

        <!-- Tabbed Navigation: Schedule vs Nutrition & Recovery -->
        <div class="view-tabs">
          <button 
            class="tab-btn" 
            [class.active]="selectedTab() === 'schedule'"
            (click)="selectedTab.set('schedule')"
          >
            🏋️ Workout Schedule ({{ plan()!.workout_schedule.length }} Days)
          </button>
          <button 
            class="tab-btn" 
            [class.active]="selectedTab() === 'nutrition'"
            (click)="selectedTab.set('nutrition')"
          >
            🥗 Nutrition & Hydration Guidance
          </button>
          <button 
            class="tab-btn" 
            [class.active]="selectedTab() === 'safety'"
            (click)="selectedTab.set('safety')"
          >
            🛡️ Safety & Recovery Protocol
          </button>
        </div>

        <!-- TAB 1: WORKOUT SCHEDULE -->
        @if (selectedTab() === 'schedule') {
          <div class="schedule-section">
            @for (day of plan()!.workout_schedule; track $index) {
              <div class="card day-card">
                <div class="day-header">
                  <div>
                    <h2 class="day-title">{{ day.day }}</h2>
                    <p class="day-focus">Focus: <span>{{ day.focus }}</span></p>
                  </div>
                  <button (click)="quickLogDay(day)" class="btn btn-primary btn-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Log Workout</span>
                  </button>
                </div>

                <!-- Warmup -->
                @if (day.warmup) {
                  <div class="protocol-box warmup-box">
                    <span class="protocol-tag">🔥 Warm-up:</span>
                    <span class="protocol-text">{{ day.warmup }}</span>
                  </div>
                }

                <!-- Exercises Table/Grid -->
                <div class="exercises-container">
                  <h4 class="subhead">Prescribed Exercises</h4>
                  <div class="exercises-list">
                    @for (ex of day.exercises; track ex.name) {
                      <div class="exercise-item">
                        <div class="ex-main">
                          <h5 class="ex-name">{{ ex.name }}</h5>
                          <div class="ex-parameters">
                            <span class="param-badge sets-badge">{{ ex.sets || 3 }} Sets</span>
                            <span class="param-badge reps-badge">{{ ex.reps || '10-12' }} Reps</span>
                            <span class="param-badge rest-badge">{{ ex.rest_seconds || 60 }}s Rest</span>
                          </div>
                        </div>

                        @if (ex.notes) {
                          <p class="ex-notes">
                            <strong>Form Cue:</strong> {{ ex.notes }}
                          </p>
                        }

                        @if (ex.beginner_alternative) {
                          <div class="ex-alternative">
                            <span class="alt-label">Beginner / Low-Impact Variation:</span>
                            <span class="alt-val">{{ ex.beginner_alternative }}</span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>

                <!-- Cooldown -->
                @if (day.cooldown) {
                  <div class="protocol-box cooldown-box">
                    <span class="protocol-tag">🧊 Cool-down:</span>
                    <span class="protocol-text">{{ day.cooldown }}</span>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- TAB 2: NUTRITION GUIDANCE -->
        @if (selectedTab() === 'nutrition') {
          <div class="nutrition-section">
            @if (plan()!.nutrition_guidance && plan()!.nutrition_guidance!.length > 0) {
              @for (nut of plan()!.nutrition_guidance; track nut.id) {
                <div class="card nutrition-card">
                  <div class="nut-header">
                    <span class="badge badge-cyan">Nutritional Blueprint</span>
                    <h2 class="nut-title">{{ nut.guidance_title }}</h2>
                  </div>

                  <div class="grid-2 mt-4">
                    <div class="nut-box">
                      <h4>⚡ Daily Calorie Strategy</h4>
                      <p>{{ nut.guidance_content.daily_calories_focus }}</p>
                    </div>

                    <div class="nut-box">
                      <h4>🥩 Macronutrient Breakdown</h4>
                      <p>{{ nut.guidance_content.macronutrient_distribution }}</p>
                    </div>

                    <div class="nut-box">
                      <h4>💧 Hydration Targets</h4>
                      <p>{{ nut.guidance_content.hydration_guidelines }}</p>
                    </div>

                    <div class="nut-box">
                      <h4>🍌 Pre-Workout Fuel</h4>
                      <p>{{ nut.guidance_content.pre_workout_fuel }}</p>
                    </div>

                    <div class="nut-box grid-col-span">
                      <h4>🍳 Post-Workout Recovery Fuel</h4>
                      <p>{{ nut.guidance_content.post_workout_recovery }}</p>
                    </div>
                  </div>

                  @if (nut.guidance_content.key_habits && nut.guidance_content.key_habits.length > 0) {
                    <div class="habits-box">
                      <h4>Key Daily Nutritional Habits</h4>
                      <ul>
                        @for (habit of nut.guidance_content.key_habits; track habit) {
                          <li>{{ habit }}</li>
                        }
                      </ul>
                    </div>
                  }

                  <div class="safety-box">
                    <p><strong>Notice:</strong> {{ nut.safety_disclaimer }}</p>
                  </div>
                </div>
              }
            } @else {
              <div class="card empty-card">
                <p>No nutrition guidance generated for this plan.</p>
              </div>
            }
          </div>
        }

        <!-- TAB 3: SAFETY & RECOVERY -->
        @if (selectedTab() === 'safety') {
          <div class="safety-section">
            <div class="card protocol-card">
              <div class="protocol-header">
                <span class="badge badge-amber">Longevity & Sleep</span>
                <h2>Rest & Recovery Guidance</h2>
              </div>
              <p class="protocol-body">{{ plan()!.rest_and_recovery || 'Take 1-2 rest days per week, prioritize 7-9 hours of sleep, and engage in active recovery walking.' }}</p>
            </div>

            <div class="card protocol-card mt-4">
              <div class="protocol-header">
                <span class="badge badge-rose">Injury Prevention</span>
                <h2>Safety Reminders</h2>
              </div>
              <p class="protocol-body">{{ plan()!.safety_reminders || 'Warm up adequately before each session. If you experience sharp pain, immediately cease the movement and substitute with the suggested beginner alternative.' }}</p>
              
              <div class="medical-alert">
                <strong>Important:</strong> FitBuddy AI routines are generated by Artificial Intelligence for educational wellness support and are not a replacement for certified physician guidance.
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .plan-header {
      background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(15, 23, 42, 0.95));
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-md);
    }
    .plan-header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .badges-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .plan-timestamp {
      font-size: 0.82rem;
      color: var(--text-muted);
    }
    .actions-row {
      display: flex;
      gap: 0.75rem;
    }
    .cursor-pointer {
      cursor: pointer;
    }
    .plan-main-title {
      font-size: 2.4rem;
      margin-bottom: 0.75rem;
    }
    .plan-main-desc {
      color: var(--text-secondary);
      font-size: 1.05rem;
      line-height: 1.7;
      max-width: 850px;
    }
    .summary-callout {
      margin-top: 1.5rem;
      background: rgba(16, 185, 129, 0.08);
      border-left: 4px solid var(--primary);
      padding: 0.85rem 1.25rem;
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      font-size: 0.95rem;
      color: #cbd5e1;
    }

    .view-tabs {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
      overflow-x: auto;
    }
    .tab-btn {
      padding: 0.75rem 1.35rem;
      background: none;
      border: none;
      color: var(--text-secondary);
      font-family: inherit;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .tab-btn:hover {
      color: var(--text-primary);
      background-color: var(--bg-card);
    }
    .tab-btn.active {
      color: var(--primary);
      background: var(--primary-subtle);
      border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .schedule-section {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .day-card {
      padding: 2.25rem;
    }
    .day-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
      gap: 1rem;
    }
    .day-title {
      font-size: 1.6rem;
      margin-bottom: 0.25rem;
    }
    .day-focus {
      font-size: 0.92rem;
      color: var(--text-muted);
    }
    .day-focus span {
      color: var(--accent-cyan);
      font-weight: 600;
    }

    .protocol-box {
      border-radius: var(--radius-md);
      padding: 0.9rem 1.25rem;
      margin-bottom: 1.5rem;
      font-size: 0.92rem;
      display: flex;
      gap: 0.6rem;
      align-items: baseline;
    }
    .warmup-box {
      background-color: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.2);
      color: #fde68a;
    }
    .cooldown-box {
      background-color: rgba(6, 182, 212, 0.08);
      border: 1px solid rgba(6, 182, 212, 0.2);
      color: #bae6fd;
      margin-top: 1.5rem;
      margin-bottom: 0;
    }
    .protocol-tag {
      font-weight: 700;
      white-space: nowrap;
    }

    .subhead {
      font-size: 1.15rem;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }
    .exercises-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .exercise-item {
      background-color: var(--bg-dark);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.25rem 1.5rem;
      transition: border-color 0.2s;
    }
    .exercise-item:hover {
      border-color: #3b4a6b;
    }
    .ex-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.65rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .ex-name {
      font-size: 1.12rem;
      font-weight: 700;
    }
    .ex-parameters {
      display: flex;
      gap: 0.5rem;
    }
    .param-badge {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-sm);
    }
    .sets-badge {
      background-color: rgba(16, 185, 129, 0.15);
      color: #34d399;
    }
    .reps-badge {
      background-color: rgba(6, 182, 212, 0.15);
      color: #38bdf8;
    }
    .rest-badge {
      background-color: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
    }
    .ex-notes {
      font-size: 0.88rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }
    .ex-alternative {
      background-color: rgba(255, 255, 255, 0.03);
      border-radius: var(--radius-sm);
      padding: 0.5rem 0.85rem;
      font-size: 0.82rem;
    }
    .alt-label {
      color: var(--text-muted);
      margin-right: 0.35rem;
    }
    .alt-val {
      color: #a7f3d0;
      font-weight: 500;
    }

    .nutrition-card, .protocol-card {
      padding: 2.5rem;
    }
    .nut-title {
      font-size: 1.8rem;
      margin-top: 0.5rem;
    }
    .nut-box {
      background-color: var(--bg-dark);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.35rem;
    }
    .nut-box h4 {
      font-size: 1.05rem;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }
    .nut-box p {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }
    .grid-col-span {
      grid-column: span 2;
    }
    .habits-box {
      margin-top: 2rem;
      background-color: var(--bg-dark);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.5rem;
    }
    .habits-box h4 {
      margin-bottom: 0.85rem;
    }
    .habits-box ul {
      padding-left: 1.25rem;
      color: var(--text-secondary);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.92rem;
    }
    .safety-box {
      margin-top: 2rem;
      font-size: 0.85rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
      padding-top: 1.25rem;
    }

    .protocol-body {
      font-size: 1.05rem;
      color: var(--text-secondary);
      line-height: 1.7;
      margin: 1rem 0;
    }
    .medical-alert {
      margin-top: 1.5rem;
      background: rgba(244, 63, 94, 0.08);
      border: 1px solid rgba(244, 63, 94, 0.25);
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;
      color: #fda4af;
      font-size: 0.88rem;
    }
    .error-card {
      text-align: center;
      padding: 4rem 2rem;
    }

    @media (max-width: 768px) {
      .grid-col-span {
        grid-column: span 1;
      }
      .plan-header {
        padding: 1.5rem;
      }
      .day-card {
        padding: 1.5rem;
      }
    }
  `]
})
export class PlanDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fitnessService = inject(FitnessService);
  private workoutService = inject(WorkoutService);

  isLoading = signal(true);
  plan = signal<WorkoutPlan | null>(null);
  selectedTab = signal<'schedule' | 'nutrition' | 'safety'>('schedule');

  ngOnInit(): void {
    const planIdParam = this.route.snapshot.paramMap.get('id');
    if (planIdParam) {
      this.loadPlan(Number(planIdParam));
    } else {
      this.isLoading.set(false);
    }
  }

  loadPlan(id: number): void {
    this.isLoading.set(true);
    this.fitnessService.getPlanById(id).subscribe({
      next: (plan) => {
        this.plan.set(plan);
        this.isLoading.set(false);
      },
      error: () => {
        this.plan.set(null);
        this.isLoading.set(false);
      }
    });
  }

  makeActive(): void {
    const current = this.plan();
    if (!current) return;

    this.fitnessService.activatePlan(current.id).subscribe({
      next: (updated) => {
        this.plan.set(updated);
      }
    });
  }

  quickLogDay(day: DaySchedule): void {
    const currentPlan = this.plan();
    if (!currentPlan) return;

    // Navigate to workout history with pre-filled workout session
    this.router.navigate(['/history'], {
      queryParams: {
        planId: currentPlan.id,
        workoutName: `${day.day} - ${day.focus}`
      }
    });
  }

  printPlan(): void {
    window.print();
  }
}
