import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { WorkoutSession, WorkoutSessionCreate, WorkoutSessionUpdate } from '../models/workout.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private http = inject(HttpClient);

  getWorkouts(statusFilter?: string, limit = 50, offset = 0): Observable<WorkoutSession[]> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    if (statusFilter && statusFilter !== 'all') {
      params = params.set('status', statusFilter);
    }

    return this.http.get<WorkoutSession[]>(`${environment.apiUrl}/workouts`, { params });
  }

  logWorkout(payload: WorkoutSessionCreate): Observable<WorkoutSession> {
    return this.http.post<WorkoutSession>(`${environment.apiUrl}/workouts`, payload);
  }

  updateWorkout(id: number, payload: WorkoutSessionUpdate): Observable<WorkoutSession> {
    return this.http.put<WorkoutSession>(`${environment.apiUrl}/workouts/${id}`, payload);
  }

  deleteWorkout(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/workouts/${id}`);
  }
}
