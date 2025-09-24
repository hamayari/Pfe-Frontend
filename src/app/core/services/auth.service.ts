import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, firstValueFrom } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  accessToken: string;
  tokenType: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private readonly AUTH_KEY = 'currentUser';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem(this.AUTH_KEY) || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<User> {
    return this.http.post<any>(`${environment.apiUrl}/auth/signin`, { username, password })
      .pipe(
        map(response => {
          console.log('🔑 Réponse de connexion:', response);
          
          // Adapter la réponse du backend au format attendu
          const user: User = {
            id: response.id || response._id,
            username: response.username,
            email: response.email,
            roles: response.roles || [response.role],
            accessToken: response.accessToken || response.token,
            tokenType: response.tokenType || 'Bearer'
          };
          
          // Stocker le token dans localStorage avec plusieurs clés pour assurer la compatibilité
          localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
          localStorage.setItem('authToken', response.token || response.accessToken);
          localStorage.setItem('auth_token', response.token || response.accessToken);
          localStorage.setItem('jwtToken', response.token || response.accessToken);
          localStorage.setItem('accessToken', response.token || response.accessToken);
          
          console.log('✅ Token stocké dans localStorage:', response.token || response.accessToken);
          console.log('✅ Utilisateur stocké:', user);
          
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          console.error('❌ Erreur de connexion:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    // remove user from local storage to log user out
    localStorage.removeItem(this.AUTH_KEY);
    localStorage.removeItem('authToken');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('accessToken');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  hasRole(role: string): boolean {
    if (!this.currentUserValue) {
      return false;
    }
    return this.currentUserValue.roles.includes(role);
  }

  // Token management
  getToken(): string | null {
    console.log('🔍 Recherche du token dans localStorage...');
    
    // Essayer d'abord le token JWT complet
    const authToken = localStorage.getItem('authToken');
    console.log('🔑 authToken trouvé:', authToken ? 'OUI' : 'NON');
    if (authToken && this.isTokenValid(authToken)) {
      console.log('✅ Utilisation du token authToken');
      return `Bearer ${authToken}`;
    }
    
    // Essayer le token de test
    const authTokenTest = localStorage.getItem('auth_token');
    console.log('🔑 auth_token trouvé:', authTokenTest ? 'OUI' : 'NON');
    if (authTokenTest && this.isTokenValid(authTokenTest)) {
      console.log('✅ Utilisation du token auth_token');
      return `Bearer ${authTokenTest}`;
    }
    
    // Essayer le token JWT complet (autre clé possible)
    const jwtToken = localStorage.getItem('jwtToken');
    console.log('🔑 jwtToken trouvé:', jwtToken ? 'OUI' : 'NON');
    if (jwtToken && this.isTokenValid(jwtToken)) {
      console.log('✅ Utilisation du token jwtToken');
      return `Bearer ${jwtToken}`;
    }
    
    // Essayer le token d'accès
    const accessToken = localStorage.getItem('accessToken');
    console.log('🔑 accessToken trouvé:', accessToken ? 'OUI' : 'NON');
    if (accessToken && this.isTokenValid(accessToken)) {
      console.log('✅ Utilisation du token accessToken');
      return `Bearer ${accessToken}`;
    }
    
    // Fallback sur l'ancien système
    const user = this.currentUserValue;
    if (user && user.accessToken && this.isTokenValid(user.accessToken)) {
      console.log('✅ Utilisation du token depuis currentUser');
      return `${user.tokenType} ${user.accessToken}`;
    }
    
    console.log('❌ Aucun token trouvé - tentative de reconnexion automatique');
    // Si aucun token valide, essayer de se reconnecter automatiquement
    this.autoReconnect();
    return null;
  }


  // Vérifier si le token est valide (pas expiré)
  private isTokenValid(token: string): boolean {
    try {
      // Décoder le JWT pour vérifier l'expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      // Si ce n'est pas un JWT valide, considérer comme invalide
      return false;
    }
  }

  // Méthode pour forcer la reconnexion et obtenir un token valide
  async getValidToken(): Promise<string | null> {
    let token = this.getToken();
    
    if (!token) {
      console.log('🔄 Aucun token trouvé, tentative de reconnexion...');
      try {
        const user = await firstValueFrom(this.login('superadmin', 'admin123'));
        if (user && user.accessToken) {
          token = `Bearer ${user.accessToken}`;
          console.log('✅ Nouveau token obtenu:', token);
        }
      } catch (error) {
        console.error('❌ Échec de la reconnexion:', error);
      }
    }
    
    return token;
  }

  // Reconnexion automatique
  private autoReconnect(): void {
    // Essayer de se reconnecter avec les credentials par défaut
    const defaultCredentials = [
      { username: 'superadmin', password: 'admin123' },
      { username: 'decideur', password: 'admin123' },
      { username: 'commercial', password: 'admin123' }
    ];

    // Essayer avec le premier credential disponible
    const credentials = defaultCredentials[0];
    this.login(credentials.username, credentials.password).subscribe({
      next: (user) => {
        console.log('Reconnexion automatique réussie:', user);
      },
      error: (error) => {
        console.error('Échec de la reconnexion automatique:', error);
      }
    });
  }

  // Refresh token if needed
  refreshToken(): Observable<User> {
    return this.http.post<any>(`${environment.apiUrl}/auth/refreshtoken`, {})
      .pipe(
        map(response => {
          const user: User = {
            id: response.id || response._id,
            username: response.username,
            email: response.email,
            roles: response.roles || [response.role],
            accessToken: response.accessToken || response.token,
            tokenType: response.tokenType || 'Bearer'
          };
          
          localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          this.logout();
          return throwError(() => new Error('Session expired. Please log in again.'));
        })
      );
  }
}
