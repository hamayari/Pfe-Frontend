import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import Chart from 'chart.js/auto';
import { UXDimensions, UXDimensionUtils } from './ux-dimensions.config';

interface Breakpoint {
  key: string;
  value: string;
}

@Component({
  selector: 'app-ux-demo',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTabsModule, MatChipsModule],
  template: `
    <div class="ux-demo-container">
      <div class="demo-header">
        <h1>🎨 Démonstration des Meilleures Pratiques UX</h1>
        <p>Dimensions optimales pour les cartes et graphiques selon les standards de l'industrie</p>
      </div>

      <mat-tab-group class="demo-tabs">
        <!-- Onglet KPI Cards -->
        <mat-tab label="📊 KPI Cards">
          <div class="tab-content">
            <div class="demo-section">
              <h3>Cartes KPI Optimisées</h3>
              <p>Dimensions recommandées : {{ UXDimensions.kpiCards.minWidth }} × hauteur adaptative</p>
              
              <div class="kpi-demo-grid">
                <mat-card class="kpi-card-demo" 
                          [style.min-width]="UXDimensions.kpiCards.minWidth"
                          [style.padding]="UXDimensions.kpiCards.padding">
                  <div class="kpi-header-demo">
                    <div class="kpi-icon-demo" 
                         [style.width]="UXDimensions.kpiCards.iconSize"
                         [style.height]="UXDimensions.kpiCards.iconSize">
                      <mat-icon [style.font-size]="UXDimensions.kpiCards.iconFontSize">trending_up</mat-icon>
                    </div>
                    <div class="kpi-trend-demo up">
                      <mat-icon>arrow_upward</mat-icon>
                      <span>+12%</span>
                    </div>
                  </div>
                  <div class="kpi-content-demo">
                    <h4 [style.font-size]="UXDimensions.kpiCards.titleFontSize">Utilisateurs Actifs</h4>
                    <div class="kpi-value-demo" [style.font-size]="UXDimensions.kpiCards.valueFontSize">2,847</div>
                    <p [style.font-size]="UXDimensions.kpiCards.descFontSize">+156 ce mois</p>
                  </div>
                </mat-card>

                <mat-card class="kpi-card-demo" 
                          [style.min-width]="UXDimensions.kpiCards.minWidth"
                          [style.padding]="UXDimensions.kpiCards.padding">
                  <div class="kpi-header-demo">
                    <div class="kpi-icon-demo" 
                         [style.width]="UXDimensions.kpiCards.iconSize"
                         [style.height]="UXDimensions.kpiCards.iconSize">
                      <mat-icon [style.font-size]="UXDimensions.kpiCards.iconFontSize">analytics</mat-icon>
                    </div>
                    <div class="kpi-trend-demo down">
                      <mat-icon>arrow_downward</mat-icon>
                      <span>-3%</span>
                    </div>
                  </div>
                  <div class="kpi-content-demo">
                    <h4 [style.font-size]="UXDimensions.kpiCards.titleFontSize">Taux de Conversion</h4>
                    <div class="kpi-value-demo" [style.font-size]="UXDimensions.kpiCards.valueFontSize">24.8%</div>
                    <p [style.font-size]="UXDimensions.kpiCards.descFontSize">-0.7% ce mois</p>
                  </div>
                </mat-card>

                <mat-card class="kpi-card-demo" 
                          [style.min-width]="UXDimensions.kpiCards.minWidth"
                          [style.padding]="UXDimensions.kpiCards.padding">
                  <div class="kpi-header-demo">
                    <div class="kpi-icon-demo" 
                         [style.width]="UXDimensions.kpiCards.iconSize"
                         [style.height]="UXDimensions.kpiCards.iconSize">
                      <mat-icon [style.font-size]="UXDimensions.kpiCards.iconFontSize">attach_money</mat-icon>
                    </div>
                    <div class="kpi-trend-demo up">
                      <mat-icon>arrow_upward</mat-icon>
                      <span>+8%</span>
                    </div>
                  </div>
                  <div class="kpi-content-demo">
                    <h4 [style.font-size]="UXDimensions.kpiCards.titleFontSize">Revenus</h4>
                    <div class="kpi-value-demo" [style.font-size]="UXDimensions.kpiCards.valueFontSize">€45.2K</div>
                    <p [style.font-size]="UXDimensions.kpiCards.descFontSize">+€3.4K ce mois</p>
                  </div>
                </mat-card>

                <mat-card class="kpi-card-demo" 
                          [style.min-width]="UXDimensions.kpiCards.minWidth"
                          [style.padding]="UXDimensions.kpiCards.padding">
                  <div class="kpi-header-demo">
                    <div class="kpi-icon-demo" 
                         [style.width]="UXDimensions.kpiCards.iconSize"
                         [style.height]="UXDimensions.kpiCards.iconSize">
                      <mat-icon [style.font-size]="UXDimensions.kpiCards.iconFontSize">speed</mat-icon>
                    </div>
                    <div class="kpi-trend-demo stable">
                      <mat-icon>trending_flat</mat-icon>
                      <span>0%</span>
                    </div>
                  </div>
                  <div class="kpi-content-demo">
                    <h4 [style.font-size]="UXDimensions.kpiCards.titleFontSize">Performance</h4>
                    <div class="kpi-value-demo" [style.font-size]="UXDimensions.kpiCards.valueFontSize">98.5%</div>
                    <p [style.font-size]="UXDimensions.kpiCards.descFontSize">Stable ce mois</p>
                  </div>
                </mat-card>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Onglet Graphiques -->
        <mat-tab label="📈 Graphiques">
          <div class="tab-content">
            <div class="demo-section">
              <h3>Graphiques Principaux</h3>
              <p>Dimensions recommandées : {{ UXDimensions.charts.main.minWidth }} × {{ UXDimensions.charts.main.minHeight }}</p>
              
              <div class="charts-demo-grid main-charts">
                <mat-card class="chart-card-demo large" 
                          [style.min-width]="UXDimensions.charts.main.minWidth"
                          [style.min-height]="UXDimensions.charts.main.minHeight"
                          [style.padding]="UXDimensions.charts.main.padding">
                  <div class="chart-header-demo">
                    <h4>Évolution des Ventes</h4>
                    <mat-icon>trending_up</mat-icon>
                  </div>
                  <div class="chart-container-demo" 
                       [style.height]="UXDimensions.charts.main.containerHeight">
                    <canvas #mainChart1></canvas>
                  </div>
                </mat-card>

                <mat-card class="chart-card-demo large" 
                          [style.min-width]="UXDimensions.charts.main.minWidth"
                          [style.min-height]="UXDimensions.charts.main.minHeight"
                          [style.padding]="UXDimensions.charts.main.padding">
                  <div class="chart-header-demo">
                    <h4>Répartition des Clients</h4>
                    <mat-icon>pie_chart</mat-icon>
                  </div>
                  <div class="chart-container-demo" 
                       [style.height]="UXDimensions.charts.main.containerHeight">
                    <canvas #mainChart2></canvas>
                  </div>
                </mat-card>
              </div>

              <div class="demo-section">
                <h3>Graphiques Secondaires</h3>
                <p>Dimensions recommandées : {{ UXDimensions.charts.secondary.minWidth }} × {{ UXDimensions.charts.secondary.minHeight }}</p>
                
                <div class="charts-demo-grid secondary-charts">
                  <mat-card class="chart-card-demo" 
                            [style.min-width]="UXDimensions.charts.secondary.minWidth"
                            [style.min-height]="UXDimensions.charts.secondary.minHeight"
                            [style.padding]="UXDimensions.charts.secondary.padding">
                    <div class="chart-header-demo">
                      <h4>Alertes par Type</h4>
                      <mat-icon>warning</mat-icon>
                    </div>
                    <div class="chart-container-demo" 
                         [style.height]="UXDimensions.charts.secondary.containerHeight">
                      <canvas #secondaryChart1></canvas>
                    </div>
                  </mat-card>

                  <mat-card class="chart-card-demo" 
                            [style.min-width]="UXDimensions.charts.secondary.minWidth"
                            [style.min-height]="UXDimensions.charts.secondary.minHeight"
                            [style.padding]="UXDimensions.charts.secondary.padding">
                    <div class="chart-header-demo">
                      <h4>Utilisation des Ressources</h4>
                      <mat-icon>memory</mat-icon>
                    </div>
                    <div class="chart-container-demo" 
                         [style.height]="UXDimensions.charts.secondary.containerHeight">
                      <canvas #secondaryChart2></canvas>
                    </div>
                  </mat-card>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Onglet Responsive -->
        <mat-tab label="📱 Responsive">
          <div class="tab-content">
            <div class="demo-section">
              <h3>Grilles Responsives</h3>
              <p>Adaptation automatique selon la taille d'écran</p>
              
              <div class="responsive-info">
                <div class="breakpoint-info" *ngFor="let breakpoint of breakpoints">
                  <mat-chip [color]="getBreakpointColor(breakpoint.key)" selected>
                    {{ breakpoint.key.toUpperCase() }}
                  </mat-chip>
                  <div class="breakpoint-details">
                    <p><strong>Largeur :</strong> {{ breakpoint.value }}</p>
                    <!-- Using helper methods to avoid TypeScript indexing errors -->
                    <p><strong>KPI Cards :</strong> {{ getKpiColumns(breakpoint.key) }} colonne(s)</p>
                    <p><strong>Graphiques :</strong> {{ getMainChartsColumns(breakpoint.key) }} colonne(s)</p>
                  </div>
                </div>
              </div>

              <div class="spacing-demo">
                <h4>Espacements Optimaux</h4>
                <div class="spacing-examples">
                  <div class="spacing-item compact">
                    <h5>Compact</h5>
                    <div class="spacing-visual" [style.padding]="UXDimensions.spacing.md"></div>
                    <p>{{ UXDimensions.spacing.md }}</p>
                  </div>
                  <div class="spacing-item comfortable">
                    <h5>Confortable</h5>
                    <div class="spacing-visual" [style.padding]="UXDimensions.spacing.lg"></div>
                    <p>{{ UXDimensions.spacing.lg }}</p>
                  </div>
                  <div class="spacing-item spacious">
                    <h5>Spacieux</h5>
                    <div class="spacing-visual" [style.padding]="UXDimensions.spacing.xl"></div>
                    <p>{{ UXDimensions.spacing.xl }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .ux-demo-container {
      padding: 24px;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .demo-header {
      text-align: center;
      margin-bottom: 32px;
      
      h1 {
        color: #333;
        margin-bottom: 8px;
        font-size: 28px;
        font-weight: 600;
      }
      
      p {
        color: #666;
        font-size: 16px;
        margin: 0;
      }
    }

    .demo-tabs {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .tab-content {
      padding: 24px;
    }

    .demo-section {
      margin-bottom: 32px;
      
      h3 {
        color: #333;
        margin-bottom: 8px;
        font-size: 20px;
        font-weight: 600;
      }
      
      p {
        color: #666;
        margin-bottom: 20px;
        font-size: 14px;
      }
    }

    // KPI Cards Demo
    .kpi-demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
    }

    .kpi-card-demo {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
    }

    .kpi-header-demo {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .kpi-icon-demo {
      background: linear-gradient(135deg, #3f51b5, #5c6bc0);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .kpi-trend-demo {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      
      &.up {
        background-color: rgba(76, 175, 80, 0.1);
        color: #4caf50;
      }
      
      &.down {
        background-color: rgba(244, 67, 54, 0.1);
        color: #f44336;
      }
      
      &.stable {
        background-color: rgba(33, 150, 243, 0.1);
        color: #2196f3;
      }
    }

    .kpi-content-demo {
      h4 {
        margin: 0 0 8px 0;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .kpi-value-demo {
        font-weight: 700;
        color: #333;
        margin-bottom: 8px;
      }
      
      p {
        margin: 0;
        color: #666;
      }
    }

    // Charts Demo
    .charts-demo-grid {
      display: grid;
      gap: 20px;
      margin-bottom: 24px;
      
      &.main-charts {
        grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
      }
      
      &.secondary-charts {
        grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      }
    }

    .chart-card-demo {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
      
      &.large {
        grid-column: span 2;
      }
    }

    .chart-header-demo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      
      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
      
      mat-icon {
        color: #3f51b5;
        font-size: 20px;
      }
    }

    .chart-container-demo {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f9f9f9;
      border: 1px solid #eee;
      border-radius: 4px;
    }

    // Responsive Demo
    .responsive-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .breakpoint-info {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      .breakpoint-details {
        margin-top: 16px;
        
        p {
          margin: 4px 0;
          font-size: 14px;
          color: #666;
        }
      }
    }

    .spacing-demo {
      h4 {
        color: #333;
        margin-bottom: 16px;
        font-size: 18px;
        font-weight: 600;
      }
    }

    .spacing-examples {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
    }

    .spacing-item {
      text-align: center;
      
      h5 {
        margin: 0 0 12px 0;
        color: #333;
        font-size: 14px;
        font-weight: 600;
      }
      
      .spacing-visual {
        background: #3f51b5;
        border-radius: 4px;
        margin: 0 auto 8px auto;
        width: 60px;
        height: 60px;
      }
      
      p {
        margin: 0;
        font-size: 12px;
        color: #666;
        font-family: monospace;
      }
    }

    // Responsive adjustments
    @media (max-width: 768px) {
      .kpi-demo-grid {
        grid-template-columns: 1fr;
      }
      
      .charts-demo-grid.main-charts,
      .charts-demo-grid.secondary-charts {
        grid-template-columns: 1fr;
      }
      
      .chart-card-demo.large {
        grid-column: span 1;
      }
      
      .responsive-info {
        grid-template-columns: 1fr;
      }
      
      .spacing-examples {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `]
})
export class UXDemoComponent implements OnInit, AfterViewInit {
  @ViewChild('mainChart1') mainChart1Ref!: ElementRef;
  @ViewChild('mainChart2') mainChart2Ref!: ElementRef;
  @ViewChild('secondaryChart1') secondaryChart1Ref!: ElementRef;
  @ViewChild('secondaryChart2') secondaryChart2Ref!: ElementRef;

