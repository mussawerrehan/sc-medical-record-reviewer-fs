import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Claim,
  CreateClaimRequest,
  UpdateClaimRequest,
  ClaimType,
  ClaimStatus
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ClaimsService {
  private apiUrl = `${environment.apiUrl}/claims`;

  constructor(private http: HttpClient) {}

  // Get claims with pagination and filters
  getClaims(
    page: number = 1,
    limit: number = 10,
    type?: ClaimType,
    status?: ClaimStatus,
    hospitalId?: string,
    providerId?: string,
    startDate?: Date,
    endDate?: Date
  ): Observable<{ claims: Claim[]; total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (type) params = params.set('type', type);
    if (status) params = params.set('status', status);
    if (hospitalId) params = params.set('hospitalId', hospitalId);
    if (providerId) params = params.set('providerId', providerId);
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());

    return this.http.get<{ claims: Claim[]; total: number }>(this.apiUrl, { params });
  }

  // Get a single claim by ID
  getClaimById(id: string): Observable<Claim> {
    return this.http.get<Claim>(`${this.apiUrl}/${id}`);
  }

  // Create a new claim
  createClaim(claim: CreateClaimRequest): Observable<Claim> {
    return this.http.post<Claim>(this.apiUrl, claim);
  }

  // Update an existing claim
  updateClaim(id: string, claim: UpdateClaimRequest): Observable<Claim> {
    return this.http.put<Claim>(`${this.apiUrl}/${id}`, claim);
  }

  // Delete a claim
  deleteClaim(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Submit a claim for processing
  submitClaim(id: string): Observable<Claim> {
    return this.http.post<Claim>(`${this.apiUrl}/${id}/submit`, {});
  }

  // Validate a claim before submission
  validateClaim(id: string): Observable<{ isValid: boolean; errors: string[] }> {
    return this.http.post<{ isValid: boolean; errors: string[] }>(
      `${this.apiUrl}/${id}/validate`,
      {}
    );
  }

  // Get claim history
  getClaimHistory(id: string): Observable<Claim['processingHistory']> {
    return this.http.get<Claim['processingHistory']>(`${this.apiUrl}/${id}/history`);
  }

  // Get claim statistics
  getClaimStatistics(): Observable<{
    totalClaims: number;
    pendingClaims: number;
    approvedClaims: number;
    rejectedClaims: number;
    totalAmount: number;
  }> {
    return this.http.get<{
      totalClaims: number;
      pendingClaims: number;
      approvedClaims: number;
      rejectedClaims: number;
      totalAmount: number;
    }>(`${this.apiUrl}/statistics`);
  }
} 