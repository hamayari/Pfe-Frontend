import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

export interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  dependencies?: string[];
  assignee?: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  color?: string;
}

@Component({
  selector: 'app-gantt-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gantt-container">
      <div class="gantt-header">
        <h3>{{ title }}</h3>
        <div class="gantt-controls">
          <button class="btn-zoom" (click)="zoomIn()">
            <span class="icon">+</span>
          </button>
          <button class="btn-zoom" (click)="zoomOut()">
            <span class="icon">-</span>
          </button>
          <button class="btn-export" (click)="exportChart()">
            <span class="icon">📊</span> Exporter
          </button>
        </div>
      </div>
      
      <div class="gantt-content">
        <div class="gantt-sidebar">
          <div class="task-header">Tâches</div>
          <div class="task-list">
            <div *ngFor="let task of tasks" 
                 class="task-item"
                 [class.completed]="task.status === 'completed'"
                 [class.delayed]="task.status === 'delayed'">
              <div class="task-name">{{ task.name }}</div>
              <div class="task-info">
                <span class="task-assignee" *ngIf="task.assignee">
                  👤 {{ task.assignee }}
                </span>
                <span class="task-progress">{{ task.progress }}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="gantt-timeline">
          <canvas #ganttCanvas></canvas>
        </div>
      </div>
      
      <div class="gantt-legend">
        <div class="legend-item">
          <span class="legend-color not-started"></span>
          <span>Non démarré</span>
        </div>
        <div class="legend-item">
          <span class="legend-color in-progress"></span>
          <span>En cours</span>
        </div>
        <div class="legend-item">
          <span class="legend-color completed"></span>
          <span>Terminé</span>
        </div>
        <div class="legend-item">
          <span class="legend-color delayed"></span>
          <span>En retard</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gantt-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin: 20px 0;
    }

    .gantt-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e9ecef;
    }

    .gantt-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #2c3e50;
    }

    .gantt-controls {
      display: flex;
      gap: 10px;
    }

    .btn-zoom, .btn-export {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
    }

    .btn-zoom:hover, .btn-export:hover {
      background: #f8f9fa;
      border-color: #667eea;
    }

    .gantt-content {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 20px;
      min-height: 400px;
    }

    .gantt-sidebar {
      border-right: 2px solid #e9ecef;
    }

    .task-header {
      font-weight: 600;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 6px;
      margin-bottom: 10px;
      color: #2c3e50;
    }

    .task-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .task-item {
      padding: 12px;
      border-left: 4px solid #667eea;
      background: #f8f9fa;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .task-item:hover {
      background: #e9ecef;
      transform: translateX(4px);
    }

    .task-item.completed {
      border-left-color: #27ae60;
      opacity: 0.8;
    }

    .task-item.delayed {
      border-left-color: #e74c3c;
    }

    .task-name {
      font-weight: 500;
      color: #2c3e50;
      margin-bottom: 6px;
    }

    .task-info {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #7f8c8d;
    }

    .task-assignee {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .task-progress {
      font-weight: 600;
      color: #667eea;
    }

    .gantt-timeline {
      padding: 10px;
      overflow-x: auto;
    }

    .gantt-legend {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid #e9ecef;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #2c3e50;
    }

    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
    }

    .legend-color.not-started {
      background: #95a5a6;
    }

    .legend-color.in-progress {
      background: #667eea;
    }

    .legend-color.completed {
      background: #27ae60;
    }

    .legend-color.delayed {
      background: #e74c3c;
    }

    @media (max-width: 768px) {
      .gantt-content {
        grid-template-columns: 1fr;
      }

      .gantt-sidebar {
        border-right: none;
        border-bottom: 2px solid #e9ecef;
        padding-bottom: 15px;
      }

      .gantt-legend {
        flex-wrap: wrap;
        gap: 15px;
      }
    }
  `]
})
export class GanttChartComponent implements OnInit, AfterViewInit {
  @Input() tasks: GanttTask[] = [];
  @Input() title: string = 'Diagramme de Gantt';
  @ViewChild('ganttCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private chart?: Chart;
  private zoomLevel = 1;

  ngOnInit(): void {
    if (this.tasks.length === 0) {
      this.tasks = this.generateSampleTasks();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createGanttChart();
    }, 100);
  }

  private createGanttChart(): void {
    if (!this.canvasRef) return;

    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Préparer les données pour le graphique
    const datasets = this.tasks.map(task => {
      const start = task.startDate.getTime();
      const end = task.endDate.getTime();
      const duration = end - start;

      return {
        label: task.name,
        data: [{
          x: [start, end],
          y: task.name
        }],
        backgroundColor: this.getTaskColor(task.status),
        borderColor: this.getTaskBorderColor(task.status),
        borderWidth: 2,
        borderRadius: 4
      };
    });

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.tasks.map(t => t.name),
        datasets: [{
          label: 'Tâches',
          data: this.tasks.map(task => {
            const start = task.startDate.getTime();
            const end = task.endDate.getTime();
            return end - start;
          }),
          backgroundColor: this.tasks.map(t => this.getTaskColor(t.status)),
          borderColor: this.tasks.map(t => this.getTaskBorderColor(t.status)),
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const task = this.tasks[context.dataIndex];
                if (!task || !task.startDate || !task.endDate) {
                  return ['Aucune donnée'];
                }
                return [
                  `Début: ${task.startDate.toLocaleDateString('fr-FR')}`,
                  `Fin: ${task.endDate.toLocaleDateString('fr-FR')}`,
                  `Progression: ${task.progress}%`,
                  `Statut: ${this.getStatusLabel(task.status)}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              displayFormats: {
                day: 'dd MMM'
              }
            },
            title: {
              display: true,
              text: 'Timeline'
            }
          },
          y: {
            display: false
          }
        }
      }
    };

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, config);
  }

  private getTaskColor(status: string): string {
    switch (status) {
      case 'not-started': return 'rgba(149, 165, 166, 0.7)';
      case 'in-progress': return 'rgba(102, 126, 234, 0.7)';
      case 'completed': return 'rgba(39, 174, 96, 0.7)';
      case 'delayed': return 'rgba(231, 76, 60, 0.7)';
      default: return 'rgba(149, 165, 166, 0.7)';
    }
  }

  private getTaskBorderColor(status: string): string {
    switch (status) {
      case 'not-started': return '#95a5a6';
      case 'in-progress': return '#667eea';
      case 'completed': return '#27ae60';
      case 'delayed': return '#e74c3c';
      default: return '#95a5a6';
    }
  }

  private getStatusLabel(status: string): string {
    switch (status) {
      case 'not-started': return 'Non démarré';
      case 'in-progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'delayed': return 'En retard';
      default: return status;
    }
  }

  zoomIn(): void {
    this.zoomLevel = Math.min(this.zoomLevel + 0.2, 2);
    this.updateZoom();
  }

  zoomOut(): void {
    this.zoomLevel = Math.max(this.zoomLevel - 0.2, 0.5);
    this.updateZoom();
  }

  private updateZoom(): void {
    if (this.chart) {
      this.chart.options.scales!['x']!.ticks = {
        ...this.chart.options.scales!['x']!.ticks,
        maxRotation: 0,
        minRotation: 0
      };
      this.chart.update();
    }
  }

  exportChart(): void {
    if (this.chart) {
      const url = this.chart.toBase64Image();
      const link = document.createElement('a');
      link.download = `gantt-chart-${Date.now()}.png`;
      link.href = url;
      link.click();
    }
  }

  private generateSampleTasks(): GanttTask[] {
    const today = new Date();
    return [
      {
        id: '1',
        name: 'Analyse des besoins',
        startDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        progress: 100,
        status: 'completed',
        assignee: 'Marie Dupont'
      },
      {
        id: '2',
        name: 'Conception technique',
        startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        progress: 60,
        status: 'in-progress',
        assignee: 'Jean Martin'
      },
      {
        id: '3',
        name: 'Développement',
        startDate: today,
        endDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000),
        progress: 30,
        status: 'in-progress',
        assignee: 'Sophie Bernard'
      },
      {
        id: '4',
        name: 'Tests et validation',
        startDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000),
        progress: 0,
        status: 'not-started',
        assignee: 'Pierre Leroy'
      },
      {
        id: '5',
        name: 'Déploiement',
        startDate: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 35 * 24 * 60 * 60 * 1000),
        progress: 0,
        status: 'not-started',
        assignee: 'Luc Dubois'
      }
    ];
  }
}
