import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  actions?: ToastAction[];
  persistent?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export interface ToastAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" [class]="'position-' + (notification.position || 'top-right')">
      <div 
        class="toast-notification"
        [class]="'toast-' + notification.type"
        [class.toast-persistent]="notification.persistent"
        [class.toast-with-actions]="notification.actions && notification.actions.length > 0"
        [@slideIn]
      >
        <!-- Icône et contenu principal -->
        <div class="toast-content">
          <div class="toast-icon">
            <i class="material-icons">{{ getTypeIcon(notification.type) }}</i>
          </div>
          
          <div class="toast-body">
            <h4 class="toast-title">{{ notification.title }}</h4>
            <p class="toast-message">{{ notification.message }}</p>
            
            <!-- Actions -->
            <div class="toast-actions" *ngIf="notification.actions && notification.actions.length > 0">
              <button 
                *ngFor="let action of notification.actions" 
                class="toast-action-btn"
                [class]="'btn-' + (action.style || 'secondary')"
                (click)="executeAction(action)"
              >
                {{ action.label }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Bouton de fermeture -->
        <button 
          class="toast-close" 
          (click)="dismiss()"
          *ngIf="!notification.persistent"
          title="Fermer"
        >
          <i class="material-icons">close</i>
        </button>
        
        <!-- Barre de progression -->
        <div 
          class="toast-progress" 
          *ngIf="!notification.persistent && notification.duration"
          [style.animation-duration]="(notification.duration / 1000) + 's'"
        ></div>
      </div>
    </div>
  `,
  styleUrls: ['./notification-toast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // Animation d'entrée
    {
      name: 'slideIn',
      options: {
        trigger: 'slideIn',
        state: 'in',
        style: {
          transform: 'translateX(0)',
          opacity: 1
        },
        transition: 'void => *',
        animate: '300ms ease-out'
      }
    }
  ]
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  @Input() notification!: ToastNotification;
  
  private destroy$ = new Subject<void>();
  private dismissTimer?: number;
  
  constructor(private cdr: ChangeDetectorRef) {}
  
  ngOnInit(): void {
    // Démarrer le timer de fermeture automatique
    if (!this.notification.persistent && this.notification.duration) {
      this.startDismissTimer();
    }
  }
  
  ngOnDestroy(): void {
    this.clearDismissTimer();
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Démarrer le timer de fermeture automatique
   */
  private startDismissTimer(): void {
    this.dismissTimer = window.setTimeout(() => {
      this.dismiss();
    }, this.notification.duration);
  }
  
  /**
   * Nettoyer le timer
   */
  private clearDismissTimer(): void {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = undefined;
    }
  }
  
  /**
   * Fermer la notification
   */
  dismiss(): void {
    this.clearDismissTimer();
    // Émettre un événement de fermeture
    // TODO: Implémenter l'émission d'événement vers le service parent
  }
  
  /**
   * Exécuter une action
   */
  executeAction(action: ToastAction): void {
    try {
      action.action();
      // Fermer la notification après l'action
      this.dismiss();
    } catch (error) {
      console.error('Erreur lors de l\'exécution de l\'action:', error);
    }
  }
  
  /**
   * Obtenir l'icône selon le type
   */
  getTypeIcon(type: string): string {
    const icons = {
      'success': 'check_circle',
      'info': 'info',
      'warning': 'warning',
      'error': 'error'
    };
    return icons[type as keyof typeof icons] || 'notifications';
  }
}











