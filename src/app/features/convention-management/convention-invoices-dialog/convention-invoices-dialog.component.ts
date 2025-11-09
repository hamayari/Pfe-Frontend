import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InvoiceService, Invoice } from '../../../services/invoice.service';
import { Convention } from '../../../models/convention.model';

@Component({
  selector: 'app-convention-invoices-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './convention-invoices-dialog.component.html',
  styleUrls: ['./convention-invoices-dialog.component.scss']
})
export class ConventionInvoicesDialogComponent implements OnInit {
  invoices: Invoice[] = [];
  isLoading = false;
  displayedColumns: string[] = ['invoiceNumber', 'reference', 'amount', 'issueDate', 'dueDate', 'status', 'actions'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { convention: Convention },
    private dialogRef: MatDialogRef<ConventionInvoicesDialogComponent>,
    private invoiceService: InvoiceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    if (!this.data.convention?.id) {
      this.snackBar.open('Convention ID manquant', 'Fermer', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.invoiceService.getInvoices().subscribe({
      next: (allInvoices) => {
        // Filter invoices by convention ID
        this.invoices = allInvoices.filter(inv => inv.conventionId === this.data.convention.id);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.snackBar.open('Erreur lors du chargement des factures', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'OVERDUE':
        return 'danger';
      default:
        return 'default';
    }
  }

  getStatusLabel(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'Payée';
      case 'PENDING':
        return 'En attente';
      case 'OVERDUE':
        return 'En retard';
      default:
        return status || 'Inconnu';
    }
  }

  downloadPDF(invoice: Invoice): void {
    this.invoiceService.generateInvoicePDF(invoice.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `facture-${invoice.reference || invoice.invoiceNumber}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('PDF téléchargé avec succès', 'Fermer', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error downloading PDF:', error);
        this.snackBar.open('Erreur lors du téléchargement du PDF', 'Fermer', { duration: 3000 });
      }
    });
  }

  getTotalAmount(): number {
    return this.invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }

  getPaidAmount(): number {
    return this.invoices
      .filter(inv => inv.status?.toUpperCase() === 'PAID')
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }

  getPendingAmount(): number {
    return this.invoices
      .filter(inv => inv.status?.toUpperCase() === 'PENDING')
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }

  getOverdueAmount(): number {
    return this.invoices
      .filter(inv => inv.status?.toUpperCase() === 'OVERDUE')
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }

  getPaidCount(): number {
    return this.invoices.filter(inv => inv.status?.toUpperCase() === 'PAID').length;
  }

  getPendingCount(): number {
    return this.invoices.filter(inv => inv.status?.toUpperCase() === 'PENDING').length;
  }

  getOverdueCount(): number {
    return this.invoices.filter(inv => inv.status?.toUpperCase() === 'OVERDUE').length;
  }

  close(): void {
    this.dialogRef.close();
  }
}
