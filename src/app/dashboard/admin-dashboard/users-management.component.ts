import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../features/users/services/user.service';
import { User, UserRole, UserStatus } from '../../features/users/models/user.model';

// Interface locale pour l'affichage (compatible avec le template existant)
interface UserDisplay {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  governorate: string;
  phone?: string;
  department?: string;
  createdAt: Date;
  lastLogin: Date;
  enabled: boolean;
  roles: string[];
  avatar?: string;
}

interface UserFilter {
  role: string;
  status: string;
  governorate: string;
  searchTerm: string;
  dateRange: string;
}

@Component({
  selector: 'app-users-management',
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.scss'],
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
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    MatBadgeModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatProgressSpinnerModule
  ]
})
export class UsersManagementComponent implements OnInit, AfterViewInit {
  @ViewChild('usersPaginator') usersPaginator!: MatPaginator;
  @ViewChild('usersSort') usersSort!: MatSort;

  // Données
  users: UserDisplay[] = [];
  filteredUsers: UserDisplay[] = [];
  usersDataSource = new MatTableDataSource<UserDisplay>([]);

  // Colonnes du tableau
  displayedColumns = [
    'avatar',
    'name', 
    'email', 
    'role', 
    'status', 
    'governorate', 
    'department',
    'createdAt', 
    'lastLogin', 
    'enabled',
    'actions'
  ];

  // Filtres
  filters: UserFilter = {
    role: 'all',
    status: 'all',
    governorate: 'all',
    searchTerm: '',
    dateRange: 'all'
  };

