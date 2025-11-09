import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ActionButton {
  action: string;
  label: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-action-buttons',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="action-buttons-container">
      <h4>🎯 Actions disponibles :</h4>
      <div class="buttons-grid">
        <button 
          *ngFor="let btn of buttons"
          mat-raised-button 
          [color]="btn.color"
          (click)="onActionClick(btn.action)"
          class="action-btn">
          <mat-icon>{{ btn.icon }}</mat-icon>
          {{ btn.label }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .action-buttons-container {
      margin: 16px 0;
      padding: 16px;
      background: #f8f9ff;
      border-radius: 12px;
      border: 1.5px solid rgba(106, 17, 203, 0.2);
    }

    h4 {
      margin: 0 0 12px 0;
      color: #6a11cb;
      font-size: 14px;
      font-weight: 600;
    }

    .buttons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 500;
      text-transform: none;
      transition: all 0.3s ease;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }
  `]
})
export class ActionButtonsComponent {
  @Input() buttons: ActionButton[] = [];
  @Output() actionSelected = new EventEmitter<string>();

  onActionClick(action: string): void {
    this.actionSelected.emit(action);
  }
}
