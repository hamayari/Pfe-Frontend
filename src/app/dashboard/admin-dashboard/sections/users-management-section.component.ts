import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../../features/users/services/user.service';
import { User, UserRole, UserStatus } from '../../../features/users/models/user.model';


interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
  createdAt: Date;
}

interface AuditLog {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: Date;
  ipAddress: string;
  status: 'success' | 'failure';
  userAgent?: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

@Component({
  selector: 'app-users-management-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="users-management-section">
      <mat-card class="main-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>people</mat-icon>
            Gestion des Utilisateurs
          </mat-card-title>
          <mat-card-subtitle>Gestion complète des utilisateurs, rôles et audit</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <mat-tab-group (selectedTabChange)="onTabChange($event)">
            
            <!-- Onglet Tous les utilisateurs -->
            <mat-tab label="Tous les utilisateurs">
              <div class="tab-content">
                <!-- Filtres -->
                <div class="filters-section">
                  <div class="filter-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Rôle</mat-label>
                      <mat-select [(ngModel)]="selectedRole">
                        <mat-option value="all">Tous les rôles</mat-option>
                        <mat-option *ngFor="let role of roles" [value]="role.name">
                          {{ role.name }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Statut</mat-label>
                      <mat-select [(ngModel)]="selectedStatus">
                        <mat-option value="all">Tous les statuts</mat-option>
                        <mat-option value="active">Actif</mat-option>
                        <mat-option value="pending">En attente</mat-option>
                        <mat-option value="inactive">Inactif</mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Recherche</mat-label>
                      <input matInput [(ngModel)]="searchTerm" placeholder="Nom, email...">
                      <mat-icon matSuffix>search</mat-icon>
                    </mat-form-field>
                  </div>
                </div>

                <!-- Actions -->
                <div class="actions-section">
                  <button mat-raised-button color="primary" (click)="addUser()">
                    <mat-icon>person_add</mat-icon>
                    Nouvel Utilisateur
                  </button>
                  <button mat-raised-button (click)="exportUsers()">
                    <mat-icon>download</mat-icon>
                    Exporter
                  </button>
                </div>

                <!-- Indicateur de chargement -->
                <div *ngIf="loading" class="loading-container">
                  <mat-spinner></mat-spinner>
                  <p>Chargement des utilisateurs...</p>
                </div>

                <!-- Tableau utilisateurs -->
                <table *ngIf="!loading" mat-table [dataSource]="usersDataSource" matSort class="users-table">
                  <!-- Nom -->
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Nom</th>
                    <td mat-cell *matCellDef="let user">{{ user.name }}</td>
                  </ng-container>
                  
                  <!-- Email -->
                  <ng-container matColumnDef="email">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
                    <td mat-cell *matCellDef="let user">{{ user.email }}</td>
                  </ng-container>
                  
                  <!-- Rôle -->
                  <ng-container matColumnDef="role">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Rôle</th>
                    <td mat-cell *matCellDef="let user">{{ user.role }}</td>
                  </ng-container>
                  
                  <!-- Statut -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
                    <td mat-cell *matCellDef="let user">
                      <mat-chip [ngClass]="getUserStatusColor(user.status)">
                        {{ getUserStatusLabel(user.status) }}
                      </mat-chip>
                    </td>
                  </ng-container>
                  
                  <!-- Date création -->
                  <ng-container matColumnDef="createdAt">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Créé le</th>
                    <td mat-cell *matCellDef="let user">{{ user.createdAt | date:'dd/MM/yyyy' }}</td>
                  </ng-container>
                  
                  <!-- Dernière connexion -->
                  <ng-container matColumnDef="lastLogin">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Dernière connexion</th>
                    <td mat-cell *matCellDef="let user">
                      {{ user.lastLogin ? (user.lastLogin | date:'dd/MM/yyyy HH:mm') : 'Jamais' }}
                    </td>
                  </ng-container>
                  
                  <!-- Actions -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let user">
                      <button mat-icon-button [matMenuTriggerFor]="userMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #userMenu="matMenu">
                        <button mat-menu-item (click)="viewUser(user)">
                          <mat-icon>visibility</mat-icon>
                          <span>Voir profil</span>
                        </button>
                        <button mat-menu-item (click)="editUser(user)">
                          <mat-icon>edit</mat-icon>
                          <span>Modifier</span>
                        </button>
                        <button mat-menu-item (click)="resetPassword(user)">
                          <mat-icon>lock_reset</mat-icon>
                          <span>Réinitialiser mot de passe</span>
                        </button>
                        <button mat-menu-item (click)="toggleUserStatus(user)">
                          <mat-icon>{{ user.status === 'ACTIVE' ? 'block' : 'check_circle' }}</mat-icon>
                          <span>{{ user.status === 'ACTIVE' ? 'Désactiver' : 'Activer' }}</span>
                        </button>
                        <button mat-menu-item (click)="deleteUser(user)" class="delete-action">
                          <mat-icon>delete</mat-icon>
                          <span>Supprimer</span>
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>
                  
                  <tr mat-header-row *matHeaderRowDef="usersDisplayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: usersDisplayedColumns;"></tr>
                </table>
                
                <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" showFirstLastButtons></mat-paginator>
              </div>
            </mat-tab>
            
            <!-- Onglet Rôles & Permissions -->
            <mat-tab label="Rôles & Permissions">
              <div class="tab-content">
                <!-- Actions -->
                <div class="actions-section">
                  <button mat-raised-button color="primary" (click)="addRole()">
                    <mat-icon>add</mat-icon>
                    Nouveau Rôle
                  </button>
                </div>

                <!-- Tableau rôles -->
                <table mat-table [dataSource]="rolesDataSource" matSort class="roles-table">
                  <!-- Nom -->
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Nom du rôle</th>
                    <td mat-cell *matCellDef="let role">{{ role.name }}</td>
                  </ng-container>
                  
                  <!-- Description -->
                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef>Description</th>
                    <td mat-cell *matCellDef="let role">{{ role.description }}</td>
                  </ng-container>
                  
                  <!-- Permissions -->
                  <ng-container matColumnDef="permissions">
                    <th mat-header-cell *matHeaderCellDef>Permissions</th>
                    <td mat-cell *matCellDef="let role">
                      <div class="permissions-list">
                        <mat-chip *ngFor="let permission of role.permissions.slice(0, 3)" class="permission-chip">
                          {{ permission }}
                        </mat-chip>
                        <span *ngIf="role.permissions.length > 3" class="more-permissions">
                          +{{ role.permissions.length - 3 }} autres
                        </span>
                      </div>
                    </td>
                  </ng-container>
                  
                  <!-- Utilisateurs -->
                  <ng-container matColumnDef="usersCount">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Utilisateurs</th>
                    <td mat-cell *matCellDef="let role">{{ role.usersCount }}</td>
                  </ng-container>
                  
                  <!-- Date création -->
                  <ng-container matColumnDef="createdAt">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Créé le</th>
                    <td mat-cell *matCellDef="let role">{{ role.createdAt | date:'dd/MM/yyyy' }}</td>
                  </ng-container>
                  
                  <!-- Actions -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let role">
                      <button mat-icon-button [matMenuTriggerFor]="roleMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #roleMenu="matMenu">
                        <button mat-menu-item (click)="viewRole(role)">
                          <mat-icon>visibility</mat-icon>
                          <span>Voir détails</span>
                        </button>
                        <button mat-menu-item (click)="editRole(role)">
                          <mat-icon>edit</mat-icon>
                          <span>Modifier</span>
                        </button>
                        <button mat-menu-item (click)="managePermissions(role)">
                          <mat-icon>security</mat-icon>
                          <span>Gérer permissions</span>
                        </button>
                        <button mat-menu-item (click)="deleteRole(role)" class="delete-action">
                          <mat-icon>delete</mat-icon>
                          <span>Supprimer</span>
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>
                  
                  <tr mat-header-row *matHeaderRowDef="rolesDisplayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: rolesDisplayedColumns;"></tr>
                </table>
                
                <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
              </div>
            </mat-tab>
            
            <!-- Onglet Journal d'audit -->
            <mat-tab label="Journal d'audit">
              <div class="tab-content">
                <!-- Filtres -->
                <div class="filters-section">
                  <div class="filter-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Utilisateur</mat-label>
                      <mat-select [(ngModel)]="selectedAuditUser">
                        <mat-option value="all">Tous les utilisateurs</mat-option>
                        <mat-option *ngFor="let user of users" [value]="user.name">
                          {{ user.name }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Type d'action</mat-label>
                      <mat-select [(ngModel)]="selectedActionType">
                        <mat-option value="all">Toutes les actions</mat-option>
                        <mat-option value="login">Connexion</mat-option>
                        <mat-option value="create">Création</mat-option>
                        <mat-option value="update">Modification</mat-option>
                        <mat-option value="delete">Suppression</mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Statut</mat-label>
                      <mat-select [(ngModel)]="selectedAuditStatus">
                        <mat-option value="all">Tous les statuts</mat-option>
                        <mat-option value="success">Succès</mat-option>
                        <mat-option value="failure">Échec</mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Date début</mat-label>
                      <input matInput [matDatepicker]="startDatePicker" [(ngModel)]="startDate">
                      <mat-datepicker-toggle matSuffix [for]="startDatePicker"></mat-datepicker-toggle>
                      <mat-datepicker #startDatePicker></mat-datepicker>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Date fin</mat-label>
                      <input matInput [matDatepicker]="endDatePicker" [(ngModel)]="endDate">
                      <mat-datepicker-toggle matSuffix [for]="endDatePicker"></mat-datepicker-toggle>
                      <mat-datepicker #endDatePicker></mat-datepicker>
                    </mat-form-field>
                  </div>
                </div>

                <!-- Actions -->
                <div class="actions-section">
                  <button mat-raised-button (click)="exportAuditLogs()">
                    <mat-icon>download</mat-icon>
                    Exporter Logs
                  </button>
                  <button mat-raised-button (click)="clearOldLogs()">
                    <mat-icon>clear_all</mat-icon>
                    Nettoyer anciens logs
                  </button>
                </div>

                <!-- Tableau audit -->
                <table mat-table [dataSource]="auditDataSource" matSort class="audit-table">
                  <!-- Utilisateur -->
                  <ng-container matColumnDef="user">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Utilisateur</th>
                    <td mat-cell *matCellDef="let log">{{ log.user }}</td>
                  </ng-container>
                  
                  <!-- Action -->
                  <ng-container matColumnDef="action">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Action</th>
                    <td mat-cell *matCellDef="let log">{{ log.action }}</td>
                  </ng-container>
                  
                  <!-- Détails -->
                  <ng-container matColumnDef="details">
                    <th mat-header-cell *matHeaderCellDef>Détails</th>
                    <td mat-cell *matCellDef="let log">{{ log.details }}</td>
                  </ng-container>
                  
                  <!-- Date/Heure -->
                  <ng-container matColumnDef="timestamp">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Date/Heure</th>
                    <td mat-cell *matCellDef="let log">{{ log.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                  </ng-container>
                  
                  <!-- Adresse IP -->
                  <ng-container matColumnDef="ipAddress">
                    <th mat-header-cell *matHeaderCellDef>Adresse IP</th>
                    <td mat-cell *matCellDef="let log">{{ log.ipAddress }}</td>
                  </ng-container>
                  
                  <!-- Statut -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
                    <td mat-cell *matCellDef="let log">
                      <mat-chip [ngClass]="getAuditStatusColor(log.status)">
                        {{ getAuditStatusLabel(log.status) }}
                      </mat-chip>
                    </td>
                  </ng-container>
                  
                  <tr mat-header-row *matHeaderRowDef="auditDisplayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: auditDisplayedColumns;"></tr>
                </table>
                
                <mat-paginator [pageSizeOptions]="[25, 50, 100, 200]" showFirstLastButtons></mat-paginator>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .users-management-section {
      padding: 24px;
    }

    .main-card {
      margin-bottom: 24px;
    }

    .tab-content {
      padding: 16px 0;
    }

    .filters-section {
      margin-bottom: 24px;
      padding: 16px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .filter-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      align-items: end;
    }

    .actions-section {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .users-table,
    .roles-table,
    .audit-table {
      width: 100%;
      margin-bottom: 16px;
    }

    .users-table th,
    .roles-table th,
    .audit-table th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: #333;
    }

    .users-table td,
    .roles-table td,
    .audit-table td {
      padding: 12px 8px;
    }

    mat-chip {
      font-size: 12px;
      font-weight: 500;
    }

    .status-active {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-pending {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-inactive {
      background-color: #f5f5f5;
      color: #666;
    }

    .status-success {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-failure {
      background-color: #ffebee;
      color: #c62828;
    }

    .permissions-list {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
    }

    .permission-chip {
      font-size: 10px;
      height: 20px;
    }

    .more-permissions {
      font-size: 11px;
      color: #666;
      font-style: italic;
    }

    .delete-action {
      color: #f44336;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }

    .loading-container mat-spinner {
      margin-bottom: 16px;
    }

    .loading-container p {
      color: #666;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .filter-row {
        grid-template-columns: 1fr;
      }

      .actions-section {
        flex-direction: column;
      }
    }
  `]
})
export class UsersManagementSectionComponent implements OnInit {
  // Filtres utilisateurs
  selectedRole = 'all';
  selectedStatus = 'all';
  searchTerm = '';

  // Filtres audit
  selectedAuditUser = 'all';
  selectedActionType = 'all';
  selectedAuditStatus = 'all';
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Données réelles
  users: User[] = [];
  loading = false;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.users = response.data;
        this.usersDataSource.data = this.users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.snackBar.open('Erreur lors du chargement des utilisateurs', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  roles: Role[] = [
    {
      id: '1',
      name: 'Administrateur',
      description: 'Accès complet au système',
      permissions: ['users.read', 'users.write', 'users.delete', 'roles.manage', 'system.admin'],
      usersCount: 2,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Commercial',
      description: 'Gestion des conventions et factures',
      permissions: ['conventions.read', 'conventions.write', 'invoices.read', 'invoices.write'],
      usersCount: 8,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '3',
      name: 'Chef de Projet',
      description: 'Gestion des projets et équipes',
      permissions: ['projects.read', 'projects.write', 'teams.manage', 'reports.read'],
      usersCount: 5,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '4',
      name: 'Décideur',
      description: 'Accès en lecture seule aux rapports',
      permissions: ['reports.read', 'analytics.read'],
      usersCount: 3,
      createdAt: new Date('2024-01-01')
    }
  ];

  auditLogs: AuditLog[] = [
    {
      id: '1',
      user: 'Ahmed Ben Ali',
      action: 'Connexion',
      details: 'Connexion réussie',
      timestamp: new Date('2024-03-15T10:30:00'),
      ipAddress: '192.168.1.100',
      status: 'success',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: '2',
      user: 'Fatma Mansouri',
      action: 'Création convention',
      details: 'Nouvelle convention CONV-2024-003 créée',
      timestamp: new Date('2024-03-15T09:15:00'),
      ipAddress: '192.168.1.101',
      status: 'success'
    },
    {
      id: '3',
      user: 'Mohamed Karray',
      action: 'Modification utilisateur',
      details: 'Profil utilisateur ID:5 modifié',
      timestamp: new Date('2024-03-14T16:45:00'),
      ipAddress: '192.168.1.102',
      status: 'success'
    },
    {
      id: '4',
      user: 'Utilisateur inconnu',
      action: 'Tentative de connexion',
      details: 'Échec de connexion - identifiants invalides',
      timestamp: new Date('2024-03-14T14:20:00'),
      ipAddress: '192.168.1.103',
      status: 'failure'
    }
  ];

  usersDataSource = new MatTableDataSource<User>([]);
  rolesDataSource = new MatTableDataSource<Role>([]);
  auditDataSource = new MatTableDataSource<AuditLog>([]);

  usersDisplayedColumns = ['name', 'email', 'role', 'status', 'createdAt', 'lastLogin', 'actions'];
  rolesDisplayedColumns = ['name', 'description', 'permissions', 'usersCount', 'createdAt', 'actions'];
  auditDisplayedColumns = ['user', 'action', 'details', 'timestamp', 'ipAddress', 'status'];

  onTabChange(event: any) {
    console.log('Onglet sélectionné:', event.index);
  }

  // Méthodes utilisateurs
  addUser() {
    console.log('Ajouter un nouvel utilisateur');
    this.snackBar.open('Fonctionnalité d\'ajout d\'utilisateur', 'Fermer', { duration: 2000 });
  }

  viewUser(user: User) {
    console.log('Voir utilisateur:', user);
  }

  editUser(user: User) {
    console.log('Modifier utilisateur:', user);
  }

  resetPassword(user: User) {
    console.log('Réinitialiser mot de passe pour:', user);
    this.snackBar.open(`Mot de passe réinitialisé pour ${user.name}`, 'Fermer', { duration: 2000 });
  }

  toggleUserStatus(user: User) {
    const newStatus = user.status === 'online' ? 'offline' : 'online';
    const updateData: Partial<User> = { status: newStatus as 'online' | 'offline' };
    
    this.userService.updateUser(user._id || user.id || '', updateData).subscribe({
      next: () => {
        this.snackBar.open(`Statut de ${user.name} changé avec succès`, 'Fermer', { duration: 3000 });
        this.loadUsers(); // Recharger la liste
      },
      error: (error) => {
        console.error('Erreur lors du changement de statut:', error);
        this.snackBar.open('Erreur lors du changement de statut', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteUser(user: User) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.name} ?`)) {
      this.userService.deleteUser(user._id || user.id || '').subscribe({
        next: () => {
          this.snackBar.open('Utilisateur supprimé avec succès', 'Fermer', { duration: 3000 });
          this.loadUsers(); // Recharger la liste
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression de l\'utilisateur', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  exportUsers() {
    console.log('Exporter la liste des utilisateurs');
    this.snackBar.open('Export des utilisateurs en cours...', 'Fermer', { duration: 2000 });
  }

  // Méthodes rôles
  addRole() {
    console.log('Ajouter un nouveau rôle');
    this.snackBar.open('Fonctionnalité d\'ajout de rôle', 'Fermer', { duration: 2000 });
  }

  viewRole(role: Role) {
    console.log('Voir rôle:', role);
  }

  editRole(role: Role) {
    console.log('Modifier rôle:', role);
  }

  managePermissions(role: Role) {
    console.log('Gérer permissions pour rôle:', role);
  }

  deleteRole(role: Role) {
    console.log('Supprimer rôle:', role);
    this.snackBar.open(`Rôle ${role.name} supprimé`, 'Fermer', { duration: 2000 });
  }

  // Méthodes audit
  exportAuditLogs() {
    console.log('Exporter les logs d\'audit');
    this.snackBar.open('Export des logs d\'audit en cours...', 'Fermer', { duration: 2000 });
  }

  clearOldLogs() {
    console.log('Nettoyer les anciens logs');
    this.snackBar.open('Nettoyage des anciens logs en cours...', 'Fermer', { duration: 2000 });
  }

  // Méthodes utilitaires
  getUserStatusColor(status: UserStatus): string {
    switch (status) {
      case UserStatus.ACTIVE: return 'status-active';
      case UserStatus.PENDING: return 'status-pending';
      case UserStatus.INACTIVE: return 'status-inactive';
      case UserStatus.SUSPENDED: return 'status-inactive';
      default: return 'status-inactive';
    }
  }

  getUserStatusLabel(status: UserStatus): string {
    switch (status) {
      case UserStatus.ACTIVE: return 'Actif';
      case UserStatus.PENDING: return 'En attente';
      case UserStatus.INACTIVE: return 'Inactif';
      case UserStatus.SUSPENDED: return 'Suspendu';
      default: return 'Inconnu';
    }
  }

  getAuditStatusColor(status: string): string {
    switch (status) {
      case 'success': return 'status-success';
      case 'failure': return 'status-failure';
      default: return 'status-inactive';
    }
  }

  getAuditStatusLabel(status: string): string {
    switch (status) {
      case 'success': return 'Succès';
      case 'failure': return 'Échec';
      default: return 'Inconnu';
    }
  }
}




















