import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { InvoiceService, InvoiceRequest, InvoiceFilter, InvoiceStats, InvoiceNotifications } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';
import { InvoiceDialogComponent } from './invoice-dialog/invoice-dialog.component';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';
import { InvoiceWorkflowDialogComponent } from './invoice-workflow-dialog/invoice-workflow-dialog.component';
import { InvoiceHistoryDialogComponent } from './invoice-history-dialog/invoice-history-dialog.component';
import { BulkPaymentDialogComponent } from './bulk-payment-dialog/bulk-payment-dialog.component';
import { PaymentProofDialogComponent } from './payment-proof-dialog/payment-proof-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-invoice-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatDialogModule, MatSnackBarModule, MatChipsModule, MatBadgeModule, MatTooltipModule, MatMenuModule,
    MatProgressSpinnerModule, MatExpansionModule, MatTabsModule, MatDividerModule, MatListModule,
    MatSlideToggleModule, MatCheckboxModule, MatStepperModule
  ],
  providers: [InvoiceService],
  templateUrl: './invoice-management.component.html',
  styleUrls: ['./invoice-management.component.scss']
})
export class InvoiceManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  isLoading = false;
  totalInvoices = 0;
  paidInvoices = 0;
  pendingInvoices = 0;
  overdueInvoices = 0;
  totalAmount = 0;
  paidAmount = 0;
  pendingAmount = 0;
  overdueAmount = 0;

  displayedColumns: string[] = [
    'reference', 'convention', 'amount', 'dueDate', 'status', 'actions'
  ];

  filterForm: FormGroup;
  workflowStates = [
    { value: 'DRAFT', label: 'Brouillon', color: 'grey' },
    { value: 'SENT', label: 'Envoyée', color: 'blue' },
    { value: 'PAID', label: 'Payée', color: 'green' },
    { value: 'PENDING', label: 'En attente', color: 'blue' },
    { value: 'OVERDUE', label: 'En retard', color: 'red' },
    { value: 'CANCELLED', label: 'Annulée', color: 'black' },
    { value: 'PARTIALLY_PAID', label: 'Partiellement payée', color: 'orange' }
  ];

  paymentMethods = [
    { value: 'VIREMENT', label: 'Virement bancaire' },
    { value: 'CHEQUE', label: 'Chèque' },
    { value: 'CARTE', label: 'Carte bancaire' },
    { value: 'ESPECES', label: 'Espèces' },
    { value: 'CRYPTO', label: 'Cryptomonnaie' }
  ];

  notifications = {
    overdueInvoices: 0,
    upcomingDueDates: 0,
    pendingApprovals: 0,
    paymentConfirmations: 0
  };

  selectedInvoices: Invoice[] = [];
  bulkActions = [
    { label: 'Marquer comme payées', action: 'markAsPaid', icon: 'check_circle' },
    { label: 'Envoyer rappels', action: 'sendReminders', icon: 'notifications' },
    { label: 'Exporter sélection', action: 'exportSelected', icon: 'download' },
    { label: 'Supprimer sélection', action: 'deleteSelected', icon: 'delete' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private invoiceService: InvoiceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      client: [''],
      convention: [''],
      dateRange: [''],
      amountMin: [''],
      amountMax: [''],
      paymentMethod: [''],
      overdueOnly: [false]
    });
  }

  ngOnInit(): void {
    this.loadInvoices();
    this.setupFilters();
    this.loadStatistics();
    this.loadNotifications();
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.sort.sortChange.subscribe(() => {
        this.paginator.pageIndex = 0;
        this.applyFilters();
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.invoiceService.getAllInvoices().subscribe({
      next: (invoices) => {
        this.invoices = invoices;
        this.filteredInvoices = [...invoices];
        this.calculateStatistics();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des factures:', error);
        this.snackBar.open('Erreur lors du chargement des factures', 'Fermer', { duration: 3000 });
        this.isLoading = false;
        this.invoices = []; // Données vides en cas d'erreur
        this.filteredInvoices = [];
      }
    });
  }

  loadStatistics(): void {
    this.invoiceService.getInvoiceStatistics().subscribe({
      next: (stats) => {
        if (stats) {
          this.totalInvoices = stats.totalInvoices;
          this.paidInvoices = stats.paidInvoices;
          this.pendingInvoices = stats.pendingInvoices;
          this.overdueInvoices = stats.overdueInvoices;
          this.totalAmount = stats.totalAmount;
          this.paidAmount = stats.paidAmount;
          this.pendingAmount = stats.pendingAmount;
          this.overdueAmount = stats.overdueAmount;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    });
  }

  loadNotifications(): void {
    this.invoiceService.getInvoiceNotifications().subscribe({
      next: (notifications: InvoiceNotifications) => {
        this.notifications = {
          overdueInvoices: notifications.overdueInvoices,
          upcomingDueDates: notifications.upcomingDueDates,
          pendingApprovals: notifications.pendingApprovals,
          paymentConfirmations: notifications.paymentConfirmations
        };
      },
      error: (error) => {
        console.error('Erreur lors du chargement des notifications:', error);
      }
    });
  }

  calculateStatistics(): void {
    this.totalInvoices = this.invoices.length;
    this.paidInvoices = this.invoices.filter(inv => inv.status === 'PAID').length;
    this.pendingInvoices = this.invoices.filter(inv => inv.status === 'SENT').length;
    this.overdueInvoices = this.invoices.filter(inv => this.isOverdue(inv)).length;
    
    this.totalAmount = this.invoices.reduce((sum, inv) => sum + inv.amount, 0);
    this.paidAmount = this.invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.amount, 0);
    this.pendingAmount = this.invoices
      .filter(inv => inv.status === 'SENT')
      .reduce((sum, inv) => sum + inv.amount, 0);
    this.overdueAmount = this.invoices
      .filter(inv => this.isOverdue(inv))
      .reduce((sum, inv) => sum + inv.amount, 0);
  }

  createInvoice(): void {
    const dialogRef = this.dialog.open(InvoiceDialogComponent, {
      width: '800px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadInvoices();
        this.snackBar.open('Facture créée avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  editInvoice(invoice: Invoice): void {
    const dialogRef = this.dialog.open(InvoiceDialogComponent, {
      width: '800px',
      data: { mode: 'edit', invoice }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadInvoices();
        this.snackBar.open('Facture mise à jour avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteInvoice(invoice: Invoice): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la facture ${invoice.reference} ?`)) {
      this.invoiceService.deleteInvoice(invoice.id).subscribe({
        next: () => {
          this.loadInvoices();
          this.snackBar.open('Facture supprimée avec succès', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  openPaymentDialog(invoice: Invoice): void {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '600px',
      data: { invoice }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadInvoices();
        this.snackBar.open('Paiement enregistré avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  openWorkflowDialog(invoice: Invoice): void {
    const dialogRef = this.dialog.open(InvoiceWorkflowDialogComponent, {
      width: '700px',
      data: { invoice }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadInvoices();
        this.snackBar.open('Statut mis à jour avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  openHistoryDialog(invoice: Invoice): void {
    this.dialog.open(InvoiceHistoryDialogComponent, {
      width: '800px',
      data: { invoice }
    });
  }

  openPaymentProofDialog(invoice: Invoice): void {
    this.dialog.open(PaymentProofDialogComponent, {
      width: '600px',
      data: { invoice }
    });
  }

  openBulkPaymentDialog(): void {
    if (this.selectedInvoices.length === 0) {
      this.snackBar.open('Veuillez sélectionner au moins une facture', 'Fermer', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(BulkPaymentDialogComponent, {
      width: '700px',
      data: { invoices: this.selectedInvoices }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadInvoices();
        this.selectedInvoices = [];
        this.snackBar.open('Paiements enregistrés avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  setupFilters(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    let filtered = [...this.invoices];

    if (filters.status) {
      filtered = filtered.filter(inv => inv.status === filters.status);
    }

    if (filters.client) {
      filtered = filtered.filter(inv => 
        inv.clientName?.toLowerCase().includes(filters.client.toLowerCase()) ||
        inv.clientId?.toLowerCase().includes(filters.client.toLowerCase())
      );
    }

    if (filters.convention) {
      filtered = filtered.filter(inv => 
        inv.conventionId?.toLowerCase().includes(filters.convention.toLowerCase()) ||
        inv.conventionName?.toLowerCase().includes(filters.convention.toLowerCase())
      );
    }

    if (filters.paymentMethod) {
      filtered = filtered.filter(inv => inv.paymentMethod === filters.paymentMethod);
    }

    if (filters.amountMin) {
      filtered = filtered.filter(inv => inv.amount >= filters.amountMin);
    }

    if (filters.amountMax) {
      filtered = filtered.filter(inv => inv.amount <= filters.amountMax);
    }

    if (filters.overdueOnly) {
      filtered = filtered.filter(inv => this.isOverdue(inv));
    }

    this.filteredInvoices = filtered;
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.filteredInvoices = [...this.invoices];
  }

  onInvoiceSelection(invoice: Invoice, checked: boolean): void {
    if (checked) {
      this.selectedInvoices.push(invoice);
    } else {
      this.selectedInvoices = this.selectedInvoices.filter(inv => inv.id !== invoice.id);
    }
  }

  onSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedInvoices = [...this.filteredInvoices];
    } else {
      this.selectedInvoices = [];
    }
  }

  executeBulkAction(action: string): void {
    switch (action) {
      case 'markAsPaid':
        this.markSelectedAsPaid();
        break;
      case 'sendReminders':
        this.sendRemindersToSelected();
        break;
      case 'exportSelected':
        this.exportSelectedInvoices();
        break;
      case 'deleteSelected':
        this.deleteSelectedInvoices();
        break;
    }
  }

  markSelectedAsPaid(): void {
    const promises = this.selectedInvoices.map(invoice => 
      this.invoiceService.updateInvoiceStatus(invoice.id, 'PAID').toPromise()
    );

    Promise.all(promises).then(() => {
      this.loadInvoices();
      this.selectedInvoices = [];
      this.snackBar.open('Factures marquées comme payées', 'Fermer', { duration: 3000 });
    }).catch(error => {
      console.error('Erreur lors de la mise à jour:', error);
      this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 });
    });
  }

  sendRemindersToSelected(): void {
    const invoiceIds = this.selectedInvoices.map(inv => inv.id);
    this.invoiceService.sendPaymentReminders(invoiceIds).subscribe({
      next: () => {
        this.snackBar.open('Rappels envoyés avec succès', 'Fermer', { duration: 3000 });
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi des rappels:', error);
        this.snackBar.open('Erreur lors de l\'envoi des rappels', 'Fermer', { duration: 3000 });
      }
    });
  }

  exportSelectedInvoices(): void {
    const invoiceIds = this.selectedInvoices.map(inv => inv.id);
    this.invoiceService.exportInvoices('pdf', { ids: invoiceIds }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'factures_selectionnees.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors de l\'export:', error);
        this.snackBar.open('Erreur lors de l\'export', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteSelectedInvoices(): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedInvoices.length} facture(s) ?`)) {
      const promises = this.selectedInvoices.map(invoice => 
        this.invoiceService.deleteInvoice(invoice.id).toPromise()
      );

      Promise.all(promises).then(() => {
        this.loadInvoices();
        this.selectedInvoices = [];
        this.snackBar.open('Factures supprimées avec succès', 'Fermer', { duration: 3000 });
      }).catch(error => {
        console.error('Erreur lors de la suppression:', error);
        this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
      });
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PAID': return 'green';
      case 'PENDING': return 'blue';
      case 'SENT': return 'blue';
      case 'OVERDUE': return 'red';
      case 'CANCELLED': return 'black';
      case 'PARTIALLY_PAID': return 'orange';
      default: return 'grey';
    }
  }

  getStatusLabel(status: string): string {
    const statusObj = this.workflowStates.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  getPaymentMethodLabel(method: string): string {
    const methodObj = this.paymentMethods.find(m => m.value === method);
    return methodObj ? methodObj.label : method;
  }

  isOverdue(invoice: Invoice): boolean {
    return new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID';
  }

  isExpiringSoon(invoice: Invoice): boolean {
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0 && invoice.status !== 'PAID';
  }

  // Helper methods to avoid arrow functions in templates
  isInvoiceSelected(invoice: Invoice): boolean {
    return this.selectedInvoices.some(inv => inv.id === invoice.id);
  }

  isRowSelected(row: Invoice): boolean {
    return this.selectedInvoices.some(inv => inv.id === row.id);
  }

  exportInvoices(format: 'pdf' | 'csv' | 'json' | 'excel'): void {
    const filters = this.filterForm.value;
    this.invoiceService.exportInvoices(format, filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `factures.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open(`Export ${format.toUpperCase()} réussi`, 'Fermer', { duration: 3000 });
      },
      error: (error) => {
        console.error('Erreur lors de l\'export:', error);
        this.snackBar.open('Erreur lors de l\'export', 'Fermer', { duration: 3000 });
      }
    });
  }

  sendPaymentReminder(invoice: Invoice): void {
    this.invoiceService.sendPaymentReminder(invoice.id).subscribe({
      next: () => {
        this.snackBar.open('Rappel envoyé avec succès', 'Fermer', { duration: 3000 });
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi du rappel:', error);
        this.snackBar.open('Erreur lors de l\'envoi du rappel', 'Fermer', { duration: 3000 });
      }
    });
  }

  generateInvoicePDF(invoice: Invoice): void {
    this.invoiceService.generateInvoicePDF(invoice.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `facture_${invoice.reference}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors de la génération du PDF:', error);
        this.snackBar.open('Erreur lors de la génération du PDF', 'Fermer', { duration: 3000 });
      }
    });
  }
}
