import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FitnessService } from '../../services/fitness.service';
import { ProfileService } from '../../services/profile.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { QuestionnaireInput, WorkoutPlan } from '../../models/fitness-plan.model';

@Component({
  selector: 'app-plan-generation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="page-container container">
      <div class="header-section">
        <div>
          <span class="badge badge-primary">Google Gemini AI Engine</span>
          <h1 class="page-title">AI Fitness Plan Generator</h1>
          <p class="page-subtitle">Configure parameters below to generate a tailored workout split and nutrition guide</p>
        </div>
        <a routerLink="/questionnaire" class="btn btn-secondary">
          <span>Take Full Questionnaire</span>
        </a>
      </div>

      <div class="generator-layout">
        <!-- Left: Quick Generation Controls -->
        <div class="card generator-card">
          <h3 class="card-title">Custom Plan Generator</h3>
          <p class="card-desc">Adjust any parameter below. Gemini AI will synthesize an individualized plan immediately.</p>

          @if (errorMessage()) {
            <div class="alert alert-danger">
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="genForm" (ngSubmit)="generateNewPlan()">
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Primary Goal</label>
                <select class="form-control" formControlName="fitness_goals">
                  <option value="weight_loss">🔥 Fat Loss & Conditioning</option>
                  <option value="muscle_gain">💪 Muscle Hypertrophy & Strength</option>
                  <option value="endurance">🏃 Cardio & Stamina</option>
                  <option value="flexibility">🧘 Mobility & Functional Balance</option>
                  <option value="general_health">⚡ General Longevity & Health</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Experience Level</label>
                <select class="form-control" formControlName="fitness_experience">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Equipment Available</label>
                <select class="form-control" formControlName="equipment_available">
                  <option value="bodyweight_only">Bodyweight Only (Calisthenics)</option>
                  <option value="dumbbells_only">Dumbbells / Resistance Bands</option>
                  <option value="full_gym">Full Commercial Gym</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Workout Days Per Week</label>
                <select class="form-control" formControlName="target_workout_days_per_week">
                  <option [value]="2">2 Days (Full Body)</option>
                  <option [value]="3">3 Days (Recommended)</option>
                  <option [value]="4">4 Days (Upper / Lower)</option>
                  <option [value]="5">5 Days (Push / Pull / Legs)</option>
                  <option [value]="6">6 Days (High Volume)</option>
                </select>
              </div>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Target Duration (Minutes)</label>
                <select class="form-control" formControlName="session_duration_minutes">
                  <option [value]="30">30 Minutes</option>
                  <option [value]="45">45 Minutes</option>
                  <option [value]="60">60 Minutes</option>
                  <option [value]="75">75 Minutes</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Age (Years)</label>
                <input type="number" class="form-control" formControlName="age" min="12" max="110"/>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Joint / Health Limitations</label>
              <input type="text" class="form-control" formControlName="relevant_limitations" placeholder="e.g. sensitive lower back, mild knee pain, or none"/>
            </div>

            <button type="submit" [disabled]="isGenerating()" class="btn btn-primary btn-block">
              @if (isGenerating()) {
                <span>Synthesizing Plan with Gemini AI...</span>
              } @else {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                <span>Generate New AI Plan</span>
              }
            </button>
          </form>

          @if (isGenerating()) {
            <div class="mt-4">
              <app-loading-spinner message="Google Gemini AI is crafting your personalized exercise selection, rep ranges, and nutrition guidance..."></app-loading-spinner>
            </div>
          }
        </div>

        <!-- Right: Saved Plans Library -->
        <div class="plans-library">
          <div class="library-header">
            <h3>Saved Workout Plans ({{ savedPlans().length }})</h3>
            <span class="sub-label">Manage your active routines</span>
          </div>

          @if (isLoadingPlans()) {
            <app-loading-spinner message="Loading saved plans..."></app-loading-spinner>
          } @else if (savedPlans().length === 0) {
            <div class="card empty-card">
              <div class="empty-icon">📋</div>
              <h4>No workout plans yet</h4>
              <p>Use the form on the left or take the questionnaire to generate your first AI fitness plan!</p>
            </div>
          } @else {
            <div class="plans-list">
              @for (plan of savedPlans(); track plan.id) {
                <div class="card plan-card" [class.active-plan]="plan.is_active">
                  <div class="plan-card-header">
                    <div class="plan-title-box">
                      <h4>{{ plan.plan_title }}</h4>
                      <span class="plan-date">Created on {{ plan.created_at | date:'mediumDate' }}</span>
                    </div>
                    @if (plan.is_active) {
                      <span class="badge badge-primary">Active Plan</span>
                    }
                  </div>

                  <p class="plan-card-desc">{{ plan.plan_description }}</p>

                  <div class="plan-meta">
                    <span class="meta-tag">📅 {{ plan.workout_schedule.length }} Training Days</span>
                    <span class="meta-tag">🥗 Nutrition Included</span>
                  </div>

                  <div class="plan-card-actions">
                    <a [routerLink]="['/plans', plan.id]" class="btn btn-secondary btn-sm">View Schedule</a>
                    @if (!plan.is_active) {
                      <button (click)="makeActive(plan.id)" class="btn btn-outline btn-sm">Set as Active</button>
                    }
                    <button (click)="deletePlan(plan.id)" class="btn btn-danger btn-sm" title="Delete Plan">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .page-title {
      font-size: 2.2rem;
      margin: 0.35rem 0;
    }
    .page-subtitle {
      color: var(--text-secondary);
      font-size: 1rem;
    }
    .generator-layout {
      display: grid;
      grid-template-columns: 480px 1fr;
      gap: 2rem;
      align-items: start;
    }
    .generator-card {
      padding: 2.25rem 2rem;
    }
    .card-title {
      font-size: 1.35rem;
      margin-bottom: 0.35rem;
    }
    .card-desc {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 1.75rem;
    }
    .btn-block {
      width: 100%;
      padding: 0.9rem;
      margin-top: 0.5rem;
    }
    .mt-4 {
      margin-top: 1.5rem;
    }

    .plans-library {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .library-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .library-header h3 {
      font-size: 1.35rem;
    }
    .sub-label {
      font-size: 0.88rem;
      color: var(--text-muted);
    }
    .plans-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .plan-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      position: relative;
    }
    .plan-card.active-plan {
      border-color: rgba(16, 185, 129, 0.4);
      background-color: rgba(16, 185, 129, 0.03);
    }
    .plan-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }
    .plan-title-box h4 {
      font-size: 1.15rem;
      margin-bottom: 0.2rem;
    }
    .plan-date {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .plan-card-desc {
      color: var(--text-secondary);
      font-size: 0.88rem;
      line-height: 1.5;
    }
    .plan-meta {
      display: flex;
      gap: 0.75rem;
    }
    .meta-tag {
      font-size: 0.8rem;
      color: var(--text-secondary);
      background-color: var(--bg-dark);
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
    }
    .plan-card-actions {
      display: flex;
      gap: 0.65rem;
      margin-top: 0.5rem;
      padding-top: 0.85rem;
      border-top: 1px solid var(--border);
    }
    .empty-card {
      text-align: center;
      padding: 3rem 1.5rem;
    }
    .empty-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    @media (max-width: 1024px) {
      .generator-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PlanGenerationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private fitnessService = inject(FitnessService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  isGenerating = signal(false);
  isLoadingPlans = signal(true);
  errorMessage = signal<string | null>(null);
  savedPlans = signal<WorkoutPlan[]>([]);

  genForm: FormGroup = this.fb.group({
    fitness_goals: ['weight_loss', [Validators.required]],
    fitness_experience: ['beginner', [Validators.required]],
    equipment_available: ['bodyweight_only', [Validators.required]],
    target_workout_days_per_week: [3, [Validators.required]],
    session_duration_minutes: [45, [Validators.required]],
    age: [26, [Validators.required, Validators.min(12), Validators.max(110)]],
    relevant_limitations: ['']
  });

  ngOnInit(): void {
    this.loadPlans();
    this.loadProfileDefaults();
  }

  loadProfileDefaults(): void {
    this.profileService.getProfile().subscribe({
      next: (prof) => {
        if (prof) {
          this.genForm.patchValue({
            fitness_goals: prof.fitness_goals || 'weight_loss',
            fitness_experience: prof.fitness_experience || 'beginner',
            equipment_available: prof.equipment_available || 'bodyweight_only',
            target_workout_days_per_week: prof.target_workout_days_per_week || 3,
            age: prof.age || 26,
            relevant_limitations: prof.relevant_limitations || ''
          });
        }
      },
      error: () => {}
    });
  }

  loadPlans(): void {
    this.isLoadingPlans.set(true);
    this.fitnessService.getPlans().subscribe({
      next: (plans) => {
        this.savedPlans.set(plans);
        this.isLoadingPlans.set(false);
      },
      error: () => {
        this.isLoadingPlans.set(false);
      }
    });
  }

  generateNewPlan(): void {
    if (this.genForm.invalid) {
      this.genForm.markAllAsTouched();
      return;
    }

    this.isGenerating.set(true);
    this.errorMessage.set(null);

    const payload: QuestionnaireInput = {
      ...this.genForm.value,
      activity_preferences: ['strength', 'cardio']
    };

    this.fitnessService.generatePlan(payload).subscribe({
      next: (newPlan) => {
        this.isGenerating.set(false);
        this.router.navigate(['/plans', newPlan.id]);
      },
      error: (err) => {
        this.isGenerating.set(false);
        this.errorMessage.set(err.error?.detail || 'Failed to generate plan. Please try again.');
      }
    });
  }

  makeActive(id: number): void {
    this.fitnessService.activatePlan(id).subscribe({
      next: () => {
        this.loadPlans();
      }
    });
  }

  deletePlan(id: number): void {
    if (!confirm('Are you sure you want to delete this workout plan?')) return;

    this.fitnessService.deletePlan(id).subscribe({
      next: () => {
        this.savedPlans.update(plans => plans.filter(p => p.id !== id));
      }
    });
  }
}
