import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface QuickAction {
  title: string;
  icon: string;
  description: string;
  link: string;
  roles?: string[];
  color?: 'primary' | 'accent' | 'warn' | '';
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule, MatTooltipModule],
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.scss']
})
export class QuickActionsComponent implements OnInit {
  @Input() actions: QuickAction[] = [];
  @Input() maxItems: number = 4;
  
  displayedActions: QuickAction[] = [];
  
  ngOnInit(): void {
    this.updateDisplayedActions();
  }
  
  ngOnChanges(): void {
    this.updateDisplayedActions();
  }
  
  private updateDisplayedActions(): void {
    if (this.actions && this.actions.length > 0) {
      // In a real app, filter actions based on user roles
      this.displayedActions = this.maxItems 
        ? [...this.actions].slice(0, this.maxItems)
        : [...this.actions];
    } else {
      this.displayedActions = [];
    }
  }
  
  getButtonClass(action: QuickAction): string {
    const baseClass = 'action-button';
    const colorClass = action.color ? `mat-${action.color}` : '';
    return `${baseClass} ${colorClass}`.trim();
  }
  
  trackByAction(index: number, action: QuickAction): string {
    return action.title;
  }
}
