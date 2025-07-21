import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HospitalsService } from '../../../services/hospitals.service';
import { Hospital } from '../../../models';

@Component({
  selector: 'app-hospitals-list',
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
    MatChipsModule
  ],
  template: `
    <div class="hospitals-list-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Hospitals</mat-card-title>
          <div class="header-actions">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search Hospitals</mat-label>
              <input matInput [formControl]="searchControl" placeholder="Search by name, NPI, or location">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="createHospital()">
              <mat-icon>add</mat-icon>
              New Hospital
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <table mat-table [dataSource]="dataSource" matSort>
            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
              <td mat-cell *matCellDef="let hospital">{{ hospital.name }}</td>
            </ng-container>

            <!-- NPI Column -->
            <ng-container matColumnDef="npi">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>NPI</th>
              <td mat-cell *matCellDef="let hospital">{{ hospital.npi }}</td>
            </ng-container>

            <!-- Location Column -->
            <ng-container matColumnDef="location">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Location</th>
              <td mat-cell *matCellDef="let hospital">
                {{ hospital.address.city }}, {{ hospital.address.state }}
              </td>
            </ng-container>

            <!-- Providers Column -->
            <ng-container matColumnDef="providers">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Providers</th>
              <td mat-cell *matCellDef="let hospital">
                {{ hospital.providerIds.length }}
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let hospital">
                <mat-chip [color]="hospital.isActive ? 'accent' : 'warn'">
                  {{ hospital.isActive ? 'Active' : 'Inactive' }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let hospital">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="viewHospital(hospital)">
                    <mat-icon>visibility</mat-icon>
                    <span>View</span>
                  </button>
                  <button mat-menu-item (click)="editHospital(hospital)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="manageProviders(hospital)">
                    <mat-icon>people</mat-icon>
                    <span>Manage Providers</span>
                  </button>
                  <button mat-menu-item (click)="toggleStatus(hospital)">
                    <mat-icon>{{ hospital.isActive ? 'block' : 'check_circle' }}</mat-icon>
                    <span>{{ hospital.isActive ? 'Deactivate' : 'Activate' }}</span>
                  </button>
                  <button mat-menu-item (click)="deleteHospital(hospital)">
                    <mat-icon>delete</mat-icon>
                    <span>Delete</span>
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
    .hospitals-list-container {
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
  `]
})
export class HospitalsListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'npi', 'location', 'providers', 'status', 'actions'];
  dataSource = new MatTableDataSource<Hospital>();
  searchControl = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private hospitalsService: HospitalsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.setupSearch();
    this.loadHospitals();
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
      this.loadHospitals(value || '');
    });
  }

  loadHospitals(searchTerm?: string): void {
    this.hospitalsService.getHospitals(
      this.paginator?.pageIndex || 0,
      this.paginator?.pageSize || 10,
      searchTerm
    ).subscribe({
      next: response => {
        this.dataSource.data = response.hospitals;
      },
      error: error => {
        this.snackBar.open('Error loading hospitals', 'Close', { duration: 3000 });
      }
    });
  }

  createHospital(): void {
    this.router.navigate(['/hospitals/new']);
  }

  viewHospital(hospital: Hospital): void {
    this.router.navigate(['/hospitals', hospital.id]);
  }

  editHospital(hospital: Hospital): void {
    this.router.navigate(['/hospitals', hospital.id, 'edit']);
  }

  manageProviders(hospital: Hospital): void {
    this.router.navigate(['/hospitals', hospital.id, 'providers']);
  }

  toggleStatus(hospital: Hospital): void {
    const updateData = {
      isActive: !hospital.isActive
    };

    this.hospitalsService.updateHospital(hospital.id, updateData).subscribe({
      next: () => {
        this.loadHospitals(this.searchControl.value || '');
        this.snackBar.open(
          `Hospital ${hospital.isActive ? 'deactivated' : 'activated'} successfully`,
          'Close',
          { duration: 3000 }
        );
      },
      error: error => {
        this.snackBar.open('Error updating hospital status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteHospital(hospital: Hospital): void {
    if (confirm(`Are you sure you want to delete ${hospital.name}?`)) {
      this.hospitalsService.deleteHospital(hospital.id).subscribe({
        next: () => {
          this.loadHospitals(this.searchControl.value || '');
          this.snackBar.open('Hospital deleted successfully', 'Close', { duration: 3000 });
        },
        error: error => {
          this.snackBar.open('Error deleting hospital', 'Close', { duration: 3000 });
        }
      });
    }
  }
} 