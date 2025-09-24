import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-invoice-history-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule
  ],
  template: `
    <h2 mat-dialog-title>Historique de la facture</h2>
    <mat-dialog-content>
      <div class="invoice-info">
        <h3>Facture #{{ data.invoice?.reference }}</h3>
        <p><strong>Montant:</strong> {{ data.invoice?.amount | currency:'EUR':'symbol':'1.0-0' }}</p>
        <p><strong>Statut:</strong> {{ data.invoice?.status }}</p>
      </div>

      <div class="history-section">
        <h4>Historique des actions</h4>
        <table mat-table [dataSource]="historyData" class="history-table">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let item">{{ item.date | date:'dd/MM/yyyy HH:mm' }}</td>
          </ng-container>

          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef>Action</th>
            <td mat-cell *matCellDef="let item">{{ item.action }}</td>
          </ng-container>

          <ng-container matColumnDef="user">
            <th mat-header-cell *matHeaderCellDef>Utilisateur</th>
            <td mat-cell *matCellDef="let item">{{ item.user }}</td>
          </ng-container>

          <ng-container matColumnDef="comment">
            <th mat-header-cell *matHeaderCellDef>Commentaire</th>
            <td mat-cell *matCellDef="let item">{{ item.comment }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .invoice-info {
      margin-bottom: 20px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    
    .history-section {
      margin-top: 20px;
    }
    
    .history-table {
      width: 100%;
      margin-top: 10px;
    }
    
    mat-dialog-content {
      min-width: 600px;
      max-height: 500px;
    }
  `]
})
export class InvoiceHistoryDialogComponent {
  displayedColumns: string[] = ['date', 'action', 'user', 'comment'];
  historyData: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<InvoiceHistoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { invoice: any }
  ) {
    // Données d'exemple pour l'historique
    this.historyData = [
      {
        date: new Date('2024-01-15'),
        action: 'Création',
        user: 'Commercial',
        comment: 'Facture créée'
      },
      {
        date: new Date('2024-01-16'),
        action: 'Envoi',
        user: 'Commercial',
        comment: 'Facture envoyée au client'
      },
      {
        date: new Date('2024-01-20'),
        action: 'Paiement',
        user: 'Client',
        comment: 'Paiement reçu'
      }
    ];
  }

  onClose(): void {
    this.dialogRef.close();
  }
}





































