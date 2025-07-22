import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Case {
  id: string;
  caseNumber: string;
  memberId: string;
  patientName: string;
  mrn: string;
  age: number;
  sex: 'M' | 'F';
  admitDate: string;
  dischargeDate?: string;
  lengthOfStay?: number;
  primaryDiagnosis: string;
  secondaryDiagnoses?: string[];
  facility: string;
  serviceLine: string;
  unit: string;
  attendingPhysician: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Closed' | 'Submitted for Review' | 'Approved' | 'Rejected';
  workflowStatus: 'Draft' | 'Active' | 'Under Review' | 'Completed' | 'Cancelled';
  complianceScore?: number;
  riskScore?: number;
  financialImpact?: number;
  createdBy: string;
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface CaseResponse {
  success: boolean;
  data: Case;
  message?: string;
}

export interface CasesResponse {
  success: boolean;
  data: {
    cases: Case[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface Attachment {
  id: string;
  caseId: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileType: 'Medical Record' | 'Lab Result' | 'Image' | 'Document' | 'Other';
  description?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface AttachmentResponse {
  success: boolean;
  data: Attachment;
  message?: string;
}

export interface AttachmentsResponse {
  success: boolean;
  data: Attachment[];
}

export interface CaseNote {
  id: string;
  caseId: string;
  noteType: 'General' | 'Clinical' | 'Administrative' | 'Review' | 'Query' | 'System';
  title?: string;
  content: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  isPrivate: boolean;
  tags: string[];
  createdBy: string;
  mentionedUsers: string[];
  createdAt: string;
}

export interface CaseNoteResponse {
  success: boolean;
  data: CaseNote;
  message?: string;
}

export interface CaseNotesResponse {
  success: boolean;
  data: CaseNote[];
}

export interface ActivityLog {
  id: string;
  caseId: string;
  activityType: string;
  description: string;
  oldValue?: any;
  newValue?: any;
  performedBy: string;
  performedAt: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

export interface ActivityLogsResponse {
  success: boolean;
  data: {
    activities: ActivityLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface LookupDataResponse {
  success: boolean;
  data: {
    facilities: string[];
    serviceLines: string[];
    userRoles: string[];
    priorities: string[];
    statuses: string[];
    workflowStatuses: string[];
  };
}

export interface WorkflowUpdateData {
  status?: string;
  workflowStatus?: string;
  notes?: string;
}

export interface CompleteCase {
  case: Case;
  attachments: Attachment[];
  notes: CaseNote[];
  recentActivities: ActivityLog[];
}

export interface CompleteCaseResponse {
  success: boolean;
  data: CompleteCase;
}

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private apiUrl = `${environment.apiUrl}/enhanced-cases`;

  constructor(private http: HttpClient) { }

  // Case CRUD operations
  createCase(caseData: CaseCreationData): Observable<CaseResponse> {
    return this.http.post<CaseResponse>(`${this.apiUrl}/create`, caseData);
  }

  getCase(id: string): Observable<CaseResponse> {
    return this.http.get<CaseResponse>(`${this.apiUrl}/${id}`);
  }

  getCases(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    priority?: string;
    status?: string;
    facility?: string;
    serviceLine?: string;
    assignedTo?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Observable<CasesResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.priority) params = params.set('priority', filters.priority);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.facility) params = params.set('facility', filters.facility);
      if (filters.serviceLine) params = params.set('serviceLine', filters.serviceLine);
      if (filters.assignedTo) params = params.set('assignedTo', filters.assignedTo);
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    }

    return this.http.get<CasesResponse>(this.apiUrl, { params });
  }

  updateCase(id: string, caseData: Partial<Case>): Observable<CaseResponse> {
    return this.http.put<CaseResponse>(`${this.apiUrl}/${id}`, caseData);
  }

  deleteCase(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  // Workflow management
  updateWorkflow(id: string, workflowData: WorkflowUpdateData): Observable<CaseResponse> {
    return this.http.put<CaseResponse>(`${this.apiUrl}/${id}/workflow`, workflowData);
  }

  // Attachment management
  uploadAttachment(caseId: string, formData: FormData): Observable<AttachmentResponse> {
    return this.http.post<AttachmentResponse>(`${this.apiUrl}/${caseId}/attachments`, formData);
  }

  getAttachments(caseId: string): Observable<AttachmentsResponse> {
    return this.http.get<AttachmentsResponse>(`${this.apiUrl}/${caseId}/attachments`);
  }

  deleteAttachment(caseId: string, attachmentId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${caseId}/attachments/${attachmentId}`);
  }

  // Notes management
  addNote(caseId: string, noteData: {
    noteType?: string;
    title?: string;
    content: string;
    priority?: string;
    isPrivate?: boolean;
    tags?: string[];
  }): Observable<CaseNoteResponse> {
    return this.http.post<CaseNoteResponse>(`${this.apiUrl}/${caseId}/notes`, noteData);
  }

  getNotes(caseId: string, noteType?: string): Observable<CaseNotesResponse> {
    let params = new HttpParams();
    if (noteType) params = params.set('noteType', noteType);
    
    return this.http.get<CaseNotesResponse>(`${this.apiUrl}/${caseId}/notes`, { params });
  }

  updateNote(caseId: string, noteId: string, noteData: Partial<CaseNote>): Observable<CaseNoteResponse> {
    return this.http.put<CaseNoteResponse>(`${this.apiUrl}/${caseId}/notes/${noteId}`, noteData);
  }

  deleteNote(caseId: string, noteId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${caseId}/notes/${noteId}`);
  }

  // Activity log
  getActivityLog(caseId: string, page = 1, limit = 50): Observable<ActivityLogsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get<ActivityLogsResponse>(`${this.apiUrl}/${caseId}/activity`, { params });
  }

  // Complete case data
  getCompleteCase(caseId: string): Observable<CompleteCaseResponse> {
    return this.http.get<CompleteCaseResponse>(`${this.apiUrl}/${caseId}/complete`);
  }

  // Lookup data
  getLookupData(): Observable<LookupDataResponse> {
    return this.http.get<LookupDataResponse>(`${this.apiUrl}/lookup-data`);
  }

  // Search and filtering
  searchCases(query: string): Observable<CasesResponse> {
    const params = new HttpParams().set('search', query).set('limit', '20');
    return this.http.get<CasesResponse>(this.apiUrl, { params });
  }

  // Bulk operations
  bulkUpdateStatus(caseIds: string[], status: string): Observable<{ success: boolean; message: string; updated: number }> {
    return this.http.post<{ success: boolean; message: string; updated: number }>(`${this.apiUrl}/bulk/status`, {
      caseIds,
      status
    });
  }

  bulkAssign(caseIds: string[], assignedTo: string): Observable<{ success: boolean; message: string; updated: number }> {
    return this.http.post<{ success: boolean; message: string; updated: number }>(`${this.apiUrl}/bulk/assign`, {
      caseIds,
      assignedTo
    });
  }

  // Case statistics
  getCaseStats(filters?: any): Observable<{
    success: boolean;
    data: {
      totalCases: number;
      openCases: number;
      inProgressCases: number;
      completedCases: number;
      averageResolutionTime: number;
      casesByPriority: Array<{ priority: string; count: number }>;
      casesByStatus: Array<{ status: string; count: number }>;
      casesByFacility: Array<{ facility: string; count: number }>;
    };
  }> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    
    return this.http.get<{
      success: boolean;
      data: {
        totalCases: number;
        openCases: number;
        inProgressCases: number;
        completedCases: number;
        averageResolutionTime: number;
        casesByPriority: Array<{ priority: string; count: number }>;
        casesByStatus: Array<{ status: string; count: number }>;
        casesByFacility: Array<{ facility: string; count: number }>;
      };
    }>(`${this.apiUrl}/stats`, { params });
  }
} 