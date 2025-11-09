import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface ConventionHistoryData {
  convention: any;
  history: any[];
}

@Component({
  selector: 'app-convention-history-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="history-modal-container">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="header-icon">
            <mat-icon>history</mat-icon>
          </div>
          <div class="header-text">
            <h2>Historique de la Convention</h2>
            <p class="convention-ref">{{ data.convention.reference }}</p>
          </div>
        </div>
        <button class="close-button" (click)="onClose()" mat-icon-button>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Convention Info Card -->
      <div class="convention-info-card">
        <div class="info-grid">
          <div class="info-item">
            <mat-icon>title</mat-icon>
            <div class="info-content">
              <span class="info-label">Titre</span>
              <span class="info-value">{{ data.convention.title }}</span>
            </div>
          </div>
          <div class="info-item">
            <mat-icon>location_on</mat-icon>
            <div class="info-content">
              <span class="info-label">Gouvernorat</span>
              <span class="info-value">{{ data.convention.governorate || 'N/A' }}</span>
            </div>
          </div>
          <div class="info-item">
            <mat-icon>euro</mat-icon>
            <div class="info-content">
              <span class="info-label">Montant</span>
              <span class="info-value">{{ data.convention.amount | number:'1.2-2' }} €</span>
            </div>
          </div>
          <div class="info-item">
            <mat-icon>flag</mat-icon>
            <div class="info-content">
              <span class="info-label">Statut</span>
              <mat-chip [class]="'status-chip status-' + data.convention.status?.toLowerCase()">
                {{ data.convention.status }}
              </mat-chip>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline Content -->
      <div class="modal-content">
        <div class="timeline-header">
          <mat-icon>timeline</mat-icon>
          <h3>Chronologie des Événements</h3>
          <span class="event-count">{{ data.history.length || 0 }} événement(s)</span>
        </div>

        <div class="timeline-container" *ngIf="data.history && data.history.length > 0; else noHistory">
          <div class="timeline-item" *ngFor="let entry of data.history; let i = index" 
               [class.timeline-item-first]="i === 0">
            <div class="timeline-marker">
              <div class="timeline-dot" [class]="'dot-' + getActionType(entry.action)">
                <mat-icon>{{ getActionIcon(entry.action) }}</mat-icon>
              </div>
              <div class="timeline-line" *ngIf="i < data.history.length - 1"></div>
            </div>
            
            <div class="timeline-content">
              <div class="event-card">
                <div class="event-header">
                  <div class="event-title">
                    <mat-icon class="event-icon" [class]="'icon-' + getActionType(entry.action)">
                      {{ getActionIcon(entry.action) }}
                    </mat-icon>
                    <span class="event-action">{{ formatAction(entry.action) }}</span>
                  </div>
                  <mat-chip class="event-chip" [class]="'chip-' + getActionType(entry.action)">
                    {{ getActionType(entry.action) }}
                  </mat-chip>
                </div>
                
                <div class="event-details">
                  <div class="event-meta">
                    <div class="meta-item">
                      <mat-icon>person</mat-icon>
                      <span>{{ entry.user || 'Système' }}</span>
                    </div>
                    <div class="meta-item">
                      <mat-icon>schedule</mat-icon>
                      <span>{{ formatDate(entry.date) }}</span>
                    </div>
                  </div>
                  
                  <div class="event-description" *ngIf="entry.changes">
                    <mat-icon>info</mat-icon>
                    <span>{{ entry.changes }}</span>
                  </div>
                  
                  <div class="event-changes" *ngIf="entry.oldValue || entry.newValue">
                    <div class="change-item" *ngIf="entry.oldValue">
                      <span class="change-label">Ancienne valeur:</span>
                      <span class="change-value old-value">{{ entry.oldValue }}</span>
                    </div>
                    <mat-icon class="change-arrow">arrow_forward</mat-icon>
                    <div class="change-item" *ngIf="entry.newValue">
                      <span class="change-label">Nouvelle valeur:</span>
                      <span class="change-value new-value">{{ entry.newValue }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noHistory>
          <div class="no-history">
            <mat-icon>inbox</mat-icon>
            <h3>Aucun historique disponible</h3>
            <p>Cette convention n'a pas encore d'historique d'activité.</p>
          </div>
        </ng-template>
      </div>

      <!-- Actions -->
      <div class="modal-actions">
        <button mat-stroked-button (click)="exportHistory()" class="export-button">
          <mat-icon>download</mat-icon>
          Exporter
        </button>
        <button mat-flat-button color="primary" (click)="onClose()" class="close-action-button">
          <mat-icon>check</mat-icon>
          Fermer
        </button>
      </div>
    </div>
  `,
  styles: [`
    .history-modal-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 900px;
      max-height: 90vh;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    /* Header */
    .modal-header {
      padding: 24px 28px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }

    .header-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .header-text h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .convention-ref {
      margin: 4px 0 0 0;
      opacity: 0.95;
      font-size: 0.95rem;
      font-weight: 500;
      background: rgba(255, 255, 255, 0.15);
      padding: 4px 12px;
      border-radius: 12px;
      display: inline-block;
    }

    .close-button {
      color: white;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      transition: all 0.2s ease;
    }

    .close-button:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(1.05);
    }

    /* Convention Info Card */
    .convention-info-card {
      padding: 20px 28px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-bottom: 1px solid #dee2e6;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .info-item mat-icon {
      color: #667eea;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .info-label {
      font-size: 0.75rem;
      color: #6c757d;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 0.95rem;
      color: #212529;
      font-weight: 600;
    }

    .status-chip {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 12px;
    }

    .status-active {
      background: #d4edda;
      color: #155724;
    }

    .status-pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-expired {
      background: #f8d7da;
      color: #721c24;
    }

    /* Content */
    .modal-content {
      flex: 1;
      padding: 24px 28px;
      overflow-y: auto;
      background: #f8f9fa;
    }

    .timeline-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #dee2e6;
    }

    .timeline-header mat-icon {
      color: #667eea;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .timeline-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #212529;
      flex: 1;
    }

    .event-count {
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    /* Timeline */
    .timeline-container {
      position: relative;
    }

    .timeline-item {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
      position: relative;
    }

    .timeline-item-first .event-card {
      border: 2px solid #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .timeline-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    .timeline-dot {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
    }

    .timeline-dot:hover {
      transform: scale(1.1);
    }

    .timeline-dot mat-icon {
      color: white;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .dot-creation {
      background: linear-gradient(135deg, #4caf50, #45a049);
    }

    .dot-modification {
      background: linear-gradient(135deg, #2196f3, #1976d2);
    }

    .dot-suppression {
      background: linear-gradient(135deg, #f44336, #d32f2f);
    }

    .dot-paiement {
      background: linear-gradient(135deg, #ff9800, #f57c00);
    }

    .dot-default {
      background: linear-gradient(135deg, #9e9e9e, #757575);
    }

    .timeline-line {
      width: 3px;
      flex: 1;
      background: linear-gradient(180deg, #dee2e6 0%, transparent 100%);
      margin-top: 4px;
    }

    .timeline-content {
      flex: 1;
    }

    .event-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      border: 1px solid #e9ecef;
    }

    .event-card:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    .event-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .event-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .event-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .icon-creation { color: #4caf50; }
    .icon-modification { color: #2196f3; }
    .icon-suppression { color: #f44336; }
    .icon-paiement { color: #ff9800; }
    .icon-default { color: #9e9e9e; }

    .event-action {
      font-size: 1.1rem;
      font-weight: 600;
      color: #212529;
    }

    .event-chip {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 12px;
    }

    .chip-creation {
      background: #d4edda;
      color: #155724;
    }

    .chip-modification {
      background: #d1ecf1;
      color: #0c5460;
    }

    .chip-suppression {
      background: #f8d7da;
      color: #721c24;
    }

    .chip-paiement {
      background: #fff3cd;
      color: #856404;
    }

    .chip-default {
      background: #e9ecef;
      color: #495057;
    }

    .event-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .event-meta {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .meta-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #667eea;
    }

    .event-description {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 3px solid #667eea;
    }

    .event-description mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #667eea;
      margin-top: 2px;
    }

    .event-description span {
      flex: 1;
      color: #495057;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .event-changes {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      flex-wrap: wrap;
    }

    .change-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 150px;
    }

    .change-label {
      font-size: 0.75rem;
      color: #6c757d;
      font-weight: 600;
      text-transform: uppercase;
    }

    .change-value {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .old-value {
      background: #f8d7da;
      color: #721c24;
    }

    .new-value {
      background: #d4edda;
      color: #155724;
    }

    .change-arrow {
      color: #667eea;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    /* No History */
    .no-history {
      text-align: center;
      padding: 60px 20px;
      color: #6c757d;
    }

    .no-history mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #dee2e6;
      margin-bottom: 20px;
    }

    .no-history h3 {
      margin: 0 0 10px 0;
      font-size: 1.25rem;
      color: #495057;
    }

    .no-history p {
      margin: 0;
      font-size: 0.95rem;
    }

    /* Actions */
    .modal-actions {
      padding: 20px 28px;
      background: #f8f9fa;
      border-top: 1px solid #dee2e6;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .export-button,
    .close-action-button {
      border-radius: 8px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 24px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
    }

    .close-action-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .close-action-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    /* Scrollbar */
    .modal-content::-webkit-scrollbar {
      width: 8px;
    }

    .modal-content::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    .modal-content::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }

    .modal-content::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }

    /* Animations */
    .history-modal-container {
      animation: slideInUp 0.3s ease-out;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .history-modal-container {
        max-width: 100%;
        max-height: 100vh;
        border-radius: 0;
      }

      .modal-header {
        padding: 20px;
      }

      .convention-info-card {
        padding: 16px 20px;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .modal-content {
        padding: 20px;
      }

      .timeline-item {
        gap: 12px;
      }

      .timeline-dot {
        width: 40px;
        height: 40px;
      }

      .event-card {
        padding: 16px;
      }

      .modal-actions {
        padding: 16px 20px;
        flex-direction: column;
      }

      .export-button,
      .close-action-button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ConventionHistoryModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ConventionHistoryModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConventionHistoryData
  ) {
    console.log('📜 Modal historique ouvert avec:', data);
  }

  getActionType(action: string): string {
    if (!action) return 'default';
    const actionLower = action.toLowerCase();
    if (actionLower.includes('créa') || actionLower.includes('creation')) return 'creation';
    if (actionLower.includes('modif') || actionLower.includes('update')) return 'modification';
    if (actionLower.includes('suppr') || actionLower.includes('delete')) return 'suppression';
    if (actionLower.includes('paie') || actionLower.includes('payment')) return 'paiement';
    return 'default';
  }

  getActionIcon(action: string): string {
    const type = this.getActionType(action);
    const icons: { [key: string]: string } = {
      'creation': 'add_circle',
      'modification': 'edit',
      'suppression': 'delete',
      'paiement': 'payment',
      'default': 'info'
    };
    return icons[type] || 'info';
  }

  formatAction(action: string): string {
    if (!action) return 'Action';
    return action.charAt(0).toUpperCase() + action.slice(1);
  }

  formatDate(date: any): string {
    if (!date) return 'Date inconnue';
    try {
      const d = new Date(date);
      return d.toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return date.toString();
    }
  }

  exportHistory(): void {
    console.log('📥 Export de l\'historique');
    // TODO: Implémenter l'export
    alert('Fonctionnalité d\'export en cours de développement');
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
