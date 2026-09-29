import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'FitBuddy AI - Smart Fitness Plan Generator'
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
    title: 'Create Account - FitBuddy AI'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
    title: 'Sign In - FitBuddy AI'
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/user-profile/user-profile.component').then(m => m.UserProfileComponent),
    canActivate: [authGuard],
    title: 'My Profile - FitBuddy AI'
  },
  {
    path: 'questionnaire',
    loadComponent: () => import('./pages/fitness-questionnaire/fitness-questionnaire.component').then(m => m.FitnessQuestionnaireComponent),
    canActivate: [authGuard],
    title: 'Fitness Questionnaire - FitBuddy AI'
  },
  {
    path: 'generate-plan',
    loadComponent: () => import('./pages/plan-generation/plan-generation.component').then(m => m.PlanGenerationComponent),
    canActivate: [authGuard],
    title: 'AI Generator - FitBuddy AI'
  },
  {
    path: 'plans/:id',
    loadComponent: () => import('./pages/plan-details/plan-details.component').then(m => m.PlanDetailsComponent),
    canActivate: [authGuard],
    title: 'Workout Plan - FitBuddy AI'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard - FitBuddy AI'
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/workout-history/workout-history.component').then(m => m.WorkoutHistoryComponent),
    canActivate: [authGuard],
    title: 'Workout History - FitBuddy AI'
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found - FitBuddy AI'
  }
];
