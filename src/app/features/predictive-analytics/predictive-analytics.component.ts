import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface PredictiveData {
  month: string;
  predicted: number;
  actual?: number;
  confidence: number;
}

interface Forecast {
  revenue: PredictiveData[];
  conventions: PredictiveData[];
  payments: PredictiveData[];
}

@Component({
  selector: 'app-predictive-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './predictive-analytics.component.html',
  styleUrls: ['./predictive-analytics.component.scss']
})
export class PredictiveAnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('revenueChart') revenueChartRef!: ElementRef;
  @ViewChild('conventionsChart') conventionsChartRef!: ElementRef;
  @ViewChild('paymentsChart') paymentsChartRef!: ElementRef;
  @ViewChild('trendChart') trendChartRef!: ElementRef;

  loading = false;
  forecastMonths = 6;
  selectedModel = 'linear';
  
  forecast: Forecast = {
    revenue: [],
    conventions: [],
    payments: []
  };

  // Charts
  private revenueChart: Chart | null = null;
  private conventionsChart: Chart | null = null;
  private paymentsChart: Chart | null = null;
  private trendChart: Chart | null = null;

  // Models disponibles
  models = [
    { value: 'linear', label: 'Régression Linéaire', icon: 'show_chart' },
    { value: 'exponential', label: 'Croissance Exponentielle', icon: 'trending_up' },
    { value: 'moving_average', label: 'Moyenne Mobile', icon: 'timeline' }
  ];

  // Périodes de prévision
  periods = [3, 6, 12, 24];

  // KPIs prédictifs
  predictiveKPIs = {
    nextMonthRevenue: 0,
    growthRate: 0,
    riskLevel: 'low',
    confidence: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPredictiveData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  /**
   * Charger les données prédictives
   */
  loadPredictiveData(): void {
    this.loading = true;
    
    const apiUrl = `http://localhost:8085/api/decision-maker/dashboard/predictive-analytics?forecastMonths=${this.forecastMonths}`;
    
    this.http.get<any>(apiUrl).subscribe({
      next: (data) => {
        this.processPredictiveData(data);
        this.updateCharts();
        this.loading = false;
      },
      error: () => {
        // Utiliser des données simulées si l'API échoue
        this.generateMockData();
        this.updateCharts();
        this.loading = false;
      }
    });
  }

  /**
   * Traiter les données prédictives
   */
  processPredictiveData(data: any): void {
    this.forecast = data.forecast || this.generateMockData();
    this.predictiveKPIs = data.kpis || this.calculateKPIs();
  }

  /**
   * Générer des données simulées
   */
  generateMockData(): Forecast {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentMonth = new Date().getMonth();
    
    const revenue: PredictiveData[] = [];
    const conventions: PredictiveData[] = [];
    const payments: PredictiveData[] = [];

    let baseRevenue = 100000;
    let baseConventions = 50;
    let basePayments = 40;

    for (let i = 0; i < this.forecastMonths; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const growth = this.selectedModel === 'exponential' ? 1.05 : 1.02;
      
      baseRevenue *= growth;
      baseConventions = Math.floor(baseConventions * (1 + Math.random() * 0.1));
      basePayments = Math.floor(basePayments * (1 + Math.random() * 0.08));

      revenue.push({
        month: months[monthIndex],
        predicted: Math.round(baseRevenue),
        confidence: 85 - (i * 5)
      });

      conventions.push({
        month: months[monthIndex],
        predicted: baseConventions,
        confidence: 90 - (i * 4)
      });

      payments.push({
        month: months[monthIndex],
        predicted: basePayments,
        confidence: 88 - (i * 4)
      });
    }

    this.forecast = { revenue, conventions, payments };
    this.calculateKPIs();
    
    return this.forecast;
  }

  /**
   * Calculer les KPIs prédictifs
   */
  calculateKPIs(): any {
    if (this.forecast.revenue.length > 0) {
      const nextMonth = this.forecast.revenue[0];
      const lastMonth = this.forecast.revenue[this.forecast.revenue.length - 1];
      
      this.predictiveKPIs = {
        nextMonthRevenue: nextMonth.predicted,
        growthRate: ((lastMonth.predicted - nextMonth.predicted) / nextMonth.predicted) * 100,
        riskLevel: nextMonth.confidence > 80 ? 'low' : nextMonth.confidence > 60 ? 'medium' : 'high',
        confidence: nextMonth.confidence
      };
    }
    
    return this.predictiveKPIs;
  }

  /**
   * Initialiser les graphiques
   */
  initializeCharts(): void {
    this.createRevenueChart();
    this.createConventionsChart();
    this.createPaymentsChart();
    this.createTrendChart();
  }

  /**
   * Créer le graphique des revenus
   */
  createRevenueChart(): void {
    if (!this.revenueChartRef) return;

    const ctx = this.revenueChartRef.nativeElement.getContext('2d');
    
    if (this.revenueChart) {
      this.revenueChart.destroy();
    }

    this.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.forecast.revenue.map(d => d.month),
        datasets: [{
          label: 'Revenus Prédits (TND)',
          data: this.forecast.revenue.map(d => d.predicted),
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
            callbacks: {
              label: (context) => {
                const index = context.dataIndex;
                const confidence = this.forecast.revenue[index].confidence;
                return `${context.parsed.y.toLocaleString()} TND (Confiance: ${confidence}%)`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) => value.toLocaleString() + ' TND'
            }
          }
        }
      }
    });
  }

  /**
   * Créer le graphique des conventions
   */
  createConventionsChart(): void {
    if (!this.conventionsChartRef) return;

    const ctx = this.conventionsChartRef.nativeElement.getContext('2d');
    
    if (this.conventionsChart) {
      this.conventionsChart.destroy();
    }

    this.conventionsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.forecast.conventions.map(d => d.month),
        datasets: [{
          label: 'Conventions Prédites',
          data: this.forecast.conventions.map(d => d.predicted),
          backgroundColor: '#2196f3',
          borderColor: '#1976d2',
          borderWidth: 1
        }]
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
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  /**
   * Créer le graphique des paiements
   */
  createPaymentsChart(): void {
    if (!this.paymentsChartRef) return;

    const ctx = this.paymentsChartRef.nativeElement.getContext('2d');
    
    if (this.paymentsChart) {
      this.paymentsChart.destroy();
    }

    this.paymentsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.forecast.payments.map(d => d.month),
        datasets: [{
          label: 'Paiements Prédits',
          data: this.forecast.payments.map(d => d.predicted),
          borderColor: '#ff9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }]
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
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  /**
   * Créer le graphique de tendance
   */
  createTrendChart(): void {
    if (!this.trendChartRef) return;

    const ctx = this.trendChartRef.nativeElement.getContext('2d');
    
    if (this.trendChart) {
      this.trendChart.destroy();
    }

    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.forecast.revenue.map(d => d.month),
        datasets: [
          {
            label: 'Revenus',
            data: this.forecast.revenue.map(d => d.predicted / 1000),
            borderColor: '#4caf50',
            yAxisID: 'y'
          },
          {
            label: 'Conventions',
            data: this.forecast.conventions.map(d => d.predicted),
            borderColor: '#2196f3',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Revenus (K TND)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Conventions'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }

  /**
   * Mettre à jour les graphiques
   */
  updateCharts(): void {
    setTimeout(() => {
      this.createRevenueChart();
      this.createConventionsChart();
      this.createPaymentsChart();
      this.createTrendChart();
    }, 100);
  }

  /**
   * Changer le modèle de prédiction
   */
  onModelChange(): void {
    this.loadPredictiveData();
  }

  /**
   * Changer la période de prévision
   */
  onPeriodChange(): void {
    this.loadPredictiveData();
  }

  /**
   * Obtenir la couleur du niveau de risque
   */
  getRiskColor(level: string): string {
    const colors: { [key: string]: string } = {
      'low': 'primary',
      'medium': 'accent',
      'high': 'warn'
    };
    return colors[level] || 'primary';
  }

  /**
   * Obtenir l'icône du niveau de risque
   */
  getRiskIcon(level: string): string {
    const icons: { [key: string]: string } = {
      'low': 'check_circle',
      'medium': 'warning',
      'high': 'error'
    };
    return icons[level] || 'info';
  }
}
