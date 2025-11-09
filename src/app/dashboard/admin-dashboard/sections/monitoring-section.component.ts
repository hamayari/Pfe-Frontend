import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

interface SystemLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  user: string;
  message: string;
  module: string;
  ipAddress?: string;
}

interface SystemAlert {
  id: string;
  timestamp: Date;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  priority: 'high' | 'medium' | 'low';
}

interface ServerMetric {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  history: { timestamp: Date; value: number }[];
}

@Component({
  selector: 'app-monitoring-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  template: `
    <div class="monitoring-section">
      <mat-card class="main-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>monitor</mat-icon>
            Monitoring Système
          </mat-card-title>
          <mat-card-subtitle>Surveillance en temps réel du système</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <mat-tab-group (selectedTabChange)="onTabChange($event)">
            
            <!-- Onglet Logs système -->
            <mat-tab label="Logs système">
              <div class="tab-content">
                <!-- Filtres -->
                <div class="filters-section">
                  <div class="filter-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Niveau de log</mat-label>
                      <mat-select [(ngModel)]="selectedLogLevel">
                        <mat-option value="all">Tous les niveaux</mat-option>
                        <mat-option value="error">Erreur</mat-option>
                        <mat-option value="warning">Avertissement</mat-option>
                        <mat-option value="info">Information</mat-option>
                        <mat-option value="debug">Debug</mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Module</mat-label>
                      <mat-select [(ngModel)]="selectedModule">
                        <mat-option value="all">Tous les modules</mat-option>
                        <mat-option *ngFor="let module of modules" [value]="module">
                          {{ module }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Utilisateur</mat-label>
                      <mat-select [(ngModel)]="selectedUser">
                        <mat-option value="all">Tous les utilisateurs</mat-option>
                        <mat-option *ngFor="let user of users" [value]="user">
                          {{ user }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Recherche</mat-label>
                      <input matInput [(ngModel)]="logSearchTerm" placeholder="Message...">
                      <mat-icon matSuffix>search</mat-icon>
                    </mat-form-field>
                  </div>
                </div>

                <!-- Actions -->
                <div class="actions-section">
                  <button mat-raised-button (click)="exportLogs()">
                    <mat-icon>download</mat-icon>
                    Exporter Logs
                  </button>
                  <button mat-raised-button (click)="clearLogs()">
                    <mat-icon>clear_all</mat-icon>
                    Nettoyer Logs
                  </button>
                  <button mat-raised-button (click)="refreshLogs()">
                    <mat-icon>refresh</mat-icon>
                    Actualiser
                  </button>
                </div>

                <!-- Tableau logs -->
                <table mat-table [dataSource]="logsDataSource" matSort class="logs-table">
                  <!-- Date/Heure -->
                  <ng-container matColumnDef="timestamp">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Date/Heure</th>
                    <td mat-cell *matCellDef="let log">{{ log.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                  </ng-container>
                  
                  <!-- Niveau -->
                  <ng-container matColumnDef="level">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Niveau</th>
                    <td mat-cell *matCellDef="let log">
                      <mat-chip [ngClass]="getLogLevelColor(log.level)">
                        {{ getLogLevelLabel(log.level) }}
                      </mat-chip>
                    </td>
                  </ng-container>
                  
                  <!-- Module -->
                  <ng-container matColumnDef="module">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Module</th>
                    <td mat-cell *matCellDef="let log">{{ log.module }}</td>
                  </ng-container>
                  
                  <!-- Utilisateur -->
                  <ng-container matColumnDef="user">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Utilisateur</th>
                    <td mat-cell *matCellDef="let log">{{ log.user }}</td>
                  </ng-container>
                  
                  <!-- Message -->
                  <ng-container matColumnDef="message">
                    <th mat-header-cell *matHeaderCellDef>Message</th>
                    <td mat-cell *matCellDef="let log">{{ log.message }}</td>
                  </ng-container>
                  
                  <!-- IP -->
                  <ng-container matColumnDef="ipAddress">
                    <th mat-header-cell *matHeaderCellDef>Adresse IP</th>
                    <td mat-cell *matCellDef="let log">{{ log.ipAddress || '-' }}</td>
                  </ng-container>
                  
                  <tr mat-header-row *matHeaderRowDef="logsDisplayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: logsDisplayedColumns;"></tr>
                </table>
                
                <mat-paginator [pageSizeOptions]="[25, 50, 100, 200]" showFirstLastButtons></mat-paginator>
              </div>
            </mat-tab>
            
            <!-- Onglet Alertes -->
            <mat-tab label="Alertes">
              <div class="tab-content">
                <!-- Filtres -->
                <div class="filters-section">
                  <div class="filter-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Type d'alerte</mat-label>
                      <mat-select [(ngModel)]="selectedAlertType">
                        <mat-option value="all">Tous les types</mat-option>
                        <mat-option value="critical">Critique</mat-option>
                        <mat-option value="warning">Avertissement</mat-option>
                        <mat-option value="info">Information</mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Statut</mat-label>
                      <mat-select [(ngModel)]="selectedAlertStatus">
                        <mat-option value="all">Tous les statuts</mat-option>
                        <mat-option value="active">Active</mat-option>
                        <mat-option value="resolved">Résolue</mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Priorité</mat-label>
                      <mat-select [(ngModel)]="selectedPriority">
                        <mat-option value="all">Toutes les priorités</mat-option>
                        <mat-option value="high">Haute</mat-option>
                        <mat-option value="medium">Moyenne</mat-option>
                        <mat-option value="low">Basse</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>

                <!-- Actions -->
                <div class="actions-section">
                  <button mat-raised-button color="primary" (click)="createAlert()">
                    <mat-icon>add_alert</mat-icon>
                    Créer Alerte
                  </button>
                  <button mat-raised-button (click)="exportAlerts()">
                    <mat-icon>download</mat-icon>
                    Exporter Alertes
                  </button>
                </div>

                <!-- Tableau alertes -->
                <table mat-table [dataSource]="alertsDataSource" matSort class="alerts-table">
                  <!-- Date -->
                  <ng-container matColumnDef="timestamp">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
                    <td mat-cell *matCellDef="let alert">{{ alert.timestamp | date:'dd/MM/yyyy HH:mm' }}</td>
                  </ng-container>
                  
                  <!-- Type -->
                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                    <td mat-cell *matCellDef="let alert">
                      <mat-chip [ngClass]="getAlertTypeColor(alert.type)">
                        {{ getAlertTypeLabel(alert.type) }}
                      </mat-chip>
                    </td>
                  </ng-container>
                  
                  <!-- Titre -->
                  <ng-container matColumnDef="title">
                    <th mat-header-cell *matHeaderCellDef>Titre</th>
                    <td mat-cell *matCellDef="let alert">{{ alert.title }}</td>
                  </ng-container>
                  
                  <!-- Description -->
                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef>Description</th>
                    <td mat-cell *matCellDef="let alert">{{ alert.description }}</td>
                  </ng-container>
                  
                  <!-- Priorité -->
                  <ng-container matColumnDef="priority">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Priorité</th>
                    <td mat-cell *matCellDef="let alert">
                      <mat-chip [ngClass]="getPriorityColor(alert.priority)">
                        {{ getPriorityLabel(alert.priority) }}
                      </mat-chip>
                    </td>
                  </ng-container>
                  
                  <!-- Statut -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
                    <td mat-cell *matCellDef="let alert">
                      <mat-chip [ngClass]="alert.resolved ? 'status-resolved' : 'status-active'">
                        {{ alert.resolved ? 'Résolue' : 'Active' }}
                      </mat-chip>
                    </td>
                  </ng-container>
                  
                  <!-- Actions -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let alert">
                      <button mat-icon-button [matMenuTriggerFor]="alertMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #alertMenu="matMenu">
                        <button mat-menu-item (click)="viewAlert(alert)">
                          <mat-icon>visibility</mat-icon>
                          <span>Voir détails</span>
                        </button>
                        <button mat-menu-item (click)="editAlert(alert)">
                          <mat-icon>edit</mat-icon>
                          <span>Modifier</span>
                        </button>
                        <button mat-menu-item 
                                *ngIf="!alert.resolved"
                                (click)="resolveAlert(alert.id)">
                          <mat-icon>check</mat-icon>
                          <span>Marquer résolue</span>
                        </button>
                        <button mat-menu-item (click)="deleteAlert(alert)" class="delete-action">
                          <mat-icon>delete</mat-icon>
                          <span>Supprimer</span>
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>
                  
                  <tr mat-header-row *matHeaderRowDef="alertsDisplayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: alertsDisplayedColumns;"></tr>
                </table>
                
                <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
              </div>
            </mat-tab>
            
            <!-- Onglet Statistiques serveur -->
            <mat-tab label="Statistiques serveur">
              <div class="tab-content">
                <!-- Actions -->
                <div class="actions-section">
                  <button mat-raised-button (click)="refreshStats()">
                    <mat-icon>refresh</mat-icon>
                    Actualiser
                  </button>
                  <button mat-raised-button (click)="exportStats()">
                    <mat-icon>download</mat-icon>
                    Exporter Stats
                  </button>
                </div>

                <!-- Métriques en temps réel -->
                <div class="metrics-grid">
                  <mat-card class="metric-card" *ngFor="let metric of serverMetrics">
                    <mat-card-header>
                      <mat-card-title>
                        <mat-icon>{{ getMetricIcon(metric.name) }}</mat-icon>
                        {{ metric.name }}
                      </mat-card-title>
                      <mat-card-subtitle>
                        <span [ngClass]="getMetricStatusColor(metric.status)">
                          {{ getMetricStatusLabel(metric.status) }}
                        </span>
                      </mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="metric-value">
                        <span class="value">{{ metric.value.toFixed(1) }}</span>
                        <span class="unit">{{ metric.unit }}</span>
                      </div>
                      <mat-progress-bar 
                        [value]="getMetricPercentage(metric)" 
                        [color]="getMetricProgressColor(metric)">
                      </mat-progress-bar>
                      <div class="metric-trend">
                        <mat-icon [ngClass]="getTrendColor(metric.trend)">
                          {{ getTrendIcon(metric.trend) }}
                        </mat-icon>
                        <span>Tendance {{ metric.trend }}</span>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>

                <!-- Graphiques historiques -->
                <div class="charts-section">
                  <mat-card class="chart-card">
                    <mat-card-header>
                      <mat-card-title>
                        <mat-icon>timeline</mat-icon>
                        Historique des performances
                      </mat-card-title>
                      <mat-card-subtitle>Évolution sur les dernières 24h</mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="chart-placeholder">
                        <mat-icon>show_chart</mat-icon>
                        <h3>Graphique de performance</h3>
                        <p>Évolution des métriques serveur dans le temps</p>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .monitoring-section {
      padding: 24px;
    }

    .main-card {
      margin-bottom: 24px;
    }

    .tab-content {
      padding: 16px 0;
    }

    .filters-section {
      margin-bottom: 24px;
      padding: 16px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .filter-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      align-items: end;
    }

    .actions-section {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .logs-table,
    .alerts-table {
      width: 100%;
      margin-bottom: 16px;
    }

    .logs-table th,
    .alerts-table th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: #333;
    }

    .logs-table td,
    .alerts-table td {
      padding: 12px 8px;
    }

    mat-chip {
      font-size: 12px;
      font-weight: 500;
    }

    .level-error {
      background-color: #ffebee;
      color: #c62828;
    }

    .level-warning {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .level-info {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .level-debug {
      background-color: #f5f5f5;
      color: #666;
    }

    .type-critical {
      background-color: #ffebee;
      color: #c62828;
    }

    .type-warning {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .type-info {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .priority-high {
      background-color: #ffebee;
      color: #c62828;
    }

    .priority-medium {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .priority-low {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-active {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-resolved {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .metric-card {
      height: 200px;
    }

    .metric-value {
      text-align: center;
      margin: 16px 0;

      .value {
        font-size: 32px;
        font-weight: 700;
        color: #333;
      }

      .unit {
        font-size: 16px;
        color: #666;
        margin-left: 8px;
      }
    }

    .metric-trend {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 12px;
      font-size: 12px;
      color: #666;
    }

    .trend-up {
      color: #4caf50;
    }

    .trend-down {
      color: #f44336;
    }

    .trend-stable {
      color: #ff9800;
    }

    .charts-section {
      margin-top: 24px;
    }

    .chart-placeholder {
      text-align: center;
      padding: 40px 20px;
      border: 2px dashed #e0e0e0;
      border-radius: 8px;
      background-color: #fafafa;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #ccc;
        margin-bottom: 16px;
      }

      h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      p {
        margin: 0;
        font-size: 12px;
        color: #666;
      }
    }

    .delete-action {
      color: #f44336;
    }

    @media (max-width: 768px) {
      .filter-row {
        grid-template-columns: 1fr;
      }

      .actions-section {
        flex-direction: column;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MonitoringSectionComponent implements OnInit {
  // Filtres logs
  selectedLogLevel = 'all';
  selectedModule = 'all';
  selectedUser = 'all';
  logSearchTerm = '';

  // Filtres alertes
  selectedAlertType = 'all';
  selectedAlertStatus = 'all';
  selectedPriority = 'all';

  modules = ['Système', 'Base de données', 'Authentification', 'API', 'Interface utilisateur'];
  users = ['admin', 'system', 'user1', 'user2', 'user3'];

  // Données de démonstration
  systemLogs: SystemLog[] = [
    {
      id: '1',
      timestamp: new Date(),
      level: 'info',
      user: 'admin',
      message: 'Connexion utilisateur réussie',
      module: 'Authentification',
      ipAddress: '192.168.1.100'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000),
      level: 'warning',
      user: 'system',
      message: 'Espace disque faible (85% utilisé)',
      module: 'Système'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000),
      level: 'error',
      user: 'system',
      message: 'Erreur de connexion base de données',
      module: 'Base de données'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 900000),
      level: 'debug',
      user: 'user1',
      message: 'Requête API exécutée',
      module: 'API',
      ipAddress: '192.168.1.101'
    }
  ];

  systemAlerts: SystemAlert[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 1800000),
      type: 'critical',
      title: 'Base de données saturée',
      description: 'La base de données atteint 95% de sa capacité',
      resolved: false,
      priority: 'high'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 3600000),
      type: 'warning',
      title: 'Espace disque faible',
      description: 'L\'espace disque du serveur principal est à 85%',
      resolved: false,
      priority: 'medium'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 7200000),
      type: 'info',
      title: 'Maintenance planifiée',
      description: 'Maintenance système prévue pour demain à 2h00',
      resolved: true,
      resolvedBy: 'admin',
      resolvedAt: new Date(Date.now() - 3600000),
      priority: 'low'
    }
  ];

  serverMetrics: ServerMetric[] = [
    {
      name: 'CPU',
      value: 65.2,
      unit: '%',
      status: 'normal',
      trend: 'up',
      history: []
    },
    {
      name: 'Mémoire',
      value: 78.5,
      unit: '%',
      status: 'warning',
      trend: 'stable',
      history: []
    },
    {
      name: 'Disque',
      value: 85.1,
      unit: '%',
      status: 'critical',
      trend: 'up',
      history: []
    },
    {
      name: 'Réseau',
      value: 45.3,
      unit: 'Mbps',
      status: 'normal',
      trend: 'down',
      history: []
    }
  ];

  logsDataSource = this.systemLogs;
  alertsDataSource = this.systemAlerts;

  logsDisplayedColumns = ['timestamp', 'level', 'module', 'user', 'message', 'ipAddress'];
  alertsDisplayedColumns = ['timestamp', 'type', 'title', 'description', 'priority', 'status', 'actions'];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    console.log('Chargement des données de monitoring');
  }

  onTabChange(event: any) {
    console.log('Onglet sélectionné:', event.index);
  }

  // Méthodes logs
  exportLogs() {
    console.log('Exporter les logs');
    this.snackBar.open('Export des logs en cours...', 'Fermer', { duration: 2000 });
  }

  clearLogs() {
    console.log('Nettoyer les logs');
    this.snackBar.open('Nettoyage des logs en cours...', 'Fermer', { duration: 2000 });
  }

  refreshLogs() {
    console.log('Actualiser les logs');
    this.loadData();
  }

  // Méthodes alertes
  createAlert() {
    console.log('Créer une nouvelle alerte');
    this.snackBar.open('Fonctionnalité de création d\'alerte', 'Fermer', { duration: 2000 });
  }

  viewAlert(alert: SystemAlert) {
    console.log('Voir alerte:', alert);
  }

  editAlert(alert: SystemAlert) {
    console.log('Modifier alerte:', alert);
  }

  resolveAlert(alertId: string) {
    console.log('Résoudre alerte:', alertId);
    this.snackBar.open('Alerte marquée comme résolue', 'Fermer', { duration: 2000 });
  }

  deleteAlert(alert: SystemAlert) {
    console.log('Supprimer alerte:', alert);
    this.snackBar.open(`Alerte ${alert.title} supprimée`, 'Fermer', { duration: 2000 });
  }

  exportAlerts() {
    console.log('Exporter les alertes');
    this.snackBar.open('Export des alertes en cours...', 'Fermer', { duration: 2000 });
  }

  // Méthodes statistiques
  refreshStats() {
    console.log('Actualiser les statistiques');
    this.loadData();
  }

  exportStats() {
    console.log('Exporter les statistiques');
    this.snackBar.open('Export des statistiques en cours...', 'Fermer', { duration: 2000 });
  }

  // Méthodes utilitaires
  getLogLevelColor(level: string): string {
    switch (level) {
      case 'error': return 'level-error';
      case 'warning': return 'level-warning';
      case 'info': return 'level-info';
      case 'debug': return 'level-debug';
      default: return 'level-info';
    }
  }

  getLogLevelLabel(level: string): string {
    switch (level) {
      case 'error': return 'Erreur';
      case 'warning': return 'Avertissement';
      case 'info': return 'Information';
      case 'debug': return 'Debug';
      default: return level;
    }
  }

  getAlertTypeColor(type: string): string {
    switch (type) {
      case 'critical': return 'type-critical';
      case 'warning': return 'type-warning';
      case 'info': return 'type-info';
      default: return 'type-info';
    }
  }

  getAlertTypeLabel(type: string): string {
    switch (type) {
      case 'critical': return 'Critique';
      case 'warning': return 'Avertissement';
      case 'info': return 'Information';
      default: return type;
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  }

  getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return priority;
    }
  }

  getMetricIcon(name: string): string {
    switch (name) {
      case 'CPU': return 'memory';
      case 'Mémoire': return 'storage';
      case 'Disque': return 'hard_drive';
      case 'Réseau': return 'wifi';
      default: return 'speed';
    }
  }

  getMetricStatusColor(status: string): string {
    switch (status) {
      case 'normal': return 'status-normal';
      case 'warning': return 'status-warning';
      case 'critical': return 'status-critical';
      default: return 'status-normal';
    }
  }

  getMetricStatusLabel(status: string): string {
    switch (status) {
      case 'normal': return 'Normal';
      case 'warning': return 'Attention';
      case 'critical': return 'Critique';
      default: return status;
    }
  }

  getMetricPercentage(metric: ServerMetric): number {
    if (metric.unit === '%') {
      return metric.value;
    }
    // Pour les autres unités, calculer un pourcentage basé sur une valeur maximale
    const maxValues: { [key: string]: number } = {
      'Mbps': 100,
      'GB': 1000,
      'MB': 1000
    };
    return Math.min((metric.value / (maxValues[metric.unit] || 100)) * 100, 100);
  }

  getMetricProgressColor(metric: ServerMetric): string {
    const percentage = this.getMetricPercentage(metric);
    if (percentage > 80) return 'warn';
    if (percentage > 60) return 'accent';
    return 'primary';
  }

  getTrendColor(trend: string): string {
    switch (trend) {
      case 'up': return 'trend-up';
      case 'down': return 'trend-down';
      case 'stable': return 'trend-stable';
      default: return 'trend-stable';
    }
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      case 'stable': return 'trending_flat';
      default: return 'trending_flat';
    }
  }
}






































