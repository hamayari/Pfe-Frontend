import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ConventionHistoryItem {
  id: string;
  conventionId: string;
  conventionReference: string;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  modifiedBy: string;
  modifiedByName: string;
  modifiedAt: string;
  comment?: string;
}

@Component({
  selector: 'app-convention-history-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="history-modal">
      <div class="modal-header">
        <div class="header-content">
          <mat-icon class="header-icon">history</mat-icon>
          <div class="header-text">
            <h2>Historique des Modifications</h2>
            <p class="convention-ref">Convention: {{ data.conventionReference }}</p>
          </div>
        </div>
        <button mat-icon-button (click)="close()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="modal-body">
        <!-- Loading -->
        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Chargement de l'historique...</p>
        </div>

        <!-- Empty state -->
        <div *ngIf="!loading && history.length === 0" class="empty-state">
          <mat-icon>info</mat-icon>
          <p>Aucun historique disponible pour cette convention</p>
        </div>

        <!-- Timeline -->
        <div *ngIf="!loading && history.length > 0" class="timeline">
          <div *ngFor="let item of history; let i = index" class="timeline-item">
            <div class="timeline-marker" [style.background]="getActionColor(item.action)">
              <mat-icon>{{ getActionIcon(item.action) }}</mat-icon>
            </div>
            
            <div class="timeline-content" [class.latest]="i === 0">
              <div class="content-header">
                <div class="action-badge" [style.background]="getActionColor(item.action)">
                  {{ getActionLabel(item.action) }}
                </div>
                <div class="timestamp">
                  {{ formatDate(item.modifiedAt) }}
                </div>
              </div>

              <div class="content-body">
                <div class="description">
                  {{ getDescription(item) }}
                </div>

                <div class="user-info">
                  <mat-icon class="user-icon">person</mat-icon>
                  <span>{{ item.modifiedByName || item.modifiedBy }}</span>
                </div>

                <!-- Détails du changement -->
                <div *ngIf="item.action === 'UPDATE' && item.fieldName" class="change-details">
                  <div class="field-name">
                    <mat-icon>label</mat-icon>
                    <span>{{ getFieldLabel(item.fieldName) }}</span>
                  </div>
                  <div class="value-change">
                    <div class="old-value">
                      <span class="label">Ancien:</span>
                      <span class="value">{{ item.oldValue || 'N/A' }}</span>
                    </div>
                    <mat-icon class="arrow">arrow_forward</mat-icon>
                    <div class="new-value">
                      <span class="label">Nouveau:</span>
                      <span class="value">{{ item.newValue || 'N/A' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Commentaire -->
                <div *ngIf="item.comment" class="comment">
                  <mat-icon>comment</mat-icon>
                  <span>{{ item.comment }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="stats">
          <mat-icon>analytics</mat-icon>
          <span>{{ history.length }} modification(s) enregistrée(s)</span>
        </div>
        <button mat-raised-button color="primary" (click)="close()">
          Fermer
        </button>
      </div>
    </div>
  `,
  styles: [`
    .history-modal {
      width: 700px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #e0e0e0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .header-text h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .convention-ref {
      margin: 4px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }

    .close-btn {
      color: white;
    }

    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      background: #f5f5f5;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 16px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 16px;
      color: #757575;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      opacity: 0.3;
    }

    .timeline {
      position: relative;
      padding-left: 40px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 19px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
    }

    .timeline-item {
      position: relative;
      margin-bottom: 32px;
    }

    .timeline-marker {
      position: absolute;
      left: -40px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 1;
    }

    .timeline-marker mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .timeline-content {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .timeline-content:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      transform: translateX(4px);
    }

    .timeline-content.latest {
      border: 2px solid #667eea;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
    }

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .action-badge {
      padding: 4px 12px;
      border-radius: 16px;
      color: white;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .timestamp {
      font-size: 12px;
      color: #757575;
    }

    .content-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .description {
      font-size: 15px;
      color: #333;
      font-weight: 500;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 13px;
    }

    .user-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .change-details {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 12px;
      margin-top: 8px;
    }

    .field-name {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }

    .field-name mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #667eea;
    }

    .value-change {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      background: white;
      border-radius: 6px;
    }

    .old-value, .new-value {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .old-value .label, .new-value .label {
      font-size: 11px;
      text-transform: uppercase;
      color: #999;
      font-weight: 600;
    }

    .old-value .value {
      color: #f44336;
      text-decoration: line-through;
    }

    .new-value .value {
      color: #4caf50;
      font-weight: 600;
    }

    .arrow {
      color: #667eea;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .comment {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: #fff3e0;
      border-left: 3px solid #ff9800;
      border-radius: 4px;
      font-size: 13px;
      color: #666;
    }

    .comment mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #ff9800;
    }

    .modal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      background: white;
    }

    .stats {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
    }

    .stats mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #667eea;
    }
  `]
})
export class ConventionHistoryModalComponent implements OnInit {
  history: ConventionHistoryItem[] = [];
  loading = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { conventionId: string; conventionReference: string },
    private dialogRef: MatDialogRef<ConventionHistoryModalComponent>,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.loading = true;
    this.http.get<ConventionHistoryItem[]>(
      `${environment.apiUrl}/convention-history/convention/${this.data.conventionId}`
    ).subscribe({
      next: (data) => {
        this.history = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement historique:', error);
        this.loading = false;
      }
    });
  }

  close() {
    this.dialogRef.close();
  }

  getActionLabel(action: string): string {
    const labels: { [key: string]: string } = {
      'CREATE': 'Création',
      'UPDATE': 'Modification',
      'DELETE': 'Suppression',
      'STATUS_CHANGE': 'Changement Statut'
    };
    return labels[action] || action;
  }

  getActionIcon(action: string): string {
    const icons: { [key: string]: string } = {
      'CREATE': 'add_circle',
      'UPDATE': 'edit',
      'DELETE': 'delete',
      'STATUS_CHANGE': 'swap_horiz'
    };
    return icons[action] || 'info';
  }

  getActionColor(action: string): string {
    const colors: { [key: string]: string } = {
      'CREATE': '#4CAF50',
      'UPDATE': '#2196F3',
      'DELETE': '#F44336',
      'STATUS_CHANGE': '#FF9800'
    };
    return colors[action] || '#9E9E9E';
  }

  getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      'title': 'Titre',
      'description': 'Description',
      'amount': 'Montant',
      'startDate': 'Date de début',
      'endDate': 'Date de fin',
      'status': 'Statut',
      'structureId': 'Structure',
      'governorate': 'Gouvernorat',
      'paymentTerms': 'Modalités de paiement'
    };
    return labels[field] || field;
  }

  getDescription(item: ConventionHistoryItem): string {
    switch (item.action) {
      case 'CREATE':
        return 'Convention créée';
      case 'DELETE':
        return 'Convention supprimée';
      case 'STATUS_CHANGE':
        return `Statut changé de "${item.oldValue}" à "${item.newValue}"`;
      case 'UPDATE':
        if (item.fieldName) {
          return `Champ "${this.getFieldLabel(item.fieldName)}" modifié`;
        }
        return 'Convention modifiée';
      default:
        return 'Action inconnue';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
