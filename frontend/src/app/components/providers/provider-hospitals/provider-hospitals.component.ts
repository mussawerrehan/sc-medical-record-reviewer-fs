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
import { ProvidersService } from '../../../services/providers.service';
import { Provider } from '../../../models';

@Component({
  selector: 'app-provider-hospitals',
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
    <div class="provider-hospitals-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            Manage Hospitals - {{ getProviderName() }}
          </mat-card-title>
          <div class="header-actions">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search Hospitals</mat-label>
              <input matInput [formControl]="searchControl" placeholder="Search by name, NPI, or location">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="addHospital()">
              <mat-icon>add</mat-icon>
              Add Hospital
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
                  <button mat-menu-item (click)="removeHospital(hospital)">
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
    .provider-hospitals-container {
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
export class ProviderHospitalsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'npi', 'location', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>();
  searchControl = new FormControl('');
  provider?: Provider;
  providerId?: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private providersService: ProvidersService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.providerId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.providerId) {
      this.loadProvider();
      this.setupSearch();
      this.loadHospitals();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getProviderName(): string {
    if (!this.provider) return 'Loading...';
    return `${this.provider.name.first} ${this.provider.name.last}`;
  }

  setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.loadHospitals(value || '');
    });
  }

  loadProvider(): void {
    if (!this.providerId) return;

    this.providersService.getProviderById(this.providerId).subscribe({
      next: (provider) => {
        this.provider = provider;
      },
      error: (error) => {
        this.snackBar.open('Error loading provider', 'Close', { duration: 3000 });
        this.router.navigate(['/providers']);
      }
    });
  }

  loadHospitals(searchTerm?: string): void {
    if (!this.providerId) return;

    this.providersService.getProviderHospitals(this.providerId).subscribe({
      next: (hospitals) => {
        this.dataSource.data = hospitals;
      },
      error: (error) => {
        this.snackBar.open('Error loading hospitals', 'Close', { duration: 3000 });
      }
    });
  }

  addHospital(): void {
    // TODO: Implement add hospital dialog
  }

  viewHospital(hospital: any): void {
    this.router.navigate(['/hospitals', hospital.id]);
  }

  removeHospital(hospital: any): void {
    if (!this.providerId) return;

    if (confirm(`Are you sure you want to remove ${hospital.name} from this provider?`)) {
      this.providersService.removeHospital(this.providerId, hospital.id).subscribe({
        next: () => {
          this.loadHospitals(this.searchControl.value || '');
          this.snackBar.open('Hospital removed successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open('Error removing hospital', 'Close', { duration: 3000 });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/providers', this.providerId]);
  }
} 