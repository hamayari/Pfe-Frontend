import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ProactiveNotification {
  id: string;
  type: string;
  subject: string;
  message: string;
  sentAt: string;
  status: string;
  conventionId?: string;
  invoiceId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProactiveNotificationsService {
  private apiUrl = `${environment.apiUrl}`;
  private pollingInterval = 30000; // 30 secondes

  constructor(private http: HttpClient) {}

  /**
   * Récupère les notifications non lues
   */
  getUnreadNotifications(): Observable<ProactiveNotification[]> {
    const headers = this.getAuthHeaders();
    const userId = this.getCurrentUserId();
    
    return this.http.get<ProactiveNotification[]>(
      `${this.apiUrl}/notifications/user/${userId}`,
      { headers }
    );
  }

  /**
   * Polling automatique des notifications
   */
  startPolling(): Observable<ProactiveNotification[]> {
    return interval(this.pollingInterval).pipe(
      switchMap(() => this.getUnreadNotifications())
    );
  }

  /**
   * Marque une notification comme lue
   */
  markAsRead(notificationId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(
      `${this.apiUrl}/notifications/${notificationId}/read`,
      {},
      { headers }
    );
  }

  /**
   * Récupère le nombre de notifications non lues
   */
  getUnreadCount(): Observable<number> {
    const headers = this.getAuthHeaders();
    const userId = this.getCurrentUserId();
    
    return this.http.get<number>(
      `${this.apiUrl}/notifications/user/${userId}/unread-count`,
      { headers }
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private getCurrentUserId(): string {
    // Récupérer l'ID utilisateur depuis le token ou localStorage
    return localStorage.getItem('userId') || 'admin';
  }
}
