import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
  UserListResponse,
  UserFilters,
  UserStats,
  UserRole,
  UserStatus,
  USER_ROLES,
  USER_STATUSES
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/admin/dashboard/users`;
  private usersSubject = new BehaviorSubject<User[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private statsSubject = new BehaviorSubject<UserStats | null>(null);

  public users$ = this.usersSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Récupérer tous les utilisateurs avec filtres
  getUsers(filters: UserFilters = {}): Observable<UserListResponse> {
    // Éviter les appels multiples si déjà en cours de chargement
    if (this.loadingSubject.value) {
      return new Observable(observer => {
        observer.next({
          success: true,
          message: 'Chargement en cours',
          data: {
            users: this.usersSubject.value,
            total: this.usersSubject.value.length,
            page: 1,
            size: 10,
            totalPages: 1
          }
        });
        observer.complete();
      });
    }
    
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.role) {
      params = params.set('role', filters.role);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.size) {
      params = params.set('size', filters.size.toString());
    }
    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }
    if (filters.sortOrder) {
      params = params.set('sortOrder', filters.sortOrder);
    }

    return this.http.get<UserListResponse>(this.apiUrl, { params }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.usersSubject.next(response.data.users);
        }
        this.loadingSubject.next(false);
      })
    );
  }

  // Récupérer un utilisateur par ID
  getUserById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  // Créer un nouvel utilisateur
  createUser(userData: CreateUserRequest): Observable<UserResponse> {
    this.loadingSubject.next(true);
    
    return this.http.post<UserResponse>(this.apiUrl, userData).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentUsers = this.usersSubject.value;
          this.usersSubject.next([...currentUsers, response.data!]);
        }
        this.loadingSubject.next(false);
      })
    );
  }

  // Mettre à jour un utilisateur
  updateUser(id: string, userData: UpdateUserRequest): Observable<UserResponse> {
    this.loadingSubject.next(true);
    
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, userData).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentUsers = this.usersSubject.value;
          const updatedUsers = currentUsers.map(user => 
            user.id === id ? response.data! : user
          );
          this.usersSubject.next(updatedUsers);
        }
        this.loadingSubject.next(false);
      })
    );
  }

  // Supprimer un utilisateur
  deleteUser(id: string): Observable<UserResponse> {
    this.loadingSubject.next(true);
    
    return this.http.delete<UserResponse>(`${this.apiUrl}/${id}`).pipe(
      tap(response => {
        if (response.success) {
          const currentUsers = this.usersSubject.value;
          const filteredUsers = currentUsers.filter(user => user.id !== id);
          this.usersSubject.next(filteredUsers);
        }
        this.loadingSubject.next(false);
      })
    );
  }

  // Activer/Désactiver un utilisateur
  toggleUserStatus(id: string, enabled: boolean): Observable<UserResponse> {
    return this.updateUser(id, { id, enabled });
  }

  // Changer le statut d'un utilisateur
  changeUserStatus(id: string, status: UserStatus): Observable<UserResponse> {
    return this.updateUser(id, { id, status });
  }

  // Réinitialiser le mot de passe d'un utilisateur
  resetPassword(id: string, newPassword: string): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/${id}/reset-password`, {
      newPassword
    });
  }

  // Récupérer les statistiques des utilisateurs
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/stats`).pipe(
      tap(stats => this.statsSubject.next(stats))
    );
  }

  // Exporter les utilisateurs
  exportUsers(format: 'excel' | 'pdf' | 'csv', filters?: UserFilters): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.role) params = params.set('role', filters.role);
      if (filters.status) params = params.set('status', filters.status);
    }

    return this.http.get(`${this.apiUrl}/export`, { 
      params, 
      responseType: 'blob' 
    });
  }

  // Importer des utilisateurs
  importUsers(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.apiUrl}/import`, formData);
  }

  // Vérifier si un nom d'utilisateur existe
  checkUsernameExists(username: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-username`, {
      params: { username }
    });
  }

  // Vérifier si un email existe
  checkEmailExists(email: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-email`, {
      params: { email }
    });
  }

  // Récupérer les rôles disponibles
  getAvailableRoles(): Observable<UserRole[]> {
    return this.http.get<UserRole[]>(`${this.apiUrl}/roles`);
  }

  // Récupérer les statuts disponibles
  getAvailableStatuses(): Observable<UserStatus[]> {
    return this.http.get<UserStatus[]>(`${this.apiUrl}/statuses`);
  }

  // Méthodes utilitaires pour les filtres
  getRoleOptions() {
    return Object.entries(USER_ROLES).map(([code, role]) => ({
      value: code as UserRole,
      label: role.name,
      description: role.description,
      color: role.color
    }));
  }

  getStatusOptions() {
    return Object.entries(USER_STATUSES).map(([code, status]) => ({
      value: code as UserStatus,
      label: status.name,
      description: status.description,
      color: status.color
    }));
  }

  // Méthodes pour la gestion du cache local
  refreshUsers(): void {
    this.getUsers().subscribe();
  }

  clearCache(): void {
    this.usersSubject.next([]);
    this.statsSubject.next(null);
  }

  // Méthodes pour la gestion des erreurs
  handleError(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Une erreur inattendue s\'est produite';
  }

  // Méthodes pour la validation
  validateUserData(userData: CreateUserRequest): string[] {
    const errors: string[] = [];

    if (!userData.username || userData.username.trim().length < 3) {
      errors.push('Le nom d\'utilisateur doit contenir au moins 3 caractères');
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('L\'adresse email n\'est pas valide');
    }

    if (!userData.password || userData.password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    if (!userData.roles || userData.roles.length === 0) {
      errors.push('Au moins un rôle doit être sélectionné');
    }

    return errors;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Méthodes pour la pagination
  getPaginatedUsers(page: number = 0, size: number = 10, filters?: UserFilters): Observable<UserListResponse> {
    const paginatedFilters: UserFilters = {
      ...filters,
      page,
      size
    };
    return this.getUsers(paginatedFilters);
  }

  // Méthodes pour le tri
  getSortedUsers(sortBy: string, sortOrder: 'asc' | 'desc', filters?: UserFilters): Observable<UserListResponse> {
    const sortedFilters: UserFilters = {
      ...filters,
      sortBy,
      sortOrder
    };
    return this.getUsers(sortedFilters);
  }

  // Méthodes pour la recherche
  searchUsers(searchTerm: string, filters?: UserFilters): Observable<UserListResponse> {
    const searchFilters: UserFilters = {
      ...filters,
      search: searchTerm
    };
    return this.getUsers(searchFilters);
  }

  // Méthodes pour les filtres par rôle
  filterUsersByRole(role: UserRole, filters?: UserFilters): Observable<UserListResponse> {
    const roleFilters: UserFilters = {
      ...filters,
      role
    };
    return this.getUsers(roleFilters);
  }

  // Méthodes pour les filtres par statut
  filterUsersByStatus(status: UserStatus, filters?: UserFilters): Observable<UserListResponse> {
    const statusFilters: UserFilters = {
      ...filters,
      status
    };
    return this.getUsers(statusFilters);
  }
}
