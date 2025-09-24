import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-invoice-status-pie-chart',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './invoice-status-pie-chart.component.html',
  styleUrls: ['./invoice-status-pie-chart.component.scss']
})
export class InvoiceStatusPieChartComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chart: any = null;
  
  public chartData = {
    labels: ['Payées', 'En attente', 'En retard', 'Annulées'],
    datasets: [{
      data: [65, 20, 10, 5],
      backgroundColor: [
        'rgba(76, 175, 80, 0.8)',
        'rgba(255, 193, 7, 0.8)',
        'rgba(244, 67, 54, 0.8)',
        'rgba(158, 158, 158, 0.8)'
      ],
      borderColor: [
        'rgba(76, 175, 80, 1)',
        'rgba(255, 193, 7, 1)',
        'rgba(244, 67, 54, 1)',
        'rgba(158, 158, 158, 1)'
      ],
      borderWidth: 2,
      hoverOffset: 4
    }]
  };

  public chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  legendItems = [
    { label: 'Payées', value: '65', color: 'rgba(76, 175, 80, 0.8)' },
    { label: 'En attente', value: '20', color: 'rgba(255, 193, 7, 0.8)' },
    { label: 'En retard', value: '10', color: 'rgba(244, 67, 54, 0.8)' },
    { label: 'Annulées', value: '5', color: 'rgba(158, 158, 158, 0.8)' }
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
        type: 'pie',
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
      link.download = 'invoice-status.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  }
}







