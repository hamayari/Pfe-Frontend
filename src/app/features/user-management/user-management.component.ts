import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';

import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLogin?: Date;
  createdAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatSnackBarModule,
    MatMenuModule,
    MatTabsModule
  ],
  template: `
    <div class="user-management-container">
      <mat-card class="management-header">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>people</mat-icon>
            Gestion des Utilisateurs
          </mat-card-title>
          <mat-card-subtitle>
            Gérez les utilisateurs et rôles du système
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="addUser()">
            <mat-icon>person_add</mat-icon>
            Nouvel Utilisateur
          </button>
        </mat-card-actions>
      </mat-card>

      <mat-tab-group>
        <mat-tab label="Utilisateurs">
          <mat-card>
            <mat-card-content>
              <div class="filters">
                <mat-form-field appearance="outline">
                  <mat-label>Rechercher</mat-label>
                  <input matInput [(ngModel)]="searchTerm" placeholder="Nom, email...">
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Rôle</mat-label>
                  <mat-select [(ngModel)]="roleFilter">
                    <mat-option value="">Tous</mat-option>
                    <mat-option *ngFor="let role of roles" [value]="role.name">
                      {{ role.name }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <table mat-table [dataSource]="filteredUsers">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Nom</th>
                  <td mat-cell *matCellDef="let user">{{ user.firstName }} {{ user.lastName }}</td>
                </ng-container>

                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef>Email</th>
                  <td mat-cell *matCellDef="let user">{{ user.email }}</td>
                </ng-container>

                <ng-container matColumnDef="role">
                  <th mat-header-cell *matHeaderCellDef>Rôle</th>
                  <td mat-cell *matCellDef="let user">
                    <mat-chip [color]="getRoleColor(user.role)" selected>
                      {{ user.role }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Statut</th>
                  <td mat-cell *matCellDef="let user">
                    <mat-chip [color]="getStatusColor(user.status)" selected>
                      {{ getStatusLabel(user.status) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let user">
                    <button mat-icon-button [matMenuTriggerFor]="menu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="editUser(user)">
                        <mat-icon>edit</mat-icon>
                        Modifier
                      </button>
                      <button mat-menu-item (click)="toggleStatus(user)">
                        <mat-icon>{{ user.status === 'ACTIVE' ? 'block' : 'check_circle' }}</mat-icon>
                        {{ user.status === 'ACTIVE' ? 'Désactiver' : 'Activer' }}
                      </button>
                      <button mat-menu-item (click)="deleteUser(user)">
                        <mat-icon>delete</mat-icon>
                        Supprimer
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <mat-tab label="Rôles">
          <mat-card>
            <mat-card-content>
              <div class="roles-grid">
                <mat-card *ngFor="let role of roles" class="role-card">
                  <mat-card-header>
                    <mat-card-title>{{ role.name }}</mat-card-title>
                    <mat-card-subtitle>{{ role.description }}</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="permissions">
                      <h4>Permissions:</h4>
                      <div class="permission-chips">
                        <mat-chip *ngFor="let permission of role.permissions" color="primary" selected>
                          {{ permission }}
                        </mat-chip>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .user-management-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .management-header {
      margin-bottom: 20px;
    }

    .management-header mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .roles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .role-card {
      border: 1px solid #e0e0e0;
    }

    .permissions h4 {
      margin-bottom: 8px;
      color: #333;
    }

    .permission-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .user-management-container {
        padding: 10px;
      }

      .filters {
        grid-template-columns: 1fr;
      }

      .roles-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  roles: Role[] = [];
  searchTerm: string = '';
  roleFilter: string = '';
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'actions'];

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    // Mock data
    this.users = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: new Date()
      },
      {
        id: '2',
        username: 'manager',
        email: 'manager@example.com',
        firstName: 'Manager',
        lastName: 'User',
        role: 'MANAGER',
        status: 'ACTIVE',
        createdAt: new Date()
      }
    ];
    this.filteredUsers = [...this.users];
  }

  loadRoles(): void {
    this.roles = [
      {
        id: '1',
        name: 'ADMIN',
        description: 'Administrateur système',
        permissions: ['ALL']
      },
      {
        id: '2',
        name: 'MANAGER',
        description: 'Gestionnaire',
        permissions: ['READ', 'WRITE']
      },
      {
        id: '3',
        name: 'USER',
        description: 'Utilisateur standard',
        permissions: ['READ']
      }
    ];
  }

  addUser(): void {
    this.snackBar.open('Ajouter un nouvel utilisateur', 'Fermer', { duration: 3000 });
  }

  editUser(user: User): void {
    this.snackBar.open(`Modifier utilisateur: ${user.username}`, 'Fermer', { duration: 3000 });
  }

  toggleStatus(user: User): void {
    user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.snackBar.open(`Statut modifié: ${user.username}`, 'Fermer', { duration: 3000 });
  }

  deleteUser(user: User): void {
    this.users = this.users.filter(u => u.id !== user.id);
    this.filteredUsers = [...this.users];
    this.snackBar.open(`Utilisateur supprimé: ${user.username}`, 'Fermer', { duration: 3000 });
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN': return 'warn';
      case 'MANAGER': return 'accent';
      default: return 'primary';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'primary';
      case 'INACTIVE': return '';
      case 'SUSPENDED': return 'warn';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Actif';
      case 'INACTIVE': return 'Inactif';
      case 'SUSPENDED': return 'Suspendu';
      default: return status;
    }
  }
}
