import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface TimelineStep {
  title: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  date?: string;
  description?: string;
}

@Component({
  selector: 'app-process-timeline',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="process-timeline">
      <div 
        *ngFor="let step of steps; let i = index" 
        class="timeline-step"
        [ngClass]="step.status"
      >
        <div class="step-indicator">
          <mat-icon [ngClass]="getIconClass(step.status)">
            {{ getIcon(step.status) }}
          </mat-icon>
        </div>
        <div class="step-content">
          <h4>{{ step.title }}</h4>
          <p *ngIf="step.description">{{ step.description }}</p>
          <span *ngIf="step.date" class="step-date">{{ step.date }}</span>
        </div>
        <div 
          *ngIf="i < steps.length - 1" 
          class="step-connector"
          [ngClass]="step.status"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .process-timeline {
      position: relative;
      padding: 20px 0;
    }

    .timeline-step {
      display: flex;
      align-items: flex-start;
      position: relative;
      margin-bottom: 20px;
    }

    .step-indicator {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      z-index: 2;
    }

    .step-indicator.completed {
      background-color: #4caf50;
      color: white;
    }

    .step-indicator.active {
      background-color: #2196f3;
      color: white;
    }

    .step-indicator.pending {
      background-color: #f5f5f5;
      color: #666;
      border: 2px solid #ddd;
    }

    .step-indicator.cancelled {
      background-color: #f44336;
      color: white;
    }

    .step-content {
      flex: 1;
    }

    .step-content h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .step-content p {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
    }

    .step-date {
      color: #999;
      font-size: 12px;
    }

    .step-connector {
      position: absolute;
      left: 19px;
      top: 40px;
      width: 2px;
      height: calc(100% - 20px);
      background-color: #ddd;
    }

    .step-connector.completed {
      background-color: #4caf50;
    }

    .step-connector.active {
      background-color: #2196f3;
    }

    .timeline-step:last-child .step-connector {
      display: none;
    }
  `]
})
export class ProcessTimelineComponent {
  @Input() steps: TimelineStep[] = [];

  getIcon(status: string): string {
    switch (status) {
      case 'completed': return 'check';
      case 'active': return 'radio_button_checked';
      case 'pending': return 'radio_button_unchecked';
      case 'cancelled': return 'close';
      default: return 'radio_button_unchecked';
    }
  }

  getIconClass(status: string): string {
    return `icon-${status}`;
  }
}














































