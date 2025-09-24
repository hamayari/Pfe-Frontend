import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-invoice-workflow-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCardModule,
    MatDividerModule
  ],
  template: `
    <div class="dialog-container">
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-content">
          <div class="header-icon">
            <mat-icon>workflow</mat-icon>
          </div>
          <div class="header-text">
            <h2>Workflow de facture</h2>
            <p>Gérer le workflow pour la facture #{{ data.invoice?.invoiceNumber }}</p>
          </div>
        </div>
        <button class="close-button" (click)="onCancel()" mat-icon-button>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="dialog-content">
        <form [formGroup]="workflowForm">
          <!-- Informations de la facture -->
          <mat-card class="invoice-info-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>receipt</mat-icon>
                Informations de la facture
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="invoice-details">
                <div class="detail-row">
                  <span class="detail-label">Numéro:</span>
                  <span class="detail-value">{{ data.invoice?.invoiceNumber }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Montant:</span>
                  <span class="detail-value amount">{{ data.invoice?.amount | currency:'EUR' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Statut actuel:</span>
                  <span class="detail-value status">{{ data.invoice?.status }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date d'échéance:</span>
                  <span class="detail-value">{{ data.invoice?.dueDate | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Action de workflow -->
          <mat-card class="workflow-action-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>play_arrow</mat-icon>
                Action de workflow
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Action *</mat-label>
                  <mat-select formControlName="action">
                    <mat-option value="APPROVE">
                      <mat-icon>check_circle</mat-icon>
                      Approuver
                    </mat-option>
                    <mat-option value="REJECT">
                      <mat-icon>cancel</mat-icon>
                      Rejeter
                    </mat-option>
                    <mat-option value="SEND">
                      <mat-icon>send</mat-icon>
                      Envoyer
                    </mat-option>
                    <mat-option value="CANCEL">
                      <mat-icon>block</mat-icon>
                      Annuler
                    </mat-option>
                  </mat-select>
                  <mat-icon matSuffix>settings</mat-icon>
                  <mat-error *ngIf="workflowForm.get('action')?.hasError('required')">
                    L'action est requise
                  </mat-error>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Commentaire *</mat-label>
                <textarea matInput formControlName="comment" rows="4" 
                         placeholder="Veuillez expliquer la raison de cette action..."></textarea>
                <mat-icon matSuffix>comment</mat-icon>
                <mat-error *ngIf="workflowForm.get('comment')?.hasError('required')">
                  Le commentaire est requis
                </mat-error>
                <mat-error *ngIf="workflowForm.get('comment')?.hasError('minlength')">
                  Le commentaire doit contenir au moins 10 caractères
                </mat-error>
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <!-- Résumé de l'action -->
          <mat-card class="summary-card" *ngIf="workflowForm.get('action')?.value">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>summarize</mat-icon>
                Résumé de l'action
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="summary-details">
                <div class="summary-row">
                  <span>Action sélectionnée:</span>
                  <span class="summary-action">{{ getActionLabel(workflowForm.get('action')?.value) }}</span>
                </div>
                <div class="summary-row">
                  <span>Commentaire:</span>
                  <span class="summary-comment">{{ workflowForm.get('comment')?.value || 'Aucun commentaire' }}</span>
                </div>
                <mat-divider></mat-divider>
                <div class="summary-row total">
                  <span>Impact:</span>
                  <span class="summary-impact">{{ getActionImpact(workflowForm.get('action')?.value) }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </form>
      </div>

      <!-- Actions -->
      <div class="dialog-actions">
        <button mat-stroked-button type="button" (click)="onCancel()" class="cancel-button">
          <mat-icon>cancel</mat-icon>
          Annuler
        </button>
        <button mat-flat-button color="primary" (click)="onConfirm()" [disabled]="!workflowForm.valid" class="confirm-button">
          <mat-icon>check_circle</mat-icon>
          Confirmer l'action
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-height: 85vh;
      width: 100%;
      max-width: 800px;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      margin: 0 auto;
      position: relative;
    }

    /* Header */
    .dialog-header {
      padding: 20px 24px;
      background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 12px 12px 0 0;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-icon {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .header-text h2 {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 600;
    }

    .header-text p {
      margin: 2px 0 0 0;
      opacity: 0.9;
      font-size: 0.9rem;
    }

    .close-button {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      transition: all 0.2s ease;
    }

    .close-button:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }

    /* Content */
    .dialog-content {
      flex: 1;
      padding: 20px 24px;
      overflow-y: auto;
      background: #f8f9fa;
      max-height: calc(85vh - 140px);
    }

    .invoice-info-card,
    .workflow-action-card,
    .summary-card {
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      border: none;
      background: white;
    }

    .summary-card {
      margin-bottom: 0;
    }

    mat-card-header {
      padding: 16px 20px 0 20px;
      background: transparent;
      border-radius: 8px 8px 0 0;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    mat-card-title mat-icon {
      color: #9c27b0;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    mat-card-content {
      padding: 20px;
    }

    .invoice-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .detail-label {
      font-weight: 500;
      color: #666;
    }

    .detail-value {
      font-weight: 600;
      color: #333;
    }

    .detail-value.amount {
      color: #4caf50;
      font-size: 1.1rem;
    }

    .detail-value.status {
      color: #ff9800;
      font-weight: 600;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    mat-form-field {
      width: 100%;
    }

    mat-form-field mat-icon {
      color: #9c27b0;
    }

    .summary-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 8px 0;
    }

    .summary-row.total {
      font-weight: 600;
      font-size: 1.1rem;
      color: #333;
    }

    .summary-action {
      color: #9c27b0;
      font-weight: 600;
    }

    .summary-comment {
      color: #666;
      font-style: italic;
      text-align: right;
      flex: 1;
    }

    .summary-impact {
      color: #4caf50;
      font-weight: 600;
    }

    /* Actions */
    .dialog-actions {
      padding: 20px 24px;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-radius: 0 0 12px 12px;
    }

    .cancel-button {
      border-radius: 6px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
    }

    .confirm-button {
      border-radius: 6px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
      font-size: 0.85rem;
    }

    .confirm-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(156, 39, 176, 0.3);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .dialog-container {
        max-height: 90vh;
        margin: 16px;
        max-width: calc(100vw - 32px);
      }

      .dialog-header {
        padding: 16px 20px;
      }

      .dialog-content {
        padding: 16px 20px;
      }

      .dialog-actions {
        padding: 16px 20px;
        flex-direction: column;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 8px;
      }

      .header-text h2 {
        font-size: 1.2rem;
      }
    }

    /* Animations */
    .dialog-container {
      animation: slideInUp 0.3s ease-out;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Scrollbar styling */
    .dialog-content::-webkit-scrollbar {
      width: 6px;
    }

    .dialog-content::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .dialog-content::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .dialog-content::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }

    /* Global dialog styles - FORCER LE CENTRAGE */
    :host ::ng-deep .mat-mdc-dialog-container {
      padding: 0 !important;
      border-radius: 12px !important;
      overflow: hidden !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      min-height: 100vh !important;
    }

    :host ::ng-deep .mat-mdc-dialog-surface {
      padding: 0 !important;
      border-radius: 12px !important;
      overflow: hidden !important;
      box-shadow: none !important;
      margin: auto !important;
      position: relative !important;
      top: 0 !important;
      left: 0 !important;
      transform: none !important;
    }

    /* Override Material Dialog positioning */
    :host ::ng-deep .cdk-overlay-pane {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      height: 100vh !important;
      width: 100vw !important;
    }

    :host ::ng-deep .cdk-global-overlay-wrapper {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      height: 100vh !important;
      width: 100vw !important;
    }

    /* Force center positioning */
    :host ::ng-deep .mat-mdc-dialog-container {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      margin: 0 !important;
    }
  `]
})
export class InvoiceWorkflowDialogComponent {
  workflowForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<InvoiceWorkflowDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { invoice: any }
  ) {
    this.workflowForm = this.fb.group({
      action: ['', Validators.required],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  getActionLabel(action: string): string {
    switch (action) {
      case 'APPROVE': return 'Approuver';
      case 'REJECT': return 'Rejeter';
      case 'SEND': return 'Envoyer';
      case 'CANCEL': return 'Annuler';
      default: return action;
    }
  }

  getActionImpact(action: string): string {
    switch (action) {
      case 'APPROVE': return 'Facture approuvée et prête pour envoi';
      case 'REJECT': return 'Facture rejetée, retour à l\'émetteur';
      case 'SEND': return 'Facture envoyée au client';
      case 'CANCEL': return 'Facture annulée définitivement';
      default: return 'Aucun impact défini';
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.workflowForm.valid) {
      this.dialogRef.close({
        invoiceId: this.data.invoice?.id,
        ...this.workflowForm.value
      });
    }
  }
}
