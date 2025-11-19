import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, LoginResponse, User } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;

  // Mock data
  const mockLoginResponse: LoginResponse = {
    token: 'mock-jwt-token',
    refreshToken: 'mock-refresh-token',
    type: 'Bearer',
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['ROLE_ADMIN'],
    forcePasswordChange: false
  };

  const mockUser: User = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['ROLE_ADMIN']
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Constructor', () => {
    it('should initialize with null user when localStorage is empty', () => {
      expect(service.currentUserValue).toBeNull();
    });

    it('should load user from localStorage if valid', () => {
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      const newService = new AuthService(TestBed.inject(HttpClientTestingModule) as any);
      expect(newService.currentUserValue).toEqual(mockUser);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('currentUser', 'invalid-json');
      const newService = new AuthService(TestBed.inject(HttpClientTestingModule) as any);
      expect(newService.currentUserValue).toBeNull();
    });
  });

  describe('login()', () => {
    it('should authenticate user and store token', (done) => {
      service.login('testuser', 'password123').subscribe(response => {
        expect(response).toEqual(mockLoginResponse);
        expect(localStorage.getItem('token')).toBe('mock-jwt-token');
        expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token');
        expect(service.currentUserValue).toEqual(mockUser);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/signin`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'testuser', password: 'password123' });
      req.flush(mockLoginResponse);
    });

    it('should handle login failure', (done) => {
      service.login('wronguser', 'wrongpass').subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(401);
          expect(localStorage.getItem('token')).toBeNull();
          done();
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/signin`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should update currentUser observable on successful login', (done) => {
      service.currentUser.subscribe(user => {
        if (user) {
          expect(user).toEqual(mockUser);
          done();
        }
      });

      service.login('testuser', 'password123').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/signin`);
      req.flush(mockLoginResponse);
    });
  });

  describe('logout()', () => {
    it('should clear user data and token', (done) => {
      // Setup: login first
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('currentUser', JSON.stringify(mockUser));

      service.logout().subscribe(() => {
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('currentUser')).toBeNull();
        expect(service.currentUserValue).toBeNull();
        done();
      });
    });

    it('should emit null to currentUser observable', (done) => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('currentUser', JSON.stringify(mockUser));

      service.logout().subscribe(() => {
        service.currentUser.subscribe(user => {
          expect(user).toBeNull();
          done();
        });
      });
    });
  });

  describe('isAuthenticated()', () => {
    it('should return true when user is logged in', () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      service['currentUserSubject'].next(mockUser);

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      service['currentUserSubject'].next(mockUser);

      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when no user exists', () => {
      localStorage.setItem('token', 'mock-token');

      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when neither token nor user exists', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getToken()', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('token', 'mock-token');
      expect(service.getToken()).toBe('mock-token');
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('getUserRoles()', () => {
    it('should return user roles when user is logged in', () => {
      service['currentUserSubject'].next(mockUser);
      expect(service.getUserRoles()).toEqual(['ROLE_ADMIN']);
    });

    it('should return empty array when no user is logged in', () => {
      expect(service.getUserRoles()).toEqual([]);
    });
  });

  describe('hasRole()', () => {
    beforeEach(() => {
      service['currentUserSubject'].next(mockUser);
    });

    it('should return true when user has the specified role', () => {
      expect(service.hasRole('ROLE_ADMIN')).toBe(true);
    });

    it('should return false when user does not have the specified role', () => {
      expect(service.hasRole('ROLE_COMMERCIAL')).toBe(false);
    });

    it('should return false when no user is logged in', () => {
      service['currentUserSubject'].next(null);
      expect(service.hasRole('ROLE_ADMIN')).toBe(false);
    });
  });

  describe('hasAnyRole()', () => {
    beforeEach(() => {
      service['currentUserSubject'].next(mockUser);
    });

    it('should return true when user has at least one of the specified roles', () => {
      expect(service.hasAnyRole(['ROLE_ADMIN', 'ROLE_COMMERCIAL'])).toBe(true);
    });

    it('should return false when user has none of the specified roles', () => {
      expect(service.hasAnyRole(['ROLE_COMMERCIAL', 'ROLE_PROJECT_MANAGER'])).toBe(false);
    });

    it('should return false when no user is logged in', () => {
      service['currentUserSubject'].next(null);
      expect(service.hasAnyRole(['ROLE_ADMIN'])).toBe(false);
    });
  });

  describe('getDashboardRouteByRole()', () => {
    it('should return /admin for ROLE_ADMIN', () => {
      service['currentUserSubject'].next({ ...mockUser, roles: ['ROLE_ADMIN'] });
      expect(service.getDashboardRouteByRole()).toBe('/admin');
    });

    it('should return /admin for ROLE_SUPER_ADMIN', () => {
      service['currentUserSubject'].next({ ...mockUser, roles: ['ROLE_SUPER_ADMIN'] });
      expect(service.getDashboardRouteByRole()).toBe('/admin');
    });

    it('should return /commercial-dashboard for ROLE_COMMERCIAL', () => {
      service['currentUserSubject'].next({ ...mockUser, roles: ['ROLE_COMMERCIAL'] });
      expect(service.getDashboardRouteByRole()).toBe('/commercial-dashboard');
    });

    it('should return /project-manager-dashboard for ROLE_PROJECT_MANAGER', () => {
      service['currentUserSubject'].next({ ...mockUser, roles: ['ROLE_PROJECT_MANAGER'] });
      expect(service.getDashboardRouteByRole()).toBe('/project-manager-dashboard');
    });

    it('should return /decision-maker-dashboard for ROLE_DECISION_MAKER', () => {
      service['currentUserSubject'].next({ ...mockUser, roles: ['ROLE_DECISION_MAKER'] });
      expect(service.getDashboardRouteByRole()).toBe('/decision-maker-dashboard');
    });

    it('should return /dashboard for unknown roles', () => {
      service['currentUserSubject'].next({ ...mockUser, roles: ['ROLE_UNKNOWN'] });
      expect(service.getDashboardRouteByRole()).toBe('/dashboard');
    });
  });

  describe('updateUserProfileImage()', () => {
    it('should update user profile image', (done) => {
      service['currentUserSubject'].next(mockUser);
      const newImage = 'https://example.com/image.jpg';

      service.updateUserProfileImage(newImage).subscribe(() => {
        const updatedUser = service.currentUserValue;
        expect(updatedUser?.profileImage).toBe(newImage);
        
        const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        expect(storedUser.profileImage).toBe(newImage);
        done();
      });
    });

    it('should not update when no user is logged in', (done) => {
      service.updateUserProfileImage('image.jpg').subscribe(() => {
        expect(service.currentUserValue).toBeNull();
        done();
      });
    });
  });

  describe('testLogin()', () => {
    it('should create mock user with specified role', () => {
      service.testLogin('ROLE_ADMIN');

      expect(service.currentUserValue).toBeTruthy();
      expect(service.currentUserValue?.roles).toContain('ROLE_ADMIN');
      expect(localStorage.getItem('token')).toBe('mock-token');
    });
  });

  describe('Compatibility methods', () => {
    it('getCurrentUser() should return current user', () => {
      service['currentUserSubject'].next(mockUser);
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    it('isLoggedIn() should return authentication status', () => {
      localStorage.setItem('token', 'mock-token');
      service['currentUserSubject'].next(mockUser);
      expect(service.isLoggedIn()).toBe(true);
    });

    it('currentUser$ should return observable', (done) => {
      service['currentUserSubject'].next(mockUser);
      service.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUser);
        done();
      });
    });
  });
});
