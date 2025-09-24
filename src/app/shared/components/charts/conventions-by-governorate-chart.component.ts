import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-conventions-by-governorate-chart',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './conventions-by-governorate-chart.component.html',
  styleUrls: ['./conventions-by-governorate-chart.component.scss']
})
export class ConventionsByGovernorateChartComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | null = null;
  
  public chartData = {
    labels: ['Tunis', 'Sfax', 'Sousse', 'Monastir', 'Gabès', 'Gafsa', 'Kairouan', 'Béja'],
    datasets: [
      {
        data: [45, 32, 28, 19, 15, 12, 8, 6],
        label: 'Conventions Actives',
        backgroundColor: 'rgba(25, 118, 210, 0.8)',
        borderColor: 'rgba(25, 118, 210, 1)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        data: [12, 8, 6, 4, 3, 2, 1, 1],
        label: 'Conventions Expirées',
        backgroundColor: 'rgba(244, 67, 54, 0.8)',
        borderColor: 'rgba(244, 67, 54, 1)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  };

  public chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            return context.dataset.label + ': ' + context.parsed.y + ' conventions';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#666',
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#666',
          font: {
            size: 12
          },
          callback: function(value: any) {
            return value + '';
          }
        }
      }
    }
  };

  legendItems = [
    { label: 'Actives', value: '165', color: 'rgba(25, 118, 210, 0.8)' },
    { label: 'Expirées', value: '37', color: 'rgba(244, 67, 54, 0.8)' }
  ];

  ngOnInit(): void {
    // Initialisation des données
  }

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private initializeChart(): void {
    if (this.chartCanvas?.nativeElement) {
      this.chart = new Chart(this.chartCanvas.nativeElement, {
        type: 'bar',
        data: this.chartData,
        options: this.chartOptions
      });
    }
  }

  refreshChart(): void {
    if (this.chart) {
      this.chart.update();
    }
  }

  exportChart(): void {
    if (this.chart) {
      const canvas = this.chartCanvas.nativeElement;
      const link = document.createElement('a');
      link.download = 'conventions-by-governorate.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  }
}







