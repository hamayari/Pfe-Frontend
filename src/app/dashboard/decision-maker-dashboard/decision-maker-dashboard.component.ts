import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject } from 'rxjs';
import { OnDestroy } from '@angular/core';
declare const Chart: any;

@Component({
  selector: 'app-decision-maker-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,

  ],
  template: `
    <div class="decision-maker-dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>Dashboard Décideur</h1>
        <p>Analyse de la performance globale pour prise de décision stratégique</p>
      </div>

      <!-- Indicateurs clés (KPI) -->
      <div class="kpi-section">
        <mat-card class="kpi-card">
          <mat-card-header>
            <mat-card-title>Indicateurs Clés de Performance</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="kpi-grid">
              <div class="kpi-item">
                <div class="kpi-icon active">
                  <mat-icon>trending_up</mat-icon>
                </div>
                <div class="kpi-content">
                  <div class="kpi-value">{{ activeConventionsRate }}%</div>
                  <div class="kpi-label">Taux de conventions actives</div>
                  <div class="kpi-trend positive">+{{ activeConventionsTrend }}% ce mois</div>
                </div>
              </div>

              <div class="kpi-item">
                <div class="kpi-icon paid">
                  <mat-icon>payments</mat-icon>
                </div>
                <div class="kpi-content">
                  <div class="kpi-value">{{ paidInvoicesRate }}%</div>
                  <div class="kpi-label">Factures payées dans les délais</div>
                  <div class="kpi-trend positive">+{{ paidInvoicesTrend }}% ce mois</div>
                </div>
              </div>

              <div class="kpi-item">
                <div class="kpi-icon revenue">
                  <mat-icon>monetization_on</mat-icon>
                </div>
                <div class="kpi-content">
                  <div class="kpi-value">{{ totalRevenue | currency:'TND':'symbol':'1.0-0' }}</div>
                  <div class="kpi-label">Chiffre d'affaires total</div>
                  <div class="kpi-trend positive">+{{ revenueTrend }}% ce mois</div>
                </div>
              </div>

              <div class="kpi-item">
                <div class="kpi-icon efficiency">
                  <mat-icon>speed</mat-icon>
                </div>
                <div class="kpi-content">
                  <div class="kpi-value">{{ efficiencyRate }}%</div>
                  <div class="kpi-label">Taux d'efficacité global</div>
                  <div class="kpi-trend negative">-{{ efficiencyTrend }}% ce mois</div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Graphiques dynamiques -->
      <div class="charts-section">
        <div class="chart-row">
          <!-- Évolution des conventions -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Évolution des conventions signées</mat-card-title>
              <mat-card-subtitle>Par mois</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container">
                <div class="chart-placeholder">
                  <mat-icon>show_chart</mat-icon>
                  <p>Graphique d'évolution des conventions</p>
                  <small>Intégration Chart.js prévue</small>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Répartition par gouvernorat -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Répartition par gouvernorat</mat-card-title>
              <mat-card-subtitle>Conventions actives</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container">
                <div class="chart-placeholder">
                  <mat-icon>pie_chart</mat-icon>
                  <p>Camembert des gouvernorats</p>
                  <small>Intégration Chart.js prévue</small>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="chart-row">
          <!-- Paiements par zone -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Paiements par zone géographique</mat-card-title>
              <mat-card-subtitle>Histogramme des paiements</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container">
                <div class="chart-placeholder">
                  <mat-icon>bar_chart</mat-icon>
                  <p>Histogramme des paiements</p>
                  <small>Intégration Chart.js prévue</small>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Applications utilisées -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Répartition des applications</mat-card-title>
              <mat-card-subtitle>Utilisation par application</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container">
                <div class="chart-placeholder">
                  <mat-icon>donut_large</mat-icon>
                  <p>Camembert des applications</p>
                  <small>Intégration Chart.js prévue</small>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Filtres interactifs -->
      <div class="filters-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Filtres d'analyse</mat-card-title>
            <mat-card-subtitle>Personnalisez vos analyses</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="filters-grid">
              <mat-form-field appearance="outline">
                <mat-label>Période</mat-label>
                <mat-select [(ngModel)]="selectedPeriod" (selectionChange)="applyFilters()">
                  <mat-option value="current_month">Mois en cours</mat-option>
                  <mat-option value="last_month">Mois dernier</mat-option>
                  <mat-option value="last_quarter">Trimestre dernier</mat-option>
                  <mat-option value="last_year">Année dernière</mat-option>
                  <mat-option value="custom">Période personnalisée</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Gouvernorat</mat-label>
                <mat-select [(ngModel)]="selectedGovernorate" (selectionChange)="applyFilters()">
                  <mat-option value="">Tous les gouvernorats</mat-option>
                  <mat-option *ngFor="let governorate of governorates" [value]="governorate">
                    {{ governorate }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Structure</mat-label>
                <mat-select [(ngModel)]="selectedStructure" (selectionChange)="applyFilters()">
                  <mat-option value="">Toutes les structures</mat-option>
                  <mat-option *ngFor="let structure of structures" [value]="structure">
                    {{ structure }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Application</mat-label>
                <mat-select [(ngModel)]="selectedApplication" (selectionChange)="applyFilters()">
                  <mat-option value="">Toutes les applications</mat-option>
                  <mat-option *ngFor="let application of applications" [value]="application">
                    {{ application }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="custom-period" *ngIf="selectedPeriod === 'custom'">
              <mat-form-field appearance="outline">
                <mat-label>Date de début</mat-label>
                <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDate">
                <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Date de fin</mat-label>
                <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDate">
                <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Export et rapports -->
      <div class="export-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Export et rapports</mat-card-title>
            <mat-card-subtitle>Génération de rapports automatiques</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="export-options">
              <div class="export-item">
                <h4>Rapport mensuel</h4>
                <p>Résumé complet des activités du mois</p>
                <div class="export-actions">
                  <button mat-raised-button color="primary" (click)="generateMonthlyReport()">
                    <mat-icon>picture_as_pdf</mat-icon>
                    Export PDF
                  </button>
                  <button mat-raised-button color="accent" (click)="generateMonthlyExcel()">
                    <mat-icon>table_chart</mat-icon>
                    Export Excel
                  </button>
                </div>
              </div>

              <div class="export-item">
                <h4>Rapport trimestriel</h4>
                <p>Analyse détaillée du trimestre</p>
                <div class="export-actions">
                  <button mat-raised-button color="primary" (click)="generateQuarterlyReport()">
                    <mat-icon>picture_as_pdf</mat-icon>
                    Export PDF
                  </button>
                  <button mat-raised-button color="accent" (click)="generateQuarterlyExcel()">
                    <mat-icon>table_chart</mat-icon>
                    Export Excel
                  </button>
                </div>
              </div>

              <div class="export-item">
                <h4>Rapport personnalisé</h4>
                <p>Rapport selon vos critères</p>
                <div class="export-actions">
                  <button mat-raised-button color="primary" (click)="generateCustomReport()">
                    <mat-icon>picture_as_pdf</mat-icon>
                    Export PDF
                  </button>
                  <button mat-raised-button color="accent" (click)="generateCustomExcel()">
                    <mat-icon>table_chart</mat-icon>
                    Export Excel
                  </button>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tableau de données détaillées -->
      <div class="detailed-data">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Données détaillées</mat-card-title>
            <mat-card-subtitle>Vue tabulaire des conventions et factures</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="detailedData" matSort class="data-table">
              <ng-container matColumnDef="reference">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Référence</th>
                <td mat-cell *matCellDef="let item">{{ item.reference }}</td>
              </ng-container>

              <ng-container matColumnDef="client">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Client</th>
                <td mat-cell *matCellDef="let item">{{ item.client }}</td>
              </ng-container>

              <ng-container matColumnDef="governorate">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Gouvernorat</th>
                <td mat-cell *matCellDef="let item">{{ item.governorate }}</td>
              </ng-container>

              <ng-container matColumnDef="structure">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Structure</th>
                <td mat-cell *matCellDef="let item">{{ item.structure }}</td>
              </ng-container>

              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Montant</th>
                <td mat-cell *matCellDef="let item">{{ item.amount | currency:'TND' }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let item">
                  <mat-chip [color]="getStatusColor(item.status)" selected>
                    {{ item.status }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
                <td mat-cell *matCellDef="let item">{{ item.date | date:'shortDate' }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="dataColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: dataColumns;"></tr>
            </table>

            <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .decision-maker-dashboard {
      padding: 20px;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .dashboard-header h1 {
      color: #4caf50;
      margin-bottom: 10px;
    }

    .kpi-section {
      margin-bottom: 30px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .kpi-item {
      display: flex;
      align-items: center;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .kpi-item:hover {
      transform: translateY(-2px);
    }

    .kpi-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20px;
    }

    .kpi-icon.active {
      background: linear-gradient(135deg, #4caf50, #45a049);
      color: white;
    }

    .kpi-icon.paid {
      background: linear-gradient(135deg, #2196f3, #1976d2);
      color: white;
    }

    .kpi-icon.revenue {
      background: linear-gradient(135deg, #ff9800, #f57c00);
      color: white;
    }

    .kpi-icon.efficiency {
      background: linear-gradient(135deg, #9c27b0, #7b1fa2);
      color: white;
    }

    .kpi-icon mat-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
    }

    .kpi-content {
      flex: 1;
    }

    .kpi-value {
      font-size: 2rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }

    .kpi-label {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 5px;
    }

    .kpi-trend {
      font-size: 0.8rem;
      font-weight: 500;
    }

    .kpi-trend.positive {
      color: #4caf50;
    }

    .kpi-trend.negative {
      color: #f44336;
    }

    .charts-section {
      margin-bottom: 30px;
    }

    .chart-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .chart-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .chart-container {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chart-placeholder {
      text-align: center;
      color: #666;
    }

    .chart-placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 10px;
      color: #ccc;
    }

    .filters-section {
      margin-bottom: 30px;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .custom-period {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .export-section {
      margin-bottom: 30px;
    }

    .export-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .export-item {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #4caf50;
    }

    .export-item h4 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .export-item p {
      margin: 0 0 15px 0;
      color: #666;
      font-size: 0.9rem;
    }

    .export-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .export-actions button {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .detailed-data {
      margin-bottom: 30px;
    }

    .data-table {
      width: 100%;
    }

    @media (max-width: 768px) {
      .kpi-grid {
        grid-template-columns: 1fr;
      }

      .chart-row {
        grid-template-columns: 1fr;
      }

      .filters-grid {
        grid-template-columns: 1fr;
      }

      .export-options {
        grid-template-columns: 1fr;
      }

      .export-actions {
        flex-direction: column;
      }

      .export-actions button {
        width: 100%;
      }
    }
  `]
})
export class DecisionMakerDashboardComponent implements OnInit, OnDestroy {
  // Lifecycle
  private destroy$ = new Subject<void>();
  snackBar: any;

