import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CasesService, Case, CaseFlag, CaseQuery } from '../../services/cases.service';
import { Attachment, CaseNote, ActivityLog } from '../../services/case.service';

interface DocumentationIssue {
  id: number;
  type: 'clinical' | 'coding' | 'compliance';
  category: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  impact: string;
  evidence: Evidence[];
  recommendations: string[];
  status: 'pending' | 'approved' | 'resolved';
}

interface Evidence {
  type: string;
  content: string;
  source: string;
  date?: string;
}

@Component({
  selector: 'app-case-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './case-details.component.html',
  styles: [`
    .case-review-container {
      min-height: 100vh;
      background-color: #fafbfc;
    }

    .header {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: transparent;
      border: none;
      border-radius: 0.375rem;
      color: #64748b;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .back-btn:hover {
      background-color: #f1f5f9;
    }

    .header-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .case-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a202c;
      margin: 0;
    }

    .patient-info {
      color: #718096;
      font-size: 0.875rem;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }

    .nav-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      color: #64748b;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .nav-btn:hover {
      background-color: #f8fafc;
      border-color: #cbd5e0;
    }

    .main-content {
      display: grid;
      grid-template-columns: 320px 1fr 320px;
      gap: 1.5rem;
      padding: 1.5rem;
      min-height: calc(100vh - 80px);
    }

    .sidebar-left, .sidebar-right {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .patient-card, .issues-card, .evidence-card, .timeline-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      overflow: hidden;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      font-weight: 600;
      color: #1a202c;
      background-color: #f8fafc;
    }

    .card-subtitle {
      padding: 0.75rem 1.5rem;
      color: #718096;
      font-size: 0.875rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .card-content {
      padding: 1.5rem;
    }

    .patient-info-section {
      margin-bottom: 1rem;
    }

    .patient-name {
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 0.5rem 0;
    }

    .patient-details {
      color: #718096;
      font-size: 0.875rem;
      margin: 0.25rem 0;
    }

    .separator {
      height: 1px;
      background-color: #e2e8f0;
      margin: 1rem 0;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 0.75rem 0;
      font-size: 0.875rem;
    }

    .detail-list {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-list p {
      color: #718096;
      font-size: 0.875rem;
      margin: 0;
    }

    .drg-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .drg-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .drg-label {
      color: #718096;
      font-size: 0.875rem;
    }

    .drg-value {
      color: #1a202c;
      font-size: 0.875rem;
    }

    .drg-impact {
      color: #059669;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .severity-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .severity-info p {
      color: #718096;
      font-size: 0.875rem;
      margin: 0;
    }

    .priority-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      width: fit-content;
    }

    .priority-high {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .priority-medium {
      background-color: #fef3c7;
      color: #d97706;
    }

    .priority-low {
      background-color: #f3f4f6;
      color: #6b7280;
    }

    .priority-critical {
      background-color: #fecaca;
      color: #b91c1c;
    }

    .issues-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .issue-item {
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;
    }

    .issue-item:hover {
      border-color: #cbd5e0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .issue-item.expanded {
      border-color: #3b82f6;
    }

    .issue-header {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
    }

    .issue-icon {
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    .issue-content {
      flex: 1;
    }

    .issue-title-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .issue-title {
      font-weight: 600;
      color: #1a202c;
    }

    .severity-badge {
      padding: 0.125rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .severity-high {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .severity-medium {
      background-color: #fef3c7;
      color: #d97706;
    }

    .severity-low {
      background-color: #f3f4f6;
      color: #6b7280;
    }

    .issue-description {
      color: #718096;
      font-size: 0.875rem;
      margin: 0.5rem 0;
    }

    .issue-impact {
      color: #059669;
      font-weight: 600;
      font-size: 0.875rem;
      margin: 0;
    }

    .expand-icon {
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    .expand-icon svg {
      transition: transform 0.2s;
    }

    .expand-icon svg.rotated {
      transform: rotate(180deg);
    }

    .issue-details {
      padding: 0 1rem 1rem 1rem;
      border-top: 1px solid #e2e8f0;
      margin-top: 1rem;
    }

    .evidence-section, .recommendations-section {
      margin-bottom: 1rem;
    }

    .evidence-title, .recommendations-title {
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
    }

    .evidence-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .evidence-item {
      background-color: #f8fafc;
      border-radius: 0.375rem;
      padding: 0.75rem;
    }

    .evidence-source {
      font-weight: 600;
      color: #1a202c;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .evidence-content {
      color: #718096;
      font-size: 0.875rem;
    }

    .recommendations-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .recommendation-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      color: #718096;
      font-size: 0.875rem;
    }

    .issue-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .action-btn.primary {
      background-color: #2563eb;
      color: white;
    }

    .action-btn.primary:hover {
      background-color: #1d4ed8;
    }

    .action-btn.secondary {
      background-color: white;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .action-btn.secondary:hover {
      background-color: #f9fafb;
    }

    .action-btn.tertiary {
      background-color: transparent;
      color: #6b7280;
      border: none;
    }

    .action-btn.tertiary:hover {
      background-color: #f3f4f6;
    }

    .selected-issue-info {
      margin-bottom: 1rem;
    }

    .category-badge {
      background-color: #dbeafe;
      color: #1e40af;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .clinical-evidence {
      margin-bottom: 1rem;
    }

    .evidence-items {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .evidence-detail {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .evidence-source-label {
      font-weight: 600;
      color: #718096;
      font-size: 0.875rem;
    }

    .evidence-content-text {
      color: #1a202c;
      font-size: 0.875rem;
    }

    .financial-impact {
      margin-bottom: 1rem;
    }

    .impact-box {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 0.5rem;
      padding: 0.75rem;
    }

    .impact-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .impact-text {
      color: #15803d;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .timeline-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .timeline-item {
      display: flex;
      gap: 0.75rem;
    }

    .timeline-dot {
      width: 0.5rem;
      height: 0.5rem;
      background-color: #3b82f6;
      border-radius: 50%;
      margin-top: 0.5rem;
      flex-shrink: 0;
    }

    .timeline-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .timeline-date {
      font-weight: 600;
      color: #1a202c;
      font-size: 0.875rem;
    }

    .timeline-event {
      color: #718096;
      font-size: 0.875rem;
    }

    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #718096;
    }

    .spinner {
      width: 2rem;
      height: 2rem;
      border: 2px solid #e2e8f0;
      border-top: 2px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      color: #dc2626;
      margin-bottom: 1rem;
    }

    .retry-btn {
      padding: 0.5rem 1rem;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
    }

    .retry-btn:hover {
      background-color: #2563eb;
    }

    .w-4 { width: 1rem; height: 1rem; }
    .w-5 { width: 1.25rem; height: 1.25rem; }
    .text-blue-500 { color: #3b82f6; }
    .text-green-500 { color: #10b981; }
    .text-orange-500 { color: #f59e0b; }
    .text-green-600 { color: #059669; }

    @media (max-width: 1200px) {
      .main-content {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .sidebar-left, .sidebar-right {
        order: 2;
      }
      
      .main-panel {
        order: 1;
      }
    }
  `]
})
export class CaseDetailsComponent implements OnInit {
  @Input() caseId: string | null = null;
  @Output() back = new EventEmitter<void>();

