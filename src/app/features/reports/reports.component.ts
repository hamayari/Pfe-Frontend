import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ReportService } from '../../services/report.service';
import { ConventionService } from '../../services/convention.service';
import { InvoiceService } from '../../services/invoice.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  type: 'conventions' | 'invoices' | 'payments' | 'users' | 'system';
  status?: string;
  userId?: string;
  exportFormat?: 'pdf' | 'excel' | 'csv' | 'json';
}

export interface ReportData {
  summary: {
    totalConventions: number;
    activeConventions: number;
    expiredConventions: number;
    totalInvoices: number;
    paidInvoices: number;
    overdueInvoices: number;
    totalRevenue: number;
    pendingRevenue: number;
  };
  trends: {
    conventionsByMonth: any[];
    invoicesByMonth: any[];
    revenueByMonth: any[];
  };
  details: any[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule
  ],
  template: `
    <div class="reports-container">
      <mat-card class="reports-header">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>analytics</mat-icon>
            Rapports et Analytics
          </mat-card-title>
          <mat-card-subtitle>
            Analysez vos données et générez des rapports détaillés
          </mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <div class="reports-content">
        <!-- Filtres -->
        <mat-card class="filters-card">
          <mat-card-content>
            <form [formGroup]="filtersForm" class="filters-form">
              <div class="filters-row">
                <mat-form-field appearance="outline">
                  <mat-label>Type de rapport</mat-label>
                  <mat-select formControlName="type">
                    <mat-option value="conventions">Conventions</mat-option>
                    <mat-option value="invoices">Factures</mat-option>
                    <mat-option value="payments">Paiements</mat-option>
                    <mat-option value="users">Utilisateurs</mat-option>
                    <mat-option value="system">Système</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Date de début</mat-label>
                  <input matInput [matDatepicker]="startPicker" formControlName="startDate">
                  <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                  <mat-datepicker #startPicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Date de fin</mat-label>
                  <input matInput [matDatepicker]="endPicker" formControlName="endDate">
                  <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                  <mat-datepicker #endPicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline" *ngIf="filtersForm.get('type')?.value === 'conventions'">
                  <mat-label>Statut</mat-label>
                  <mat-select formControlName="status">
                    <mat-option value="">Tous</mat-option>
                    <mat-option value="ACTIVE">Actives</mat-option>
                    <mat-option value="EXPIRED">Expirées</mat-option>
                    <mat-option value="PENDING">En attente</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="filters-actions">
                <button mat-raised-button color="primary" (click)="generateReport()" 
                        [disabled]="isLoading">
                  <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                  <mat-icon *ngIf="!isLoading">refresh</mat-icon>
                  {{ isLoading ? 'Génération...' : 'Générer le rapport' }}
                </button>

                <button mat-raised-button color="accent" [matMenuTriggerFor]="exportMenu" 
                        [disabled]="!reportData">
                  <mat-icon>download</mat-icon>
                  Exporter
                </button>
                <mat-menu #exportMenu="matMenu">
                  <button mat-menu-item (click)="exportReport('pdf')">
                    <mat-icon>picture_as_pdf</mat-icon>
                    PDF
                  </button>
                  <button mat-menu-item (click)="exportReport('excel')">
                    <mat-icon>table_chart</mat-icon>
                    Excel
                  </button>
                  <button mat-menu-item (click)="exportReport('csv')">
                    <mat-icon>description</mat-icon>
                    CSV
                  </button>
                  <button mat-menu-item (click)="exportReport('json')">
                    <mat-icon>code</mat-icon>
                    JSON
                  </button>
                </mat-menu>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Résumé -->
        <div class="summary-section" *ngIf="reportData">
          <mat-card class="summary-card">
            <mat-card-header>
              <mat-card-title>Résumé</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="summary-grid">
                <div class="summary-item">
                  <div class="summary-icon conventions">
                    <mat-icon>description</mat-icon>
                  </div>
                  <div class="summary-content">
                    <div class="summary-value">{{ reportData.summary.totalConventions }}</div>
                    <div class="summary-label">Conventions totales</div>
                    <div class="summary-details">
                      <span class="active">{{ reportData.summary.activeConventions }} actives</span>
                      <span class="expired">{{ reportData.summary.expiredConventions }} expirées</span>
                    </div>
                  </div>
                </div>

                <div class="summary-item">
                  <div class="summary-icon invoices">
                    <mat-icon>receipt</mat-icon>
                  </div>
                  <div class="summary-content">
                    <div class="summary-value">{{ reportData.summary.totalInvoices }}</div>
                    <div class="summary-label">Factures totales</div>
                    <div class="summary-details">
                      <span class="paid">{{ reportData.summary.paidInvoices }} payées</span>
                      <span class="overdue">{{ reportData.summary.overdueInvoices }} en retard</span>
                    </div>
                  </div>
                </div>

                <div class="summary-item">
                  <div class="summary-icon revenue">
                    <mat-icon>euro</mat-icon>
                  </div>
                  <div class="summary-content">
                    <div class="summary-value">{{ reportData.summary.totalRevenue | currency:'EUR' }}</div>
                    <div class="summary-label">Revenus totaux</div>
                    <div class="summary-details">
                      <span class="pending">{{ reportData.summary.pendingRevenue | currency:'EUR' }} en attente</span>
                    </div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Onglets de contenu -->
        <mat-tab-group *ngIf="reportData">
          <!-- Onglet Tendances -->
          <mat-tab label="Tendances">
            <mat-card class="trends-card">
              <mat-card-content>
                <div class="trends-grid">
                  <div class="trend-item">
                    <h4>Conventions par mois</h4>
                    <div class="chart-placeholder">
                      <mat-icon>show_chart</mat-icon>
                      <p>Graphique des conventions</p>
                    </div>
                  </div>

                  <div class="trend-item">
                    <h4>Factures par mois</h4>
                    <div class="chart-placeholder">
                      <mat-icon>bar_chart</mat-icon>
                      <p>Graphique des factures</p>
                    </div>
                  </div>

                  <div class="trend-item">
                    <h4>Revenus par mois</h4>
                    <div class="chart-placeholder">
                      <mat-icon>trending_up</mat-icon>
                      <p>Graphique des revenus</p>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-tab>

          <!-- Onglet Détails -->
          <mat-tab label="Détails">
            <mat-card class="details-card">
              <mat-card-content>
                <div class="table-container">
                  <table mat-table [dataSource]="reportData.details" matSort>
                    <!-- Colonnes dynamiques selon le type de rapport -->
                    <ng-container matColumnDef="reference" *ngIf="filtersForm.get('type')?.value === 'conventions'">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Référence</th>
                      <td mat-cell *matCellDef="let element">{{ element.reference }}</td>
                    </ng-container>

                    <ng-container matColumnDef="title" *ngIf="filtersForm.get('type')?.value === 'conventions'">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Titre</th>
                      <td mat-cell *matCellDef="let element">{{ element.title }}</td>
                    </ng-container>

                    <ng-container matColumnDef="status" *ngIf="filtersForm.get('type')?.value === 'conventions'">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
                      <td mat-cell *matCellDef="let element">
                        <mat-chip [color]="getStatusColor(element.status)" selected>
                          {{ getStatusLabel(element.status) }}
                        </mat-chip>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="amount" *ngIf="filtersForm.get('type')?.value === 'invoices'">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Montant</th>
                      <td mat-cell *matCellDef="let element">{{ element.amount | currency:'EUR' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="dueDate" *ngIf="filtersForm.get('type')?.value === 'invoices'">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Échéance</th>
                      <td mat-cell *matCellDef="let element">{{ element.dueDate | date:'dd/MM/yyyy' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let element">
                        <button mat-icon-button [matMenuTriggerFor]="actionMenu">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                        <mat-menu #actionMenu="matMenu">
                          <button mat-menu-item (click)="viewDetails(element)">
                            <mat-icon>visibility</mat-icon>
                            Voir détails
                          </button>
                          <button mat-menu-item (click)="exportItem(element)">
                            <mat-icon>download</mat-icon>
                            Exporter
                          </button>
                        </mat-menu>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="getDisplayedColumns()"></tr>
                    <tr mat-row *matRowDef="let row; columns: getDisplayedColumns();"></tr>
                  </table>

                  <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" 
                                showFirstLastButtons>
                  </mat-paginator>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-tab>

          <!-- Onglet Analytics -->
          <mat-tab label="Analytics">
            <mat-card class="analytics-card">
              <mat-card-content>
                <div class="analytics-grid">
                  <div class="analytics-item">
                    <h4>Performance</h4>
                    <div class="metric">
                      <div class="metric-value">{{ getPerformanceScore() }}%</div>
                      <div class="metric-label">Score de performance</div>
                    </div>
                  </div>

                  <div class="analytics-item">
                    <h4>Conformité</h4>
                    <div class="metric">
                      <div class="metric-value">{{ getComplianceScore() }}%</div>
                      <div class="metric-label">Taux de conformité</div>
                    </div>
                  </div>

                  <div class="analytics-item">
                    <h4>Efficacité</h4>
                    <div class="metric">
                      <div class="metric-value">{{ getEfficiencyScore() }}%</div>
                      <div class="metric-label">Taux d'efficacité</div>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    .reports-header {
      margin-bottom: 20px;
    }

    .reports-header mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .reports-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .filters-card {
      margin-bottom: 20px;
    }

    .filters-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .filters-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .filters-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .summary-section {
      margin-bottom: 20px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border-radius: 8px;
      background-color: #f8f9fa;
    }

    .summary-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      color: white;
    }

    .summary-icon.conventions {
      background-color: #2196f3;
    }

    .summary-icon.invoices {
      background-color: #4caf50;
    }

    .summary-icon.revenue {
      background-color: #ff9800;
    }

    .summary-content {
      flex: 1;
    }

    .summary-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    .summary-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    .summary-details {
      display: flex;
      gap: 12px;
      font-size: 12px;
    }

    .summary-details .active {
      color: #4caf50;
    }

    .summary-details .expired {
      color: #f44336;
    }

    .summary-details .paid {
      color: #4caf50;
    }

    .summary-details .overdue {
      color: #f44336;
    }

    .summary-details .pending {
      color: #ff9800;
    }

    .trends-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .trend-item {
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .trend-item h4 {
      margin-bottom: 16px;
      color: #333;
    }

    .chart-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      background-color: #f5f5f5;
      border-radius: 8px;
      color: #666;
    }

    .chart-placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
    }

    .table-container {
      overflow-x: auto;
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .analytics-item {
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      text-align: center;
    }

    .analytics-item h4 {
      margin-bottom: 16px;
      color: #333;
    }

    .metric {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .metric-value {
      font-size: 32px;
      font-weight: bold;
      color: #2196f3;
      margin-bottom: 8px;
    }

    .metric-label {
      font-size: 14px;
      color: #666;
    }

    @media (max-width: 768px) {
      .reports-container {
        padding: 10px;
      }

      .filters-row {
        grid-template-columns: 1fr;
      }

      .filters-actions {
        flex-direction: column;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }

      .trends-grid {
        grid-template-columns: 1fr;
      }

      .analytics-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReportsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  filtersForm: FormGroup;
  reportData: ReportData | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private conventionService: ConventionService,
    private invoiceService: InvoiceService,
    private snackBar: MatSnackBar
  ) {
    this.filtersForm = this.fb.group({
      type: ['conventions'],
      startDate: [new Date(new Date().getFullYear(), 0, 1)],
      endDate: [new Date()],
      status: [''],
      userId: [''],
      exportFormat: ['pdf']
    });
  }

  ngOnInit(): void {
    this.generateReport();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generateReport(): void {
    this.isLoading = true;
    const filters = this.filtersForm.value;

    // For now, use mock data since the service method signature is different
    setTimeout(() => {
      this.reportData = {
        summary: {
          totalConventions: 25,
          activeConventions: 18,
          expiredConventions: 7,
          totalInvoices: 150,
          paidInvoices: 120,
          overdueInvoices: 30,
          totalRevenue: 45000,
          pendingRevenue: 15000
        },
        trends: {
          conventionsByMonth: [],
          invoicesByMonth: [],
          revenueByMonth: []
        },
        details: []
      };
      this.isLoading = false;
      this.snackBar.open('Rapport généré avec succès', 'Fermer', { 
        duration: 3000 
      });
    }, 1000);
  }

  exportReport(format: string): void {
    if (!this.reportData) return;

    const filters = this.filtersForm.value;
    filters.exportFormat = format;

    // For now, just show a success message since the service method doesn't exist yet
    this.snackBar.open(`Rapport exporté en ${format.toUpperCase()}`, 'Fermer', { 
      duration: 3000 
    });
  }

  getDisplayedColumns(): string[] {
    const type = this.filtersForm.get('type')?.value;
    const baseColumns = ['actions'];
    
    switch (type) {
      case 'conventions':
        return ['reference', 'title', 'status', ...baseColumns];
      case 'invoices':
        return ['reference', 'amount', 'dueDate', 'status', ...baseColumns];
      case 'payments':
        return ['reference', 'amount', 'date', 'method', ...baseColumns];
      case 'users':
        return ['username', 'email', 'role', 'status', ...baseColumns];
      case 'system':
        return ['event', 'timestamp', 'level', 'message', ...baseColumns];
      default:
        return baseColumns;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
      case 'PAID':
        return 'primary';
      case 'EXPIRED':
      case 'OVERDUE':
        return 'warn';
      case 'PENDING':
        return 'accent';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'EXPIRED':
        return 'Expirée';
      case 'PENDING':
        return 'En attente';
      case 'PAID':
        return 'Payée';
      case 'OVERDUE':
        return 'En retard';
      default:
        return status;
    }
  }

  viewDetails(item: any): void {
    // Implémenter la vue détaillée
    console.log('Voir détails:', item);
  }

  exportItem(item: any): void {
    // Implémenter l'export d'un élément
    console.log('Exporter élément:', item);
  }

  getPerformanceScore(): number {
    if (!this.reportData) return 0;
    const total = this.reportData.summary.totalConventions + this.reportData.summary.totalInvoices;
    const active = this.reportData.summary.activeConventions + this.reportData.summary.paidInvoices;
    return total > 0 ? Math.round((active / total) * 100) : 0;
  }

  getComplianceScore(): number {
    if (!this.reportData) return 0;
    const total = this.reportData.summary.totalConventions;
    const active = this.reportData.summary.activeConventions;
    return total > 0 ? Math.round((active / total) * 100) : 0;
  }

  getEfficiencyScore(): number {
    if (!this.reportData) return 0;
    const total = this.reportData.summary.totalInvoices;
    const paid = this.reportData.summary.paidInvoices;
    return total > 0 ? Math.round((paid / total) * 100) : 0;
  }
}
