import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry, tap, delay } from 'rxjs/operators';
import { 
  Notification, 
  NotificationTemplate, 
  NotificationType, 
  NotificationStatus,
  NotificationPriority,
  SendNotificationRequest,
  NotificationFilter,
  NotificationListResponse,
  NotificationStats
} from '../models/notification.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnhancedNotificationService {
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY_MS = 1000;
  
  private apiUrl = `${environment.apiUrl}/notifications`;
  private templatesUrl = `${environment.apiUrl}/notification-templates`;
  private smsGatewayUrl = environment.smsGatewayUrl;
  private emailServiceUrl = environment.emailServiceUrl;

  constructor(private http: HttpClient) {}

  /**
   * Send a notification
   */
  sendNotification(notification: SendNotificationRequest): Observable<Notification> {
    const url = `${this.apiUrl}/send`;
    return this.http.post<Notification>(url, notification).pipe(
      retry(this.MAX_RETRY_ATTEMPTS),
      catchError(this.handleError<Notification>('sendNotification', {
        id: 'temp-' + Math.random().toString(36).substr(2, 9),
        type: notification.type,
        status: NotificationStatus.FAILED,
        priority: notification.priority || NotificationPriority.NORMAL,
        subject: notification.subject,
        content: notification.content,
        to: notification.to,
        cc: notification.cc || [],
        bcc: notification.bcc || [],
        userIds: notification.userIds || [],
        openCount: 0,
        clickCount: 0,
        metadata: notification.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        error: 'Failed to send notification'
      } as Notification))
    );
  }

  /**
   * Send an email notification
   */
  sendEmail(to: string | string[], subject: string, content: string, options: {
    cc?: string | string[];
    bcc?: string | string[];
    templateId?: string;
    variables?: Record<string, any>;
    priority?: NotificationPriority;
    scheduledAt?: Date;
    metadata?: Record<string, any>;
    userIds?: string[];
  } = {}): Observable<Notification> {
    const notification: SendNotificationRequest = {
      type: NotificationType.EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      content,
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : [],
      bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : [],
      templateId: options.templateId,
      variables: options.variables,
      priority: options.priority || NotificationPriority.NORMAL,
      scheduledAt: options.scheduledAt,
      metadata: options.metadata,
      userIds: options.userIds || []
    };

    return this.sendNotification(notification);
  }

  /**
   * Send an SMS notification
   */
  sendSms(to: string | string[], message: string, options: {
    templateId?: string;
    variables?: Record<string, any>;
    priority?: NotificationPriority;
    scheduledAt?: Date;
    metadata?: Record<string, any>;
    userIds?: string[];
  } = {}): Observable<Notification> {
    const notification: SendNotificationRequest = {
      type: NotificationType.SMS,
      to: Array.isArray(to) ? to : [to],
      subject: 'SMS Notification',
      content: message,
      templateId: options.templateId,
      variables: options.variables,
      priority: options.priority || NotificationPriority.NORMAL,
      scheduledAt: options.scheduledAt,
      metadata: options.metadata,
      userIds: options.userIds || []
    };

    return this.sendNotification(notification);
  }

  /**
   * Get notification by ID
   */
  getNotificationById(id: string): Observable<Notification> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Notification>(url).pipe(
      catchError(this.handleError<Notification>(`getNotification id=${id}`))
    );
  }

  /**
   * Get notifications with filters
   */
  getNotifications(filters: NotificationFilter = {}): Observable<NotificationListResponse> {
    let params = new URLSearchParams();
    
    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else if (value instanceof Date) {
          params.append(key, value.toISOString());
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const url = `${this.apiUrl}?${params.toString()}`;
    return this.http.get<NotificationListResponse>(url).pipe(
      catchError(this.handleError<NotificationListResponse>('getNotifications', { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }))
    );
  }

  /**
   * Get notification statistics
   */
  getNotificationStats(): Observable<NotificationStats> {
    const url = `${this.apiUrl}/stats`;
    return this.http.get<NotificationStats>(url).pipe(
      catchError(this.handleError<NotificationStats>('getNotificationStats', {
        total: 0,
        byType: {} as Record<NotificationType, number>,
        byStatus: {} as Record<NotificationStatus, number>,
        byDay: []
      }))
    );
  }

  /**
   * Get all notification templates
   */
  getTemplates(): Observable<NotificationTemplate[]> {
    return this.http.get<NotificationTemplate[]>(this.templatesUrl).pipe(
      catchError(this.handleError<NotificationTemplate[]>('getTemplates', []))
    );
  }

  /**
   * Get template by ID
   */
  getTemplateById(id: string): Observable<NotificationTemplate> {
    const url = `${this.templatesUrl}/${id}`;
    return this.http.get<NotificationTemplate>(url).pipe(
      catchError(this.handleError<NotificationTemplate>(`getTemplate id=${id}`))
    );
  }

  /**
   * Create a new template
   */
  createTemplate(template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Observable<NotificationTemplate> {
    return this.http.post<NotificationTemplate>(this.templatesUrl, template).pipe(
      catchError(this.handleError<NotificationTemplate>('createTemplate'))
    );
  }

  /**
   * Update a template
   */
  updateTemplate(id: string, template: Partial<NotificationTemplate>): Observable<NotificationTemplate> {
    const url = `${this.templatesUrl}/${id}`;
    return this.http.put<NotificationTemplate>(url, template).pipe(
      catchError(this.handleError<NotificationTemplate>('updateTemplate'))
    );
  }

  /**
   * Delete a template
   */
  deleteTemplate(id: string): Observable<boolean> {
    const url = `${this.templatesUrl}/${id}`;
    return this.http.delete<{ success: boolean }>(url).pipe(
      map(response => response.success),
      catchError(this.handleError<boolean>('deleteTemplate', false))
    );
  }

  /**
   * Retry sending a failed notification
   */
  retryNotification(notificationId: string): Observable<Notification> {
    const url = `${this.apiUrl}/${notificationId}/retry`;
    return this.http.post<Notification>(url, {}).pipe(
      catchError(this.handleError<Notification>('retryNotification'))
    );
  }

  /**
   * Cancel a scheduled notification
   */
  cancelNotification(notificationId: string): Observable<Notification> {
    const url = `${this.apiUrl}/${notificationId}/cancel`;
    return this.http.post<Notification>(url, {}).pipe(
      catchError(this.handleError<Notification>('cancelNotification'))
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Log to error tracking service
      this.logError(operation, error);
      
      // Let the app keep running by returning a safe result
      return of(result as T);
    };
  }

  /**
   * Log errors to error tracking service
   */
  private logError(operation: string, error: any): void {
    // In a real app, this would send the error to a logging service
    console.error(`Error in ${operation}:`, {
      message: error.message,
      status: error.status,
      url: error.url,
      timestamp: new Date().toISOString()
    });
    
    // Example: Send to error tracking service
    // this.errorTrackingService.captureException(error, { operation });
  }

  /**
   * Format phone number for SMS
   */
  private formatPhoneNumber(phone: string): string {
    // Basic phone number formatting - extend as needed
    return phone.replace(/[^\d+]/g, '');
  }

  /**
   * Validate email address
   */
  private isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  /**
   * Validate phone number
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Basic validation - extend based on requirements
    return /^\+?[1-9]\d{1,14}$/.test(phone);
  }
}