  selectedCase: Case | null = null;
  selectedIssue: DocumentationIssue | null = null;
  caseForm: FormGroup;
  isEditing = false;
  loading = false;
  saving = false;
  error = false;
  showAddFlag = false;

  // New properties for attachments, notes, and activity log
  attachments: Attachment[] = [];
  notes: CaseNote[] = [];
  activityLog: ActivityLog[] = [];
  
  // UI state for the new sections
  activeTab: 'issues' | 'attachments' | 'notes' | 'activity' = 'issues';
  showAttachmentModal = false;
  showNoteModal = false;
  selectedAttachment: Attachment | null = null;
  selectedNote: CaseNote | null = null;
  
  // File upload state
  uploadingFile = false;
  uploadProgress = 0;
  dragOverActive = false;
  
  // Note form
  noteForm: FormGroup;

  // Note types and priorities
  noteTypes = [
    { value: 'Clinical', label: 'Clinical Note' },
    { value: 'General', label: 'General Note' },
    { value: 'Query', label: 'Query Note' },
    { value: 'Administrative', label: 'Administrative Note' },
    { value: 'Review', label: 'Review Note' },
    { value: 'System', label: 'System Note' }
  ];

  notePriorities = [
    { value: 'Low', label: 'Low', color: '#10b981' },
    { value: 'Medium', label: 'Medium', color: '#f59e0b' },
    { value: 'High', label: 'High', color: '#ef4444' },
    { value: 'Critical', label: 'Critical', color: '#dc2626' }
  ];

