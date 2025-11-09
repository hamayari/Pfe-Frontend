import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-commercial-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule
  ],
  template: `
    <div class="commercial-details-dialog">
      <div class="dialog-header">
        <div class="header-content">
          <div class="avatar-section">
            <div class="avatar" [class]="'status-' + data.commercial.status">
              <mat-icon>person</mat-icon>
            </div>
            <div class="status-indicator" [class]="'status-' + data.commercial.status">
              <span class="status-dot"></span>
              <span class="status-text">{{ getStatusText(data.commercial.status) }}</span>
            </div>
          </div>
          <div class="header-info">
            <h2 mat-dialog-title>{{ data.commercial.name }}</h2>
            <p class="role">{{ data.commercial.role }}</p>
            <p class="email" *ngIf="data.commercial.email">
              <mat-icon>email</mat-icon>
              {{ data.commercial.email }}
            </p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-divider></mat-divider>

      <div mat-dialog-content class="dialog-content">
        <!-- Tâche actuelle -->
        <div class="info-section" *ngIf="data.commercial.currentTask">
          <div class="section-header">
            <mat-icon>assignment</mat-icon>
            <h3>Tâche en cours</h3>
          </div>
          <mat-chip class="current-task-chip">
            {{ data.commercial.currentTask }}
          </mat-chip>
        </div>

        <!-- Dernière activité -->
        <div class="info-section">
          <div class="section-header">
            <mat-icon>schedule</mat-icon>
            <h3>Dernière activité</h3>
          </div>
          <p class="last-activity">
            {{ data.commercial.lastActivity | date:'dd/MM/yyyy HH:mm' }}
          </p>
        </div>

        <mat-divider></mat-divider>

        <!-- Statistiques Conventions -->
        <div class="stats-section">
          <div class="section-header">
            <mat-icon>description</mat-icon>
            <h3>Conventions</h3>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ data.commercial.assignedConventions || 0 }}</div>
              <div class="stat-label">Assignées</div>
            </div>
            <div class="stat-card success">
              <div class="stat-value">{{ data.commercial.activeConventions || 0 }}</div>
              <div class="stat-label">Actives</div>
              <div class="stat-percentage">{{ activeRate }}%</div>
            </div>
            <div class="stat-card danger">
              <div class="stat-value">{{ data.commercial.expiredConventions || 0 }}</div>
              <div class="stat-label">Expirées</div>
            </div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Statistiques Factures -->
        <div class="stats-section">
          <div class="section-header">
            <mat-icon>receipt</mat-icon>
            <h3>Factures</h3>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ data.commercial.totalInvoices || 0 }}</div>
              <div class="stat-label">Total</div>
            </div>
            <div class="stat-card success">
              <div class="stat-value">{{ data.commercial.paidInvoices || 0 }}</div>
              <div class="stat-label">Payées</div>
              <div class="stat-percentage">{{ invoiceSuccessRate }}%</div>
            </div>
            <div class="stat-card warning">
              <div class="stat-value">{{ data.commercial.pendingInvoices || 0 }}</div>
              <div class="stat-label">En attente</div>
            </div>
            <div class="stat-card danger">
              <div class="stat-value">{{ data.commercial.overdueInvoices || 0 }}</div>
              <div class="stat-label">En retard</div>
            </div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Performance -->
        <div class="performance-section">
          <div class="section-header">
            <mat-icon>trending_up</mat-icon>
            <h3>Performance</h3>
          </div>
          
          <div class="performance-metrics">
            <div class="metric">
              <div class="metric-header">
                <span class="metric-label">Taux de paiement</span>
                <span class="metric-value">{{ data.commercial.paymentRate || 0 }}%</span>
              </div>
              <mat-progress-bar 
                mode="determinate" 
                [value]="data.commercial.paymentRate || 0"
                [color]="getProgressColor(data.commercial.paymentRate || 0)">
              </mat-progress-bar>
            </div>

            <div class="metric">
              <div class="metric-header">
                <span class="metric-label">Score de performance</span>
                <span class="metric-value">{{ data.commercial.performanceScore || 0 }}/100</span>
              </div>
              <mat-progress-bar 
                mode="determinate" 
                [value]="data.commercial.performanceScore || 0"
                [color]="getProgressColor(data.commercial.performanceScore || 0)">
              </mat-progress-bar>
            </div>
          </div>

          <!-- Badge de performance -->
          <div class="performance-badge" [class]="getPerformanceBadgeClass()">
            <mat-icon>{{ getPerformanceIcon() }}</mat-icon>
            <span>{{ getPerformanceLabel() }}</span>
          </div>
        </div>
      </div>

      <mat-divider></mat-divider>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onContact()">
          <mat-icon>chat</mat-icon>
          Contacter
        </button>
        <button mat-raised-button color="primary" mat-dialog-close>
          Fermer
        </button>
      </div>
    </div>
  `,
  styles: [`
    .commercial-details-dialog {
      width: 600px;
      max-width: 90vw;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .header-content {
      display: flex;
      gap: 20px;
      flex: 1;
    }

    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
    }

    .avatar mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: white;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.2);
      font-size: 12px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-indicator.status-online .status-dot {
      background: #4caf50;
      box-shadow: 0 0 8px #4caf50;
    }

    .status-indicator.status-busy .status-dot {
      background: #ff9800;
      box-shadow: 0 0 8px #ff9800;
    }

    .status-indicator.status-offline .status-dot {
      background: #f44336;
    }

    .header-info {
      flex: 1;
    }

    .header-info h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .role {
      margin: 0 0 12px 0;
      opacity: 0.9;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .email {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }

    .email mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .close-btn {
      color: white;
    }

    .dialog-content {
      padding: 24px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .info-section {
      margin-bottom: 24px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      color: #667eea;
    }

    .section-header mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .section-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .current-task-chip {
      background: #e3f2fd;
      color: #1976d2;
      padding: 8px 16px;
    }

    .last-activity {
      color: #666;
      margin: 0;
      font-size: 14px;
    }

    .stats-section {
      margin: 24px 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .stat-card {
      padding: 16px;
      border-radius: 12px;
      background: #f5f5f5;
      text-align: center;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .stat-card.success {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .stat-card.warning {
      background: #fff3e0;
      color: #f57c00;
    }

    .stat-card.danger {
      background: #ffebee;
      color: #c62828;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-percentage {
      font-size: 14px;
      font-weight: 600;
      margin-top: 4px;
    }

    .performance-section {
      margin: 24px 0;
    }

    .performance-metrics {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin: 16px 0;
    }

    .metric {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .metric-label {
      font-size: 14px;
      color: #666;
    }

    .metric-value {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .performance-badge {
      margin-top: 20px;
      padding: 16px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 16px;
      font-weight: 600;
    }

    .performance-badge.excellent {
      background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
      color: #f57f17;
    }

    .performance-badge.good {
      background: linear-gradient(135deg, #4caf50 0%, #81c784 100%);
      color: white;
    }

    .performance-badge.average {
      background: linear-gradient(135deg, #2196f3 0%, #64b5f6 100%);
      color: white;
    }

    .performance-badge.poor {
      background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
      color: white;
    }

    .dialog-actions {
      padding: 16px 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    mat-divider {
      margin: 0;
    }
  `]
})
export class CommercialDetailsDialogComponent {
  activeRate: number = 0;
  invoiceSuccessRate: number = 0;

