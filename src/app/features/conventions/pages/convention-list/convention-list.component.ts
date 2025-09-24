import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { SelectionModel } from '@angular/cdk/collections';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DatePipe } from '@angular/common';

import { Convention, ConventionFilter, ConventionStatus } from '../../../../core/models/convention.model';
import { ConventionService } from '../../../../core/services/convention.service';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ConventionFormDialogComponent } from '../../components/convention-form-dialog/convention-form-dialog.component';
import { TruncatePipe } from '../../../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-convention-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatMenuModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    DatePipe,
    TruncatePipe
  ],
  templateUrl: './convention-list.component.html',
  styleUrls: ['./convention-list.component.scss']
})
export class ConventionListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table data
  dataSource = new MatTableDataSource<Convention>([]);
  displayedColumns: string[] = [
    'select',
    'reference',
    'label',
    'application',
    'zone',
    'structure',
    'startDate',
    'endDate',
    'status',
    'totalAmount',
    'actions'
  ];
  
  // Selection
  selection = new SelectionModel<Convention>(true, []);
  
  // Filter form
  filterForm: FormGroup;
  
  // Status options
  statusOptions = [
    { value: 'DRAFT', label: 'Brouillon' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'EXPIRED', label: 'Expirée' },
    { value: 'TERMINATED', label: 'Résiliée' },
    { value: 'RENEWED', label: 'Renouvelée' }
  ];
  
  // Loading state
  isLoading = false;
  totalItems = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 100];
  
  // Date pickers
  startDateToPicker: any;
  endDateFromPicker: any;
  endDateToPicker: any;
  
  // Subscriptions
  private subscriptions = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private conventionService: ConventionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    // Load initial data
    this.loadConventions();
    
    // Subscribe to filter changes
    this.subscriptions.add(
      this.filterForm.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(() => {
        this.paginator.firstPage();
        this.loadConventions();
      })
    );
  }

  ngAfterViewInit(): void {
    // Set up sorting
    this.dataSource.sort = this.sort;
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.loadConventions();
    });
    
    // Set up pagination
    this.paginator.page.subscribe(() => {
      this.loadConventions();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Create the filter form
   */
  private createFilterForm(): FormGroup {
    return this.formBuilder.group({
      search: [''],
      status: [''],
      startDateFrom: [''],
      startDateTo: [''],
      endDateFrom: [''],
      endDateTo: ['']
    });
  }

  /**
   * Load conventions with current filters and pagination
   */
  loadConventions(): void {
    this.isLoading = true;
    
    const filter: ConventionFilter = {
      page: this.paginator?.pageIndex + 1 || 1,
      limit: this.paginator?.pageSize || this.pageSize,
      sortField: this.sort?.active,
      sortOrder: this.sort?.direction,
      ...this.filterForm.value
    };
    
    this.subscriptions.add(
      this.conventionService.getConventions(filter).subscribe({
        next: (response) => {
          this.dataSource.data = response.data;
          this.totalItems = response.total;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading conventions:', error);
          this.snackBar.open(
            'Une erreur est survenue lors du chargement des conventions',
            'Fermer',
            { duration: 5000 }
          );
          this.isLoading = false;
        }
      })
    );
  }

  /**
   * Open dialog to create a new convention
   */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ConventionFormDialogComponent, {
      width: '800px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') {
        this.loadConventions();
      }
    });
  }

  /**
   * Open dialog to edit an existing convention
   */
  openEditDialog(convention: Convention): void {
    const dialogRef = this.dialog.open(ConventionFormDialogComponent, {
      width: '800px',
      data: { mode: 'edit', convention }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') {
        this.loadConventions();
      }
    });
  }

  /**
   * Open dialog to view convention details
   */
  openViewDialog(convention: Convention): void {
    this.dialog.open(ConventionFormDialogComponent, {
      width: '800px',
      data: { mode: 'view', convention },
      disableClose: true
    });
  }

  /**
   * Delete a convention
   */
  deleteConvention(convention: Convention): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      data: {
        title: 'Supprimer la convention',
        message: `Êtes-vous sûr de vouloir supprimer la convention "${convention.reference} - ${convention.label}" ?`,
        confirmText: 'Supprimer',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.isLoading = true;
        this.conventionService.deleteConvention(convention.id).subscribe({
          next: () => {
            this.snackBar.open('Convention supprimée avec succès', 'Fermer', { duration: 3000 });
            this.loadConventions();
          },
          error: (error) => {
            console.error('Error deleting convention:', error);
            this.snackBar.open(
              'Une erreur est survenue lors de la suppression de la convention',
              'Fermer',
              { duration: 5000 }
            );
            this.isLoading = false;
          }
        });
      }
    });
  }

  /**
   * Delete selected conventions
   */
  deleteSelectedConventions(): void {
    const selectedCount = this.selection.selected.length;
    
    if (selectedCount === 0) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      data: {
        title: 'Supprimer les conventions sélectionnées',
        message: `Êtes-vous sûr de vouloir supprimer les ${selectedCount} conventions sélectionnées ?`,
        confirmText: 'Supprimer',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.isLoading = true;
        const deleteObservables = this.selection.selected.map(convention => 
          this.conventionService.deleteConvention(convention.id)
        );

        // In a real app, you might want to use forkJoin or similar
        let completed = 0;
        let errors = 0;

        deleteObservables.forEach(obs => {
          obs.subscribe({
            next: () => {
              completed++;
              this.checkCompletion(completed, errors, selectedCount);
            },
            error: (error) => {
              console.error('Error deleting convention:', error);
              errors++;
              this.checkCompletion(completed, errors, selectedCount);
            }
          });
        });
      }
    });
  }

  /**
   * Check if all delete operations are completed
   */
  private checkCompletion(completed: number, errors: number, total: number): void {
    if (completed + errors >= total) {
      if (errors === 0) {
        this.snackBar.open(
          `${completed} convention(s) supprimée(s) avec succès`,
          'Fermer',
          { duration: 5000 }
        );
      } else if (completed === 0) {
        this.snackBar.open(
          `Une erreur est survenue lors de la suppression des conventions`,
          'Fermer',
          { duration: 5000 }
        );
      } else {
        this.snackBar.open(
          `${completed} convention(s) supprimée(s), ${errors} erreur(s)`,
          'Fermer',
          { duration: 5000 }
        );
      }
      
      this.selection.clear();
      this.loadConventions();
    }
  }

  /**
   * Export conventions to Excel
   */
  exportToExcel(): void {
    this.isLoading = true;
    
    // In a real app, you would call an API endpoint to generate the Excel file
    // For now, we'll simulate the export with a timeout
    setTimeout(() => {
      this.isLoading = false;
      this.snackBar.open('Export Excel démarré', 'Fermer', { duration: 3000 });
      
      // In a real app, you would trigger a file download here
      // For example: window.open('/api/conventions/export', '_blank');
    }, 1000);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filterForm.reset();
    this.paginator.pageIndex = 0;
    this.loadConventions();
  }

  /**
   * Whether the number of selected elements matches the total number of rows
   */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /**
   * Selects all rows if they are not all selected; otherwise clear selection
   */
  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /**
   * Get the label for a status
   */
  getStatusLabel(status: string): string {
    const statusOption = this.statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.label : status;
  }

  /**
   * Get the CSS class for a status
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'DRAFT':
        return 'status-draft';
      case 'PENDING':
        return 'status-pending';
      case 'EXPIRED':
        return 'status-expired';
      case 'TERMINATED':
        return 'status-terminated';
      case 'RENEWED':
        return 'status-renewed';
      default:
        return '';
    }
  }

  /**
   * Track by function for ngFor
   */
  trackById(index: number, item: Convention): string {
    return item.id;
  }

  /**
   * Checkbox label for accessibility
   */
  checkboxLabel(row?: Convention): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }

  /**
   * Handle page change
   */
  onPageChange(event: any): void {
    this.pageSize = event.pageSize;
    this.loadConventions();
  }
}
