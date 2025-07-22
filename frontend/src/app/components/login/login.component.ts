import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Import our UI components from the correct paths
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { 
  CardComponent, 
  CardHeaderComponent, 
  CardTitleComponent, 
  CardDescriptionComponent, 
  CardContentComponent 
} from '../../shared/ui/card/card.component';
import { SelectComponent, SelectOption } from '../../shared/ui/select/select.component';

type LoginStep = 'login' | 'tenant';

interface Tenant {
  id: string;
  name: string;
  location: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    InputComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    SelectComponent
  ],
  template: `
    <!-- Tenant Selection Step -->
    <div *ngIf="step === 'tenant'" class="min-h-screen flex items-center justify-center medical-gradient p-4">
      <ui-card className="w-full max-w-md">
        <ui-card-header className="text-center space-y-4">
          <div class="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div>
            <ui-card-title>Select Facility</ui-card-title>
            <ui-card-description>
              Choose the healthcare facility you want to access
            </ui-card-description>
          </div>
        </ui-card-header>
        <ui-card-content className="space-y-4">
          <div class="space-y-2">
            <label for="tenant" class="text-sm font-medium">Healthcare Facility</label>
            <ui-select
              [options]="tenantOptions"
              [(value)]="selectedTenant"
              placeholder="Select your facility..."
              (selectionChange)="onTenantSelectionChange($event)"
            ></ui-select>
          </div>

          <div *ngIf="error" class="flex items-center gap-2 text-sm text-error">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ error }}
          </div>

          <ui-button 
            (clickEvent)="handleTenantSelection()" 
            className="w-full"
            [disabled]="logging"
          >
            {{ logging ? 'Connecting...' : 'Continue to SmartCycleAI' }}
          </ui-button>
          
          <ui-button 
            variant="outline" 
            (clickEvent)="goBackToLogin()" 
            className="w-full"
            [disabled]="logging"
          >
            Back to Login
          </ui-button>
        </ui-card-content>
      </ui-card>
    </div>

    <!-- Login Step -->
    <div *ngIf="step === 'login'" class="min-h-screen flex items-center justify-center medical-gradient p-4">
      <ui-card className="w-full max-w-md">
        <ui-card-header className="text-center space-y-4">
          <div class="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <div>
            <ui-card-title>SmartCycleAI</ui-card-title>
            <ui-card-description>
              Medical Record Review System<br>
              Please sign in to continue
            </ui-card-description>
          </div>
        </ui-card-header>
        <ui-card-content className="space-y-4">
          <div class="space-y-2">
            <label for="username" class="text-sm font-medium">Username</label>
            <ui-input
              id="username"
              type="text"
              placeholder="Enter your username"
              [(value)]="username"
              className="h-12"
            ></ui-input>
          </div>
          
          <div class="space-y-2">
            <label for="password" class="text-sm font-medium">Password</label>
            <ui-input
              id="password"
              type="password"
              placeholder="Enter your password"
              [(value)]="password"
              className="h-12"
            ></ui-input>
          </div>

          <div *ngIf="error" class="flex items-center gap-2 text-sm text-error">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ error }}
          </div>

          <ui-button 
            (clickEvent)="handleLogin()" 
            className="w-full h-12"
            [disabled]="logging"
          >
            {{ logging ? 'Signing In...' : 'Sign In' }}
          </ui-button>

          <div class="text-center text-sm text-muted">
            Demo credentials: demo / SmartCyclePass
          </div>

          <div class="pt-4 border-t text-center text-xs text-muted">
            <div class="flex items-center justify-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              HIPAA Compliant & Secure
            </div>
          </div>
        </ui-card-content>
      </ui-card>
    </div>
  `,
  styles: [`
    .space-y-2 > :not([hidden]) ~ :not([hidden]) {
      margin-top: 0.5rem;
    }

    .space-y-4 > :not([hidden]) ~ :not([hidden]) {
      margin-top: 1rem;
    }

    .text-center {
      text-align: center;
    }

    .mx-auto {
      margin-left: auto;
      margin-right: auto;
    }

    .w-16 {
      width: 4rem;
    }

    .h-16 {
      height: 4rem;
    }

    .w-8 {
      width: 2rem;
    }

    .h-8 {
      height: 2rem;
    }

    .w-4 {
      width: 1rem;
    }

    .h-4 {
      height: 1rem;
    }

    .w-3 {
      width: 0.75rem;
    }

    .h-3 {
      height: 0.75rem;
    }

    .rounded-full {
      border-radius: 50%;
    }

    .max-w-md {
      max-width: 28rem;
    }

    .bg-primary {
      background-color: var(--medical-primary);
    }

    .text-white {
      color: white;
    }

    .text-error {
      color: var(--medical-error);
    }

    .text-muted {
      color: var(--muted-foreground);
    }

    .border-t {
      border-top: 1px solid var(--border);
    }

    .pt-4 {
      padding-top: 1rem;
    }

    .h-12 {
      height: 3rem !important;
    }

    .w-full {
      width: 100% !important;
    }

    label {
      display: block;
      font-size: 0.875rem;
      font-weight: var(--font-weight-medium);
      margin-bottom: 0.5rem;
    }

    .medical-gradient {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  `]
})
export class LoginComponent implements OnInit {
  @Output() login = new EventEmitter<string>();

