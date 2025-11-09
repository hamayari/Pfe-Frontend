import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface NotificationHistory {
  alerts: any[];
  statistics: {
    total: number;
    pendingDecision: number;
    sentToPm: number;
    inProgress: number;
    resolved: number;
    archived: number;
  };
  timeline: TimelineEvent[];
  period: string;
}

export interface TimelineEvent {
  type: string;
  alertId: string;
  kpiName: string;
  message?: string;
  performedBy?: string;
  comment?: string;
  timestamp: Date;
  previousStatus?: string;
  newStatus?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationHistoryService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  
  // Observable pour le compteur de notifications non lues
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Charger le compteur initial
    this.refreshUnreadCount();
    
    // Rafraîchir toutes les 30 secondes
    setInterval(() => this.refreshUnreadCount(), 30000);
  }

  /**
   * Obtenir l'historique complet des notifications
   */
  getHistory(days: number = 30): Observable<any> {
    return this.http.get(`${this.apiUrl}/history?days=${days}`);
  }

  /**
   * Obtenir les notifications non lues
   */
  getUnread(): Observable<any> {
    return this.http.get(`${this.apiUrl}/unread`);
  }

  /**
   * Obtenir le compteur de notifications non lues
   */
  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/unread/count`).pipe(
      tap((response: any) => {
        if (response.status === 'success') {
          this.unreadCountSubject.next(response.count);
        }
      })
    );
  }

  /**
   * Rafraîchir le compteur de notifications non lues
   */
  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: () => console.log('✅ Compteur notifications rafraîchi'),
      error: (error) => console.error('❌ Erreur rafraîchissement compteur:', error)
    });
  }

  /**
   * Marquer une notification comme lue
   */
  markAsRead(alertId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${alertId}/mark-read`, {}).pipe(
      tap(() => {
        // Décrémenter le compteur
        const currentCount = this.unreadCountSubject.value;
        this.unreadCountSubject.next(Math.max(0, currentCount - 1));
      })
    );
  }

  /**
   * Obtenir la valeur actuelle du compteur
   */
  getCurrentUnreadCount(): number {
    return this.unreadCountSubject.value;
  }
}
