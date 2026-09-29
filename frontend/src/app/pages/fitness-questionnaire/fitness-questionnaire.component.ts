import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FitnessService } from '../../services/fitness.service';
import { ProfileService } from '../../services/profile.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { QuestionnaireInput } from '../../models/fitness-plan.model';

@Component({
  selector: 'app-fitness-questionnaire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="page-container container">
      <div class="questionnaire-card">
        <!-- Progress Header -->
        <div class="step-progress-wrapper">
          <div class="progress-info">
            <span class="step-indicator">Step {{ currentStep() }} of 3</span>
            <span class="step-name">{{ stepTitles[currentStep() - 1] }}</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" [style.width.%]="(currentStep() / 3) * 100"></div>
          </div>
        </div>

        @if (isGenerating()) {
          <div class="generating-state">
            <app-loading-spinner message="Consulting Google Gemini AI to analyze your biometric data, exercise preferences, and synthesize your custom training split..."></app-loading-spinner>
            <p class="generating-sub">This takes approximately 3-5 seconds. Please don't close your browser.</p>
          </div>
        } @else {
          <form [formGroup]="qForm" (ngSubmit)="onSubmit()">
            <!-- Step 1: Goals & Preferences -->
            @if (currentStep() === 1) {
              <div class="step-container">
                <h2 class="step-title">What is your primary fitness goal?</h2>
                <p class="step-description">Select the objective you want your AI training plan to optimize for.</p>

                <div class="options-grid">
                  @for (goal of fitnessGoalsList; track goal.id) {
                    <div 
                      class="option-card" 
                      [class.selected]="qForm.get('fitness_goals')?.value === goal.id"
                      (click)="qForm.patchValue({ fitness_goals: goal.id })"
                    >
                      <div class="option-icon">{{ goal.icon }}</div>
                      <div class="option-text">
                        <h4>{{ goal.title }}</h4>
                        <p>{{ goal.desc }}</p>
                      </div>
                    </div>
                  }
                </div>

                <div class="form-group mt-6">
                  <label class="form-label">Fitness Experience Level</label>
                  <div class="level-pills">
                    @for (lvl of experienceLevels; track lvl.id) {
                      <button 
                        type="button" 
                        class="pill-btn"
                        [class.active]="qForm.get('fitness_experience')?.value === lvl.id"
                        (click)="qForm.patchValue({ fitness_experience: lvl.id })"
                      >
                        {{ lvl.label }}
                      </button>
                    }
                  </div>
                </div>

                <div class="step-actions">
                  <div></div>
                  <button type="button" (click)="goToNextStep()" class="btn btn-primary">
                    <span>Continue to Step 2</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            }

            <!-- Step 2: Equipment & Frequency -->
            @if (currentStep() === 2) {
              <div class="step-container">
                <h2 class="step-title">Training Schedule & Gear</h2>
                <p class="step-description">Define how often you want to train and what equipment is available.</p>

                <div class="form-group">
                  <label class="form-label">Available Equipment</label>
                  <div class="options-grid">
                    @for (eq of equipmentList; track eq.id) {
                      <div 
                        class="option-card" 
                        [class.selected]="qForm.get('equipment_available')?.value === eq.id"
                        (click)="qForm.patchValue({ equipment_available: eq.id })"
                      >
                        <div class="option-icon">{{ eq.icon }}</div>
                        <div class="option-text">
                          <h4>{{ eq.title }}</h4>
                          <p>{{ eq.desc }}</p>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <div class="grid-2 mt-6">
                  <div class="form-group">
                    <label class="form-label" for="days">Target Workout Days Per Week</label>
                    <select id="days" class="form-control" formControlName="target_workout_days_per_week">
                      <option [value]="2">2 Days (Full Body Routine)</option>
                      <option [value]="3">3 Days (Recommended Split)</option>
                      <option [value]="4">4 Days (Upper / Lower Split)</option>
                      <option [value]="5">5 Days (Push / Pull / Legs)</option>
                      <option [value]="6">6 Days (Advanced High Frequency)</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="duration">Target Session Length</label>
                    <select id="duration" class="form-control" formControlName="session_duration_minutes">
                      <option [value]="30">30 Minutes (Express HIIT/Circuit)</option>
                      <option [value]="45">45 Minutes (Balanced Standard)</option>
                      <option [value]="60">60 Minutes (Comprehensive)</option>
                      <option [value]="75">75 Minutes (Extended Strength)</option>
                    </select>
                  </div>
                </div>

                <div class="step-actions">
                  <button type="button" (click)="goToPrevStep()" class="btn btn-secondary">
                    <span>Back</span>
                  </button>
                  <button type="button" (click)="goToNextStep()" class="btn btn-primary">
                    <span>Continue to Final Step</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            }

            <!-- Step 3: Biometrics & Safety Precautions -->
            @if (currentStep() === 3) {
              <div class="step-container">
                <h2 class="step-title">Biometrics & Joint Safety</h2>
                <p class="step-description">Our AI uses this to adapt exercise intensity and prescribe safe variations.</p>

                <div class="grid-2">
                  <div class="form-group">
                    <label class="form-label" for="age">Your Age (Years) *</label>
                    <input 
                      id="age" 
                      type="number" 
                      class="form-control" 
                      formControlName="age" 
                      min="12" 
                      max="110" 
                      placeholder="e.g. 26"
                    />
                    @if (qForm.get('age')?.invalid && (qForm.get('age')?.dirty || qForm.get('age')?.touched)) {
                      <div class="form-error">
                        <span>Please enter a valid age between 12 and 110.</span>
                      </div>
                    }
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="gender">Gender</label>
                    <select id="gender" class="form-control" formControlName="gender">
                      <option value="prefer_not_to_say">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non_binary">Non-binary</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="limitations">
                    Injuries, Joint Sensitivities, or Health Precautions
                  </label>
                  <input
                    id="limitations"
                    type="text"
                    class="form-control"
                    formControlName="relevant_limitations"
                    placeholder="e.g. Lower back stiffness, bad left knee, mild shoulder impingement, or None"
                  />
                  <small class="helper-text">Gemini AI will exclude high-risk movements and recommend safe joint-friendly alternatives.</small>
                </div>

                <div class="form-group">
                  <label class="form-label" for="notes">Additional Fitness Preferences or Requests (Optional)</label>
                  <textarea
                    id="notes"
                    class="form-control"
                    rows="2"
                    formControlName="additional_notes"
                    placeholder="e.g. Focus extra attention on core stability and posture improvement."
                  ></textarea>
                </div>

                @if (errorText()) {
                  <div class="alert alert-danger">
                    <span>{{ errorText() }}</span>
                  </div>
                }

                <div class="step-actions">
                  <button type="button" (click)="goToPrevStep()" class="btn btn-secondary">
                    <span>Back</span>
                  </button>
                  <button type="submit" [disabled]="qForm.invalid" class="btn btn-primary btn-lg">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                    <span>Generate AI Plan Now</span>
                  </button>
                </div>
              </div>
            }
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .questionnaire-card {
      max-width: 800px;
      margin: 0 auto;
      background-color: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 2.75rem 2.5rem;
      box-shadow: var(--shadow-md);
    }
    .step-progress-wrapper {
      margin-bottom: 2.5rem;
    }
    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.6rem;
      font-size: 0.92rem;
    }
    .step-indicator {
      color: var(--primary);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .step-name {
      color: var(--text-secondary);
      font-weight: 500;
    }
    .progress-bar-bg {
      height: 6px;
      background-color: #1e293b;
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #06b6d4);
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .step-title {
      font-size: 1.85rem;
      margin-bottom: 0.5rem;
    }
    .step-description {
      color: var(--text-secondary);
      font-size: 1rem;
      margin-bottom: 1.75rem;
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    .option-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      background-color: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.15rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .option-card:hover {
      border-color: #3b4a6b;
      background-color: #111a2e;
    }
    .option-card.selected {
      border-color: var(--primary);
      background-color: rgba(16, 185, 129, 0.08);
      box-shadow: 0 0 14px rgba(16, 185, 129, 0.15);
    }
    .option-icon {
      font-size: 1.75rem;
      line-height: 1;
    }
    .option-text h4 {
      font-size: 1.05rem;
      margin-bottom: 0.25rem;
    }
    .option-text p {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .level-pills {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .pill-btn {
      padding: 0.65rem 1.25rem;
      background: var(--bg-input);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      font-family: inherit;
      font-size: 0.92rem;
      font-weight: 600;
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .pill-btn:hover {
      border-color: #3b4a6b;
      color: var(--text-primary);
    }
    .pill-btn.active {
      background: var(--primary-subtle);
      border-color: var(--primary);
      color: var(--primary);
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
    }
    .mt-6 {
      margin-top: 1.75rem;
    }
    .helper-text {
      display: block;
      color: var(--text-muted);
      font-size: 0.82rem;
      margin-top: 0.35rem;
    }
    .generating-state {
      text-align: center;
      padding: 2rem 0;
    }
    .generating-sub {
      color: var(--text-muted);
      font-size: 0.88rem;
      margin-top: 0.5rem;
    }

    @media (max-width: 640px) {
      .questionnaire-card {
        padding: 2rem 1.5rem;
      }
      .options-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FitnessQuestionnaireComponent implements OnInit {
  private fb = inject(FormBuilder);
  private fitnessService = inject(FitnessService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  currentStep = signal(1);
  isGenerating = signal(false);
  errorText = signal<string | null>(null);

  stepTitles = [
    'Goals & Experience',
    'Equipment & Schedule',
    'Biometrics & Joint Safety'
  ];

  fitnessGoalsList = [
    { id: 'weight_loss', title: 'Fat Loss & Conditioning', desc: 'Burn calories and build athletic stamina', icon: '🔥' },
    { id: 'muscle_gain', title: 'Muscle & Hypertrophy', desc: 'Sculpt lean mass and increase overall strength', icon: '💪' },
    { id: 'endurance', title: 'Stamina & Cardio', desc: 'Elevate VO2 max and aerobic work capacity', icon: '🏃' },
    { id: 'general_health', title: 'Longevity & Health', desc: 'Full-body functional health and energy', icon: '⚡' }
  ];

  experienceLevels = [
    { id: 'beginner', label: 'Beginner (< 1 Year)' },
    { id: 'intermediate', label: 'Intermediate (1 - 3 Years)' },
    { id: 'advanced', label: 'Advanced (3+ Years)' }
  ];

  equipmentList = [
    { id: 'bodyweight_only', title: 'Bodyweight Only', desc: 'Zero equipment needed; train anywhere', icon: '🧘' },
    { id: 'dumbbells_only', title: 'Dumbbells / Home Kit', desc: 'Adjustable or fixed dumbbells and resistance bands', icon: '🏋️' },
    { id: 'full_gym', title: 'Commercial Gym', desc: 'Barbells, cables, squat racks, and machines', icon: '🏛️' }
  ];

  qForm: FormGroup = this.fb.group({
    fitness_goals: ['weight_loss', [Validators.required]],
    fitness_experience: ['beginner', [Validators.required]],
    activity_preferences: [['strength', 'cardio']],
    equipment_available: ['bodyweight_only', [Validators.required]],
    target_workout_days_per_week: [3, [Validators.required]],
    session_duration_minutes: [45],
    age: [26, [Validators.required, Validators.min(12), Validators.max(110)]],
    gender: ['prefer_not_to_say'],
    relevant_limitations: [''],
    additional_notes: ['']
  });

  ngOnInit(): void {
    // Pre-populate if profile already exists
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        if (profile) {
          this.qForm.patchValue({
            age: profile.age || 26,
            gender: profile.gender || 'prefer_not_to_say',
            fitness_experience: profile.fitness_experience || 'beginner',
            fitness_goals: profile.fitness_goals || 'weight_loss',
            equipment_available: profile.equipment_available || 'bodyweight_only',
            target_workout_days_per_week: profile.target_workout_days_per_week || 3,
            relevant_limitations: profile.relevant_limitations || ''
          });
        }
      },
      error: () => {}
    });
  }

  goToNextStep(): void {
    if (this.currentStep() < 3) {
      this.currentStep.update(v => v + 1);
    }
  }

  goToPrevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(v => v - 1);
    }
  }

  onSubmit(): void {
    if (this.qForm.invalid) {
      this.qForm.markAllAsTouched();
      return;
    }

    this.isGenerating.set(true);
    this.errorText.set(null);

    const formVal = this.qForm.value as QuestionnaireInput;

    this.fitnessService.generatePlan(formVal).subscribe({
      next: (plan) => {
        this.isGenerating.set(false);
        this.router.navigate(['/plans', plan.id]);
      },
      error: (err) => {
        this.isGenerating.set(false);
        this.errorText.set(err.error?.detail || 'Failed to generate fitness plan. Please check your inputs.');
      }
    });
  }
}