  constructor(
    public dialogRef: MatDialogRef<CommercialDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { commercial: any }
  ) {
    this.calculateRates();
  }

  private calculateRates(): void {
    const totalConventions = this.data.commercial.assignedConventions || 0;
    this.activeRate = totalConventions > 0
      ? Math.round(((this.data.commercial.activeConventions || 0) / totalConventions) * 100)
      : 0;

    const totalInvoices = this.data.commercial.totalInvoices || 0;
    this.invoiceSuccessRate = totalInvoices > 0
      ? Math.round(((this.data.commercial.paidInvoices || 0) / totalInvoices) * 100)
      : 0;
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'online': 'En ligne',
      'busy': 'Occupé',
      'offline': 'Hors ligne'
    };
    return statusMap[status] || 'Inconnu';
  }

  getProgressColor(value: number): 'primary' | 'accent' | 'warn' {
    if (value >= 70) return 'primary';
    if (value >= 40) return 'accent';
    return 'warn';
  }

  getPerformanceBadgeClass(): string {
    const score = this.data.commercial.performanceScore || 0;
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  }

  getPerformanceIcon(): string {
    const score = this.data.commercial.performanceScore || 0;
    if (score >= 80) return 'star';
    if (score >= 60) return 'thumb_up';
    if (score >= 40) return 'trending_up';
    return 'warning';
  }

  getPerformanceLabel(): string {
    const score = this.data.commercial.performanceScore || 0;
    if (score >= 80) return 'Excellente performance';
    if (score >= 60) return 'Bonne performance';
    if (score >= 40) return 'Performance moyenne';
    return 'Performance à améliorer';
  }

  onContact(): void {
    this.dialogRef.close({ action: 'contact', commercialId: this.data.commercial.id });
  }
}
