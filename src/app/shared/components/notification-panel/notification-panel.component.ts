import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService, Notification } from '../../../services/notification.service';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <button 
      mat-icon-button 
      [matMenuTriggerFor]="notificationMenu"
      [matBadge]="unreadCount"
      [matBadgeHidden]="unreadCount === 0"
      matBadgeColor="warn"
      matTooltip="Notifications"
      (menuOpened)="onMenuOpened()"
      class="notification-button">
      <mat-icon>notifications</mat-icon>
    </button>

    <mat-menu #notificationMenu="matMenu" class="notification-menu" xPosition="before">
      <!-- Header -->
      <div class="notification-header" (click)="$event.stopPropagation()">
        <h3>Notifications</h3>
        <button 
          mat-icon-button 
          *ngIf="notifications.length > 0"
          (click)="markAllAsRead()"
          matTooltip="Tout marquer comme lu">
          <mat-icon>done_all</mat-icon>
        </button>
      </div>
      
      <mat-divider></mat-divider>

      <!-- Liste des notifications -->
      <div class="notification-list" (click)="$event.stopPropagation()">
        <div *ngIf="loading" class="notification-loading">
          <mat-icon class="spinning">refresh</mat-icon>
          <p>Chargement...</p>
        </div>

        <div *ngIf="!loading && notifications.length === 0" class="notification-empty">
          <mat-icon>notifications_none</mat-icon>
          <p>Aucune notification</p>
        </div>

        <div 
          *ngFor="let notification of notifications" 
          class="notification-item"
          [class.unread]="!notification.read"
          [class.high-priority]="notification.priority === 'HIGH'"
          (click)="onNotificationClick(notification)">
          
          <div class="notification-icon" [ngClass]="getIconClass(notification.type)">
            <mat-icon>{{ getIcon(notification.type) }}</mat-icon>
          </div>

          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ getTimeAgo(notification.timestamp) }}</div>
          </div>

          <button 
            mat-icon-button 
            class="notification-delete"
            (click)="deleteNotification(notification, $event)"
            matTooltip="Supprimer">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <mat-divider *ngIf="notifications.length > 0"></mat-divider>

      <!-- Footer -->
      <div class="notification-footer" (click)="$event.stopPropagation()">
        <button mat-button (click)="viewAllNotifications()">
          Voir toutes les notifications
        </button>
      </div>
    </mat-menu>
  `,
  styles: [`
    .notification-button {
      position: relative;
    }

    ::ng-deep .notification-menu {
      max-width: 400px !important;
      width: 400px;
    }

    ::ng-deep .notification-menu .mat-mdc-menu-content {
      padding: 0 !important;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f5f5f5;
    }

    .notification-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .notification-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-loading,
    .notification-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: #999;
    }

    .notification-loading mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 10px;
    }

    .notification-empty mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 10px;
      color: #ccc;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.2s;
      border-left: 3px solid transparent;
    }

    .notification-item:hover {
      background-color: #f9f9f9;
    }

    .notification-item.unread {
      background-color: #e3f2fd;
      border-left-color: #2196f3;
    }

    .notification-item.high-priority {
      border-left-color: #f44336;
    }

    .notification-icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    }

    .notification-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .icon-error {
      background-color: #ffebee;
      color: #f44336;
    }

    .icon-warning {
      background-color: #fff3e0;
      color: #ff9800;
    }

    .icon-info {
      background-color: #e3f2fd;
      color: #2196f3;
    }

    .icon-success {
      background-color: #e8f5e9;
      color: #4caf50;
    }

    .icon-system {
      background-color: #f3e5f5;
      color: #9c27b0;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 600;
      font-size: 14px;
      color: #333;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .notification-message {
      font-size: 13px;
      color: #666;
      line-height: 1.4;
      margin-bottom: 4px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .notification-time {
      font-size: 11px;
      color: #999;
    }

    .notification-delete {
      flex-shrink: 0;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .notification-item:hover .notification-delete {
      opacity: 1;
    }

    .notification-footer {
      padding: 12px 16px;
      text-align: center;
      background: #f5f5f5;
    }

    .notification-footer button {
      width: 100%;
    }
  `]
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  @Input() autoRefresh = true;
  @Input() refreshInterval = 30000; // 30 secondes
  @Output() notificationClicked = new EventEmitter<Notification>();

  notifications: Notification[] = [];
  unreadCount = 0;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.loadUnreadCount();

    // Auto-refresh
    if (this.autoRefresh) {
      interval(this.refreshInterval)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.loadNotifications();
          this.loadUnreadCount();
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMenuOpened(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          // Filtrer les doublons par ID et limiter à 10 plus récentes
          const uniqueNotifications = notifications.filter((notif, index, self) =>
            index === self.findIndex((n) => n.id === notif.id)
          );
          
          // Trier par date décroissante et limiter à 10
          this.notifications = uniqueNotifications
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);
          
          this.loading = false;
          console.log('✅ Notifications chargées:', this.notifications.length, '(total:', notifications.length, ')');
          
          // Avertir s'il y a trop de notifications
          if (notifications.length > 50) {
            console.warn('⚠️ Trop de notifications en base:', notifications.length, '- Nettoyage recommandé');
          }
        },
        error: (error) => {
          console.error('❌ Erreur chargement notifications:', error);
          this.loading = false;
        }
      });
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (count) => {
          this.unreadCount = count;
          console.log('📊 Compteur non lues:', count);
        },
        error: (error) => {
          console.error('❌ Erreur compteur:', error);
        }
      });
  }

  onNotificationClick(notification: Notification): void {
    console.log('🔔 Notification cliquée:', notification);

    // Marquer comme lue si non lue
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            notification.read = true;
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          },
          error: (error) => {
            console.error('❌ Erreur marquer comme lu:', error);
          }
        });
    }

    // Émettre l'événement
    this.notificationClicked.emit(notification);

    // Navigation si lien présent
    if ((notification as any).link) {
      this.router.navigate([(notification as any).link]);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications.forEach(n => n.read = true);
          this.unreadCount = 0;
          console.log('✅ Toutes les notifications marquées comme lues');
        },
        error: (error) => {
          console.error('❌ Erreur marquer tout comme lu:', error);
        }
      });
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    
    this.notificationService.deleteNotification(notification.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const index = this.notifications.findIndex(n => n.id === notification.id);
          if (index > -1) {
            this.notifications.splice(index, 1);
            if (!notification.read) {
              this.unreadCount = Math.max(0, this.unreadCount - 1);
            }
          }
          console.log('✅ Notification supprimée');
        },
        error: (error) => {
          console.error('❌ Erreur suppression:', error);
        }
      });
  }

  viewAllNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  getIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'ALERT_DELEGATED': 'warning',
      'KPI_ALERT': 'analytics',
      'INVOICE_ALERT': 'receipt',
      'CONVENTION_ALERT': 'description',
      'PAYMENT': 'payment',
      'SYSTEM': 'info',
      'INFO': 'notifications',
      'SUCCESS': 'check_circle',
      'ERROR': 'error',
      'WARNING': 'warning'
    };
    return icons[type] || 'notifications';
  }

  getIconClass(type: string): string {
    const classes: { [key: string]: string } = {
      'ALERT_DELEGATED': 'icon-error',
      'KPI_ALERT': 'icon-error',
      'INVOICE_ALERT': 'icon-warning',
      'CONVENTION_ALERT': 'icon-info',
      'PAYMENT': 'icon-success',
      'SYSTEM': 'icon-system',
      'INFO': 'icon-info',
      'SUCCESS': 'icon-success',
      'ERROR': 'icon-error',
      'WARNING': 'icon-warning'
    };
    return classes[type] || 'icon-info';
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const notifDate = new Date(timestamp);
    
    // Calculer la différence en millisecondes
    const diff = now.getTime() - notifDate.getTime();
    const seconds = Math.floor(Math.abs(diff) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // Si la différence est négative (notification dans le futur), c'est un problème de timezone
    if (diff < 0) {
      console.warn('⚠️ Notification dans le futur détectée:', timestamp, 'vs maintenant:', now);
      return 'À l\'instant';
    }

    if (seconds < 60) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return notifDate.toLocaleDateString('fr-FR');
  }
}
