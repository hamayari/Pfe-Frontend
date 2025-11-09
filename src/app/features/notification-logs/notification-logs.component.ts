import { Component, OnInit, ViewChild, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Mock interfaces for now
interface Notification {
  id: string;
  type: string;
  subject: string;
  recipient: string;
  status: string;
  date: Date;
  priority: string;
}

enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH'
}

enum NotificationStatus {
  SENT = 'SENT',
  FAILED = 'FAILED',
  SCHEDULED = 'SCHEDULED',
  SENDING = 'SENDING'
}

enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

interface NotificationTableItem extends Notification {
  recipientDisplay: string;
  dateDisplay: string;
  statusColor: string;
  typeIcon: string;
}

@Component({
  selector: 'app-notification-logs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    DatePipe,
    TruncatePipe
  ],
  templateUrl: './notification-logs.component.html',
  styleUrls: ['./notification-logs.component.scss']
})
export class NotificationLogsComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Services
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  // Table data
  dataSource = new MatTableDataSource<NotificationTableItem>([]);
  displayedColumns: string[] = [
    'type', 'subject', 'recipient', 'status', 'date', 'actions'
  ];
  
  // Filter form
  filterForm: FormGroup;
  
  // Loading states
  isLoading = false;
  isRefreshing = false;
  
  // Filter options
  notificationTypes = Object.values(NotificationType);
  notificationStatuses = Object.values(NotificationStatus);
  notificationPriorities = Object.values(NotificationPriority);
  
  // Pagination
  totalItems = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  
  // Date pickers
  startDatePicker: any;
  endDatePicker: any;
  
  // Mock data
  notifications: Notification[] = [
    {
      id: '1',
      type: 'EMAIL',
      subject: 'Test Notification',
      recipient: 'user@example.com',
      status: 'SENT',
      date: new Date(),
      priority: 'MEDIUM'
    }
  ];
  
  // Destroy subject
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {
    this.filterForm = this.fb.group({
      search: [''],
      type: [''],
      status: [''],
      priority: [''],
      startDate: [''],
      endDate: [''],
      page: [0],
      limit: [this.pageSize]
    });
  }

  ngOnInit(): void {
    this.setupFilterSubscription();
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadNotifications();
    });
  }

  private loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getPaymentNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items: any[]) => {
          const mapped: NotificationTableItem[] = (items || []).map((n: any) => ({
            id: n.id,
            type: (n.type || 'SYSTEM').toUpperCase(),
            subject: n.subject || n.message || 'Notification',
            recipient: n.recipient || n.recipientId || '-',
            status: n.status || 'SENT',
            date: n.sentAt ? new Date(n.sentAt) : new Date(),
            priority: 'MEDIUM',
            recipientDisplay: n.recipient || n.recipientId || '-',
            dateDisplay: n.sentAt ? new Date(n.sentAt).toLocaleDateString() : new Date().toLocaleDateString(),
            statusColor: this.getStatusColor(n.status || 'SENT'),
            typeIcon: this.getTypeIcon((n.type || 'SYSTEM').toUpperCase())
          }));
          this.dataSource.data = mapped;
          this.totalItems = mapped.length;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.snackBar.open('Erreur chargement des notifications', 'Fermer', { duration: 3000 });
        }
      });
  }

  markSelectedAsRead(selectedIds: string[]): void {
    if (!selectedIds || selectedIds.length === 0) {
      this.snackBar.open('Aucune notification sélectionnée', 'Fermer', { duration: 2000 });
      return;
    }
    this.notificationService.markReadBulk(selectedIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.snackBar.open(`${res.count} notification(s) marquée(s) comme lue(s)`, 'Fermer', { duration: 3000 });
          this.loadNotifications();
        },
        error: () => this.snackBar.open('Erreur marquage en masse', 'Fermer', { duration: 3000 })
      });
  }

  refreshUnreadCount(): void {
    this.notificationService.getUnreadCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (count) => {
          // Optionally emit or integrate with a header badge service
          console.log('Unread count:', count);
        }
      });
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'SENT': return 'success';
      case 'FAILED': return 'error';
      case 'SCHEDULED': return 'warning';
      case 'SENDING': return 'info';
      default: return 'default';
    }
  }

  private getTypeIcon(type: string): string {
    switch (type) {
      case 'EMAIL': return 'email';
      case 'SMS': return 'sms';
      case 'PUSH': return 'notifications';
      default: return 'notifications';
    }
  }

  /**
   * Check if notification can be retried
   */
  canRetry(notification: Notification): boolean {
    return notification.status === 'FAILED';
  }
  
  /**
   * Check if notification can be cancelled
   */
  canCancel(notification: Notification): boolean {
    return ['SCHEDULED', 'SENDING'].includes(notification.status);
  }
  
  /**
   * Refresh notifications
   */
  refresh(): void {
    this.isRefreshing = true;
    this.loadNotifications();
    setTimeout(() => {
      this.isRefreshing = false;
    }, 1000);
  }
  
  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      type: '',
      status: '',
      priority: '',
      startDate: '',
      endDate: '',
      page: 0,
      limit: this.pageSize
    });
    
    // Reset paginator
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }
  
  /**
   * Handle page change
   */
  onPageChange(event: any): void {
    this.filterForm.patchValue({
      page: event.pageIndex,
      limit: event.pageSize
    }, { emitEvent: false });
    
    this.loadNotifications();
  }
  
  /**
   * View notification details
   */
  viewDetails(notification: Notification): void {
    console.log('Viewing notification:', notification);
    this.snackBar.open('Détails de la notification', 'Fermer', { duration: 3000 });
  }
  
  /**
   * Retry sending a failed notification
   */
  retryNotification(notification: Notification): void {
    const snackBarRef = this.snackBar.open('Nouvelle tentative d\'envoi...', 'Annuler', { duration: 5000 });
    
    // Mock retry
    setTimeout(() => {
      snackBarRef.dismiss();
      this.snackBar.open('Notification renvoyée avec succès', 'Fermer', { duration: 3000 });
      this.loadNotifications();
    }, 2000);
    
    // Handle cancel action
    snackBarRef.onAction().subscribe(() => {
      this.snackBar.open('Opération annulée', 'Fermer', { duration: 2000 });
    });
  }
  
  /**
   * Cancel a scheduled notification
   */
  cancelNotification(notification: Notification): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Annuler la notification',
        message: 'Êtes-vous sûr de vouloir annuler cette notification ? Cette action est irréversible.',
        confirmText: 'Annuler la notification',
        confirmColor: 'warn'
      }
    });
    
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const snackBarRef = this.snackBar.open('Annulation en cours...', 'Annuler', { duration: 5000 });
        
        // Mock cancellation
        setTimeout(() => {
          snackBarRef.dismiss();
          this.snackBar.open('Notification annulée avec succès', 'Fermer', { duration: 3000 });
          this.loadNotifications();
        }, 2000);
        
        // Handle cancel action
        snackBarRef.onAction().subscribe(() => {
          this.snackBar.open('Opération annulée', 'Fermer', { duration: 2000 });
        });
      }
    });
  }

  getStatusText(status: string): string {
    const statusMap: any = {
      'SENT': 'Envoyé',
      'PENDING': 'En attente',
      'FAILED': 'Échec',
      'CANCELLED': 'Annulé'
    };
    return statusMap[status] || status;
  }

  getPriorityText(priority: string): string {
    const priorityMap: any = {
      'HIGH': 'Élevée',
      'MEDIUM': 'Moyenne',
      'LOW': 'Faible'
    };
    return priorityMap[priority] || priority;
  }
}

// Mock ConfirmDialogComponent
@Component({
  selector: 'app-confirm-dialog',
  template: '<div>Mock Dialog</div>',
  standalone: true,
  imports: [CommonModule]
})
class ConfirmDialogComponent {
  constructor() {}
}