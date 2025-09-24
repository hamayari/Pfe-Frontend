import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-chart-test',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="chart-test-container">
      <h2>Test des Graphiques Chart.js</h2>
      
      <div class="chart-row">
        <mat-card class="chart-card">
          <h3>Graphique en Donut</h3>
          <div class="chart-container">
            <canvas #donutChart width="300" height="300"></canvas>
          </div>
        </mat-card>
        
        <mat-card class="chart-card">
          <h3>Graphique en Barres</h3>
          <div class="chart-container">
            <canvas #barChart width="300" height="300"></canvas>
          </div>
        </mat-card>
      </div>
      
      <div class="chart-row">
        <mat-card class="chart-card">
          <h3>Graphique Linéaire</h3>
          <div class="chart-container">
            <canvas #lineChart width="300" height="300"></canvas>
          </div>
        </mat-card>
        
        <mat-card class="chart-card">
          <h3>Graphique en Secteurs</h3>
          <div class="chart-container">
            <canvas #pieChart width="300" height="300"></canvas>
          </div>
        </mat-card>
      </div>

      <div class="chart-row">
        <mat-card class="chart-card">
          <h3>Graphique Radar</h3>
          <div class="chart-container">
            <canvas #radarChart width="300" height="300"></canvas>
          </div>
        </mat-card>
        
        <mat-card class="chart-card">
          <h3>Graphique Polar Area</h3>
          <div class="chart-container">
            <canvas #polarChart width="300" height="300"></canvas>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .chart-test-container {
      padding: 20px;
      background: #f5f5f5;
      min-height: 100vh;
    }
    
    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
    }
    
    .chart-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); /* Optimisé pour une meilleure densité */
      gap: 18px; /* Espacement optimal */
      margin-bottom: 18px;
    }
    
    .chart-card {
      padding: 18px; /* Optimisé pour une meilleure densité */
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }
    
    .chart-card h3 {
      margin-bottom: 20px;
      color: #333;
    }
    
    .chart-container {
      height: 240px; /* Optimisé selon les meilleures pratiques UX */
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    canvas {
      width: 100% !important;
      height: 100% !important;
      display: block !important;
      max-width: 100% !important;
      max-height: 100% !important;
    }
  `]
})
export class ChartTestComponent implements OnInit, AfterViewInit {
  @ViewChild('donutChart') donutChartRef!: ElementRef;
  @ViewChild('barChart') barChartRef!: ElementRef;
  @ViewChild('lineChart') lineChartRef!: ElementRef;
  @ViewChild('pieChart') pieChartRef!: ElementRef;
  @ViewChild('radarChart') radarChartRef!: ElementRef;
  @ViewChild('polarChart') polarChartRef!: ElementRef;

  charts: any = {};

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log('🚀 ChartTestComponent initialized');
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeCharts();
    }, 500);
  }

  private initializeCharts(): void {
    try {
      console.log('🔄 Initialisation des graphiques de test...');

      // Donut Chart
      if (this.donutChartRef?.nativeElement) {
        this.charts.donut = new Chart(this.donutChartRef.nativeElement, {
          type: 'doughnut',
          data: {
            labels: ['Rouge', 'Bleu', 'Jaune', 'Vert'],
            datasets: [{
              data: [12, 19, 3, 5],
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 20,
                  usePointStyle: true
                }
              }
            }
          }
        });
        console.log('✅ Donut chart créé');
      }

      // Bar Chart
      if (this.barChartRef?.nativeElement) {
        this.charts.bar = new Chart(this.barChartRef.nativeElement, {
          type: 'bar',
          data: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
            datasets: [{
              label: 'Ventes',
              data: [65, 59, 80, 81, 56, 55],
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        });
        console.log('✅ Bar chart créé');
      }

      // Line Chart
      if (this.lineChartRef?.nativeElement) {
        this.charts.line = new Chart(this.lineChartRef.nativeElement, {
          type: 'line',
          data: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
            datasets: [{
              label: 'Évolution',
              data: [12, 19, 3, 5, 2, 3],
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.1)',
              tension: 0.4,
              borderWidth: 3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              },
              x: {
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              }
            }
          }
        });
        console.log('✅ Line chart créé');
      }

      // Pie Chart
      if (this.pieChartRef?.nativeElement) {
        this.charts.pie = new Chart(this.pieChartRef.nativeElement, {
          type: 'pie',
          data: {
            labels: ['Rouge', 'Bleu', 'Jaune'],
            datasets: [{
              data: [300, 50, 100],
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right'
              }
            }
          }
        });
        console.log('✅ Pie chart créé');
      }

      // Radar Chart
      if (this.radarChartRef?.nativeElement) {
        this.charts.radar = new Chart(this.radarChartRef.nativeElement, {
          type: 'radar',
          data: {
            labels: ['Performance', 'Qualité', 'Délais', 'Coût', 'Satisfaction'],
            datasets: [{
              label: 'Objectifs',
              data: [90, 85, 70, 80, 95],
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top'
              }
            },
            scales: {
              r: {
                beginAtZero: true,
                max: 100,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              }
            }
          }
        });
        console.log('✅ Radar chart créé');
      }

      // Polar Area Chart
      if (this.polarChartRef?.nativeElement) {
        this.charts.polar = new Chart(this.polarChartRef.nativeElement, {
          type: 'polarArea',
          data: {
            labels: ['Rouge', 'Bleu', 'Jaune', 'Vert', 'Violet'],
            datasets: [{
              data: [11, 16, 7, 3, 14],
              backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 205, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)'
              ],
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }
        });
        console.log('✅ Polar Area chart créé');
      }

      console.log('🎉 Tous les graphiques de test ont été créés avec succès !');
      this.cdr.detectChanges();
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des graphiques:', error);
    }
  }
}

