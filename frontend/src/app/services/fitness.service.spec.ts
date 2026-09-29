import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { FitnessService } from './fitness.service';
import { QuestionnaireInput } from '../models/fitness-plan.model';

describe('FitnessService', () => {
  let service: FitnessService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FitnessService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(FitnessService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request fitness plan generation via POST', () => {
    const mockQuestionnaire: QuestionnaireInput = {
      age: 26,
      fitness_experience: 'intermediate',
      activity_preferences: ['strength', 'hiit'],
      fitness_goals: 'muscle_gain',
      equipment_available: 'full_gym',
      target_workout_days_per_week: 4
    };

    const mockPlan = {
      id: 10,
      user_id: 1,
      plan_title: 'Custom Hypertrophy 4-Day',
      plan_description: 'Strength routine',
      workout_schedule: [],
      is_active: true,
      created_at: new Date().toISOString()
    };

    service.generatePlan(mockQuestionnaire).subscribe(plan => {
      expect(plan.id).toBe(10);
      expect(plan.plan_title).toBe('Custom Hypertrophy 4-Day');
    });

    const req = httpTesting.expectOne('http://127.0.0.1:8000/api/fitness/generate-plan');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockQuestionnaire);
    req.flush(mockPlan);
  });

  it('should fetch user plans via GET', () => {
    const mockPlans = [
      { id: 1, user_id: 1, plan_title: 'Plan A', plan_description: 'Desc A', workout_schedule: [], is_active: true, created_at: '' }
    ];

    service.getPlans().subscribe(plans => {
      expect(plans.length).toBe(1);
      expect(plans[0].plan_title).toBe('Plan A');
    });

    const req = httpTesting.expectOne('http://127.0.0.1:8000/api/fitness/plans');
    expect(req.request.method).toBe('GET');
    req.flush(mockPlans);
  });
});