  // Sample documentation issues based on Figma design
  documentationIssues: DocumentationIssue[] = [
    {
      id: 1,
      type: 'clinical',
      category: 'Documentation Improvement',
      title: 'Sepsis Criteria Not Documented',
      description: 'Patient meets clinical criteria for sepsis but explicit documentation is missing',
      severity: 'high',
      impact: 'MCC addition - DRG 871 → 870 (+$2,400)',
      evidence: [
        {
          type: 'vital-signs',
          content: 'Fever 102.3°F (39.1°C) documented on 07/05 at 14:30',
          source: 'Nursing Notes'
        },
        {
          type: 'lab',
          content: 'Lactate: 4.2 mmol/L (elevated, normal <2.0)',
          source: 'Lab Results 07/05 15:45'
        },
        {
          type: 'clinical',
          content: 'Blood cultures positive for E. coli',
          source: 'Lab Results 07/06 08:30'
        },
        {
          type: 'treatment',
          content: 'Broad-spectrum antibiotics initiated (Piperacillin/Tazobactam)',
          source: 'Physician Orders 07/05 16:00'
        }
      ],
      recommendations: [
        'Query physician for sepsis documentation',
        'Consider adding severe sepsis if organ dysfunction present'
      ],
      status: 'pending'
    },
    {
      id: 2,
      type: 'coding',
      category: 'Coding Opportunity',
      title: 'Acute Kidney Injury Severity Not Specified',
      description: 'AKI is documented but severity stage not specified for optimal coding',
      severity: 'high',
      impact: 'CC addition - potential +$800',
      evidence: [
        {
          type: 'lab',
          content: 'Creatinine: 2.8 mg/dL (baseline 1.1 mg/dL)',
          source: 'Lab Results 07/05'
        },
        {
          type: 'lab',
          content: 'BUN: 45 mg/dL (elevated)',
          source: 'Lab Results 07/05'
        },
        {
          type: 'clinical',
          content: 'Decreased urine output noted',
          source: 'Nursing Assessment'
        }
      ],
      recommendations: [
        'Query for AKI stage (1, 2, or 3)',
        'Consider documentation of AKI etiology'
      ],
      status: 'pending'
    },
    {
      id: 3,
      type: 'compliance',
      category: 'Compliance Flag',
      title: 'POA Indicator Missing',
      description: 'Present on Admission indicator missing for secondary diagnosis',
      severity: 'medium',
      impact: 'Compliance requirement',
      evidence: [
        {
          type: 'documentation',
          content: 'Acute kidney injury documented without POA indicator',
          source: 'Discharge Summary'
        }
      ],
      recommendations: [
        'Add POA indicator (Y/N) for all secondary diagnoses',
        'Review admission documentation for timing'
      ],
      status: 'pending'
    }
  ];

  caseTimeline = [
    { date: '07/05 14:30', event: 'Patient admitted with pneumonia symptoms', type: 'admission' },
    { date: '07/05 15:45', event: 'Lab results show elevated lactate and creatinine', type: 'lab' },
    { date: '07/05 16:00', event: 'Antibiotics initiated', type: 'treatment' },
    { date: '07/06 08:30', event: 'Blood cultures positive for E. coli', type: 'lab' },
    { date: '07/06 10:00', event: 'Case flagged by SmartCycleAI', type: 'system' },
    { date: '07/08 09:15', event: 'Case assigned for review', type: 'workflow' }
  ];

