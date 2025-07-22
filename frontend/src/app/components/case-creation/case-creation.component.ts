import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MemberService, Member, MembersResponse } from '../../services/member.service';
import { CaseService, LookupDataResponse, CaseResponse, AttachmentResponse } from '../../services/case.service';

export interface CaseCreationData {
  memberId: string;
  patientName: string;
  mrn: string;
  age: number;
  sex: 'M' | 'F';
  admitDate: string;
  dischargeDate?: string;
  primaryDiagnosis: string;
  secondaryDiagnoses?: string[];
  facility: string;
  serviceLine: string;
  unit: string;
  attendingPhysician: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  notes?: string;
}

export interface LookupOptions {
  facilities: string[];
  serviceLines: string[];
  priorities: string[];
  statuses: string[];
  workflowStatuses: string[];
}

@Component({
  selector: 'app-case-creation',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './case-creation.component.html',
  styleUrls: ['./case-creation.component.scss']
})
export class CaseCreationComponent implements OnInit {
  
  caseForm: FormGroup;
  loading = false;
  submitting = false;
  success = false;
  error: string | null = null;
  createdCaseId: string | null = null;
  
  // Data
  members: Member[] = [];
  filteredMembers: Member[] = [];
  selectedMember: Member | null = null;
  lookupOptions: LookupOptions = {
    facilities: [],
    serviceLines: [],
    priorities: ['Low', 'Medium', 'High', 'Critical'],
    statuses: ['Open', 'In Progress', 'Closed', 'Submitted for Review'],
    workflowStatuses: ['Draft', 'Active', 'Under Review', 'Completed']
  };

  // Form sections
  currentSection = 1;
  totalSections = 4;
  
  sectionTitles = [
    'Patient Selection',
    'Medical Information',
    'Administrative Details',
    'Notes & Attachments'
  ];

