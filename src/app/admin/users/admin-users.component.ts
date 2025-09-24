import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserDialogComponent } from '../../dashboard/admin-dashboard/user-dialog/user-dialog.component';
import { UserService } from '../../services/user.service';
import { User, UserRole } from '../../models/user.model';
import { BlockUserDialogComponent } from './block-user-dialog.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    UserDialogComponent,
    BlockUserDialogComponent
  ],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['username', 'email', 'roles', 'active', 'createdAt', 'actions'];
  dataSource: MatTableDataSource<User> = new MatTableDataSource();
  availableRoles = [
    { value: 'ROLE_ADMIN', viewValue: 'Admin' },
    { value: 'ROLE_COMMERCIAL', viewValue: 'Commercial' },
    { value: 'ROLE_PROJECT_MANAGER', viewValue: 'Chef de projet' },
    { value: 'ROLE_DECISION_MAKER', viewValue: 'Décideur' },
    { value: 'ROLE_SUPER_ADMIN', viewValue: 'Super Admin' },
  ];
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private userService: UserService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dataSource.data = response.data.users;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement des utilisateurs', 'Fermer', { duration: 3000 });
      }
    });
  }

  applySearchFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  applyRoleFilter(role: string): void {
    this.dataSource.filterPredicate = (data: User, filter: string) => {
      if (!filter) return true;
      return data.roles.includes(filter as UserRole);
    };
    this.dataSource.filter = role;
  }

  formatRole(role: string): string {
    return role.replace('ROLE_', '').replace('_', ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  }

  getRoleClass(role: string): string {
    const roleName = role.replace('ROLE_', '').toLowerCase();
    return `chip-role-${roleName}`;
  }

  openUserDialog(user: User | null = null): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  deleteUser(userId: string): void {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
          this.snackBar.open('Utilisateur supprimé avec succès', 'Fermer', { duration: 3000 });
        },
        error: () => this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 })
      });
    }
  }

  getUserStatusClass(user: User): string {
    return user.enabled ? 'status-active' : 'status-inactive';
  }

  // Un utilisateur est considéré comme actif s'il est activé, a vérifié son email, n'est pas bloqué et n'est pas désactivé par un admin.
  isUserReallyActive(user: User): boolean {
    return (user.active ?? false) && (user.emailVerified ?? false) && !(user.locked ?? false) && (user.enabled ?? false);
  }

  // --- Blocage utilisateur ---
  openBlockUserDialog(user: User): void {
    const dialogRef = this.dialog.open(BlockUserDialogComponent, {
      width: '400px',
      data: { username: user.username }
    });
    dialogRef.afterClosed().subscribe((reason: string) => {
      if (reason && reason.trim().length > 0) {
        this.blockUser(user, reason.trim());
      } else if (reason !== undefined) {
        this.snackBar.open('La raison du blocage est obligatoire.', 'Fermer', { duration: 3000 });
      }
    });
  }

  blockUser(user: User, reason: string): void {
    // Utiliser changeUserStatus pour bloquer l'utilisateur
    this.userService.changeUserStatus(user.id, 'SUSPENDED').subscribe({
      next: () => {
        this.snackBar.open('Utilisateur bloqué avec succès.', 'Fermer', { duration: 3000 });
        this.loadUsers();
      },
      error: (error: any) => {
        this.snackBar.open('Erreur lors du blocage : ' + (error?.error?.message || 'inconnue'), 'Fermer', { duration: 4000 });
      }
    });
  }

  unblockUser(user: User): void {
    // Utiliser changeUserStatus pour débloquer l'utilisateur
    this.userService.changeUserStatus(user.id, 'ACTIVE').subscribe({
      next: () => {
        this.snackBar.open('Utilisateur débloqué avec succès.', 'Fermer', { duration: 3000 });
        this.loadUsers();
      },
      error: (error: any) => {
        this.snackBar.open('Erreur lors du déblocage : ' + (error?.error?.message || 'inconnue'), 'Fermer', { duration: 4000 });
      }
    });
  }

  // Générer un avatar SVG par défaut
  getDefaultAvatar(name: string): string {
    // Générer un avatar SVG par défaut avec les initiales
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const colorIndex = name.length % colors.length;
    const backgroundColor = colors[colorIndex];
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="${backgroundColor}"/>
        <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">${initials}</text>
      </svg>
    `)}`;
  }
} 