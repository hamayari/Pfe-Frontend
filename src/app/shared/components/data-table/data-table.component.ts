import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
// import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
// import { StatusBadgeComponent } from '../status-badge/status-badge.component';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'status' | 'action' | 'checkbox' | 'image' | 'currency';
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: any, row: any) => string;
  renderer?: (value: any, row: any) => any;
  actions?: TableAction[];
}

export interface TableAction {
  label: string;
  icon: string;
  action: string;
  color?: 'primary' | 'accent' | 'warn';
  disabled?: (row: any) => boolean;
  hidden?: (row: any) => boolean;
}

export interface TableConfig {
  showSearch?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  showSorting?: boolean;
  showSelection?: boolean;
  showActions?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  loading?: boolean;
  emptyMessage?: string;
  noDataMessage?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSelectModule,
    MatCheckboxModule
    // LoadingSpinnerComponent,
    // StatusBadgeComponent
  ],
  template: `
    <div class="data-table-container">
      <!-- Table Header with Search and Filters -->
      <div class="table-header" *ngIf="config.showSearch || config.showFilters">
        <div class="header-left">
          <!-- Search Field -->
          <mat-form-field *ngIf="config.showSearch" appearance="outline" class="search-field">
            <mat-label>Rechercher</mat-label>
            <input matInput 
                   [(ngModel)]="searchTerm" 
                   (input)="onSearchChange()"
                   placeholder="Tapez pour rechercher...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <!-- Filters -->
          <div class="filters-container" *ngIf="config.showFilters && filterableColumns.length > 0">
            <mat-form-field *ngFor="let column of filterableColumns" 
                           appearance="outline" 
                           class="filter-field">
              <mat-label>{{ column.label }}</mat-label>
              <mat-select [(ngModel)]="filters[column.key]" 
                         (selectionChange)="onFilterChange()">
                <mat-option value="">Tous</mat-option>
                <mat-option *ngFor="let option of getFilterOptions(column.key)" 
                           [value]="option">
                  {{ option }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <div class="header-right">
          <!-- Bulk Actions -->
          <div class="bulk-actions" *ngIf="config.showSelection && selectedRows.length > 0">
            <span class="selected-count">{{ selectedRows.length }} sélectionné(s)</span>
            <button mat-stroked-button 
                    color="warn" 
                    (click)="clearSelection()">
              <mat-icon>clear</mat-icon>
              Effacer
            </button>
          </div>

          <!-- Refresh Button -->
          <button mat-icon-button 
                  (click)="onRefresh()"
                  matTooltip="Actualiser">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="config.loading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Chargement des données...</p>
      </div>

      <!-- Table Content -->
      <div class="table-content" *ngIf="!config.loading">
        <!-- Empty State -->
        <div class="empty-state" *ngIf="filteredData.length === 0">
          <mat-icon>inbox</mat-icon>
          <h3>{{ config.emptyMessage || 'Aucune donnée trouvée' }}</h3>
          <p>{{ config.noDataMessage || 'Essayez de modifier vos critères de recherche' }}</p>
        </div>

        <!-- Data Table -->
        <div class="table-wrapper" *ngIf="filteredData.length > 0">
          <table mat-table 
                 [dataSource]="paginatedData" 
                 matSort 
                 (matSortChange)="onSortChange($event)"
                 class="data-table">
            
            <!-- Selection Column -->
            <ng-container *ngIf="config.showSelection" matColumnDef="select">
              <th mat-header-cell *matHeaderCellDef>
                <mat-checkbox (change)="$event ? masterToggle() : null"
                             [checked]="selection.hasValue() && isAllSelected()"
                             [indeterminate]="selection.hasValue() && !isAllSelected()">
                </mat-checkbox>
              </th>
              <td mat-cell *matCellDef="let row">
                <mat-checkbox (click)="$event.stopPropagation()"
                             (change)="$event ? selection.toggle(row) : null"
                             [checked]="selection.isSelected(row)">
                </mat-checkbox>
              </td>
            </ng-container>

            <!-- Dynamic Columns -->
            <ng-container *ngFor="let column of visibleColumns" 
                         [matColumnDef]="column.key">
              <th mat-header-cell *matHeaderCellDef 
                  [mat-sort-header]="column.sortable ? column.key : ''"
                  [style.width]="column.width"
                  [style.text-align]="column.align || 'left'">
                {{ column.label }}
              </th>
              <td mat-cell *matCellDef="let row" 
                  [style.text-align]="column.align || 'left'">
                
                <!-- Text Type -->
                <span *ngIf="column.type === 'text' || !column.type">
                  {{ column.formatter ? column.formatter(row[column.key], row) : row[column.key] }}
                </span>

                <!-- Number Type -->
                <span *ngIf="column.type === 'number'" class="number-cell">
                  {{ column.formatter ? column.formatter(row[column.key], row) : (row[column.key] | number) }}
                </span>

                <!-- Date Type -->
                <span *ngIf="column.type === 'date'" class="date-cell">
                  {{ column.formatter ? column.formatter(row[column.key], row) : (row[column.key] | date:'short') }}
                </span>

                <!-- Status Type -->
                <mat-chip *ngIf="column.type === 'status'" [color]="getStatusColor(row[column.key])">
                  {{ column.formatter ? column.formatter(row[column.key], row) : row[column.key] }}
                </mat-chip>

                <!-- Currency Type -->
                <span *ngIf="column.type === 'currency'" class="currency-cell">
                  {{ column.formatter ? column.formatter(row[column.key], row) : (row[column.key] | currency:'EUR') }}
                </span>

                <!-- Image Type -->
                <img *ngIf="column.type === 'image'"
                     [src]="row[column.key]"
                     [alt]="column.formatter ? column.formatter(row[column.key], row) : 'Image'"
                     class="table-image">

                <!-- Custom Renderer -->
                <ng-container *ngIf="column.renderer">
                  <ng-container *ngTemplateOutlet="column.renderer(row[column.key], row)">
                  </ng-container>
                </ng-container>

                <!-- Actions Type -->
                <div *ngIf="column.type === 'action' && column.actions" class="action-buttons">
                  <button mat-icon-button 
                          *ngFor="let action of getVisibleActions(column.actions, row)"
                          [matMenuTriggerFor]="actionMenu"
                          [disabled]="action.disabled ? action.disabled(row) : false"
                          [matTooltip]="action.label"
                          (click)="onActionClick(action.action, row)">
                    <mat-icon>{{ action.icon }}</mat-icon>
                  </button>
                  <mat-menu #actionMenu="matMenu">
                    <button mat-menu-item *ngFor="let action of getVisibleActions(column.actions, row)"
                            (click)="onActionClick(action.action, row)">
                      <mat-icon>{{ action.icon }}</mat-icon>
                      {{ action.label }}
                    </button>
                  </mat-menu>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                [class.selected-row]="selection.isSelected(row)"
                (click)="onRowClick(row)">
            </tr>
          </table>

          <!-- Pagination -->
          <mat-paginator *ngIf="config.showPagination"
                         [length]="filteredData.length"
                         [pageSize]="config.pageSize || 10"
                         [pageSizeOptions]="config.pageSizeOptions || [5, 10, 25, 50]"
                         [pageIndex]="currentPage"
                         (page)="onPageChange($event)"
                         showFirstLastButtons>
          </mat-paginator>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() config: TableConfig = {};
  @Input() selection: any = { selected: [] };

  @Output() rowClick = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() refresh = new EventEmitter<void>();

  searchTerm: string = '';
  filters: { [key: string]: any } = {};
  currentPage: number = 0;
  pageSize: number = 10;
  sortDirection: 'asc' | 'desc' = 'asc';
  sortColumn: string = '';

  filteredData: any[] = [];
  paginatedData: any[] = [];
  selectedRows: any[] = [];

  get visibleColumns(): TableColumn[] {
    return this.columns.filter(col => col.key !== 'actions' || this.config.showActions);
  }

  get displayedColumns(): string[] {
    const cols = this.visibleColumns.map(col => col.key);
    if (this.config.showSelection) {
      cols.unshift('select');
    }
    return cols;
  }

  get filterableColumns(): TableColumn[] {
    return this.columns.filter(col => col.filterable);
  }

  ngOnInit(): void {
    this.initializeTable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['columns'] || changes['config']) {
      this.initializeTable();
    }
  }

  initializeTable(): void {
    this.applyFilters();
    this.updatePagination();
  }

  onSearchChange(): void {
    this.currentPage = 0;
    this.applyFilters();
    this.updatePagination();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.applyFilters();
    this.updatePagination();
  }

  onSortChange(sort: Sort): void {
    this.sortColumn = sort.active;
    this.sortDirection = sort.direction || 'asc';
    this.applyFilters();
    this.updatePagination();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  onActionClick(action: string, row: any): void {
    this.actionClick.emit({ action, row });
  }

  onRefresh(): void {
    this.refresh.emit();
  }

  applyFilters(): void {
    let filtered = [...this.data];

    // Apply search
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(row => 
        this.columns.some(col => {
          const value = row[col.key];
          if (value === null || value === undefined) return false;
          return value.toString().toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply column filters
    Object.keys(this.filters).forEach(key => {
      const filterValue = this.filters[key];
      if (filterValue) {
        filtered = filtered.filter(row => row[key] === filterValue);
      }
    });

    // Apply sorting
    if (this.sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[this.sortColumn];
        const bVal = b[this.sortColumn];
        
        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.filteredData = filtered;
  }

  updatePagination(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
  }

  getFilterOptions(columnKey: string): any[] {
    const uniqueValues = [...new Set(this.data.map(row => row[columnKey]))];
    return uniqueValues.filter(value => value !== null && value !== undefined);
  }

  getVisibleActions(actions: TableAction[], row: any): TableAction[] {
    return actions.filter(action => !action.hidden || !action.hidden(row));
  }

  // Selection methods
  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.paginatedData.forEach(row => this.selection.select(row));
    }
    this.updateSelectedRows();
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.paginatedData.length;
    return numSelected === numRows;
  }

  clearSelection(): void {
    this.selection.clear();
    this.updateSelectedRows();
  }

  updateSelectedRows(): void {
    this.selectedRows = this.selection.selected;
    this.selectionChange.emit(this.selectedRows);
  }

  getStatusColor(status: any): string {
    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'active':
        case 'actif':
        case 'paid':
        case 'payé':
          return 'primary';
        case 'pending':
        case 'en attente':
        case 'waiting':
          return 'accent';
        case 'inactive':
        case 'inactif':
        case 'cancelled':
        case 'annulé':
        case 'error':
        case 'erreur':
          return 'warn';
        default:
          return 'primary';
      }
    }
    return 'primary';
  }
}







