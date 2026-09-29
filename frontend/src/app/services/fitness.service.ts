import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { QuestionnaireInput, WorkoutPlan } from '../models/fitness-plan.model';

@Injectable({
  providedIn: 'root'
})
export class FitnessService {
  private http = inject(HttpClient);

  generatePlan(questionnaire: QuestionnaireInput): Observable<WorkoutPlan> {
    return this.http.post<WorkoutPlan>(`${environment.apiUrl}/fitness/generate-plan`, questionnaire);
  }

  getPlans(): Observable<WorkoutPlan[]> {
    return this.http.get<WorkoutPlan[]>(`${environment.apiUrl}/fitness/plans`);
  }

  getPlanById(id: number): Observable<WorkoutPlan> {
    return this.http.get<WorkoutPlan>(`${environment.apiUrl}/fitness/plans/${id}`);
  }

  activatePlan(id: number): Observable<WorkoutPlan> {
    return this.http.put<WorkoutPlan>(`${environment.apiUrl}/fitness/plans/${id}/activate`, {});
  }

  deletePlan(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/fitness/plans/${id}`);
  }
}
