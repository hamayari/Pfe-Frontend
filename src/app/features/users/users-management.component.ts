import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  lastLogin: Date | null;
  avatar: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  timestamp: Date;
  ipAddress: string;
  result: 'success' | 'failed';
}

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatChipsModule,
    MatMenuModule,
    MatTabsModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.scss']
})
export class UsersManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Data sources
  usersDataSource = new MatTableDataSource<User>([]);
  rolesDataSource = new MatTableDataSource<Role>([]);
  auditDataSource = new MatTableDataSource<AuditLog>([]);

  // Forms
  userForm: FormGroup;
  roleForm: FormGroup;

  // UI State
  selectedTab = 0;
  isLoading = false;
  searchTerm = '';
  selectedRole = 'all';
  selectedStatus = 'all';

  // Sample data
  users: User[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      name: 'Administrateur Principal',
      role: 'ROLE_ADMIN',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date(),
      avatar: this.getDefaultAvatar('Admin')
    },
    {
      id: '2',
      username: 'commercial1',
      email: 'commercial1@example.com',
      name: 'Jean Dupont',
      role: 'ROLE_COMMERCIAL',
      status: 'active',
      createdAt: new Date('2024-02-20'),
      lastLogin: new Date(Date.now() - 3600000),
      avatar: this.getDefaultAvatar('User')
    },
    {
      id: '3',
      username: 'manager1',
      email: 'manager1@example.com',
      name: 'Marie Martin',
      role: 'ROLE_PROJECT_MANAGER',
      status: 'active',
      createdAt: new Date('2024-03-10'),
      lastLogin: new Date(Date.now() - 7200000),
      avatar: this.getDefaultAvatar('Marie Martin')
    },
    {
      id: '4',
      username: 'decision1',
      email: 'decision1@example.com',
      name: 'Pierre Durand',
      role: 'ROLE_DECISION_MAKER',
      status: 'pending',
      createdAt: new Date('2024-04-05'),
      lastLogin: null,
      avatar: this.getDefaultAvatar('Pierre Durand')
    }
  ];

  roles: Role[] = [
    {
      id: '1',
      name: 'ROLE_ADMIN',
      description: 'Administrateur système avec tous les droits',
      permissions: ['users:read', 'users:write', 'system:admin', 'reports:all'],
      userCount: 2
    },
    {
      id: '2',
      name: 'ROLE_COMMERCIAL',
      description: 'Utilisateur commercial avec accès aux conventions',
      permissions: ['conventions:read', 'conventions:write', 'invoices:read'],
      userCount: 15
    },
    {
      id: '3',
      name: 'ROLE_PROJECT_MANAGER',
      description: 'Chef de projet avec gestion d\'équipe',
      permissions: ['projects:read', 'projects:write', 'team:manage'],
      userCount: 8
    },
    {
      id: '4',
      name: 'ROLE_DECISION_MAKER',
      description: 'Preneur de décision avec accès aux rapports',
      permissions: ['reports:read', 'analytics:read', 'decisions:make'],
      userCount: 5
    }
  ];

  auditLogs: AuditLog[] = [
    {
      id: '1',
      userId: '1',
      username: 'admin',
      action: 'LOGIN',
      details: 'Connexion réussie',
      timestamp: new Date(),
      ipAddress: '192.168.1.100',
      result: 'success'
    },
    {
      id: '2',
      userId: '2',
      username: 'commercial1',
      action: 'CREATE_CONVENTION',
      details: 'Création convention REF-2024-001',
      timestamp: new Date(Date.now() - 1800000),
      ipAddress: '192.168.1.101',
      result: 'success'
    },
    {
      id: '3',
      userId: '3',
      username: 'manager1',
      action: 'UPDATE_USER',
      details: 'Modification profil utilisateur ID:4',
      timestamp: new Date(Date.now() - 3600000),
      ipAddress: '192.168.1.102',
      result: 'success'
    }
  ];

  displayedColumns = ['avatar', 'username', 'email', 'name', 'role', 'status', 'createdAt', 'lastLogin', 'actions'];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      role: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      status: ['active']
    });

    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      permissions: [[]]
    });
  }

  ngOnInit() {
    this.loadData();
    this.setupFilters();
  }

  loadData() {
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.usersDataSource.data = this.users;
      this.rolesDataSource.data = this.roles;
      this.auditDataSource.data = this.auditLogs;
      
      this.usersDataSource.paginator = this.paginator;
      this.usersDataSource.sort = this.sort;
      
      this.isLoading = false;
    }, 1000);
  }

  setupFilters() {
    this.usersDataSource.filterPredicate = (data: User, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        data.username.toLowerCase().includes(searchStr) ||
        data.email.toLowerCase().includes(searchStr) ||
        data.name.toLowerCase().includes(searchStr) ||
        data.role.toLowerCase().includes(searchStr)
      );
    };
  }

  applyFilter() {
    let filterValue = this.searchTerm;
    
    if (this.selectedRole !== 'all') {
      filterValue += ` role:${this.selectedRole}`;
    }
    
    if (this.selectedStatus !== 'all') {
      filterValue += ` status:${this.selectedStatus}`;
    }
    
    this.usersDataSource.filter = filterValue.trim().toLowerCase();
  }

  onAddUser() {
    this.userForm.reset({ status: 'active' });
    this.openUserDialog();
  }

  onEditUser(user: User) {
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status
    });
    this.userForm.get('password')?.clearValidators();
    this.openUserDialog();
  }

  onDeleteUser(user: User) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.username} ?`)) {
      this.users = this.users.filter(u => u.id !== user.id);
      this.usersDataSource.data = this.users;
      this.snackBar.open('Utilisateur supprimé avec succès', 'Fermer', { duration: 3000 });
    }
  }

  onResetPassword(user: User) {
    this.snackBar.open(`Mot de passe réinitialisé pour ${user.username}`, 'Fermer', { duration: 3000 });
  }

  onAddRole() {
    this.roleForm.reset();
    this.openRoleDialog();
  }

  onEditRole(role: Role) {
    this.roleForm.patchValue({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    this.openRoleDialog();
  }

  onDeleteRole(role: Role) {
    if (role.userCount > 0) {
      this.snackBar.open('Impossible de supprimer un rôle utilisé par des utilisateurs', 'Fermer', { duration: 3000 });
      return;
    }
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer le rôle ${role.name} ?`)) {
      this.roles = this.roles.filter(r => r.id !== role.id);
      this.rolesDataSource.data = this.roles;
      this.snackBar.open('Rôle supprimé avec succès', 'Fermer', { duration: 3000 });
    }
  }

  openUserDialog() {
    // Implementation for user dialog
    this.snackBar.open('Fonctionnalité de dialogue à implémenter', 'Fermer', { duration: 2000 });
  }

  openRoleDialog() {
    // Implementation for role dialog
    this.snackBar.open('Fonctionnalité de dialogue à implémenter', 'Fermer', { duration: 2000 });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warn';
      case 'pending': return 'accent';
      default: return 'primary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active': return 'check_circle';
      case 'inactive': return 'cancel';
      case 'pending': return 'pending';
      default: return 'help';
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN': return 'warn';
      case 'ROLE_COMMERCIAL': return 'primary';
      case 'ROLE_PROJECT_MANAGER': return 'accent';
      case 'ROLE_DECISION_MAKER': return 'success';
      default: return 'primary';
    }
  }

  exportData(type: 'users' | 'roles' | 'audit') {
    this.snackBar.open(`Export ${type} en cours...`, 'Fermer', { duration: 2000 });
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'LOGIN': return 'login';
      case 'LOGOUT': return 'logout';
      case 'CREATE_CONVENTION': return 'add_circle';
      case 'UPDATE_USER': return 'edit';
      case 'DELETE_USER': return 'delete';
      case 'RESET_PASSWORD': return 'lock_reset';
      default: return 'info';
    }
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
