export enum Specialty {
  INTERNAL_MEDICINE = 'Internal Medicine',
  FAMILY_PRACTICE = 'Family Practice',
  PEDIATRICS = 'Pediatrics',
  CARDIOLOGY = 'Cardiology',
  ORTHOPEDICS = 'Orthopedics',
  NEUROLOGY = 'Neurology',
  PSYCHIATRY = 'Psychiatry',
  ONCOLOGY = 'Oncology',
  EMERGENCY_MEDICINE = 'Emergency Medicine',
  SURGERY = 'Surgery',
  OTHER = 'Other'
}

export interface Name {
  first: string;
  last: string;
  middle?: string;
}

export interface Provider {
  id: string;
  name: Name;
  npi: string;
  specialty: Specialty;
  hospitalIds: string[];
  userId: string;
  licenseNumber: string;
  contactInfo: {
    email: string;
    phone: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProviderRequest {
  name: Name;
  npi: string;
  specialty: Specialty;
  licenseNumber: string;
  contactInfo: {
    email: string;
    phone: string;
  };
  userId: string;
}

export interface UpdateProviderRequest {
  name?: Name;
  npi?: string;
  specialty?: Specialty;
  licenseNumber?: string;
  contactInfo?: {
    email: string;
    phone: string;
  };
  isActive?: boolean;
}

export interface AssociateHospitalRequest {
  hospitalId: string;
} 