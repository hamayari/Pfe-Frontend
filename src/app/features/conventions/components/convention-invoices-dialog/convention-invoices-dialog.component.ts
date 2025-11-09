import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { Invoice, InvoiceStatus } from '../../../../core/models/invoice.model';
import { Convention } from '../../../../core/models/convention.model';

@Component({
  selector: 'app-convention-invoices-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    DatePipe
  ],
  templateUrl: './convention-invoices-dialog.component.html',
  styleUrls: ['./convention-invoices-dialog.component.scss']
})
export class ConventionInvoicesDialogComponent implements OnInit {
  invoices: Invoice[] = [];
  isLoading = false;
  displayedColumns: string[] = ['invoiceNumber', 'issueDate', 'dueDate', 'totalAmount', 'status', 'actions'];

  constructor(
    public dialogRef: MatDialogRef<ConventionInvoicesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { convention: Convention },
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.invoiceService.getInvoices({ 
      conventionId: this.data.convention.id,
      limit: 100 
    }).subscribe({
      next: (response) => {
        this.invoices = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.isLoading = false;
      }
    });
  }

  getStatusLabel(status: InvoiceStatus): string {
    const labels: Record<InvoiceStatus, string> = {
      [InvoiceStatus.DRAFT]: 'Brouillon',
      [InvoiceStatus.SENT]: 'Envoyée',
      [InvoiceStatus.PAID]: 'Payée',
      [InvoiceStatus.OVERDUE]: 'En retard',
      [InvoiceStatus.CANCELLED]: 'Annulée',
      [InvoiceStatus.PARTIALLY_PAID]: 'Partiellement payée',
      [InvoiceStatus.PENDING]: 'En attente',
      [InvoiceStatus.PROOF_PENDING]: 'Preuve en attente',
      [InvoiceStatus.PROOF_VALIDATED]: 'Preuve validée',
      [InvoiceStatus.PENDING_VERIFICATION]: 'En vérification',
      [InvoiceStatus.PROOF_REJECTED]: 'Preuve rejetée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: InvoiceStatus): string {
    const classes: Record<InvoiceStatus, string> = {
      [InvoiceStatus.DRAFT]: 'status-draft',
      [InvoiceStatus.SENT]: 'status-sent',
      [InvoiceStatus.PAID]: 'status-paid',
      [InvoiceStatus.OVERDUE]: 'status-overdue',
      [InvoiceStatus.CANCELLED]: 'status-cancelled',
      [InvoiceStatus.PARTIALLY_PAID]: 'status-partial',
      [InvoiceStatus.PENDING]: 'status-pending',
      [InvoiceStatus.PROOF_PENDING]: 'status-proof-pending',
      [InvoiceStatus.PROOF_VALIDATED]: 'status-proof-validated',
      [InvoiceStatus.PENDING_VERIFICATION]: 'status-verification',
      [InvoiceStatus.PROOF_REJECTED]: 'status-proof-rejected'
    };
    return classes[status] || '';
  }

  downloadPdf(invoice: Invoice): void {
    this.invoiceService.generatePdf(invoice.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${invoice.invoiceNumber}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading PDF:', error);
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
