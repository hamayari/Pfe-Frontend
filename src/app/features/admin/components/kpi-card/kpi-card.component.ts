import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    RouterModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss']
})
export class KpiCardComponent implements OnChanges {
  @Input() title: string = '';
  @Input() value: string | number = 0;
  @Input() change: number = 0; // Percentage change (can be positive or negative)
  @Input() icon: string = 'assessment';
  @Input() color: 'primary' | 'accent' | 'warn' | 'success' = 'primary';
  @Input() link: string = '#';
  @Input() isLoading: boolean = false;
  
  // Determine if the change is positive or negative
  isPositiveChange: boolean = false;
  isNegativeChange: boolean = false;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['change']) {
      this.isPositiveChange = this.change > 0;
      this.isNegativeChange = this.change < 0;
    }
  }
  
  // Format the change value with + or - sign
  get formattedChange(): string {
    if (this.change > 0) {
      return `+${this.change}%`;
    } else if (this.change < 0) {
      return `${this.change}%`;
    }
    return '0%';
  }
  
  // Get the appropriate icon based on change direction
  get changeIcon(): string {
    if (this.change > 0) {
      return 'trending_up';
    } else if (this.change < 0) {
      return 'trending_down';
    }
    return 'trending_flat';
  }
  
  // Get the appropriate color class for the change indicator
  get changeColor(): string {
    if (this.change > 0) {
      return 'success';
    } else if (this.change < 0) {
      return 'warn';
    }
    return '';
  }
}
