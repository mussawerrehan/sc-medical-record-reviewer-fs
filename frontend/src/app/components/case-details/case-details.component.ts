import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CasesService, Case } from '../../services/cases.service';
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

interface EnhancedClaim {
  id: string;
  caseId: string;
  claimId: string;
  serviceDate: string;
  provider: string;
  procedureCode: string;
  procedureDescription: string;
  amount: number;
  status: string;
  submissionDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowTransition {
  id: string;
  fromStatus: string;
  toStatus: string;
  description: string;
  performedBy: string;
  timestamp: string;
  reason?: string;
}

@Component({
  selector: 'app-case-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './case-details.component.html',
  styleUrls: ['./case-details.component.scss']
})
export class CaseDetailsComponent implements OnInit {
  @Input() caseId: string | null = null;
  @Output() back = new EventEmitter<void>();

  // Component properties  
  selectedCase: Case | null = null;
  activeTab: 'issues' | 'attachments' | 'notes' | 'activity' | 'claims' = 'issues';
  
  // Data properties
  selectedIssue: DocumentationIssue | null = null;
  attachments: Attachment[] = [];
  notes: CaseNote[] = [];
  activityLog: ActivityLog[] = [];
  filteredActivityLog: ActivityLog[] = [];
  claims: EnhancedClaim[] = [];
  
  // UI state
  showUploadModal = false;
  showNoteModal = false;
  showClaimModal = false;
  showBulkClaimsModal = false;
  showAttachmentModal = false;
  uploadProgress = 0;
  isUploading = false;
  activityFilter = 'all';
  loading = false;
  error: string | null = null;
  dragOverActive = false;
  uploadingFile = false;
  selectedNote: CaseNote | null = null;
  
  // Workflow management
  workflowHistory: WorkflowTransition[] = [];
  
  // Forms
  noteForm!: FormGroup;
  claimForm!: FormGroup;
  caseForm!: FormGroup;

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
    this.initializeWorkflowHistory();
    this.filterActivity();
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
    this.error = null;

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
        this.error = 'Failed to load case details.';
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

  // Documentation Issues methods
  selectIssue(issue: DocumentationIssue) {
    if (this.selectedIssue?.id === issue.id) {
      this.selectedIssue = null; // Collapse if already selected
    } else {
      this.selectedIssue = issue;
    }
  }

  getSeverityLabel(severity: string): string {
    const labels: { [key: string]: string } = {
      'high': 'High Impact',
      'medium': 'Medium Impact', 
      'low': 'Low Impact',
      'critical': 'Critical'
    };
    return labels[severity] || severity;
  }

  generateQuery(issue: DocumentationIssue) {
    console.log('Generating query for issue:', issue);
    
    // Create a new query based on the issue
    const queryContent = this.generateQueryContent(issue);
    
    // Add to activity log
    this.addActivityLogEntry(
      'Query Generated',
      `Generated query for: ${issue.title}`,
      'Dr. Johnson'
    );

    // Show query modal or navigate to query creation
    this.showQueryModal(issue, queryContent);
    
    // Keep status as pending since query is generated but not yet resolved
    // issue.status remains 'pending'
  }

  approveIssue(issue: DocumentationIssue) {
    console.log('Approving issue:', issue);
    
    // Update issue status
    issue.status = 'approved';
    
    // Add to activity log
    this.addActivityLogEntry(
      'Issue Approved',
      `Approved documentation issue: ${issue.title}`,
      'Dr. Johnson'
    );

    // Show success message
    alert(`Issue "${issue.title}" has been approved.`);
    
    // Optionally remove from the list or mark as resolved
    this.removeIssueFromList(issue.id);
  }

