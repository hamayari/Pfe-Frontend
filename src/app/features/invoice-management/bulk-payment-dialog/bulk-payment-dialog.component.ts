import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Invoice } from '../../../models/invoice.model';
import { InvoiceService, PaymentRequest } from '../../../services/invoice.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-bulk-payment-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatDialogModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatDividerModule, MatSnackBarModule, MatListModule, MatChipsModule, MatCheckboxModule
  ],
  templateUrl: './bulk-payment-dialog.component.html',
  styleUrls: ['./bulk-payment-dialog.component.scss']
})
export class BulkPaymentDialogComponent implements OnInit {
  bulkPaymentForm: FormGroup = this.fb.group({
    selectedInvoices: ['', Validators.required],
    paymentMethod: ['', Validators.required],
    paymentDate: [new Date(), Validators.required],
    notes: ['']
  });
  isLoading = false;
  selectedInvoices: Invoice[] = [];
  totalAmount = 0;
  
  paymentMethods = [
    { value: 'VIREMENT', label: 'Virement bancaire' },
    { value: 'CHEQUE', label: 'Chèque' },
    { value: 'CARTE', label: 'Carte bancaire' },
    { value: 'ESPECES', label: 'Espèces' },
    { value: 'CRYPTO', label: 'Cryptomonnaie' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BulkPaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { invoices: Invoice[] },
    private invoiceService: InvoiceService,
    private snackBar: MatSnackBar
  ) {
    this.selectedInvoices = data.invoices;
    this.calculateTotalAmount();
    this.initForm();
  }

  ngOnInit(): void {
    this.populateForm();
  }

  private initForm(): void {
    this.bulkPaymentForm = this.fb.group({
      paymentMethod: ['VIREMENT', Validators.required],
      paymentDate: [new Date(), Validators.required],
      reference: [''],
      notes: [''],
      applyToAll: [true]
    });
  }

  private populateForm(): void {
    this.bulkPaymentForm.patchValue({
      paymentMethod: 'VIREMENT',
      paymentDate: new Date()
    });
  }

  private calculateTotalAmount(): void {
    this.totalAmount = this.selectedInvoices.reduce((sum, invoice) => {
      return sum + (invoice.amount - (invoice.paidAmount || 0));
    }, 0);
  }

  onInvoiceSelection(invoice: Invoice, checked: boolean): void {
    if (checked) {
      if (!this.selectedInvoices.find(inv => inv.id === invoice.id)) {
        this.selectedInvoices.push(invoice);
      }
    } else {
      this.selectedInvoices = this.selectedInvoices.filter(inv => inv.id !== invoice.id);
    }
    this.calculateTotalAmount();
  }

  onSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedInvoices = [...this.data.invoices];
    } else {
      this.selectedInvoices = [];
    }
    this.calculateTotalAmount();
  }

  onSubmit(): void {
    if (this.bulkPaymentForm.valid && this.selectedInvoices.length > 0) {
      this.isLoading = true;
      const formValue = this.bulkPaymentForm.value;

      const payments: PaymentRequest[] = this.selectedInvoices.map(invoice => ({
        invoiceId: invoice.id,
        amount: invoice.amount - (invoice.paidAmount || 0),
        paymentMethod: formValue.paymentMethod,
        paymentDate: formValue.paymentDate,
        reference: formValue.reference,
        notes: formValue.notes
      }));

      this.invoiceService.recordBulkPayments(payments).subscribe({
        next: (response) => {
          this.snackBar.open(`${this.selectedInvoices.length} paiements enregistrés avec succès`, 'Fermer', { duration: 3000 });
          this.dialogRef.close({ success: true, payments: response });
        },
        error: (error) => {
          console.error('Erreur lors de l\'enregistrement des paiements:', error);
          this.snackBar.open('Erreur lors de l\'enregistrement des paiements', 'Fermer', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      if (this.selectedInvoices.length === 0) {
        this.snackBar.open('Veuillez sélectionner au moins une facture', 'Fermer', { duration: 3000 });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.bulkPaymentForm.controls).forEach(key => {
      const control = this.bulkPaymentForm.get(key);
      control?.markAsTouched();
    });
  }

  getPaymentMethodLabel(method: string): string {
    const paymentMethod = this.paymentMethods.find(pm => pm.value === method);
    return paymentMethod?.label || method;
  }

  getErrorMessage(controlName: string): string {
    const control = this.bulkPaymentForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.bulkPaymentForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getRemainingAmount(invoice: Invoice): number {
    return invoice.amount - (invoice.paidAmount || 0);
  }

  isInvoiceSelected(invoice: Invoice): boolean {
    return this.selectedInvoices.some(inv => inv.id === invoice.id);
  }

  // Date utility methods for template
  isOverdue(date: Date | string): boolean {
    return new Date(date) < new Date();
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getCurrentDate(): Date {
    return new Date();
  }
}
