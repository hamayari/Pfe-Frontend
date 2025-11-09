import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuditLogService, AuditLog, AuditLogFilters } from '../../services/audit-log.service';

@Component({
  selector: 'app-audit-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatBadgeModule,
    MatSnackBarModule
  ],
  templateUrl: './audit-history.component.html',
  styleUrls: ['./audit-history.component.scss']
})
export class AuditHistoryComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table data
  dataSource = new MatTableDataSource<AuditLog>([]);
  displayedColumns: string[] = ['timestamp', 'username', 'action', 'entityType', 'entityId', 'details', 'actions'];
  
  // Filters
  filters: AuditLogFilters = {
    page: 0,
    size: 10
  };
  
  searchControl = new FormControl('');
  
  // Pagination
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  
  // Loading state
  loading = false;
  
  // Filter options
  actionTypes = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PAYMENT', 'STATUS_CHANGE', 'EXPORT'];
  entityTypes = ['CONVENTION', 'INVOICE', 'USER', 'STRUCTURE', 'APPLICATION', 'NOMENCLATURE'];
  
  // Date filters
  startDate: Date | null = null;
  endDate: Date | null = null;
  
  // Quick filters
  quickFilters = [
    { label: 'Aujourd\'hui', value: 'today' },
    { label: 'Cette semaine', value: 'week' },
    { label: 'Ce mois', value: 'month' },
    { label: 'Tout', value: 'all' }
  ];
  
  selectedQuickFilter = 'all';

  constructor(
    private auditLogService: AuditLogService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAuditLogs();
    this.setupSearch();
  }

  /**
   * Configuration de la recherche avec debounce
   */
  setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.applySearch(searchTerm || '');
      });
  }

  /**
   * Charger les logs d'audit
   */
  loadAuditLogs(): void {
    this.loading = true;
    
    this.auditLogService.getAuditLogs(this.filters).subscribe({
      next: (response) => {
        this.dataSource.data = response.content;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des logs:', error);
        this.snackBar.open('Erreur lors du chargement des logs', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  /**
   * Appliquer les filtres
   */
  applyFilters(): void {
    this.filters.page = 0;
    this.pageIndex = 0;
    
    if (this.startDate) {
      this.filters.startDate = this.formatDate(this.startDate);
    } else {
      delete this.filters.startDate;
    }
    
    if (this.endDate) {
      this.filters.endDate = this.formatDate(this.endDate);
    } else {
      delete this.filters.endDate;
    }
    
    this.loadAuditLogs();
  }

  /**
   * Appliquer la recherche
   */
  applySearch(searchTerm: string): void {
    if (searchTerm.trim()) {
      this.filters.username = searchTerm;
    } else {
      delete this.filters.username;
    }
    this.applyFilters();
  }

  /**
   * Réinitialiser les filtres
   */
  resetFilters(): void {
    this.filters = { page: 0, size: 10 };
    this.searchControl.setValue('');
    this.startDate = null;
    this.endDate = null;
    this.selectedQuickFilter = 'all';
    this.loadAuditLogs();
  }

  /**
   * Appliquer un filtre rapide
   */
  applyQuickFilter(filter: string): void {
    this.selectedQuickFilter = filter;
    const now = new Date();
    
    switch (filter) {
      case 'today':
        this.startDate = new Date(now.setHours(0, 0, 0, 0));
        this.endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        this.startDate = new Date(weekStart.setHours(0, 0, 0, 0));
        this.endDate = new Date();
        break;
      case 'month':
        this.startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        this.endDate = new Date();
        break;
      case 'all':
        this.startDate = null;
        this.endDate = null;
        break;
    }
    
    this.applyFilters();
  }

  /**
   * Gérer le changement de page
   */
  onPageChange(event: PageEvent): void {
    this.filters.page = event.pageIndex;
    this.filters.size = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAuditLogs();
  }

  /**
   * Exporter en CSV
   */
  exportCSV(): void {
    this.auditLogService.exportToCSV(this.filters);
    this.snackBar.open('Export CSV en cours...', 'Fermer', { duration: 2000 });
  }

  /**
   * Exporter en JSON
   */
  exportJSON(): void {
    this.auditLogService.exportToJSON(this.filters);
    this.snackBar.open('Export JSON en cours...', 'Fermer', { duration: 2000 });
  }

  /**
   * Obtenir la couleur du chip selon l'action
   */
  getActionColor(action: string): string {
    const colors: { [key: string]: string } = {
      'CREATE': 'primary',
      'UPDATE': 'accent',
      'DELETE': 'warn',
      'LOGIN': 'primary',
      'LOGOUT': '',
      'PAYMENT': 'primary',
      'STATUS_CHANGE': 'accent',
      'EXPORT': ''
    };
    return colors[action] || '';
  }

  /**
   * Obtenir l'icône selon l'action
   */
  getActionIcon(action: string): string {
    const icons: { [key: string]: string } = {
      'CREATE': 'add_circle',
      'UPDATE': 'edit',
      'DELETE': 'delete',
      'LOGIN': 'login',
      'LOGOUT': 'logout',
      'PAYMENT': 'payment',
      'STATUS_CHANGE': 'swap_horiz',
      'EXPORT': 'download'
    };
    return icons[action] || 'info';
  }

  /**
   * Formater une date pour l'API
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * Voir les détails d'un log
   */
  viewDetails(log: AuditLog): void {
    console.log('Détails du log:', log);
    // Vous pouvez ouvrir un dialog ici pour afficher les détails complets
  }
}














