  constructor(
    private casesService: CasesService,
    private fb: FormBuilder
  ) {
    this.caseForm = this.createForm();
    this.noteForm = this.fb.group({
      type: ['', Validators.required],
      priority: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.caseId) {
      this.loadCase();
    } else {
      // Load sample case data for demo
      this.selectedCase = {
        id: '1',
        caseNumber: 'CASE-2025-001',
        patientName: 'David Thompson',
        mrn: '127540541',
        age: 41,
        sex: 'M',
        admitDate: '2025-07-17',
        lengthOfStay: 3,
        unit: 'ICU',
        room: '301A',
        attendingPhysician: 'Dr. Johnson',
        primaryDiagnosis: 'Pneumonia with complications',
        secondaryDiagnoses: ['Acute respiratory failure', 'Hypertension'],
        currentDrg: '193',
        suggestedDrg: '177',
        financialImpact: 2400,
        priority: 'High',
        status: 'In Progress',
        assignedTo: 'Dr. Johnson',
        complianceScore: 3,
        riskScore: 2,
        notes: 'Patient requires close monitoring',
        reviewNotes: 'Potential sepsis diagnosis needs documentation',
        flags: [],
        queries: [],
        escalated: false,
        isActive: true,
        createdAt: new Date(Date.now() - 259200000), // 3 days ago
        updatedAt: new Date(Date.now() - 3600000) // 1 hour ago
      };
    }

    // Auto-select first issue for demo
    if (this.documentationIssues.length > 0) {
      this.selectedIssue = this.documentationIssues[0];
    }

    // Load sample data for new tabs
    this.loadAttachments();
    this.loadNotes();
    this.loadActivityLog();
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

  selectIssue(issue: DocumentationIssue) {
    this.selectedIssue = this.selectedIssue?.id === issue.id ? null : issue;
  }

  generateQuery(issue: DocumentationIssue) {
    console.log('Generating query for issue:', issue.title);
    // TODO: Implement query generation
  }

  approveIssue(issue: DocumentationIssue) {
    console.log('Approving issue:', issue.title);
    // TODO: Implement issue approval
  }

  markNoIssue(issue: DocumentationIssue) {
    console.log('Marking no issue for:', issue.title);
    // TODO: Implement mark no issue
  }

  goBack() {
    this.back.emit();
  }

  getFormattedDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  getSeverityLabel(severity: string): string {
    switch (severity) {
      case 'high': return 'High Impact';
      case 'medium': return 'Medium Impact';
      case 'low': return 'Low Impact';
      default: return severity;
    }
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

  // Tab management
  setActiveTab(tab: 'issues' | 'attachments' | 'notes' | 'activity') {
    this.activeTab = tab;
    if (tab === 'attachments' && this.attachments.length === 0) {
      this.loadAttachments();
    } else if (tab === 'notes' && this.notes.length === 0) {
      this.loadNotes();
    } else if (tab === 'activity' && this.activityLog.length === 0) {
      this.loadActivityLog();
    }
  }

  // Attachment management
  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.uploadFiles(files);
    }
  }

  onFileDrop(event: any) {
    event.preventDefault();
    this.dragOverActive = false;
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      this.uploadFiles(files);
    }
  }

  onDragOver(event: any) {
    event.preventDefault();
    this.dragOverActive = true;
  }

  onDragLeave(event: any) {
    event.preventDefault();
    this.dragOverActive = false;
  }

