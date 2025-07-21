import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HospitalsService } from '../../../services/hospitals.service';
import { Hospital } from '../../../models';

@Component({
  selector: 'app-hospital-providers',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule
  ],
  template: `
    <div class="hospital-providers-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Manage Providers - {{ hospital?.name }}</mat-card-title>
          <div class="header-actions">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search Providers</mat-label>
              <input matInput [formControl]="searchControl" placeholder="Search by name, NPI, or specialty">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="addProvider()">
              <mat-icon>add</mat-icon>
              Add Provider
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <table mat-table [dataSource]="dataSource" matSort>
            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
              <td mat-cell *matCellDef="let provider">
                {{ provider.name.first }} {{ provider.name.middle ? provider.name.middle + ' ' : ''}}{{ provider.name.last }}
              </td>
            </ng-container>

            <!-- NPI Column -->
            <ng-container matColumnDef="npi">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>NPI</th>
              <td mat-cell *matCellDef="let provider">{{ provider.npi }}</td>
            </ng-container>

            <!-- Specialty Column -->
            <ng-container matColumnDef="specialty">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Specialty</th>
              <td mat-cell *matCellDef="let provider">{{ provider.specialty }}</td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let provider">
                <mat-chip [color]="provider.isActive ? 'accent' : 'warn'">
                  {{ provider.isActive ? 'Active' : 'Inactive' }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let provider">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="viewProvider(provider)">
                    <mat-icon>visibility</mat-icon>
                    <span>View</span>
                  </button>
                  <button mat-menu-item (click)="removeProvider(provider)">
                    <mat-icon>remove_circle</mat-icon>
                    <span>Remove</span>
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

        <mat-card-actions>
          <button mat-button (click)="goBack()">Back</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .hospital-providers-container {
      padding: 20px;
    }

    .header-actions {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-left: auto;
    }

    .search-field {
      width: 300px;
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

    mat-card-actions {
      display: flex;
      justify-content: flex-end;
      padding: 16px;
    }
  `]
})
export class HospitalProvidersComponent implements OnInit {
  displayedColumns: string[] = ['name', 'npi', 'specialty', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>();
  searchControl = new FormControl('');
  hospital?: Hospital;
  hospitalId?: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private hospitalsService: HospitalsService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.hospitalId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.hospitalId) {
      this.loadHospital();
      this.setupSearch();
      this.loadProviders();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.loadProviders(value || '');
    });
  }

  loadHospital(): void {
    if (!this.hospitalId) return;

    this.hospitalsService.getHospitalById(this.hospitalId).subscribe({
      next: (hospital) => {
        this.hospital = hospital;
      },
      error: (error) => {
        this.snackBar.open('Error loading hospital', 'Close', { duration: 3000 });
        this.router.navigate(['/hospitals']);
      }
    });
  }

  loadProviders(searchTerm?: string): void {
    if (!this.hospitalId) return;

    this.hospitalsService.getHospitalProviders(this.hospitalId).subscribe({
      next: (providers) => {
        this.dataSource.data = providers;
      },
      error: (error) => {
        this.snackBar.open('Error loading providers', 'Close', { duration: 3000 });
      }
    });
  }

  addProvider(): void {
    // TODO: Implement add provider dialog
  }

  viewProvider(provider: any): void {
    this.router.navigate(['/providers', provider.id]);
  }

  removeProvider(provider: any): void {
    if (!this.hospitalId) return;

    if (confirm(`Are you sure you want to remove ${provider.name.first} ${provider.name.last} from this hospital?`)) {
      this.hospitalsService.removeProvider(this.hospitalId, provider.id).subscribe({
        next: () => {
          this.loadProviders(this.searchControl.value || '');
          this.snackBar.open('Provider removed successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open('Error removing provider', 'Close', { duration: 3000 });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/hospitals', this.hospitalId]);
  }
} 