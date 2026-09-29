import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <div class="container nav-content">
        <a routerLink="/" class="brand">
          <div class="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 5v14M18 5v14M4 9h4M16 9h4M2 13h4M18 13h4M6 12h12"/>
            </svg>
          </div>
          <span class="brand-name">FitBuddy <span class="highlight">AI</span></span>
        </a>

        <!-- Desktop Navigation -->
        <nav class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">Home</a>
          
          @if (authService.isAuthenticated()) {
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
            <a routerLink="/questionnaire" routerLinkActive="active" class="nav-link">Questionnaire</a>
            <a routerLink="/generate-plan" routerLinkActive="active" class="nav-link">AI Generator</a>
            <a routerLink="/history" routerLinkActive="active" class="nav-link">Workout History</a>
            <a routerLink="/profile" routerLinkActive="active" class="nav-link">Profile</a>
          }
        </nav>

        <!-- Right Action Area -->
        <div class="nav-actions">
          @if (authService.isAuthenticated()) {
            <div class="user-pill">
              <div class="user-avatar">{{ userInitial() }}</div>
              <span class="user-name">{{ authService.currentUser()?.name }}</span>
            </div>
            <button (click)="logout()" class="btn btn-secondary btn-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          } @else {
            <a routerLink="/login" class="btn btn-secondary btn-sm">Log In</a>
            <a routerLink="/register" class="btn btn-primary btn-sm">Get Started</a>
          }

          <!-- Mobile Menu Hamburger -->
          <button (click)="toggleMobileMenu()" class="mobile-toggle" aria-label="Toggle menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              @if (isMobileMenuOpen()) {
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              } @else {
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              }
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Menu -->
      @if (isMobileMenuOpen()) {
        <div class="mobile-menu">
          <a routerLink="/" (click)="closeMobileMenu()" class="mobile-link">Home</a>
          @if (authService.isAuthenticated()) {
            <a routerLink="/dashboard" (click)="closeMobileMenu()" class="mobile-link">Dashboard</a>
            <a routerLink="/questionnaire" (click)="closeMobileMenu()" class="mobile-link">Questionnaire</a>
            <a routerLink="/generate-plan" (click)="closeMobileMenu()" class="mobile-link">AI Generator</a>
            <a routerLink="/history" (click)="closeMobileMenu()" class="mobile-link">Workout History</a>
            <a routerLink="/profile" (click)="closeMobileMenu()" class="mobile-link">Profile</a>
            <button (click)="logout(); closeMobileMenu()" class="mobile-link btn-logout">Logout ({{ authService.currentUser()?.name }})</button>
          } @else {
            <a routerLink="/login" (click)="closeMobileMenu()" class="mobile-link">Log In</a>
            <a routerLink="/register" (click)="closeMobileMenu()" class="mobile-link btn-register">Get Started</a>
          }
        </div>
      }
    </header>
  `,
  styles: [`
    .navbar {
      background-color: rgba(9, 13, 22, 0.85);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .brand-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, #10b981, #06b6d4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
    }
    .brand-name {
      font-family: 'Outfit', sans-serif;
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .brand-name .highlight {
      color: var(--primary);
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.75rem;
    }
    .nav-link {
      color: var(--text-secondary);
      font-size: 0.95rem;
      font-weight: 500;
      transition: color 0.2s ease;
      position: relative;
      padding: 0.35rem 0;
    }
    .nav-link:hover, .nav-link.active {
      color: var(--text-primary);
    }
    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--primary);
      border-radius: 2px;
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .user-pill {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background-color: var(--bg-card);
      border: 1px solid var(--border);
      padding: 0.35rem 0.85rem 0.35rem 0.45rem;
      border-radius: var(--radius-full);
    }
    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981, #06b6d4);
      color: white;
      font-size: 0.85rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-name {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .mobile-toggle {
      display: none;
      background: none;
      border: none;
      color: var(--text-primary);
      cursor: pointer;
      padding: 0.4rem;
    }
    .mobile-menu {
      display: flex;
      flex-direction: column;
      background-color: var(--bg-card);
      border-bottom: 1px solid var(--border);
      padding: 1rem 1.5rem 1.5rem 1.5rem;
      gap: 0.75rem;
    }
    .mobile-link {
      padding: 0.65rem 0;
      color: var(--text-primary);
      font-size: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      text-align: left;
      background: none;
      border-left: none;
      border-right: none;
      border-top: none;
      cursor: pointer;
    }
    .btn-logout {
      color: var(--accent-rose);
      font-weight: 600;
    }
    .btn-register {
      color: var(--primary);
      font-weight: 700;
    }
    @media (max-width: 900px) {
      .nav-links {
        display: none;
      }
      .mobile-toggle {
        display: block;
      }
      .user-name {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  isMobileMenuOpen = signal(false);

  userInitial(): string {
    const user = this.authService.currentUser();
    return user && user.name ? user.name.charAt(0).toUpperCase() : 'U';
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}
