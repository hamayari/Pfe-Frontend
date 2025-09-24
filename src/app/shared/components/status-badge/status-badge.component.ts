import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [class]="getStatusClass()">
      {{ getStatusText() }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge.active {
      background-color: #e8f5e8;
      color: #2e7d32;
      border: 1px solid #a5d6a7;
    }

    .status-badge.pending {
      background-color: #fff3e0;
      color: #f57c00;
      border: 1px solid #ffcc02;
    }

    .status-badge.inactive {
      background-color: #ffebee;
      color: #c62828;
      border: 1px solid #ef9a9a;
    }

    .status-badge.expired {
      background-color: #f3e5f5;
      color: #7b1fa2;
      border: 1px solid #ce93d8;
    }

    .status-badge.completed {
      background-color: #e3f2fd;
      color: #1565c0;
      border: 1px solid #90caf9;
    }

    .status-badge.cancelled {
      background-color: #fafafa;
      color: #616161;
      border: 1px solid #e0e0e0;
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';
  @Input() statusMap?: { [key: string]: string };

  getStatusClass(): string {
    const status = this.status.toLowerCase();
    if (status.includes('active') || status.includes('actif')) return 'active';
    if (status.includes('pending') || status.includes('en attente')) return 'pending';
    if (status.includes('inactive') || status.includes('inactif')) return 'inactive';
    if (status.includes('expired') || status.includes('expiré')) return 'expired';
    if (status.includes('completed') || status.includes('terminé')) return 'completed';
    if (status.includes('cancelled') || status.includes('annulé')) return 'cancelled';
    return 'active';
  }

  getStatusText(): string {
    if (this.statusMap && this.statusMap[this.status]) {
      return this.statusMap[this.status];
    }
    return this.status || 'Actif';
  }
}






























