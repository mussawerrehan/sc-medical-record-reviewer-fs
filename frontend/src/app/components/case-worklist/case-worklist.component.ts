import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CasesService, Case, CaseFilters } from '../../services/cases.service';
import { CaseDetailsComponent } from '../case-details/case-details.component';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-case-worklist',
  standalone: true,
  imports: [CommonModule, FormsModule, CaseDetailsComponent],
  templateUrl: './case-worklist.component.html',
  styleUrls: ['./case-worklist.component.scss']
})
export class CaseWorklistComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  searchTerm = '';
  priorityFilter = 'all';
  statusFilter = 'all';
  unitFilter = 'all';
  assignedToFilter = 'all';
  showFilters = false;
  filteredCases: Case[] = [];
  allCases: Case[] = [];
  selectedCaseId: string | null = null;
  loading = false;
  loadingMore = false;
  hasMoreData = true;
  pagination = {
    total: 5,
    page: 1,
    limit: 25,
    totalPages: 1
  };
  
  // Sorting properties
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Upload-related properties
  showUploadDialog = false;
  selectedFiles: File[] = [];
  uploading = false;
  uploadProgress = 0;
  isDragOver = false;
  fileValidationErrors: { [fileName: string]: string } = {};
  validatingFiles = false;
  
  // Math and Object reference for template
  Math = Math;
  Object = Object;
  
  private subscriptions = new Subscription();
  private searchSubject = new Subject<string>();

  // Sample data that matches Figma design exactly
  private getSampleCases(): Case[] {
    return [
      {
        id: '1',
        caseNumber: 'C001',
        patientName: 'Linda Thompson',
        mrn: '12345769',
        age: 69,
        sex: 'F',
        admitDate: '2024-07-07',
        dischargeDate: undefined,
        lengthOfStay: 1,
        primaryDiagnosis: 'Stroke',
        secondaryDiagnoses: ['Neurology'],
        currentDrg: 'DRG 064',
        suggestedDrg: 'DRG 062',
        drgWeight: 1.2,
        financialImpact: 600,
        formattedImpact: '+$600',
        unit: 'Neurology',
        room: '304A',
        attendingPhysician: 'Dr. Smith',
        assignedTo: 'Dr. Johnson',
        priority: 'Low',
        status: 'Completed',
        flags: [
          {
            id: 'f1',
            type: 'clinical',
            text: 'Dysphagia assessment needed',
            severity: 'medium',
            dateCreated: new Date('2024-07-07'),
            createdBy: 'Dr. Johnson'
          }
        ],
        queries: [],
        notes: '',
        reviewNotes: '',
        complianceScore: 85,
        riskScore: 25,
        lastReviewDate: new Date('2024-07-07'),
        lastReviewedBy: 'Dr. Johnson',
        dueDate: '2024-07-08',
        escalated: false,
        isActive: true,
        createdAt: new Date('2024-07-07'),
        updatedAt: new Date('2024-07-07'),
        daysSinceAdmit: 1,
        priorityScore: 1
      },
      {
        id: '2',
        caseNumber: 'C002',
        patientName: 'Robert Chen',
        mrn: '12345770',
        age: 45,
        sex: 'M',
        admitDate: '2024-07-06',
        dischargeDate: undefined,
        lengthOfStay: 2,
        primaryDiagnosis: 'Pneumonia',
        secondaryDiagnoses: ['Respiratory'],
        currentDrg: 'DRG 177',
        suggestedDrg: 'DRG 175',
        drgWeight: 1.5,
        financialImpact: 1200,
        formattedImpact: '+$1,200',
        unit: 'Respiratory',
        room: '205B',
        attendingPhysician: 'Dr. Wilson',
        assignedTo: 'Dr. Johnson',
        priority: 'High',
        status: 'In Progress',
        flags: [
          {
            id: 'f2',
            type: 'coding',
            text: 'Severity documentation needed',
            severity: 'high',
            dateCreated: new Date('2024-07-06'),
            createdBy: 'Dr. Johnson'
          }
        ],
        queries: [
          {
            id: 'q1',
            content: 'Please document severity of pneumonia',
            sentTo: 'Dr. Wilson',
            sentDate: new Date('2024-07-06'),
            sentBy: 'Dr. Johnson',
            status: 'Sent',
            priority: 'High'
          }
        ],
        notes: '',
        reviewNotes: '',
        complianceScore: 75,
        riskScore: 45,
        lastReviewDate: new Date('2024-07-06'),
        lastReviewedBy: 'Dr. Johnson',
        dueDate: '2024-07-08',
        escalated: false,
        isActive: true,
        createdAt: new Date('2024-07-06'),
        updatedAt: new Date('2024-07-06'),
        daysSinceAdmit: 2,
        priorityScore: 3
      },
      {
        id: '3',
        caseNumber: 'C003',
        patientName: 'Maria Rodriguez',
        mrn: '12345771',
        age: 62,
        sex: 'F',
        admitDate: '2024-07-05',
        dischargeDate: undefined,
        lengthOfStay: 3,
        primaryDiagnosis: 'Heart Failure',
        secondaryDiagnoses: ['Cardiology'],
        currentDrg: 'DRG 291',
        suggestedDrg: 'DRG 292',
        drgWeight: 1.8,
        financialImpact: 800,
        formattedImpact: '+$800',
        unit: 'Cardiology',
        room: '401C',
        attendingPhysician: 'Dr. Martinez',
        assignedTo: 'Dr. Johnson',
        priority: 'Medium',
        status: 'Query Sent',
        flags: [
          {
            id: 'f3',
            type: 'clinical',
            text: 'Ejection fraction documentation',
            severity: 'medium',
            dateCreated: new Date('2024-07-05'),
            createdBy: 'Dr. Johnson'
          }
        ],
        queries: [
          {
            id: 'q2',
            content: 'Please document ejection fraction',
            sentTo: 'Dr. Martinez',
            sentDate: new Date('2024-07-05'),
            sentBy: 'Dr. Johnson',
            status: 'Sent',
            priority: 'Medium'
          }
        ],
        notes: '',
        reviewNotes: '',
        complianceScore: 80,
        riskScore: 35,
        lastReviewDate: new Date('2024-07-05'),
        lastReviewedBy: 'Dr. Johnson',
        dueDate: '2024-07-08',
        escalated: false,
        isActive: true,
        createdAt: new Date('2024-07-05'),
        updatedAt: new Date('2024-07-05'),
        daysSinceAdmit: 3,
        priorityScore: 2
      },
      {
        id: '4',
        caseNumber: 'C004',
        patientName: 'James Wilson',
        mrn: '12345772',
        age: 78,
        sex: 'M',
        admitDate: '2024-07-04',
        dischargeDate: undefined,
        lengthOfStay: 4,
        primaryDiagnosis: 'Sepsis',
        secondaryDiagnoses: ['ICU'],
        currentDrg: 'DRG 870',
        suggestedDrg: 'DRG 871',
        drgWeight: 2.1,
        financialImpact: 2400,
        formattedImpact: '+$2,400',
        unit: 'ICU',
        room: '101A',
        attendingPhysician: 'Dr. Brown',
        assignedTo: 'Dr. Johnson',
        priority: 'Critical',
        status: 'New',
        flags: [
          {
            id: 'f4',
            type: 'compliance',
            text: 'Organ dysfunction documentation',
            severity: 'high',
            dateCreated: new Date('2024-07-04'),
            createdBy: 'Dr. Johnson'
          }
        ],
        queries: [],
        notes: '',
        reviewNotes: '',
        complianceScore: 70,
        riskScore: 65,
        lastReviewDate: new Date('2024-07-04'),
        lastReviewedBy: 'Dr. Johnson',
        dueDate: '2024-07-07',
        escalated: true,
        escalationReason: 'High financial impact',
        isActive: true,
        createdAt: new Date('2024-07-04'),
        updatedAt: new Date('2024-07-04'),
        daysSinceAdmit: 4,
        priorityScore: 4
      },
      {
        id: '5',
        caseNumber: 'C005',
        patientName: 'Sarah Davis',
        mrn: '12345773',
        age: 34,
        sex: 'F',
        admitDate: '2024-07-03',
        dischargeDate: '2024-07-05',
        lengthOfStay: 2,
        primaryDiagnosis: 'Appendicitis',
        secondaryDiagnoses: ['Surgery'],
        currentDrg: 'DRG 338',
        suggestedDrg: 'DRG 339',
        drgWeight: 0.8,
        financialImpact: 400,
        formattedImpact: '+$400',
        unit: 'Surgery',
        room: '302B',
        attendingPhysician: 'Dr. Lee',
        assignedTo: 'Dr. Johnson',
        priority: 'Low',
        status: 'Completed',
        flags: [],
        queries: [],
        notes: '',
        reviewNotes: '',
        complianceScore: 95,
        riskScore: 15,
        lastReviewDate: new Date('2024-07-05'),
        lastReviewedBy: 'Dr. Johnson',
        dueDate: '2024-07-06',
        escalated: false,
        isActive: false,
        createdAt: new Date('2024-07-03'),
        updatedAt: new Date('2024-07-05'),
        daysSinceAdmit: 2,
        priorityScore: 1
      }
    ];
  }

  constructor(private casesService: CasesService) {}

  ngOnInit() {
    // Initialize with sample data immediately for UI display
    this.allCases = this.getSampleCases();
    this.filteredCases = this.allCases;
    this.pagination.total = this.allCases.length;
    this.pagination.totalPages = Math.ceil(this.pagination.total / this.pagination.limit);

    // Try to load real cases from backend, but fallback to sample data
    this.loadCases();
    
    // Subscribe to loading$ observable
    this.subscriptions.add(
      this.casesService.loading$.subscribe(loading => {
        this.loading = loading;
      })
    );

    // Subscribe to search subject with debounce
    this.subscriptions.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this.filterCases();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadCases() {
    this.loading = true;
    
    // Build filters object with current state
    const filters: any = {
      page: this.pagination.page,
      limit: this.pagination.limit
    };

    // Add search filter
    if (this.searchTerm.trim()) {
      filters.search = this.searchTerm.trim();
    }

    // Add other filters
    if (this.priorityFilter !== 'all') {
      filters.priority = this.priorityFilter;
    }
    if (this.statusFilter !== 'all') {
      filters.status = this.statusFilter;
    }
    if (this.unitFilter !== 'all') {
      filters.unit = this.unitFilter;
    }
    if (this.assignedToFilter !== 'all') {
      filters.assignedTo = this.assignedToFilter;
    }

    // Add sorting
    if (this.sortField) {
      filters.sortBy = this.sortField;
      filters.sortOrder = this.sortDirection.toUpperCase();
    }

    this.casesService.getCases(filters).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.filteredCases = response.data.cases || [];
          this.allCases = response.data.cases || []; // Keep for compatibility
          this.pagination = {
            ...this.pagination,
            ...response.data.pagination
          };
        } else {
          // Fallback to sample data if no proper response from backend
          this.allCases = this.getSampleCases();
          this.filteredCases = this.allCases;
          this.pagination.total = this.allCases.length;
          this.pagination.totalPages = Math.ceil(this.pagination.total / this.pagination.limit);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cases:', error);
        // Use sample data on error
        this.allCases = this.getSampleCases();
        this.filteredCases = this.allCases;
        this.pagination.total = this.allCases.length;
        this.pagination.totalPages = Math.ceil(this.pagination.total / this.pagination.limit);
        this.loading = false;
      }
    });
  }

    onSearchChange(searchTerm: string) {
    this.searchSubject.next(searchTerm);
  }

  filterCases() {
    // Reset to first page when filters change
    this.pagination.page = 1;
    // Trigger new API call with updated filters
    this.loadCases();
  }

  private getSortValue(caseItem: Case, field: string): any {
    switch (field) {
      case 'patientName': return caseItem.patientName;
      case 'admitDate': return new Date(caseItem.admitDate);
      case 'primaryDiagnosis': return caseItem.primaryDiagnosis;
      case 'financialImpact': return caseItem.financialImpact || 0;
      case 'priority': return this.getPriorityOrder(caseItem.priority);
      case 'status': return caseItem.status;
      default: return '';
    }
  }

  private getPriorityOrder(priority: string): number {
    switch (priority) {
      case 'Critical': return 4;
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 0;
    }
  }

  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    // Reset to first page when sorting changes
    this.pagination.page = 1;
    // Trigger new API call with updated sorting
    this.loadCases();
  }

  clearFilters() {
    this.searchTerm = '';
    this.priorityFilter = 'all';
    this.statusFilter = 'all';
    this.unitFilter = 'all';
    this.assignedToFilter = 'all';
    this.sortField = '';
    this.sortDirection = 'asc';
    // Reset to first page when clearing filters
    this.pagination.page = 1;
    // Trigger new API call without filters
    this.loadCases();
  }

  trackByCase(index: number, caseItem: Case): string {
    return caseItem.id;
  }

  openCase(caseId: string): void {
    this.selectedCaseId = caseId;
  }

  closeDetails(): void {
    this.selectedCaseId = null;
  }

  getUserInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map(n => n.charAt(0).toUpperCase())
      .join('');
  }

  // Upload Modal Methods
  openUploadDialog(): void {
    this.showUploadDialog = true;
    this.selectedFiles = [];
    this.uploadProgress = 0;
    this.uploading = false;
  }

  closeUploadDialog(): void {
    this.showUploadDialog = false;
    this.selectedFiles = [];
    this.uploadProgress = 0;
    this.uploading = false;
    this.isDragOver = false;
    this.fileValidationErrors = {};
    this.validatingFiles = false;
  }

  triggerFileSelect(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

    private addFiles(files: File[]): void {
    this.validatingFiles = true;
    this.fileValidationErrors = {};
    
    files.forEach(file => {
      this.validateFile(file).then(isValid => {
        if (isValid) {
          // Check if file already exists
          const existingIndex = this.selectedFiles.findIndex(f => f.name === file.name && f.size === file.size);
          if (existingIndex === -1) {
            this.selectedFiles = [...this.selectedFiles, file];
          } else {
            this.fileValidationErrors[file.name] = 'File already selected';
          }
        }
        
        // Check if all files have been processed
        const totalFiles = files.length;
        const processedFiles = Object.keys(this.fileValidationErrors).length + this.selectedFiles.filter(f => files.some(newFile => newFile.name === f.name)).length;
        
        if (processedFiles >= totalFiles) {
          this.validatingFiles = false;
        }
      });
    });
  }

  private async validateFile(file: File): Promise<boolean> {
    // File type validation
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.txt', '.pdf', '.doc', '.docx'];
    
    const hasValidType = allowedTypes.includes(file.type) || 
                        allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidType) {
      this.fileValidationErrors[file.name] = 'Invalid file type. Only PDF, TXT, DOC, and DOCX files are allowed.';
      return false;
    }

    // File size validation (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      this.fileValidationErrors[file.name] = 'File size too large. Maximum size is 50MB.';
      return false;
    }

    // Minimum file size validation (at least 100 bytes)
    if (file.size < 100) {
      this.fileValidationErrors[file.name] = 'File is too small. Appears to be empty or corrupted.';
      return false;
    }

    // Content validation for text files
    if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
      try {
        const content = await this.readFileContent(file);
        if (!this.validateMedicalRecordContent(content)) {
          this.fileValidationErrors[file.name] = 'File does not appear to contain medical record data. Expected patient information, diagnoses, or medical terms.';
          return false;
        }
      } catch (error) {
        this.fileValidationErrors[file.name] = 'Unable to read file content. File may be corrupted.';
        return false;
      }
    }

    return true;
  }

  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private validateMedicalRecordContent(content: string): boolean {
    const medicalKeywords = [
      // Patient identifiers
      'patient', 'mrn', 'medical record', 'dob', 'date of birth',
      // Medical terms
      'diagnosis', 'symptoms', 'treatment', 'medication', 'prescription',
      'doctor', 'physician', 'nurse', 'hospital', 'clinic',
      // Common medical conditions
      'pneumonia', 'diabetes', 'hypertension', 'heart failure', 'stroke',
      'copd', 'sepsis', 'kidney', 'liver', 'cardiac', 'respiratory',
      // Medical procedures
      'surgery', 'procedure', 'operation', 'examination', 'lab', 'test',
      'x-ray', 'ct scan', 'mri', 'ultrasound', 'biopsy',
      // Medical units/departments
      'icu', 'emergency', 'cardiology', 'neurology', 'oncology',
      'orthopedic', 'pediatric', 'surgery', 'medicine',
      // Common medical abbreviations
      'bp', 'hr', 'temp', 'wbc', 'rbc', 'hgb', 'hct', 'icd', 'cpt'
    ];

    const contentLower = content.toLowerCase();
    const wordCount = content.split(/\s+/).length;
    
    // Check if content is substantial (at least 50 words)
    if (wordCount < 50) {
      return false;
    }

    // Check for medical keywords (at least 3 different medical terms)
    const foundKeywords = medicalKeywords.filter(keyword => 
      contentLower.includes(keyword)
    );

    // Must contain at least 3 medical keywords and some structure
    const hasEnoughMedicalTerms = foundKeywords.length >= 3;
    const hasStructure = /patient|name|age|sex|diagnosis|admission|discharge/i.test(content);
    
    return hasEnoughMedicalTerms && hasStructure;
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

    uploadFiles(): void {
    if (this.selectedFiles.length === 0) return;

    this.uploading = true;
    this.uploadProgress = 0;

    // Upload files sequentially to the backend
    this.uploadFilesSequentially(0);
  }

  private uploadFilesSequentially(index: number): void {
    if (index >= this.selectedFiles.length) {
      // All files uploaded, refresh cases and close dialog
      this.uploading = false;
      this.uploadProgress = 100;
      this.loadCases(); // Refresh cases from backend
      
      setTimeout(() => {
        this.closeUploadDialog();
        console.log(`Successfully uploaded ${this.selectedFiles.length} medical record(s) and created cases`);
      }, 500);
      return;
    }

    const file = this.selectedFiles[index];
    const startProgress = (index / this.selectedFiles.length) * 100;
    const endProgress = ((index + 1) / this.selectedFiles.length) * 100;

    this.casesService.uploadMedicalRecord(file).subscribe({
      next: (response) => {
        if (response.success) {
          console.log(`Successfully uploaded ${file.name} and created case:`, response.data);
          this.uploadProgress = endProgress;
          
          // Continue with next file
          setTimeout(() => {
            this.uploadFilesSequentially(index + 1);
          }, 200);
        }
      },
      error: (error) => {
        console.error(`Error uploading ${file.name}:`, error);
        
        // Continue with next file even if one fails
        this.uploadProgress = endProgress;
        setTimeout(() => {
          this.uploadFilesSequentially(index + 1);
        }, 200);
      }
    });
  }

  

  // Pagination Methods
  previousPage(): void {
    if (this.pagination.page > 1) {
      this.pagination.page--;
      this.loadCases();
    }
  }

  nextPage(): void {
    if (this.pagination.page < this.pagination.totalPages) {
      this.pagination.page++;
      this.loadCases();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.pagination.totalPages && page !== this.pagination.page) {
      this.pagination.page = page;
      this.loadCases();
    }
  }
} 