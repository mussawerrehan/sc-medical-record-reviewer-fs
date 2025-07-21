import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  // Get user profile
  getProfile(): Observable<User> {
    return this.http.get<User>(this.apiUrl);
  }

  // Update user profile
  updateProfile(data: { name?: string; password?: string }): Observable<User> {
    return this.http.put<User>(this.apiUrl, data);
  }

  // Change password
  changePassword(data: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/password`, data);
  }

  // Get user activity
  getActivity(): Observable<{
    lastLogin: Date;
    recentClaims: any[];
    recentHospitals: any[];
    recentProviders: any[];
  }> {
    return this.http.get<{
      lastLogin: Date;
      recentClaims: any[];
      recentHospitals: any[];
      recentProviders: any[];
    }>(`${this.apiUrl}/activity`);
  }

  // Get user notifications
  getNotifications(): Observable<{
    unread: number;
    notifications: {
      id: string;
      type: string;
      message: string;
      date: Date;
      read: boolean;
    }[];
  }> {
    return this.http.get<{
      unread: number;
      notifications: {
        id: string;
        type: string;
        message: string;
        date: Date;
        read: boolean;
      }[];
    }>(`${this.apiUrl}/notifications`);
  }

  // Mark notification as read
  markNotificationAsRead(notificationId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/notifications/${notificationId}/read`, {});
  }

  // Mark all notifications as read
  markAllNotificationsAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/notifications/read-all`, {});
  }

  // Update notification preferences
  updateNotificationPreferences(preferences: {
    email: boolean;
    push: boolean;
    claimUpdates: boolean;
    systemUpdates: boolean;
  }): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/notifications/preferences`, preferences);
  }

  // Get notification preferences
  getNotificationPreferences(): Observable<{
    email: boolean;
    push: boolean;
    claimUpdates: boolean;
    systemUpdates: boolean;
  }> {
    return this.http.get<{
      email: boolean;
      push: boolean;
      claimUpdates: boolean;
      systemUpdates: boolean;
    }>(`${this.apiUrl}/notifications/preferences`);
  }
} 