import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface AnalyticsData {
  region: string;
  paidInvoices: number;
  pendingInvoices: number;
  totalAmount: number;
  activeConventions: number;
  expiredConventions: number;
  usersCount: number;
}

interface UserDistribution {
  role: string;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-analytics-section',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  template: `
    <div class="analytics-section">
      <!-- Filtres -->
      <mat-card class="filters-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>filter_list</mat-icon>
            Filtres d'analyse
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="filters-grid">
            <mat-form-field appearance="outline">
              <mat-label>Période</mat-label>
              <mat-select [(ngModel)]="selectedPeriod">
                <mat-option value="month">Ce mois</mat-option>
                <mat-option value="quarter">Ce trimestre</mat-option>
                <mat-option value="year">Cette année</mat-option>
                <mat-option value="custom">Période personnalisée</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Structure</mat-label>
              <mat-select [(ngModel)]="selectedStructure">
                <mat-option value="all">Toutes les structures</mat-option>
                <mat-option *ngFor="let structure of structures" [value]="structure">
                  {{ structure }}
                </mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Gouvernorat</mat-label>
              <mat-select [(ngModel)]="selectedGovernorate">
                <mat-option value="all">Tous les gouvernorats</mat-option>
                <mat-option *ngFor="let governorate of governorates" [value]="governorate">
                  {{ governorate }}
                </mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Application</mat-label>
              <mat-select [(ngModel)]="selectedApplication">
                <mat-option value="all">Toutes les applications</mat-option>
                <mat-option *ngFor="let app of applications" [value]="app">
                  {{ app }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Graphiques de performance -->
      <div class="charts-grid">
        <!-- Factures par région -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>pie_chart</mat-icon>
              Factures par région
            </mat-card-title>
            <mat-card-subtitle>Pourcentage de factures payées/non payées</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-placeholder">
              <mat-icon>pie_chart</mat-icon>
              <h3>Graphique circulaire</h3>
              <p>Répartition des factures par statut et région</p>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color paid"></div>
                <span>Payées ({{ getPaidPercentage() }}%)</span>
              </div>
              <div class="legend-item">
                <div class="legend-color pending"></div>
                <span>En attente ({{ getPendingPercentage() }}%)</span>
              </div>
              <div class="legend-item">
                <div class="legend-color overdue"></div>
                <span>En retard ({{ getOverduePercentage() }}%)</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Conventions actives vs expirées -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>bar_chart</mat-icon>
              Conventions actives vs expirées
            </mat-card-title>
            <mat-card-subtitle>Évolution sur la période sélectionnée</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-placeholder">
              <mat-icon>bar_chart</mat-icon>
              <h3>Graphique en barres</h3>
              <p>Comparaison des conventions par statut</p>
            </div>
            <div class="stats-summary">
              <div class="stat-item">
                <span class="stat-label">Actives</span>
                <span class="stat-value active">{{ getActiveConventionsCount() }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Expirées</span>
                <span class="stat-value expired">{{ getExpiredConventionsCount() }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Distribution des utilisateurs -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>people</mat-icon>
              Distribution des utilisateurs
            </mat-card-title>
            <mat-card-subtitle>Par rôle et statut</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-placeholder">
              <mat-icon>donut_large</mat-icon>
              <h3>Graphique en anneau</h3>
              <p>Répartition des utilisateurs par rôle</p>
            </div>
            <div class="user-distribution">
              <div *ngFor="let distribution of userDistributions" class="distribution-item">
                <div class="distribution-header">
                  <span class="role-name">{{ distribution.role }}</span>
                  <span class="role-count">{{ distribution.count }} ({{ distribution.percentage }}%)</span>
                </div>
                <mat-progress-bar 
                  [value]="distribution.percentage" 
                  [color]="getRoleColor(distribution.role)">
                </mat-progress-bar>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tableaux exportables -->
      <mat-card class="exportable-table-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>table_chart</mat-icon>
            Données détaillées
          </mat-card-title>
          <mat-card-subtitle>Tableaux exportables en PDF/Excel</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="table-actions">
            <button mat-raised-button color="primary" (click)="exportToPDF()">
              <mat-icon>picture_as_pdf</mat-icon>
              Exporter PDF
            </button>
            <button mat-raised-button color="accent" (click)="exportToExcel()">
              <mat-icon>table_view</mat-icon>
              Exporter Excel
            </button>
            <button mat-raised-button (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              Actualiser
            </button>
          </div>

          <table mat-table [dataSource]="analyticsDataSource" matSort class="analytics-table">
            <!-- Région -->
            <ng-container matColumnDef="region">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Région</th>
              <td mat-cell *matCellDef="let data">{{ data.region }}</td>
            </ng-container>
            
            <!-- Factures payées -->
            <ng-container matColumnDef="paidInvoices">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Factures payées</th>
              <td mat-cell *matCellDef="let data">{{ data.paidInvoices }}</td>
            </ng-container>
            
            <!-- Factures en attente -->
            <ng-container matColumnDef="pendingInvoices">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Factures en attente</th>
              <td mat-cell *matCellDef="let data">{{ data.pendingInvoices }}</td>
            </ng-container>
            
            <!-- Montant total -->
            <ng-container matColumnDef="totalAmount">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Montant total</th>
              <td mat-cell *matCellDef="let data">{{ data.totalAmount | currency:'TND' }}</td>
            </ng-container>
            
            <!-- Conventions actives -->
            <ng-container matColumnDef="activeConventions">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Conventions actives</th>
              <td mat-cell *matCellDef="let data">
                <mat-chip class="status-active">{{ data.activeConventions }}</mat-chip>
              </td>
            </ng-container>
            
            <!-- Conventions expirées -->
            <ng-container matColumnDef="expiredConventions">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Conventions expirées</th>
              <td mat-cell *matCellDef="let data">
                <mat-chip class="status-expired">{{ data.expiredConventions }}</mat-chip>
              </td>
            </ng-container>
            
            <!-- Nombre d'utilisateurs -->
            <ng-container matColumnDef="usersCount">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Utilisateurs</th>
              <td mat-cell *matCellDef="let data">{{ data.usersCount }}</td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          
          <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .analytics-section {
      padding: 24px;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .chart-card {
      height: 400px;
    }

    .chart-placeholder {
      text-align: center;
      padding: 40px 20px;
      border: 2px dashed #e0e0e0;
      border-radius: 8px;
      background-color: #fafafa;
      margin-bottom: 16px;

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

    .chart-legend {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 50%;

      &.paid {
        background-color: #4caf50;
      }

      &.pending {
        background-color: #ff9800;
      }

      &.overdue {
        background-color: #f44336;
      }
    }

    .stats-summary {
      display: flex;
      justify-content: space-around;
      margin-top: 16px;
    }

    .stat-item {
      text-align: center;

      .stat-label {
        display: block;
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 700;

        &.active {
          color: #4caf50;
        }

        &.expired {
          color: #f44336;
        }
      }
    }

    .user-distribution {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .distribution-item {
      .distribution-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;

        .role-name {
          font-size: 14px;
          font-weight: 500;
        }

        .role-count {
          font-size: 12px;
          color: #666;
        }
      }
    }

    .exportable-table-card {
      margin-bottom: 24px;
    }

    .table-actions {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .analytics-table {
      width: 100%;
      margin-bottom: 16px;
    }

    .analytics-table th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: #333;
    }

    .analytics-table td {
      padding: 12px 8px;
    }

    mat-chip {
      font-size: 12px;
      font-weight: 500;
    }

    .status-active {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-expired {
      background-color: #ffebee;
      color: #c62828;
    }

    @media (max-width: 768px) {
      .filters-grid {
        grid-template-columns: 1fr;
      }

      .charts-grid {
        grid-template-columns: 1fr;
      }

      .table-actions {
        flex-direction: column;
      }
    }
  `]
})
export class AnalyticsSectionComponent implements OnInit {
  selectedPeriod = 'month';
  selectedStructure = 'all';
  selectedGovernorate = 'all';
  selectedApplication = 'all';

  structures = ['Structure A', 'Structure B', 'Structure C', 'Ministère X', 'Organisation Y'];
  governorates = ['Tunis', 'Sfax', 'Sousse', 'Monastir', 'Gabès', 'Gafsa'];
  applications = ['Application 1', 'Application 2', 'Application 3'];

  analyticsData: AnalyticsData[] = [
    {
      region: 'Tunis',
      paidInvoices: 45,
      pendingInvoices: 12,
      totalAmount: 125000,
      activeConventions: 8,
      expiredConventions: 2,
      usersCount: 25
    },
    {
      region: 'Sfax',
      paidInvoices: 32,
      pendingInvoices: 8,
      totalAmount: 89000,
      activeConventions: 6,
      expiredConventions: 1,
      usersCount: 18
    },
    {
      region: 'Sousse',
      paidInvoices: 28,
      pendingInvoices: 15,
      totalAmount: 67000,
      activeConventions: 4,
      expiredConventions: 3,
      usersCount: 12
    },
    {
      region: 'Monastir',
      paidInvoices: 18,
      pendingInvoices: 5,
      totalAmount: 42000,
      activeConventions: 3,
      expiredConventions: 1,
      usersCount: 8
    }
  ];

  userDistributions: UserDistribution[] = [
    { role: 'Administrateur', count: 5, percentage: 20 },
    { role: 'Commercial', count: 12, percentage: 48 },
    { role: 'Chef de Projet', count: 6, percentage: 24 },
    { role: 'Décideur', count: 2, percentage: 8 }
  ];

  analyticsDataSource = this.analyticsData;
  displayedColumns = ['region', 'paidInvoices', 'pendingInvoices', 'totalAmount', 'activeConventions', 'expiredConventions', 'usersCount'];

  ngOnInit() {
    this.loadAnalyticsData();
  }

  loadAnalyticsData() {
    console.log('Chargement des données analytiques');
  }

  getPaidPercentage(): number {
    const total = this.analyticsData.reduce((sum, data) => sum + data.paidInvoices + data.pendingInvoices, 0);
    const paid = this.analyticsData.reduce((sum, data) => sum + data.paidInvoices, 0);
    return total > 0 ? Math.round((paid / total) * 100) : 0;
  }

  getPendingPercentage(): number {
    const total = this.analyticsData.reduce((sum, data) => sum + data.paidInvoices + data.pendingInvoices, 0);
    const pending = this.analyticsData.reduce((sum, data) => sum + data.pendingInvoices, 0);
    return total > 0 ? Math.round((pending / total) * 100) : 0;
  }

  getOverduePercentage(): number {
    return 100 - this.getPaidPercentage() - this.getPendingPercentage();
  }

  getActiveConventionsCount(): number {
    return this.analyticsData.reduce((sum, data) => sum + data.activeConventions, 0);
  }

  getExpiredConventionsCount(): number {
    return this.analyticsData.reduce((sum, data) => sum + data.expiredConventions, 0);
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'Administrateur': return 'warn';
      case 'Commercial': return 'primary';
      case 'Chef de Projet': return 'accent';
      case 'Décideur': return 'primary';
      default: return 'primary';
    }
  }

  exportToPDF() {
    console.log('Export PDF des données analytiques');
    // Implémentation de l'export PDF
  }

  exportToExcel() {
    console.log('Export Excel des données analytiques');
    // Implémentation de l'export Excel
  }

  refreshData() {
    console.log('Actualisation des données analytiques');
    this.loadAnalyticsData();
  }
}