  step: LoginStep = 'login';
  username: string = '';
  password: string = '';
  selectedTenant: string = '';
  error: string = '';
  logging: boolean = false;

  tenants: Tenant[] = [];
  tenantOptions: SelectOption[] = [];
  userHospitals: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // tenantOptions will be populated after successful login

    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      const selectedHospital = this.authService.getSelectedHospital();
      if (selectedHospital) {
        // User is already authenticated and has hospital selected
        this.router.navigate(['/dashboard']);
      }
    }
  }

  handleLogin() {
    if (!this.username || !this.password) {
      this.error = 'Please enter both username and password';
      return;
    }
    
    this.logging = true;
    this.error = '';

    // Try to authenticate with the real AuthService
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.logging = false;
        if (response.accessToken) {
          // Real authentication successful, set up hospitals and proceed to tenant selection
          this.userHospitals = response.user.hospitalIds || [];
          console.log('User hospitals from backend:', this.userHospitals);
          this.tenantOptions = this.userHospitals.map(hospital => ({
            value: hospital._id || hospital.id,
            label: hospital.name
          }));
          console.log('Tenant options:', this.tenantOptions);
          this.step = 'tenant';
          this.error = '';
        }
      },
      error: (error) => {
        this.logging = false;
        console.log('Backend authentication failed, checking demo credentials:', error);
        
        // Fall back to demo credentials check for demo purposes
        if ((this.username === 'demo' || this.username === 'demo@smartcycle.ai') && this.password === 'SmartCyclePass') {
          // Set up demo hospital options for fallback
          this.tenantOptions = [
            { value: 'demo-hospital', label: 'Demo Hospital' },
            { value: 'test-medical', label: 'Test Medical Center' }
          ];
          this.step = 'tenant';
          this.error = '';
        } else {
          this.error = 'Invalid credentials. Use demo/SmartCyclePass to continue.';
        }
      }
    });
  }

  handleTenantSelection() {
    if (!this.selectedTenant) {
      this.error = 'Please select a facility';
      return;
    }

    this.logging = true;
    this.error = '';

    // Set the selected hospital and navigate to dashboard
    this.authService.setSelectedHospital(this.selectedTenant);
    
    // Emit login event for the app component to handle
    this.login.emit(this.selectedTenant);
    
    // Navigate to dashboard
    this.router.navigate(['/dashboard']);
    
    this.logging = false;
  }

  goBackToLogin() {
    this.step = 'login';
    this.error = '';
    this.username = '';
    this.password = '';
    this.logging = false;
  }

  onTenantSelectionChange(option: SelectOption | null) {
    if (option) {
      this.selectedTenant = option.value;
      this.error = '';
    }
  }
} 