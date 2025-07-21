import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClaimsService } from '../../../services/claims.service';
import { Claim, ClaimStatus, ClaimType } from '../../../models';

@Component({
  selector: 'app-claim-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="claim-details-container" *ngIf="claim">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Claim Details</mat-card-title>
          <div class="header-actions">
            <button mat-icon-button (click)="editClaim()">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button (click)="deleteClaim()">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <div class="status-section">
            <mat-chip [color]="getTypeColor(claim.type)">
              {{ claim.type | titlecase }}
            </mat-chip>
            <mat-chip [color]="getStatusColor(claim.status)">
              {{ claim.status | titlecase }}
            </mat-chip>
          </div>

          <mat-divider></mat-divider>

          <div class="details-section">
            <div class="detail-row">
              <span class="label">Claim ID:</span>
              <span class="value">{{ claim.id }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Patient ID:</span>
              <span class="value">{{ claim.patientId }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date of Service:</span>
              <span class="value">{{ claim.dateOfService | date }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Total Amount:</span>
              <span class="value">{{ claim.totalAmount | currency }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Submission Date:</span>
              <span class="value">{{ claim.submissionDate | date }}</span>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Professional Claim Details -->
          <ng-container *ngIf="claim.type === ClaimType.PROFESSIONAL && claim.professionalClaim">
            <div class="section-title">Professional Claim Details</div>
            <div class="details-section">
              <div class="detail-row" *ngFor="let cpt of claim.professionalClaim.cptCodes">
                <span class="label">CPT {{ cpt.code }}:</span>
                <span class="value">{{ cpt.description }}</span>
              </div>
              <div class="detail-row" *ngFor="let icd10 of claim.professionalClaim.icd10Codes">
                <span class="label">ICD-10 {{ icd10.code }}:</span>
                <span class="value">{{ icd10.description }}</span>
              </div>
            </div>
          </ng-container>

          <!-- Institutional Claim Details -->
          <ng-container *ngIf="claim.type === ClaimType.INSTITUTIONAL && claim.institutionalClaim">
            <div class="section-title">Institutional Claim Details</div>
            <div class="details-section">
              <div class="detail-row">
                <span class="label">Admission Date:</span>
                <span class="value">{{ claim.institutionalClaim.admissionDate | date }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Discharge Date:</span>
                <span class="value">{{ claim.institutionalClaim.dischargeDate | date }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Revenue Code:</span>
                <span class="value">{{ claim.institutionalClaim.revenueCode }}</span>
              </div>
              <div class="detail-row" *ngFor="let icd10 of claim.institutionalClaim.icd10BillingCodes">
                <span class="label">ICD-10 {{ icd10.code }}:</span>
                <span class="value">{{ icd10.description }}</span>
              </div>
            </div>
          </ng-container>

          <!-- DRG Claim Details -->
          <ng-container *ngIf="claim.type === ClaimType.DRG && claim.drgClaim">
            <div class="section-title">DRG Claim Details</div>
            <div class="details-section">
              <div class="detail-row">
                <span class="label">DRG Code:</span>
                <span class="value">{{ claim.drgClaim.drgCode }}</span>
              </div>
              <div class="detail-row">
                <span class="label">DRG Description:</span>
                <span class="value">{{ claim.drgClaim.drgDescription }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Expected Reimbursement:</span>
                <span class="value">{{ claim.drgClaim.expectedReimbursement | currency }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Length of Stay:</span>
                <span class="value">{{ claim.drgClaim.lengthOfStay }} days</span>
              </div>
            </div>
          </ng-container>

          <mat-divider></mat-divider>

          <!-- Validation Errors -->
          <ng-container *ngIf="claim.validationErrors?.length">
            <div class="section-title">Validation Errors</div>
            <div class="validation-errors">
              <div class="error" *ngFor="let error of claim.validationErrors">
                <mat-icon color="warn">error</mat-icon>
                <span>{{ error.message }}</span>
              </div>
            </div>
          </ng-container>

          <!-- Processing History -->
          <div class="section-title">Processing History</div>
          <div class="processing-history">
            <div class="history-item" *ngFor="let history of claim.processingHistory">
              <div class="history-date">{{ history.date | date:'short' }}</div>
              <mat-chip>{{ history.status | titlecase }}</mat-chip>
              <div class="history-notes" *ngIf="history.notes">{{ history.notes }}</div>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <button mat-button (click)="goBack()">Back</button>
          <button mat-raised-button color="primary"
                  *ngIf="claim.status === ClaimStatus.DRAFT"
                  (click)="submitClaim()">
            Submit Claim
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .claim-details-container {
      padding: 20px;
    }

    .header-actions {
      margin-left: auto;
    }

    .status-section {
      display: flex;
      gap: 8px;
      margin: 16px 0;
    }

    .section-title {
      font-size: 18px;
      font-weight: 500;
      margin: 16px 0;
    }

    .details-section {
      margin: 16px 0;
    }

    .detail-row {
      display: flex;
      margin: 8px 0;

      .label {
        font-weight: 500;
        min-width: 150px;
      }

      .value {
        flex: 1;
      }
    }

    .validation-errors {
      margin: 16px 0;

      .error {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #f44336;
        margin: 4px 0;
      }
    }

    .processing-history {
      margin: 16px 0;

      .history-item {
        display: flex;
        align-items: center;
        gap: 16px;
        margin: 8px 0;

        .history-date {
          min-width: 150px;
        }

        .history-notes {
          flex: 1;
          font-style: italic;
        }
      }
    }

    mat-card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px;
    }
  `]
})
export class ClaimDetailsComponent implements OnInit {
  claim?: Claim;
  ClaimType = ClaimType;
  ClaimStatus = ClaimStatus;

  constructor(
    private claimsService: ClaimsService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const claimId = this.route.snapshot.paramMap.get('id');
    if (claimId) {
      this.loadClaim(claimId);
    }
  }

  loadClaim(id: string): void {
    this.claimsService.getClaimById(id).subscribe({
      next: (claim) => {
        this.claim = claim;
      },
      error: (error) => {
        this.snackBar.open('Error loading claim', 'Close', { duration: 3000 });
        this.router.navigate(['/claims']);
      }
    });
  }

  getTypeColor(type: ClaimType): string {
    switch (type) {
      case ClaimType.PROFESSIONAL:
        return 'primary';
      case ClaimType.INSTITUTIONAL:
        return 'accent';
      case ClaimType.DRG:
        return 'warn';
      default:
        return '';
    }
  }

  getStatusColor(status: ClaimStatus): string {
    switch (status) {
      case ClaimStatus.DRAFT:
        return '';
      case ClaimStatus.SUBMITTED:
        return 'primary';
      case ClaimStatus.APPROVED:
        return 'accent';
      case ClaimStatus.REJECTED:
        return 'warn';
      default:
        return '';
    }
  }

  editClaim(): void {
    if (this.claim) {
      this.router.navigate(['/claims', this.claim.id, 'edit']);
    }
  }

  deleteClaim(): void {
    if (!this.claim) return;

    if (confirm('Are you sure you want to delete this claim?')) {
      this.claimsService.deleteClaim(this.claim.id).subscribe({
        next: () => {
          this.snackBar.open('Claim deleted successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/claims']);
        },
        error: (error) => {
          this.snackBar.open('Error deleting claim', 'Close', { duration: 3000 });
        }
      });
    }
  }

  submitClaim(): void {
    if (!this.claim) return;

    this.claimsService.submitClaim(this.claim.id).subscribe({
      next: (updatedClaim) => {
        this.claim = updatedClaim;
        this.snackBar.open('Claim submitted successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Error submitting claim', 'Close', { duration: 3000 });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/claims']);
  }
} 