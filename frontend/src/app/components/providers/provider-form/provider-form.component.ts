import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProvidersService } from '../../../services/providers.service';
import { Provider, Specialty } from '../../../models';

@Component({
  selector: 'app-provider-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="provider-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Edit Provider' : 'New Provider' }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="providerForm" (ngSubmit)="onSubmit()">
            <div class="form-section">
              <h3>Personal Information</h3>
              <div formGroupName="name">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>First Name</mat-label>
                    <input matInput formControlName="first" required>
                    <mat-error *ngIf="nameForm?.get('first')?.errors?.['required']">
                      First name is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Middle Name</mat-label>
                    <input matInput formControlName="middle">
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Last Name</mat-label>
                    <input matInput formControlName="last" required>
                    <mat-error *ngIf="nameForm?.get('last')?.errors?.['required']">
                      Last name is required
                    </mat-error>
                  </mat-form-field>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3>Professional Information</h3>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>NPI Number</mat-label>
                  <input matInput formControlName="npi" required>
                  <mat-error *ngIf="providerForm.get('npi')?.errors?.['required']">
                    NPI number is required
                  </mat-error>
                  <mat-error *ngIf="providerForm.get('npi')?.errors?.['pattern']">
                    NPI must be a 10-digit number
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Specialty</mat-label>
                  <mat-select formControlName="specialty" required>
                    <mat-option *ngFor="let specialty of specialties" [value]="specialty">
                      {{ specialty }}
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="providerForm.get('specialty')?.errors?.['required']">
                    Specialty is required
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>License Number</mat-label>
                  <input matInput formControlName="licenseNumber" required>
                  <mat-error *ngIf="providerForm.get('licenseNumber')?.errors?.['required']">
                    License number is required
                  </mat-error>
                </mat-form-field>
              </div>
            </div>

            <div class="form-section">
              <h3>Contact Information</h3>
              <div formGroupName="contactInfo">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Phone</mat-label>
                    <input matInput formControlName="phone" required
                           placeholder="(123) 456-7890">
                    <mat-error *ngIf="contactForm?.get('phone')?.errors?.['required']">
                      Phone number is required
                    </mat-error>
                    <mat-error *ngIf="contactForm?.get('phone')?.errors?.['pattern']">
                      Invalid phone number format
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput formControlName="email" required>
                    <mat-error *ngIf="contactForm?.get('email')?.errors?.['required']">
                      Email is required
                    </mat-error>
                    <mat-error *ngIf="contactForm?.get('email')?.errors?.['email']">
                      Invalid email format
                    </mat-error>
                  </mat-form-field>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="cancel()">Cancel</button>
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="providerForm.invalid || loading">
                {{ isEditMode ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .provider-form-container {
      padding: 20px;
    }

    .form-section {
      margin: 24px 0;

      h3 {
        margin-bottom: 16px;
        font-weight: 500;
      }
    }

    .form-row {
      margin-bottom: 16px;

      mat-form-field {
        width: 100%;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 24px;
    }
  `]
})
export class ProviderFormComponent implements OnInit {
  providerForm: FormGroup;
  loading = false;
  isEditMode = false;
  providerId?: string;
  specialties: Specialty[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private providersService: ProvidersService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.providerForm = this.formBuilder.group({
      name: this.formBuilder.group({
        first: ['', Validators.required],
        middle: [''],
        last: ['', Validators.required]
      }),
      npi: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      specialty: ['', Validators.required],
      licenseNumber: ['', Validators.required],
      contactInfo: this.formBuilder.group({
        phone: ['', [Validators.required, Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
        email: ['', [Validators.required, Validators.email]]
      })
    });
  }

  get nameForm() {
    return this.providerForm.get('name') as FormGroup;
  }

  get contactForm() {
    return this.providerForm.get('contactInfo') as FormGroup;
  }

  ngOnInit(): void {
    this.loadSpecialties();
    this.providerId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.providerId;

    if (this.isEditMode) {
      this.loadProvider();
    }
  }

  loadSpecialties(): void {
    this.providersService.getSpecialties().subscribe({
      next: (specialties) => {
        this.specialties = specialties;
      },
      error: (error) => {
        this.snackBar.open('Error loading specialties', 'Close', { duration: 3000 });
      }
    });
  }

  loadProvider(): void {
    if (!this.providerId) return;

    this.loading = true;
    this.providersService.getProviderById(this.providerId).subscribe({
      next: (provider) => {
        this.providerForm.patchValue({
          name: provider.name,
          npi: provider.npi,
          specialty: provider.specialty,
          licenseNumber: provider.licenseNumber,
          contactInfo: provider.contactInfo
        });
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading provider', 'Close', { duration: 3000 });
        this.router.navigate(['/providers']);
      }
    });
  }

  onSubmit(): void {
    if (this.providerForm.invalid) return;

    this.loading = true;
    const formData = this.providerForm.value;

    if (this.isEditMode) {
      this.providersService.updateProvider(this.providerId!, formData).subscribe({
        next: () => this.handleSuccess('Provider updated successfully'),
        error: (error) => this.handleError(error)
      });
    } else {
      this.providersService.createProvider(formData).subscribe({
        next: () => this.handleSuccess('Provider created successfully'),
        error: (error) => this.handleError(error)
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/providers']);
  }

  private handleSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
    this.router.navigate(['/providers']);
  }

  private handleError(error: any): void {
    this.snackBar.open(error.message || 'An error occurred', 'Close', { duration: 3000 });
    this.loading = false;
  }
} 