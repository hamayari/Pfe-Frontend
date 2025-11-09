import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-convention-status-badge',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule, MatTooltipModule],
  template: `
    <mat-chip-set>
      <mat-chip 
        [class]="'status-chip status-' + status.toLowerCase()"
        [matTooltip]="getTooltip()"
        matTooltipPosition="above">
        <mat-icon [class]="'status-icon'">{{ getIcon() }}</mat-icon>
        <span class="status-label">{{ getLabel() }}</span>
      </mat-chip>
    </mat-chip-set>
  `,
  styles: [`
    .status-chip {
      font-weight: 500;
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.3s ease;
      cursor: default;
    }

    .status-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .status-label {
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Status ACTIVE - Vert */
    .status-active {
      background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    }

    .status-active:hover {
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
      transform: translateY(-1px);
    }

    /* Status PROCHE_ECHEANCE - Orange */
    .status-proche_echeance {
      background: linear-gradient(135deg, #FF9800 0%, #FFB74D 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
      animation: pulse 2s ease-in-out infinite;
    }

    .status-proche_echeance:hover {
      box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
      transform: translateY(-1px);
    }

    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
      }
      50% {
        box-shadow: 0 4px 16px rgba(255, 152, 0, 0.5);
      }
    }

    /* Status EXPIRED - Rouge */
    .status-expired {
      background: linear-gradient(135deg, #F44336 0%, #EF5350 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
    }

    .status-expired:hover {
      box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
      transform: translateY(-1px);
    }

    /* Status PENDING - Bleu */
    .status-pending {
      background: linear-gradient(135deg, #2196F3 0%, #42A5F5 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
    }

    .status-pending:hover {
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
      transform: translateY(-1px);
    }

    /* Status COMPLETED - Gris foncé */
    .status-completed {
      background: linear-gradient(135deg, #607D8B 0%, #78909C 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(96, 125, 139, 0.3);
    }

    .status-completed:hover {
      box-shadow: 0 4px 12px rgba(96, 125, 139, 0.4);
      transform: translateY(-1px);
    }

    /* Status par défaut */
    .status-chip:not([class*="status-"]) {
      background: linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(158, 158, 158, 0.3);
    }
  `]
})
export class ConventionStatusBadgeComponent {
  @Input() status: string = 'UNKNOWN';

  getLabel(): string {
    const labels: { [key: string]: string } = {
      'ACTIVE': 'Active',
      'PROCHE_ECHEANCE': 'Proche échéance',
      'EXPIRED': 'Expirée',
      'PENDING': 'En attente',
      'COMPLETED': 'Terminée'
    };
    return labels[this.status] || this.status;
  }

  getIcon(): string {
    const icons: { [key: string]: string } = {
      'ACTIVE': 'check_circle',
      'PROCHE_ECHEANCE': 'warning',
      'EXPIRED': 'cancel',
      'PENDING': 'schedule',
      'COMPLETED': 'done_all'
    };
    return icons[this.status] || 'help';
  }

  getTooltip(): string {
    const tooltips: { [key: string]: string } = {
      'ACTIVE': 'Convention active - Plus de 30 jours restants',
      'PROCHE_ECHEANCE': 'Attention ! Moins de 30 jours avant l\'échéance',
      'EXPIRED': 'Convention expirée - Date de fin dépassée',
      'PENDING': 'Convention en attente de démarrage',
      'COMPLETED': 'Convention terminée avec succès'
    };
    return tooltips[this.status] || 'Statut inconnu';
  }
}
