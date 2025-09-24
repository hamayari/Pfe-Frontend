import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, delay } from 'rxjs/operators';
import { 
  Notification, 
  NotificationTemplate, 
  NotificationFilter, 
  NotificationListResponse,
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  SendNotificationRequest,
  NotificationStats
} from '../models/notification.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private templatesUrl = `${environment.apiUrl}/notification-templates`;
  
  // Mock data for development
  private mockTemplates: NotificationTemplate[] = [
    {
      id: '1',
      name: 'Invoice Due Reminder',
      description: 'Reminder for upcoming invoice due date',
      type: NotificationType.EMAIL,
      subject: 'Upcoming Invoice Due: {{invoiceNumber}}',
      content: 'Dear {{customerName}},\n\nThis is a reminder that your invoice {{invoiceNumber}} for {{amount}} {{currency}} is due on {{dueDate}}.\n\nBest regards,\nThe Billing Team',
      variables: ['invoiceNumber', 'customerName', 'amount', 'currency', 'dueDate'],
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      createdBy: 'system'
    },
    // Add more mock templates as needed
  ];
  
  private mockNotifications: Notification[] = [
    {
      id: '1',
      type: NotificationType.EMAIL,
      status: NotificationStatus.SENT,
      priority: NotificationPriority.NORMAL,
      subject: 'Upcoming Invoice Due: INV-2023-001',
      content: 'Dear John Doe,\n\nThis is a reminder that your invoice INV-2023-001 for 6,000.00 MAD is due on 2023-02-14.\n\nBest regards,\nThe Billing Team',
      from: 'noreply@example.com',
      to: ['john.doe@example.com'],
      templateId: '1',
      userIds: ['1'],
      scheduledAt: new Date('2023-02-01'),
      sentAt: new Date('2023-02-01T10:00:00'),
      deliveredAt: new Date('2023-02-01T10:00:05'),
      openCount: 1,
      clickCount: 0,
      metadata: {
        invoiceId: '1',
        customerId: '1'
      },
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date('2023-02-01T10:00:05'),
      createdBy: 'system'
    },
    // Add more mock notifications as needed
  ];

  constructor(private http: HttpClient) {}

  // Notification Templates
  
  // Get all notification templates
  getTemplates(): Observable<NotificationTemplate[]> {
    // In a real app: return this.http.get<NotificationTemplate[]>(this.templatesUrl);
    return of([...this.mockTemplates]).pipe(delay(200));
  }

  // Get a single template by ID
  getTemplateById(id: string): Observable<NotificationTemplate> {
    // In a real app: return this.http.get<NotificationTemplate>(`${this.templatesUrl}/${id}`);
    const template = this.mockTemplates.find(t => t.id === id);
    return template 
      ? of(template).pipe(delay(200))
      : throwError(() => new Error('Template not found'));
  }

  // Create a new template
  createTemplate(templateData: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Observable<NotificationTemplate> {
    // In a real app: return this.http.post<NotificationTemplate>(this.templatesUrl, templateData);
    const newTemplate: NotificationTemplate = {
      ...templateData,
      id: (this.mockTemplates.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user-id',
      updatedBy: 'current-user-id'
    };
    
    this.mockTemplates = [...this.mockTemplates, newTemplate];
    return of(newTemplate).pipe(delay(300));
  }

  // Update an existing template
  updateTemplate(id: string, templateData: Partial<NotificationTemplate>): Observable<NotificationTemplate> {
    // In a real app: return this.http.put<NotificationTemplate>(`${this.templatesUrl}/${id}`, templateData);
    const templateIndex = this.mockTemplates.findIndex(t => t.id === id);
    
    if (templateIndex === -1) {
      return throwError(() => new Error('Template not found'));
    }
    
    const updatedTemplate = {
      ...this.mockTemplates[templateIndex],
      ...templateData,
      updatedAt: new Date(),
      updatedBy: 'current-user-id'
    };
    
    this.mockTemplates = [
      ...this.mockTemplates.slice(0, templateIndex),
      updatedTemplate,
      ...this.mockTemplates.slice(templateIndex + 1)
    ];
    
    return of(updatedTemplate).pipe(delay(300));
  }

  // Delete a template
  deleteTemplate(id: string): Observable<void> {
    // In a real app: return this.http.delete<void>(`${this.templatesUrl}/${id}`);
    const templateIndex = this.mockTemplates.findIndex(t => t.id === id);
    
    if (templateIndex === -1) {
      return throwError(() => new Error('Template not found'));
    }
    
    this.mockTemplates = this.mockTemplates.filter(template => template.id !== id);
    return of(undefined).pipe(delay(300));
  }

  // Notifications
  
  // Get all notifications with pagination and filtering
  getNotifications(filter: NotificationFilter = {}): Observable<NotificationListResponse> {
    // In a real app, this would be an HTTP request with query parameters
    // const params = this.buildQueryParams(filter);
    // return this.http.get<NotificationListResponse>(this.apiUrl, { params });
    
    // Mock implementation for development
    let filteredNotifications = [...this.mockNotifications];
    
    // Apply filters
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filteredNotifications = filteredNotifications.filter(notif => 
        notif.subject.toLowerCase().includes(searchTerm) ||
        notif.content.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filter.type && filter.type.length > 0) {
      filteredNotifications = filteredNotifications.filter(notif => 
        filter.type?.includes(notif.type)
      );
    }
    
    if (filter.status && filter.status.length > 0) {
      filteredNotifications = filteredNotifications.filter(notif => 
        filter.status?.includes(notif.status)
      );
    }
    
    if (filter.priority && filter.priority.length > 0) {
      filteredNotifications = filteredNotifications.filter(notif => 
        filter.priority?.includes(notif.priority)
      );
    }
    
    if (filter.templateId) {
      filteredNotifications = filteredNotifications.filter(notif => 
        notif.templateId === filter.templateId
      );
    }
    
    if (filter.userId) {
      filteredNotifications = filteredNotifications.filter(notif => 
        notif.userIds.includes(filter.userId!)
      );
    }
    
    if (filter.scheduledFrom) {
      const fromDate = new Date(filter.scheduledFrom);
      filteredNotifications = filteredNotifications.filter(notif => 
        notif.scheduledAt && new Date(notif.scheduledAt) >= fromDate
      );
    }
    
    if (filter.scheduledTo) {
      const toDate = new Date(filter.scheduledTo);
      filteredNotifications = filteredNotifications.filter(notif => 
        notif.scheduledAt && new Date(notif.scheduledAt) <= toDate
      );
    }
    
    if (filter.sentFrom) {
      const fromDate = new Date(filter.sentFrom);
      filteredNotifications = filteredNotifications.filter(notif => 
        notif.sentAt && new Date(notif.sentAt) >= fromDate
      );
    }
    
    if (filter.sentTo) {
      const toDate = new Date(filter.sentTo);
      filteredNotifications = filteredNotifications.filter(notif => 
        notif.sentAt && new Date(notif.sentAt) <= toDate
      );
    }
    
    // Apply sorting
    if (filter.sortField) {
      filteredNotifications = this.sortNotifications(
        filteredNotifications, 
        filter.sortField, 
        filter.sortOrder || 'desc'
      );
    }
    
    // Apply pagination
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + limit);
    
    // Simulate API delay
    return of({
      data: paginatedNotifications,
      total: filteredNotifications.length,
      page,
      limit,
      totalPages: Math.ceil(filteredNotifications.length / limit)
    }).pipe(delay(300));
  }

  // Get a single notification by ID
  getNotificationById(id: string): Observable<Notification> {
    // In a real app: return this.http.get<Notification>(`${this.apiUrl}/${id}`);
    const notification = this.mockNotifications.find(n => n.id === id);
    return notification 
      ? of(notification).pipe(delay(200))
      : throwError(() => new Error('Notification not found'));
  }

  // Send a notification
  sendNotification(notificationData: SendNotificationRequest): Observable<Notification> {
    // In a real app: return this.http.post<Notification>(this.apiUrl, notificationData);
    const newNotification: Notification = {
      ...notificationData,
      id: (this.mockNotifications.length + 1).toString(),
      status: NotificationStatus.SENT,
      priority: notificationData.priority || NotificationPriority.NORMAL,
      openCount: 0,
      clickCount: 0,
      sentAt: new Date(),
      deliveredAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user-id',
      userIds: notificationData.userIds || [],
      metadata: notificationData.metadata || {}
    };
    
    this.mockNotifications = [...this.mockNotifications, newNotification];
    return of(newNotification).pipe(delay(300));
  }

  // Send a notification using a template
  sendTemplatedNotification(templateId: string, data: Record<string, any>): Observable<Notification> {
    // In a real app: return this.http.post<Notification>(`${this.apiUrl}/templates/${templateId}/send`, data);
    const template = this.mockTemplates.find(t => t.id === templateId);
    
    if (!template) {
      return throwError(() => new Error('Template not found'));
    }
    
    // Simple template rendering (in a real app, use a proper templating engine)
    let subject = template.subject;
    let content = template.content;
    
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(placeholder, String(value));
      content = content.replace(placeholder, String(value));
    });
    
    const newNotification: Notification = {
      id: (this.mockNotifications.length + 1).toString(),
      type: template.type,
      status: NotificationStatus.SENT,
      priority: NotificationPriority.NORMAL,
      subject,
      content,
      from: 'noreply@example.com',
      to: data['to'] || [],
      cc: data['cc'] || [],
      bcc: data['bcc'] || [],
      templateId,
      userIds: data['userIds'] || [],
      scheduledAt: new Date(),
      sentAt: new Date(),
      deliveredAt: new Date(),
      openCount: 0,
      clickCount: 0,
      metadata: data['metadata'] || {},
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user-id'
    };
    
    this.mockNotifications = [...this.mockNotifications, newNotification];
    return of(newNotification).pipe(delay(300));
  }

  // Schedule a notification
  scheduleNotification(notificationData: SendNotificationRequest, scheduleAt: Date): Observable<Notification> {
    // In a real app: return this.http.post<Notification>(`${this.apiUrl}/schedule`, { ...notificationData, scheduleAt });
    const newNotification: Notification = {
      ...notificationData,
      id: (this.mockNotifications.length + 1).toString(),
      status: NotificationStatus.SCHEDULED,
      priority: notificationData.priority || NotificationPriority.NORMAL,
      scheduledAt: scheduleAt,
      openCount: 0,
      clickCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user-id',
      userIds: notificationData.userIds || [],
      metadata: notificationData.metadata || {}
    };
    
    this.mockNotifications = [...this.mockNotifications, newNotification];
    return of(newNotification).pipe(delay(300));
  }

  // Cancel a scheduled notification
  cancelScheduledNotification(id: string): Observable<Notification> {
    // In a real app: return this.http.post<Notification>(`${this.apiUrl}/${id}/cancel`, {});
    const notification = this.mockNotifications.find(n => n.id === id);
    
    if (!notification) {
      return throwError(() => new Error('Notification not found'));
    }
    
    if (notification.status !== 'SCHEDULED') {
      return throwError(() => new Error('Only scheduled notifications can be canceled'));
    }
    
    const updatedNotification = {
      ...notification,
      status: NotificationStatus.CANCELLED,
      updatedAt: new Date()
    };
    
    const notificationIndex = this.mockNotifications.findIndex(n => n.id === id);
    this.mockNotifications = [
      ...this.mockNotifications.slice(0, notificationIndex),
      updatedNotification,
      ...this.mockNotifications.slice(notificationIndex + 1)
    ];
    
    return of(updatedNotification).pipe(delay(200));
  }

  // Get notification statistics
  getNotificationStats(): Observable<NotificationStats> {
    // In a real app: return this.http.get<NotificationStats>(`${this.apiUrl}/stats`);
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const recentNotifications = this.mockNotifications.filter(n => 
      n.sentAt && new Date(n.sentAt) >= thirtyDaysAgo
    );
    
    // Calculate stats by type
    const byType = recentNotifications.reduce((acc, notif) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {} as Record<NotificationType, number>);
    
    // Calculate stats by status
    const byStatus = recentNotifications.reduce((acc, notif) => {
      acc[notif.status] = (acc[notif.status] || 0) + 1;
      return acc;
    }, {} as Record<NotificationStatus, number>);
    
    // Calculate daily stats for the last 30 days
    const byDay = Array(30).fill(0).map((_, i) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (29 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const count = recentNotifications.filter(n => {
        return n.sentAt && n.sentAt.toISOString().startsWith(dateStr);
      }).length;
      
      return { date: dateStr, count };
    });
    
    const stats: NotificationStats = {
      total: recentNotifications.length,
      byType,
      byStatus,
      byDay
    };
    
    return of(stats).pipe(delay(300));
  }

  // Mark a notification as read
  markAsRead(id: string): Observable<Notification> {
    // In a real app: return this.http.post<Notification>(`${this.apiUrl}/${id}/mark-read`, {});
    const notification = this.mockNotifications.find(n => n.id === id);
    
    if (!notification) {
      return throwError(() => new Error('Notification not found'));
    }
    
    const updatedNotification = {
      ...notification,
      isRead: true,
      readAt: new Date(),
      updatedAt: new Date()
    };
    
    const notificationIndex = this.mockNotifications.findIndex(n => n.id === id);
    this.mockNotifications = [
      ...this.mockNotifications.slice(0, notificationIndex),
      updatedNotification,
      ...this.mockNotifications.slice(notificationIndex + 1)
    ];
    
    return of(updatedNotification).pipe(delay(200));
  }

  // Mark all notifications as read for a user
  markAllAsRead(userId: string): Observable<{ count: number }> {
    // In a real app: return this.http.post<{ count: number }>(`${this.apiUrl}/mark-all-read`, { userId });
    const now = new Date();
    let count = 0;
    
    this.mockNotifications = this.mockNotifications.map(notification => {
      if (notification.userIds.includes(userId) && !notification.isRead) {
        count++;
        return {
          ...notification,
          isRead: true,
          readAt: now,
          updatedAt: now
        };
      }
      return notification;
    });
    
    return of({ count }).pipe(delay(300));
  }

  // Get unread notifications count for a user
  getUnreadCount(userId: string): Observable<number> {
    // In a real app: return this.http.get<number>(`${this.apiUrl}/unread-count?userId=${userId}`);
    const count = this.mockNotifications.filter(
      n => n.userIds.includes(userId) && !n.isRead
    ).length;
    
    return of(count).pipe(delay(100));
  }

  // Helper method to sort notifications
  private sortNotifications(
    notifications: Notification[], 
    field: string, 
    order: 'asc' | 'desc' = 'asc'
  ): Notification[] {
    return [...notifications].sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (field) {
        case 'subject':
          valueA = a.subject;
          valueB = b.subject;
          break;
        case 'type':
          valueA = a.type;
          valueB = b.type;
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        case 'priority':
          valueA = a.priority;
          valueB = b.priority;
          break;
        case 'scheduledAt':
          valueA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
          valueB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
          break;
        case 'sentAt':
          valueA = a.sentAt ? new Date(a.sentAt).getTime() : 0;
          valueB = b.sentAt ? new Date(b.sentAt).getTime() : 0;
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        default:
          valueA = a[field as keyof Notification];
          valueB = b[field as keyof Notification];
      }
      
      if (valueA === null || valueA === undefined) return order === 'asc' ? -1 : 1;
      if (valueB === null || valueB === undefined) return order === 'asc' ? 1 : -1;
      
      if (valueA < valueB) return order === 'asc' ? -1 : 1;
      if (valueA > valueB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Build query parameters from filter object
  private buildQueryParams(filter: NotificationFilter): HttpParams {
    let params = new HttpParams();
    
    if (filter.search) params = params.set('search', filter.search);
    
    if (filter.type && filter.type.length > 0) {
      filter.type.forEach(type => {
        params = params.append('type', type);
      });
    }
    
    if (filter.status && filter.status.length > 0) {
      filter.status.forEach(status => {
        params = params.append('status', status);
      });
    }
    
    if (filter.priority && filter.priority.length > 0) {
      filter.priority.forEach(priority => {
        params = params.append('priority', priority);
      });
    }
    
    if (filter.templateId) params = params.set('templateId', filter.templateId);
    if (filter.userId) params = params.set('userId', filter.userId);
    if (filter.scheduledFrom) params = params.set('scheduledFrom', filter.scheduledFrom.toISOString());
    if (filter.scheduledTo) params = params.set('scheduledTo', filter.scheduledTo.toISOString());
    if (filter.sentFrom) params = params.set('sentFrom', filter.sentFrom.toISOString());
    if (filter.sentTo) params = params.set('sentTo', filter.sentTo.toISOString());
    if (filter.page) params = params.set('page', filter.page.toString());
    if (filter.limit) params = params.set('limit', filter.limit.toString());
    if (filter.sortField) params = params.set('sortField', filter.sortField);
    if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);
    
    return params;
  }
}
