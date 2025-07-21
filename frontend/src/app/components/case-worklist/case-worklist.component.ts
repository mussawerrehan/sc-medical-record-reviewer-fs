import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CasesService, Case, CaseFilters } from '../../services/cases.service';
import { CaseDetailsComponent } from '../case-details/case-details.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-case-worklist',
  standalone: true,
  imports: [CommonModule, FormsModule, CaseDetailsComponent],
  template: `
    <!-- Case Details View -->
    <app-case-details 
      *ngIf="selectedCaseId" 
      [caseId]="selectedCaseId"
      (back)="closeDetails()">
    </app-case-details>

    <!-- Case List View -->
    <div *ngIf="!selectedCaseId" class="p-6 space-y-6">
      <!-- Header and Search -->
      <div class="flex flex-col lg:flex-row gap-4 justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-foreground" style="color: #1a202c;">Case Review Worklist</h1>
          <p class="text-muted-foreground" style="color: #718096;">
            {{ filteredCases.length }} cases requiring review
          </p>
        </div>
        
        <div class="flex gap-2">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #718096;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              type="text"
              placeholder="Search by patient, MRN, or diagnosis..."
              [(ngModel)]="searchTerm"
              (input)="filterCases()"
              class="pl-10 pr-4 py-2 border border-border bg-content-bg rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent w-80"
              style="background-color: #ffffff; border-color: #e2e8f0;"
            />
          </div>
          <button
            (click)="toggleFilters()"
            class="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
            style="border-color: #e2e8f0;"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
            Filters
          </button>
        </div>
      </div>

      <!-- Filters Panel -->
      <div *ngIf="showFilters" class="bg-content-bg border border-border rounded-lg p-6" style="background-color: #ffffff; border-color: #e2e8f0;">
        <h3 class="text-lg font-medium text-foreground mb-4" style="color: #1a202c;">Filter Cases</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground" style="color: #1a202c;">Priority</label>
            <select 
              [(ngModel)]="priorityFilter" 
              (change)="filterCases()"
              class="w-full px-3 py-2 border border-border bg-content-bg rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
              style="background-color: #ffffff; border-color: #e2e8f0;"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground" style="color: #1a202c;">Status</label>
            <select 
              [(ngModel)]="statusFilter" 
              (change)="filterCases()"
              class="w-full px-3 py-2 border border-border bg-content-bg rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
              style="background-color: #ffffff; border-color: #e2e8f0;"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="query-sent">Query Sent</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground" style="color: #1a202c;">Unit</label>
            <select 
              [(ngModel)]="unitFilter" 
              (change)="filterCases()"
              class="w-full px-3 py-2 border border-border bg-content-bg rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
              style="background-color: #ffffff; border-color: #e2e8f0;"
            >
              <option value="all">All Units</option>
              <option value="icu">ICU</option>
              <option value="medicine">Medicine</option>
              <option value="cardiology">Cardiology</option>
              <option value="pulmonology">Pulmonology</option>
              <option value="neurology">Neurology</option>
              <option value="endocrinology">Endocrinology</option>
            </select>
          </div>

          <div class="flex items-end">
            <button
              (click)="clearFilters()"
              class="w-full px-4 py-2 border border-border rounded-md text-sm hover:bg-muted transition-colors"
              style="border-color: #e2e8f0;"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Cases Table -->
      <div class="bg-content-bg border border-border rounded-lg overflow-hidden" style="background-color: #ffffff; border-color: #e2e8f0;">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-muted border-b border-border" style="background-color: #f7fafc; border-color: #e2e8f0;">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-foreground" style="color: #1a202c;">Patient</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-foreground" style="color: #1a202c;">Admit Date / LOS</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-foreground" style="color: #1a202c;">Primary Diagnosis</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-foreground" style="color: #1a202c;">DRG Impact</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-foreground" style="color: #1a202c;">Issues</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-foreground" style="color: #1a202c;">Priority</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-foreground" style="color: #1a202c;">Status</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-foreground" style="color: #1a202c;">Assigned To</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-foreground" style="color: #1a202c;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                *ngFor="let case of filteredCases" 
                class="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                style="border-color: #e2e8f0;"
                (click)="viewCase(case.id)"
              >
                                  <td class="px-4 py-4">
                    <div>
                      <div class="font-medium text-foreground" style="color: #1a202c;">{{ case.patientName }}</div>
                      <div class="text-sm text-muted-foreground" style="color: #718096;">
                        {{ case.age }}/{{ case.sex }} • MRN: {{ case.mrn }}
                      </div>
                    </div>
                  </td>
                
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #718096;">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <div>
                      <div class="text-sm text-foreground" style="color: #1a202c;">{{ case.admitDate }}</div>
                      <div class="text-xs text-muted-foreground" style="color: #718096;">
                        {{ case.lengthOfStay }} days
                      </div>
                    </div>
                  </div>
                </td>
                
                <td class="px-4 py-4">
                  <div>
                    <div class="text-sm text-foreground" style="color: #1a202c;">{{ case.primaryDiagnosis }}</div>
                    <div class="text-xs text-muted-foreground" style="color: #718096;">
                      {{ case.unit }}
                    </div>
                  </div>
                </td>
                
                <td class="px-4 py-4">
                  <div>
                    <div class="text-sm text-foreground" style="color: #1a202c;">
                      {{ case.currentDrg }} → {{ case.suggestedDrg }}
                    </div>
                                         <div class="text-sm font-medium text-medical-secondary" style="color: #38a169;">
                       {{ case.formattedImpact || ('+$' + (case.financialImpact || 0).toLocaleString()) }}
                     </div>
                  </div>
                </td>
                
                <td class="px-4 py-4">
                  <div class="space-y-1">
                    <div *ngFor="let flag of case.flags" class="flex items-center gap-2 text-xs">
                      <div [ngSwitch]="flag.type">
                        <svg *ngSwitchCase="'clinical'" class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <svg *ngSwitchCase="'coding'" class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                        </svg>
                        <svg *ngSwitchCase="'compliance'" class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                      </div>
                      <span [class]="getFlagSeverityClass(flag.severity)">
                        {{ flag.text }}
                      </span>
                    </div>
                  </div>
                </td>
                
                <td class="px-4 py-4">
                  <span [class]="getPriorityBadgeClass(case.priority)">{{ case.priority }}</span>
                </td>
                
                <td class="px-4 py-4">
                  <span [class]="getStatusBadgeClass(case.status)">{{ case.status }}</span>
                </td>
                
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #718096;">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span class="text-sm text-foreground" style="color: #1a202c;">{{ case.assignedTo }}</span>
                  </div>
                </td>
                
                <td class="px-4 py-4">
                  <button
                    (click)="viewCase(case.id); $event.stopPropagation()"
                    class="p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between">
        <div class="text-sm text-muted-foreground" style="color: #718096;">
          Showing {{ filteredCases.length }} of {{ allCases.length }} cases
        </div>
        <div class="flex items-center gap-2">
          <button class="flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm bg-muted cursor-not-allowed" disabled style="border-color: #e2e8f0; background-color: #f7fafc;">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Previous
          </button>
          <button class="flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm hover:bg-muted transition-colors" style="border-color: #e2e8f0;">
            Next
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
    .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
    .space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; }
    .space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .w-80 { width: 20rem; }
    .w-4 { width: 1rem; }
    .h-4 { height: 1rem; }
    .p-2 { padding: 0.5rem; }
    .p-4 { padding: 1rem; }
    .p-6 { padding: 1.5rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .pl-10 { padding-left: 2.5rem; }
    .pr-4 { padding-right: 1rem; }
    .mb-4 { margin-bottom: 1rem; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-md { border-radius: 0.375rem; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .font-medium { font-weight: 500; }
    .font-semibold { font-weight: 600; }
    .overflow-hidden { overflow: hidden; }
    .overflow-x-auto { overflow-x: auto; }
    .cursor-pointer { cursor: pointer; }
    .cursor-not-allowed { cursor: not-allowed; }
    .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; }
    
    @media (min-width: 768px) {
      .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    }
    
    @media (min-width: 1024px) {
      .lg\\:flex-row { flex-direction: row; }
    }
  `]
})
export class CaseWorklistComponent implements OnInit, OnDestroy {
  searchTerm = '';
  priorityFilter = 'all';
  statusFilter = 'all';
  unitFilter = 'all';
  showFilters = false;
  filteredCases: Case[] = [];
  allCases: Case[] = [];
  selectedCaseId: string | null = null;
  loading = false;
  pagination = {
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0
  };
  
