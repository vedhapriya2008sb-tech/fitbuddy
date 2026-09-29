import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { UserProfile } from '../../models/profile.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="page-container container">
      <div class="profile-header">
        <div>
          <span class="badge badge-primary">Account & Preferences</span>
          <h1 class="page-title">Fitness Profile</h1>
          <p class="page-subtitle">Manage your personal metrics, training preferences, and health limitations</p>
        </div>
        <a routerLink="/generate-plan" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>Generate Plan with AI</span>
        </a>
      </div>

      @if (isLoading()) {
        <app-loading-spinner message="Loading your fitness profile..."></app-loading-spinner>
      } @else {
        <div class="profile-layout">
          <!-- Left: User Overview Card -->
          <div class="card user-card">
            <div class="avatar-large">{{ userInitial() }}</div>
            <h3 class="user-fullname">{{ authService.currentUser()?.name }}</h3>
            <p class="user-email">{{ authService.currentUser()?.email }}</p>
            <div class="divider"></div>

            <div class="user-quick-stats">
              <div class="stat-row">
                <span class="stat-label">Fitness Level:</span>
                <span class="badge badge-cyan">{{ profileForm.get('fitness_experience')?.value || 'Not set' }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Primary Goal:</span>
                <span class="badge badge-amber">{{ formatGoal(profileForm.get('fitness_goals')?.value) }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Workout Target:</span>
                <span class="stat-value">{{ profileForm.get('target_workout_days_per_week')?.value || 3 }} days/week</span>
              </div>
            </div>
          </div>

          <!-- Right: Profile Form Card -->
          <div class="card profile-form-card">
            @if (successMessage()) {
              <div class="alert alert-success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>{{ successMessage() }}</span>
              </div>
            }

            @if (errorMessage()) {
              <div class="alert alert-danger">
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
              <h3 class="form-section-title">Physical Metrics</h3>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" for="age">Age (years)</label>
                  <input id="age" type="number" class="form-control" formControlName="age" min="12" max="110" placeholder="e.g. 28"/>
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

                <div class="form-group">
                  <label class="form-label" for="height_cm">Height (cm)</label>
                  <input id="height_cm" type="number" class="form-control" formControlName="height_cm" placeholder="e.g. 175"/>
                </div>

                <div class="form-group">
                  <label class="form-label" for="weight_kg">Weight (kg)</label>
                  <input id="weight_kg" type="number" class="form-control" formControlName="weight_kg" placeholder="e.g. 70"/>
                </div>
              </div>

              <h3 class="form-section-title">Fitness & Preferences</h3>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" for="fitness_experience">Experience Level</label>
                  <select id="fitness_experience" class="form-control" formControlName="fitness_experience">
                    <option value="beginner">Beginner (&lt; 1 year consistent training)</option>
                    <option value="intermediate">Intermediate (1-3 years experience)</option>
                    <option value="advanced">Advanced (3+ years consistent training)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="fitness_goals">Primary Fitness Goal</label>
                  <select id="fitness_goals" class="form-control" formControlName="fitness_goals">
                    <option value="weight_loss">Fat Loss & Conditioning</option>
                    <option value="muscle_gain">Muscle Hypertrophy & Strength</option>
                    <option value="endurance">Cardiovascular Stamina & Endurance</option>
                    <option value="flexibility">Mobility & Functional Balance</option>
                    <option value="general_health">Holistic Health & Longevity</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="equipment_available">Equipment Available</label>
                  <select id="equipment_available" class="form-control" formControlName="equipment_available">
                    <option value="bodyweight_only">Bodyweight Only (Calisthenics)</option>
                    <option value="dumbbells_only">Dumbbells / Home Kit</option>
                    <option value="full_gym">Full Commercial Gym Access</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="target_workout_days_per_week">Weekly Training Days</label>
                  <select id="target_workout_days_per_week" class="form-control" formControlName="target_workout_days_per_week">
                    <option [value]="2">2 Days / Week</option>
                    <option [value]="3">3 Days / Week (Recommended)</option>
                    <option [value]="4">4 Days / Week</option>
                    <option [value]="5">5 Days / Week</option>
                    <option [value]="6">6 Days / Week</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="relevant_limitations">Physical Restrictions / Medical Precautions</label>
                <textarea
                  id="relevant_limitations"
                  class="form-control"
                  rows="3"
                  formControlName="relevant_limitations"
                  placeholder="e.g. Mild lower back sensitivity, recovering from knee surgery, asthma..."
                ></textarea>
              </div>

              <div class="form-actions">
                <button type="submit" [disabled]="isSaving()" class="btn btn-primary">
                  @if (isSaving()) {
                    <span>Saving Changes...</span>
                  } @else {
                    <span>Save Profile Changes</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-header {
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
    .profile-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 2rem;
      align-items: start;
    }
    .user-card {
      text-align: center;
      padding: 2.5rem 1.75rem;
    }
    .avatar-large {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981, #06b6d4);
      color: white;
      font-size: 2rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem auto;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
    }
    .user-fullname {
      font-size: 1.35rem;
      margin-bottom: 0.25rem;
    }
    .user-email {
      font-size: 0.88rem;
      color: var(--text-muted);
    }
    .divider {
      height: 1px;
      background-color: var(--border);
      margin: 1.5rem 0;
    }
    .user-quick-stats {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      text-align: left;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    }
    .stat-label {
      color: var(--text-secondary);
    }
    .stat-value {
      font-weight: 600;
      color: var(--text-primary);
    }

    .profile-form-card {
      padding: 2.25rem;
    }
    .form-section-title {
      font-size: 1.15rem;
      margin: 1rem 0 1.25rem 0;
      color: var(--primary);
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
    }
    .form-section-title:first-of-type {
      margin-top: 0;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }

    @media (max-width: 900px) {
      .profile-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UserProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  authService = inject(AuthService);

  isLoading = signal(true);
  isSaving = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  profileForm: FormGroup = this.fb.group({
    age: [null, [Validators.min(10), Validators.max(120)]],
    gender: ['prefer_not_to_say'],
    height_cm: [null],
    weight_kg: [null],
    fitness_experience: ['beginner'],
    fitness_goals: ['weight_loss'],
    equipment_available: ['bodyweight_only'],
    target_workout_days_per_week: [3],
    relevant_limitations: ['']
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  userInitial(): string {
    const user = this.authService.currentUser();
    return user && user.name ? user.name.charAt(0).toUpperCase() : 'U';
  }

  formatGoal(goal?: string): string {
    if (!goal) return 'General Health';
    return goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          age: profile.age,
          gender: profile.gender || 'prefer_not_to_say',
          height_cm: profile.height_cm,
          weight_kg: profile.weight_kg,
          fitness_experience: profile.fitness_experience || 'beginner',
          fitness_goals: profile.fitness_goals || 'weight_loss',
          equipment_available: profile.equipment_available || 'bodyweight_only',
          target_workout_days_per_week: profile.target_workout_days_per_week || 3,
          relevant_limitations: profile.relevant_limitations || ''
        });
        this.isLoading.set(false);
      },
      error: () => {
        // 404 or profile not set yet
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    this.isSaving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const values = this.profileForm.value;

    this.profileService.updateProfile(values).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('Fitness profile updated successfully!');
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set('Failed to save profile. Please try again.');
      }
    });
  }
}
