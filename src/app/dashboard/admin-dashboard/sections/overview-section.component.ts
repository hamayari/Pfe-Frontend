import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AddUserDialogComponent } from '../dialogs/add-user-dialog.component';
import { AddNomenclatureDialogComponent } from '../dialogs/add-nomenclature-dialog.component';
import { UserService } from '../../../services/user.service';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  createdAt: Date;
}

interface Convention {
  id: string;
  reference: string;
  label: string;
  structure: string;
  governorate: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'pending' | 'renewal';
  amount: number;
}

interface Invoice {
  id: string;
  reference: string;
  conventionRef: string;
  amount: number;
  dueDate: Date;
  status: 'paid' | 'pending' | 'overdue';
  structure: string;
}

interface Notification {
  id: string;
  type: 'system' | 'convention' | 'invoice' | 'user';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface UserStats {
  total: number;
  newThisMonth: number;
  active: number;
  pending: number;
  inactive: number;
  byRole: { role: string; count: number; percentage: number }[];
}

interface ConventionStats {
  total: number;
  active: number;
  expired: number;
  renewal: number;
  byGovernorate: { governorate: string; count: number }[];
}

interface InvoiceStats {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

@Component({
  selector: 'app-overview-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatExpansionModule,
    MatDialogModule
  ],
  template: `
    <div class="overview-section">
      <!-- En-tête de la page -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-title">
            <h1>
              <mat-icon>visibility</mat-icon>
              Vue d'ensemble – Administration
            </h1>
            <p>Vision globale centralisée de l'application</p>
          </div>
          
          <div class="header-actions">
            <mat-form-field appearance="outline" class="period-filter">
              <mat-label>Période</mat-label>
              <mat-select [(ngModel)]="selectedPeriod">
                <mat-option value="week">Semaine</mat-option>
                <mat-option value="month">Mois</mat-option>
                <mat-option value="year">Année</mat-option>
              </mat-select>
            </mat-form-field>
            
            <button mat-raised-button color="primary" class="action-btn" (click)="onActionClick('add-user')">
              <mat-icon>person_add</mat-icon>
              Ajouter Utilisateur
            </button>
            
            <button mat-raised-button color="accent" class="action-btn" (click)="onActionClick('add-nomenclature')">
              <mat-icon>category</mat-icon>
              Ajouter Nomenclature
            </button>
            
            <button mat-raised-button class="action-btn" (click)="onActionClick('generate-report')">
              <mat-icon>assessment</mat-icon>
              Générer Rapport
            </button>
          </div>
        </div>
      </div>

      <!-- Bloc Utilisateurs selon le cahier des charges -->
      <mat-card class="section-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>people</mat-icon>
            Bloc Utilisateurs
          </mat-card-title>
          <mat-card-subtitle>Tableau : Nom, Email, Rôle, Statut | Indicateurs : total, nouveaux ce mois, répartition par rôle</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Indicateurs rapides -->
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ userStats.total }}</div>
              <div class="stat-label">Total utilisateurs</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.newThisMonth }}</div>
              <div class="stat-label">Nouveaux ce mois</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.active }}</div>
              <div class="stat-label">Actifs</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.pending }}</div>
              <div class="stat-label">En attente</div>
            </div>
          </div>

          <!-- Tableau utilisateurs -->
          <div class="table-section">
            <div class="table-header">
              <h4>Utilisateurs récents</h4>
              <button mat-stroked-button color="primary" (click)="onActionClick('view-all-users')">
                <mat-icon>list</mat-icon>
                Voir tous les utilisateurs
              </button>
            </div>
            
            <table mat-table [dataSource]="recentUsers" class="data-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Nom d'utilisateur</th>
                <td mat-cell *matCellDef="let user">{{ user.name }}</td>
              </ng-container>
              
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let user">{{ user.email }}</td>
              </ng-container>
              
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Rôle</th>
                <td mat-cell *matCellDef="let user">{{ user.role }}</td>
              </ng-container>
              
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip [color]="getStatusColor(user.status)" selected>
                    {{ getStatusLabel(user.status) }}
                  </mat-chip>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="userColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: userColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Bloc Nomenclatures selon les spécifications -->
      <mat-card class="section-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>category</mat-icon>
            Bloc Nomenclatures
          </mat-card-title>
          <mat-card-subtitle>Applications (Nom, Description, Date ajout) | Zones géographiques (Nom, Région) | Structures (Nom, Type, Gouvernorat, Contact)</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Indicateurs rapides -->
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ conventionStats.active }}</div>
              <div class="stat-label">Actives</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ conventionStats.expired }}</div>
              <div class="stat-label">Expirées</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ conventionStats.renewal }}</div>
              <div class="stat-label">À renouveler</div>
            </div>
          </div>

          <!-- Tableau conventions -->
          <div class="table-section">
            <div class="table-header">
              <h4>Conventions récentes</h4>
              <button mat-stroked-button color="primary" (click)="onActionClick('view-all-conventions')">
                <mat-icon>list</mat-icon>
                Voir toutes les conventions
              </button>
            </div>
            
            <table mat-table [dataSource]="recentConventions" class="data-table">
              <ng-container matColumnDef="reference">
                <th mat-header-cell *matHeaderCellDef>Référence</th>
                <td mat-cell *matCellDef="let convention">{{ convention.reference }}</td>
              </ng-container>
              
              <ng-container matColumnDef="label">
                <th mat-header-cell *matHeaderCellDef>Libellé</th>
                <td mat-cell *matCellDef="let convention">{{ convention.label }}</td>
              </ng-container>
              
              <ng-container matColumnDef="structure">
                <th mat-header-cell *matHeaderCellDef>Structure</th>
                <td mat-cell *matCellDef="let convention">{{ convention.structure }}</td>
              </ng-container>
              
              <ng-container matColumnDef="governorate">
                <th mat-header-cell *matHeaderCellDef>Gouvernorat</th>
                <td mat-cell *matCellDef="let convention">{{ convention.governorate }}</td>
              </ng-container>
              
              <ng-container matColumnDef="dates">
                <th mat-header-cell *matHeaderCellDef>Période</th>
                <td mat-cell *matCellDef="let convention">
                  {{ formatDate(convention.startDate) }} - {{ formatDate(convention.endDate) }}
                </td>
              </ng-container>
              
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let convention">
                  <mat-chip [color]="getStatusColor(convention.status)" selected>
                    {{ getStatusLabel(convention.status) }}
                  </mat-chip>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="conventionColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: conventionColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Bloc Alertes / Notifications globales selon les spécifications -->
      <mat-card class="section-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>notifications</mat-icon>
            Bloc Alertes / Notifications globales
          </mat-card-title>
          <mat-card-subtitle>Dernières alertes liées aux utilisateurs, nomenclatures, sécurité (ex : échec connexion, mot de passe expiré)</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Indicateurs rapides -->
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ invoiceStats.total }}</div>
              <div class="stat-label">Total généré</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ formatCurrency(invoiceStats.paidAmount) }}</div>
              <div class="stat-label">Montant payé</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ formatCurrency(invoiceStats.pendingAmount) }}</div>
              <div class="stat-label">En attente</div>
            </div>
          </div>

          <!-- Tableau factures -->
          <div class="table-section">
            <div class="table-header">
              <h4>Factures récentes</h4>
              <button mat-stroked-button color="primary" (click)="onActionClick('view-all-invoices')">
                <mat-icon>list</mat-icon>
                Voir toutes les factures
              </button>
            </div>
            
            <table mat-table [dataSource]="recentInvoices" class="data-table">
              <ng-container matColumnDef="reference">
                <th mat-header-cell *matHeaderCellDef>Référence</th>
                <td mat-cell *matCellDef="let invoice">{{ invoice.reference }}</td>
              </ng-container>
              
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Montant</th>
                <td mat-cell *matCellDef="let invoice">{{ formatCurrency(invoice.amount) }}</td>
              </ng-container>
              
              <ng-container matColumnDef="dueDate">
                <th mat-header-cell *matHeaderCellDef>Date d'échéance</th>
                <td mat-cell *matCellDef="let invoice">{{ formatDate(invoice.dueDate) }}</td>
              </ng-container>
              
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let invoice">
                  <mat-chip [color]="getStatusColor(invoice.status)" selected>
                    {{ getStatusLabel(invoice.status) }}
                  </mat-chip>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="invoiceColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: invoiceColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Bloc Journal d'audit selon les spécifications -->
      <mat-card class="section-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>history</mat-icon>
            Bloc Journal d'audit (mini aperçu)
          </mat-card-title>
          <mat-card-subtitle>Dernières actions (ex : "Admin X a ajouté un utilisateur", "Admin Y a supprimé une structure")</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="notifications-section">
            <div class="notifications-header">
              <div class="filter-buttons">
                <button mat-button [class.active]="selectedNotificationType === 'all'" (click)="filterNotifications('all')">
                  Toutes
                </button>
                <button mat-button [class.active]="selectedNotificationType === 'system'" (click)="filterNotifications('system')">
                  Système
                </button>
                <button mat-button [class.active]="selectedNotificationType === 'convention'" (click)="filterNotifications('convention')">
                  Conventions
                </button>
                <button mat-button [class.active]="selectedNotificationType === 'invoice'" (click)="filterNotifications('invoice')">
                  Factures
                </button>
              </div>
              
              <button mat-stroked-button color="primary" (click)="onActionClick('view-all-alerts')">
                <mat-icon>list</mat-icon>
                Voir toutes les alertes
              </button>
            </div>
            
            <div class="notifications-list">
              <div *ngFor="let notification of filteredNotifications" class="notification-item" [class.unread]="!notification.read">
                <div class="notification-icon">
                  <mat-icon [color]="getSeverityColor(notification.severity)">
                    {{ getNotificationIcon(notification.type) }}
                  </mat-icon>
                </div>
                
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-message">{{ notification.message }}</div>
                  <div class="notification-time">{{ formatDate(notification.timestamp) }}</div>
                </div>
                
                <div class="notification-actions">
                  <button mat-icon-button (click)="markAsRead(notification.id)">
                    <mat-icon>check</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .overview-section {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-title h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-title p {
      margin: 8px 0 0 0;
      opacity: 0.9;
      font-size: 16px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }

    .period-filter {
      min-width: 120px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .section-card {
      margin-bottom: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    .section-card mat-card-header {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .section-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .section-card mat-card-subtitle {
      color: #666;
      margin: 8px 0 0 0;
      font-size: 14px;
    }

    .section-card mat-card-content {
      padding: 24px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-item {
      text-align: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #2196F3;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .table-section {
      margin-top: 20px;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .table-header h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .data-table {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .data-table th {
      background: #f5f5f5;
      font-weight: 600;
      color: #333;
    }

    .data-table td, .data-table th {
      padding: 12px 16px;
    }

    .notifications-section {
      margin-top: 20px;
    }

    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .filter-buttons {
      display: flex;
      gap: 8px;
    }

    .filter-buttons button {
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .filter-buttons button.active {
      background: #2196F3;
      color: white;
    }

    .notifications-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s;
    }

    .notification-item:hover {
      background: #f8f9fa;
    }

    .notification-item.unread {
      background: #e3f2fd;
      border-left: 4px solid #2196F3;
    }

    .notification-icon {
      margin-right: 16px;
      margin-top: 4px;
    }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .notification-message {
      color: #666;
      font-size: 14px;
      line-height: 1.4;
      margin-bottom: 8px;
    }

    .notification-time {
      font-size: 12px;
      color: #999;
    }

    .notification-actions {
      margin-left: 16px;
    }

    @media (max-width: 768px) {
      .overview-section {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .header-actions {
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .table-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }
    }
  `]
})
export class OverviewSectionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Filtres
  selectedPeriod: string = 'month';
  selectedNotificationType: string = 'all';

  // Données réelles depuis l'API
  userStats: UserStats = {
    total: 0,
    newThisMonth: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    byRole: []
  };

  conventionStats: ConventionStats = {
    total: 0,
    active: 0,
    expired: 0,
    renewal: 0,
    byGovernorate: []
  };

  invoiceStats: InvoiceStats = {
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0
  };

  // Données des tableaux
  recentUsers: User[] = [];
  recentConventions: Convention[] = [];
  recentInvoices: Invoice[] = [];

  notifications: Notification[] = [
    { id: '1', type: 'user', severity: 'info', title: 'Nouvel utilisateur ajouté', message: 'Ahmed Ben Ali a été ajouté au système', timestamp: new Date(), read: false },
    { id: '2', type: 'convention', severity: 'warning', title: 'Convention arrivée à échéance', message: 'La convention CONV-2023-015 arrive à échéance dans 5 jours', timestamp: new Date(Date.now() - 3600000), read: false },
    { id: '3', type: 'invoice', severity: 'critical', title: 'Facture en retard', message: 'La facture FACT-2024-003 est en retard de 15 jours', timestamp: new Date(Date.now() - 7200000), read: true },
    { id: '4', type: 'system', severity: 'warning', title: 'Alerte système critique', message: 'L\'utilisation de la base de données a atteint 95%', timestamp: new Date(Date.now() - 10800000), read: false }
  ];

  // Colonnes des tableaux
  userColumns: string[] = ['name', 'email', 'role', 'status'];
  conventionColumns: string[] = ['reference', 'label', 'structure', 'governorate', 'dates', 'status'];
  invoiceColumns: string[] = ['reference', 'amount', 'dueDate', 'status'];

  // Notifications filtrées
  get filteredNotifications(): Notification[] {
    if (this.selectedNotificationType === 'all') {
      return this.notifications;
    }
    return this.notifications.filter(n => n.type === this.selectedNotificationType);
  }

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private userService: UserService
  ) {}

  ngOnInit() {
    console.log('🚀 OverviewSectionComponent initialized');
    this.loadRealData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRealData() {
    // Charger les vraies données depuis l'API
    this.loadUserStats();
  }

  loadUserStats() {
    this.userService.getUsers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const users = response.data.users;
          this.userStats = {
            total: response.data.total,
            newThisMonth: users.filter(u => {
              const createdAt = new Date(u.createdAt);
              const now = new Date();
              return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
            }).length,
            active: users.filter(u => u.enabled).length,
            pending: users.filter(u => !u.enabled).length,
            inactive: 0,
            byRole: []
          };

          this.recentUsers = users.slice(0, 3).map(u => ({
            id: u.id,
            name: `${u.firstName} ${u.lastName}`,
            email: u.email,
            role: u.roles[0] || 'Utilisateur',
            status: u.enabled ? 'active' : 'inactive',
            createdAt: new Date(u.createdAt)
          }));

          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading user stats:', error);
      }
    });
  }

  // Actions
  onActionClick(action: string) {
    console.log('⚡ Action clicked:', action);
    
    switch (action) {
      case 'add-user':
        this.openAddUserDialog();
        break;
      case 'add-nomenclature':
        this.openAddNomenclatureDialog();
        break;
      case 'generate-report':
        this.generateReport();
        break;
      case 'view-all-users':
        this.viewAllUsers();
        break;
      case 'view-all-conventions':
        this.viewAllConventions();
        break;
      case 'view-all-invoices':
        this.viewAllInvoices();
        break;
      case 'view-all-alerts':
        this.viewAllAlerts();
        break;
      default:
        this.snackBar.open('Action non implémentée', 'Fermer', { duration: 2000 });
        break;
    }
  }

  openAddUserDialog() {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      disableClose: true,
      panelClass: 'modern-dialog',
      position: { top: '5vh' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.snackBar.open('✅ Utilisateur créé avec succès !', 'Fermer', { duration: 3000 });
        this.loadUserStats(); // Recharger les données
      }
    });
  }

  openAddNomenclatureDialog() {
    const dialogRef = this.dialog.open(AddNomenclatureDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      disableClose: true,
      panelClass: 'modern-dialog',
      position: { top: '5vh' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.snackBar.open('✅ Nomenclature créée avec succès !', 'Fermer', { duration: 3000 });
      }
    });
  }

  generateReport() {
    this.snackBar.open('📊 Génération du rapport en cours...', 'Fermer', { duration: 2000 });
  }

  viewAllUsers() {
    this.snackBar.open('👥 Ouverture de la gestion des utilisateurs...', 'Fermer', { duration: 2000 });
  }

  viewAllConventions() {
    this.snackBar.open('📄 Ouverture de la gestion des conventions...', 'Fermer', { duration: 2000 });
  }

  viewAllInvoices() {
    this.snackBar.open('💰 Ouverture de la gestion des factures...', 'Fermer', { duration: 2000 });
  }

  viewAllAlerts() {
    this.snackBar.open('🔔 Ouverture de toutes les alertes...', 'Fermer', { duration: 2000 });
  }

  // Filtres
  filterNotifications(type: string) {
    this.selectedNotificationType = type;
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.cdr.detectChanges();
    }
  }

  // Utilitaires
  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
      case 'paid':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'inactive':
      case 'expired':
      case 'overdue':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'inactive': return 'Inactif';
      case 'paid': return 'Payée';
      case 'overdue': return 'En retard';
      case 'expired': return 'Expirée';
      case 'renewal': return 'À renouveler';
      default: return status;
    }
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'warn';
      case 'warning': return 'accent';
      case 'info': return 'primary';
      default: return 'primary';
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'user': return 'person';
      case 'convention': return 'description';
      case 'invoice': return 'receipt';
      case 'system': return 'warning';
      default: return 'notifications';
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  }
}