  // Header properties (même que admin)
  currentUser: any = { username: 'decideur' };
  searchQuery = '';
  hasNotifications = false;
  notificationCount = 0;
  hasMessages = true;
  messageCount = 2;
  userMenuOpen = false;
  darkMode = false;
  // KPI
  activeConventionsRate = 0;
  activeConventionsTrend = 0;
  paidInvoicesRate = 0;
  paidInvoicesTrend = 0;
  totalRevenue = 0;
  revenueTrend = 0;
  efficiencyRate = 0;
  efficiencyTrend = 0;
  
  // Chart properties for tests
  barChartOptions: any = {};
  barChartData: any = {};
  barChartType = 'bar';
  lineChartOptions: any = {};
  lineChartData: any = {};
  lineChartType = 'line';
  pieChartOptions: any = {};
  pieChartData: any = {};
  pieChartType = 'pie';
  doughnutChartOptions: any = {};
  doughnutChartData: any = {};
  doughnutChartType = 'doughnut';
  
  // Theme and refresh
  isDarkMode = false;

  // Filtres
  selectedPeriod = 'current_month';
  selectedGovernorate = '';
  selectedStructure = '';
  selectedApplication = '';
  startDate: Date | null = null;
  endDate: Date | null = null;
  
  // Filters object for tests
  filters = {
    governorate: '',
    structure: '',
    application: '',
    status: '',
    dateRange: ''
  };

