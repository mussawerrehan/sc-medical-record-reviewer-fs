// User and Auth Models
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  HOSPITAL_ADMIN = 'hospital_admin',
  PROVIDER = 'provider'
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  hospitalIds?: string[];
}

export interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Claim Models
export enum ClaimStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum ClaimType {
  PROFESSIONAL = 'professional',
  INSTITUTIONAL = 'institutional',
  DRG = 'drg',
  MEDICAL = 'medical',
  DENTAL = 'dental',
  VISION = 'vision',
  PHARMACY = 'pharmacy'
}

export interface CPTCode {
  code: string;
  description: string;
}

export interface ICD10Code {
  code: string;
  description: string;
}

interface ProfessionalClaim {
  cptCodes: CPTCode[];
  icd10Codes: ICD10Code[];
}

interface InstitutionalClaim {
  admissionDate: Date;
  dischargeDate: Date;
  revenueCode: string;
  icd10BillingCodes: ICD10Code[];
}

interface DRGClaim {
  drgCode: string;
  drgDescription: string;
  expectedReimbursement: number;
  lengthOfStay: number;
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

export interface ProcessingHistoryItem {
  date: Date;
  status: ClaimStatus;
  notes: string;
  userId: string;
}

export interface Claim {
  id: string;
  patientName: string;
  patientId: string;
  type: ClaimType;
  status: ClaimStatus;
  amount: number;
  totalAmount: number;
  dateOfService: Date;
  submissionDate: Date;
  providerId: string;
  hospitalId: string;
  description: string;
  attachments?: string[];
  professionalClaim?: ProfessionalClaim;
  institutionalClaim?: InstitutionalClaim;
  drgClaim?: DRGClaim;
  validationErrors?: ValidationError[];
  processingHistory?: ProcessingHistoryItem[];
}

export interface CreateClaimRequest {
  patientName: string;
  patientId: string;
  type: ClaimType;
  amount: number;
  totalAmount: number;
  dateOfService: Date;
  providerId: string;
  hospitalId: string;
  description: string;
  attachments?: string[];
  professionalClaim?: ProfessionalClaim;
  institutionalClaim?: InstitutionalClaim;
  drgClaim?: DRGClaim;
}

export interface UpdateClaimRequest {
  patientId?: string;
  status?: ClaimStatus;
  amount?: number;
  totalAmount?: number;
  dateOfService?: Date;
  description?: string;
  attachments?: string[];
  professionalClaim?: ProfessionalClaim;
  institutionalClaim?: InstitutionalClaim;
  drgClaim?: DRGClaim;
}

// Hospital Models
export interface ContactInfo {
  phone: string;
  email: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: Address;
  npi: string;
  licenseNumber: string;
  contactInfo: ContactInfo;
  isActive: boolean;
  providerIds: string[];
}

export interface CreateHospitalRequest {
  name: string;
  address: Address;
  npi: string;
  licenseNumber: string;
  contactInfo: ContactInfo;
}

export interface UpdateHospitalRequest {
  name?: string;
  address?: Address;
  npi?: string;
  licenseNumber?: string;
  contactInfo?: ContactInfo;
  isActive?: boolean;
}

export interface AssociateProviderRequest {
  providerId: string;
}

// Provider Models
export enum Specialty {
  GENERAL_MEDICINE = 'general_medicine',
  CARDIOLOGY = 'cardiology',
  ORTHOPEDICS = 'orthopedics',
  PEDIATRICS = 'pediatrics',
  NEUROLOGY = 'neurology',
  DERMATOLOGY = 'dermatology',
  OPHTHALMOLOGY = 'ophthalmology',
  DENTISTRY = 'dentistry'
}

export interface ProviderName {
  first: string;
  middle?: string;
  last: string;
}

export interface Provider {
  id: string;
  name: ProviderName;
  specialty: Specialty;
  npi: string;
  licenseNumber: string;
  contactInfo: ContactInfo;
  isActive: boolean;
  hospitalIds: string[];
}

export interface CreateProviderRequest {
  name: ProviderName;
  specialty: Specialty;
  npi: string;
  licenseNumber: string;
  contactInfo: ContactInfo;
}

export interface UpdateProviderRequest {
  name?: ProviderName;
  specialty?: Specialty;
  npi?: string;
  licenseNumber?: string;
  contactInfo?: ContactInfo;
  isActive?: boolean;
}

export interface AssociateHospitalRequest {
  hospitalId: string;
} 