  // Pagination
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];

  // Statistiques
  stats = {
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    byRole: {} as { [key: string]: number },
    byGovernorate: {} as { [key: string]: number }
  };

  // États
  isLoading = false;
  showAdvancedFilters = false;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadRealData();
  }

  ngAfterViewInit(): void {
    this.usersDataSource.paginator = this.usersPaginator;
    this.usersDataSource.sort = this.usersSort;
  }

  // Chargement des vraies données depuis l'API
  loadRealData(): void {
    this.isLoading = true;
    
    this.userService.getUsers().subscribe({
      next: (response) => {
        // Convertir les données de l'API vers le format d'affichage
        this.users = response.data.map(user => this.convertToDisplayFormat(user));
        this.filteredUsers = [...this.users];
        this.usersDataSource.data = this.filteredUsers;
        this.calculateStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.snackBar.open('Erreur lors du chargement des utilisateurs', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  // Convertir les données de l'API vers le format d'affichage
  private convertToDisplayFormat(user: User): UserDisplay {
    return {
      id: user._id || user.id || '',
      name: user.name,
      email: user.email,
      role: this.getRoleDisplayNameFromArray(user.roles),
      status: this.convertStatusFromDB(user.status, user.enabled, user.isActive),
      governorate: 'Tunis', // Par défaut, à adapter selon vos données
      phone: '', // Not available in DB data
      department: this.getDepartmentFromRoleArray(user.roles),
      createdAt: new Date(user.createdAt),
      lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt) : new Date(),
      enabled: user.enabled,
      roles: user.roles,
      avatar: user.avatar
    };
  }

  // Convertir le statut de l'API vers le format d'affichage
  private convertStatus(status: UserStatus): 'active' | 'pending' | 'inactive' {
    switch (status) {
      case UserStatus.ACTIVE: return 'active';
      case UserStatus.PENDING: return 'pending';
      case UserStatus.INACTIVE:
      case UserStatus.SUSPENDED: return 'inactive';
      default: return 'inactive';
    }
  }

  // Obtenir le nom d'affichage du rôle
  private getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN: return 'Administrateur';
      case UserRole.COMMERCIAL: return 'Commercial';
      case UserRole.PROJECT_MANAGER: return 'Chef de Projet';
      case UserRole.DECISION_MAKER: return 'Décideur';
      case UserRole.USER: return 'Utilisateur';
      default: return role;
    }
  }

  // Obtenir le département basé sur le rôle
  private getDepartmentFromRole(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN: return 'IT';
      case UserRole.COMMERCIAL: return 'Ventes';
      case UserRole.PROJECT_MANAGER: return 'Gestion de Projet';
      case UserRole.DECISION_MAKER: return 'Direction';
      case UserRole.USER: return 'Général';
      default: return 'Général';
    }
  }

  // Convertir le statut de la base de données vers le format d'affichage
  private convertStatusFromDB(status: string, enabled: boolean, isActive: boolean): 'active' | 'pending' | 'inactive' {
    if (!enabled || !isActive) {
      return 'inactive';
    }
    if (status === 'offline') {
      return 'pending';
    }
    return 'active';
  }

  // Obtenir le nom d'affichage du rôle depuis un tableau de rôles
  private getRoleDisplayNameFromArray(roles: string[]): string {
    if (!roles || roles.length === 0) {
      return 'Utilisateur';
    }
    const role = roles[0]; // Prendre le premier rôle
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Administrateur';
      case 'ADMIN': return 'Administrateur';
      case 'COMMERCIAL': return 'Commercial';
      case 'PROJECT_MANAGER': return 'Chef de Projet';
      case 'DECISION_MAKER': return 'Décideur';
      case 'USER': return 'Utilisateur';
      default: return role;
    }
  }

  // Obtenir le département basé sur un tableau de rôles
  private getDepartmentFromRoleArray(roles: string[]): string {
    if (!roles || roles.length === 0) {
      return 'Général';
    }
    const role = roles[0]; // Prendre le premier rôle
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN': return 'IT';
      case 'COMMERCIAL': return 'Ventes';
      case 'PROJECT_MANAGER': return 'Gestion de Projet';
      case 'DECISION_MAKER': return 'Direction';
      case 'USER': return 'Général';
      default: return 'Général';
    }
  }

  // Calcul des statistiques
  calculateStats(): void {
    this.stats.total = this.users.length;
    this.stats.active = this.users.filter(u => u.status === 'active').length;
    this.stats.pending = this.users.filter(u => u.status === 'pending').length;
    this.stats.inactive = this.users.filter(u => u.status === 'inactive').length;

    // Statistiques par rôle
    this.users.forEach(user => {
      this.stats.byRole[user.role] = (this.stats.byRole[user.role] || 0) + 1;
      this.stats.byGovernorate[user.governorate] = (this.stats.byGovernorate[user.governorate] || 0) + 1;
    });
  }

  // Application des filtres
  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const roleMatch = this.filters.role === 'all' || user.role === this.filters.role;
      const statusMatch = this.filters.status === 'all' || user.status === this.filters.status;
      const governorateMatch = this.filters.governorate === 'all' || user.governorate === this.filters.governorate;
      
      const searchMatch = !this.filters.searchTerm || 
        user.name.toLowerCase().includes(this.filters.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.filters.searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(this.filters.searchTerm.toLowerCase());

      return roleMatch && statusMatch && governorateMatch && searchMatch;
    });

    this.usersDataSource.data = this.filteredUsers;
    this.calculateStats();
  }

  // Recherche en temps réel
  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filters.searchTerm = value;
    this.applyFilters();
  }

  // Changement de filtre
  onFilterChange(): void {
    this.applyFilters();
  }

  // Réinitialisation des filtres
  resetFilters(): void {
    this.filters = {
      role: 'all',
      status: 'all',
      governorate: 'all',
      searchTerm: '',
      dateRange: 'all'
    };
    this.applyFilters();
  }

  // Actions CRUD
  addUser(): void {
    this.snackBar.open('Ajouter un utilisateur', 'Fermer', { duration: 2000 });
    // Ici on ouvrirait un dialog pour créer un utilisateur
  }

  editUser(user: UserDisplay): void {
    this.snackBar.open(`Modifier l'utilisateur: ${user.name}`, 'Fermer', { duration: 2000 });
    // Ici on ouvrirait un dialog pour modifier l'utilisateur
  }

  deleteUser(user: UserDisplay): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.name} ?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open(`Utilisateur ${user.name} supprimé avec succès`, 'Fermer', { duration: 3000 });
          this.loadRealData(); // Recharger les données
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression de l\'utilisateur', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  resetPassword(user: UserDisplay): void {
    this.snackBar.open(`Mot de passe réinitialisé pour ${user.name}`, 'Fermer', { duration: 3000 });
    // Ici on enverrait un email de réinitialisation
  }

  toggleUserStatus(user: UserDisplay): void {
    const newStatus = user.status === 'active' ? 'offline' : 'online';
    const updateData: Partial<User> = { status: newStatus as 'online' | 'offline' };
    
    this.userService.updateUser(user.id, updateData).subscribe({
      next: () => {
        this.snackBar.open(`Statut de ${user.name} changé avec succès`, 'Fermer', { duration: 3000 });
        this.loadRealData(); // Recharger les données
      },
      error: (error) => {
        console.error('Erreur lors du changement de statut:', error);
        this.snackBar.open('Erreur lors du changement de statut', 'Fermer', { duration: 3000 });
      }
    });
  }

  toggleUserEnabled(user: UserDisplay): void {
    const newStatus = user.enabled ? 'offline' : 'online';
    const updateData: Partial<User> = { status: newStatus as 'online' | 'offline' };
    
    this.userService.updateUser(user.id, updateData).subscribe({
      next: () => {
        this.snackBar.open(`${user.name} ${!user.enabled ? 'activé' : 'désactivé'} avec succès`, 'Fermer', { duration: 3000 });
        this.loadRealData(); // Recharger les données
      },
      error: (error) => {
        console.error('Erreur lors du changement de statut:', error);
        this.snackBar.open('Erreur lors du changement de statut', 'Fermer', { duration: 3000 });
      }
    });
  }

  viewUserDetails(user: UserDisplay): void {
    this.snackBar.open(`Détails de ${user.name}`, 'Fermer', { duration: 2000 });
    // Ici on ouvrirait un dialog avec les détails complets
  }

  // Export des données
  exportUsers(format: 'csv' | 'xlsx' | 'pdf'): void {
    this.snackBar.open(`Export ${format.toUpperCase()} des utilisateurs en cours...`, 'Fermer', { duration: 2000 });
    // Ici on exporterait les données filtrées
  }

  // Utilitaires
  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'accent';
      case 'inactive': return 'warn';
      default: return 'primary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active': return 'check_circle';
      case 'pending': return 'pending';
      case 'inactive': return 'cancel';
      default: return 'help';
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'Administrateur': return 'warn';
      case 'Commercial': return 'primary';
      case 'Chef de Projet': return 'accent';
      case 'Décideur': return 'success';
      default: return 'primary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'inactive': return 'Inactif';
      default: return status;
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    return `Il y a ${days} j`;
  }

  // Toggle des filtres avancés
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  // Vérification des permissions (simulation)
  canDeleteUser(user: UserDisplay): boolean {
    // Seuls les admins peuvent supprimer des utilisateurs
    return user.role !== 'Administrateur';
  }

  canEditUser(user: UserDisplay): boolean {
    // Tout le monde peut éditer sauf les utilisateurs inactifs
    return user.status !== 'inactive';
  }
}
