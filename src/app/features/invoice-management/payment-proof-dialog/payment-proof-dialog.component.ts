import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

export interface PaymentProofDialogData {
  paymentId: string;
  proofFiles: any[];
}

@Component({
  selector: 'app-payment-proof-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <h2 mat-dialog-title>Preuves de paiement</h2>
    <mat-dialog-content>
      <div *ngIf="data.proofFiles.length === 0" class="no-proofs">
        <mat-icon>receipt_long</mat-icon>
        <p>Aucune preuve de paiement disponible</p>
      </div>
      
      <div *ngFor="let proof of data.proofFiles" class="proof-item">
        <mat-card>
          <mat-card-header>
            <mat-card-title>
              <mat-icon>description</mat-icon>
              {{ proof.filename }}
            </mat-card-title>
            <mat-card-subtitle>
              Ajouté le {{ proof.uploadDate | date:'dd/MM/yyyy HH:mm' }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Taille: {{ proof.size }} bytes</p>
            <p>Type: {{ proof.type }}</p>
            <mat-chip color="primary">{{ proof.status }}</mat-chip>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" (click)="downloadProof(proof)">
              <mat-icon>download</mat-icon>
              Télécharger
            </button>
            <button mat-button color="warn" (click)="deleteProof(proof)">
              <mat-icon>delete</mat-icon>
              Supprimer
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .no-proofs {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .no-proofs mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
    .proof-item {
      margin-bottom: 16px;
    }
    mat-dialog-content {
      min-width: 500px;
      max-height: 400px;
      overflow-y: auto;
    }
  `]
})
export class PaymentProofDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PaymentProofDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentProofDialogData
  ) {}

  downloadProof(proof: any): void {
    // Logique de téléchargement
    console.log('Téléchargement de:', proof.filename);
  }

  deleteProof(proof: any): void {
    // Logique de suppression
    console.log('Suppression de:', proof.filename);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}



