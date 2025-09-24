import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
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

import { ConventionService } from '../../services/convention.service';
import { Convention } from '../../models/convention.model';
import { ConventionDialogComponent } from './convention-dialog/convention-dialog.component';
import { ConventionWorkflowDialogComponent } from './convention-workflow-dialog/convention-workflow-dialog.component';
import { ConventionHistoryDialogComponent } from './convention-history-dialog/convention-history-dialog.component';

@Component({
  selector: 'app-convention-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatTabsModule,
    MatDividerModule,
    MatListModule,
    MatSlideToggleModule,
    MatCheckboxModule
  ],
  templateUrl: './convention-management.component.html',
  styleUrls: ['./convention-management.component.scss']
})
export class ConventionManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Data
  conventions: Convention[] = [];
  filteredConventions: Convention[] = [];
  isLoading = false;
  totalConventions = 0;
  activeConventions = 0;
  expiredConventions = 0;
  pendingRenewals = 0;

  // Table configuration
  displayedColumns: string[] = [
    'reference', 'title', 'client', 'amount', 'startDate', 'endDate', 
    'status', 'dueDate', 'actions'
  ];

  // Filters
  filterForm: FormGroup;
  statusFilter = '';
  clientFilter = '';
  dateRangeFilter = '';

  // Workflow states
  workflowStates = [
    { value: 'DRAFT', label: 'Brouillon', color: 'grey' },
    { value: 'PENDING_APPROVAL', label: 'En attente d\'approbation', color: 'orange' },
    { value: 'APPROVED', label: 'Approuvée', color: 'green' },
    { value: 'ACTIVE', label: 'Active', color: 'blue' },
    { value: 'EXPIRED', label: 'Expirée', color: 'red' },
    { value: 'RENEWED', label: 'Renouvelée', color: 'purple' },
    { value: 'CANCELLED', label: 'Annulée', color: 'black' }
  ];

  // Notifications
  notifications = {
    upcomingExpiry: 0,
    overdueRenewals: 0,
    pendingApprovals: 0
  };

  constructor(
    private conventionService: ConventionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      client: [''],
      dateRange: [''],
      amountMin: [''],
      amountMax: ['']
    });
  }

  ngOnInit(): void {
    this.loadConventions();
    this.setupFilters();
    this.loadStatistics();
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.sort.sortChange.subscribe(() => {
        this.paginator.pageIndex = 0;
        this.applyFilters();
      });
    }
  }

  // Load data
  loadConventions(): void {
    this.isLoading = true;
    this.conventionService.getAllConventions().subscribe({
      next: (conventions) => {
        this.conventions = conventions;
        this.filteredConventions = conventions;
        this.totalConventions = conventions.length;
        this.calculateStatistics();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading conventions:', error);
        this.snackBar.open('Erreur lors du chargement des conventions', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadStatistics(): void {
    // Calculate notifications
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    this.notifications.upcomingExpiry = this.conventions.filter(c => 
      c.endDate && new Date(c.endDate) <= thirtyDaysFromNow && c.status === 'ACTIVE'
    ).length;

    this.notifications.overdueRenewals = this.conventions.filter(c => 
      c.endDate && new Date(c.endDate) < now && c.status === 'ACTIVE'
    ).length;

    this.notifications.pendingApprovals = this.conventions.filter(c => 
      c.status === 'PENDING'
    ).length;
  }

  calculateStatistics(): void {
    this.activeConventions = this.conventions.filter(c => c.status === 'ACTIVE').length;
    this.expiredConventions = this.conventions.filter(c => c.status === 'EXPIRED').length;
    this.pendingRenewals = this.conventions.filter(c => 
      c.endDate && new Date(c.endDate) <= new Date() && c.status === 'ACTIVE'
    ).length;
  }

  // CRUD Operations
  createConvention(): void {
    const dialogRef = this.dialog.open(ConventionDialogComponent, {
      width: '800px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.conventionService.createConvention(result).subscribe({
          next: () => {
            this.snackBar.open('Convention créée avec succès', 'Fermer', { duration: 3000 });
            this.loadConventions();
          },
          error: (error) => {
            const message = error?.error?.message || 'Erreur lors de la création';
            this.snackBar.open(message, 'Fermer', { duration: 5000 });
          }
        });
      }
    });
  }

  editConvention(convention: Convention): void {
    const dialogRef = this.dialog.open(ConventionDialogComponent, {
      width: '800px',
      data: { mode: 'edit', convention }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.conventionService.updateConvention(convention.id, result).subscribe({
          next: () => {
            this.snackBar.open('Convention modifiée avec succès', 'Fermer', { duration: 3000 });
            this.loadConventions();
          },
          error: (error) => {
            const message = error?.error?.message || 'Erreur lors de la modification';
            this.snackBar.open(message, 'Fermer', { duration: 5000 });
          }
        });
      }
    });
  }

  deleteConvention(convention: Convention): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la convention "${convention.title}" ?`)) {
      this.conventionService.deleteConvention(convention.id).subscribe({
        next: () => {
          this.snackBar.open('Convention supprimée avec succès', 'Fermer', { duration: 3000 });
          this.loadConventions();
        },
        error: (error) => {
          const message = error?.error?.message || 'Erreur lors de la suppression';
          this.snackBar.open(message, 'Fermer', { duration: 5000 });
        }
      });
    }
  }

  // Workflow Operations
  openWorkflowDialog(convention: Convention): void {
    const dialogRef = this.dialog.open(ConventionWorkflowDialogComponent, {
      width: '600px',
      data: { convention }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.conventionService.updateConvention(convention.id, { status: result.status }).subscribe({
          next: () => {
            this.snackBar.open('Statut de la convention mis à jour', 'Fermer', { duration: 3000 });
            this.loadConventions();
          },
          error: (error) => {
            const message = error?.error?.message || 'Erreur lors de la mise à jour';
            this.snackBar.open(message, 'Fermer', { duration: 5000 });
          }
        });
      }
    });
  }

  openHistoryDialog(convention: Convention): void {
    this.dialog.open(ConventionHistoryDialogComponent, {
      width: '800px',
      data: { convention }
    });
  }

  // Filtering and Search
  setupFilters(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let filtered = [...this.conventions];

    const filters = this.filterForm.value;

    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters.client) {
      filtered = filtered.filter(c => 
        c.clientId?.toLowerCase().includes(filters.client.toLowerCase())
      );
    }

    if (filters.amountMin) {
      filtered = filtered.filter(c => c.amount >= filters.amountMin);
    }

    if (filters.amountMax) {
      filtered = filtered.filter(c => c.amount <= filters.amountMax);
    }

    if (filters.dateRange) {
      const [start, end] = filters.dateRange.split(' - ');
      if (start && end) {
        filtered = filtered.filter(c => {
          const startDate = new Date(c.startDate);
          const endDate = new Date(c.endDate);
          const filterStart = new Date(start);
          const filterEnd = new Date(end);
          return startDate >= filterStart && endDate <= filterEnd;
        });
      }
    }

    this.filteredConventions = filtered;
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.filteredConventions = [...this.conventions];
  }

  // Utility methods
  getStatusColor(status: string): string {
    const state = this.workflowStates.find(s => s.value === status);
    return state?.color || 'grey';
  }

  getStatusLabel(status: string): string {
    const state = this.workflowStates.find(s => s.value === status);
    return state?.label || status;
  }

  isExpiringSoon(convention: Convention): boolean {
    if (!convention.endDate || convention.status !== 'ACTIVE') return false;
    const endDate = new Date(convention.endDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return endDate <= thirtyDaysFromNow;
  }

  isOverdue(convention: Convention): boolean {
    if (!convention.endDate || convention.status !== 'ACTIVE') return false;
    const endDate = new Date(convention.endDate);
    const now = new Date();
    return endDate < now;
  }

  // Export functionality
  exportConventions(format: 'pdf' | 'csv' | 'json'): void {
    const data = this.filteredConventions;
    
    switch (format) {
      case 'pdf':
        this.exportToPDF(data);
        break;
      case 'csv':
        this.exportToCSV(data);
        break;
      case 'json':
        this.exportToJSON(data);
        break;
    }
  }

  private exportToPDF(data: Convention[]): void {
    // Implementation for PDF export
    this.snackBar.open('Export PDF en cours...', 'Fermer', { duration: 2000 });
  }

  private exportToCSV(data: Convention[]): void {
    const headers = ['Référence', 'Titre', 'Client', 'Montant', 'Date début', 'Date fin', 'Statut'];
    const csvContent = [
      headers.join(','),
      ...data.map(c => [
        c.reference,
        c.title,
        c.clientId,
        c.amount,
        c.startDate,
        c.endDate,
        c.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conventions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private exportToJSON(data: Convention[]): void {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conventions_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}