  // Propriété pour accéder aux dimensions UX dans le template
  UXDimensions = UXDimensions;
  charts: any = {};

  breakpoints: Breakpoint[] = [
    { key: 'xs', value: '0px - 599px' },
    { key: 'sm', value: '600px - 959px' },
    { key: 'md', value: '960px - 1279px' },
    { key: 'lg', value: '1280px - 1919px' },
    { key: 'xl', value: '1920px+' }
  ];

  constructor() {}

  ngOnInit(): void {
    console.log('🎨 UXDemoComponent initialized');
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeDemoCharts();
    }, 500);
  }

  private initializeDemoCharts(): void {
    try {
      // Chart 1: Line Chart
      if (this.mainChart1Ref?.nativeElement) {
        this.charts.main1 = new Chart(this.mainChart1Ref.nativeElement, {
          type: 'line',
          data: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
            datasets: [{
              label: 'Ventes 2024',
              data: [65, 59, 80, 81, 56, 55],
              borderColor: '#3f51b5',
              backgroundColor: 'rgba(63, 81, 181, 0.1)',
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            }
          }
        });
      }

      // Chart 2: Doughnut Chart
      if (this.mainChart2Ref?.nativeElement) {
        this.charts.main2 = new Chart(this.mainChart2Ref.nativeElement, {
          type: 'doughnut',
          data: {
            labels: ['Nouveaux', 'Existant', 'Inactif'],
            datasets: [{
              data: [45, 35, 20],
              backgroundColor: ['#4caf50', '#2196f3', '#ff9800']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }

      // Chart 3: Bar Chart
      if (this.secondaryChart1Ref?.nativeElement) {
        this.charts.secondary1 = new Chart(this.secondaryChart1Ref.nativeElement, {
          type: 'bar',
          data: {
            labels: ['Critique', 'Warning', 'Info'],
            datasets: [{
              data: [3, 7, 12],
              backgroundColor: ['#f44336', '#ff9800', '#2196f3']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            }
          }
        });
      }

      // Chart 4: Radar Chart
      if (this.secondaryChart2Ref?.nativeElement) {
        this.charts.secondary2 = new Chart(this.secondaryChart2Ref.nativeElement, {
          type: 'radar',
          data: {
            labels: ['CPU', 'RAM', 'Stockage', 'Réseau', 'Sécurité'],
            datasets: [{
              label: 'Utilisation',
              data: [85, 70, 60, 90, 75],
              borderColor: '#9c27b0',
              backgroundColor: 'rgba(156, 39, 176, 0.2)'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }

      console.log('✅ Demo charts initialized');
    } catch (error) {
      console.error('❌ Error initializing demo charts:', error);
    }
  }

  getBreakpointColor(breakpoint: string): string {
    const colorMap: { [key: string]: string } = {
      xs: 'warn',
      sm: 'accent',
      md: 'primary',
      lg: 'accent',
      xl: 'primary'
    };
    return colorMap[breakpoint] || 'primary';
  }

  // Helper methods to safely access grid dimensions
  getKpiColumns(breakpointKey: string): number {
    const kpiGrids = this.UXDimensions.grids.kpi;
    if (['xs', 'sm', 'md', 'lg', 'xl'].includes(breakpointKey)) {
      return kpiGrids[breakpointKey as keyof typeof kpiGrids] ?? 1;
    }
    return 1;
  }

  getMainChartsColumns(breakpointKey: string): number {
    const mainChartsGrids = this.UXDimensions.grids.mainCharts;
    if (['xs', 'sm', 'md', 'lg', 'xl'].includes(breakpointKey)) {
      return mainChartsGrids[breakpointKey as keyof typeof mainChartsGrids] ?? 1;
    }
    return 1;
  }

  ngOnDestroy(): void {
    Object.values(this.charts).forEach(chart => {
      // if (chart && typeof chart.destroy === 'function') { 
      //   chart.destroy();
      // }
    });
  }
}


