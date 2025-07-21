import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CaseFlag {
  id: string;
  type: 'clinical' | 'coding' | 'compliance';
  text: string;
  severity: 'high' | 'medium' | 'low';
  dateCreated: Date;
  createdBy: string;
}

export interface CaseQuery {
  id: string;
  content: string;
  sentTo: string;
  sentDate: Date;
  sentBy: string;
  status: 'Sent' | 'Responded' | 'Closed';
  priority: 'High' | 'Medium' | 'Low';
  responseDate?: Date;
  response?: string;
}

export interface Case {
  id: string;
  caseNumber: string;
  patientName: string;
  mrn: string;
  age: number;
  sex: 'M' | 'F' | 'Other';
  admitDate: string;
  dischargeDate?: string;
  lengthOfStay: number;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  currentDrg: string;
  suggestedDrg?: string;
  drgWeight?: number;
  financialImpact?: number;
  formattedImpact?: string;
  unit: string;
  room?: string;
  attendingPhysician: string;
  assignedTo?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'New' | 'In Progress' | 'Query Sent' | 'Physician Response' | 'Completed' | 'On Hold';
  flags: CaseFlag[];
  queries: CaseQuery[];
  notes?: string;
  reviewNotes?: string;
  complianceScore?: number;
  riskScore?: number;
  lastReviewDate?: Date;
  lastReviewedBy?: string;
  dueDate?: string;
  escalated: boolean;
  escalationReason?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  daysSinceAdmit?: number;
  priorityScore?: number;
}

