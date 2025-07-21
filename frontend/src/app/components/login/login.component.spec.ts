import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, UserRole } from '../../models';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockAuthResponse: AuthResponse = {
    message: 'Login successful',
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.SUPER_ADMIN,
      isActive: true
    },
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token'
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule
      ],
      declarations: [],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.errors?.['email']).toBeTruthy();
    
    emailControl?.setValue('valid@email.com');
    expect(emailControl?.errors).toBeNull();
  });

  it('should validate password length', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('short');
    expect(passwordControl?.errors?.['minlength']).toBeTruthy();
    
    passwordControl?.setValue('validpassword');
    expect(passwordControl?.errors).toBeNull();
  });

  it('should show error messages for invalid form submission', () => {
    component.onSubmit();
    expect(component.loginForm.get('email')?.errors?.['required']).toBeTruthy();
    expect(component.loginForm.get('password')?.errors?.['required']).toBeTruthy();
  });

  it('should call auth service on valid form submission', fakeAsync(() => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    authService.login.and.returnValue(of(mockAuthResponse));
    spyOn(router, 'navigate');

    component.loginForm.patchValue(credentials);
    component.onSubmit();
    tick();

    expect(authService.login).toHaveBeenCalledWith(credentials);
    expect(router.navigate).toHaveBeenCalled();
  }));

  it('should handle login error', fakeAsync(() => {
    const errorMessage = 'Invalid credentials';
    authService.login.and.returnValue(throwError(() => new Error(errorMessage)));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    component.onSubmit();
    tick();

    expect(component.error).toBe(errorMessage);
    expect(component.loading).toBeFalse();
  }));
}); 