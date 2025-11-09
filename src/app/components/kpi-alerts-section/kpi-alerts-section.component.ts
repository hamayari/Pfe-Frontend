import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { KpiAlertService, KpiAlert } from '../../services/kpi-alert.service';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InvoiceOverviewDialogComponent } from '../invoice-overview-dialog/invoice-overview-dialog.component';

@Component({
  selector: 'app-kpi-alerts-section',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    MatTooltipModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="kpi-alerts-section">
      <!-- Header -->
      <div class="section-header">
        <h2>
          <mat-icon>notifications_active</mat-icon>
          {{ userRole === 'DECIDEUR' ? 'Alertes KPI en Attente de Décision' : 'Alertes KPI Reçues' }}
        </h2>
        <button mat-raised-button color="primary" (click)="refreshAlerts()">
          <mat-icon>refresh</mat-icon>
          Actualiser
        </button>
      </div>

      <!-- Statistiques -->
      <div class="stats-row" *ngIf="userRole === 'DECIDEUR'">
        <mat-card class="stat-card pending">
          <mat-card-content>
            <div class="stat-value">{{ pendingAlerts.length }}</div>
            <div class="stat-label">En attente de décision</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card sent">
          <mat-card-content>
            <div class="stat-value">{{ sentCount }}</div>
            <div class="stat-label">Envoyées au Chef de Projet</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Liste des alertes PENDING_DECISION (Décideur) -->
      <div *ngIf="userRole === 'DECIDEUR' && pendingAlerts.length > 0" class="alerts-list">
        <mat-card *ngFor="let alert of pendingAlerts" class="alert-card pending">
          <mat-card-header>
            <div class="alert-header">
              <div class="alert-icon">
                <mat-icon [style.color]="getSeverityColor(alert.severity)">warning</mat-icon>
              </div>
              <div class="alert-info">
                <h3>{{ alert.kpiName }} - {{ alert.dimensionValue }}</h3>
                <p class="alert-message">{{ alert.message }}</p>
              </div>
              <mat-chip-set>
                <mat-chip [style.background]="getSeverityColor(alert.severity)">
                  {{ alert.severity }}
                </mat-chip>
                <mat-chip class="status-chip pending">
                  🟠 EN ATTENTE
                </mat-chip>
              </mat-chip-set>
            </div>
          </mat-card-header>

          <mat-card-content>
            <div class="alert-details">
              <div class="detail-row">
                <strong>Valeur actuelle:</strong>
                <span class="value-badge critical">{{ alert.currentValue }}</span>
              </div>
              <div class="detail-row">
                <strong>Seuil:</strong>
                <span class="value-badge">{{ alert.thresholdValue }}</span>
              </div>
              <div class="detail-row">
                <strong>Détecté le:</strong>
                <span>{{ formatDate(alert.detectedAt) }}</span>
              </div>
              <div class="detail-row recommendation">
                <strong>Recommandation:</strong>
                <p>{{ alert.recommendation }}</p>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-raised-button color="warn" (click)="sendToProjectManager(alert)">
              <mat-icon>send</mat-icon>
              Envoyer au Chef de Projet
            </button>
            <button mat-button (click)="viewHistory(alert)">
              <mat-icon>history</mat-icon>
              Historique
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Message si aucune alerte (Décideur) -->
      <div *ngIf="userRole === 'DECIDEUR' && pendingAlerts.length === 0" class="no-alerts">
        <mat-icon>check_circle_outline</mat-icon>
        <h3>✅ Aucune alerte en attente</h3>
        <p>Tous les KPI sont dans les normes ou déjà notifiés</p>
      </div>

      <!-- Liste des alertes pour Chef de Projet -->
      <div *ngIf="userRole === 'CHEF_PROJET' && activeAlerts.length > 0" class="alerts-list">
        <mat-card *ngFor="let alert of activeAlerts" class="alert-card active">
          <mat-card-header>
            <div class="alert-header">
              <div class="alert-icon">
                <mat-icon [style.color]="getSeverityColor(alert.severity)">error</mat-icon>
              </div>
              <div class="alert-info">
                <h3>{{ alert.kpiName }} - {{ alert.dimensionValue }}</h3>
                <p class="alert-message">{{ alert.message }}</p>
              </div>
              <mat-chip-set>
                <mat-chip [style.background]="getSeverityColor(alert.severity)">
                  {{ alert.severity }}
                </mat-chip>
                <mat-chip [class]="'status-chip ' + alert.alertStatus.toLowerCase()">
                  {{ getStatusLabel(alert.alertStatus) }}
                </mat-chip>
              </mat-chip-set>
            </div>
          </mat-card-header>

          <mat-card-content>
            <div class="alert-details">
              <div class="detail-row">
                <strong>Valeur actuelle:</strong>
                <span class="value-badge critical">{{ alert.currentValue }}</span>
              </div>
              <div class="detail-row">
                <strong>Reçu le:</strong>
                <span>{{ formatDate(alert.detectedAt) }}</span>
              </div>
              <div class="detail-row recommendation">
                <strong>Recommandation:</strong>
                <p>{{ alert.recommendation }}</p>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button (click)="takeCharge(alert)" *ngIf="alert.alertStatus === 'NEW'">
              <mat-icon>assignment_ind</mat-icon>
              Prendre en charge
            </button>
            <button mat-raised-button color="primary" (click)="resolveAlert(alert)">
              <mat-icon>check_circle</mat-icon>
              Résoudre
            </button>
            <button mat-button (click)="viewHistory(alert)">
              <mat-icon>history</mat-icon>
              Historique
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Message si aucune alerte (Chef de Projet) -->
      <div *ngIf="userRole === 'CHEF_PROJET' && activeAlerts.length === 0" class="no-alerts">
        <mat-icon>check_circle_outline</mat-icon>
        <h3>✅ Aucune alerte active</h3>
        <p>Toutes les alertes ont été traitées</p>
      </div>

      <!-- Historique récent -->
      <mat-expansion-panel class="history-panel">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>history</mat-icon>
            Historique des alertes (7 derniers jours)
          </mat-panel-title>
        </mat-expansion-panel-header>
        
        <div class="history-list">
          <table mat-table [dataSource]="historyAlerts" *ngIf="historyAlerts.length > 0">
            <ng-container matColumnDef="kpi">
              <th mat-header-cell *matHeaderCellDef>KPI</th>
              <td mat-cell *matCellDef="let alert">{{ alert.kpiName }}</td>
            </ng-container>

            <ng-container matColumnDef="zone">
              <th mat-header-cell *matHeaderCellDef>Zone</th>
              <td mat-cell *matCellDef="let alert">{{ alert.dimensionValue }}</td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let alert">{{ formatDate(alert.detectedAt) }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>État</th>
              <td mat-cell *matCellDef="let alert">
                <mat-chip [class]="'status-chip ' + alert.alertStatus.toLowerCase()">
                  {{ getStatusLabel(alert.alertStatus) }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="resolved">
              <th mat-header-cell *matHeaderCellDef>Résolu par</th>
              <td mat-cell *matCellDef="let alert">{{ alert.resolvedByName || '-' }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="historyColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: historyColumns;"></tr>
          </table>

          <div *ngIf="historyAlerts.length === 0" class="no-history">
            <p>Aucun historique récent</p>
          </div>
        </div>
      </mat-expansion-panel>
    </div>
  `,
  styles: [`
    .kpi-alerts-section {
      padding: 24px;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;

        h2 {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
          font-size: 24px;
          font-weight: 600;

          mat-icon {
            color: #1877f2;
          }
        }
      }

      .stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        margin-bottom: 24px;

        .stat-card {
          mat-card-content {
            text-align: center;
            padding: 20px !important;

            .stat-value {
              font-size: 36px;
              font-weight: 700;
              margin-bottom: 8px;
            }

            .stat-label {
              font-size: 14px;
              color: #666;
            }
          }

          &.pending .stat-value {
            color: #ff9800;
          }

          &.sent .stat-value {
            color: #2196f3;
          }
        }
      }

      .alerts-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 24px;

        .alert-card {
          &.pending {
            border-left: 4px solid #ff9800;
          }

          &.active {
            border-left: 4px solid #f44336;
          }

          .alert-header {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            width: 100%;

            .alert-icon mat-icon {
              font-size: 32px;
              width: 32px;
              height: 32px;
            }

            .alert-info {
              flex: 1;

              h3 {
                margin: 0 0 8px 0;
                font-size: 18px;
                font-weight: 600;
              }

              .alert-message {
                margin: 0;
                color: #666;
                font-size: 14px;
              }
            }

            mat-chip-set {
              display: flex;
              gap: 8px;

              mat-chip {
                color: white;
                font-weight: 600;

                &.status-chip {
                  &.pending {
                    background: #ff9800 !important;
                  }

                  &.new {
                    background: #f44336 !important;
                  }

                  &.in_progress {
                    background: #2196f3 !important;
                  }

                  &.resolved {
                    background: #4caf50 !important;
                  }
                }
              }
            }
          }

          .alert-details {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 16px;

            .detail-row {
              display: flex;
              gap: 12px;
              align-items: center;

              strong {
                min-width: 140px;
                color: #666;
              }

              .value-badge {
                padding: 4px 12px;
                border-radius: 12px;
                background: #e3f2fd;
                color: #1976d2;
                font-weight: 600;

                &.critical {
                  background: #ffebee;
                  color: #c62828;
                }
              }

              &.recommendation {
                flex-direction: column;
                align-items: flex-start;

                p {
                  margin: 0;
                  padding: 12px;
                  background: #f5f5f5;
                  border-radius: 8px;
                  border-left: 3px solid #1877f2;
                  width: 100%;
                }
              }
            }
          }
        }
      }

      .no-alerts {
        text-align: center;
        padding: 60px 20px;
        color: #999;

        mat-icon {
          font-size: 80px;
          width: 80px;
          height: 80px;
          margin-bottom: 16px;
          color: #4caf50;
        }

        h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          color: #333;
        }

        p {
          margin: 0;
          font-size: 14px;
        }
      }

      .history-panel {
        margin-top: 24px;

        .history-list {
          padding: 16px;

          table {
            width: 100%;
          }

          .no-history {
            text-align: center;
            padding: 40px;
            color: #999;
          }
        }
      }
    }
  `]
})
export class KpiAlertsSectionComponent implements OnInit, OnDestroy {
  @Input() userRole: 'DECIDEUR' | 'CHEF_PROJET' = 'CHEF_PROJET';

  private destroy$ = new Subject<void>();

  pendingAlerts: KpiAlert[] = [];
  activeAlerts: KpiAlert[] = [];
  historyAlerts: KpiAlert[] = [];
  sentCount = 0;

  historyColumns = ['kpi', 'zone', 'date', 'status', 'resolved'];

  constructor(
    private alertService: KpiAlertService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAlerts();
    
    // Rafraîchir toutes les 30 secondes
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadAlerts());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAlerts(): void {
    if (this.userRole === 'DECIDEUR') {
      // Charger les alertes PENDING_DECISION
      this.alertService.getActiveAlerts().subscribe({
        next: (response) => {
          this.pendingAlerts = response.alerts.filter((a: KpiAlert) => a.alertStatus === 'PENDING_DECISION');
        }
      });
      
      // Compter les alertes envoyées
      this.alertService.getStatistics().subscribe({
        next: (response) => {
          this.sentCount = response.statistics.sent || 0;
        }
      });
    } else {
      // Chef de Projet: alertes actives
      this.alertService.getActiveAlerts().subscribe({
        next: (response) => {
          this.activeAlerts = response.alerts;
        }
      });
    }

    // Historique pour les deux
    this.alertService.getResolvedAlerts().subscribe({
      next: (response) => {
        this.historyAlerts = response.alerts;
      }
    });
  }

  refreshAlerts(): void {
    // D'abord déclencher la vérification KPI
    this.snackBar.open('🔄 Vérification des KPI en cours...', '', { duration: 2000 });
    
    this.alertService.triggerKpiCheck().subscribe({
      next: () => {
        console.log('✅ Vérification KPI déclenchée');
        // Attendre 2 secondes puis recharger les alertes
        setTimeout(() => {
          this.loadAlerts();
          this.snackBar.open('✅ Alertes actualisées', 'Fermer', { duration: 2000 });
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Erreur vérification KPI:', error);
        // Recharger quand même les alertes
        this.loadAlerts();
        this.snackBar.open('✅ Alertes actualisées', 'Fermer', { duration: 2000 });
      }
    });
  }

  sendToProjectManager(alert: KpiAlert): void {
    if (!confirm(`Êtes-vous sûr de vouloir envoyer cette alerte au Chef de Projet?\n\nKPI: ${alert.kpiName}\nZone: ${alert.dimensionValue}`)) {
      return;
    }

    this.alertService.sendToProjectManager(alert.id).subscribe({
      next: () => {
        this.snackBar.open('✅ Alerte envoyée au Chef de Projet avec succès', 'Fermer', { duration: 3000 });
        this.loadAlerts();
      },
      error: (error) => {
        console.error('Erreur envoi:', error);
        this.snackBar.open('❌ Erreur lors de l\'envoi de l\'alerte', 'Fermer', { duration: 3000 });
      }
    });
  }

  takeCharge(alert: KpiAlert): void {
    this.alertService.markAsInProgress(alert.id).subscribe({
      next: () => {
        this.snackBar.open('✅ Alerte prise en charge', 'Fermer', { duration: 2000 });
        this.loadAlerts();
      }
    });
  }

  resolveAlert(alert: KpiAlert): void {
    const comment = prompt('Commentaire de résolution:');
    if (comment) {
      this.alertService.resolveAlert(alert.id, comment, '').subscribe({
        next: () => {
          this.snackBar.open('✅ Alerte résolue', 'Fermer', { duration: 2000 });
          this.loadAlerts();
        }
      });
    }
  }

  viewHistory(alert: KpiAlert): void {
    this.alertService.getAlertHistory(alert.id).subscribe({
      next: (response) => {
        console.log('Historique:', response.history);
        this.snackBar.open('📜 Voir console pour l\'historique', 'Fermer', { duration: 2000 });
      }
    });
  }

  getSeverityColor(severity: string): string {
    const colors: { [key: string]: string } = {
      'HIGH': '#f44336',
      'CRITICAL': '#d32f2f',
      'MEDIUM': '#ff9800',
      'LOW': '#2196f3'
    };
    return colors[severity] || '#999';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING_DECISION': '🟠 En attente',
      'NEW': '🔴 Nouvelle',
      'IN_PROGRESS': '🔵 En cours',
      'RESOLVED': '🟢 Résolue',
      'SENT_TO_PM': '📨 Envoyée'
    };
    return labels[status] || status;
  }

  formatDate(date: Date | string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}