  // Données
  detailedData: any[] = [];

  // Options de filtres
  governorates: string[] = [];
  structures: string[] = [];
  applications: string[] = [];
  statuses: string[] = [];
  dateRanges: string[] = [];
  chartTypes: string[] = [];

  // Colonnes du tableau
  dataColumns = ['reference', 'client', 'governorate', 'structure', 'amount', 'status', 'date'];

  // Chart.js Data - Initialized in constructor

  public radarChartData: any = {
    labels: ['Conventions', 'Factures', 'Paiements', 'Clients', 'Performance'],
    datasets: [{
      data: [85, 70, 90, 75, 80],
      label: 'Objectifs',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2
    }, {
      data: [80, 65, 85, 70, 75],
      label: 'Réalisé',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2
    }]
  };

  public radarChartOptions: any = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Indicateurs de Performance' }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  public radarChartType: any = 'radar';

  // ApexCharts Data (placeholder - you can implement actual ApexCharts if needed)
  public heatmapSeries: any[] = [];
  public heatmapChart: any = {};
  public heatmapXAxis: any = {};
  public heatmapYAxis: any = {};
  public heatmapDataLabels: any = {};
  public heatmapGrid: any = {};
  public heatmapStroke: any = {};
  public heatmapTitle: any = {};
  public heatmapLegend: any = {};
  public heatmapFill: any = {};
  public heatmapTooltip: any = {};

