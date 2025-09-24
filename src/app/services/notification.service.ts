import { Injectable } from '@angular/core';
// import { ToastrService } from 'ngx-toastr';
import { WebsocketService, WebSocketMessage } from './websocket.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { inject } from '@angular/core';

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  daysBeforeDueDate: number;
}

export interface NotificationHistory {
  id: string;
  message: string;
  date: string;
  type: string;
  read: boolean;
  subject?: string;
  sentAt?: string;
  recipient?: string;
  status?: string;
}

export interface NotificationData {
  alert?: string;
  success?: string;
  info?: string;
  error?: string;
  log?: string;
  message?: string;
}

@Injectable()
export class NotificationService {
  // private toastr: ToastrService = inject(ToastrService);
  private apiUrl = `${environment.apiUrl}/notifications`;
  constructor(private websocket: WebsocketService, private http: HttpClient) {
    this.websocket.dashboardUpdates$.subscribe((message: WebSocketMessage) => {
      const data = message.data as NotificationData;
      if (data.alert) {
        // this.toastr.warning(data.alert, 'Alerte');
      }
      if (data.success) {
        // this.toastr.success(data.success, 'Succès');
      }
      if (data.info) {
        // this.toastr.info(data.info, 'Info');
      }
      if (data.error) {
        // this.toastr.error(data.error, 'Erreur');
      }
    });
  }

  showSuccess(msg: string): void {
    // this.toastr.success(msg, 'Succès');
  }
  showError(msg: string): void {
    // this.toastr.error(msg, 'Erreur');
  }
  showInfo(msg: string): void {
    // this.toastr.info(msg, 'Info');
  }
  showWarning(msg: string): void {
    // this.toastr.warning(msg, 'Alerte');
  }

  // Settings
  getNotificationSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/settings`);
  }
  updateNotificationSettings(payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/settings`, payload);
  }

  // History
  getNotificationHistory(): Observable<NotificationHistory[]> {
    return this.http.get<NotificationHistory[]>(`${this.apiUrl}/history`);
  }

  // Unread count
  getUnreadCount(): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${this.apiUrl}/unread-count`);
  }

  // Bulk mark as read
  markReadBulk(ids: string[]): Observable<{ updated: number }> {
    return this.http.post<{ updated: number }>(`${this.apiUrl}/mark-read-bulk`, { ids });
  }

  // Payments notifications and mark read single
  getPaymentNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/paiement`);
  }
  markPaymentNotificationRead(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/paiement/${id}/read`, {});
  }

  // Manual reminder (if needed by tests)
  sendManualReminder(invoiceId: string, type: 'email' | 'sms'): Observable<any> {
    return this.http.post(`${this.apiUrl}/reminder`, { invoiceId, type });
  }

  // Templates API
  getTemplates(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/notification-templates`);
  }
  getTemplatesByType(type: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/notification-templates/type/${type}`);
    }
  saveTemplate(template: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/notification-templates`, template);
  }
  deactivateTemplate(id: string): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/notification-templates/${id}/deactivate`, {});
  }
  generateFromTemplate(id: string, variables: any): Observable<{subject: string, content: string}> {
    return this.http.post<{subject: string, content: string}>(`${environment.apiUrl}/notification-templates/${id}/generate`, variables);
  }
}