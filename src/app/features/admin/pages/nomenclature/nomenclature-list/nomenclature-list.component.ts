import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

// Models and Services
import { 
  Nomenclature, 
  NomenclatureFilter, 
  NomenclatureType, 
  NomenclatureListResponse
} from 'src/app/core/models/nomenclature.model';
import { NomenclatureService } from 'src/app/core/services/nomenclature.service';

// Components
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-nomenclature-list',
  templateUrl: './nomenclature-list.component.html',
  styleUrls: ['./nomenclature-list.component.scss']
})
export class NomenclatureListComponent implements OnInit, OnDestroy {
  // Table configuration
  displayedColumns: string[] = [
    'code', 
    'label', 
    'type', 
    'isActive', 
    'createdAt', 
    'actions'
  ];
  dataSource!: MatTableDataSource<Nomenclature>;
  
  // Pagination and sorting
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  // Filtering
  searchControl = new FormControl('');
  typeFilter = new FormControl('all');
  statusFilter = new FormControl('all');
  
  // Data
  loading = false;
  totalItems = 0;
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 100];
  
  // Available filters
  nomenclatureTypes = [
    { code: NomenclatureType.GOVERNORATE, label: 'Gouvernorat' },
    { code: NomenclatureType.STRUCTURE, label: 'Structure' },
    { code: NomenclatureType.APPLICATION, label: 'Application' },
    { code: NomenclatureType.STATUS, label: 'Statut' },
    { code: NomenclatureType.PAYMENT_TERM, label: 'Terme de paiement' }
  ];
  
  // Destroy subject
  private destroy$ = new Subject<void>();

  constructor(
    private nomenclatureService: NomenclatureService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Initialize data source
    this.dataSource = new MatTableDataSource<Nomenclature>([]);
    
    // Load initial data
    this.loadNomenclatures();
    
    // Setup search filter
    this.setupSearchFilter();
    
    // Setup type filter
    this.setupTypeFilter();
    
    // Setup status filter
    this.setupStatusFilter();
  }
  
  ngAfterViewInit() {
    // Connect paginator and sort
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Handle sort changes
    this.sort.sortChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.paginator.pageIndex = 0;
        this.loadNomenclatures();
      });
    
    // Handle page changes
    this.paginator.page
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadNomenclatures());
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Setup search filter with debounce
   */
  private setupSearchFilter(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.paginator.pageIndex = 0;
        this.loadNomenclatures();
      });
  }
  
  /**
   * Setup type filter
   */
  private setupTypeFilter(): void {
    this.typeFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.paginator.pageIndex = 0;
        this.loadNomenclatures();
      });
  }
  
  /**
   * Setup status filter
   */
  private setupStatusFilter(): void {
    this.statusFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.paginator.pageIndex = 0;
        this.loadNomenclatures();
      });
  }
  
  /**
   * Load nomenclatures with current filters
   */
  loadNomenclatures(): void {
    this.loading = true;
    
    // Build filter
    const filter: NomenclatureFilter = {
      page: this.paginator?.pageIndex || 0,
      limit: this.paginator?.pageSize || this.pageSize,
      search: this.searchControl.value || undefined,
      type: this.typeFilter.value !== 'all' ? this.typeFilter.value as NomenclatureType : undefined,
      isActive: this.statusFilter.value !== 'all' ? this.statusFilter.value === 'active' : undefined,
      sortField: this.sort?.active || 'label',
      sortOrder: this.sort?.direction as 'asc' | 'desc' || 'asc'
    };
    
    // Get nomenclatures
    this.nomenclatureService.getNomenclatures(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: NomenclatureListResponse) => {
          this.dataSource.data = response.data;
          this.totalItems = response.total;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading nomenclatures:', error);
          this.snackBar.open(
            'Une erreur est survenue lors du chargement des nomenclatures', 
            'Fermer', 
            { duration: 5000 }
          );
          this.loading = false;
        }
      });
  }
  
  /**
   * Navigate to create form
   */
  createNomenclature(): void {
    this.router.navigate(['new'], { relativeTo: this.route });
  }
  
  /**
   * Navigate to edit form
   */
  editNomenclature(nomenclature: Nomenclature): void {
    this.router.navigate([nomenclature.id, 'edit'], { relativeTo: this.route });
  }
  
  /**
   * View nomenclature details
   */
  viewNomenclature(nomenclature: Nomenclature): void {
    this.router.navigate([nomenclature.id], { relativeTo: this.route });
  }
  
  /**
   * Toggle nomenclature status
   */
  toggleStatus(nomenclature: Nomenclature, event: MatSlideToggleChange): void {
    event.source._elementRef.nativeElement.blur();
    
    const newStatus = event.checked;
    
    this.nomenclatureService.toggleStatus(nomenclature.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          nomenclature.isActive = newStatus;
          this.snackBar.open(
            `Nomenclature ${newStatus ? 'activée' : 'désactivée'} avec succès`, 
            'Fermer', 
            { duration: 3000 }
          );
        },
        error: (error) => {
          console.error('Error updating nomenclature status:', error);
          this.snackBar.open(
            'Une erreur est survenue lors de la mise à jour du statut', 
            'Fermer', 
            { duration: 5000 }
          );
        }
      });
  }
  
  /**
   * Delete nomenclature with confirmation
   */
  deleteNomenclature(nomenclature: Nomenclature, event: Event): void {
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer la nomenclature',
        message: `Êtes-vous sûr de vouloir supprimer la nomenclature "${nomenclature.label}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.nomenclatureService.deleteNomenclature(nomenclature.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open(
                'Nomenclature supprimée avec succès', 
                'Fermer', 
                { duration: 3000 }
              );
              this.loadNomenclatures();
            },
            error: (error) => {
              console.error('Error deleting nomenclature:', error);
              this.snackBar.open(
                'Une erreur est survenue lors de la suppression', 
                'Fermer', 
                { duration: 5000 }
              );
            }
          });
      }
    });
  }
  
  /**
   * Apply filter to the table
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.searchControl.setValue('');
    this.typeFilter.setValue('all');
    this.statusFilter.setValue('all');
    
    // Reset will trigger loadNomenclatures through valueChanges
  }
  
  /**
   * Track by function for ngFor
   */
  trackById(index: number, item: Nomenclature): string {
    return item.id;
  }

  /**
   * Handle page change
   */
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadNomenclatures();
  }
}
