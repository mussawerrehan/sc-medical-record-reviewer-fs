export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  PROVIDER = 'provider',
  HOSPITAL_ADMIN = 'hospital_admin'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  hospitalIds?: string[];
  isActive: boolean;
  lastLogin?: Date;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface UpdateProfileRequest {
  name?: string;
  password?: string;
} 