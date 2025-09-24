import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { DatePipe } from '@angular/common';

import { 
  Notification, 
  NotificationType, 
  NotificationStatus,
  getNotificationStatusColor,
  getNotificationTypeIcon
} from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatTooltipModule,
    ClipboardModule,
    DatePipe
  ],
  templateUrl: './notification-details-dialog.component.html',
  styleUrls: ['./notification-details-dialog.component.scss']
})
export class NotificationDetailsDialogComponent implements OnInit {
  notification: Notification;
  activeTabIndex = 0;

  /**
   * Close the dialog
   */
  onClose(): void {
    this.dialogRef.close();
  }
  
  // Status and type helpers
  statusColor: string;
  typeIcon: string;
  
  constructor(
    public dialogRef: MatDialogRef<NotificationDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { notification: Notification }
  ) {
    this.notification = data.notification;
    this.statusColor = getNotificationStatusColor(this.notification.status);
    this.typeIcon = getNotificationTypeIcon(this.notification.type);
  }
  
  ngOnInit(): void {
    // Format dates if they're strings
    this.formatDates();
  }
  
  private formatDates(): void {
    const dateFields: (keyof Notification)[] = ['createdAt', 'updatedAt', 'sentAt', 'deliveredAt', 'scheduledAt'];
    
    dateFields.forEach(field => {
      if (this.notification[field] && typeof this.notification[field] === 'string') {
        this.notification = {
          ...this.notification,
          [field]: new Date(this.notification[field] as string)
        };
      }
    });
  }
  
  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'DRAFT': 'Brouillon',
      'SCHEDULED': 'Planifiée',
      'SENDING': 'Envoi en cours',
      'SENT': 'Envoyée',
      'DELIVERED': 'Livrée',
      'FAILED': 'Échouée',
      'CANCELLED': 'Annulée'
    };
    
    return statusMap[status] || status;
  }
  
  getPriorityText(priority: string): string {
    const priorityMap: Record<string, string> = {
      'LOW': 'Basse',
      'NORMAL': 'Normale',
      'HIGH': 'Haute',
      'URGENT': 'Urgente'
    };
    
    return priorityMap[priority] || priority;
  }
  
  getTypeText(type: string): string {
    const typeMap: Record<string, string> = {
      'EMAIL': 'Email',
      'SMS': 'SMS',
      'IN_APP': 'Notification interne',
      'SYSTEM': 'Système'
    };
    
    return typeMap[type] || type;
  }
  
  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'URGENT':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'LOW':
        return 'arrow_downward';
      default:
        return 'remove';
    }
  }
  
  copyToClipboard(text: string): void {
    // The cdkCopyToClipboard directive handles the actual copying
    // This method is just for showing feedback
    // The actual copy is handled by the directive in the template
  }
  
  getEmailHeaders(): { key: string; value: any }[] {
    if (!this.notification) return [];
    
    const headers: { key: string; value: any }[] = [
      { key: 'De', value: this.notification.from || 'Système' },
      { key: 'À', value: this.notification.to?.join(', ') || 'N/A' }
    ];
    
    if (this.notification.cc?.length) {
      headers.push({ key: 'Cc', value: this.notification.cc.join(', ') });
    }
    
    if (this.notification.bcc?.length) {
      headers.push({ key: 'Cci', value: this.notification.bcc.join(', ') });
    }
    
    if (this.notification.sentAt) {
      headers.push({ 
        key: 'Envoyé le', 
        value: this.formatDateForDisplay(this.notification.sentAt) 
      });
    }
    
    return headers;
  }
  
  private formatDateForDisplay(date: Date | string): string {
    if (!date) return 'N/A';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  closeDialog(): void {
    this.dialogRef.close();
  }
}
