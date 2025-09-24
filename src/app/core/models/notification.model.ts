import { User } from './user.model';

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  IN_APP = 'IN_APP',
  SYSTEM = 'SYSTEM'
}

export enum NotificationStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface NotificationTemplate {
  id: string;
  name: string;
  description?: string;
  type: NotificationType;
  subject: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  status: NotificationStatus;
  priority: NotificationPriority;
  subject: string;
  content: string;
  
  // Sender and recipients
  from?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  recipient?: string;
  
  // Related entities
  templateId?: string;
  template?: NotificationTemplate;
  userIds: string[];
  users?: User[];
  
  // Scheduling
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  
  // Tracking
  openCount: number;
  clickCount: number;
  isRead?: boolean;
  error?: string;
  
  // Metadata
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

export interface NotificationFilter {
  search?: string;
  type?: NotificationType[];
  status?: NotificationStatus[];
  priority?: NotificationPriority[];
  templateId?: string;
  userId?: string;
  scheduledFrom?: Date;
  scheduledTo?: Date;
  sentFrom?: Date;
  sentTo?: Date;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface NotificationListResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SendNotificationRequest {
  type: NotificationType;
  templateId?: string;
  subject: string;
  content: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  priority?: NotificationPriority;
  scheduledAt?: Date;
  metadata?: Record<string, any>;
  userIds?: string[];
  variables?: Record<string, any>;
}

export interface NotificationStats {
  total: number;
  byType: Record<NotificationType, number>;
  byStatus: Record<NotificationStatus, number>;
  byDay: Array<{ date: string; count: number }>;
}

// Helper functions
export function getNotificationStatusColor(status: NotificationStatus): string {
  switch (status) {
    case NotificationStatus.SENT:
    case NotificationStatus.DELIVERED:
      return 'accent';
    case NotificationStatus.SCHEDULED:
      return 'primary';
    case NotificationStatus.FAILED:
      return 'warn';
    case NotificationStatus.DRAFT:
      return '';
    case NotificationStatus.SENDING:
      return 'accent';
    case NotificationStatus.CANCELLED:
      return 'warn';
    default:
      return '';
  }
}

export function getNotificationTypeIcon(type: NotificationType): string {
  switch (type) {
    case NotificationType.EMAIL:
      return 'email';
    case NotificationType.SMS:
      return 'sms';
    case NotificationType.IN_APP:
      return 'notifications';
    case NotificationType.SYSTEM:
      return 'warning';
    default:
      return 'notifications_none';
  }
}
