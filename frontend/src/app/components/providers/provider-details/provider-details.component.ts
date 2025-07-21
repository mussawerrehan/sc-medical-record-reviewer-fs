import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProvidersService } from '../../../services/providers.service';
import { Provider } from '../../../models';

@Component({
  selector: 'app-provider-details',
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
    <div class="provider-details-container" *ngIf="provider">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            {{ provider.name.first }} {{ provider.name.middle ? provider.name.middle + ' ' : ''}}{{ provider.name.last }}
          </mat-card-title>
          <div class="header-actions">
            <button mat-icon-button (click)="editProvider()">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button (click)="manageHospitals()">
              <mat-icon>local_hospital</mat-icon>
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <div class="status-section">
            <mat-chip [color]="provider.isActive ? 'accent' : 'warn'">
              {{ provider.isActive ? 'Active' : 'Inactive' }}
            </mat-chip>
          </div>

          <mat-divider></mat-divider>

          <div class="details-section">
            <div class="detail-row">
              <span class="label">NPI:</span>
              <span class="value">{{ provider.npi }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Specialty:</span>
              <span class="value">{{ provider.specialty }}</span>
            </div>
            <div class="detail-row">
              <span class="label">License Number:</span>
              <span class="value">{{ provider.licenseNumber }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Phone:</span>
              <span class="value">{{ provider.contactInfo.phone }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">{{ provider.contactInfo.email }}</span>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="section-title">Statistics</div>
          <div class="statistics-section" *ngIf="statistics">
            <div class="stat-card">
              <div class="stat-value">{{ statistics.totalClaims }}</div>
              <div class="stat-label">Total Claims</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ statistics.totalHospitals }}</div>
              <div class="stat-label">Total Hospitals</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ statistics.totalAmount | currency }}</div>
              <div class="stat-label">Total Amount</div>
            </div>
          </div>

          <div class="section-title">Claims by Status</div>
          <div class="claims-status" *ngIf="statistics?.claimsByStatus">
            <div class="status-item" *ngFor="let status of getStatusItems()">
              <span class="status-label">{{ status.key | titlecase }}</span>
              <span class="status-value">{{ status.value }}</span>
            </div>
          </div>

          <div class="section-title">Claims by Type</div>
          <div class="claims-type" *ngIf="statistics?.claimsByType">
            <div class="type-item" *ngFor="let type of getTypeItems()">
              <span class="type-label">{{ type.key | titlecase }}</span>
              <span class="type-value">{{ type.value }}</span>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <button mat-button (click)="goBack()">Back</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .provider-details-container {
      padding: 20px;
    }

    .header-actions {
      margin-left: auto;
      display: flex;
      gap: 8px;
    }

    .status-section {
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

    .section-title {
      font-size: 18px;
      font-weight: 500;
      margin: 16px 0;
    }

    .statistics-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin: 16px 0;

      .stat-card {
        padding: 16px;
        background-color: #f5f5f5;
        border-radius: 4px;
        text-align: center;

        .stat-value {
          font-size: 24px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .stat-label {
          color: rgba(0, 0, 0, 0.6);
        }
      }
    }

    .claims-status,
    .claims-type {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin: 16px 0;

      .status-item,
      .type-item {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        background-color: #f5f5f5;
        border-radius: 4px;

        .status-label,
        .type-label {
          font-weight: 500;
        }
      }
    }

    mat-card-actions {
      display: flex;
      justify-content: flex-end;
      padding: 16px;
    }
  `]
})
export class ProviderDetailsComponent implements OnInit {
  provider?: Provider;
  statistics?: {
    totalClaims: number;
    totalHospitals: number;
    totalAmount: number;
    claimsByStatus: { [key: string]: number };
    claimsByType: { [key: string]: number };
  };

  constructor(
    private providersService: ProvidersService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const providerId = this.route.snapshot.paramMap.get('id');
    if (providerId) {
      this.loadProvider(providerId);
      this.loadStatistics(providerId);
    }
  }

  loadProvider(id: string): void {
    this.providersService.getProviderById(id).subscribe({
      next: (provider) => {
        this.provider = provider;
      },
      error: (error) => {
        this.snackBar.open('Error loading provider', 'Close', { duration: 3000 });
        this.router.navigate(['/providers']);
      }
    });
  }

  loadStatistics(id: string): void {
    this.providersService.getProviderStatistics(id).subscribe({
      next: (statistics) => {
        this.statistics = statistics;
      },
      error: (error) => {
        this.snackBar.open('Error loading statistics', 'Close', { duration: 3000 });
      }
    });
  }

  editProvider(): void {
    if (this.provider) {
      this.router.navigate(['/providers', this.provider.id, 'edit']);
    }
  }

  manageHospitals(): void {
    if (this.provider) {
      this.router.navigate(['/providers', this.provider.id, 'hospitals']);
    }
  }

  getStatusItems(): { key: string; value: number }[] {
    if (!this.statistics?.claimsByStatus) return [];
    return Object.entries(this.statistics.claimsByStatus)
      .map(([key, value]) => ({ key, value }));
  }

  getTypeItems(): { key: string; value: number }[] {
    if (!this.statistics?.claimsByType) return [];
    return Object.entries(this.statistics.claimsByType)
      .map(([key, value]) => ({ key, value }));
  }

  goBack(): void {
    this.router.navigate(['/providers']);
  }
} 