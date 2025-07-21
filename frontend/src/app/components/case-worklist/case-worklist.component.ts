import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CaseFlag {
  type: 'clinical' | 'coding' | 'compliance';
  text: string;
  severity: 'high' | 'medium' | 'low';
}

interface CaseItem {
  id: string;
  patient: string;
  mrn: string;
  age: number;
  sex: string;
  admitDate: string;
  los: number;
  primaryDiagnosis: string;
  currentDrg: string;
  suggestedDrg: string;
  flags: CaseFlag[];
  priority: 'High' | 'Medium' | 'Low';
  impact: string;
  assignedTo: string;
  status: 'New' | 'In Progress' | 'Query Sent' | 'Resolved';
  unit: string;
}

@Component({
  selector: 'app-case-worklist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Case Worklist</h1>
          <p class="text-muted-foreground mt-1">Review cases requiring documentation improvement</p>
        </div>
        <div class="flex items-center gap-3">
          <button 
            class="flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm hover:bg-muted"
            (click)="toggleFilters()"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
            Filters
          </button>
          <button class="flex items-center gap-2 px-4 py-2 bg-medical-primary text-white rounded-md hover:bg-medical-primary/90">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            New Case
          </button>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="medical-card p-4">
        <div class="flex items-center gap-4 mb-4">
          <div class="flex-1 relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              type="text"
              placeholder="Search by patient name, MRN, or diagnosis..."
              [(ngModel)]="searchTerm"
              class="pl-10 pr-4 py-2 w-full border border-border bg-input-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">{{ filteredCases.length }} cases</span>
          </div>
        </div>

        <!-- Filters Row -->
        <div *ngIf="showFilters" class="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Priority</label>
            <select [(ngModel)]="priorityFilter" class="w-full px-3 py-2 border border-border rounded-md text-sm bg-card">
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Status</label>
            <select [(ngModel)]="statusFilter" class="w-full px-3 py-2 border border-border rounded-md text-sm bg-card">
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Query Sent">Query Sent</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Unit</label>
            <select [(ngModel)]="unitFilter" class="w-full px-3 py-2 border border-border rounded-md text-sm bg-card">
              <option value="all">All Units</option>
              <option value="ICU">ICU</option>
              <option value="Medicine">Medicine</option>
              <option value="Surgery">Surgery</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
          <div class="flex items-end">
            <button 
              class="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted"
              (click)="clearFilters()"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Cases Table -->
      <div class="medical-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-muted">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Patient</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Diagnosis</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">DRG Info</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Flags</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Impact</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr *ngFor="let case of filteredCases" class="hover:bg-muted/50">
                <td class="px-4 py-4">
                  <div>
                    <div class="text-sm font-medium text-foreground">{{ case.patient }}</div>
                    <div class="text-xs text-muted-foreground">MRN: {{ case.mrn }}</div>
                    <div class="text-xs text-muted-foreground">{{ case.age }}{{ case.sex }} • LOS: {{ case.los }}d</div>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="text-sm text-foreground">{{ case.primaryDiagnosis }}</div>
                  <div class="text-xs text-muted-foreground">Admit: {{ formatDate(case.admitDate) }}</div>
                  <div class="text-xs text-muted-foreground">{{ case.unit }}</div>
                </td>
                <td class="px-4 py-4">
                  <div class="text-xs">
                    <div class="text-muted-foreground">Current: <span class="font-medium">{{ case.currentDrg }}</span></div>
                    <div class="text-medical-secondary">Suggested: <span class="font-medium">{{ case.suggestedDrg }}</span></div>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="space-y-1">
                    <div *ngFor="let flag of case.flags" 
                         [class]="'inline-flex items-center px-2 py-1 rounded-full text-xs ' + getFlagClass(flag.severity)">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path [attr.d]="getFlagIcon(flag.type)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                      </svg>
                      {{ flag.text }}
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <span [class]="'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ' + getPriorityClass(case.priority)">
                    {{ case.priority }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <div class="text-sm font-medium text-medical-secondary">{{ case.impact }}</div>
                </td>
                <td class="px-4 py-4">
                  <span [class]="'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ' + getStatusClass(case.status)">
                    {{ case.status }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <button 
                    class="inline-flex items-center px-3 py-1 text-xs bg-medical-primary text-white rounded-md hover:bg-medical-primary/90"
                    (click)="viewCase(case.id)"
                  >
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    Review
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between">
        <div class="text-sm text-muted-foreground">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ getEndIndex() }} of {{ filteredCases.length }} cases
        </div>
        <div class="flex items-center gap-2">
          <button 
            class="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-50"
            [disabled]="currentPage === 1"
            (click)="previousPage()"
          >
            Previous
          </button>
          <span class="text-sm text-muted-foreground">Page {{ currentPage }} of {{ totalPages }}</span>
          <button 
            class="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-50"
            [disabled]="currentPage === totalPages"
            (click)="nextPage()"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
    .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
    .space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .divide-y > :not([hidden]) ~ :not([hidden]) { border-top-width: 1px; }
    .divide-border > :not([hidden]) ~ :not([hidden]) { border-color: var(--border); }
    @media (min-width: 768px) {
      .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    }
  `]
})
export class CaseWorklistComponent implements OnInit {
  searchTerm = '';
  priorityFilter = 'all';
  statusFilter = 'all';
  unitFilter = 'all';
  showFilters = false;
  currentPage = 1;
  pageSize = 10;

  cases: CaseItem[] = [
    {
      id: 'MR-2024-001234',
      patient: 'Sarah Martinez',
      mrn: '123456789',
      age: 67,
      sex: 'F',
      admitDate: '2024-07-05',
      los: 3,
      primaryDiagnosis: 'Pneumonia with Sepsis',
      currentDrg: 'DRG 871',
      suggestedDrg: 'DRG 870',
      flags: [
        { type: 'clinical', text: 'Sepsis criteria not documented', severity: 'high' },
        { type: 'coding', text: 'MCC coding opportunity', severity: 'high' }
      ],
      priority: 'High',
      impact: '+$2,400',
      assignedTo: 'Dr. Johnson',
      status: 'New',
      unit: 'ICU'
    },
    {
      id: 'MR-2024-001235',
      patient: 'Robert Chen',
      mrn: '123456790',
      age: 72,
      sex: 'M',
      admitDate: '2024-07-04',
      los: 4,
      primaryDiagnosis: 'Acute Kidney Injury',
      currentDrg: 'DRG 682',
      suggestedDrg: 'DRG 681',
      flags: [
        { type: 'clinical', text: 'AKI severity not specified', severity: 'high' },
        { type: 'compliance', text: 'POA indicator missing', severity: 'medium' }
      ],
      priority: 'High',
      impact: '+$1,800',
      assignedTo: 'Dr. Johnson',
      status: 'In Progress',
      unit: 'Medicine'
    },
    {
      id: 'MR-2024-001236',
      patient: 'Maria Rodriguez',
      mrn: '123456791',
      age: 58,
      sex: 'F',
      admitDate: '2024-07-06',
      los: 2,
      primaryDiagnosis: 'Heart Failure',
      currentDrg: 'DRG 293',
      suggestedDrg: 'DRG 291',
      flags: [
        { type: 'clinical', text: 'Ejection fraction not documented', severity: 'medium' }
      ],
      priority: 'Medium',
      impact: '+$1,200',
      assignedTo: 'Dr. Smith',
      status: 'Query Sent',
      unit: 'Medicine'
    }
  ];

  ngOnInit() {}

  get filteredCases(): CaseItem[] {
    let filtered = this.cases;

    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(c => 
        c.patient.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        c.mrn.includes(this.searchTerm) ||
        c.primaryDiagnosis.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Priority filter
    if (this.priorityFilter !== 'all') {
      filtered = filtered.filter(c => c.priority === this.priorityFilter);
    }

    // Status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === this.statusFilter);
    }

    // Unit filter
    if (this.unitFilter !== 'all') {
      filtered = filtered.filter(c => c.unit === this.unitFilter);
    }

    return filtered;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCases.length / this.pageSize);
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredCases.length);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.priorityFilter = 'all';
    this.statusFilter = 'all';
    this.unitFilter = 'all';
    this.searchTerm = '';
  }

  viewCase(caseId: string): void {
    console.log('Viewing case:', caseId);
    // Navigate to case review
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'High': return 'bg-medical-error text-white';
      case 'Medium': return 'bg-medical-warning text-white';
      case 'Low': return 'bg-medical-info text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'New': return 'bg-medical-info text-white';
      case 'In Progress': return 'bg-medical-warning text-white';
      case 'Query Sent': return 'bg-medical-secondary text-white';
      case 'Resolved': return 'bg-medical-success text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  }

  getFlagClass(severity: string): string {
    switch (severity) {
      case 'high': return 'bg-medical-error-light text-medical-error';
      case 'medium': return 'bg-medical-warning-light text-medical-warning';
      case 'low': return 'bg-medical-info-light text-medical-info';
      default: return 'bg-muted text-muted-foreground';
    }
  }

  getFlagIcon(type: string): string {
    switch (type) {
      case 'clinical': return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
      case 'coding': return 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z';
      case 'compliance': return 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z';
      default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
} 