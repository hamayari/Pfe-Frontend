import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User, UserFilters, UserListResponse, UserRole, UserStatus } from '../models/user.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/admin/dashboard/users`; // Pour GET et DELETE
  private crudApiUrl = `${environment.apiUrl}/admin/dashboard/users`; // Utiliser le même endpoint qui fonctionne

  constructor(private http: HttpClient) {}

  /**
   * Get all users with pagination and filtering
   */
  getUsers(filters?: UserFilters): Observable<UserListResponse> {
    const params = this.createQueryParams(filters);
    return this.http.get<User[]>(this.apiUrl, { params }).pipe(
      map((users: User[]) => {
        // Traiter les utilisateurs pour gérer les avatars manquants
        const processedUsers = users.map(user => ({
          ...user,
          avatar: user.avatar || this.getDefaultAvatar(user.name || user.username)
        }));
        
        return {
          data: processedUsers,
          total: processedUsers.length,
          page: 1,
          pageSize: processedUsers.length,
          totalPages: 1
        };
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get a single user by ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create a new user
   */
  createUser(userData: Partial<User>): Observable<User> {
    // Utiliser l'endpoint /api/users pour la création
    return this.http.post<User>(this.crudApiUrl, userData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing user
   */
  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.crudApiUrl}/${id}`, userData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing user with simple data format
   */
  updateUserSimple(id: string, userData: any): Observable<User> {
    return this.http.put<User>(`${this.crudApiUrl}/${id}/simple`, userData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete a user
   */
  deleteUser(id: string): Observable<boolean> {
    // Utiliser l'endpoint /admin/dashboard/users/{id} pour DELETE car il fonctionne
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(this.handleError)
    );
  }

  /**
   * Get available user roles
   */
  getRoles(): Observable<{value: string, label: string}[]> {
    return this.http.get<{value: string, label: string}[]>(`${this.apiUrl}/roles`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get available user statuses
   */
  getStatuses(): Observable<{value: string, label: string}[]> {
    return this.http.get<{value: string, label: string}[]>(`${this.apiUrl}/statuses`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Helper to create query parameters from filters
   */
  private createQueryParams(filters?: UserFilters): HttpParams {
    let params = new HttpParams();
    
    if (!filters) return params;
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    
    return params;
  }

  /**
   * Get default avatar for user
   */
  private getDefaultAvatar(name: string | null): string {
    // Vérifier que name n'est pas null ou undefined
    if (!name) {
      name = 'User';
    }
    
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

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