  uploadFiles(files: FileList) {
    if (!this.selectedCase) return;

    this.uploadingFile = true;
    this.uploadProgress = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', this.getFileType(file));
      formData.append('description', `Uploaded file: ${file.name}`);

      // Simulate upload progress
      const interval = setInterval(() => {
        this.uploadProgress += Math.random() * 20;
        if (this.uploadProgress >= 100) {
          this.uploadProgress = 100;
          clearInterval(interval);
          setTimeout(() => {
            this.uploadingFile = false;
            this.uploadProgress = 0;
            this.loadAttachments();
          }, 500);
        }
      }, 200);
    }
  }

  getFileType(file: File): string {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.includes('pdf')) return 'pdf';
    if (file.type.includes('document') || file.type.includes('word')) return 'document';
    if (file.type.includes('spreadsheet') || file.type.includes('excel')) return 'spreadsheet';
    return 'other';
  }

  loadAttachments() {
    if (!this.selectedCase) return;
    
    // Mock data for now
    this.attachments = [
      {
        id: '1',
        caseId: this.selectedCase.id || '1',
        fileName: 'medical_record_001.pdf',
        originalName: 'Medical Record 001.pdf',
        filePath: '/uploads/medical_record_001.pdf',
        fileSize: 2048576,
        mimeType: 'application/pdf',
        fileType: 'Medical Record',
        description: 'Initial medical record',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        uploadedBy: 'Dr. Smith'
      },
      {
        id: '2',
        caseId: this.selectedCase.id || '1',
        fileName: 'lab_results_070524.pdf',
        originalName: 'Lab Results 07-05-24.pdf',
        filePath: '/uploads/lab_results_070524.pdf',
        fileSize: 1024768,
        mimeType: 'application/pdf',
        fileType: 'Lab Result',
        description: 'Lab results from July 5th',
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        uploadedBy: 'Nurse Johnson'
      }
    ];
  }

  downloadAttachment(attachment: Attachment) {
    // In a real app, this would download the file
    console.log('Downloading attachment:', attachment.fileName);
  }

  deleteAttachment(attachment: Attachment) {
    if (confirm(`Are you sure you want to delete ${attachment.originalName}?`)) {
      this.attachments = this.attachments.filter(a => a.id !== attachment.id);
    }
  }

  // Note management
  openNoteModal(note?: CaseNote) {
    this.selectedNote = note || null;
    if (note) {
      this.noteForm.patchValue({
        type: note.noteType,
        priority: note.priority,
        content: note.content
      });
    } else {
      this.noteForm.reset();
    }
    this.showNoteModal = true;
  }

  closeNoteModal() {
    this.showNoteModal = false;
    this.selectedNote = null;
    this.noteForm.reset();
  }

  saveNote() {
    if (!this.noteForm.valid || !this.selectedCase) return;

    const formValue = this.noteForm.value;
    const note: CaseNote = {
      id: this.selectedNote?.id || Date.now().toString(),
      caseId: this.selectedCase.id || '1',
      noteType: formValue.type,
      title: `${this.noteTypes.find(t => t.value === formValue.type)?.label} - ${new Date().toLocaleDateString()}`,
      content: formValue.content,
      priority: formValue.priority,
      isPrivate: false,
      tags: [],
      createdAt: this.selectedNote?.createdAt || new Date().toISOString(),
      createdBy: 'Current User',
      mentionedUsers: []
    };

    if (this.selectedNote) {
      // Update existing note
      const index = this.notes.findIndex(n => n.id === this.selectedNote!.id);
      if (index !== -1) {
        this.notes[index] = note;
      }
    } else {
      // Add new note
      this.notes.unshift(note);
    }

    this.closeNoteModal();
  }

  loadNotes() {
    if (!this.selectedCase) return;

    // Mock data for now
    this.notes = [
      {
        id: '1',
        caseId: this.selectedCase.id || '1',
        noteType: 'Clinical',
        title: 'Clinical Note - 01/15/2025',
        content: 'Patient shows signs of improvement. Vital signs stable. Continue current treatment plan.',
        priority: 'Medium',
        isPrivate: false,
        tags: ['improvement', 'stable'],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        createdBy: 'Dr. Smith',
        mentionedUsers: []
      },
      {
        id: '2',
        caseId: this.selectedCase.id || '1',
        noteType: 'Query',
        title: 'Query Note - 01/14/2025',
        content: 'Query sent to physician regarding sepsis documentation. Awaiting response.',
        priority: 'High',
        isPrivate: false,
        tags: ['query', 'sepsis'],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        createdBy: 'CDI Specialist',
        mentionedUsers: []
      }
    ];
  }

  deleteNote(note: CaseNote) {
    if (confirm('Are you sure you want to delete this note?')) {
      this.notes = this.notes.filter(n => n.id !== note.id);
    }
  }

  // Activity log management
  loadActivityLog() {
    if (!this.selectedCase) return;

    // Mock data for now
    this.activityLog = [
      {
        id: '1',
        caseId: this.selectedCase.id || '1',
        activityType: 'CASE_CREATED',
        description: 'Case created and assigned for review',
        oldValue: null,
        newValue: 'New',
        performedAt: new Date(Date.now() - 259200000).toISOString(),
        performedBy: 'System',
        ipAddress: '192.168.1.100',
        userAgent: 'Web Application',
        metadata: { source: 'automated' }
      },
      {
        id: '2',
        caseId: this.selectedCase.id || '1',
        activityType: 'STATUS_CHANGED',
        description: 'Case status changed from New to In Progress',
        oldValue: 'New',
        newValue: 'In Progress',
        performedAt: new Date(Date.now() - 172800000).toISOString(),
        performedBy: 'Dr. Smith',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0...',
        metadata: { reason: 'Started review process' }
      },
      {
        id: '3',
        caseId: this.selectedCase.id || '1',
        activityType: 'QUERY_SENT',
        description: 'Query sent to physician regarding sepsis documentation',
        oldValue: null,
        newValue: 'Query Pending',
        performedAt: new Date(Date.now() - 86400000).toISOString(),
        performedBy: 'CDI Specialist',
        ipAddress: '192.168.1.110',
        userAgent: 'Mozilla/5.0...',
        metadata: { queryType: 'sepsis_documentation', physician: 'Dr. Johnson' }
      }
    ];
  }

  // Utility methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getNoteTypeLabel(type: string): string {
    return this.noteTypes.find(t => t.value === type)?.label || type;
  }

  getNotePriorityColor(priority: string): string {
    return this.notePriorities.find(p => p.value === priority)?.color || '#6b7280';
  }

  getActivityIcon(activityType: string): string {
    switch (activityType) {
      case 'CASE_CREATED': return 'plus-circle';
      case 'STATUS_CHANGED': return 'arrow-right';
      case 'QUERY_SENT': return 'mail';
      case 'NOTE_ADDED': return 'document-text';
      case 'ATTACHMENT_UPLOADED': return 'paperclip';
      default: return 'clock';
    }
  }
} 