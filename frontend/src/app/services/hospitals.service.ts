import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Hospital,
  CreateHospitalRequest,
  UpdateHospitalRequest,
  AssociateProviderRequest
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class HospitalsService {
  private apiUrl = `${environment.apiUrl}/hospitals`;

  constructor(private http: HttpClient) {}

  // Get hospitals with pagination and filters
  getHospitals(
    page: number = 1,
    limit: number = 10,
    searchTerm?: string,
    state?: string,
    isActive?: boolean
  ): Observable<{ hospitals: Hospital[]; total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (searchTerm) params = params.set('search', searchTerm);
    if (state) params = params.set('state', state);
    if (isActive !== undefined) params = params.set('isActive', isActive.toString());

    return this.http.get<{ hospitals: Hospital[]; total: number }>(this.apiUrl, { params });
  }

  // Get a single hospital by ID
  getHospitalById(id: string): Observable<Hospital> {
    return this.http.get<Hospital>(`${this.apiUrl}/${id}`);
  }

  // Create a new hospital
  createHospital(hospital: CreateHospitalRequest): Observable<Hospital> {
    return this.http.post<Hospital>(this.apiUrl, hospital);
  }

  // Update an existing hospital
  updateHospital(id: string, hospital: UpdateHospitalRequest): Observable<Hospital> {
    return this.http.put<Hospital>(`${this.apiUrl}/${id}`, hospital);
  }

  // Delete a hospital
  deleteHospital(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Associate a provider with a hospital
  associateProvider(hospitalId: string, request: AssociateProviderRequest): Observable<Hospital> {
    return this.http.post<Hospital>(`${this.apiUrl}/${hospitalId}/providers`, request);
  }

  // Remove a provider association from a hospital
  removeProvider(hospitalId: string, providerId: string): Observable<Hospital> {
    return this.http.delete<Hospital>(`${this.apiUrl}/${hospitalId}/providers/${providerId}`);
  }

  // Get all providers associated with a hospital
  getHospitalProviders(hospitalId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${hospitalId}/providers`);
  }

  // Get hospital statistics
  getHospitalStatistics(hospitalId: string): Observable<{
    totalClaims: number;
    totalProviders: number;
    totalAmount: number;
    claimsByStatus: { [key: string]: number };
    claimsByType: { [key: string]: number };
  }> {
    return this.http.get<{
      totalClaims: number;
      totalProviders: number;
      totalAmount: number;
      claimsByStatus: { [key: string]: number };
      claimsByType: { [key: string]: number };
    }>(`${this.apiUrl}/${hospitalId}/statistics`);
  }
} 