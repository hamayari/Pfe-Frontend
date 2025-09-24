import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { Invoice, InvoiceItem } from '../../../models/invoice.model';
import { InvoiceService, InvoiceRequest } from '../../../services/invoice.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-invoice-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatDialogModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatDividerModule, MatExpansionModule, MatChipsModule, MatSnackBarModule, MatStepperModule, MatProgressSpinnerModule
  ],
  templateUrl: './invoice-dialog.component.html',
  styleUrls: ['./invoice-dialog.component.scss']
})
export class InvoiceDialogComponent implements OnInit {
  invoiceForm: FormGroup = this.fb.group({
    invoiceNumber: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    dueDate: [new Date(), Validators.required],
    status: ['PENDING', Validators.required],
    description: [''],
    clientId: ['', Validators.required]
  });
  isLoading = false;
  isEditMode = false;
  
  statusOptions = [
    { value: 'DRAFT', label: 'Brouillon' },
    { value: 'SENT', label: 'Envoyée' },
    { value: 'PAID', label: 'Payée' },
    { value: 'OVERDUE', label: 'En retard' },
    { value: 'CANCELLED', label: 'Annulée' },
    { value: 'PARTIALLY_PAID', label: 'Partiellement payée' }
  ];

  paymentMethods = [
    { value: 'VIREMENT', label: 'Virement bancaire' },
    { value: 'CHEQUE', label: 'Chèque' },
    { value: 'CARTE', label: 'Carte bancaire' },
    { value: 'ESPECES', label: 'Espèces' },
    { value: 'CRYPTO', label: 'Cryptomonnaie' }
  ];

