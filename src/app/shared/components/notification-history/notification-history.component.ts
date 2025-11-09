import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface NotificationHistoryItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  timestamp: Date;
  read: boolean;
  acknowledged: boolean;
  source: string;
  metadata?: any;
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: { [key: string]: number };
  byCategory: { [key: string]: number };
  byPriority: { [key: string]: number };
}

@Component({
  selector: 'app-notification-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notification-history-container">
      <!-- Header avec statistiques -->
      <div class="history-header">
        <div class="header-title">
          <h2>📊 Historique des Notifications</h2>
          <p>Gestion et suivi de toutes vos notifications</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card total">
            <div class="stat-icon">📢</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">Total</div>
            </div>
          </div>
          
          <div class="stat-card unread">
            <div class="stat-icon">🔔</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.unread }}</div>
              <div class="stat-label">Non lues</div>
            </div>
          </div>
          
          <div class="stat-card success">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.byType['success'] || 0 }}</div>
              <div class="stat-label">Succès</div>
            </div>
          </div>
          
          <div class="stat-card warning">
            <div class="stat-icon">⚠️</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.byType['warning'] || 0 }}</div>
              <div class="stat-label">Alertes</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres et contrôles -->
      <div class="filters-section">
        <div class="filters-row">
          <div class="filter-group">
            <label>Type :</label>
            <select [(ngModel)]="selectedType" (change)="applyFilters()">
              <option value="">Tous les types</option>
              <option value="success">✅ Succès</option>
              <option value="info">ℹ️ Info</option>
              <option value="warning">⚠️ Avertissement</option>
              <option value="error">❌ Erreur</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Catégorie :</label>
            <select [(ngModel)]="selectedCategory" (change)="applyFilters()">
              <option value="">Toutes les catégories</option>
              <option value="convention">📄 Conventions</option>
              <option value="invoice">💰 Factures</option>
              <option value="payment">💳 Paiements</option>
              <option value="system">⚙️ Système</option>
              <option value="user">👤 Utilisateur</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Priorité :</label>
            <select [(ngModel)]="selectedPriority" (change)="applyFilters()">
              <option value="">Toutes les priorités</option>
              <option value="low">🟢 Faible</option>
              <option value="medium">🟡 Moyenne</option>
              <option value="high">🟠 Élevée</option>
              <option value="critical">🔴 Critique</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Statut :</label>
            <select [(ngModel)]="selectedStatus" (change)="applyFilters()">
              <option value="">Tous les statuts</option>
              <option value="unread">🔔 Non lues</option>
              <option value="read">👁️ Lues</option>
              <option value="acknowledged">✅ Acquittées</option>
            </select>
          </div>
        </div>
        
        <div class="actions-row">
          <button class="btn btn-primary" (click)="markAllAsRead()" [disabled]="stats.unread === 0">
            <i class="material-icons">done_all</i>
            Marquer tout comme lu
          </button>
          
          <button class="btn btn-secondary" (click)="clearReadNotifications()">
            <i class="material-icons">clear_all</i>
            Nettoyer les lues
          </button>
          
          <button class="btn btn-outline" (click)="exportHistory()">
            <i class="material-icons">download</i>
            Exporter
          </button>
          
          <button class="btn btn-outline" (click)="refreshHistory()">
            <i class="material-icons">refresh</i>
            Actualiser
          </button>
        </div>
      </div>

      <!-- Liste des notifications -->
      <div class="notifications-list">
        <div class="list-header">
          <div class="header-info">
            <span>{{ filteredNotifications.length }} notification(s) trouvée(s)</span>
            <span *ngIf="selectedType || selectedCategory || selectedPriority || selectedStatus" class="filter-indicator">
              (Filtres actifs)
            </span>
          </div>
          
          <div class="sort-controls">
            <label>Trier par :</label>
            <select [(ngModel)]="sortBy" (change)="applySorting()">
              <option value="timestamp">Date</option>
              <option value="priority">Priorité</option>
              <option value="type">Type</option>
              <option value="category">Catégorie</option>
            </select>
            <button class="sort-btn" (click)="toggleSortOrder()">
              <i class="material-icons">{{ sortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward' }}</i>
            </button>
          </div>
        </div>

        <div class="notifications-container">
          <div 
            *ngFor="let notification of filteredNotifications; trackBy: trackByNotificationId" 
            class="notification-item"
            [class.unread]="!notification.read"
            [class.acknowledged]="notification.acknowledged"
            [class.priority-high]="notification.priority === 'high' || notification.priority === 'critical'"
          >
            <div class="notification-content">
              <div class="notification-header">
                <div class="notification-type">
                  <span class="type-icon" [class]="'type-' + notification.type">
                    {{ getTypeIcon(notification.type) }}
                  </span>
                  <span class="type-label">{{ getTypeLabel(notification.type) }}</span>
                </div>
                
                <div class="notification-meta">
                  <span class="priority-badge" [class]="'priority-' + notification.priority">
                    {{ getPriorityLabel(notification.priority) }}
                  </span>
                  <span class="category-badge">{{ getCategoryLabel(notification.category) }}</span>
                  <span class="timestamp">{{ formatTimestamp(notification.timestamp) }}</span>
                </div>
              </div>
              
              <div class="notification-body">
                <h4 class="notification-title">{{ notification.title }}</h4>
                <p class="notification-message">{{ notification.message }}</p>
                
                <div class="notification-source" *ngIf="notification.source">
                  <small>Source: {{ notification.source }}</small>
                </div>
              </div>
              
              <div class="notification-actions">
                <button 
                  *ngIf="!notification.read" 
                  class="btn btn-sm btn-primary" 
                  (click)="markAsRead(notification.id)"
                >
                  <i class="material-icons">visibility</i>
                  Marquer comme lu
                </button>
                
                <button 
                  *ngIf="!notification.acknowledged" 
                  class="btn btn-sm btn-success" 
                  (click)="acknowledge(notification.id)"
                >
                  <i class="material-icons">check_circle</i>
                  Acquitter
                </button>
                
                <button 
                  class="btn btn-sm btn-outline" 
                  (click)="viewDetails(notification)"
                >
                  <i class="material-icons">info</i>
                  Détails
                </button>
              </div>
            </div>
          </div>
          
          <div *ngIf="filteredNotifications.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>Aucune notification trouvée</h3>
            <p *ngIf="selectedType || selectedCategory || selectedPriority || selectedStatus">
              Essayez de modifier vos filtres pour voir plus de résultats.
            </p>
            <p *ngIf="!selectedType && !selectedCategory && !selectedPriority && !selectedStatus">
              Vous n'avez pas encore de notifications dans votre historique.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./notification-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationHistoryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Données
  notifications: NotificationHistoryItem[] = [];
  filteredNotifications: NotificationHistoryItem[] = [];
  stats: NotificationStats = {
    total: 0,
    unread: 0,
    byType: {},
    byCategory: {},
    byPriority: {}
  };
  
  // Filtres
  selectedType: string = '';
  selectedCategory: string = '';
  selectedPriority: string = '';
  selectedStatus: string = '';
  
  // Tri
  sortBy: string = 'timestamp';
  sortOrder: 'asc' | 'desc' = 'desc';
  
  constructor(private cdr: ChangeDetectorRef) {}
  
  ngOnInit(): void {
    this.loadNotificationHistory();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Charger l'historique des notifications
   */
  loadNotificationHistory(): void {
    // Simulation de données - à remplacer par un appel API réel
    this.notifications = [
      {
        id: '1',
        type: 'success',
        title: '✅ Nouvelle Convention Créée',
        message: 'Convention CONV-2024-001 créée avec succès pour Projet Alpha',
        priority: 'medium',
        category: 'convention',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        read: false,
        acknowledged: false,
        source: 'ConventionService'
      },
      {
        id: '2',
        type: 'info',
        title: '📄 Nouvelle Facture Générée',
        message: 'Facture FACT-CONV-2024-001-1234567890 générée pour la convention CONV-2024-001 (Montant: 15000€)',
        priority: 'medium',
        category: 'invoice',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
        read: true,
        acknowledged: false,
        source: 'CommercialDashboardService'
      },
      {
        id: '3',
        type: 'warning',
        title: '⚠️ Facture en Retard',
        message: 'Facture FACT-CONV-2023-045-9876543210 en retard de 5 jours (Montant: 8500€)',
        priority: 'high',
        category: 'invoice',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: false,
        acknowledged: false,
        source: 'NotificationSchedulerService'
      },
      {
        id: '4',
        type: 'info',
        title: '📄 Facture Envoyée',
        message: 'Facture FACT-CONV-2024-001-1234567890 envoyée à client@example.com (Montant: 15000€)',
        priority: 'medium',
        category: 'invoice',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3h ago
        read: true,
        acknowledged: true,
        source: 'CommercialDashboardService'
      },
      {
        id: '5',
        type: 'error',
        title: '❌ Erreur de Paiement',
        message: 'Échec du traitement du paiement pour la facture FACT-CONV-2024-002-1234567891',
        priority: 'critical',
        category: 'payment',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6h ago
        read: false,
        acknowledged: false,
        source: 'PaymentService'
      }
    ];
    
    this.applyFilters();
    this.calculateStats();
    this.cdr.markForCheck();
  }
  
  /**
   * Appliquer les filtres
   */
  applyFilters(): void {
    this.filteredNotifications = this.notifications.filter(notification => {
      const typeMatch = !this.selectedType || notification.type === this.selectedType;
      const categoryMatch = !this.selectedCategory || notification.category === this.selectedCategory;
      const priorityMatch = !this.selectedPriority || notification.priority === this.selectedPriority;
      
      let statusMatch = true;
      if (this.selectedStatus === 'unread') {
        statusMatch = !notification.read;
      } else if (this.selectedStatus === 'read') {
        statusMatch = notification.read;
      } else if (this.selectedStatus === 'acknowledged') {
        statusMatch = notification.acknowledged;
      }
      
      return typeMatch && categoryMatch && priorityMatch && statusMatch;
    });
    
    this.applySorting();
  }
  
  /**
   * Appliquer le tri
   */
  applySorting(): void {
    this.filteredNotifications.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'timestamp':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'priority':
          const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                      (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return this.sortOrder === 'desc' ? -comparison : comparison;
    });
  }
  
  /**
   * Basculer l'ordre de tri
   */
  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
    this.applySorting();
  }
  
  /**
   * Calculer les statistiques
   */
  calculateStats(): void {
    this.stats = {
      total: this.notifications.length,
      unread: this.notifications.filter(n => !n.read).length,
      byType: {},
      byCategory: {},
      byPriority: {}
    };
    
    this.notifications.forEach(notification => {
      // Par type
      this.stats.byType[notification.type] = (this.stats.byType[notification.type] || 0) + 1;
      
      // Par catégorie
      this.stats.byCategory[notification.category] = (this.stats.byCategory[notification.category] || 0) + 1;
      
      // Par priorité
      this.stats.byPriority[notification.priority] = (this.stats.byPriority[notification.priority] || 0) + 1;
    });
  }
  
  /**
   * Marquer comme lu
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.calculateStats();
      this.applyFilters();
      this.cdr.markForCheck();
      
      // TODO: Appel API pour marquer comme lu
      console.log('Marquer comme lu:', notificationId);
    }
  }
  
  /**
   * Acquitter une notification
   */
  acknowledge(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.acknowledged = true;
      notification.read = true;
      this.calculateStats();
      this.applyFilters();
      this.cdr.markForCheck();
      
      // TODO: Appel API pour acquitter
      console.log('Acquitter:', notificationId);
    }
  }
  
  /**
   * Marquer tout comme lu
   */
  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.calculateStats();
    this.applyFilters();
    this.cdr.markForCheck();
    
    // TODO: Appel API pour marquer tout comme lu
    console.log('Marquer tout comme lu');
  }
  
  /**
   * Nettoyer les notifications lues
   */
  clearReadNotifications(): void {
    this.notifications = this.notifications.filter(notification => !notification.read);
    this.calculateStats();
    this.applyFilters();
    this.cdr.markForCheck();
    
    // TODO: Appel API pour nettoyer
    console.log('Nettoyer les notifications lues');
  }
  
  /**
   * Exporter l'historique
   */
  exportHistory(): void {
    const data = this.filteredNotifications.map(n => ({
      Type: n.type,
      Titre: n.title,
      Message: n.message,
      Priorité: n.priority,
      Catégorie: n.category,
      Date: n.timestamp.toISOString(),
      Lu: n.read ? 'Oui' : 'Non',
      Acquitté: n.acknowledged ? 'Oui' : 'Non',
      Source: n.source
    }));
    
    const csv = this.convertToCSV(data);
    this.downloadCSV(csv, 'historique-notifications.csv');
  }
  
  /**
   * Actualiser l'historique
   */
  refreshHistory(): void {
    this.loadNotificationHistory();
  }
  
  /**
   * Voir les détails d'une notification
   */
  viewDetails(notification: NotificationHistoryItem): void {
    // TODO: Ouvrir un modal avec les détails
    console.log('Détails de la notification:', notification);
  }
  
  // Méthodes utilitaires
  getTypeIcon(type: string): string {
    const icons = {
      'success': '✅',
      'info': 'ℹ️',
      'warning': '⚠️',
      'error': '❌'
    };
    return icons[type as keyof typeof icons] || '📢';
  }
  
  getTypeLabel(type: string): string {
    const labels = {
      'success': 'Succès',
      'info': 'Information',
      'warning': 'Avertissement',
      'error': 'Erreur'
    };
    return labels[type as keyof typeof labels] || 'Notification';
  }
  
  getPriorityLabel(priority: string): string {
    const labels = {
      'low': 'Faible',
      'medium': 'Moyenne',
      'high': 'Élevée',
      'critical': 'Critique'
    };
    return labels[priority as keyof typeof labels] || 'Moyenne';
  }
  
  getCategoryLabel(category: string): string {
    const labels = {
      'convention': 'Convention',
      'invoice': 'Facture',
      'payment': 'Paiement',
      'system': 'Système',
      'user': 'Utilisateur'
    };
    return labels[category as keyof typeof labels] || category;
  }
  
  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    if (diff < 60000) { // Moins d'1 minute
      return 'À l\'instant';
    } else if (diff < 3600000) { // Moins d'1 heure
      const minutes = Math.floor(diff / 60000);
      return `Il y a ${minutes} min`;
    } else if (diff < 86400000) { // Moins d'1 jour
      const hours = Math.floor(diff / 3600000);
      return `Il y a ${hours}h`;
    } else {
      return timestamp.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
  
  trackByNotificationId(index: number, notification: NotificationHistoryItem): string {
    return notification.id;
  }
  
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    return csvContent;
  }
  
  private downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}











