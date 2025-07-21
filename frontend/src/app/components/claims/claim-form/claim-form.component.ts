import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClaimsService } from '../../../services/claims.service';
import { AuthService } from '../../../services/auth.service';
import { Claim, ClaimType, CreateClaimRequest, UpdateClaimRequest, User } from '../../../models';

@Component({
  selector: 'app-claim-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="claim-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Edit Claim' : 'New Claim' }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="claimForm" (ngSubmit)="onSubmit()">
            <!-- Common Fields -->
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Claim Type</mat-label>
                <mat-select formControlName="type" required>
                  <mat-option *ngFor="let type of claimTypes" [value]="type">
                    {{ type | titlecase }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="claimForm.get('type')?.errors?.['required']">
                  Claim type is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Patient Name</mat-label>
                <input matInput formControlName="patientName" required>
                <mat-error *ngIf="claimForm.get('patientName')?.errors?.['required']">
                  Patient name is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Patient ID</mat-label>
                <input matInput formControlName="patientId" required>
                <mat-error *ngIf="claimForm.get('patientId')?.errors?.['required']">
                  Patient ID is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Date of Service</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="dateOfService" required>
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="claimForm.get('dateOfService')?.errors?.['required']">
                  Date of service is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Amount</mat-label>
                <input matInput type="number" formControlName="amount" required>
                <mat-error *ngIf="claimForm.get('amount')?.errors?.['required']">
                  Amount is required
                </mat-error>
                <mat-error *ngIf="claimForm.get('amount')?.errors?.['min']">
                  Amount must be greater than 0
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Total Amount</mat-label>
                <input matInput type="number" formControlName="totalAmount" required>
                <mat-error *ngIf="claimForm.get('totalAmount')?.errors?.['required']">
                  Total amount is required
                </mat-error>
                <mat-error *ngIf="claimForm.get('totalAmount')?.errors?.['min']">
                  Total amount must be greater than 0
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" required rows="4"></textarea>
                <mat-error *ngIf="claimForm.get('description')?.errors?.['required']">
                  Description is required
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Professional Claim Fields -->
            <ng-container *ngIf="claimForm.get('type')?.value === 'professional'">
              <!-- Add professional claim specific fields -->
            </ng-container>

            <!-- Institutional Claim Fields -->
            <ng-container *ngIf="claimForm.get('type')?.value === 'institutional'">
              <!-- Add institutional claim specific fields -->
            </ng-container>

            <!-- DRG Claim Fields -->
            <ng-container *ngIf="claimForm.get('type')?.value === 'drg'">
              <!-- Add DRG claim specific fields -->
            </ng-container>

            <div class="form-actions">
              <button mat-button type="button" (click)="cancel()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="claimForm.invalid || loading">
                {{ isEditMode ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .claim-form-container {
      padding: 20px;
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
export class ClaimFormComponent implements OnInit {
  claimForm: FormGroup;
  loading = false;
  isEditMode = false;
  claimId?: string;
  claimTypes = Object.values(ClaimType);

  constructor(
    private formBuilder: FormBuilder,
    private claimsService: ClaimsService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.claimForm = this.formBuilder.group({
      type: ['', Validators.required],
      patientName: ['', Validators.required],
      patientId: ['', Validators.required],
      dateOfService: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      totalAmount: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.claimId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.claimId;

    if (this.isEditMode) {
      this.loadClaim();
    }
  }

  loadClaim(): void {
    if (!this.claimId) return;

    this.loading = true;
    this.claimsService.getClaimById(this.claimId).subscribe({
      next: (claim) => {
        this.claimForm.patchValue({
          type: claim.type,
          patientName: claim.patientName,
          patientId: claim.patientId,
          dateOfService: new Date(claim.dateOfService),
          amount: claim.amount,
          totalAmount: claim.totalAmount,
          description: claim.description
        });
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading claim', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.claimForm.invalid) return;

    this.loading = true;
    const formData = this.claimForm.value;
    const user = this.authService.currentUser;

    if (!user) {
      this.snackBar.open('User not authenticated', 'Close', { duration: 3000 });
      return;
    }

    const hospitalId = user.hospitalIds?.[0] || '';

    if (!hospitalId) {
      this.snackBar.open('No hospital associated with user', 'Close', { duration: 3000 });
      return;
    }

    if (this.isEditMode) {
      const updateData: UpdateClaimRequest = {
        patientId: formData.patientId,
        dateOfService: formData.dateOfService,
        amount: formData.amount,
        totalAmount: formData.totalAmount,
        description: formData.description
      };

      this.claimsService.updateClaim(this.claimId!, updateData).subscribe({
        next: () => this.handleSuccess('Claim updated successfully'),
        error: (error) => this.handleError(error)
      });
    } else {
      const createData: CreateClaimRequest = {
        type: formData.type,
        patientName: formData.patientName,
        patientId: formData.patientId,
        dateOfService: formData.dateOfService,
        amount: formData.amount,
        totalAmount: formData.totalAmount,
        description: formData.description,
        providerId: user.id,
        hospitalId: hospitalId
      };

      this.claimsService.createClaim(createData).subscribe({
        next: () => this.handleSuccess('Claim created successfully'),
        error: (error) => this.handleError(error)
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/claims']);
  }

  private handleSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
    this.router.navigate(['/claims']);
  }

  private handleError(error: any): void {
    this.snackBar.open(error.message || 'An error occurred', 'Close', { duration: 3000 });
    this.loading = false;
  }
} 