  markNoIssue(issue: DocumentationIssue) {
    console.log('Marking no issue for:', issue);
    
    // Update issue status to resolved since it's marked as no issue
    issue.status = 'resolved';
    
    // Add to activity log
    this.addActivityLogEntry(
      'Marked No Issue',
      `Marked as no issue: ${issue.title}`,
      'Dr. Johnson'
    );

    // Show confirmation message
    alert(`Issue "${issue.title}" has been marked as no issue.`);
    
    // Remove from the list
    this.removeIssueFromList(issue.id);
  }

  private generateQueryContent(issue: DocumentationIssue): string {
    let queryContent = `Query regarding: ${issue.title}\n\n`;
    
    queryContent += `Issue Description:\n${issue.description}\n\n`;
    
    if (issue.evidence && issue.evidence.length > 0) {
      queryContent += `Supporting Evidence:\n`;
      issue.evidence.forEach((evidence, index) => {
        queryContent += `${index + 1}. ${evidence.source}: ${evidence.content}\n`;
      });
      queryContent += '\n';
    }
    
    if (issue.recommendations && issue.recommendations.length > 0) {
      queryContent += `Recommendations:\n`;
      issue.recommendations.forEach((rec, index) => {
        queryContent += `${index + 1}. ${rec}\n`;
      });
      queryContent += '\n';
    }
    
    queryContent += `Please review and provide additional documentation if available.\n\n`;
    queryContent += `Financial Impact: ${issue.impact}\n`;
    queryContent += `Priority: ${this.getSeverityLabel(issue.severity)}`;
    
    return queryContent;
  }

  private showQueryModal(issue: DocumentationIssue, queryContent: string) {
    // In a real implementation, this would open a modal with the query content
    // For now, we'll show the generated query content
    
    const shouldSend = confirm(
      `Generated Query for "${issue.title}":\n\n${queryContent}\n\nWould you like to send this query?`
    );
    
    if (shouldSend) {
      // Simulate sending the query
      this.sendQuery(issue, queryContent);
    }
  }

  private sendQuery(issue: DocumentationIssue, queryContent: string) {
    // Simulate API call to send query
    console.log('Sending query:', queryContent);
    
    // Add to activity log
    this.addActivityLogEntry(
      'Query Sent',
      `Query sent to physician for: ${issue.title}`,
      'Dr. Johnson'
    );

    // Update case workflow status if needed
    if (this.selectedCase && this.canTransitionTo('Query Sent')) {
      this.transitionWorkflow('Query Sent');
    }

    // Show success message
    alert('Query has been sent successfully!');
    
    // Mark issue as resolved since query has been sent
    issue.status = 'resolved';
  }

  private removeIssueFromList(issueId: number) {
    const index = this.documentationIssues.findIndex(issue => issue.id === issueId);
    if (index > -1) {
      this.documentationIssues.splice(index, 1);
      
      // Clear selected issue if it was the one removed
      if (this.selectedIssue?.id === issueId) {
        this.selectedIssue = null;
      }
    }
  }

  goBack() {
    this.back.emit();
  }

  getFormattedDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
  setActiveTab(tab: 'issues' | 'attachments' | 'notes' | 'activity' | 'claims') {
    this.activeTab = tab;
    if (tab === 'activity') {
      this.filterActivity();
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

  // Helper methods to safely access selectedCase properties
  getPatientName(): string {
    return this.selectedCase ? this.selectedCase.patientName : '';
  }

  getPatientAge(): number {
    return this.selectedCase ? this.selectedCase.age : 0;
  }

  getPatientSex(): string {
    return this.selectedCase ? this.selectedCase.sex : '';
  }

  getPatientMrn(): string {
    return this.selectedCase ? this.selectedCase.mrn : '';
  }

  getAdmitDate(): string {
    return this.selectedCase ? this.selectedCase.admitDate : '';
  }

  getLengthOfStay(): number {
    return this.selectedCase ? this.selectedCase.lengthOfStay : 0;
  }

  getUnit(): string {
    return this.selectedCase ? this.selectedCase.unit : '';
  }

  getRoom(): string {
    return this.selectedCase ? this.selectedCase.room || '' : '';
  }

  getAttendingPhysician(): string {
    return this.selectedCase ? this.selectedCase.attendingPhysician : '';
  }

  getCurrentDrg(): string {
    return this.selectedCase ? this.selectedCase.currentDrg : '';
  }

  getSuggestedDrg(): string {
    return this.selectedCase ? this.selectedCase.suggestedDrg || '' : '';
  }

  getFinancialImpact(): number {
    return this.selectedCase ? this.selectedCase.financialImpact || 0 : 0;
  }

  getComplianceScore(): number {
    return this.selectedCase ? this.selectedCase.complianceScore || 3 : 3;
  }

  getRiskScore(): number {
    return this.selectedCase ? this.selectedCase.riskScore || 2 : 2;
  }

  getPriority(): string {
    return this.selectedCase ? this.selectedCase.priority : 'Medium';
  }

  getPriorityClass(): string {
    const priority = this.getPriority().toLowerCase();
    return `priority-${priority}`;
  }

  // Activity filtering
  filterActivity() {
    if (this.activityFilter === 'all') {
      this.filteredActivityLog = [...this.activityLog];
    } else {
      this.filteredActivityLog = this.activityLog.filter(activity => 
        activity.activityType?.toLowerCase().includes(this.activityFilter.toLowerCase()) ||
        activity.description.toLowerCase().includes(this.activityFilter.toLowerCase())
      );
    }
  }

  // Claims management methods
  openAddClaimModal() {
    this.showClaimModal = true;
    this.initializeClaimForm();
  }

  openBulkClaimsModal() {
    this.showBulkClaimsModal = true;
  }

  initializeClaimForm() {
    this.claimForm = this.fb.group({
      claimId: ['', Validators.required],
      serviceDate: ['', Validators.required],
      provider: ['', Validators.required],
      procedureCode: ['', Validators.required],
      procedureDescription: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      status: ['Pending', Validators.required],
      notes: ['']
    });
  }

  addClaim() {
    if (this.claimForm.valid) {
      const newClaim: EnhancedClaim = {
        id: Date.now().toString(),
        caseId: this.selectedCase?.id || '',
        claimId: this.claimForm.value.claimId,
        serviceDate: this.claimForm.value.serviceDate,
        provider: this.claimForm.value.provider,
        procedureCode: this.claimForm.value.procedureCode,
        procedureDescription: this.claimForm.value.procedureDescription,
        amount: parseFloat(this.claimForm.value.amount),
        status: this.claimForm.value.status,
        submissionDate: new Date().toISOString(),
        notes: this.claimForm.value.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.claims.push(newClaim);
      this.showClaimModal = false;
      this.claimForm.reset();
      
      // Add activity log entry
      this.addActivityLogEntry('Claim Added', `Added claim ${newClaim.claimId}`, 'Dr. Johnson');
    }
  }

  editClaim(claim: EnhancedClaim) {
    // Initialize form with claim data for editing
    this.initializeClaimForm();
    this.claimForm.patchValue({
      claimId: claim.claimId,
      serviceDate: claim.serviceDate,
      provider: claim.provider,
      procedureCode: claim.procedureCode,
      procedureDescription: claim.procedureDescription,
      amount: claim.amount,
      status: claim.status,
      notes: claim.notes
    });
    this.showClaimModal = true;
  }

  deleteClaim(claimId: string) {
    if (confirm('Are you sure you want to delete this claim?')) {
      const claimIndex = this.claims.findIndex(c => c.id === claimId);
      if (claimIndex > -1) {
        const claim = this.claims[claimIndex];
        this.claims.splice(claimIndex, 1);
        this.addActivityLogEntry('Claim Deleted', `Deleted claim ${claim.claimId}`, 'Dr. Johnson');
      }
    }
  }

  closeBulkClaimsModal() {
    this.showBulkClaimsModal = false;
  }

  closeClaimModal() {
    this.showClaimModal = false;
    this.claimForm?.reset();
  }

  handleBulkClaimsUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Simulate bulk claims processing
      this.processBulkClaimsFile(file);
    }
  }

  processBulkClaimsFile(file: File) {
    // Simulate CSV/Excel processing for bulk claims
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Parse CSV content (simplified)
        const content = e.target?.result as string;
        const lines = content.split('\n');
        const headers = lines[0].split(',');
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length >= 6) {
            const claim: EnhancedClaim = {
              id: Date.now().toString() + i,
              caseId: this.selectedCase?.id || '',
              claimId: values[0]?.trim() || '',
              serviceDate: values[1]?.trim() || '',
              provider: values[2]?.trim() || '',
              procedureCode: values[3]?.trim() || '',
              procedureDescription: values[4]?.trim() || '',
              amount: parseFloat(values[5]?.trim()) || 0,
              status: values[6]?.trim() || 'Pending',
              submissionDate: new Date().toISOString(),
              notes: values[7]?.trim() || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            this.claims.push(claim);
          }
        }
        
        this.addActivityLogEntry('Bulk Claims Import', `Imported ${lines.length - 1} claims from ${file.name}`, 'Dr. Johnson');
        this.showBulkClaimsModal = false;
      } catch (error) {
        console.error('Error processing bulk claims file:', error);
        alert('Error processing file. Please check the format and try again.');
      }
    };
    reader.readAsText(file);
  }

  private addActivityLogEntry(description: string, details: string, user: string) {
    const activity: ActivityLog = {
      id: Date.now().toString(),
      caseId: this.selectedCase?.id || '',
      activityType: 'CLAIM_MANAGEMENT',
      description: description,
      performedBy: user,
      performedAt: new Date().toISOString()
    };
    
    this.activityLog.unshift(activity);
    this.filterActivity();
  }

  // Workflow management methods
  canTransitionTo(status: string): boolean {
    const currentStatus = this.selectedCase?.status || 'New';
    
    // Define valid transitions based on current status
    const validTransitions: { [key: string]: string[] } = {
      'New': ['In Progress', 'On Hold'],
      'In Progress': ['Query Sent', 'Completed', 'On Hold'],
      'Query Sent': ['Physician Response', 'On Hold'],
      'Physician Response': ['In Progress', 'Completed'],
      'On Hold': ['In Progress', 'New'],
      'Completed': [] // Terminal state
    };
    
    return validTransitions[currentStatus]?.includes(status) || false;
  }

  transitionWorkflow(newStatus: string) {
    if (!this.selectedCase || !this.canTransitionTo(newStatus)) {
      console.warn('Invalid workflow transition');
      return;
    }

    const oldStatus = this.selectedCase.status;
    const transition: WorkflowTransition = {
      id: Date.now().toString(),
      fromStatus: oldStatus,
      toStatus: newStatus,
      description: `Status changed from ${oldStatus} to ${newStatus}`,
      performedBy: 'Dr. Johnson', // Current user
      timestamp: new Date().toISOString()
    };

    // Update case status
    this.selectedCase.status = newStatus as any;
    
    // Add to workflow history
    this.workflowHistory.unshift(transition);
    
    // Add to activity log
    this.addActivityLogEntry(
      `Workflow Status Changed`,
      `${transition.description}`,
      transition.performedBy
    );

    console.log('Workflow transition completed:', transition);
  }

  initializeWorkflowHistory() {
    // Sample workflow history
    this.workflowHistory = [
      {
        id: '1',
        fromStatus: 'New',
        toStatus: 'In Progress',
        description: 'Case assigned to CDI specialist',
        performedBy: 'Dr. Smith',
        timestamp: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: '2',
        fromStatus: 'Initial',
        toStatus: 'New',
        description: 'Case created and ready for review',
        performedBy: 'System',
        timestamp: new Date(Date.now() - 259200000).toISOString()
      }
    ];
  }
} 