  // File upload
  selectedFiles: File[] = [];
  uploadProgress: { [key: string]: number } = {};

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService,
    private caseService: CaseService,
    private router: Router
  ) {
    this.caseForm = this.createForm();
  }

  ngOnInit() {
    this.loadMembers();
    this.loadLookupOptions();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Patient Selection
      memberSearch: [''],
      memberId: ['', Validators.required],
      patientName: [{ value: '', disabled: true }],
      mrn: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(0), Validators.max(150)]],
      sex: ['', Validators.required],
      
      // Medical Information
      admitDate: ['', Validators.required],
      dischargeDate: [''],
      primaryDiagnosis: ['', Validators.required],
      secondaryDiagnoses: [''],
      
      // Administrative Details
      facility: ['', Validators.required],
      serviceLine: ['', Validators.required],
      unit: ['', Validators.required],
      attendingPhysician: ['', Validators.required],
      priority: ['Medium', Validators.required],
      
      // Notes
      notes: ['']
    });
  }

  private loadMembers() {
    this.loading = true;
    this.memberService.getMembers({ limit: 100 }).subscribe({
      next: (response: MembersResponse) => {
        if (response.success) {
          this.members = response.data.members;
          this.filteredMembers = this.members;
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading members:', error);
        this.loading = false;
      }
    });
  }

  private loadLookupOptions() {
    this.caseService.getLookupData().subscribe({
      next: (response) => {
        if (response.success) {
          this.lookupOptions = { ...this.lookupOptions, ...response.data };
        }
      },
      error: (error) => {
        console.error('Error loading lookup options:', error);
      }
    });
  }

  // Member search and selection
  onMemberSearch(searchTerm: string) {
    if (!searchTerm.trim()) {
      this.filteredMembers = this.members;
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredMembers = this.members.filter(member => 
      member.firstName.toLowerCase().includes(term) ||
      member.lastName.toLowerCase().includes(term) ||
      member.memberId?.toLowerCase().includes(term) ||
      member.email?.toLowerCase().includes(term)
    );
  }

  selectMember(member: Member) {
    this.selectedMember = member;
    this.caseForm.patchValue({
      memberSearch: `${member.firstName} ${member.lastName} (${member.memberId})`,
      memberId: member.id,
      patientName: `${member.firstName} ${member.lastName}`,
      sex: member.gender,
      age: this.calculateAge(member.dateOfBirth)
    });
    this.filteredMembers = [];
  }

  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Navigation methods
  nextSection() {
    if (this.currentSection < this.totalSections) {
      if (this.isCurrentSectionValid()) {
        this.currentSection++;
      }
    }
  }

  previousSection() {
    if (this.currentSection > 1) {
      this.currentSection--;
    }
  }

  goToSection(section: number) {
    if (section >= 1 && section <= this.totalSections) {
      this.currentSection = section;
    }
  }

  isCurrentSectionValid(): boolean {
    const currentSectionFields = this.getCurrentSectionFields();
    return currentSectionFields.every(field => {
      const control = this.caseForm.get(field);
      return control ? control.valid : true;
    });
  }

  private getCurrentSectionFields(): string[] {
    switch (this.currentSection) {
      case 1:
        return ['memberId', 'mrn', 'age', 'sex'];
      case 2:
        return ['admitDate', 'primaryDiagnosis'];
      case 3:
        return ['facility', 'serviceLine', 'unit', 'attendingPhysician', 'priority'];
      case 4:
        return [];
      default:
        return [];
    }
  }

  // File handling
  onFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    for (const file of files) {
      if (this.isValidFile(file)) {
        this.selectedFiles.push(file);
      }
    }
  }

  private isValidFile(file: File): boolean {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 
                         'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'text/plain'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
      this.error = `File type not allowed: ${file.name}`;
      return false;
    }

    if (file.size > maxSize) {
      this.error = `File too large: ${file.name}`;
      return false;
    }

    return true;
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  // Drag and drop
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    const files = Array.from(event.dataTransfer?.files || []);
    for (const file of files) {
      if (this.isValidFile(file)) {
        this.selectedFiles.push(file);
      }
    }
  }

  // Form submission
  onSubmit() {
    if (this.caseForm.valid) {
      this.submitting = true;
      this.error = null;

      const formValue = this.caseForm.value;
      const caseData: CaseCreationData = {
        memberId: formValue.memberId,
        patientName: formValue.patientName,
        mrn: formValue.mrn,
        age: formValue.age,
        sex: formValue.sex,
        admitDate: formValue.admitDate,
        dischargeDate: formValue.dischargeDate || undefined,
        primaryDiagnosis: formValue.primaryDiagnosis,
        secondaryDiagnoses: formValue.secondaryDiagnoses ? 
          formValue.secondaryDiagnoses.split(',').map((d: string) => d.trim()) : [],
        facility: formValue.facility,
        serviceLine: formValue.serviceLine,
        unit: formValue.unit,
        attendingPhysician: formValue.attendingPhysician,
        priority: formValue.priority,
        notes: formValue.notes || undefined
      };
      
      this.caseService.createCase(caseData).subscribe({
        next: (response) => {
          if (response.success) {
            this.createdCaseId = response.data.id;
            
            // Upload files if any
            if (this.selectedFiles.length > 0) {
              this.uploadAttachments(response.data.id);
            } else {
              this.success = true;
              this.submitting = false;
              
              // Redirect after success
              setTimeout(() => {
                this.router.navigate(['/cases', response.data.id]);
              }, 2000);
            }
          }
        },
        error: (error) => {
          this.error = error.error?.error || 'Failed to create case. Please try again.';
          this.submitting = false;
        }
      });
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private uploadAttachments(caseId: string) {
    const uploadPromises = this.selectedFiles.map((file, index) => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', this.getFileType(file));
        formData.append('description', `Uploaded during case creation`);

        this.caseService.uploadAttachment(caseId, formData).subscribe({
          next: (response) => {
            this.uploadProgress[file.name] = 100;
            resolve(response);
          },
          error: (error) => {
            console.error(`Error uploading ${file.name}:`, error);
            reject(error);
          }
        });
      });
    });

    Promise.allSettled(uploadPromises).then(() => {
      this.success = true;
      this.submitting = false;
      
      setTimeout(() => {
        this.router.navigate(['/cases', caseId]);
      }, 2000);
    });
  }

  private getFileType(file: File): string {
    if (file.type.includes('image')) return 'Image';
    if (file.type.includes('pdf')) return 'Document';
    if (file.type.includes('word')) return 'Document';
    if (file.type.includes('text')) return 'Medical Record';
    return 'Other';
  }

  private markAllFieldsAsTouched() {
    Object.keys(this.caseForm.controls).forEach(key => {
      this.caseForm.get(key)?.markAsTouched();
    });
  }

  // Utility methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.caseForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.caseForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['min']) return `${fieldName} must be at least ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} must not exceed ${field.errors['max'].max}`;
    }
    return '';
  }

  // Progress calculation
  getProgressPercentage(): number {
    return (this.currentSection / this.totalSections) * 100;
  }

  // Reset form
  resetForm() {
    this.caseForm.reset();
    this.currentSection = 1;
    this.success = false;
    this.error = null;
    this.selectedMember = null;
    this.selectedFiles = [];
    this.uploadProgress = {};
    this.caseForm.patchValue({ priority: 'Medium' });
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 