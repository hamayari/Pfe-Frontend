import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

export interface EventDetailsData {
  invoice: any;
  type: 'overdue' | 'upcoming';
}

@Component({
  selector: 'app-event-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="event-details-modal">
      <div class="modal-header">
        <div class="header-icon" [class.critical]="data.type === 'overdue'" [class.warning]="data.type === 'upcoming'">
          <mat-icon>{{ data.type === 'overdue' ? 'error' : 'schedule' }}</mat-icon>
        </div>
        <div class="header-content">
          <h2>{{ getTitle() }}</h2>
          <p class="subtitle">{{ getSubtitle() }}</p>
        </div>
        <button mat-icon-button class="close-btn" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-divider></mat-divider>

      <div class="modal-body">
        <!-- Informations principales -->
        <div class="info-section">
          <h3>
            <mat-icon>info</mat-icon>
            Informations Générales
          </h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Numéro de Facture</span>
              <span class="info-value">{{ data.invoice.invoiceNumber || data.invoice.id || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Convention Associée</span>
              <span class="info-value">{{ data.invoice.conventionReference || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Montant</span>
              <span class="info-value amount">{{ data.invoice.amount | currency:'EUR' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Statut</span>
              <mat-chip [class.status-overdue]="data.invoice.status === 'OVERDUE'" 
                        [class.status-pending]="data.invoice.status === 'PENDING'"
                        [class.status-paid]="data.invoice.status === 'PAID'">
                {{ getStatusLabel(data.invoice.status) }}
              </mat-chip>
            </div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Dates et échéances -->
        <div class="info-section">
          <h3>
            <mat-icon>event</mat-icon>
            Dates et Échéances
          </h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Date d'Échéance</span>
              <span class="info-value date">{{ data.invoice.dueDate | date:'fullDate' }}</span>
            </div>
            <div class="info-item" *ngIf="data.type === 'overdue'">
              <span class="info-label">Retard</span>
              <span class="info-value overdue-days">{{ getDaysOverdue() }} jour(s)</span>
            </div>
            <div class="info-item" *ngIf="data.type === 'upcoming'">
              <span class="info-label">Jours Restants</span>
              <span class="info-value upcoming-days">{{ getDaysUntil() }} jour(s)</span>
            </div>
            <div class="info-item" *ngIf="data.invoice.createdAt">
              <span class="info-label">Date de Création</span>
              <span class="info-value">{{ data.invoice.createdAt | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Détails supplémentaires -->
        <div class="info-section" *ngIf="data.invoice.description || data.invoice.notes">
          <h3>
            <mat-icon>description</mat-icon>
            Détails Supplémentaires
          </h3>
          <div class="description-content">
            <p *ngIf="data.invoice.description">{{ data.invoice.description }}</p>
            <p *ngIf="data.invoice.notes" class="notes">
              <strong>Notes:</strong> {{ data.invoice.notes }}
            </p>
          </div>
        </div>

        <!-- Actions recommandées -->
        <div class="info-section recommendations">
          <h3>
            <mat-icon>lightbulb</mat-icon>
            Actions Recommandées
          </h3>
          <div class="recommendations-list">
            <div class="recommendation-item" *ngIf="data.type === 'overdue'">
              <mat-icon class="rec-icon critical">priority_high</mat-icon>
              <div class="rec-content">
                <strong>Action Urgente</strong>
                <p>Cette facture est en retard. Envoyez un rappel immédiatement au client.</p>
              </div>
            </div>
            <div class="recommendation-item" *ngIf="data.type === 'upcoming'">
              <mat-icon class="rec-icon warning">schedule</mat-icon>
              <div class="rec-content">
                <strong>Rappel Préventif</strong>
                <p>L'échéance approche. Envoyez un rappel préventif au client.</p>
              </div>
            </div>
            <div class="recommendation-item">
              <mat-icon class="rec-icon info">phone</mat-icon>
              <div class="rec-content">
                <strong>Contact Direct</strong>
                <p>Contactez le client par téléphone pour un suivi personnalisé.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <mat-divider></mat-divider>

      <div class="modal-footer">
        <button mat-stroked-button (click)="close()">
          <mat-icon>close</mat-icon>
          Fermer
        </button>
        <button mat-raised-button color="primary" (click)="sendReminder()">
          <mat-icon>send</mat-icon>
          Envoyer un Rappel
        </button>
        <button mat-raised-button color="accent" (click)="viewFullDetails()">
          <mat-icon>open_in_new</mat-icon>
          Voir Facture Complète
        </button>
      </div>
    </div>
  `,
  styles: [`
    .event-details-modal {
      max-width: 700px;
      width: 100%;
    }

    .modal-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .header-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
    }

    .header-icon.critical {
      background: rgba(239, 68, 68, 0.3);
    }

    .header-icon.warning {
      background: rgba(251, 191, 36, 0.3);
    }

    .header-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .header-content {
      flex: 1;
    }

    .header-content h2 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .subtitle {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }

    .close-btn {
      color: white;
    }

    .modal-body {
      padding: 24px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .info-section {
      margin-bottom: 24px;
    }

    .info-section:last-child {
      margin-bottom: 0;
    }

    .info-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }

    .info-section h3 mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #667eea;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-label {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 16px;
      font-weight: 500;
      color: #1f2937;
    }

    .info-value.amount {
      font-size: 20px;
      font-weight: 700;
      color: #667eea;
    }

    .info-value.date {
      color: #4b5563;
    }

    .info-value.overdue-days {
      color: #ef4444;
      font-weight: 700;
    }

    .info-value.upcoming-days {
      color: #f59e0b;
      font-weight: 700;
    }

    mat-chip {
      font-weight: 600;
    }

    mat-chip.status-overdue {
      background-color: #fee2e2;
      color: #991b1b;
    }

    mat-chip.status-pending {
      background-color: #fef3c7;
      color: #92400e;
    }

    mat-chip.status-paid {
      background-color: #d1fae5;
      color: #065f46;
    }

    .description-content {
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .description-content p {
      margin: 0 0 8px 0;
      color: #4b5563;
      line-height: 1.6;
    }

    .description-content p:last-child {
      margin-bottom: 0;
    }

    .notes {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }

    .recommendations {
      background: #fef3c7;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 0;
    }

    .recommendations h3 {
      color: #92400e;
    }

    .recommendations-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .recommendation-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: white;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
    }

    .rec-icon {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .rec-icon.critical {
      color: #ef4444;
      background: #fee2e2;
    }

    .rec-icon.warning {
      color: #f59e0b;
      background: #fef3c7;
    }

    .rec-icon.info {
      color: #3b82f6;
      background: #dbeafe;
    }

    .rec-content {
      flex: 1;
    }

    .rec-content strong {
      display: block;
      margin-bottom: 4px;
      color: #1f2937;
      font-size: 14px;
    }

    .rec-content p {
      margin: 0;
      color: #6b7280;
      font-size: 13px;
      line-height: 1.5;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }

    mat-divider {
      margin: 0;
    }

    /* Scrollbar styling */
    .modal-body::-webkit-scrollbar {
      width: 8px;
    }

    .modal-body::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }

    .modal-body::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    .modal-body::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `]
})
export class EventDetailsModalComponent {
  constructor(
    public dialogRef: MatDialogRef<EventDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EventDetailsData
  ) {}

  getTitle(): string {
    if (this.data.type === 'overdue') {
      return 'Facture en Retard - Action Requise';
    } else {
      return 'Échéance Proche - Rappel Préventif';
    }
  }

  getSubtitle(): string {
    const invoiceRef = this.data.invoice.invoiceNumber || this.data.invoice.id || 'Facture';
    if (this.data.type === 'overdue') {
      return `${invoiceRef} - En retard de ${this.getDaysOverdue()} jour(s)`;
    } else {
      return `${invoiceRef} - Échéance dans ${this.getDaysUntil()} jour(s)`;
    }
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'OVERDUE': 'En Retard',
      'PENDING': 'En Attente',
      'PAID': 'Payée',
      'PARTIAL': 'Paiement Partiel'
    };
    return labels[status] || status;
  }

  getDaysOverdue(): number {
    const dueDate = new Date(this.data.invoice.dueDate);
    const today = new Date();
    const diffTime = today.getTime() - dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysUntil(): number {
    const dueDate = new Date(this.data.invoice.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  close(): void {
    this.dialogRef.close();
  }

  sendReminder(): void {
    // Fermer le modal et retourner l'action
    this.dialogRef.close({ action: 'sendReminder', invoice: this.data.invoice });
  }

  viewFullDetails(): void {
    // Fermer le modal et naviguer vers la liste des factures avec sélection
    this.dialogRef.close({ action: 'viewFullDetails', invoice: this.data.invoice });
  }
}