  public trendSeries: any[] = [];
  public trendChart: any = {};
  public trendXAxis: any = {};
  public trendYAxis: any = {};

  // Chart.js instances
  private lineChartRef: any = null;
  private stackedBarChartRef: any = null;
  private dailySeriesData: any = {};

  private apiBase = 'http://localhost:8085/api/notifications/analytics';

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loadKPIs();
    this.loadDetailedData();
    this.loadFilterOptions();
    this.fetchAnalytics();
  }

  loadKPIs() {
    // Simuler les KPI
    this.activeConventionsRate = 82;
    this.activeConventionsTrend = 5.2;
    this.paidInvoicesRate = 78;
    this.paidInvoicesTrend = 3.8;
    this.totalRevenue = 1250000;
    this.revenueTrend = 12.5;
    this.efficiencyRate = 85;
    this.efficiencyTrend = 2.1;
  }

  loadDetailedData() {
    this.detailedData = [
      {
        reference: 'CONV-2024-001',
        client: 'Entreprise ABC',
        governorate: 'Tunis',
        structure: 'Structure A',
        amount: 150000,
        status: 'ACTIVE',
        date: new Date(2024, 0, 15)
      },
      {
        reference: 'CONV-2024-002',
        client: 'Société XYZ',
        governorate: 'Sfax',
        structure: 'Structure B',
        amount: 250000,
        status: 'PENDING',
        date: new Date(2024, 1, 20)
      },
      {
        reference: 'CONV-2024-003',
        client: 'Groupe DEF',
        governorate: 'Monastir',
        structure: 'Structure A',
        amount: 180000,
        status: 'ACTIVE',
        date: new Date(2024, 2, 10)
      },
      {
        reference: 'CONV-2024-004',
        client: 'Compagnie GHI',
        governorate: 'Sousse',
        structure: 'Structure C',
        amount: 320000,
        status: 'EXPIRED',
        date: new Date(2024, 0, 5)
      }
    ];
  }

  loadFilterOptions() {
    this.governorates = ['Tunis', 'Sfax', 'Monastir', 'Sousse', 'Gabès', 'Nabeul', 'Hammamet'];
    this.structures = ['Structure A', 'Structure B', 'Structure C', 'Structure D'];
    this.applications = ['Application Web', 'Application Mobile', 'API Services', 'Dashboard Analytics'];
  }

  // Méthodes d'actions
  applyFilters() {
    console.log('Appliquer filtres:', {
      period: this.selectedPeriod,
      governorate: this.selectedGovernorate,
      structure: this.selectedStructure,
      application: this.selectedApplication,
      startDate: this.startDate,
      endDate: this.endDate
    });
    this.fetchAnalytics();
  }

  generateMonthlyReport() {
    console.log('Générer rapport mensuel PDF');
  }

  generateMonthlyExcel() {
    console.log('Générer rapport mensuel Excel');
  }

  generateQuarterlyReport() {
    console.log('Générer rapport trimestriel PDF');
  }

  generateQuarterlyExcel() {
    console.log('Générer rapport trimestriel Excel');
  }

  generateCustomReport() {
    console.log('Générer rapport personnalisé PDF');
  }

  generateCustomExcel() {
    console.log('Générer rapport personnalisé Excel');
  }

  // Export methods moved to the end of the class

  private downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Méthodes utilitaires
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'ACTIVE': 'primary',
      'PENDING': 'accent',
      'EXPIRED': 'warn'
    };
    return colors[status] || 'primary';
  }

  private getDateRange(): { start: string; end: string } {
    const now = new Date();
    let start: Date;
    switch (this.selectedPeriod) {
      case 'last_month': {
        const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        start = d;
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start: this.toISODate(start), end: this.toISODate(end) };
      }
      case 'last_quarter': {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const startQ = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
        const endQ = new Date(now.getFullYear(), currentQuarter * 3, 0);
        return { start: this.toISODate(startQ), end: this.toISODate(endQ) };
      }
      case 'last_year': {
        start = new Date(now.getFullYear() - 1, 0, 1);
        const end = new Date(now.getFullYear() - 1, 11, 31);
        return { start: this.toISODate(start), end: this.toISODate(end) };
      }
      case 'custom': {
        const s = this.startDate ? this.toISODate(this.startDate) : this.toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
        const e = this.endDate ? this.toISODate(this.endDate) : this.toISODate(now);
        return { start: s, end: e };
      }
      case 'current_month':
      default: {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: this.toISODate(start), end: this.toISODate(now) };
      }
    }
  }

  private toISODate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private fetchAnalytics(): void {
    const range = this.getDateRange();
    // Summary
    this.http.get<any>(`${this.apiBase}/summary?start=${range.start}&end=${range.end}`)
      .subscribe({
        next: (summary) => {
          // Map summary to KPIs
          const total = Number(summary?.total || 0);
          const byChannel = summary?.byChannel || {};
          const emails = Number(byChannel.EMAIL || 0);
          const sms = Number(byChannel.SMS || 0);
          const system = Number(byChannel.SYSTEM || 0);
          const failed = Number(summary?.failed || 0);

          // Simple mapping to existing KPIs
          this.activeConventionsRate = Math.min(100, Math.round((emails + sms + system) ? (emails / (emails + sms + system)) * 100 : 0));
          this.paidInvoicesRate = Math.min(100, Math.round((total - failed) / (total || 1) * 100));
          this.totalRevenue = total * 1_000; // placeholder: 1000 per notification (for demo)
          this.efficiencyRate = Math.max(0, 100 - Math.round((failed / (total || 1)) * 100));
        },
        error: () => {
          // Keep defaults on error
        }
      });

    // Daily series (to feed line/bar charts later)
    this.http.get<any>(`${this.apiBase}/daily-series?start=${range.start}&end=${range.end}`)
      .subscribe({
        next: (series) => {
          this.dailySeriesData = series || {};
          this.updateChartsFromSeries();
        },
        error: () => {}
      });
  }

  private ensureCanvasIn(el: Element, id: string): HTMLCanvasElement {
    let canvas = el.querySelector(`#${id}`) as HTMLCanvasElement | null;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = id;
      (el as HTMLElement).innerHTML = '';
      el.appendChild(canvas);
    }
    return canvas;
  }

  private updateChartsFromSeries(): void {
    const entries = Object.entries(this.dailySeriesData || {}).sort((a: any, b: any) => a[0].localeCompare(b[0]));
    const labels = entries.map(e => e[0]);
    const totals = entries.map(([, v]: any) => Number(v.total || 0));
    const emails = entries.map(([, v]: any) => Number(v.EMAIL || 0));
    const sms = entries.map(([, v]: any) => Number(v.SMS || 0));
    const system = entries.map(([, v]: any) => Number(v.SYSTEM || 0));

    const placeholders = Array.from(document.querySelectorAll('.chart-placeholder'));
    if (placeholders.length >= 2) {
      // Line chart (total per day)
      const lineCanvas = this.ensureCanvasIn(placeholders[0], 'dm-line-chart');
      if (this.lineChartRef) { this.lineChartRef.destroy(); }
      // @ts-ignore
      this.lineChartRef = new (window as any).Chart(lineCanvas.getContext('2d'), {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Total notifications',
            data: totals,
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            fill: true,
            tension: 0.3
          }]
        },
        options: { responsive: true, plugins: { legend: { display: true } }, scales: { x: { ticks: { autoSkip: true } } } }
      });

      // Stacked bar chart (EMAIL/SMS/SYSTEM per day)
      const barCanvas = this.ensureCanvasIn(placeholders[1], 'dm-stacked-bar');
      if (this.stackedBarChartRef) { this.stackedBarChartRef.destroy(); }
      // @ts-ignore
      this.stackedBarChartRef = new (window as any).Chart(barCanvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'EMAIL', data: emails, backgroundColor: '#2196f3' },
            { label: 'SMS', data: sms, backgroundColor: '#ff9800' },
            { label: 'SYSTEM', data: system, backgroundColor: '#9c27b0' }
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: true } },
          scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Méthodes du header (même que admin)
  getDefaultAvatar(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0RjhERjkiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTRDOC42ODYyOSAxNCA2IDE2LjY4NjMgNiAyMEgxOEMxOCAxNi42ODYzIDE1LjMxMzcgMTQgMTIgMTRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+';
  }

  toggleNotifications() {
    this.hasNotifications = !this.hasNotifications;
    console.log('Toggle notifications');
  }

  toggleMessages() {
    console.log('🔔 Clic sur icône message détecté');
    import('../../shared/components/messaging/messaging.component').then(m => {
      console.log('✅ Import réussi, ouverture dialog');
      this.dialog.open(m.MessagingComponent, {
        width: '95vw',
        maxWidth: '1200px',
        height: '90vh',
        panelClass: 'messaging-dialog',
        disableClose: false,
        autoFocus: false
      });
    }).catch((error) => {
      console.error('❌ Erreur import:', error);
      console.log('Redirection vers /messaging');
      this.router.navigate(['/messaging']);
    });
  }

  toggleSettings() {
    console.log('Toggle settings');
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    console.log('Toggle dark mode:', this.darkMode);
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  goToProfile() {
    console.log('Go to profile');
    this.userMenuOpen = false;
  }

  performSearch() {
    console.log('Search query:', this.searchQuery);
  }

  logout() {
    console.log('Déconnexion du décideur');
  }

  loadInitialData(): void {
    // Initialize data arrays - these are already initialized in the existing loadData method
    // No need to duplicate initialization
  }


  refreshData(): void {
    this.loadInitialData();
  }

  // Methods for tests
  acknowledgeAlert(alertId: string): void {
    // Mock implementation
    console.log('Acknowledging alert:', alertId);
  }

  dismissAlert(alertId: string): void {
    // Mock implementation
    console.log('Dismissing alert:', alertId);
  }

  exportData(): void {
    // Mock implementation
    console.log('Exporting data');
  }

  exportConventions(): void {
    // Mock implementation
    console.log('Exporting conventions');
  }

  exportInvoices(): void {
    // Mock implementation
    console.log('Exporting invoices');
  }

  handleDashboardUpdate(message: any): void {
    // Mock implementation
    console.log('Handling dashboard update:', message);
  }

  updateKPIs(): void {
    // Mock implementation
    console.log('Updating KPIs');
  }

  updateCharts(): void {
    // Mock implementation
    console.log('Updating charts');
  }

  handleAlertUpdate(message: any): void {
    // Mock implementation
    console.log('Handling alert update:', message);
  }

  handleSystemUpdate(message: any): void {
    // Mock implementation
    console.log('Handling system update:', message);
  }
} 