  private subscriptions = new Subscription();

  constructor(private casesService: CasesService) {}



  ngOnInit() {
    this.loadCases();
    
    // Subscribe to cases$ observable
    this.subscriptions.add(
      this.casesService.cases$.subscribe(cases => {
        this.allCases = cases;
        this.filterCases();
      })
    );

    // Subscribe to loading$ observable
    this.subscriptions.add(
      this.casesService.loading$.subscribe(loading => {
        this.loading = loading;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadCases() {
    const filters: CaseFilters = {
      page: this.pagination.page,
      limit: this.pagination.limit,
      search: this.searchTerm || undefined,
      priority: this.priorityFilter !== 'all' ? this.priorityFilter : undefined,
      status: this.statusFilter !== 'all' ? this.statusFilter : undefined,
      unit: this.unitFilter !== 'all' ? this.unitFilter : undefined
    };

    this.casesService.getCases(filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.pagination = response.data.pagination;
        }
      },
      error: (error) => {
        console.error('Error loading cases:', error);
        // Use empty array as fallback
        this.allCases = [];
        this.filteredCases = [];
      }
    });
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  filterCases() {
    if (this.allCases.length === 0) {
      this.filteredCases = [];
      return;
    }

    this.filteredCases = this.allCases.filter(case_item => {
      const matchesSearch = case_item.patientName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           case_item.mrn.includes(this.searchTerm) ||
                           case_item.primaryDiagnosis.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesPriority = this.priorityFilter === 'all' || case_item.priority.toLowerCase() === this.priorityFilter;
      const matchesStatus = this.statusFilter === 'all' || case_item.status.toLowerCase().replace(' ', '-') === this.statusFilter;
      const matchesUnit = this.unitFilter === 'all' || case_item.unit.toLowerCase() === this.unitFilter;

      return matchesSearch && matchesPriority && matchesStatus && matchesUnit;
    });
  }

  clearFilters() {
    this.priorityFilter = 'all';
    this.statusFilter = 'all';
    this.unitFilter = 'all';
    this.searchTerm = '';
    this.filteredCases = [...this.allCases];
  }

  viewCase(caseId: string) {
    this.selectedCaseId = caseId;
  }

  closeDetails() {
    this.selectedCaseId = null;
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'High':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800';
      case 'Medium':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
      default:
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'New':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800';
      case 'Query Sent':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800';
      case 'Completed':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800';
      default:
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
    }
  }

  getFlagSeverityClass(severity: string): string {
    switch (severity) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  }
} 