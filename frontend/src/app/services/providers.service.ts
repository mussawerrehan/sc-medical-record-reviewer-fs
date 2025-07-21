import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Provider,
  CreateProviderRequest,
  UpdateProviderRequest,
  AssociateHospitalRequest,
  Specialty
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProvidersService {
  private apiUrl = `${environment.apiUrl}/providers`;

  constructor(private http: HttpClient) {}

  // Get providers with pagination and filters
  getProviders(
    page: number = 1,
    limit: number = 10,
    searchTerm?: string,
    specialty?: Specialty,
    hospitalId?: string,
    isActive?: boolean
  ): Observable<{ providers: Provider[]; total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (searchTerm) params = params.set('search', searchTerm);
    if (specialty) params = params.set('specialty', specialty);
    if (hospitalId) params = params.set('hospitalId', hospitalId);
    if (isActive !== undefined) params = params.set('isActive', isActive.toString());

    return this.http.get<{ providers: Provider[]; total: number }>(this.apiUrl, { params });
  }

  // Get a single provider by ID
  getProviderById(id: string): Observable<Provider> {
    return this.http.get<Provider>(`${this.apiUrl}/${id}`);
  }

  // Create a new provider
  createProvider(provider: CreateProviderRequest): Observable<Provider> {
    return this.http.post<Provider>(this.apiUrl, provider);
  }

  // Update an existing provider
  updateProvider(id: string, provider: UpdateProviderRequest): Observable<Provider> {
    return this.http.put<Provider>(`${this.apiUrl}/${id}`, provider);
  }

  // Delete a provider
  deleteProvider(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Associate a hospital with a provider
  associateHospital(providerId: string, request: AssociateHospitalRequest): Observable<Provider> {
    return this.http.post<Provider>(`${this.apiUrl}/${providerId}/hospitals`, request);
  }

  // Remove a hospital association from a provider
  removeHospital(providerId: string, hospitalId: string): Observable<Provider> {
    return this.http.delete<Provider>(`${this.apiUrl}/${providerId}/hospitals/${hospitalId}`);
  }

  // Get all hospitals associated with a provider
  getProviderHospitals(providerId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${providerId}/hospitals`);
  }

  // Get provider statistics
  getProviderStatistics(providerId: string): Observable<{
    totalClaims: number;
    totalHospitals: number;
    totalAmount: number;
    claimsByStatus: { [key: string]: number };
    claimsByType: { [key: string]: number };
  }> {
    return this.http.get<{
      totalClaims: number;
      totalHospitals: number;
      totalAmount: number;
      claimsByStatus: { [key: string]: number };
      claimsByType: { [key: string]: number };
    }>(`${this.apiUrl}/${providerId}/statistics`);
  }

  // Get available specialties
  getSpecialties(): Observable<Specialty[]> {
    return this.http.get<Specialty[]>(`${this.apiUrl}/specialties`);
  }

  // Search providers by name or NPI (for autocomplete)
  searchProviders(query: string): Observable<Provider[]> {
    return this.http.get<Provider[]>(`${this.apiUrl}/search`, {
      params: new HttpParams().set('q', query)
    });
  }
} 