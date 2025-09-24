import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  type: string;
  id: string;
  username: string;
  email: string;
  roles: string[];
  forcePasswordChange: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {
    let storedUser = null;
    try {
      const storedUserString = localStorage.getItem('currentUser');
      if (storedUserString && storedUserString !== 'undefined' && storedUserString !== 'null') {
        storedUser = JSON.parse(storedUserString);
      }
    } catch (error) {
      console.error('Erreur lors du parsing du currentUser:', error);
      localStorage.removeItem('currentUser'); // Nettoyer le localStorage corrompu
    }
    
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/signin`, { username, password })
      .pipe(map(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('refreshToken', response.refreshToken);
          
          // Créer l'objet user à partir de la réponse
          const user: User = {
            id: response.id,
            username: response.username,
            email: response.email,
            roles: response.roles
          };
          
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        return response;
      }));
  }

  logout(): Observable<any> {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = this.currentUserValue;
    return !!(token && user);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRoles(): string[] {
    const user = this.currentUserValue;
    return user ? user.roles : [];
  }

  hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.some(role => userRoles.includes(role));
  }

  // Test methods for development
  testLogin(role: string): void {
    const mockUser: User = {
      id: '1',
      username: 'test-user',
      email: 'test@example.com',
      roles: [role]
    };
    
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    this.currentUserSubject.next(mockUser);
  }

  testDashboardAccess(role: string): boolean {
    return this.hasRole(role);
  }

  // Additional methods for compatibility
  getCurrentUser(): User | null {
    return this.currentUserValue;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  get currentUser$(): Observable<User | null> {
    return this.currentUser;
  }

  updateUserProfileImage(profileImage: string): Observable<any> {
    const currentUser = this.currentUserValue;
    if (currentUser) {
      const updatedUser = { ...currentUser, profileImage };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    }
    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  // Méthode pour obtenir la route du dashboard selon le rôle
  getDashboardRouteByRole(): string {
    const roles = this.getUserRoles();
    
    if (roles.includes('ROLE_SUPER_ADMIN') || roles.includes('ROLE_ADMIN') || roles.includes('ADMIN')) {
      return '/admin';
    } else if (roles.includes('ROLE_COMMERCIAL') || roles.includes('COMMERCIAL')) {
      return '/commercial-dashboard';
    } else if (roles.includes('ROLE_PROJECT_MANAGER') || roles.includes('PROJECT_MANAGER')) {
      return '/project-manager-dashboard';
    } else if (roles.includes('ROLE_DECISION_MAKER') || roles.includes('DECISION_MAKER')) {
      return '/decision-maker-dashboard';
    }
    
    // Route par défaut
    return '/dashboard';
  }

  // Méthode pour forcer la reconnexion avec superadmin
  forceReconnect(): Observable<LoginResponse> {
    console.log('🔄 Forçage de la reconnexion avec superadmin...');
    return this.login('superadmin', 'admin123');
  }
}