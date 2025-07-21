import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CasesService, Case, CaseFlag, CaseQuery } from '../../services/cases.service';

@Component({
  selector: 'app-case-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-content-bg min-h-screen" style="background-color: #fafbfc;">
      <!-- Header -->
      <div class="bg-nav-bg border-b border-nav-border px-6 py-4" style="background-color: #ffffff; border-color: #e2e8f0;">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button 
              (click)="goBack()"
              class="p-2 hover:bg-muted rounded-md transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div>
              <h1 class="text-2xl font-semibold text-foreground" style="color: #1a202c;">
                {{ selectedCase?.caseNumber || 'Case Details' }}
              </h1>
              <p class="text-sm text-muted-foreground" style="color: #718096;">
                {{ selectedCase?.patientName }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span [class]="'px-3 py-1 rounded-full text-sm font-medium ' + getPriorityBadgeClass(selectedCase?.priority || '')">
              {{ selectedCase?.priority }}
            </span>
            <span [class]="'px-3 py-1 rounded-full text-sm font-medium ' + getStatusBadgeClass(selectedCase?.status || '')">
              {{ selectedCase?.status }}
            </span>
            <button 
              (click)="toggleEditMode()"
              [class]="'px-4 py-2 rounded-md text-sm font-medium transition-colors ' + (isEditing ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-medical-primary text-white hover:bg-medical-primary/90')"
              [style]="isEditing ? '' : 'background-color: #2b6cb0;'"
            >
              {{ isEditing ? 'Cancel' : 'Edit Case' }}
            </button>
            <button 
              *ngIf="isEditing"
              (click)="saveCase()"
              [disabled]="caseForm.invalid || saving"
              class="px-4 py-2 bg-medical-secondary text-white rounded-md text-sm font-medium hover:bg-medical-secondary/90 disabled:opacity-50"
              style="background-color: #38a169;"
            >
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>

      <div class="p-6 space-y-6" *ngIf="selectedCase">
        <!-- Case Information Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Patient Information -->
          <div class="bg-content-bg border border-border rounded-lg p-6" style="background-color: #ffffff; border-color: #e2e8f0;">
            <h3 class="text-lg font-semibold text-foreground mb-4" style="color: #1a202c;">Patient Information</h3>
            <form [formGroup]="caseForm" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Patient Name</label>
                <input
                  type="text"
                  formControlName="patientName"
                  [readonly]="!isEditing"
                  class="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  [class.bg-muted]="!isEditing"
                  style="border-color: #e2e8f0;"
                />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Age</label>
                  <input
                    type="number"
                    formControlName="age"
                    [readonly]="!isEditing"
                    class="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                    [class.bg-muted]="!isEditing"
                    style="border-color: #e2e8f0;"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Sex</label>
                  <select
                    formControlName="sex"
                    [disabled]="!isEditing"
                    class="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                    [class.bg-muted]="!isEditing"
                    style="border-color: #e2e8f0;"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1" style="color: #1a202c;">MRN</label>
                <input
                  type="text"
                  formControlName="mrn"
                  [readonly]="!isEditing"
                  class="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  [class.bg-muted]="!isEditing"
                  style="border-color: #e2e8f0;"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Unit</label>
                <input
                  type="text"
                  formControlName="unit"
                  [readonly]="!isEditing"
                  class="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  [class.bg-muted]="!isEditing"
                  style="border-color: #e2e8f0;"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Room</label>
                <input
                  type="text"
                  formControlName="room"
                  [readonly]="!isEditing"
                  class="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  [class.bg-muted]="!isEditing"
                  style="border-color: #e2e8f0;"
                />
              </div>
            </form>
          </div>

          <!-- Clinical Information -->
          <div class="bg-content-bg border border-border rounded-lg p-6" style="background-color: #ffffff; border-color: #e2e8f0;">
            <h3 class="text-lg font-semibold text-foreground mb-4" style="color: #1a202c;">Clinical Information</h3>
            <form [formGroup]="caseForm" class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Admit Date</label>
                  <input
                    type="date"
                    formControlName="admitDate"
                    [readonly]="!isEditing"
                    class="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                    [class.bg-muted]="!isEditing"
                    style="border-color: #e2e8f0;"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Length of Stay</label>
                  <input
                    type="number"
                    formControlName="lengthOfStay"
                    [readonly]="!isEditing"
                    class="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                    [class.bg-muted]="!isEditing"
                    style="border-color: #e2e8f0;"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Primary Diagnosis</label>
                <textarea
                  formControlName="primaryDiagnosis"
                  [readonly]="!isEditing"
                  rows="3"
                  class="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  [class.bg-muted]="!isEditing"
                  style="border-color: #e2e8f0;"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Attending Physician</label>
                <input
                  type="text"
                  formControlName="attendingPhysician"
                  [readonly]="!isEditing"
                  class="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  [class.bg-muted]="!isEditing"
                  style="border-color: #e2e8f0;"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Assigned To</label>
                <input
                  type="text"
                  formControlName="assignedTo"
                  [readonly]="!isEditing"
                  class="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  [class.bg-muted]="!isEditing"
                  style="border-color: #e2e8f0;"
                />
              </div>
            </form>
          </div>

          <!-- DRG Information -->
          <div class="bg-content-bg border border-border rounded-lg p-6" style="background-color: #ffffff; border-color: #e2e8f0;">
            <h3 class="text-lg font-semibold text-foreground mb-4" style="color: #1a202c;">DRG Information</h3>
            <form [formGroup]="caseForm" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Current DRG</label>
                <input
                  type="text"
                  formControlName="currentDrg"
                  [readonly]="!isEditing"
                  class="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  [class.bg-muted]="!isEditing"
                  style="border-color: #e2e8f0;"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Suggested DRG</label>
                <input
                  type="text"
                  formControlName="suggestedDrg"
                  [readonly]="!isEditing"
                  class="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  [class.bg-muted]="!isEditing"
                  style="border-color: #e2e8f0;"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Financial Impact</label>
                <input
                  type="number"
                  step="0.01"
                  formControlName="financialImpact"
                  [readonly]="!isEditing"
                  class="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  [class.bg-muted]="!isEditing"
                  style="border-color: #e2e8f0;"
                />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Priority</label>
                  <select
                    formControlName="priority"
                    [disabled]="!isEditing"
                    class="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                    [class.bg-muted]="!isEditing"
                    style="border-color: #e2e8f0;"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Status</label>
                  <select
                    formControlName="status"
                    [disabled]="!isEditing"
                    class="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                    [class.bg-muted]="!isEditing"
                    style="border-color: #e2e8f0;"
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Query Sent">Query Sent</option>
                    <option value="Physician Response">Physician Response</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Flags Section -->
        <div class="bg-content-bg border border-border rounded-lg p-6" style="background-color: #ffffff; border-color: #e2e8f0;">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-foreground" style="color: #1a202c;">Flags & Issues</h3>
            <button 
              (click)="showAddFlag = true"
              class="px-3 py-1 bg-medical-primary text-white rounded-md text-sm hover:bg-medical-primary/90"
              style="background-color: #2b6cb0;"
            >
              Add Flag
            </button>
          </div>
          
          <div class="space-y-3">
            <div 
              *ngFor="let flag of selectedCase.flags" 
              class="flex items-center justify-between p-3 border border-border rounded-md"
              style="border-color: #e2e8f0;"
            >
              <div class="flex items-center gap-3">
                <div [ngSwitch]="flag.type" class="flex-shrink-0">
                  <svg *ngSwitchCase="'clinical'" class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <svg *ngSwitchCase="'coding'" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                  <svg *ngSwitchCase="'compliance'" class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <div>
                  <div class="text-sm font-medium text-foreground" style="color: #1a202c;">{{ flag.text }}</div>
                  <div class="text-xs text-muted-foreground" style="color: #718096;">
                    {{ flag.type | titlecase }} • {{ flag.severity | titlecase }} • {{ flag.createdBy }}
                  </div>
                </div>
              </div>
              <button 
                (click)="removeFlag(flag.id)"
                class="p-1 hover:bg-red-50 text-red-500 rounded"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div *ngIf="selectedCase.flags.length === 0" class="text-center py-8 text-muted-foreground" style="color: #718096;">
              No flags found for this case
            </div>
          </div>
        </div>

        <!-- Notes Section -->
        <div class="bg-content-bg border border-border rounded-lg p-6" style="background-color: #ffffff; border-color: #e2e8f0;">
          <h3 class="text-lg font-semibold text-foreground mb-4" style="color: #1a202c;">Notes</h3>
          <form [formGroup]="caseForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Case Notes</label>
              <textarea
                formControlName="notes"
                [readonly]="!isEditing"
                rows="4"
                class="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                [class.bg-muted]="!isEditing"
                style="border-color: #e2e8f0;"
                placeholder="Enter case notes..."
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-1" style="color: #1a202c;">Review Notes</label>
              <textarea
                formControlName="reviewNotes"
                [readonly]="!isEditing"
                rows="3"
                class="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                [class.bg-muted]="!isEditing"
                style="border-color: #e2e8f0;"
                placeholder="Enter review notes..."
              ></textarea>
            </div>
          </form>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-primary" style="border-color: #2b6cb0;"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="p-6 text-center">
        <div class="text-red-600 mb-2">Error loading case details</div>
        <button 
          (click)="loadCase()"
          class="px-4 py-2 bg-medical-primary text-white rounded-md text-sm hover:bg-medical-primary/90"
          style="background-color: #2b6cb0;"
        >
          Retry
        </button>
      </div>
    </div>
  `,
  styles: [`
    .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
    .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
    .space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-4 { gap: 1rem; }
    .gap-3 { gap: 0.75rem; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .p-6 { padding: 1.5rem; }
    .p-3 { padding: 0.75rem; }
    .p-2 { padding: 0.5rem; }
    .p-1 { padding: 0.25rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
    .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-1 { margin-bottom: 0.25rem; }
    .w-5 { width: 1.25rem; }
    .h-5 { height: 1.25rem; }
    .w-4 { width: 1rem; }
    .h-4 { height: 1rem; }
    .w-8 { width: 2rem; }
    .h-8 { height: 2rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-md { border-radius: 0.375rem; }
    .rounded-full { border-radius: 50%; }
    .rounded { border-radius: 0.25rem; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    .flex-shrink-0 { flex-shrink: 0; }
    .animate-spin { animation: spin 1s linear infinite; }
    .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; }
    .hover\\:bg-muted:hover { background-color: #f0f4f8; }
    .hover\\:bg-red-50:hover { background-color: #fef2f2; }
    .disabled\\:opacity-50:disabled { opacity: 0.5; }
    .bg-muted { background-color: #f0f4f8; }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @media (min-width: 1024px) {
      .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
  `]
})
export class CaseDetailsComponent implements OnInit {
  @Input() caseId: string | null = null;
  @Output() back = new EventEmitter<void>();

  selectedCase: Case | null = null;
  caseForm: FormGroup;
  isEditing = false;
  loading = false;
  saving = false;
  error = false;
  showAddFlag = false;

  constructor(
    private casesService: CasesService,
    private fb: FormBuilder
  ) {
    this.caseForm = this.createForm();
  }

  ngOnInit() {
    if (this.caseId) {
      this.loadCase();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      patientName: ['', [Validators.required, Validators.minLength(2)]],
      mrn: ['', Validators.required],
      age: [0, [Validators.required, Validators.min(0), Validators.max(150)]],
      sex: ['', Validators.required],
      admitDate: ['', Validators.required],
      lengthOfStay: [1, [Validators.required, Validators.min(1)]],
      primaryDiagnosis: ['', Validators.required],
      unit: ['', Validators.required],
      room: [''],
      attendingPhysician: ['', Validators.required],
      assignedTo: [''],
      currentDrg: ['', Validators.required],
      suggestedDrg: [''],
      financialImpact: [0],
      priority: ['Medium', Validators.required],
      status: ['New', Validators.required],
      notes: [''],
      reviewNotes: ['']
    });
  }

  loadCase() {
    if (!this.caseId) return;

    this.loading = true;
    this.error = false;

    this.casesService.getCaseById(this.caseId).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedCase = response.data;
          this.populateForm();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading case:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  populateForm() {
    if (!this.selectedCase) return;

    this.caseForm.patchValue({
      patientName: this.selectedCase.patientName,
      mrn: this.selectedCase.mrn,
      age: this.selectedCase.age,
      sex: this.selectedCase.sex,
      admitDate: this.selectedCase.admitDate,
      lengthOfStay: this.selectedCase.lengthOfStay,
      primaryDiagnosis: this.selectedCase.primaryDiagnosis,
      unit: this.selectedCase.unit,
      room: this.selectedCase.room,
      attendingPhysician: this.selectedCase.attendingPhysician,
      assignedTo: this.selectedCase.assignedTo,
      currentDrg: this.selectedCase.currentDrg,
      suggestedDrg: this.selectedCase.suggestedDrg,
      financialImpact: this.selectedCase.financialImpact,
      priority: this.selectedCase.priority,
      status: this.selectedCase.status,
      notes: this.selectedCase.notes,
      reviewNotes: this.selectedCase.reviewNotes
    });
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form to original values
      this.populateForm();
    }
  }

  saveCase() {
    if (this.caseForm.invalid || !this.selectedCase) return;

    this.saving = true;
    const formValue = this.caseForm.value;

    this.casesService.updateCase(this.selectedCase.id, formValue).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedCase = response.data;
          this.isEditing = false;
          this.populateForm();
        }
        this.saving = false;
      },
      error: (error) => {
        console.error('Error saving case:', error);
        this.saving = false;
      }
    });
  }

  removeFlag(flagId: string) {
    if (!this.selectedCase) return;

    this.casesService.removeFlag(this.selectedCase.id, flagId).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedCase = response.data;
        }
      },
      error: (error) => {
        console.error('Error removing flag:', error);
      }
    });
  }

  goBack() {
    this.back.emit();
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-red-50 text-red-600';
      case 'Medium': return 'bg-yellow-50 text-yellow-600';
      case 'Low': return 'bg-gray-50 text-gray-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700';
      case 'In Progress': return 'bg-purple-100 text-purple-700';
      case 'Query Sent': return 'bg-orange-100 text-orange-700';
      case 'Physician Response': return 'bg-indigo-100 text-indigo-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'On Hold': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
} 