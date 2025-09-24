import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface DashboardStats {
  totalUsers: number;
  activeConventions: number;
  pendingInvoices: number;
  unreadNotifications: number;
  userGrowth: number;
  conventionGrowth: number;
}

export interface ActivityLog {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = '/api/dashboard';

  constructor(private http: HttpClient) {}

  /**
   * Get dashboard statistics
   */
  getDashboardStats(dateRange: string = 'week'): Observable<DashboardStats> {
    // In a real app, this would be an HTTP request
    // return this.http.get<DashboardStats>(`${this.apiUrl}/stats?range=${dateRange}`);
    
    // Mock data for now
    return of({
      totalUsers: 1245,
      activeConventions: 87,
      pendingInvoices: 23,
      unreadNotifications: 7,
      userGrowth: 12.5,
      conventionGrowth: 5.2
    }).pipe(
      // Simulate network delay
      tap(() => this.simulateNetworkDelay())
    );
  }

  /**
   * Get recent activities
   */
  getRecentActivities(limit: number = 10): Observable<ActivityLog[]> {
    // In a real app, this would be an HTTP request
    // return this.http.get<ActivityLog[]>(`${this.apiUrl}/activities?limit=${limit}`);
    
    // Mock data for now
    const mockActivities: ActivityLog[] = [
      {
        id: 1,
        user: 'John Doe',
        action: 'created',
        target: 'Convention #C-2023-001',
        time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        read: false
      },
      {
        id: 2,
        user: 'Jane Smith',
        action: 'updated',
        target: 'User Profile',
        time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        read: true
      },
      {
        id: 3,
        user: 'System',
        action: 'generated',
        target: 'Monthly Report',
        time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        read: true
      },
      {
        id: 4,
        user: 'Admin',
        action: 'assigned',
        target: 'New Role to User',
        time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        read: true
      },
      {
        id: 5,
        user: 'System',
        action: 'completed',
        target: 'Scheduled Backup',
        time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true
      }
    ];
    
    return of(mockActivities).pipe(
      // Simulate network delay
      tap(() => this.simulateNetworkDelay())
    );
  }

  /**
   * Mark activity as read
   */
  markActivityAsRead(activityId: number): Observable<boolean> {
    // In a real app, this would be an HTTP request
    // return this.http.post<boolean>(`${this.apiUrl}/activities/${activityId}/read`, {});
    
    return of(true).pipe(
      tap(() => this.simulateNetworkDelay())
    );
  }

  /**
   * Mark all activities as read
   */
  markAllActivitiesAsRead(): Observable<boolean> {
    // In a real app, this would be an HTTP request
    // return this.http.post<boolean>(`${this.apiUrl}/activities/read-all`, {});
    
    return of(true).pipe(
      tap(() => this.simulateNetworkDelay())
    );
  }

  /**
   * Get user growth data
   */
  getUserGrowthData(range: string = '6m'): Observable<number[]> {
    // In a real app, this would be an HTTP request
    // return this.http.get<number[]>(`${this.apiUrl}/metrics/user-growth?range=${range}`);
    
    // Mock data for now
    return of([65, 59, 80, 81, 56, 55]).pipe(
      tap(() => this.simulateNetworkDelay())
    );
  }

  /**
   * Get convention growth data
   */
  getConventionGrowthData(range: string = '6m'): Observable<number[]> {
    // In a real app, this would be an HTTP request
    // return this.http.get<number[]>(`${this.apiUrl}/metrics/convention-growth?range=${range}`);
    
    // Mock data for now
    return of([28, 48, 40, 19, 86, 27]).pipe(
      tap(() => this.simulateNetworkDelay())
    );
  }

  /**
   * Simulate network delay
   */
  private simulateNetworkDelay(min: number = 300, max: number = 800): void {
    // No-op for now, but simulates network delay in development
    // const delay = Math.random() * (max - min) + min;
    // const start = Date.now();
    // while (Date.now() < start + delay) {}
  }
}
