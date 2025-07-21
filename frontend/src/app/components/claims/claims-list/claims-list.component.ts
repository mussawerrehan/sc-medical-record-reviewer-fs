import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { ClaimsService } from '../../../services/claims.service';
import { Claim, ClaimStatus, ClaimType } from '../../../models';

@Component({
  selector: 'app-claims-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatCardModule
  ],
  template: `
    <div class="claims-list-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Claims</mat-card-title>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="createClaim()">
              <mat-icon>add</mat-icon>
              New Claim
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <table mat-table [dataSource]="dataSource" matSort>
            <!-- ID Column -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
              <td mat-cell *matCellDef="let claim">{{ claim.id }}</td>
            </ng-container>

            <!-- Type Column -->
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
              <td mat-cell *matCellDef="let claim">
                <mat-chip [color]="getTypeColor(claim.type)">
                  {{ claim.type | titlecase }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let claim">
                <mat-chip [color]="getStatusColor(claim.status)">
                  {{ claim.status | titlecase }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Date Column -->
            <ng-container matColumnDef="dateOfService">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Date of Service</th>
              <td mat-cell *matCellDef="let claim">
                {{ claim.dateOfService | date }}
              </td>
            </ng-container>

            <!-- Amount Column -->
            <ng-container matColumnDef="totalAmount">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
              <td mat-cell *matCellDef="let claim">
                {{ claim.totalAmount | currency }}
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let claim">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="viewClaim(claim)">
                    <mat-icon>visibility</mat-icon>
                    <span>View</span>
                  </button>
                  <button mat-menu-item (click)="editClaim(claim)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="deleteClaim(claim)">
                    <mat-icon>delete</mat-icon>
                    <span>Delete</span>
                  </button>
                  <button mat-menu-item (click)="submitClaim(claim)"
                          *ngIf="claim.status === ClaimStatus.DRAFT">
                    <mat-icon>send</mat-icon>
                    <span>Submit</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]"
                        [pageSize]="10"
                        showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .claims-list-container {
      padding: 20px;
    }

    .header-actions {
      margin-left: auto;
    }

    table {
      width: 100%;
      margin-top: 16px;
    }

    .mat-column-actions {
      width: 80px;
      text-align: center;
    }

    mat-chip {
      min-width: 80px;
      justify-content: center;
    }
  `]
})
export class ClaimsListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'type', 'status', 'dateOfService', 'totalAmount', 'actions'];
  dataSource = new MatTableDataSource<Claim>();
  ClaimStatus = ClaimStatus;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private claimsService: ClaimsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClaims();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadClaims(): void {
    this.claimsService.getClaims().subscribe(
      response => {
        this.dataSource.data = response.claims;
      }
    );
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

  createClaim(): void {
    this.router.navigate(['/claims/new']);
  }

  viewClaim(claim: Claim): void {
    this.router.navigate(['/claims', claim.id]);
  }

  editClaim(claim: Claim): void {
    this.router.navigate(['/claims', claim.id, 'edit']);
  }

  deleteClaim(claim: Claim): void {
    if (confirm('Are you sure you want to delete this claim?')) {
      this.claimsService.deleteClaim(claim.id).subscribe(
        () => {
          this.loadClaims();
        }
      );
    }
  }

  submitClaim(claim: Claim): void {
    this.claimsService.submitClaim(claim.id).subscribe(
      () => {
        this.loadClaims();
      }
    );
  }
} 