  currencies = [
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'USD', label: 'Dollar US ($)' },
    { value: 'TND', label: 'Dinar tunisien (DT)' }
  ];

  availableTags = ['Urgent', 'Important', 'Confidentiel', 'Renouvellement', 'Nouveau Client'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<InvoiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: string; invoice?: Invoice },
    private invoiceService: InvoiceService,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = data.mode === 'edit';
    this.initForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.invoice) {
      this.populateForm(this.data.invoice);
    }
  }

  private initForm(): void {
    this.invoiceForm = this.fb.group({
      // Informations de base
      reference: ['', [Validators.required, Validators.minLength(3)]],
      invoiceNumber: [''],
      clientId: ['', Validators.required],
      conventionId: [''],
      
      // Montants et devises
      amount: [0, [Validators.required, Validators.min(0.01)]],
      currency: ['EUR', Validators.required],
      taxRate: [0, [Validators.min(0), Validators.max(100)]],
      discount: [0, [Validators.min(0), Validators.max(100)]],
      
      // Dates
      issueDate: [new Date(), Validators.required],
      dueDate: ['', Validators.required],
      
      // Statut et paiement
      status: ['DRAFT', Validators.required],
      paymentMethod: ['VIREMENT', Validators.required],
      
      // Description et notes
      description: [''],
      notes: [''],
      
      // Tags
      tags: [[]],
      
      // Lignes de facture
      items: this.fb.array([])
    });

    // Validation des dates
    this.invoiceForm.get('issueDate')?.valueChanges.subscribe(() => {
      this.validateDates();
    });

    this.invoiceForm.get('dueDate')?.valueChanges.subscribe(() => {
      this.validateDates();
    });
  }

  private populateForm(invoice: Invoice): void {
    this.invoiceForm.patchValue({
      reference: invoice.reference,
      invoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId,
      conventionId: invoice.conventionId,
      amount: invoice.amount,
      currency: invoice.currency || 'EUR',
      taxRate: invoice.taxRate || 0,
      discount: invoice.discount || 0,
      issueDate: new Date(invoice.issueDate),
      dueDate: new Date(invoice.dueDate),
      status: invoice.status,
      paymentMethod: invoice.paymentMethod,
      description: invoice.description,
      notes: invoice.notes,
      tags: invoice.tags || []
    });

    // Ajouter les lignes de facture si elles existent
    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach(item => {
        this.addInvoiceItem(item);
      });
    }
  }

  private validateDates(): void {
    const issueDate = this.invoiceForm.get('issueDate')?.value;
    const dueDate = this.invoiceForm.get('dueDate')?.value;

    if (issueDate && dueDate && new Date(issueDate) > new Date(dueDate)) {
      this.invoiceForm.get('dueDate')?.setErrors({ invalidDueDate: true });
    } else {
      this.invoiceForm.get('dueDate')?.setErrors(null);
    }
  }

  get itemsArray(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  addInvoiceItem(item?: InvoiceItem): void {
    const itemForm = this.fb.group({
      description: [item?.description || '', Validators.required],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      unitPrice: [item?.unitPrice || 0, [Validators.required, Validators.min(0)]],
      total: [item?.total || 0, [Validators.required, Validators.min(0)]],
      taxRate: [item?.taxRate || 0, [Validators.min(0), Validators.max(100)]]
    });

    // Calcul automatique du total
    itemForm.get('quantity')?.valueChanges.subscribe(() => {
      this.calculateItemTotal(itemForm);
    });

    itemForm.get('unitPrice')?.valueChanges.subscribe(() => {
      this.calculateItemTotal(itemForm);
    });

    this.itemsArray.push(itemForm);
  }

  removeInvoiceItem(index: number): void {
    this.itemsArray.removeAt(index);
  }

  private calculateItemTotal(itemForm: FormGroup): void {
    const quantity = itemForm.get('quantity')?.value || 0;
    const unitPrice = itemForm.get('unitPrice')?.value || 0;
    const total = quantity * unitPrice;
    itemForm.get('total')?.setValue(total);
  }

  calculateTotalAmount(): number {
    const amount = this.invoiceForm.get('amount')?.value || 0;
    const taxRate = this.invoiceForm.get('taxRate')?.value || 0;
    const discount = this.invoiceForm.get('discount')?.value || 0;

    let total = amount;
    
    // Ajouter la TVA
    if (taxRate > 0) {
      total += (amount * taxRate) / 100;
    }
    
    // Appliquer la remise
    if (discount > 0) {
      total -= (total * discount) / 100;
    }

    return total;
  }

  onSubmit(): void {
    if (this.invoiceForm.valid) {
      this.isLoading = true;
      
      const formData = this.invoiceForm.value;
      const invoiceData: InvoiceRequest = {
        ...formData,
        issueDate: new Date(formData.issueDate),
        dueDate: new Date(formData.dueDate)
      };

      // Validation des données
      const validation = this.invoiceService.validateInvoiceData(invoiceData);
      if (!validation.valid) {
        this.snackBar.open(`Erreurs de validation: ${validation.errors.join(', ')}`, 'Fermer', { duration: 5000 });
        this.isLoading = false;
        return;
      }

      if (this.isEditMode && this.data.invoice) {
        this.invoiceService.updateInvoice(this.data.invoice.id, invoiceData).subscribe({
          next: () => {
            this.dialogRef.close(true);
            this.snackBar.open('Facture mise à jour avec succès', 'Fermer', { duration: 3000 });
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            this.snackBar.open('Erreur lors de la mise à jour de la facture', 'Fermer', { duration: 3000 });
            this.isLoading = false;
          }
        });
      } else {
        this.invoiceService.createInvoice(invoiceData).subscribe({
          next: () => {
            this.dialogRef.close(true);
            this.snackBar.open('Facture créée avec succès', 'Fermer', { duration: 3000 });
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            this.snackBar.open('Erreur lors de la création de la facture', 'Fermer', { duration: 3000 });
            this.isLoading = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', { duration: 3000 });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.invoiceForm.controls).forEach(key => {
      const control = this.invoiceForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach(itemControl => {
          if (itemControl instanceof FormGroup) {
            Object.keys(itemControl.controls).forEach(itemKey => {
              itemControl.get(itemKey)?.markAsTouched();
            });
          }
        });
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.invoiceForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (control?.hasError('minlength')) {
      return `Minimum ${control.errors?.['minlength'].requiredLength} caractères`;
    }
    if (control?.hasError('min')) {
      return `Valeur minimum: ${control.errors?.['min'].min}`;
    }
    if (control?.hasError('max')) {
      return `Valeur maximum: ${control.errors?.['max'].max}`;
    }
    if (control?.hasError('invalidDueDate')) {
      return 'La date d\'échéance doit être postérieure à la date d\'émission';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.invoiceForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onDueDateChange(): void {
    const issueDate = this.invoiceForm.get('issueDate')?.value;
    if (issueDate) {
      // Calculer automatiquement la date d'échéance (30 jours par défaut)
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + 30);
      this.invoiceForm.get('dueDate')?.setValue(dueDate);
    }
  }

  addTag(tag: string): void {
    const tags = this.invoiceForm.get('tags')?.value || [];
    if (!tags.includes(tag)) {
      tags.push(tag);
      this.invoiceForm.get('tags')?.setValue(tags);
    }
  }

  removeTag(tag: string): void {
    const tags = this.invoiceForm.get('tags')?.value || [];
    const index = tags.indexOf(tag);
    if (index > -1) {
      tags.splice(index, 1);
      this.invoiceForm.get('tags')?.setValue(tags);
    }
  }

  getStatusColor(status: string): string {
    return this.invoiceService.getPaymentStatusColor(status);
  }

  getStatusLabel(status: string): string {
    return this.invoiceService.getPaymentStatusLabel(status);
  }

  getPaymentMethodLabel(method: string): string {
    return this.invoiceService.getPaymentMethodLabel(method);
  }
}