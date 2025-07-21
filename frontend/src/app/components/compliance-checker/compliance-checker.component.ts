import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-compliance-checker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Compliance Checker</h1>
          <p class="text-muted-foreground mt-1">Validate claims before submission and catch billing errors early</p>
        </div>
        <div class="flex items-center gap-3">
          <button class="flex items-center gap-2 px-4 py-2 bg-medical-primary text-white rounded-md hover:bg-medical-primary/90">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            Run Check
          </button>
        </div>
      </div>

      <!-- New Feature Alert -->
      <div class="bg-medical-info-light border border-medical-info rounded-lg p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-medical-info rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-medical-info mb-2">New Feature Available!</h3>
            <p class="text-medical-info mb-4">Our AI-powered Compliance Checker is now live. Validate your claims against the latest coding guidelines, catch potential denials, and ensure maximum reimbursement before submission.</p>
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-medical-info text-white rounded-full text-sm">Real-time Validation</span>
              <span class="px-3 py-1 bg-medical-info text-white rounded-full text-sm">DRG Optimization</span>
              <span class="px-3 py-1 bg-medical-info text-white rounded-full text-sm">Denial Prevention</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Check Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="medical-card p-6">
          <h3 class="text-lg font-semibold text-foreground mb-4">Quick Check</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Patient MRN</label>
              <input
                type="text"
                placeholder="Enter patient MRN..."
                [(ngModel)]="patientMrn"
                class="w-full px-3 py-2 border border-border bg-input-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Claim Type</label>
              <select [(ngModel)]="claimType" class="w-full px-3 py-2 border border-border rounded-md text-sm bg-card">
                <option value="">Select claim type...</option>
                <option value="inpatient">Inpatient</option>
                <option value="outpatient">Outpatient</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <button 
              class="w-full px-4 py-2 bg-medical-primary text-white rounded-md hover:bg-medical-primary/90 disabled:opacity-50"
              [disabled]="!patientMrn || !claimType"
              (click)="runQuickCheck()"
            >
              Validate Claim
            </button>
          </div>
        </div>

        <div class="medical-card p-6">
          <h3 class="text-lg font-semibold text-foreground mb-4">Batch Processing</h3>
          <div class="space-y-4">
            <div class="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <svg class="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p class="text-muted-foreground mb-2">Drop your CSV file here or click to browse</p>
              <p class="text-xs text-muted-foreground">Supports up to 1000 claims per batch</p>
            </div>
            <button class="w-full px-4 py-2 border border-border rounded-md hover:bg-muted">
              Select File
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Checks -->
      <div class="medical-card p-6">
        <h3 class="text-lg font-semibold text-foreground mb-4">Recent Compliance Checks</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 border border-border rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-medical-success rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-foreground">Batch_2024_07_15.csv</p>
                <p class="text-xs text-muted-foreground">245 claims • 98% passed</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs text-muted-foreground">2 hours ago</p>
              <button class="text-xs text-medical-primary hover:underline">View Report</button>
            </div>
          </div>

          <div class="flex items-center justify-between p-3 border border-border rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-medical-warning rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-foreground">MRN: 123456789</p>
                <p class="text-xs text-muted-foreground">Single claim • 3 issues found</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs text-muted-foreground">4 hours ago</p>
              <button class="text-xs text-medical-primary hover:underline">Fix Issues</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
    .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
    .space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    @media (min-width: 1024px) {
      .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
  `]
})
export class ComplianceCheckerComponent implements OnInit {
  patientMrn = '';
  claimType = '';

  ngOnInit() {}

  runQuickCheck(): void {
    console.log('Running compliance check for:', this.patientMrn, this.claimType);
    // Implement compliance check logic
  }
} 