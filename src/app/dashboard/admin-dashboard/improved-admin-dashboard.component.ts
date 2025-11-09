import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ChangePasswordModalComponent } from '../../shared/components/change-password-modal/change-password-modal.component';

interface KPICard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  created: string;
}

interface Nomenclature {
  id: string;
  label: string;
  type: string;
  created: string;
}

interface SystemMetric {
  name: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}

@Component({
  selector: 'app-improved-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  template: `
    <div class="improved-dashboard">
      <!-- Header avec titre et boutons principaux -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="header-left">
            <h1 class="dashboard-title">
              <mat-icon class="title-icon">admin_panel_settings</mat-icon>
              Tableau de Bord Administrateur
            </h1>
            <p class="dashboard-subtitle">Gestion des utilisateurs, nomenclatures et monitoring système</p>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="primary" class="action-btn" (click)="addUser()">
              <mat-icon>person_add</mat-icon>
              ➕ AJOUTER UTILISATEUR
            </button>
            <button mat-raised-button color="accent" class="action-btn" (click)="addNomenclature()">
              <mat-icon>category</mat-icon>
              ▲ AJOUTER NOMENCLATURE
            </button>
            <button mat-raised-button color="warn" class="action-btn" (click)="viewSystemLogs()">
              <mat-icon>monitor</mat-icon>
              LOGS SYSTÈME
            </button>
          </div>
        </div>
      </div>

      <!-- KPI Cards en grille 2x2 -->
      <div class="kpi-grid">
        <mat-card class="kpi-card" *ngFor="let kpi of kpiCards" [style.border-left-color]="kpi.color">
          <mat-card-content class="kpi-content">
            <div class="kpi-icon" [style.background-color]="kpi.color">
              <mat-icon>{{ kpi.icon }}</mat-icon>
            </div>
            <div class="kpi-details">
              <div class="kpi-value">{{ kpi.value }}</div>
              <div class="kpi-title">{{ kpi.title }}</div>
              <div class="kpi-subtitle">{{ kpi.subtitle }}</div>
              <div class="kpi-trend" *ngIf="kpi.trend">
                <mat-icon [class.positive]="kpi.trend.isPositive" [class.negative]="!kpi.trend.isPositive">
                  {{ kpi.trend.isPositive ? 'trending_up' : 'trending_down' }}
                </mat-icon>
                <span [class.positive]="kpi.trend.isPositive" [class.negative]="!kpi.trend.isPositive">
                  {{ kpi.trend.value }}%
                </span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Sections organisées par onglets -->
      <mat-card class="sections-card">
        <mat-tab-group class="dashboard-tabs">
          
          <!-- Users Management Tab -->
          <mat-tab label="Gestion des Utilisateurs">
            <div class="tab-content">
              <div class="tab-header">
                <div class="search-section">
                  <mat-form-field class="search-field">
                    <mat-label>Rechercher un utilisateur</mat-label>
                    <input matInput [(ngModel)]="userSearchTerm" placeholder="Nom d'utilisateur, email...">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>
                  
                  <mat-form-field class="role-filter">
                    <mat-label>Tous les rôles</mat-label>
                    <mat-select [(ngModel)]="selectedRole">
                      <mat-option value="">Tous les rôles</mat-option>
                      <mat-option value="ADMIN">ADMIN</mat-option>
                      <mat-option value="COMMERCIAL">COMMERCIAL</mat-option>
                      <mat-option value="PROJECT_MANAGER">PROJECT_MANAGER</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
                
                <button mat-raised-button color="primary" (click)="addUser()">
                  <mat-icon>person_add</mat-icon>
                  ➕ NOUVEL UTILISATEUR
                </button>
              </div>
              
              <table mat-table [dataSource]="filteredUsers" matSort class="data-table">
                <ng-container matColumnDef="username">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Nom d'utilisateur</th>
                  <td mat-cell *matCellDef="let user">{{ user.username }}</td>
                </ng-container>

                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
                  <td mat-cell *matCellDef="let user">{{ user.email }}</td>
                </ng-container>

                <ng-container matColumnDef="role">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Rôles</th>
                  <td mat-cell *matCellDef="let user">
                    <mat-chip [color]="getRoleColor(user.role)" selected>
                      {{ user.role }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
                  <td mat-cell *matCellDef="let user">
                    <mat-chip [color]="getStatusColor(user.status)" selected>
                      {{ user.status }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="created">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Créé le</th>
                  <td mat-cell *matCellDef="let user">{{ user.created }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let user">
                    <button mat-icon-button [matMenuTriggerFor]="userMenu" [matTooltip]="'Actions'">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #userMenu="matMenu">
                      <button mat-menu-item (click)="editUser(user)">
                        <mat-icon>edit</mat-icon>
                        Modifier
                      </button>
                      <button mat-menu-item (click)="resetUser(user)">
                        <mat-icon>refresh</mat-icon>
                        Réinitialiser
                      </button>
                      <button mat-menu-item (click)="deleteUser(user)">
                        <mat-icon>delete</mat-icon>
                        Supprimer
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="userColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: userColumns;"></tr>
              </table>
              
              <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" showFirstLastButtons></mat-paginator>
            </div>
          </mat-tab>

          <!-- Nomenclatures Tab -->
          <mat-tab label="Gestion des Nomenclatures">
            <div class="tab-content">
              <div class="tab-header">
                <h3>Gestion des Nomenclatures</h3>
                <button mat-raised-button color="primary" (click)="addNomenclature()">
                  <mat-icon>add</mat-icon>
                  Nouvelle Nomenclature
                </button>
              </div>
              
              <table mat-table [dataSource]="nomenclatures" class="data-table">
                <ng-container matColumnDef="label">
                  <th mat-header-cell *matHeaderCellDef>Label</th>
                  <td mat-cell *matCellDef="let item">{{ item.label }}</td>
                </ng-container>

                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let item">
                    <mat-chip color="primary" selected>{{ item.type }}</mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="created">
                  <th mat-header-cell *matHeaderCellDef>Créé le</th>
                  <td mat-cell *matCellDef="let item">{{ item.created }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let item">
                    <button mat-icon-button [matMenuTriggerFor]="nomenclatureMenu" [matTooltip]="'Actions'">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #nomenclatureMenu="matMenu">
                      <button mat-menu-item (click)="editNomenclature(item)">
                        <mat-icon>edit</mat-icon>
                        Modifier
                      </button>
                      <button mat-menu-item (click)="deleteNomenclature(item)">
                        <mat-icon>delete</mat-icon>
                        Supprimer
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="nomenclatureColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: nomenclatureColumns;"></tr>
              </table>
            </div>
          </mat-tab>

          <!-- System Monitoring Tab -->
          <mat-tab label="Monitoring Système">
            <div class="tab-content">
              <div class="tab-header">
                <h3>Monitoring Système</h3>
                <button mat-raised-button color="warn" (click)="viewSystemLogs()">
                  <mat-icon>monitor</mat-icon>
                  Voir les Logs
                </button>
              </div>
              
              <div class="metrics-grid">
                <mat-card class="metric-card" *ngFor="let metric of systemMetrics">
                  <mat-card-content>
                    <div class="metric-header">
                      <h4>{{ metric.name }}</h4>
                      <span class="metric-value">{{ metric.value }}{{ metric.unit }}</span>
                    </div>
                    <mat-progress-bar 
                      [value]="(metric.value / metric.max) * 100"
                      [color]="metric.color">
                    </mat-progress-bar>
                    <div class="metric-max">Max: {{ metric.max }}{{ metric.unit }}</div>
                  </mat-card-content>
                </mat-card>
              </div>

              <div class="alerts-section">
                <h4>Alertes Critiques</h4>
                <div class="alert-list">
                  <div class="alert-item" *ngFor="let alert of criticalAlerts">
                    <mat-icon class="alert-icon" [class]="alert.type">{{ alert.icon }}</mat-icon>
                    <div class="alert-content">
                      <div class="alert-title">{{ alert.title }}</div>
                      <div class="alert-message">{{ alert.message }}</div>
                    </div>
                    <div class="alert-time">{{ alert.time }}</div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Process Timeline Tab -->
          <mat-tab label="Timeline des Processus">
            <div class="tab-content">
              <div class="tab-header">
                <h3>Chronologie des Processus</h3>
                <button mat-raised-button color="primary" (click)="refreshTimeline()">
                  <mat-icon>refresh</mat-icon>
                  Actualiser
                </button>
              </div>
              
              <div class="timeline">
                <div class="timeline-item" *ngFor="let event of timelineEvents">
                  <div class="timeline-icon" [style.background-color]="event.color">
                    <mat-icon>{{ event.icon }}</mat-icon>
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-title">{{ event.title }}</div>
                    <div class="timeline-message">{{ event.message }}</div>
                    <div class="timeline-time">{{ event.time }}</div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .improved-dashboard {
      padding: 24px;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .dashboard-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 32px;
      margin-bottom: 24px;
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
    }

    .header-left {
      flex: 1;
    }

    .dashboard-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 700;
      color: white;
    }

    .title-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .dashboard-subtitle {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
      color: white;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      padding: 12px 20px;
      border-radius: 8px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .kpi-card {
      border-left: 4px solid;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border-radius: 12px;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .kpi-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
    }

    .kpi-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .kpi-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .kpi-details {
      flex: 1;
    }

    .kpi-value {
      font-size: 32px;
      font-weight: 700;
      color: #333;
      margin-bottom: 4px;
    }

    .kpi-title {
      font-size: 18px;
      font-weight: 600;
      color: #666;
      margin-bottom: 4px;
    }

    .kpi-subtitle {
      font-size: 14px;
      color: #999;
      margin-bottom: 8px;
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
    }

    .kpi-trend.positive {
      color: #4caf50;
    }

    .kpi-trend.negative {
      color: #f44336;
    }

    .sections-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .dashboard-tabs {
      height: 100%;
    }

    .tab-content {
      padding: 24px;
    }

    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      gap: 16px;
    }

    .search-section {
      display: flex;
      gap: 16px;
      flex: 1;
    }

    .search-field {
      flex: 1;
      max-width: 300px;
    }

    .role-filter {
      min-width: 200px;
    }

    .tab-header h3 {
      margin: 0;
      color: #333;
      font-size: 20px;
      font-weight: 600;
    }

    .data-table {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .metric-card {
      padding: 20px;
      border-radius: 12px;
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .metric-header h4 {
      margin: 0;
      color: #333;
      font-size: 16px;
    }

    .metric-value {
      font-size: 18px;
      font-weight: 600;
      color: #1976d2;
    }

    .metric-max {
      font-size: 12px;
      color: #999;
      margin-top: 8px;
    }

    .alerts-section {
      margin-top: 24px;
    }

    .alerts-section h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 18px;
    }

    .alert-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .alert-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #fff3e0;
      border-radius: 8px;
      border-left: 4px solid #ff9800;
    }

    .alert-icon {
      color: #ff9800;
    }

    .alert-content {
      flex: 1;
    }

    .alert-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .alert-message {
      font-size: 14px;
      color: #666;
    }

    .alert-time {
      font-size: 12px;
      color: #999;
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .timeline-item {
      display: flex;
      gap: 16px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 12px;
    }

    .timeline-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .timeline-content {
      flex: 1;
    }

    .timeline-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .timeline-message {
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }

    .timeline-time {
      font-size: 12px;
      color: #999;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .improved-dashboard {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .header-actions {
        flex-wrap: wrap;
      }

      .search-section {
        flex-direction: column;
      }

      .search-field {
        max-width: none;
      }

      .kpi-grid {
        grid-template-columns: 1fr;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ImprovedAdminDashboardComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  kpiCards: KPICard[] = [];
  users: User[] = [];
  nomenclatures: Nomenclature[] = [];
  systemMetrics: SystemMetric[] = [];
  criticalAlerts: any[] = [];
  timelineEvents: any[] = [];

  userColumns = ['username', 'email', 'role', 'status', 'created', 'actions'];
  nomenclatureColumns = ['label', 'type', 'created', 'actions'];

  userSearchTerm = '';
  selectedRole = '';

  get filteredUsers(): User[] {
    let filtered = this.users;
    
    if (this.userSearchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.userSearchTerm.toLowerCase())
      );
    }
    
    if (this.selectedRole) {
      filtered = filtered.filter(user => user.role === this.selectedRole);
    }
    
    return filtered;
  }

  ngOnInit() {
    this.loadKPICards();
    this.loadUsers();
    this.loadNomenclatures();
    this.loadSystemMetrics();
    this.loadCriticalAlerts();
    this.loadTimelineEvents();
  }

  loadKPICards() {
    this.kpiCards = [
      {
        title: 'Utilisateurs Inscrits',
        value: '0',
        subtitle: 'Actifs: 0 | En attente: 0',
        icon: 'people',
        color: '#1976d2'
      },
      {
        title: 'Conventions Actives',
        value: '0',
        subtitle: 'Expirées: 0 | En cours: 0',
        icon: 'assignment',
        color: '#4caf50'
      },
      {
        title: 'Structures Configurées',
        value: '0',
        subtitle: 'Zones: 0 | Types: 0',
        icon: 'business',
        color: '#ff9800'
      },
      {
        title: 'Alertes Système',
        value: '0',
        subtitle: 'Critiques: 0 | Warnings: 0',
        icon: 'warning',
        color: '#f44336'
      }
    ];
  }

  loadUsers() {
    this.users = [
      { id: '1', username: 'admin', email: 'admin@example.com', role: 'ADMIN', status: 'ACTIVE', created: '2024-01-15' },
      { id: '2', username: 'commercial1', email: 'com1@example.com', role: 'COMMERCIAL', status: 'ACTIVE', created: '2024-02-20' },
      { id: '3', username: 'manager1', email: 'mgr1@example.com', role: 'PROJECT_MANAGER', status: 'PENDING', created: '2024-03-10' }
    ];
  }

  loadNomenclatures() {
    this.nomenclatures = [
      { id: '1', label: 'Type de Convention', type: 'CONVENTION_TYPE', created: '2024-01-10' },
      { id: '2', label: 'Statut Facture', type: 'INVOICE_STATUS', created: '2024-01-12' },
      { id: '3', label: 'Régions', type: 'REGION', created: '2024-01-15' }
    ];
  }

  loadSystemMetrics() {
    this.systemMetrics = [
      { name: 'CPU Usage', value: 65, max: 100, unit: '%', color: 'primary' },
      { name: 'Memory Usage', value: 78, max: 100, unit: '%', color: 'accent' },
      { name: 'Disk Usage', value: 45, max: 100, unit: '%', color: 'warn' },
      { name: 'Network', value: 23, max: 100, unit: '%', color: 'primary' }
    ];
  }

  loadCriticalAlerts() {
    this.criticalAlerts = [
      {
        icon: 'error',
        type: 'critical',
        title: 'High CPU Usage',
        message: 'CPU usage has exceeded 80% for the last 5 minutes',
        time: '2 min ago'
      },
      {
        icon: 'warning',
        type: 'warning',
        title: 'Database Connection',
        message: 'Slow database response detected',
        time: '5 min ago'
      }
    ];
  }

  loadTimelineEvents() {
    this.timelineEvents = [
      {
        icon: 'person_add',
        color: '#4caf50',
        title: 'New User Created',
        message: 'User "commercial2" was created by admin',
        time: '10 min ago'
      },
      {
        icon: 'assignment',
        color: '#1976d2',
        title: 'Convention Updated',
        message: 'Convention "CONV-2024-001" status changed to ACTIVE',
        time: '15 min ago'
      },
      {
        icon: 'receipt',
        color: '#ff9800',
        title: 'Invoice Generated',
        message: 'Invoice "INV-2024-005" was generated',
        time: '25 min ago'
      }
    ];
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'ADMIN': 'warn',
      'COMMERCIAL': 'primary',
      'PROJECT_MANAGER': 'accent'
    };
    return colors[role] || 'primary';
  }

  getStatusColor(status: string): string {
    return status === 'ACTIVE' ? 'primary' : 'warn';
  }

  // Actions
  addUser() {
    console.log('Add user clicked');
  }

  addNomenclature() {
    console.log('Add nomenclature clicked');
  }

  viewSystemLogs() {
    console.log('View system logs clicked');
  }

  editUser(user: User) {
    console.log('Edit user:', user);
  }

  resetUser(user: User) {
    console.log('Reset user:', user);
  }

  deleteUser(user: User) {
    console.log('Delete user:', user);
  }

  editNomenclature(item: Nomenclature) {
    console.log('Edit nomenclature:', item);
  }

  deleteNomenclature(item: Nomenclature) {
    console.log('Delete nomenclature:', item);
  }

  refreshTimeline() {
    console.log('Refresh timeline clicked');
  }
}
