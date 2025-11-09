import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notification {
  id?: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  category: string;
  read: boolean;
  acknowledged: boolean;
  timestamp: Date;
  readAt?: Date;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  
  constructor(private http: HttpClient) {}
  
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  
  private getCurrentUserId(): string {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || '';
      } catch (e) {
        console.error('Error parsing currentUser:', e);
      }
    }
    return '';
  }
  
  /**
   * Récupérer toutes les notifications de l'utilisateur actuel
   */
  getNotifications(): Observable<Notification[]> {
    const userId = this.getCurrentUserId();
    console.log('📥 Récupération notifications pour userId:', userId);
    return this.http.get<Notification[]>(
      `${this.apiUrl}/user/${userId}`,
      { headers: this.getHeaders() }
    );
  }
  
  /**
   * Récupérer les notifications non lues
   */
  getUnreadNotifications(): Observable<Notification[]> {
    const userId = this.getCurrentUserId();
    return this.http.get<Notification[]>(
      `${this.apiUrl}/user/${userId}/unread`,
      { headers: this.getHeaders() }
    );
  }
  
  /**
   * Compter les notifications non lues
   */
  getUnreadCount(): Observable<number> {
    const userId = this.getCurrentUserId();
    return this.http.get<number>(
      `${this.apiUrl}/user/${userId}/unread/count`,
      { headers: this.getHeaders() }
    );
  }
  
  /**
   * Marquer une notification comme lue
   */
  markAsRead(notificationId: string): Observable<any> {
    const userId = this.getCurrentUserId();
    return this.http.put(
      `${this.apiUrl}/${notificationId}/read?userId=${userId}`,
      {},
      { headers: this.getHeaders() }
    );
  }
  
  /**
   * Marquer toutes les notifications comme lues
   */
  markAllAsRead(): Observable<any> {
    const userId = this.getCurrentUserId();
    return this.http.put(
      `${this.apiUrl}/user/${userId}/read-all`,
      {},
      { headers: this.getHeaders() }
    );
  }
  
  /**
   * Supprimer une notification
   */
  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${notificationId}`,
      { headers: this.getHeaders() }
    );
  }
  
  /**
   * Récupérer les alertes déléguées (pour Chef de Projet)
   */
  getDelegatedAlerts(): Observable<Notification[]> {
    const userId = this.getCurrentUserId();
    console.log('📥 Récupération alertes déléguées pour userId:', userId);
    return this.http.get<Notification[]>(
      `${this.apiUrl}/user/${userId}/delegated-alerts`,
      { headers: this.getHeaders() }
    );
  }
  
  /**
   * Marquer plusieurs notifications comme lues (bulk)
   */
  markReadBulk(notificationIds: string[]): Observable<{ success: boolean; count: number }> {
    const userId = this.getCurrentUserId();
    return this.http.put<{ success: boolean; count: number }>(
      `${this.apiUrl}/user/${userId}/read-bulk`,
      { notificationIds },
      { headers: this.getHeaders() }
    );
  }
  
  /**
   * Récupérer les notifications de paiement (legacy - pour compatibilité)
   */
  getPaymentNotifications(): Observable<Notification[]> {
    return this.getNotifications();
  }
  
  /**
   * Récupérer les paramètres de notification (legacy - pour compatibilité)
   */
  getNotificationSettings(): Observable<any> {
    const userId = this.getCurrentUserId();
    return this.http.get<any>(
      `${this.apiUrl}/user/${userId}/settings`,
      { headers: this.getHeaders() }
    );
  }
  
  /**
   * Mettre à jour les paramètres de notification (legacy - pour compatibilité)
   */
  updateNotificationSettings(settings: any): Observable<any> {
    const userId = this.getCurrentUserId();
    return this.http.put<any>(
      `${this.apiUrl}/user/${userId}/settings`,
      settings,
      { headers: this.getHeaders() }
    );
  }
  
  /**
   * Récupérer les templates par type (legacy - pour compatibilité)
   */
  getTemplatesByType(type: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/templates?type=${type}`,
      { headers: this.getHeaders() }
    );
  }
  
  /**
   * Sauvegarder un template (legacy - pour compatibilité)
   */
  saveTemplate(template: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/templates`,
      template,
      { headers: this.getHeaders() }
    );
  }
}
