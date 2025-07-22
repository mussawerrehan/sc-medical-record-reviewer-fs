import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, UserRole } from '../models';

export interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api';
  private readonly TOKEN_KEY = 'tokens'; // Changed to match interceptor
  private readonly USER_KEY = 'current_user';
  private readonly SELECTED_HOSPITAL_KEY = 'selected_hospital';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private refreshingToken = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem(this.USER_KEY);
    const tokens = this.getTokens();
    
    if (storedUser && tokens?.accessToken) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        this.clearStorage();
      }
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        this.storeAuthData(response);
      })
    );
  }

  private storeAuthData(response: LoginResponse): void {
    const tokens = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken
    };
    
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokens));
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  // Get tokens from localStorage
  getTokens(): { accessToken: string; refreshToken: string } | null {
    const tokens = localStorage.getItem(this.TOKEN_KEY);
    return tokens ? JSON.parse(tokens) : null;
  }

  // Refresh access token using refresh token
  refreshToken(): Observable<RefreshTokenResponse> {
    if (this.refreshingToken) {
      // Prevent multiple refresh requests
      return throwError(() => new Error('Token refresh already in progress'));
    }

    const tokens = this.getTokens();
    if (!tokens?.refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    this.refreshingToken = true;

    return this.http.post<RefreshTokenResponse>(`${this.API_URL}/auth/refresh-token`, {
      refreshToken: tokens.refreshToken
    }).pipe(
      tap(response => {
        // Store new tokens
        const newTokens = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        };
        localStorage.setItem(this.TOKEN_KEY, JSON.stringify(newTokens));
        this.refreshingToken = false;
      }),
      catchError(error => {
        this.refreshingToken = false;
        // If refresh fails, logout user
        this.logout();
        return throwError(() => error);
      })
    );
  }

  setSelectedHospital(hospitalId: string): void {
    localStorage.setItem(this.SELECTED_HOSPITAL_KEY, hospitalId);
  }

  getSelectedHospital(): string | null {
    return localStorage.getItem(this.SELECTED_HOSPITAL_KEY);
  }

  logout(): void {
    this.clearStorage();
    this.router.navigate(['/login']);
  }

  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.SELECTED_HOSPITAL_KEY);
    this.currentUserSubject.next(null);
    this.refreshingToken = false;
  }

  getToken(): string | null {
    const tokens = this.getTokens();
    return tokens?.accessToken || null;
  }

  isLoggedIn(): boolean {
    const tokens = this.getTokens();
    return !!(tokens?.accessToken && this.currentUserSubject.value);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }
} 