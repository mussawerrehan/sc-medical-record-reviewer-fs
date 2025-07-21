import { LoginComponent } from '../../src/app/components/login/login.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../src/app/services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        LoginComponent
      ],
      providers: [AuthService]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).to.exist;
  });

  it('should have email and password fields', () => {
    const emailInput = fixture.nativeElement.querySelector('[data-testid="email-input"]');
    const passwordInput = fixture.nativeElement.querySelector('[data-testid="password-input"]');
    
    expect(emailInput).to.exist;
    expect(passwordInput).to.exist;
  });

  it('should show validation errors when form is submitted empty', () => {
    const submitButton = fixture.nativeElement.querySelector('[data-testid="login-button"]');
    submitButton.click();
    fixture.detectChanges();

    const emailError = fixture.nativeElement.querySelector('mat-error');
    expect(emailError).to.exist;
    expect(emailError.textContent).to.contain('Email is required');
  });

  it('should show email format validation error', () => {
    // Fill in invalid email
    component.loginForm.patchValue({
      email: 'invalid-email',
      password: 'validpass123'
    });
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('[data-testid="login-button"]');
    submitButton.click();
    fixture.detectChanges();

    const emailError = fixture.nativeElement.querySelector('mat-error');
    expect(emailError.textContent).to.contain('valid email');
  });

  it('should show password length validation error', () => {
    // Fill in short password
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: '123'
    });
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('[data-testid="login-button"]');
    submitButton.click();
    fixture.detectChanges();

    const passwordError = fixture.nativeElement.querySelector('mat-error');
    expect(passwordError.textContent).to.contain('8 characters');
  });

  it('should show loading spinner during login attempt', () => {
    const loginSpy = cy.stub(authService, 'login').as('loginCall');
    loginSpy.returns(of({}));
    
    // Fill valid form data
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    fixture.detectChanges();

    // Submit form
    const submitButton = fixture.nativeElement.querySelector('[data-testid="login-button"]');
    submitButton.click();
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).to.exist;
  });

  it('should navigate to dashboard on successful login', () => {
    const loginSpy = cy.stub(authService, 'login').as('loginCall');
    loginSpy.returns(of({}));
    const navigateSpy = cy.stub(router, 'navigate').as('navigateCall');
    
    // Fill valid form data
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    fixture.detectChanges();

    // Submit form
    const submitButton = fixture.nativeElement.querySelector('[data-testid="login-button"]');
    submitButton.click();
    fixture.detectChanges();

    cy.get('@navigateCall').should('have.been.calledWith', ['/dashboard']);
  });

  it('should display error message on login failure', () => {
    const errorMessage = 'Invalid credentials';
    const loginSpy = cy.stub(authService, 'login').as('loginCall');
    loginSpy.returns(throwError(() => ({ error: { message: errorMessage } })));
    
    // Fill form data
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    fixture.detectChanges();

    // Submit form
    const submitButton = fixture.nativeElement.querySelector('[data-testid="login-button"]');
    submitButton.click();
    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('[data-testid="error-message"]');
    expect(errorElement.textContent.trim()).to.equal(errorMessage);
  });
}); 