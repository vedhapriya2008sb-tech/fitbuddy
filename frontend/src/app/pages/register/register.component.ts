import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-container auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="19" y1="8" x2="19" y2="14"></line>
              <line x1="22" y1="11" x2="16" y2="11"></line>
            </svg>
          </div>
          <h2 class="auth-title">Create Your Account</h2>
          <p class="auth-subtitle">Join FitBuddy AI to generate your customized training regimen</p>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-danger">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="name">Full Name</label>
            <input
              id="name"
              type="text"
              class="form-control"
              placeholder="e.g. Alex Morgan"
              formControlName="name"
              autocomplete="name"
            />
            @if (name?.invalid && (name?.dirty || name?.touched)) {
              <div class="form-error">
                <span>Please enter your full name (minimum 2 characters).</span>
              </div>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input
              id="email"
              type="email"
              class="form-control"
              placeholder="alex@example.com"
              formControlName="email"
              autocomplete="email"
            />
            @if (email?.invalid && (email?.dirty || email?.touched)) {
              <div class="form-error">
                <span>Please provide a valid email address.</span>
              </div>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input
              id="password"
              type="password"
              class="form-control"
              placeholder="At least 6 characters"
              formControlName="password"
              autocomplete="new-password"
            />
            @if (password?.invalid && (password?.dirty || password?.touched)) {
              <div class="form-error">
                <span>Password must be at least 6 characters long.</span>
              </div>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              class="form-control"
              placeholder="Re-enter password"
              formControlName="confirmPassword"
              autocomplete="new-password"
            />
            @if (registerForm.errors?.['passwordMismatch'] && (confirmPassword?.dirty || confirmPassword?.touched)) {
              <div class="form-error">
                <span>Passwords do not match.</span>
              </div>
            }
          </div>

          <button type="submit" [disabled]="registerForm.invalid || isLoading()" class="btn btn-primary btn-block">
            @if (isLoading()) {
              <span class="loading-text">Creating account...</span>
            } @else {
              <span>Create Free Account</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login" class="link-highlight">Log In here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .auth-card {
      width: 100%;
      max-width: 480px;
      background-color: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 2.75rem 2.25rem;
      box-shadow: var(--shadow-md);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .auth-icon {
      width: 54px;
      height: 54px;
      border-radius: var(--radius-md);
      background: var(--primary-subtle);
      color: var(--primary);
      border: 1px solid rgba(16, 185, 129, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem auto;
    }
    .auth-title {
      font-size: 1.85rem;
      margin-bottom: 0.5rem;
    }
    .auth-subtitle {
      color: var(--text-secondary);
      font-size: 0.95rem;
    }
    .btn-block {
      width: 100%;
      padding: 0.9rem;
      margin-top: 1rem;
    }
    .auth-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      font-size: 0.92rem;
      color: var(--text-secondary);
    }
    .link-highlight {
      color: var(--primary);
      font-weight: 600;
    }
    .link-highlight:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  registerForm: FormGroup = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: this.passwordMatchValidator }
  );

  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  passwordMatchValidator(g: FormGroup) {
    const pw = g.get('password')?.value;
    const cpw = g.get('confirmPassword')?.value;
    return pw === cpw ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { name, email, password } = this.registerForm.value;

    this.authService.register({ name, email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        // Guide new user directly to questionnaire
        this.router.navigate(['/questionnaire']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const detail = err.error?.detail;
        if (typeof detail === 'string') {
          this.errorMessage.set(detail);
        } else {
          this.errorMessage.set('Registration failed. Please verify your details and try again.');
        }
      }
    });
  }
}
