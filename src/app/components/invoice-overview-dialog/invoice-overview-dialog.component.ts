import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-invoice-overview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="invoice-overview-dialog">
      <h2 mat-dialog-title>
        <mat-icon>receipt</mat-icon>
        Aperçu de la Facture
      </h2>

      <mat-dialog-content *ngIf="!loading && invoice">
        <!-- En-tête -->
        <mat-card class="header-card">
          <mat-card-content>
            <div class="invoice-header">
              <div>
                <h3>{{ invoice.reference }}</h3>
                <p class="invoice-number">N° {{ invoice.invoiceNumber }}</p>
              </div>
              <mat-chip [class]="getStatusClass(invoice.status)">
                {{ getStatusLabel(invoice.status) }}
              </mat-chip>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Montants -->
        <mat-card class="amounts-card">
          <mat-card-header>
            <mat-icon>attach_money</mat-icon>
            <mat-card-title>Montants</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="amount-row">
              <span>Montant total:</span>
              <strong>{{ invoice.amounts.total | number:'1.2-2' }} TND</strong>
            </div>
            <div class="amount-row" *ngIf="invoice.amounts.paid > 0">
              <span>Montant payé:</span>
              <span class="paid">{{ invoice.amounts.paid | number:'1.2-2' }} TND</span>
            </div>
            <div class="amount-row" *ngIf="invoice.amounts.partialPaid > 0">
              <span>Paiement partiel:</span>
              <span>{{ invoice.amounts.partialPaid | number:'1.2-2' }} TND</span>
            </div>
            <mat-divider></mat-divider>
            <div class="amount-row total">
              <span>Montant restant:</span>
              <strong [class.overdue]="invoice.amounts.remaining > 0">
                {{ invoice.amounts.remaining | number:'1.2-2' }} TND
              </strong>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Dates -->
        <mat-card class="dates-card">
          <mat-card-header>
            <mat-icon>event</mat-icon>
            <mat-card-title>Dates</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="date-row">
              <mat-icon>create</mat-icon>
              <span>Date d'émission:</span>
              <strong>{{ invoice.dates.issue | date:'dd/MM/yyyy' }}</strong>
            </div>
            <div class="date-row" [class.overdue]="isOverdue(invoice.dates.due)">
              <mat-icon>alarm</mat-icon>
              <span>Date d'échéance:</span>
              <strong>{{ invoice.dates.due | date:'dd/MM/yyyy' }}</strong>
              <span *ngIf="isOverdue(invoice.dates.due)" class="overdue-badge">
                ({{ getDaysOverdue(invoice.dates.due) }} jours de retard)
              </span>
            </div>
            <div class="date-row" *ngIf="invoice.dates.payment">
              <mat-icon>check_circle</mat-icon>
              <span>Date de paiement:</span>
              <strong>{{ invoice.dates.payment | date:'dd/MM/yyyy' }}</strong>
            </div>
            <div class="date-row" *ngIf="invoice.dates.sentToClient">
              <mat-icon>send</mat-icon>
              <span>Envoyée au client:</span>
              <strong>{{ invoice.dates.sentToClient | date:'dd/MM/yyyy HH:mm' }}</strong>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Client -->
        <mat-card class="client-card" *ngIf="invoice.client">
          <mat-card-header>
            <mat-icon>person</mat-icon>
            <mat-card-title>Client</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-row">
              <span>ID Client:</span>
              <strong>{{ invoice.client.id || 'N/A' }}</strong>
            </div>
            <div class="info-row" *ngIf="invoice.client.email">
              <span>Email:</span>
              <a [href]="'mailto:' + invoice.client.email">{{ invoice.client.email }}</a>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Paiement -->
        <mat-card class="payment-card" *ngIf="invoice.paymentMethod || invoice.paymentReference">
          <mat-card-header>
            <mat-icon>payment</mat-icon>
            <mat-card-title>Informations de Paiement</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-row" *ngIf="invoice.paymentMethod">
              <span>Méthode:</span>
              <strong>{{ invoice.paymentMethod }}</strong>
            </div>
            <div class="info-row" *ngIf="invoice.paymentReference">
              <span>Référence:</span>
              <strong>{{ invoice.paymentReference }}</strong>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Commentaires -->
        <mat-card class="comments-card" *ngIf="invoice.comments || invoice.validationNotes">
          <mat-card-header>
            <mat-icon>comment</mat-icon>
            <mat-card-title>Commentaires</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p *ngIf="invoice.comments">{{ invoice.comments }}</p>
            <p *ngIf="invoice.validationNotes" class="validation-notes">
              <strong>Notes de validation:</strong> {{ invoice.validationNotes }}
            </p>
          </mat-card-content>
        </mat-card>

        <!-- Audit -->
        <mat-card class="audit-card">
          <mat-card-header>
            <mat-icon>history</mat-icon>
            <mat-card-title>Traçabilité</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-row" *ngIf="invoice.audit.createdBy">
              <span>Créée par:</span>
              <strong>{{ invoice.audit.createdBy }}</strong>
            </div>
            <div class="info-row" *ngIf="invoice.audit.lastModifiedBy">
              <span>Modifiée par:</span>
              <strong>{{ invoice.audit.lastModifiedBy }}</strong>
            </div>
            <div class="info-row" *ngIf="invoice.audit.sentBy">
              <span>Envoyée par:</span>
              <strong>{{ invoice.audit.sentBy }}</strong>
            </div>
            <div class="info-row" *ngIf="invoice.audit.validatedBy">
              <span>Validée par:</span>
              <strong>{{ invoice.audit.validatedBy }}</strong>
            </div>
          </mat-card-content>
        </mat-card>
      </mat-dialog-content>

      <div *ngIf="loading" class="loading">
        <mat-icon>hourglass_empty</mat-icon>
        <p>Chargement...</p>
      </div>

      <div *ngIf="error" class="error">
        <mat-icon>error</mat-icon>
        <p>{{ error }}</p>
      </div>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Fermer</button>
        <button mat-raised-button color="primary" *ngIf="invoice" (click)="viewFullInvoice()">
          <mat-icon>open_in_new</mat-icon>
          Voir la facture complète
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .invoice-overview-dialog {
      min-width: 600px;
      max-width: 800px;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #1976d2;
      
      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
    }

    mat-dialog-content {
      padding: 20px;
      max-height: 70vh;
      overflow-y: auto;
    }

    mat-card {
      margin-bottom: 16px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }

    mat-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      
      mat-icon {
        color: #1976d2;
      }
      
      mat-card-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .header-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      
      .invoice-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        h3 {
          margin: 0 0 4px 0;
          font-size: 24px;
        }
        
        .invoice-number {
          margin: 0;
          opacity: 0.9;
        }
      }
    }

    .amount-row, .date-row, .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      
      &:not(:last-child) {
        border-bottom: 1px solid #f0f0f0;
      }
      
      &.total {
        font-size: 18px;
        padding-top: 12px;
      }
      
      &.overdue {
        color: #d32f2f;
      }
    }

    .date-row {
      display: flex;
      gap: 8px;
      
      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #666;
      }
      
      span:first-of-type {
        flex: 1;
      }
    }

    .paid {
      color: #4caf50;
    }

    .overdue-badge {
      color: #d32f2f;
      font-weight: 600;
      font-size: 12px;
    }

    mat-chip {
      &.status-paid {
        background: #4caf50 !important;
        color: white;
      }
      
      &.status-overdue {
        background: #d32f2f !important;
        color: white;
      }
      
      &.status-pending {
        background: #ff9800 !important;
        color: white;
      }
    }

    .loading, .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
    }

    .error {
      color: #d32f2f;
    }

    .validation-notes {
      background: #e3f2fd;
      padding: 12px;
      border-radius: 4px;
      border-left: 4px solid #1976d2;
      margin-top: 8px;
    }
  `]
})
export class InvoiceOverviewDialogComponent {
  invoice: any = null;
  loading = true;
  error: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { invoiceId: string },
    private dialogRef: MatDialogRef<InvoiceOverviewDialogComponent>,
    private http: HttpClient
  ) {
    this.loadInvoice();
  }

  loadInvoice(): void {
    this.http.get(`${environment.apiUrl}/invoices/${this.data.invoiceId}/overview`)
      .subscribe({
        next: (response: any) => {
          this.invoice = response.invoice;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erreur lors du chargement de la facture';
          this.loading = false;
          console.error('Erreur:', error);
        }
      });
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PAID': return 'status-paid';
      case 'OVERDUE': return 'status-overdue';
      case 'PENDING': return 'status-pending';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PAID': return '✅ Payée';
      case 'OVERDUE': return '🔴 En retard';
      case 'PENDING': return '🟡 En attente';
      case 'SENT': return '📤 Envoyée';
      case 'DRAFT': return '📝 Brouillon';
      default: return status;
    }
  }

  isOverdue(dueDate: string): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }

  getDaysOverdue(dueDate: string): number {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const now = new Date();
    const diff = now.getTime() - due.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  viewFullInvoice(): void {
    // Ouvrir la facture complète dans un nouvel onglet ou naviguer vers la page de détail
    console.log('Voir facture complète:', this.invoice.id);
    // TODO: Implémenter la navigation
  }

  close(): void {
    this.dialogRef.close();
  }
}
