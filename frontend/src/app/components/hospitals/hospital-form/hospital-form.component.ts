import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HospitalsService } from '../../../services/hospitals.service';
import { Hospital } from '../../../models';

@Component({
  selector: 'app-hospital-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="hospital-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Edit Hospital' : 'New Hospital' }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="hospitalForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Hospital Name</mat-label>
                <input matInput formControlName="name" required>
                <mat-error *ngIf="hospitalForm.get('name')?.errors?.['required']">
                  Hospital name is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>NPI Number</mat-label>
                <input matInput formControlName="npi" required>
                <mat-error *ngIf="hospitalForm.get('npi')?.errors?.['required']">
                  NPI number is required
                </mat-error>
                <mat-error *ngIf="hospitalForm.get('npi')?.errors?.['pattern']">
                  NPI must be a 10-digit number
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-section">
              <h3>Address</h3>
              <div formGroupName="address">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Street</mat-label>
                    <input matInput formControlName="street" required>
                    <mat-error *ngIf="addressForm?.get('street')?.errors?.['required']">
                      Street is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>City</mat-label>
                    <input matInput formControlName="city" required>
                    <mat-error *ngIf="addressForm?.get('city')?.errors?.['required']">
                      City is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>State</mat-label>
                    <input matInput formControlName="state" required>
                    <mat-error *ngIf="addressForm?.get('state')?.errors?.['required']">
                      State is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>ZIP Code</mat-label>
                    <input matInput formControlName="zipCode" required>
                    <mat-error *ngIf="addressForm?.get('zipCode')?.errors?.['required']">
                      ZIP code is required
                    </mat-error>
                    <mat-error *ngIf="addressForm?.get('zipCode')?.errors?.['pattern']">
                      Invalid ZIP code format
                    </mat-error>
                  </mat-form-field>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3>Contact Information</h3>
              <div formGroupName="contactInfo">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Phone</mat-label>
                    <input matInput formControlName="phone" required>
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
                      [disabled]="hospitalForm.invalid || loading">
                {{ isEditMode ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .hospital-form-container {
      padding: 20px;
    }

    .form-row {
      margin-bottom: 16px;

      mat-form-field {
        width: 100%;
      }
    }

    .form-section {
      margin: 24px 0;

      h3 {
        margin-bottom: 16px;
        font-weight: 500;
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
export class HospitalFormComponent implements OnInit {
  hospitalForm: FormGroup;
  loading = false;
  isEditMode = false;
  hospitalId?: string;

  constructor(
    private formBuilder: FormBuilder,
    private hospitalsService: HospitalsService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.hospitalForm = this.formBuilder.group({
      name: ['', Validators.required],
      npi: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: this.formBuilder.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]]
      }),
      contactInfo: this.formBuilder.group({
        phone: ['', [Validators.required, Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
        email: ['', [Validators.required, Validators.email]]
      })
    });
  }

  get addressForm() {
    return this.hospitalForm.get('address') as FormGroup;
  }

  get contactForm() {
    return this.hospitalForm.get('contactInfo') as FormGroup;
  }

  ngOnInit(): void {
    this.hospitalId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.hospitalId;

    if (this.isEditMode) {
      this.loadHospital();
    }
  }

  loadHospital(): void {
    if (!this.hospitalId) return;

    this.loading = true;
    this.hospitalsService.getHospitalById(this.hospitalId).subscribe({
      next: (hospital) => {
        this.hospitalForm.patchValue({
          name: hospital.name,
          npi: hospital.npi,
          address: hospital.address,
          contactInfo: hospital.contactInfo
        });
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading hospital', 'Close', { duration: 3000 });
        this.router.navigate(['/hospitals']);
      }
    });
  }

  onSubmit(): void {
    if (this.hospitalForm.invalid) return;

    this.loading = true;
    const formData = this.hospitalForm.value;

    if (this.isEditMode) {
      this.hospitalsService.updateHospital(this.hospitalId!, formData).subscribe({
        next: () => this.handleSuccess('Hospital updated successfully'),
        error: (error) => this.handleError(error)
      });
    } else {
      this.hospitalsService.createHospital(formData).subscribe({
        next: () => this.handleSuccess('Hospital created successfully'),
        error: (error) => this.handleError(error)
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/hospitals']);
  }

  private handleSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
    this.router.navigate(['/hospitals']);
  }

  private handleError(error: any): void {
    this.snackBar.open(error.message || 'An error occurred', 'Close', { duration: 3000 });
    this.loading = false;
  }
} 