export interface CasesResponse {
  success: boolean;
  data: {
    cases: Case[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface CaseResponse {
  success: boolean;
  data: Case;
  message?: string;
}

export interface DashboardMetrics {
  newCases: number;
  inProgress: number;
  queriesSent: number;
  highPriority: number;
  totalImpact: number;
}

export interface CaseFilters {
  search?: string;
  priority?: string;
  status?: string;
  unit?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable({
  providedIn: 'root'
})
export class CasesService {
  private apiUrl = `${environment.apiUrl}/cases`;
  private casesSubject = new BehaviorSubject<Case[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private metricsSubject = new BehaviorSubject<DashboardMetrics | null>(null);

  public cases$ = this.casesSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public metrics$ = this.metricsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get all cases with filtering and pagination
  getCases(filters?: CaseFilters): Observable<CasesResponse> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof CaseFilters];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<CasesResponse>(this.apiUrl, { params }).pipe(
      tap(response => {
        if (response.success) {
          this.casesSubject.next(response.data.cases);
        }
        this.loadingSubject.next(false);
      })
    );
  }

  // Get case by ID
  getCaseById(id: string): Observable<CaseResponse> {
    return this.http.get<CaseResponse>(`${this.apiUrl}/${id}`);
  }

  // Create new case
  createCase(caseData: Partial<Case>): Observable<CaseResponse> {
    return this.http.post<CaseResponse>(this.apiUrl, caseData).pipe(
      tap(response => {
        if (response.success) {
          // Refresh the cases list
          this.refreshCases();
        }
      })
    );
  }

  // Update case
  updateCase(id: string, caseData: Partial<Case>): Observable<CaseResponse> {
    return this.http.put<CaseResponse>(`${this.apiUrl}/${id}`, caseData).pipe(
      tap(response => {
        if (response.success) {
          // Update the local case in the list
          const currentCases = this.casesSubject.value;
          const updatedCases = currentCases.map(c => 
            c.id === id ? { ...c, ...response.data } : c
          );
          this.casesSubject.next(updatedCases);
        }
      })
    );
  }

  // Delete case
  deleteCase(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(response => {
        if (response) {
          // Remove the case from the local list
          const currentCases = this.casesSubject.value;
          const filteredCases = currentCases.filter(c => c.id !== id);
          this.casesSubject.next(filteredCases);
        }
      })
    );
  }

  // Add flag to case
  addFlag(caseId: string, flagData: Partial<CaseFlag>): Observable<CaseResponse> {
    return this.http.post<CaseResponse>(`${this.apiUrl}/${caseId}/flags`, flagData).pipe(
      tap(response => {
        if (response.success) {
          this.updateLocalCase(caseId, response.data);
        }
      })
    );
  }

  // Remove flag from case
  removeFlag(caseId: string, flagId: string): Observable<CaseResponse> {
    return this.http.delete<CaseResponse>(`${this.apiUrl}/${caseId}/flags/${flagId}`).pipe(
      tap(response => {
        if (response.success) {
          this.updateLocalCase(caseId, response.data);
        }
      })
    );
  }

  // Add query to case
  addQuery(caseId: string, queryData: Partial<CaseQuery>): Observable<CaseResponse> {
    return this.http.post<CaseResponse>(`${this.apiUrl}/${caseId}/queries`, queryData).pipe(
      tap(response => {
        if (response.success) {
          this.updateLocalCase(caseId, response.data);
        }
      })
    );
  }

  // Update query
  updateQuery(caseId: string, queryId: string, updateData: Partial<CaseQuery>): Observable<CaseResponse> {
    return this.http.put<CaseResponse>(`${this.apiUrl}/${caseId}/queries/${queryId}`, updateData).pipe(
      tap(response => {
        if (response.success) {
          this.updateLocalCase(caseId, response.data);
        }
      })
    );
  }

  // Get dashboard metrics
  getDashboardMetrics(): Observable<{ success: boolean; data: DashboardMetrics }> {
    return this.http.get<{ success: boolean; data: DashboardMetrics }>(`${this.apiUrl}/dashboard-metrics`).pipe(
      tap(response => {
        if (response.success) {
          this.metricsSubject.next(response.data);
        }
      })
    );
  }

  // Get cases by priority
  getCasesByPriority(priority: string): Observable<{ success: boolean; data: Case[] }> {
    return this.http.get<{ success: boolean; data: Case[] }>(`${this.apiUrl}/priority/${priority}`);
  }

  // Get assigned cases
  getAssignedCases(userId: string): Observable<{ success: boolean; data: Case[] }> {
    return this.http.get<{ success: boolean; data: Case[] }>(`${this.apiUrl}/assigned/${userId}`);
  }

  // Bulk update cases
  bulkUpdateCases(caseIds: string[], updateData: Partial<Case>): Observable<any> {
    return this.http.put(`${this.apiUrl}/bulk/update`, { caseIds, updateData }).pipe(
      tap(() => {
        // Refresh cases after bulk update
        this.refreshCases();
      })
    );
  }

  // Get case statistics
  getCaseStatistics(timeframe = '30'): Observable<any> {
    const params = new HttpParams().set('timeframe', timeframe);
    return this.http.get(`${this.apiUrl}/statistics`, { params });
  }

  // Utility methods
  refreshCases(filters?: CaseFilters): void {
    this.getCases(filters).subscribe();
  }

  private updateLocalCase(caseId: string, updatedCase: Case): void {
    const currentCases = this.casesSubject.value;
    const updatedCases = currentCases.map(c => 
      c.id === caseId ? updatedCase : c
    );
    this.casesSubject.next(updatedCases);
  }

  // Helper methods for UI
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'Critical': return 'text-red-700 bg-red-100';
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'New': return 'text-blue-700 bg-blue-100';
      case 'In Progress': return 'text-purple-700 bg-purple-100';
      case 'Query Sent': return 'text-orange-700 bg-orange-100';
      case 'Physician Response': return 'text-indigo-700 bg-indigo-100';
      case 'Completed': return 'text-green-700 bg-green-100';
      case 'On Hold': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  }

  getFlagIcon(type: string): string {
    switch (type) {
      case 'clinical': return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
      case 'coding': return 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1';
      case 'compliance': return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  // Clear local state
  clearCases(): void {
    this.casesSubject.next([]);
    this.metricsSubject.next(null);
  }
} 