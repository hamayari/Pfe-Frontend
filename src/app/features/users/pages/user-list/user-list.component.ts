import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { User, UserFilters, UserListResponse, UserRole, UserStatus } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { UserFormComponent } from '../../components/user-form/user-form.component';
import { TruncatePipe } from '../../../../shared/pipes/truncate.pipe';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    TruncatePipe
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table data
  dataSource = new MatTableDataSource<User>([]);
  displayedColumns: string[] = [
    'name', 
    'email', 
    'role', 
    'status', 
    'lastLogin', 
    'actions'
  ];

  // Filters
  filterForm = new FormGroup({
    search: new FormControl(''),
    role: new FormControl<UserRole | ''>(''),
    status: new FormControl<UserStatus | ''>('')
  });

  // Pagination
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 100];

  // Loading state
  isLoading = false;
  
  // Available roles and statuses for filters
  roles: {value: string, label: string}[] = [];
  statuses: {value: string, label: string}[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRolesAndStatuses();
    this.setupFilterListeners();
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load users with current filters and pagination
   */
  loadUsers(): void {
    this.isLoading = true;
    
    const filters: UserFilters = {
      search: this.filterForm.get('search')?.value || undefined,
      role: this.filterForm.get('role')?.value as UserRole || undefined,
      status: this.filterForm.get('status')?.value as UserStatus || undefined,
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
      sortField: this.sort?.active || 'lastName',
      sortOrder: this.sort?.direction as 'asc' | 'desc' || 'asc'
    };

    this.userService.getUsers(filters).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.totalItems = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  /**
   * Load available roles and statuses for filters
   */
  private loadRolesAndStatuses(): void {
    this.userService.getRoles().subscribe(roles => {
      this.roles = roles;
    });

    this.userService.getStatuses().subscribe(statuses => {
      this.statuses = statuses;
    });
  }

  /**
   * Set up listeners for filter changes
   */
  private setupFilterListeners(): void {
    // Debounce search input
    this.filterForm.get('search')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageIndex = 0;
      this.loadUsers();
    });

    // Listen to role and status changes
    this.filterForm.get('role')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.pageIndex = 0;
      this.loadUsers();
    });

    this.filterForm.get('status')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.pageIndex = 0;
      this.loadUsers();
    });
  }

  /**
   * Handle page change event
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  /**
   * Handle sort change event
   */
  onSortChange(sort: Sort): void {
    this.loadUsers();
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      role: '',
      status: ''
    });
    this.pageIndex = 0;
    this.loadUsers();
  }

  /**
   * Open dialog to create a new user
   */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
        this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Open dialog to edit a user
   */
  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '600px',
      data: { mode: 'edit', user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
        this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Open dialog to confirm user deletion
   */
  openDeleteDialog(user: User): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteUser(user._id || user.id || '');
      }
    });
  }

  /**
   * Delete a user
   */
  private deleteUser(userId: string): void {
    this.isLoading = true;
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  /**
   * Format date for display
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Never';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }

  /**
   * Get status color for badge
   */
  getStatusColor(status: UserStatus): string {
    switch (status) {
      case UserStatus.ACTIVE: return 'primary';
      case UserStatus.INACTIVE: return 'accent';
      case UserStatus.SUSPENDED: return 'warn';
      case UserStatus.PENDING: return 'accent';
      default: return '';
    }
  }

  /**
   * Get role display name
   */
  getRoleDisplay(role: UserRole): string {
    const roleMap: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: 'Super Admin',
      [UserRole.ADMIN]: 'Administrator',
      [UserRole.COMMERCIAL]: 'Commercial',
      [UserRole.PROJECT_MANAGER]: 'Project Manager',
      [UserRole.DECISION_MAKER]: 'Decision Maker',
      [UserRole.USER]: 'Standard User'
    };
    return roleMap[role] || role;
  }
}
