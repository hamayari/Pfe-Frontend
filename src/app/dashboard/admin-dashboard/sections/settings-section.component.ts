import { Component, OnInit } from '@angular/core';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';

interface NotificationSettings {
  id: string;
  type: string;
  daysBeforeDue: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
  description: string;
}

interface SecurityLog {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  ipAddress: string;
  status: 'success' | 'failed' | 'warning';
  details: string;
}

interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description: string;
  category: string;
}

@Component({
  selector: 'app-settings-section',
  standalone: true,
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
    MatSlideToggleModule,
    MatCheckboxModule
  ],
  template: `
    <div class="settings-section">
      <!-- En-tête de la page -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-title">
            <h1>
              <mat-icon>settings</mat-icon>
              Paramètres Système
            </h1>
            <p>Configuration et paramétrage du système</p>
          </div>
        </div>
      </div>

      <!-- Paramétrage des Notifications -->
      <mat-card class="section-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>notifications_active</mat-icon>
            Paramétrage des Notifications
          </mat-card-title>
          <mat-card-subtitle>Configuration des alertes et notifications système</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="settings-grid">
            <div *ngFor="let setting of notificationSettings" class="setting-item">
              <div class="setting-header">
                <h4>{{ setting.type }}</h4>
                <p>{{ setting.description }}</p>
              </div>
              
              <div class="setting-controls">
                                 <div class="control-group">
                   <label>Jours avant échéance :</label>
                   <mat-form-field appearance="outline">
                     <mat-label>Jours</mat-label>
                     <input matInput type="number" 
                            [min]="1" 
                            [max]="30" 
                            [(ngModel)]="setting.daysBeforeDue"
                            (change)="updateNotificationSetting(setting.id, 'daysBeforeDue', setting.daysBeforeDue)">
                   </mat-form-field>
                 </div>
                
                <div class="control-group">
                  <label>Canaux de notification :</label>
                  <div class="channel-toggles">
                    <mat-slide-toggle 
                      [checked]="setting.emailEnabled"
                      (change)="updateNotificationSetting(setting.id, 'emailEnabled', $event.checked)">
                      <mat-icon>email</mat-icon>
                      Email
                    </mat-slide-toggle>
                    
                    <mat-slide-toggle 
                      [checked]="setting.smsEnabled"
                      (change)="updateNotificationSetting(setting.id, 'smsEnabled', $event.checked)">
                      <mat-icon>sms</mat-icon>
                      SMS
                    </mat-slide-toggle>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Sécurité & Audit -->
      <mat-card class="section-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>security</mat-icon>
            Sécurité & Audit
          </mat-card-title>
          <mat-card-subtitle>Journalisation des actions et sécurité des accès</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="security-stats">
            <div class="stat-item">
              <div class="stat-value">{{ securityStats.totalLogs }}</div>
              <div class="stat-label">Total des logs</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ securityStats.failedAttempts }}</div>
              <div class="stat-label">Tentatives échouées</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ securityStats.activeUsers }}</div>
              <div class="stat-label">Utilisateurs actifs</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ securityStats.suspiciousActivities }}</div>
              <div class="stat-label">Activités suspectes</div>
            </div>
          </div>

          <div class="table-section">
            <div class="table-header">
              <h4>Journal de sécurité récent</h4>
              <button mat-stroked-button color="primary">
                <mat-icon>download</mat-icon>
                Exporter les logs
              </button>
            </div>
            
            <table mat-table [dataSource]="securityLogsDataSource" class="data-table">
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>Utilisateur</th>
                <td mat-cell *matCellDef="let log">{{ log.user }}</td>
              </ng-container>
              
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef>Action</th>
                <td mat-cell *matCellDef="let log">{{ log.action }}</td>
              </ng-container>
              
              <ng-container matColumnDef="timestamp">
                <th mat-header-cell *matHeaderCellDef>Date/Heure</th>
                <td mat-cell *matCellDef="let log">{{ log.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</td>
              </ng-container>
              
              <ng-container matColumnDef="ipAddress">
                <th mat-header-cell *matHeaderCellDef>Adresse IP</th>
                <td mat-cell *matCellDef="let log">{{ log.ipAddress }}</td>
              </ng-container>
              
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let log">
                  <mat-chip [ngClass]="getSecurityStatusClass(log.status)">
                    {{ getSecurityStatusLabel(log.status) }}
                  </mat-chip>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="securityLogsDisplayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: securityLogsDisplayedColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Configuration Système -->
      <mat-card class="section-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>tune</mat-icon>
            Configuration Système
          </mat-card-title>
          <mat-card-subtitle>Paramètres généraux du système</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="config-grid">
            <div *ngFor="let config of systemConfigs" class="config-item">
              <div class="config-header">
                <h4>{{ config.key }}</h4>
                <p>{{ config.description }}</p>
              </div>
              
              <div class="config-control">
                <mat-form-field appearance="outline" class="config-field">
                  <mat-label>{{ config.key }}</mat-label>
                  <input matInput [(ngModel)]="config.value" placeholder="Valeur">
                </mat-form-field>
                
                <button mat-stroked-button color="primary" (click)="updateSystemConfig(config.id, config.value)">
                  <mat-icon>save</mat-icon>
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .settings-section {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      margin-bottom: 24px;
      overflow: hidden;
    }

    .header-content {
      padding: 32px;
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

    .section-card {
      margin-bottom: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .section-card mat-card-header {
      background: #f8f9fa;
      border-radius: 12px 12px 0 0;
      padding: 20px;
    }

    .section-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .section-card mat-card-content {
      padding: 24px;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .setting-item {
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }

    .setting-header h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-weight: 600;
    }

    .setting-header p {
      margin: 0 0 16px 0;
      color: #666;
      font-size: 14px;
    }

    .setting-controls {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .control-group label {
      font-weight: 500;
      color: #333;
    }

    .slider-value {
      font-weight: 600;
      color: #667eea;
      text-align: center;
      margin-top: 8px;
    }

    .channel-toggles {
      display: flex;
      gap: 16px;
    }

    .channel-toggles mat-slide-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .security-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-item {
      text-align: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .table-section {
      margin-top: 24px;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .table-header h4 {
      margin: 0;
      color: #333;
      font-weight: 600;
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
      padding: 16px 12px;
    }

    .data-table td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }

    .data-table tr:hover {
      background: #f8f9fa;
    }

    .config-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .config-item {
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }

    .config-header h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-weight: 600;
    }

    .config-header p {
      margin: 0 0 16px 0;
      color: #666;
      font-size: 14px;
    }

    .config-control {
      display: flex;
      gap: 12px;
      align-items: end;
    }

    .config-field {
      flex: 1;
    }

    /* Status classes */
    .status-success {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .status-failed {
      background: #ffebee;
      color: #c62828;
    }

    .status-warning {
      background: #fff3e0;
      color: #f57c00;
    }

    @media (max-width: 768px) {
      .settings-section {
        padding: 16px;
      }

      .settings-grid,
      .config-grid {
        grid-template-columns: 1fr;
      }

      .channel-toggles {
        flex-direction: column;
      }

      .config-control {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class SettingsSectionComponent implements OnInit {
  // Paramètres de notifications
  notificationSettings: NotificationSettings[] = [
    {
      id: '1',
      type: 'Factures en retard',
      daysBeforeDue: 5,
      emailEnabled: true,
      smsEnabled: false,
      description: 'Alerte pour les factures proches de l\'échéance'
    },
    {
      id: '2',
      type: 'Conventions expirées',
      daysBeforeDue: 10,
      emailEnabled: true,
      smsEnabled: true,
      description: 'Notification pour les conventions arrivant à échéance'
    },
    {
      id: '3',
      type: 'Nouveaux utilisateurs',
      daysBeforeDue: 1,
      emailEnabled: true,
      smsEnabled: false,
      description: 'Alerte lors de la création de nouveaux comptes'
    },
    {
      id: '4',
      type: 'Erreurs système',
      daysBeforeDue: 0,
      emailEnabled: true,
      smsEnabled: true,
      description: 'Notifications immédiates pour les erreurs critiques'
    }
  ];

  // Statistiques de sécurité
  securityStats = {
    totalLogs: 1247,
    failedAttempts: 23,
    activeUsers: 45,
    suspiciousActivities: 3
  };

  // Logs de sécurité
  securityLogs: SecurityLog[] = [
    {
      id: '1',
      user: 'admin@example.com',
      action: 'Connexion réussie',
      timestamp: new Date(),
      ipAddress: '192.168.1.100',
      status: 'success',
      details: 'Connexion depuis le bureau'
    },
    {
      id: '2',
      user: 'user@example.com',
      action: 'Tentative de connexion échouée',
      timestamp: new Date(Date.now() - 300000),
      ipAddress: '192.168.1.101',
      status: 'failed',
      details: 'Mot de passe incorrect'
    },
    {
      id: '3',
      user: 'admin@example.com',
      action: 'Modification des paramètres',
      timestamp: new Date(Date.now() - 600000),
      ipAddress: '192.168.1.100',
      status: 'success',
      details: 'Mise à jour des notifications'
    },
    {
      id: '4',
      user: 'unknown@example.com',
      action: 'Tentative d\'accès non autorisé',
      timestamp: new Date(Date.now() - 900000),
      ipAddress: '10.0.0.50',
      status: 'warning',
      details: 'IP non reconnue'
    }
  ];

  // Configuration système
  systemConfigs: SystemConfig[] = [
    {
      id: '1',
      key: 'Session Timeout',
      value: '30',
      description: 'Durée de session en minutes',
      category: 'security'
    },
    {
      id: '2',
      key: 'Max Login Attempts',
      value: '5',
      description: 'Nombre maximum de tentatives de connexion',
      category: 'security'
    },
    {
      id: '3',
      key: 'Backup Frequency',
      value: 'daily',
      description: 'Fréquence des sauvegardes automatiques',
      category: 'system'
    },
    {
      id: '4',
      key: 'Email Server',
      value: 'smtp.example.com',
      description: 'Serveur SMTP pour les notifications',
      category: 'notifications'
    }
  ];

  securityLogsDataSource = this.securityLogs;
  securityLogsDisplayedColumns = ['user', 'action', 'timestamp', 'ipAddress', 'status'];

  ngOnInit() {
    console.log('🔄 Settings Section initialisée');
  }

  updateNotificationSetting(id: string, field: string, value: any) {
    const setting = this.notificationSettings.find(s => s.id === id);
    if (setting) {
      (setting as any)[field] = value;
      console.log(`📧 Notification setting updated: ${id}.${field} = ${value}`);
    }
  }

  updateSystemConfig(id: string, value: string) {
    const config = this.systemConfigs.find(c => c.id === id);
    if (config) {
      config.value = value;
      console.log(`⚙️ System config updated: ${id} = ${value}`);
    }
  }

  getSecurityStatusClass(status: string): string {
    switch (status) {
      case 'success': return 'status-success';
      case 'failed': return 'status-failed';
      case 'warning': return 'status-warning';
      default: return 'status-failed';
    }
  }

  getSecurityStatusLabel(status: string): string {
    switch (status) {
      case 'success': return 'Succès';
      case 'failed': return 'Échec';
      case 'warning': return 'Avertissement';
      default: return 'Inconnu';
    }
  }
}
