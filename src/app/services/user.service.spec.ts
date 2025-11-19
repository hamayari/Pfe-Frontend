import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { environment } from '../../environments/environment';
import { User, CreateUserRequest, UserListResponse, UserStats } from '../models/user.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/admin/dashboard/users`;

  const mockUser: User = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    roles: ['ROLE_ADMIN'],
    enabled: true,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockUserListResponse: UserListResponse = {
    success: true,
    message: 'Users retrieved successfully',
    data: {
      users: [mockUser],
      total: 1,
      page: 1,
      size: 10,
      totalPages: 1
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers()', () => {
    it('should fetch users successfully', (done) => {
      service.getUsers().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data?.users.length).toBe(1);
        expect(response.data?.users[0]).toEqual(mockUser);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockUserListResponse);
    });

    it('should apply search filter', (done) => {
      service.getUsers({ search: 'test' }).subscribe();

      const req = httpMock.expectOne(req => req.url === apiUrl && req.params.has('search'));
      expect(req.request.params.get('search')).toBe('test');
      req.flush(mockUserListResponse);
      done();
    });

    it('should apply role filter', (done) => {
      service.getUsers({ role: 'ROLE_ADMIN' }).subscribe();

      const req = httpMock.expectOne(req => req.url === apiUrl && req.params.has('role'));
      expect(req.request.params.get('role')).toBe('ROLE_ADMIN');
      req.flush(mockUserListResponse);
      done();
    });

    it('should apply pagination parameters', (done) => {
      service.getUsers({ page: 2, size: 20 }).subscribe();

      const req = httpMock.expectOne(req => 
        req.url === apiUrl && req.params.has('page') && req.params.has('size')
      );
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('size')).toBe('20');
      req.flush(mockUserListResponse);
      done();
    });

    it('should update users subject on success', (done) => {
      service.users$.subscribe(users => {
        if (users.length > 0) {
          expect(users).toEqual([mockUser]);
          done();
        }
      });

      service.getUsers().subscribe();
      const req = httpMock.expectOne(apiUrl);
      req.flush(mockUserListResponse);
    });
  });

  describe('getUserById()', () => {
    it('should fetch user by id', (done) => {
      const mockResponse = {
        success: true,
        message: 'User found',
        data: mockUser
      };

      service.getUserById('1').subscribe(response => {
        expect(response.data).toEqual(mockUser);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('createUser()', () => {
    it('should create new user', (done) => {
      const newUser: CreateUserRequest = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        roles: ['ROLE_USER']
      };

      const mockResponse = {
        success: true,
        message: 'User created',
        data: { ...mockUser, ...newUser, id: '2' }
      };

      service.createUser(newUser).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data?.username).toBe('newuser');
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newUser);
      req.flush(mockResponse);
    });

    it('should update users list after creation', (done) => {
      const newUser: CreateUserRequest = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        roles: ['ROLE_USER']
      };

      const mockResponse = {
        success: true,
        data: { ...mockUser, id: '2' }
      };

      service.createUser(newUser).subscribe(() => {
        service.users$.subscribe(users => {
          if (users.length > 0) {
            expect(users.length).toBeGreaterThan(0);
            done();
          }
        });
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockResponse);
    });
  });

  describe('updateUser()', () => {
    it('should update existing user', (done) => {
      const updateData = { id: '1', email: 'updated@example.com' };
      const mockResponse = {
        success: true,
        data: { ...mockUser, email: 'updated@example.com' }
      };

      service.updateUser('1', updateData).subscribe(response => {
        expect(response.data?.email).toBe('updated@example.com');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });
  });

  describe('deleteUser()', () => {
    it('should delete user', (done) => {
      const mockResponse = { success: true, message: 'User deleted' };

      service.deleteUser('1').subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('toggleUserStatus()', () => {
    it('should enable user', (done) => {
      const mockResponse = {
        success: true,
        data: { ...mockUser, enabled: true }
      };

      service.toggleUserStatus('1', true).subscribe(response => {
        expect(response.data?.enabled).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });
  });

  describe('resetPassword()', () => {
    it('should reset user password', (done) => {
      const mockResponse = { success: true, message: 'Password reset' };

      service.resetPassword('1', 'newpass123').subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1/reset-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ newPassword: 'newpass123' });
      req.flush(mockResponse);
    });
  });

  describe('getUserStats()', () => {
    it('should fetch user statistics', (done) => {
      const mockStats: UserStats = {
        total: 100,
        active: 80,
        inactive: 15,
        pending: 3,
        suspended: 2,
        newThisMonth: 10,
        newThisWeek: 3,
        byRole: [
          { role: 'ROLE_ADMIN', count: 10, percentage: 10 },
          { role: 'ROLE_USER', count: 90, percentage: 90 }
        ],
        byStatus: [
          { status: 'ACTIVE', count: 80, percentage: 80 },
          { status: 'INACTIVE', count: 20, percentage: 20 }
        ]
      };

      service.getUserStats().subscribe(stats => {
        expect(stats.total).toBe(100);
        expect(stats.active).toBe(80);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/stats`);
      req.flush(mockStats);
    });
  });

  describe('checkUsernameExists()', () => {
    it('should check if username exists', (done) => {
      service.checkUsernameExists('testuser').subscribe(result => {
        expect(result.exists).toBe(true);
        done();
      });

      const req = httpMock.expectOne(req => 
        req.url === `${apiUrl}/check-username` && req.params.get('username') === 'testuser'
      );
      req.flush({ exists: true });
    });
  });

  describe('checkEmailExists()', () => {
    it('should check if email exists', (done) => {
      service.checkEmailExists('test@example.com').subscribe(result => {
        expect(result.exists).toBe(true);
        done();
      });

      const req = httpMock.expectOne(req => 
        req.url === `${apiUrl}/check-email` && req.params.get('email') === 'test@example.com'
      );
      req.flush({ exists: true });
    });
  });

  describe('validateUserData()', () => {
    it('should validate correct user data', () => {
      const validUser: CreateUserRequest = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        roles: ['ROLE_USER']
      };

      const errors = service.validateUserData(validUser);
      expect(errors.length).toBe(0);
    });

    it('should return error for short username', () => {
      const invalidUser: CreateUserRequest = {
        username: 'ab',
        email: 'test@example.com',
        password: 'password123',
        roles: ['ROLE_USER']
      };

      const errors = service.validateUserData(invalidUser);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('3 caractères');
    });

    it('should return error for invalid email', () => {
      const invalidUser: CreateUserRequest = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
        roles: ['ROLE_USER']
      };

      const errors = service.validateUserData(invalidUser);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('email');
    });

    it('should return error for short password', () => {
      const invalidUser: CreateUserRequest = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123',
        roles: ['ROLE_USER']
      };

      const errors = service.validateUserData(invalidUser);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('6 caractères');
    });

    it('should return error for missing roles', () => {
      const invalidUser: CreateUserRequest = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        roles: []
      };

      const errors = service.validateUserData(invalidUser);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('rôle');
    });
  });

  describe('searchUsers()', () => {
    it('should search users by term', (done) => {
      service.searchUsers('john').subscribe();

      const req = httpMock.expectOne(req => 
        req.url === apiUrl && req.params.get('search') === 'john'
      );
      req.flush(mockUserListResponse);
      done();
    });
  });

  describe('exportUsers()', () => {
    it('should export users as Excel', (done) => {
      const mockBlob = new Blob(['data'], { type: 'application/vnd.ms-excel' });

      service.exportUsers('excel').subscribe(blob => {
        expect(blob).toBeTruthy();
        expect(blob.type).toContain('application');
        done();
      });

      const req = httpMock.expectOne(req => 
        req.url === `${apiUrl}/export` && req.params.get('format') === 'excel'
      );
      req.flush(mockBlob);
    });
  });

  describe('refreshUsers()', () => {
    it('should refresh users list', () => {
      service.refreshUsers();

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockUserListResponse);
    });
  });

  describe('clearCache()', () => {
    it('should clear cached data', (done) => {
      service.clearCache();

      service.users$.subscribe(users => {
        expect(users.length).toBe(0);
      });

      service.stats$.subscribe(stats => {
        expect(stats).toBeNull();
        done();
      });
    });
  });
});
