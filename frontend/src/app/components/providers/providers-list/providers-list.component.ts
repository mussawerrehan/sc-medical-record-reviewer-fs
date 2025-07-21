import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProvidersService } from '../../../services/providers.service';
import { Provider, Specialty } from '../../../models';

@Component({
  selector: 'app-providers-list',
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
    MatSelectModule,
    MatMenuModule,
    MatCardModule,
    MatChipsModule
  ],
  template: `
    <div class="providers-list-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Providers</mat-card-title>
          <div class="header-actions">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search Providers</mat-label>
              <input matInput [formControl]="searchControl" placeholder="Search by name, NPI, or specialty">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Specialty</mat-label>
              <mat-select [formControl]="specialtyControl">
                <mat-option>All</mat-option>
                <mat-option *ngFor="let specialty of specialties" [value]="specialty">
                  {{ specialty }}
                </mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="createProvider()">
              <mat-icon>add</mat-icon>
              New Provider
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

            <!-- Hospitals Column -->
            <ng-container matColumnDef="hospitals">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Hospitals</th>
              <td mat-cell *matCellDef="let provider">
                {{ provider.hospitalIds.length }}
              </td>
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
                  <button mat-menu-item (click)="editProvider(provider)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="manageHospitals(provider)">
                    <mat-icon>local_hospital</mat-icon>
                    <span>Manage Hospitals</span>
                  </button>
                  <button mat-menu-item (click)="toggleStatus(provider)">
                    <mat-icon>{{ provider.isActive ? 'block' : 'check_circle' }}</mat-icon>
                    <span>{{ provider.isActive ? 'Deactivate' : 'Activate' }}</span>
                  </button>
                  <button mat-menu-item (click)="deleteProvider(provider)">
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
    .providers-list-container {
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
export class ProvidersListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'npi', 'specialty', 'hospitals', 'status', 'actions'];
  dataSource = new MatTableDataSource<Provider>();
  searchControl = new FormControl('');
  specialtyControl = new FormControl<Specialty | null>(null);
  specialties: Specialty[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private providersService: ProvidersService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSpecialties();
    this.setupSearch();
    this.loadProviders();
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
      this.loadProviders();
    });

    this.specialtyControl.valueChanges.subscribe(() => {
      this.loadProviders();
    });
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

  loadProviders(): void {
    this.providersService.getProviders(
      this.paginator?.pageIndex || 0,
      this.paginator?.pageSize || 10,
      this.searchControl.value || '',
      this.specialtyControl.value || undefined
    ).subscribe({
      next: (response) => {
        this.dataSource.data = response.providers;
      },
      error: (error) => {
        this.snackBar.open('Error loading providers', 'Close', { duration: 3000 });
      }
    });
  }

  createProvider(): void {
    this.router.navigate(['/providers/new']);
  }

  viewProvider(provider: Provider): void {
    this.router.navigate(['/providers', provider.id]);
  }

  editProvider(provider: Provider): void {
    this.router.navigate(['/providers', provider.id, 'edit']);
  }

  manageHospitals(provider: Provider): void {
    this.router.navigate(['/providers', provider.id, 'hospitals']);
  }

  toggleStatus(provider: Provider): void {
    const updateData = {
      isActive: !provider.isActive
    };

    this.providersService.updateProvider(provider.id, updateData).subscribe({
      next: () => {
        this.loadProviders();
        this.snackBar.open(
          `Provider ${provider.isActive ? 'deactivated' : 'activated'} successfully`,
          'Close',
          { duration: 3000 }
        );
      },
      error: (error) => {
        this.snackBar.open('Error updating provider status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteProvider(provider: Provider): void {
    if (confirm(`Are you sure you want to delete ${provider.name.first} ${provider.name.last}?`)) {
      this.providersService.deleteProvider(provider.id).subscribe({
        next: () => {
          this.loadProviders();
          this.snackBar.open('Provider deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open('Error deleting provider', 'Close', { duration: 3000 });
        }
      });
    }
  }
} 