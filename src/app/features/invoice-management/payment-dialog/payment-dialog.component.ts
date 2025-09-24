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
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-payment-dialog',
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
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="dialog-container">
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-content">
          <div class="header-icon">
            <mat-icon>payment</mat-icon>
          </div>
          <div class="header-text">
            <h2>Paiement de facture</h2>
            <p>Enregistrer un nouveau paiement pour la facture #{{ data.invoice?.invoiceNumber }}</p>
          </div>
        </div>
        <button class="close-button" (click)="onCancel()" mat-icon-button>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="dialog-content">
        <form [formGroup]="paymentForm">
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
                  <span class="detail-label">Numéro de facture:</span>
                  <span class="detail-value">{{ data.invoice?.invoiceNumber }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Montant total:</span>
                  <span class="detail-value amount">{{ data.invoice?.amount | currency:'EUR' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Montant restant:</span>
                  <span class="detail-value remaining">{{ getRemainingAmount() | currency:'EUR' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date d'échéance:</span>
                  <span class="detail-value">{{ data.invoice?.dueDate | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Détails du paiement -->
          <mat-card class="payment-details-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>credit_card</mat-icon>
                Détails du paiement
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Montant du paiement</mat-label>
                  <input matInput type="number" formControlName="amount" placeholder="0.00">
                  <span matSuffix>€</span>
                  <mat-icon matSuffix>euro</mat-icon>
                  <mat-error *ngIf="paymentForm.get('amount')?.hasError('required')">
                    Le montant est requis
                  </mat-error>
                  <mat-error *ngIf="paymentForm.get('amount')?.hasError('min')">
                    Le montant doit être supérieur à 0
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Méthode de paiement</mat-label>
                  <mat-select formControlName="paymentMethod">
                    <mat-option value="CARD">
                      <mat-icon>credit_card</mat-icon>
                      Carte bancaire
                    </mat-option>
                    <mat-option value="BANK_TRANSFER">
                      <mat-icon>account_balance</mat-icon>
                      Virement bancaire
                    </mat-option>
                    <mat-option value="CHECK">
                      <mat-icon>receipt</mat-icon>
                      Chèque
                    </mat-option>
                    <mat-option value="CASH">
                      <mat-icon>money</mat-icon>
                      Espèces
                    </mat-option>
                  </mat-select>
                  <mat-icon matSuffix>payment</mat-icon>
                  <mat-error *ngIf="paymentForm.get('paymentMethod')?.hasError('required')">
                    La méthode de paiement est requise
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Date de paiement</mat-label>
                  <input matInput type="date" formControlName="paymentDate">
                  <mat-icon matSuffix>event</mat-icon>
                  <mat-error *ngIf="paymentForm.get('paymentDate')?.hasError('required')">
                    La date de paiement est requise
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Référence de paiement</mat-label>
                  <input matInput formControlName="reference" placeholder="REF-2024-001">
                  <mat-icon matSuffix>tag</mat-icon>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Notes</mat-label>
                <textarea matInput formControlName="notes" rows="3" placeholder="Notes additionnelles sur le paiement"></textarea>
                <mat-icon matSuffix>note</mat-icon>
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <!-- Résumé du paiement -->
          <mat-card class="summary-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>summarize</mat-icon>
                Résumé du paiement
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="summary-details">
                <div class="summary-row">
                  <span>Montant du paiement:</span>
                  <span class="summary-amount">{{ paymentForm.get('amount')?.value || 0 | currency:'EUR' }}</span>
                </div>
                <div class="summary-row">
                  <span>Méthode:</span>
                  <span>{{ getPaymentMethodLabel() }}</span>
                </div>
                <div class="summary-row">
                  <span>Date:</span>
                  <span>{{ paymentForm.get('paymentDate')?.value || 'Non définie' }}</span>
                </div>
                <mat-divider></mat-divider>
                <div class="summary-row total">
                  <span>Montant restant après paiement:</span>
                  <span class="summary-remaining">{{ getRemainingAfterPayment() | currency:'EUR' }}</span>
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
        <button mat-flat-button color="primary" (click)="onConfirm()" [disabled]="!paymentForm.valid" class="confirm-button">
          <mat-icon>check_circle</mat-icon>
          Confirmer le paiement
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
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
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
    .payment-details-card,
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
      color: #4caf50;
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

    .detail-value.remaining {
      color: #ff9800;
      font-size: 1.1rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-grid:last-child {
      margin-bottom: 0;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    mat-form-field {
      width: 100%;
    }

    mat-form-field mat-icon {
      color: #4caf50;
    }

    .summary-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .summary-row.total {
      font-weight: 600;
      font-size: 1.1rem;
      color: #333;
    }

    .summary-amount {
      color: #4caf50;
      font-weight: 600;
    }

    .summary-remaining {
      color: #ff9800;
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
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      font-size: 0.85rem;
    }

    .confirm-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
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

      .form-grid {
        grid-template-columns: 1fr;
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
export class PaymentDialogComponent {
  paymentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { invoice: any }
  ) {
    this.paymentForm = this.fb.group({
      amount: [data.invoice?.amount || '', [Validators.required, Validators.min(0)]],
      paymentMethod: ['', Validators.required],
      paymentDate: [new Date().toISOString().split('T')[0], Validators.required],
      reference: [''],
      notes: ['']
    });
  }

  getRemainingAmount(): number {
    const totalAmount = this.data.invoice?.amount || 0;
    const paidAmount = this.data.invoice?.paidAmount || 0;
    return totalAmount - paidAmount;
  }

  getRemainingAfterPayment(): number {
    const remaining = this.getRemainingAmount();
    const paymentAmount = this.paymentForm.get('amount')?.value || 0;
    return remaining - paymentAmount;
  }

  getPaymentMethodLabel(): string {
    const method = this.paymentForm.get('paymentMethod')?.value;
    switch (method) {
      case 'CARD': return 'Carte bancaire';
      case 'BANK_TRANSFER': return 'Virement bancaire';
      case 'CHECK': return 'Chèque';
      case 'CASH': return 'Espèces';
      default: return 'Non sélectionné';
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.paymentForm.valid) {
      this.dialogRef.close({
        invoiceId: this.data.invoice?.id,
        ...this.paymentForm.value
      });
    }
  }
}
