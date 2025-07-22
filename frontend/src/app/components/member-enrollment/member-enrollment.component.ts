import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MemberService, Member, LookupOptionsResponse, MemberResponse } from '../../services/member.service';

export interface EnrollmentOptions {
  genders: string[];
  states: string[];
  insuranceProviders: string[];
  statuses: string[];
}

@Component({
  selector: 'app-member-enrollment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './member-enrollment.component.html',
  styleUrls: ['./member-enrollment.component.scss']
})
export class MemberEnrollmentComponent implements OnInit {
  
  enrollmentForm: FormGroup;
  loading = false;
  submitting = false;
  success = false;
  error: string | null = null;
  
  options: EnrollmentOptions = {
    genders: ['M', 'F', 'Other'],
    states: [],
    insuranceProviders: [],
    statuses: ['Active', 'Inactive', 'Pending']
  };

  // Form sections
  currentSection = 1;
  totalSections = 4;
  
  sectionTitles = [
    'Personal Information',
    'Contact Information', 
    'Insurance Information',
    'Medical Information'
  ];

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService,
    private router: Router
  ) {
    this.enrollmentForm = this.createForm();
  }

  ngOnInit() {
    this.loadOptions();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Personal Information
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      ssn: ['', [Validators.pattern(/^\d{3}-?\d{2}-?\d{4}$/)]],
      
      // Contact Information
      address: [''],
      city: [''],
      state: [''],
      zipCode: ['', [Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      phone: ['', [Validators.pattern(/^\+?1?-?\(?(\d{3})\)?-?(\d{3})-?(\d{4})$/)]],
      email: ['', [Validators.email]],
      
      // Emergency Contact
      emergencyContactName: [''],
      emergencyContactPhone: ['', [Validators.pattern(/^\+?1?-?\(?(\d{3})\)?-?(\d{3})-?(\d{4})$/)]],
      
      // Insurance Information
      insuranceProvider: [''],
      policyNumber: [''],
      groupNumber: [''],
      
      // Medical Information
      allergies: [''],
      medications: [''],
      medicalHistory: ['']
    });
  }

  private loadOptions() {
    this.memberService.getLookupOptions().subscribe({
      next: (response: LookupOptionsResponse) => {
        if (response.success) {
          this.options = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading options:', error);
        // Use default options
        this.options = {
          genders: ['M', 'F', 'Other'],
          states: [
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
            'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
            'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
            'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
            'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
          ],
          insuranceProviders: [
            'Aetna', 'Anthem', 'Blue Cross Blue Shield', 'Cigna', 'Humana',
            'Kaiser Permanente', 'Molina Healthcare', 'UnitedHealth Group',
            'Medicaid', 'Medicare', 'Other'
          ],
          statuses: ['Active', 'Inactive', 'Pending']
        };
      }
    });
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
      const control = this.enrollmentForm.get(field);
      return control ? control.valid : true;
    });
  }

  private getCurrentSectionFields(): string[] {
    switch (this.currentSection) {
      case 1:
        return ['firstName', 'lastName', 'dateOfBirth', 'gender', 'ssn'];
      case 2:
        return ['address', 'city', 'state', 'zipCode', 'phone', 'email', 'emergencyContactName', 'emergencyContactPhone'];
      case 3:
        return ['insuranceProvider', 'policyNumber', 'groupNumber'];
      case 4:
        return ['allergies', 'medications', 'medicalHistory'];
      default:
        return [];
    }
  }

  // Form submission
  onSubmit() {
    if (this.enrollmentForm.valid) {
      this.submitting = true;
      this.error = null;

      const memberData: Member = this.enrollmentForm.value;
      
      this.memberService.createMember(memberData).subscribe({
        next: (response: MemberResponse) => {
          if (response.success) {
            this.success = true;
            this.submitting = false;
            
            // Show success message then redirect
            setTimeout(() => {
              this.router.navigate(['/members']);
            }, 2000);
          }
        },
        error: (error: any) => {
          this.error = error.error?.error || 'Failed to enroll member. Please try again.';
          this.submitting = false;
        }
      });
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private markAllFieldsAsTouched() {
    Object.keys(this.enrollmentForm.controls).forEach(key => {
      this.enrollmentForm.get(key)?.markAsTouched();
    });
  }

  // Utility methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.enrollmentForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.enrollmentForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['pattern']) {
        if (fieldName === 'ssn') return 'Please enter a valid SSN (XXX-XX-XXXX)';
        if (fieldName === 'phone' || fieldName === 'emergencyContactPhone') return 'Please enter a valid phone number';
        if (fieldName === 'zipCode') return 'Please enter a valid ZIP code';
      }
    }
    return '';
  }

  formatSSN(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 6) {
      value = value.substring(0, 3) + '-' + value.substring(3, 5) + '-' + value.substring(5, 9);
    } else if (value.length >= 4) {
      value = value.substring(0, 3) + '-' + value.substring(3, 5) + '-' + value.substring(5);
    } else if (value.length >= 3) {
      value = value.substring(0, 3) + '-' + value.substring(3);
    }
    this.enrollmentForm.patchValue({ ssn: value });
  }

  formatPhone(event: any, fieldName: string) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 7) {
      value = '(' + value.substring(0, 3) + ') ' + value.substring(3, 6) + '-' + value.substring(6, 10);
    } else if (value.length >= 4) {
      value = '(' + value.substring(0, 3) + ') ' + value.substring(3);
    } else if (value.length >= 1) {
      value = '(' + value;
    }
    this.enrollmentForm.patchValue({ [fieldName]: value });
  }

  // Progress calculation
  getProgressPercentage(): number {
    return (this.currentSection / this.totalSections) * 100;
  }

  // Reset form
  resetForm() {
    this.enrollmentForm.reset();
    this.currentSection = 1;
    this.success = false;
    this.error = null;
  }
} 