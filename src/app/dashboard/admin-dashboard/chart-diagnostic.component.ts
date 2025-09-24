import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chart-diagnostic',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="diagnostic-container">
      <h2>🔍 Diagnostic des Graphiques Chart.js</h2>
      
      <div class="diagnostic-grid">
        <!-- Vérification Chart.js -->
        <mat-card class="diagnostic-card">
          <mat-card-header>
            <mat-card-title>📊 Vérification Chart.js</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="status-item">
              <span class="label">Chart.js disponible:</span>
              <span class="value" [class]="chartJsAvailable ? 'success' : 'error'">
                {{ chartJsAvailable ? '✅ Oui' : '❌ Non' }}
              </span>
            </div>
            <div class="status-item">
              <span class="label">Version:</span>
              <span class="value">{{ chartJsVersion }}</span>
            </div>
            <div class="status-item">
              <span class="label">Types disponibles:</span>
              <span class="value">{{ availableChartTypes }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Test de rendu -->
        <mat-card class="diagnostic-card">
          <mat-card-header>
            <mat-card-title>🎨 Test de Rendu</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-test-area">
              <canvas #testChart width="200" height="200"></canvas>
            </div>
            <div class="status-item">
              <span class="label">Canvas créé:</span>
              <span class="value" [class]="canvasCreated ? 'success' : 'error'">
                {{ canvasCreated ? '✅ Oui' : '❌ Non' }}
              </span>
            </div>
            <div class="status-item">
              <span class="label">Graphique rendu:</span>
              <span class="value" [class]="chartRendered ? 'success' : 'error'">
                {{ chartRendered ? '✅ Oui' : '❌ Non' }}
              </span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="testChartRendering()">
              <mat-icon>refresh</mat-icon>
              Tester le rendu
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Informations système -->
        <mat-card class="diagnostic-card">
          <mat-card-header>
            <mat-card-title>💻 Informations Système</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="status-item">
              <span class="label">Navigateur:</span>
              <span class="value">{{ userAgent }}</span>
            </div>
            <div class="status-item">
              <span class="label">Canvas supporté:</span>
              <span class="value" [class]="canvasSupported ? 'success' : 'error'">
                {{ canvasSupported ? '✅ Oui' : '❌ Non' }}
              </span>
            </div>
            <div class="status-item">
              <span class="label">WebGL supporté:</span>
              <span class="value" [class]="webglSupported ? 'success' : 'error'">
                {{ webglSupported ? '✅ Oui' : '❌ Non' }}
              </span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Logs d'erreur -->
        <mat-card class="diagnostic-card full-width">
          <mat-card-header>
            <mat-card-title>📝 Logs d'Erreur</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="logs-container">
              <div *ngFor="let log of errorLogs" class="log-entry" [class]="log.type">
                <span class="log-timestamp">{{ log.timestamp | date:'HH:mm:ss' }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
              <div *ngIf="errorLogs.length === 0" class="no-logs">
                Aucune erreur détectée
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="warn" (click)="clearLogs()">
              <mat-icon>clear</mat-icon>
              Effacer les logs
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Actions de diagnostic -->
      <div class="diagnostic-actions">
        <button mat-raised-button color="primary" (click)="runFullDiagnostic()">
          <mat-icon>play_arrow</mat-icon>
          Diagnostic Complet
        </button>
        <button mat-raised-button color="accent" (click)="exportDiagnostic()">
          <mat-icon>download</mat-icon>
          Exporter Rapport
        </button>
      </div>
    </div>
  `,
  styles: [`
    .diagnostic-container {
      padding: 20px;
      background: #f5f5f5;
      min-height: 100vh;
    }
    
    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
    }
    
    .diagnostic-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .diagnostic-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }
    
    .full-width {
      grid-column: 1 / -1;
    }
    
    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
      
      &:last-child {
        border-bottom: none;
      }
    }
    
    .label {
      font-weight: 500;
      color: #333;
    }
    
    .value {
      font-weight: 600;
      
      &.success {
        color: #4caf50;
      }
      
      &.error {
        color: #f44336;
      }
    }
    
    .chart-test-area {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin: 10px 0;
    }
    
    .logs-container {
      max-height: 200px;
      overflow-y: auto;
      background: #f5f5f5;
      border-radius: 4px;
      padding: 10px;
    }
    
    .log-entry {
      display: flex;
      gap: 10px;
      padding: 5px 0;
      font-family: monospace;
      font-size: 12px;
      
      &.error {
        color: #f44336;
      }
      
      &.warning {
        color: #ff9800;
      }
      
      &.info {
        color: #2196f3;
      }
    }
    
    .log-timestamp {
      color: #666;
      min-width: 60px;
    }
    
    .no-logs {
      text-align: center;
      color: #666;
      font-style: italic;
    }
    
    .diagnostic-actions {
      display: flex;
      justify-content: center;
      gap: 20px;
    }
  `]
})
export class ChartDiagnosticComponent implements OnInit, AfterViewInit {
  @ViewChild('testChart') testChartRef!: ElementRef;

  // État du diagnostic
  chartJsAvailable: boolean = false;
  chartJsVersion: string = 'Inconnue';
  availableChartTypes: string = 'Inconnus';
  canvasCreated: boolean = false;
  chartRendered: boolean = false;
  canvasSupported: boolean = false;
  webglSupported: boolean = false;
  userAgent: string = '';

  // Logs d'erreur
  errorLogs: Array<{timestamp: Date, type: string, message: string}> = [];

  ngOnInit(): void {
    console.log('🔍 ChartDiagnosticComponent initialized');
    this.runBasicDiagnostic();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.checkCanvasSupport();
    }, 100);
  }

  private runBasicDiagnostic(): void {
    // Vérifier Chart.js
    try {
      // @ts-ignore
      if (typeof Chart !== 'undefined') {
        this.chartJsAvailable = true;
        // @ts-ignore
        this.chartJsVersion = Chart.version || 'Version inconnue';
        // @ts-ignore
        this.availableChartTypes = Object.keys(Chart.ChartTypeRegistry || {}).join(', ') || 'Types inconnus';
        this.addLog('info', 'Chart.js détecté avec succès');
      } else {
        this.chartJsAvailable = false;
        this.addLog('error', 'Chart.js non disponible');
      }
    } catch (error) {
      this.chartJsAvailable = false;
      this.addLog('error', `Erreur lors de la vérification de Chart.js: ${error}`);
    }

    // Vérifier le navigateur
    this.userAgent = navigator.userAgent;
    this.canvasSupported = !!document.createElement('canvas').getContext;
    this.webglSupported = this.checkWebGLSupport();

    this.addLog('info', 'Diagnostic de base terminé');
  }

  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  private checkCanvasSupport(): void {
    if (this.testChartRef?.nativeElement) {
      this.canvasCreated = true;
      this.addLog('info', 'Canvas de test créé avec succès');
    } else {
      this.canvasCreated = false;
      this.addLog('error', 'Impossible de créer le canvas de test');
    }
  }

  testChartRendering(): void {
    try {
      if (!this.chartJsAvailable) {
        this.addLog('error', 'Chart.js non disponible pour le test de rendu');
        return;
      }

      if (!this.testChartRef?.nativeElement) {
        this.addLog('error', 'Canvas de test non disponible');
        return;
      }

      // @ts-ignore
      const testChart = new Chart(this.testChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Test'],
          datasets: [{
            data: [1],
            backgroundColor: ['#3f51b5']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });

      this.chartRendered = true;
      this.addLog('info', 'Graphique de test rendu avec succès');
      
      // Nettoyer le graphique de test
      setTimeout(() => {
        testChart.destroy();
      }, 2000);

    } catch (error) {
      this.chartRendered = false;
      this.addLog('error', `Erreur lors du test de rendu: ${error}`);
    }
  }

  runFullDiagnostic(): void {
    this.addLog('info', 'Démarrage du diagnostic complet...');
    
    // Vérifications supplémentaires
    this.checkChartJsImports();
    this.checkAngularIntegration();
    this.checkCSSIssues();
    
    this.addLog('info', 'Diagnostic complet terminé');
  }

  private checkChartJsImports(): void {
    try {
      // Vérifier les imports dynamiques
      import('chart.js/auto').then(() => {
        this.addLog('info', 'Import dynamique de Chart.js réussi');
      }).catch((error) => {
        this.addLog('error', `Échec de l'import dynamique: ${error}`);
      });
    } catch (error) {
      this.addLog('error', `Erreur lors de la vérification des imports: ${error}`);
    }
  }

  private checkAngularIntegration(): void {
    try {
      // Vérifier l'intégration Angular
      if (this.testChartRef?.nativeElement) {
        this.addLog('info', 'Intégration Angular-Chart.js OK');
      } else {
        this.addLog('warning', 'Problème potentiel d\'intégration Angular');
      }
    } catch (error) {
      this.addLog('error', `Erreur lors de la vérification Angular: ${error}`);
    }
  }

  private checkCSSIssues(): void {
    try {
      const canvas = this.testChartRef?.nativeElement;
      if (canvas) {
        const computedStyle = window.getComputedStyle(canvas);
        const width = computedStyle.width;
        const height = computedStyle.height;
        
        if (width === '0px' || height === '0px') {
          this.addLog('warning', 'Canvas avec dimensions CSS problématiques');
        } else {
          this.addLog('info', 'Dimensions CSS du canvas OK');
        }
      }
    } catch (error) {
      this.addLog('error', `Erreur lors de la vérification CSS: ${error}`);
    }
  }

  exportDiagnostic(): void {
    const diagnosticData = {
      timestamp: new Date().toISOString(),
      chartJsAvailable: this.chartJsAvailable,
      chartJsVersion: this.chartJsVersion,
      canvasSupported: this.canvasSupported,
      webglSupported: this.webglSupported,
      userAgent: this.userAgent,
      errorLogs: this.errorLogs
    };

    const blob = new Blob([JSON.stringify(diagnosticData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart-diagnostic-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.addLog('info', 'Rapport de diagnostic exporté');
  }

  clearLogs(): void {
    this.errorLogs = [];
    this.addLog('info', 'Logs effacés');
  }

  private addLog(type: string, message: string): void {
    this.errorLogs.unshift({
      timestamp: new Date(),
      type,
      message
    });
    
    // Limiter le nombre de logs
    if (this.errorLogs.length > 50) {
      this.errorLogs = this.errorLogs.slice(0, 50);
    }
  }
}




















