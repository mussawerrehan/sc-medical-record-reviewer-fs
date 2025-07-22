import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Member {
  id?: string;
  memberId?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'Other';
  ssn?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  groupNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medications?: string;
  medicalHistory?: string;
  status?: string;
  enrolledBy?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MembersResponse {
  success: boolean;
  data: {
    members: Member[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface MemberResponse {
  success: boolean;
  data: Member;
  message?: string;
}

export interface LookupOptionsResponse {
  success: boolean;
  data: {
    genders: string[];
    states: string[];
    insuranceProviders: string[];
    statuses: string[];
  };
}

export interface MemberAnalytics {
  totalCases: number;
  activeCases: number;
  totalClaims: number;
  approvedClaims: number;
  deniedClaims: number;
  pendingClaims: number;
  totalClaimAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  averageProcessingTime: number;
  casesByStatus: Array<{ status: string; count: number }>;
  claimsByMonth: Array<{ month: string; approved: number; denied: number; pending: number }>;
}

export interface MemberAnalyticsResponse {
  success: boolean;
  data: MemberAnalytics;
}

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private apiUrl = `${environment.apiUrl}/members`;

  constructor(private http: HttpClient) { }

  // Get all members for the logged-in user
  getMembers(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Observable<MembersResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.status) params = params.set('status', filters.status);
    }

    return this.http.get<MembersResponse>(this.apiUrl, { params });
  }

  // Get member by ID
  getMember(id: string): Observable<MemberResponse> {
    return this.http.get<MemberResponse>(`${this.apiUrl}/${id}`);
  }

  // Create new member
  createMember(member: Member): Observable<MemberResponse> {
    return this.http.post<MemberResponse>(this.apiUrl, member);
  }

  // Update member
  updateMember(id: string, member: Partial<Member>): Observable<MemberResponse> {
    return this.http.put<MemberResponse>(`${this.apiUrl}/${id}`, member);
  }

  // Delete member (soft delete)
  deleteMember(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  // Get member analytics
  getMemberAnalytics(id: string): Observable<MemberAnalyticsResponse> {
    return this.http.get<MemberAnalyticsResponse>(`${this.apiUrl}/${id}/analytics`);
  }

  // Get lookup options for dropdowns
  getLookupOptions(): Observable<LookupOptionsResponse> {
    return this.http.get<LookupOptionsResponse>(`${this.apiUrl}/lookup/options`);
  }

  // Search members
  searchMembers(query: string): Observable<MembersResponse> {
    const params = new HttpParams().set('search', query).set('limit', '20');
    return this.http.get<MembersResponse>(this.apiUrl, { params });
  }

  // Get member summary for dashboard
  getMemberSummary(): Observable<{
    success: boolean;
    data: {
      totalMembers: number;
      activeMembers: number;
      newThisMonth: number;
      recentEnrollments: Member[];
    };
  }> {
    return this.http.get<{
      success: boolean;
      data: {
        totalMembers: number;
        activeMembers: number;
        newThisMonth: number;
        recentEnrollments: Member[];
      };
    }>(`${this.apiUrl}/summary`);
  }
} 