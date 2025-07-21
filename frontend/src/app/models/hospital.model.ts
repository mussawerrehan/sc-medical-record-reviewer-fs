export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: Address;
  npi: string;
  providerIds: string[];
  isActive: boolean;
  contactInfo: ContactInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHospitalRequest {
  name: string;
  address: Address;
  npi: string;
  contactInfo: ContactInfo;
}

export interface UpdateHospitalRequest {
  name?: string;
  address?: Address;
  npi?: string;
  contactInfo?: ContactInfo;
  isActive?: boolean;
}

export interface AssociateProviderRequest {
  providerId: string;
} 