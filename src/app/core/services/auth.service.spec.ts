import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, User } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter: jasmine.SpyObj<Router>;

  // Mock data
  const mockLoginResponse = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['ROLE_ADMIN'],
    token: 'mock-jwt-token',
    accessToken: 'mock-jwt-token',
    tokenType: 'Bearer'
  };

  const mockUser: User = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['ROLE_ADMIN'],
    accessToken: 'mock-jwt-token',
    tokenType: 'Bearer'
  };

  beforeEach(() => {
    // Créer le mock du Router
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage avant chaque test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie qu'il n'y a pas de requêtes HTTP en attente
    localStorage.clear();
  });

  // ==================== Tests d'initialisation ====================
  
  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with null user when localStorage is empty', () => {
      expect(service.currentUserValue).toBeNull();
    });

    it('should initialize with user from localStorage if available', () => {
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      
      // Recréer le service pour qu'il lise le localStorage
      const newService = new AuthService(TestBed.inject(HttpClientTestingModule) as any, mockRouter);
      
      expect(newService.currentUserValue).toEqual(mockUser);
    });

    it('should expose currentUser as Observable', (done) => {
      service.currentUser.subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });
  });

  // ==================== Tests de login ====================
  
  describe('Login Functionality', () => {
    it('should authenticate user and return user data', (done) => {
      const username = 'testuser';
      const password = 'password123';

      service.login(username, password).subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(user.username).toBe('testuser');
        expect(user.roles).toContain('ROLE_ADMIN');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username, password });
      req.flush(mockLoginResponse);
    });

    it('should store user in localStorage on successful login', (done) => {
      service.login('testuser', 'password123').subscribe(() => {
        const storedUser = localStorage.getItem('currentUser');
        expect(storedUser).toBeTruthy();
        
        const parsedUser = JSON.parse(storedUser!);
        expect(parsedUser.username).toBe('testuser');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(mockLoginResponse);
    });

    it('should store token in multiple localStorage keys for compatibility', (done) => {
      service.login('testuser', 'password123').subscribe(() => {
        expect(localStorage.getItem('authToken')).toBe('mock-jwt-token');
        expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token');
        expect(localStorage.getItem('jwtToken')).toBe('mock-jwt-token');
        expect(localStorage.getItem('accessToken')).toBe('mock-jwt-token');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(mockLoginResponse);
    });

    it('should update currentUserSubject on successful login', (done) => {
      service.login('testuser', 'password123').subscribe(() => {
        expect(service.currentUserValue).toEqual(mockUser);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(mockLoginResponse);
    });

    it('should handle login with alternative response format (using _id)', (done) => {
      const altResponse = {
        _id: '456',
        username: 'testuser',
        email: 'test@example.com',
        role: 'ROLE_USER',
        token: 'alt-token'
      };

      service.login('testuser', 'password123').subscribe(user => {
        expect(user.id).toBe('456');
        expect(user.roles).toContain('ROLE_USER');
        expect(user.accessToken).toBe('alt-token');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(altResponse);
    });

    it('should handle login error', (done) => {
      const errorMessage = 'Invalid credentials';

      service.login('testuser', 'wrongpassword').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(errorMessage, { status: 401, statusText: 'Unauthorized' });
    });
  });

  // ==================== Tests de logout ====================
  
  describe('Logout Functionality', () => {
    beforeEach((done) => {
      // Login d'abord
      service.login('testuser', 'password123').subscribe(() => done());
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(mockLoginResponse);
    });

    it('should clear user from localStorage on logout', () => {
      service.logout();
      
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('jwtToken')).toBeNull();
      expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('should set currentUser to null on logout', () => {
      service.logout();
      
      expect(service.currentUserValue).toBeNull();
    });

    it('should navigate to login page on logout', () => {
      service.logout();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  // ==================== Tests d'authentification ====================
  
  describe('Authentication Status', () => {
    it('should return false when user is not authenticated', () => {
      expect(service.isAuthenticated()).toBeFalsy();
    });

    it('should return true when user is authenticated', (done) => {
      service.login('testuser', 'password123').subscribe(() => {
        expect(service.isAuthenticated()).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(mockLoginResponse);
    });
  });

  // ==================== Tests de gestion des rôles ====================
  
  describe('Role Management', () => {
    beforeEach((done) => {
      service.login('testuser', 'password123').subscribe(() => done());
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(mockLoginResponse);
    });

    it('should return true if user has the specified role', () => {
      expect(service.hasRole('ROLE_ADMIN')).toBeTruthy();
    });

    it('should return false if user does not have the specified role', () => {
      expect(service.hasRole('ROLE_SUPER_ADMIN')).toBeFalsy();
    });

    it('should return false if user is not authenticated', () => {
      service.logout();
      expect(service.hasRole('ROLE_ADMIN')).toBeFalsy();
    });
  });

  // ==================== Tests de gestion des tokens ====================
  
  describe('Token Management', () => {
    it('should return null when no token is available', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return token with Bearer prefix from authToken', (done) => {
      // Créer un token JWT valide (simplifié pour le test)
      const validToken = createMockJWT();
      localStorage.setItem('authToken', validToken);

      service.login('testuser', 'password123').subscribe(() => {
        const token = service.getToken();
        expect(token).toBe(`Bearer ${validToken}`);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush({ ...mockLoginResponse, token: validToken });
    });

    it('should validate JWT token expiration', () => {
      const expiredToken = createMockJWT(-3600); // Expiré il y a 1 heure
      localStorage.setItem('authToken', expiredToken);
      
      expect(service.getToken()).toBeNull();
    });

    it('should try multiple localStorage keys for token', (done) => {
      const validToken = createMockJWT();
      localStorage.setItem('jwtToken', validToken);

      service.login('testuser', 'password123').subscribe(() => {
        const token = service.getToken();
        expect(token).toContain('Bearer');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush({ ...mockLoginResponse, token: validToken });
    });
  });

  // ==================== Tests de refresh token ====================
  
  describe('Token Refresh', () => {
    it('should refresh token and return new user data', (done) => {
      const refreshResponse = {
        ...mockLoginResponse,
        token: 'new-token',
        accessToken: 'new-token'
      };

      service.refreshToken().subscribe(user => {
        expect(user.accessToken).toBe('new-token');
        expect(localStorage.getItem('currentUser')).toContain('new-token');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refreshtoken`);
      expect(req.request.method).toBe('POST');
      req.flush(refreshResponse);
    });

    it('should logout on refresh token error', (done) => {
      service.refreshToken().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('Session expired');
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refreshtoken`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  // ==================== Tests de getValidToken ====================
  
  describe('Get Valid Token', () => {
    it('should return existing valid token', async () => {
      const validToken = createMockJWT();
      localStorage.setItem('authToken', validToken);
      localStorage.setItem('currentUser', JSON.stringify(mockUser));

      const token = await service.getValidToken();
      expect(token).toBe(`Bearer ${validToken}`);
    });

    it('should attempt auto-reconnect if no valid token exists', async () => {
      // Ce test vérifie que la méthode tente de se reconnecter
      const promise = service.getValidToken();
      
      // Attendre la requête HTTP de reconnexion
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(mockLoginResponse);

      const token = await promise;
      expect(token).toContain('Bearer');
    });
  });

  // ==================== Tests edge cases ====================
  
  describe('Edge Cases', () => {
    it('should handle malformed JWT token gracefully', () => {
      localStorage.setItem('authToken', 'invalid-token');
      
      expect(service.getToken()).toBeNull();
    });

    it('should handle empty response from login', (done) => {
      service.login('testuser', 'password123').subscribe({
        next: (user) => {
          // Devrait quand même créer un objet user
          expect(user).toBeDefined();
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush({});
    });

    it('should handle network error during login', (done) => {
      service.login('testuser', 'password123').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.error(new ErrorEvent('Network error'));
    });
  });
});

// ==================== Helper Functions ====================

/**
 * Crée un token JWT mock pour les tests
 * @param expiresInSeconds Nombre de secondes avant expiration (par défaut: 3600)
 */
function createMockJWT(expiresInSeconds: number = 3600): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const currentTime = Math.floor(Date.now() / 1000);
  const payload = btoa(JSON.stringify({
    sub: 'testuser',
    exp: currentTime + expiresInSeconds,
    iat: currentTime
  }));
  const signature = 'mock-signature';
  
  return `${header}.${payload}.${signature}`;
}
