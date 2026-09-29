import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { WorkoutSession, WorkoutSessionCreate } from '../../models/workout.model';

@Component({
  selector: 'app-workout-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, DatePipe],
  template: `
    <div class="page-container container">
      <div class="history-header">
        <div>
          <span class="badge badge-primary">Daily Activity Tracking</span>
          <h1 class="page-title">Workout History & Activity Log</h1>
          <p class="page-subtitle">Track every training session, duration, and calories burned.</p>
        </div>

        <button (click)="openLogModal()" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Log Workout Session</span>
        </button>
      </div>

      <!-- Filters & Total Summary -->
      <div class="filters-bar">
        <div class="status-filters">
          <button 
            class="filter-pill" 
            [class.active]="currentFilter() === 'all'" 
            (click)="setFilter('all')"
          >
            All Sessions ({{ workouts().length }})
          </button>
          <button 
            class="filter-pill" 
            [class.active]="currentFilter() === 'completed'" 
            (click)="setFilter('completed')"
          >
            ✅ Completed
          </button>
          <button 
            class="filter-pill" 
            [class.active]="currentFilter() === 'in_progress'" 
            (click)="setFilter('in_progress')"
          >
            ⏳ In Progress
          </button>
          <button 
            class="filter-pill" 
            [class.active]="currentFilter() === 'skipped'" 
            (click)="setFilter('skipped')"
          >
            ⚠️ Skipped
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <app-loading-spinner message="Loading your workout history..."></app-loading-spinner>
      } @else if (filteredWorkouts().length === 0) {
        <div class="card empty-card">
          <div class="empty-icon">🏋️‍♂️</div>
          <h3>No Workouts Found</h3>
          <p>No training sessions match the current filter. Record a new workout now to build your history!</p>
          <button (click)="openLogModal()" class="btn btn-primary mt-4">Log Workout Session</button>
        </div>
      } @else {
        <div class="workouts-table-card card">
          <div class="table-responsive">
            <table class="workouts-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Workout Name</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Calories</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (w of filteredWorkouts(); track w.id) {
                  <tr>
                    <td class="date-col">{{ w.workout_date | date:'mediumDate' }}</td>
                    <td class="name-col font-bold">{{ w.workout_name }}</td>
                    <td>{{ w.duration }} mins</td>
                    <td>
                      <span class="badge" [ngClass]="getStatusBadgeClass(w.completion_status)">
                        {{ w.completion_status }}
                      </span>
                    </td>
                    <td>{{ w.calories_burned || 0 }} kcal</td>
                    <td class="notes-col">{{ w.notes || '—' }}</td>
                    <td class="actions-col">
                      <button (click)="editWorkout(w)" class="action-btn edit-btn" title="Edit session">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button (click)="deleteWorkout(w.id!)" class="action-btn delete-btn" title="Delete session">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Modal Dialog for Logging / Editing Workout -->
      @if (showModal()) {
        <div class="modal-backdrop">
          <div class="modal-card">
            <div class="modal-header">
              <h3>{{ editingId() ? 'Edit Workout Session' : 'Log Workout Session' }}</h3>
              <button (click)="closeModal()" class="close-btn">&times;</button>
            </div>

            @if (modalError()) {
              <div class="alert alert-danger">
                <span>{{ modalError() }}</span>
              </div>
            }

            <form [formGroup]="workoutForm" (ngSubmit)="submitWorkoutForm()">
              <div class="form-group">
                <label class="form-label" for="wName">Workout Name *</label>
                <input 
                  id="wName" 
                  type="text" 
                  class="form-control" 
                  formControlName="workout_name" 
                  placeholder="e.g. Upper Body Push & Core"
                />
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" for="wDuration">Duration (Minutes) *</label>
                  <input 
                    id="wDuration" 
                    type="number" 
                    class="form-control" 
                    formControlName="duration" 
                    min="1" 
                    max="600"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="wStatus">Completion Status</label>
                  <select id="wStatus" class="form-control" formControlName="completion_status">
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="skipped">Skipped</option>
                  </select>
                </div>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" for="wDate">Workout Date & Time</label>
                  <input 
                    id="wDate" 
                    type="datetime-local" 
                    class="form-control" 
                    formControlName="workout_date"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="wCal">Calories Burned (kcal)</label>
                  <input 
                    id="wCal" 
                    type="number" 
                    class="form-control" 
                    formControlName="calories_burned" 
                    placeholder="Leave blank for auto-estimate"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="wNotes">Session Notes & Observations</label>
                <textarea 
                  id="wNotes" 
                  class="form-control" 
                  rows="2" 
                  formControlName="notes" 
                  placeholder="How did you feel? Energy levels, weight PRs, adjustments made..."
                ></textarea>
              </div>

              <div class="modal-actions">
                <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancel</button>
                <button type="submit" [disabled]="workoutForm.invalid || isSubmitting()" class="btn btn-primary">
                  <span>{{ isSubmitting() ? 'Saving...' : (editingId() ? 'Update Session' : 'Save Session') }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
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

    .filters-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .status-filters {
      display: flex;
      gap: 0.65rem;
      flex-wrap: wrap;
    }
    .filter-pill {
      padding: 0.5rem 1rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      font-family: inherit;
      font-size: 0.88rem;
      font-weight: 600;
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .filter-pill:hover {
      border-color: #3b4a6b;
      color: var(--text-primary);
    }
    .filter-pill.active {
      background: var(--primary-subtle);
      border-color: var(--primary);
      color: var(--primary);
    }

    .workouts-table-card {
      padding: 0;
      overflow: hidden;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .workouts-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.92rem;
    }
    .workouts-table th {
      background-color: var(--bg-card-elevated);
      color: var(--text-secondary);
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.78rem;
      letter-spacing: 0.05em;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border);
    }
    .workouts-table td {
      padding: 1.15rem 1.25rem;
      border-bottom: 1px solid var(--border);
      color: var(--text-primary);
    }
    .workouts-table tr:hover {
      background-color: rgba(255, 255, 255, 0.02);
    }
    .name-col {
      max-width: 250px;
    }
    .font-bold {
      font-weight: 700;
    }
    .notes-col {
      color: var(--text-secondary);
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .actions-col {
      white-space: nowrap;
    }
    .action-btn {
      background: none;
      border: none;
      padding: 0.35rem 0.45rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      color: var(--text-muted);
      transition: all 0.2s ease;
    }
    .edit-btn:hover {
      color: var(--accent-cyan);
      background-color: rgba(6, 182, 212, 0.1);
    }
    .delete-btn:hover {
      color: var(--accent-rose);
      background-color: rgba(244, 63, 94, 0.1);
    }

    .empty-card {
      text-align: center;
      padding: 4rem 2rem;
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .mt-4 { margin-top: 1.5rem; }

    /* Modal Backdrop and Card */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }
    .modal-card {
      background-color: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 2rem 2.25rem;
      width: 100%;
      max-width: 540px;
      box-shadow: var(--shadow-md);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .modal-header h3 {
      font-size: 1.35rem;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.75rem;
      color: var(--text-muted);
      cursor: pointer;
      line-height: 1;
    }
    .close-btn:hover {
      color: var(--text-primary);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border);
    }
  `]
})
export class WorkoutHistoryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private workoutService = inject(WorkoutService);
  private route = inject(ActivatedRoute);

  isLoading = signal(true);
  isSubmitting = signal(false);
  workouts = signal<WorkoutSession[]>([]);
  currentFilter = signal<string>('all');

  showModal = signal(false);
  editingId = signal<number | null>(null);
  modalError = signal<string | null>(null);

  workoutForm: FormGroup = this.fb.group({
    workout_name: ['', [Validators.required]],
    duration: [45, [Validators.required, Validators.min(1)]],
    completion_status: ['completed', [Validators.required]],
    workout_date: [this.getNowDateTimeString(), [Validators.required]],
    calories_burned: [null],
    notes: ['']
  });

  ngOnInit(): void {
    this.loadWorkouts();

    // Check query params for prefilled workout from plan details
    this.route.queryParams.subscribe(params => {
      if (params['workoutName']) {
        this.openLogModal();
        this.workoutForm.patchValue({
          workout_name: params['workoutName']
        });
      }
    });
  }

  getNowDateTimeString(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  loadWorkouts(): void {
    this.isLoading.set(true);
    this.workoutService.getWorkouts().subscribe({
      next: (list) => {
        this.workouts.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  setFilter(filter: string): void {
    this.currentFilter.set(filter);
  }

  filteredWorkouts(): WorkoutSession[] {
    const filter = this.currentFilter();
    if (filter === 'all') return this.workouts();
    return this.workouts().filter(w => w.completion_status === filter);
  }

  openLogModal(): void {
    this.editingId.set(null);
    this.modalError.set(null);
    this.workoutForm.reset({
      workout_name: '',
      duration: 45,
      completion_status: 'completed',
      workout_date: this.getNowDateTimeString(),
      calories_burned: null,
      notes: ''
    });
    this.showModal.set(true);
  }

  editWorkout(w: WorkoutSession): void {
    this.editingId.set(w.id || null);
    this.modalError.set(null);

    const dateVal = w.workout_date ? new Date(w.workout_date).toISOString().slice(0, 16) : this.getNowDateTimeString();

    this.workoutForm.patchValue({
      workout_name: w.workout_name,
      duration: w.duration,
      completion_status: w.completion_status,
      workout_date: dateVal,
      calories_burned: w.calories_burned,
      notes: w.notes || ''
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  submitWorkoutForm(): void {
    if (this.workoutForm.invalid) {
      this.workoutForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.modalError.set(null);

    const formVal = this.workoutForm.value;
    const isoDate = new Date(formVal.workout_date).toISOString();

    const payload: WorkoutSessionCreate = {
      workout_name: formVal.workout_name,
      duration: Number(formVal.duration),
      completion_status: formVal.completion_status,
      workout_date: isoDate,
      calories_burned: formVal.calories_burned ? Number(formVal.calories_burned) : null,
      notes: formVal.notes
    };

    const editId = this.editingId();
    if (editId) {
      this.workoutService.updateWorkout(editId, payload).subscribe({
        next: (updated) => {
          this.isSubmitting.set(false);
          this.workouts.update(list => list.map(item => item.id === editId ? updated : item));
          this.closeModal();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.modalError.set(err.error?.detail || 'Failed to update session.');
        }
      });
    } else {
      this.workoutService.logWorkout(payload).subscribe({
        next: (created) => {
          this.isSubmitting.set(false);
          this.workouts.update(list => [created, ...list]);
          this.closeModal();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.modalError.set(err.error?.detail || 'Failed to log workout session.');
        }
      });
    }
  }

  deleteWorkout(id: number): void {
    if (!confirm('Are you sure you want to delete this workout log?')) return;

    this.workoutService.deleteWorkout(id).subscribe({
      next: () => {
        this.workouts.update(list => list.filter(w => w.id !== id));
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
