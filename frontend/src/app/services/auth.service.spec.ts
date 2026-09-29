import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: class {} }])
      ]
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have isAuthenticated false initially when no token is in localStorage', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.getToken()).toBeNull();
  });

  it('should store token and user on login and update signals', () => {
    const mockResponse = {
      access_token: 'fake-jwt-token-12345',
      token_type: 'bearer',
      user: {
        id: 1,
        name: 'Test Athlete',
        email: 'test@fitbuddy.ai',
        created_at: new Date().toISOString(),
        has_profile: false
      }
    };

    service.login({ email: 'test@fitbuddy.ai', password: 'password123' }).subscribe(res => {
      expect(res.access_token).toBe('fake-jwt-token-12345');
      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()?.name).toBe('Test Athlete');
      expect(localStorage.getItem('fitbuddy_token')).toBe('fake-jwt-token-12345');
    });

    const req = httpTesting.expectOne('http://127.0.0.1:8000/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should clear token and user on logout', () => {
    localStorage.setItem('fitbuddy_token', 'sample-token');
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('fitbuddy_token')).toBeNull();
  });
});
