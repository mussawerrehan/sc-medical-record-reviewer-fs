export enum ClaimType {
  PROFESSIONAL = 'professional',
  INSTITUTIONAL = 'institutional',
  DRG = 'drg'
}

export enum ClaimStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  REJECTED = 'rejected',
  APPROVED = 'approved'
}

export interface CodeWithDescription {
  code: string;
  description: string;
}

export interface CPTCode extends CodeWithDescription {
  modifier?: string;
  quantity: number;
  amount: number;
}

export interface ProfessionalClaim {
  cptCodes: CPTCode[];
  icd10Codes: CodeWithDescription[];
}

export interface InstitutionalClaim {
  admissionDate: Date;
  dischargeDate: Date;
  icd10BillingCodes: CodeWithDescription[];
  revenueCode: string;
}

export interface DRGClaim {
  drgCode: string;
  drgDescription: string;
  expectedReimbursement: number;
  lengthOfStay: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ProcessingHistory {
  status: ClaimStatus;
  date: Date;
  notes?: string;
  userId: string;
}

export interface Claim {
  id: string;
  type: ClaimType;
  patientId: string;
  providerId: string;
  hospitalId: string;
  status: ClaimStatus;
  dateOfService: Date;
  submissionDate?: Date;
  totalAmount: number;
  professionalClaim?: ProfessionalClaim;
  institutionalClaim?: InstitutionalClaim;
  drgClaim?: DRGClaim;
  validationErrors: ValidationError[];
  processingHistory: ProcessingHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClaimRequest {
  type: ClaimType;
  patientId: string;
  hospitalId: string;
  dateOfService: Date;
  totalAmount: number;
  professionalClaim?: ProfessionalClaim;
  institutionalClaim?: InstitutionalClaim;
  drgClaim?: DRGClaim;
}

export interface UpdateClaimRequest {
  patientId?: string;
  hospitalId?: string;
  dateOfService?: Date;
  totalAmount?: number;
  professionalClaim?: ProfessionalClaim;
  institutionalClaim?: InstitutionalClaim;
  drgClaim?: DRGClaim;
} 