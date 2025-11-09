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
import { AuthService } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router';
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

      <!-- KPI Temps Réel avec Jauges -->
      <div class="kpi-realtime-section">
        <mat-card class="realtime-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>speed</mat-icon>
              KPI Temps Réel - Suivi Automatique
            </mat-card-title>
            <button mat-icon-button (click)="refreshKpis()" [disabled]="loadingKpis">
              <mat-icon [class.spinning]="loadingKpis">refresh</mat-icon>
            </button>
          </mat-card-header>
          <mat-card-content>
            <div class="realtime-kpi-grid">
              <!-- KPI 1: Taux de Recouvrement -->
              <div class="realtime-kpi-card" [class.critical]="realtimeKpis.tauxRecouvrement?.status === 'critical'"
                   [class.warning]="realtimeKpis.tauxRecouvrement?.status === 'warning'">
                <div class="kpi-header">
                  <mat-icon>trending_up</mat-icon>
                  <h4>Taux de Recouvrement</h4>
                </div>
                <div class="gauge-container">
                  <canvas [id]="'gauge-recouvrement'"></canvas>
                </div>
                <div class="kpi-footer">
                  <span class="value">{{ realtimeKpis.tauxRecouvrement?.value || 0 }}%</span>
                  <span class="trend" [class.positive]="realtimeKpis.tauxRecouvrement?.trend >= 0"
                        [class.negative]="realtimeKpis.tauxRecouvrement?.trend < 0">
                    <mat-icon>{{ realtimeKpis.tauxRecouvrement?.trend >= 0 ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                    {{ realtimeKpis.tauxRecouvrement?.trend | number:'1.1-1' }}%
                  </span>
                </div>
              </div>

              <!-- KPI 2: Délai Moyen Paiement -->
              <div class="realtime-kpi-card" [class.critical]="realtimeKpis.delaiMoyenPaiement?.status === 'critical'"
                   [class.warning]="realtimeKpis.delaiMoyenPaiement?.status === 'warning'">
                <div class="kpi-header">
                  <mat-icon>schedule</mat-icon>
                  <h4>Délai Moyen Paiement</h4>
                </div>
                <div class="gauge-container">
                  <canvas [id]="'gauge-delai'"></canvas>
                </div>
                <div class="kpi-footer">
                  <span class="value">{{ realtimeKpis.delaiMoyenPaiement?.value || 0 }} jours</span>
                  <span class="trend" [class.positive]="realtimeKpis.delaiMoyenPaiement?.trend <= 0"
                        [class.negative]="realtimeKpis.delaiMoyenPaiement?.trend > 0">
                    <mat-icon>{{ realtimeKpis.delaiMoyenPaiement?.trend <= 0 ? 'arrow_downward' : 'arrow_upward' }}</mat-icon>
                    {{ realtimeKpis.delaiMoyenPaiement?.trend | number:'1.1-1' }}%
                  </span>
                </div>
              </div>

              <!-- KPI 3: Factures en Retard -->
              <div class="realtime-kpi-card" [class.critical]="realtimeKpis.tauxFacturesRetard?.status === 'critical'"
                   [class.warning]="realtimeKpis.tauxFacturesRetard?.status === 'warning'">
                <div class="kpi-header">
                  <mat-icon>warning</mat-icon>
                  <h4>Factures en Retard</h4>
                </div>
                <div class="gauge-container">
                  <canvas [id]="'gauge-retard'"></canvas>
                </div>
                <div class="kpi-footer">
                  <span class="value">{{ realtimeKpis.tauxFacturesRetard?.value || 0 }}%</span>
                  <span class="trend" [class.positive]="realtimeKpis.tauxFacturesRetard?.trend <= 0"
                        [class.negative]="realtimeKpis.tauxFacturesRetard?.trend > 0">
                    <mat-icon>{{ realtimeKpis.tauxFacturesRetard?.trend <= 0 ? 'arrow_downward' : 'arrow_upward' }}</mat-icon>
                    {{ realtimeKpis.tauxFacturesRetard?.trend | number:'1.1-1' }}%
                  </span>
                </div>
              </div>

              <!-- KPI 4: Montant Impayés -->
              <div class="realtime-kpi-card" [class.critical]="realtimeKpis.montantTotalImpayes?.status === 'critical'"
                   [class.warning]="realtimeKpis.montantTotalImpayes?.status === 'warning'">
                <div class="kpi-header">
                  <mat-icon>attach_money</mat-icon>
                  <h4>Montant Impayés</h4>
                </div>
                <div class="gauge-container">
                  <canvas [id]="'gauge-impayes'"></canvas>
                </div>
                <div class="kpi-footer">
                  <span class="value">{{ realtimeKpis.montantTotalImpayes?.value || 0 | number:'1.0-0' }} TND</span>
                  <span class="trend" [class.positive]="realtimeKpis.montantTotalImpayes?.trend <= 0"
                        [class.negative]="realtimeKpis.montantTotalImpayes?.trend > 0">
                    <mat-icon>{{ realtimeKpis.montantTotalImpayes?.trend <= 0 ? 'arrow_downward' : 'arrow_upward' }}</mat-icon>
                    {{ realtimeKpis.montantTotalImpayes?.trend | number:'1.1-1' }}%
                  </span>
                </div>
              </div>

              <!-- KPI 5: Clients en Retard -->
              <div class="realtime-kpi-card" [class.critical]="realtimeKpis.nombreClientsRetard?.status === 'critical'"
                   [class.warning]="realtimeKpis.nombreClientsRetard?.status === 'warning'">
                <div class="kpi-header">
                  <mat-icon>people</mat-icon>
                  <h4>Clients en Retard</h4>
                </div>
                <div class="gauge-container">
                  <canvas [id]="'gauge-clients'"></canvas>
                </div>
                <div class="kpi-footer">
                  <span class="value">{{ realtimeKpis.nombreClientsRetard?.value || 0 }} clients</span>
                  <span class="trend" [class.positive]="realtimeKpis.nombreClientsRetard?.trend <= 0"
                        [class.negative]="realtimeKpis.nombreClientsRetard?.trend > 0">
                    <mat-icon>{{ realtimeKpis.nombreClientsRetard?.trend <= 0 ? 'arrow_downward' : 'arrow_upward' }}</mat-icon>
                    {{ realtimeKpis.nombreClientsRetard?.trend | number:'1.1-1' }}%
                  </span>
                </div>
              </div>
            </div>

            <!-- Dernière mise à jour -->
            <div class="last-update">
              <mat-icon>access_time</mat-icon>
              <span>Dernière mise à jour: {{ lastKpiUpdate | date:'short' }}</span>
              <span class="auto-refresh">Rafraîchissement automatique toutes les 30s</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Graphiques dynamiques AMÉLIORÉS -->
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
                <canvas id="conventionsChart"></canvas>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Tendances Revenus AMÉLIORÉ -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Tendances des Revenus</mat-card-title>
              <mat-card-subtitle>Évolution mensuelle</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container">
                <canvas id="revenueChart"></canvas>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="chart-row">
          <!-- Répartition par gouvernorat -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Répartition par gouvernorat</mat-card-title>
              <mat-card-subtitle>Conventions actives</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container">
                <canvas id="governorateChart"></canvas>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Analyse Comparative AMÉLIORÉ -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Analyse Comparative</mat-card-title>
              <mat-card-subtitle>Performance par période</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container">
                <canvas id="comparativeChart"></canvas>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Section Analyse Comparative Détaillée -->
        <mat-card class="comparative-analysis-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>compare_arrows</mat-icon>
              Analyse Comparative Détaillée
            </mat-card-title>
            <div class="header-actions">
              <mat-form-field appearance="outline" class="period-selector">
                <mat-label>Comparer avec</mat-label>
                <mat-select [(ngModel)]="comparativePeriod" (selectionChange)="updateComparativeAnalysis()">
                  <mat-option value="previous-month">Mois précédent</mat-option>
                  <mat-option value="previous-quarter">Trimestre précédent</mat-option>
                  <mat-option value="previous-year">Année précédente</mat-option>
                  <mat-option value="same-month-last-year">Même mois année dernière</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="comparative-grid">
              <div class="comparative-item">
                <div class="comparative-header">
                  <mat-icon>trending_up</mat-icon>
                  <h3>Conventions</h3>
                </div>
                <div class="comparative-values">
                  <div class="current-value">
                    <span class="label">Période actuelle</span>
                    <span class="value">{{ comparativeData.conventions.current }}</span>
                  </div>
                  <div class="comparison-arrow" [class.positive]="comparativeData.conventions.change > 0" [class.negative]="comparativeData.conventions.change < 0">
                    <mat-icon>{{ comparativeData.conventions.change > 0 ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                    <span>{{ Math.abs(comparativeData.conventions.change) }}%</span>
                  </div>
                  <div class="previous-value">
                    <span class="label">Période précédente</span>
                    <span class="value">{{ comparativeData.conventions.previous }}</span>
                  </div>
                </div>
              </div>

              <div class="comparative-item">
                <div class="comparative-header">
                  <mat-icon>attach_money</mat-icon>
                  <h3>Revenus</h3>
                </div>
                <div class="comparative-values">
                  <div class="current-value">
                    <span class="label">Période actuelle</span>
                    <span class="value">{{ comparativeData.revenue.current | number:'1.0-0' }} TND</span>
                  </div>
                  <div class="comparison-arrow" [class.positive]="comparativeData.revenue.change > 0" [class.negative]="comparativeData.revenue.change < 0">
                    <mat-icon>{{ comparativeData.revenue.change > 0 ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                    <span>{{ Math.abs(comparativeData.revenue.change) }}%</span>
                  </div>
                  <div class="previous-value">
                    <span class="label">Période précédente</span>
                    <span class="value">{{ comparativeData.revenue.previous | number:'1.0-0' }} TND</span>
                  </div>
                </div>
              </div>

              <div class="comparative-item">
                <div class="comparative-header">
                  <mat-icon>receipt</mat-icon>
                  <h3>Factures Payées</h3>
                </div>
                <div class="comparative-values">
                  <div class="current-value">
                    <span class="label">Période actuelle</span>
                    <span class="value">{{ comparativeData.invoices.current }}%</span>
                  </div>
                  <div class="comparison-arrow" [class.positive]="comparativeData.invoices.change > 0" [class.negative]="comparativeData.invoices.change < 0">
                    <mat-icon>{{ comparativeData.invoices.change > 0 ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                    <span>{{ Math.abs(comparativeData.invoices.change) }}%</span>
                  </div>
                  <div class="previous-value">
                    <span class="label">Période précédente</span>
                    <span class="value">{{ comparativeData.invoices.previous }}%</span>
                  </div>
                </div>
              </div>

              <div class="comparative-item">
                <div class="comparative-header">
                  <mat-icon>speed</mat-icon>
                  <h3>Efficacité</h3>
                </div>
                <div class="comparative-values">
                  <div class="current-value">
                    <span class="label">Période actuelle</span>
                    <span class="value">{{ comparativeData.efficiency.current }}%</span>
                  </div>
                  <div class="comparison-arrow" [class.positive]="comparativeData.efficiency.change > 0" [class.negative]="comparativeData.efficiency.change < 0">
                    <mat-icon>{{ comparativeData.efficiency.change > 0 ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                    <span>{{ Math.abs(comparativeData.efficiency.change) }}%</span>
                  </div>
                  <div class="previous-value">
                    <span class="label">Période précédente</span>
                    <span class="value">{{ comparativeData.efficiency.previous }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
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
                <h4>Rapport personnalisé AMÉLIORÉ</h4>
                <p>Créez votre rapport sur mesure</p>
                <div class="custom-report-config">
                  <mat-form-field appearance="outline" class="config-field">
                    <mat-label>Période</mat-label>
                    <mat-select [(ngModel)]="customReportConfig.period">
                      <mat-option value="this-month">Ce mois</mat-option>
                      <mat-option value="last-month">Mois dernier</mat-option>
                      <mat-option value="this-quarter">Ce trimestre</mat-option>
                      <mat-option value="this-year">Cette année</mat-option>
                      <mat-option value="custom">Personnalisé</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="config-field">
                    <mat-label>Métriques à inclure</mat-label>
                    <mat-select [(ngModel)]="customReportConfig.metrics" multiple>
                      <mat-option value="conventions">Conventions</mat-option>
                      <mat-option value="revenue">Revenus</mat-option>
                      <mat-option value="invoices">Factures</mat-option>
                      <mat-option value="efficiency">Efficacité</mat-option>
                      <mat-option value="governorate">Par gouvernorat</mat-option>
                      <mat-option value="trends">Tendances</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="config-field">
                    <mat-label>Format graphiques</mat-label>
                    <mat-select [(ngModel)]="customReportConfig.chartType">
                      <mat-option value="all">Tous</mat-option>
                      <mat-option value="line">Lignes uniquement</mat-option>
                      <mat-option value="bar">Barres uniquement</mat-option>
                      <mat-option value="pie">Camemberts uniquement</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
                <div class="export-actions">
                  <button mat-raised-button color="primary" (click)="generateCustomReport()">
                    <mat-icon>picture_as_pdf</mat-icon>
                    Export PDF
                  </button>
                  <button mat-raised-button color="accent" (click)="generateCustomExcel()">
                    <mat-icon>table_chart</mat-icon>
                    Export Excel
                  </button>
                  <button mat-raised-button (click)="previewCustomReport()">
                    <mat-icon>visibility</mat-icon>
                    Aperçu
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
  kpiAlertsCount = 0;
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

  // KPI Temps Réel
  realtimeKpis: any = {
    tauxRecouvrement: { value: 0, trend: 0, status: 'normal' },
    delaiMoyenPaiement: { value: 0, trend: 0, status: 'normal' },
    tauxFacturesRetard: { value: 0, trend: 0, status: 'normal' },
    montantTotalImpayes: { value: 0, trend: 0, status: 'normal' },
    nombreClientsRetard: { value: 0, trend: 0, status: 'normal' }
  };
  loadingKpis = false;
  lastKpiUpdate: Date = new Date();
  private kpiRefreshInterval: any;
  private gaugeCharts: any = {};

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
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.loadKpiAlertsCount();
  }

  /**
   * Charger le nombre d'alertes KPI en attente
   */
  loadKpiAlertsCount() {
    const token = localStorage.getItem('token');
    this.http.get<any>('http://localhost:8085/api/kpi-alerts/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.kpiAlertsCount = response.stats?.pending || 0;
      },
      error: (error) => {
        console.error('Erreur chargement compteur alertes KPI:', error);
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeCharts();
    }, 500);
  }

  loadDashboardData() {
    this.loadKPIs();
    this.loadDetailedData();
    this.loadFilterOptions();
    this.fetchAnalytics();
  }

  // Données pour l'analyse comparative
  Math = Math;
  comparativePeriod = 'previous-month';
  comparativeData = {
    conventions: { current: 45, previous: 38, change: 18.4 },
    revenue: { current: 168000, previous: 152000, change: 10.5 },
    invoices: { current: 82, previous: 78, change: 5.1 },
    efficiency: { current: 87, previous: 85, change: 2.4 }
  };

  /**
   * Initialiser tous les graphiques
   */
  initializeCharts(): void {
    this.createConventionsChart();
    this.createRevenueChart();
    this.createGovernorateChart();
    this.createComparativeChart();
  }

  /**
   * Mettre à jour l'analyse comparative
   */
  updateComparativeAnalysis(): void {
    // Simuler le changement de données selon la période
    switch (this.comparativePeriod) {
      case 'previous-month':
        this.comparativeData = {
          conventions: { current: 45, previous: 38, change: 18.4 },
          revenue: { current: 168000, previous: 152000, change: 10.5 },
          invoices: { current: 82, previous: 78, change: 5.1 },
          efficiency: { current: 87, previous: 85, change: 2.4 }
        };
        break;
      case 'previous-quarter':
        this.comparativeData = {
          conventions: { current: 125, previous: 105, change: 19.0 },
          revenue: { current: 485000, previous: 420000, change: 15.5 },
          invoices: { current: 85, previous: 75, change: 13.3 },
          efficiency: { current: 88, previous: 82, change: 7.3 }
        };
        break;
      case 'previous-year':
        this.comparativeData = {
          conventions: { current: 520, previous: 445, change: 16.9 },
          revenue: { current: 1850000, previous: 1520000, change: 21.7 },
          invoices: { current: 84, previous: 72, change: 16.7 },
          efficiency: { current: 89, previous: 78, change: 14.1 }
        };
        break;
      case 'same-month-last-year':
        this.comparativeData = {
          conventions: { current: 45, previous: 35, change: 28.6 },
          revenue: { current: 168000, previous: 128000, change: 31.3 },
          invoices: { current: 82, previous: 68, change: 20.6 },
          efficiency: { current: 87, previous: 75, change: 16.0 }
        };
        break;
    }
    
    // Mettre à jour le graphique comparatif
    this.createComparativeChart();
  }

  /**
   * Créer le graphique comparatif
   */
  createComparativeChart(): void {
    const canvas = document.getElementById('comparativeChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    new (window as any).Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Conventions', 'Revenus', 'Factures Payées', 'Efficacité'],
        datasets: [
          {
            label: 'Période actuelle',
            data: [
              this.comparativeData.conventions.current,
              this.comparativeData.revenue.current / 2000, // Normaliser
              this.comparativeData.invoices.current,
              this.comparativeData.efficiency.current
            ],
            backgroundColor: 'rgba(33, 150, 243, 0.2)',
            borderColor: '#2196f3',
            borderWidth: 2
          },
          {
            label: 'Période précédente',
            data: [
              this.comparativeData.conventions.previous,
              this.comparativeData.revenue.previous / 2000, // Normaliser
              this.comparativeData.invoices.previous,
              this.comparativeData.efficiency.previous
            ],
            backgroundColor: 'rgba(255, 152, 0, 0.2)',
            borderColor: '#ff9800',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            ticks: {
              stepSize: 20
            }
          }
        }
      }
    });
  }

  /**
   * Créer le graphique d'évolution des conventions
   */
  createConventionsChart(): void {
    const canvas = document.getElementById('conventionsChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    new (window as any).Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
        datasets: [{
          label: 'Conventions signées',
          data: [12, 19, 15, 25, 22, 30, 28, 35, 32, 38, 42, 45],
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value: any) => value + ' conventions'
            }
          }
        }
      }
    });
  }

  /**
   * Créer le graphique des tendances de revenus
   */
  createRevenueChart(): void {
    const canvas = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    new (window as any).Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
        datasets: [
          {
            label: 'Revenus réalisés',
            data: [85000, 92000, 78000, 105000, 98000, 125000, 118000, 135000, 128000, 145000, 152000, 168000],
            backgroundColor: '#2196f3',
            borderColor: '#1976d2',
            borderWidth: 1
          },
          {
            label: 'Objectifs',
            data: [80000, 85000, 90000, 95000, 100000, 110000, 115000, 120000, 130000, 140000, 150000, 160000],
            backgroundColor: 'rgba(255, 152, 0, 0.5)',
            borderColor: '#ff9800',
            borderWidth: 1,
            type: 'line',
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context: any) => {
                return context.dataset.label + ': ' + context.parsed.y.toLocaleString() + ' TND';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value: any) => value.toLocaleString() + ' TND'
            }
          }
        }
      }
    });
  }

  /**
   * Créer le graphique de répartition par gouvernorat
   */
  createGovernorateChart(): void {
    const canvas = document.getElementById('governorateChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    new (window as any).Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Tunis', 'Sfax', 'Sousse', 'Monastir', 'Nabeul', 'Autres'],
        datasets: [{
          data: [35, 25, 15, 12, 8, 5],
          backgroundColor: [
            '#4caf50',
            '#2196f3',
            '#ff9800',
            '#9c27b0',
            '#f44336',
            '#607d8b'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right'
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return label + ': ' + value + ' (' + percentage + '%)';
              }
            }
          }
        }
      }
    });
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

  // Configuration du rapport personnalisé
  customReportConfig = {
    period: 'this-month',
    metrics: ['conventions', 'revenue', 'invoices'],
    chartType: 'all'
  };

  /**
   * Générer un rapport personnalisé PDF
   */
  generateCustomReport() {
    console.log('📄 Génération rapport personnalisé PDF avec config:', this.customReportConfig);
    
    // Simuler la génération
    const config = this.customReportConfig;
    const metricsText = config.metrics.join(', ');
    
    alert(`Rapport personnalisé généré !\n\nPériode: ${config.period}\nMétriques: ${metricsText}\nGraphiques: ${config.chartType}\n\nLe PDF sera téléchargé...`);
    
    // Appel API réel (à décommenter quand le backend est prêt)
    // this.http.post('http://localhost:8085/api/decision-maker/reports/custom/pdf', config)
    //   .subscribe(response => {
    //     // Télécharger le PDF
    //   });
  }

  /**
   * Générer un rapport personnalisé Excel
   */
  generateCustomExcel() {
    console.log('📊 Génération rapport personnalisé Excel avec config:', this.customReportConfig);
    
    const config = this.customReportConfig;
    const metricsText = config.metrics.join(', ');
    
    alert(`Rapport Excel personnalisé généré !\n\nPériode: ${config.period}\nMétriques: ${metricsText}\n\nLe fichier Excel sera téléchargé...`);
    
    // Appel API réel
    // this.http.post('http://localhost:8085/api/decision-maker/reports/custom/excel', config)
    //   .subscribe(response => {
    //     // Télécharger l'Excel
    //   });
  }

  /**
   * Prévisualiser le rapport personnalisé
   */
  previewCustomReport() {
    console.log('👁️ Aperçu rapport personnalisé:', this.customReportConfig);
    
    const config = this.customReportConfig;
    let preview = '📊 APERÇU DU RAPPORT PERSONNALISÉ\n\n';
    preview += `Période: ${config.period}\n\n`;
    preview += 'Métriques incluses:\n';
    
    config.metrics.forEach(metric => {
      switch(metric) {
        case 'conventions':
          preview += '✓ Conventions: 45 actives\n';
          break;
        case 'revenue':
          preview += '✓ Revenus: 168,000 TND\n';
          break;
        case 'invoices':
          preview += '✓ Factures: 82% payées\n';
          break;
        case 'efficiency':
          preview += '✓ Efficacité: 87%\n';
          break;
        case 'governorate':
          preview += '✓ Répartition géographique incluse\n';
          break;
        case 'trends':
          preview += '✓ Analyse des tendances incluse\n';
          break;
      }
    });
    
    preview += `\nFormat graphiques: ${config.chartType}`;
    
    alert(preview);
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
    if (this.kpiRefreshInterval) {
      clearInterval(this.kpiRefreshInterval);
    }
  }

  /**
   * Charger les KPI temps réel
   */
  loadRealtimeKpis() {
    this.loadingKpis = true;
    const token = localStorage.getItem('token');
    
    this.http.get<any>('http://localhost:8085/api/kpi-alerts/current-kpis', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.updateRealtimeKpis(response);
        this.lastKpiUpdate = new Date();
        this.loadingKpis = false;
        
        // Créer/mettre à jour les jauges
        setTimeout(() => this.createGaugeCharts(), 100);
      },
      error: (error) => {
        console.error('Erreur chargement KPI temps réel:', error);
        this.loadingKpis = false;
      }
    });
  }

  /**
   * Mettre à jour les données KPI
   */
  updateRealtimeKpis(data: any) {
    // Taux de Recouvrement
    this.realtimeKpis.tauxRecouvrement = {
      value: data.tauxRecouvrement || 0,
      trend: this.calculateTrend(data.tauxRecouvrement, data.tauxRecouvrementPrevious),
      status: this.getKpiStatus(data.tauxRecouvrement, 85, 70, false)
    };

    // Délai Moyen Paiement
    this.realtimeKpis.delaiMoyenPaiement = {
      value: data.delaiMoyenPaiement || 0,
      trend: this.calculateTrend(data.delaiMoyenPaiement, data.delaiMoyenPaiementPrevious),
      status: this.getKpiStatus(data.delaiMoyenPaiement, 30, 45, true)
    };

    // Taux Factures en Retard
    this.realtimeKpis.tauxFacturesRetard = {
      value: data.tauxFacturesRetard || 0,
      trend: this.calculateTrend(data.tauxFacturesRetard, data.tauxFacturesRetardPrevious),
      status: this.getKpiStatus(data.tauxFacturesRetard, 10, 15, true)
    };

    // Montant Total Impayés
    this.realtimeKpis.montantTotalImpayes = {
      value: data.montantTotalImpayes || 0,
      trend: this.calculateTrend(data.montantTotalImpayes, data.montantTotalImpayesPrevious),
      status: this.getKpiStatus(data.montantTotalImpayes, 50000, 100000, true)
    };

    // Nombre Clients en Retard
    this.realtimeKpis.nombreClientsRetard = {
      value: data.nombreClientsRetard || 0,
      trend: this.calculateTrend(data.nombreClientsRetard, data.nombreClientsRetardPrevious),
      status: this.getKpiStatus(data.nombreClientsRetard, 5, 10, true)
    };
  }

  /**
   * Calculer la tendance (pourcentage de changement)
   */
  calculateTrend(current: number, previous: number): number {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Déterminer le statut d'un KPI
   */
  getKpiStatus(value: number, warningThreshold: number, criticalThreshold: number, inverse: boolean): string {
    if (inverse) {
      if (value >= criticalThreshold) return 'critical';
      if (value >= warningThreshold) return 'warning';
      return 'normal';
    } else {
      if (value <= criticalThreshold) return 'critical';
      if (value <= warningThreshold) return 'warning';
      return 'normal';
    }
  }

  /**
   * Créer les graphiques en jauge
   */
  createGaugeCharts() {
    this.createGaugeChart('gauge-recouvrement', this.realtimeKpis.tauxRecouvrement.value, 100, '%');
    this.createGaugeChart('gauge-delai', this.realtimeKpis.delaiMoyenPaiement.value, 60, 'j');
    this.createGaugeChart('gauge-retard', this.realtimeKpis.tauxFacturesRetard.value, 30, '%');
    this.createGaugeChart('gauge-impayes', this.realtimeKpis.montantTotalImpayes.value, 150000, 'TND');
    this.createGaugeChart('gauge-clients', this.realtimeKpis.nombreClientsRetard.value, 20, '');
  }

  /**
   * Créer un graphique en jauge
   */
  createGaugeChart(canvasId: string, value: number, max: number, unit: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;

    // Détruire le graphique existant
    if (this.gaugeCharts[canvasId]) {
      this.gaugeCharts[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const percentage = (value / max) * 100;
    const color = percentage >= 70 ? '#4caf50' : percentage >= 40 ? '#ff9800' : '#f44336';

    this.gaugeCharts[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [value, max - value],
          backgroundColor: [color, '#e0e0e0'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '75%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });
  }

  /**
   * Rafraîchir manuellement les KPI
   */
  refreshKpis() {
    this.loadRealtimeKpis();
  }

  /**
   * Démarrer le rafraîchissement automatique
   */
  startKpiAutoRefresh() {
    this.kpiRefreshInterval = setInterval(() => {
      this.loadRealtimeKpis();
    }, 30000); // Toutes les 30 secondes
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
    console.log('🔔 Clic sur icône message - Navigation vers /messaging');
    this.router.navigate(['/messaging']);
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
    console.log('Navigation vers le profil');
    this.userMenuOpen = false;
    this.router.navigate(['/profile']);
  }

  performSearch() {
    console.log('Search query:', this.searchQuery);
  }

  logout() {
    console.log('🚪 Déconnexion du décideur...');
    this.authService.logout();
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