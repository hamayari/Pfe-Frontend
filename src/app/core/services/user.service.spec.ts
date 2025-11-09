import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import { UserRole } from '../models/user-role.enum';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
  });

  // ==================== Tests d'initialisation ====================
  
  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  // ==================== Tests getUsers ====================
  
  describe('getUsers', () => {
    it('should return an array of users', (done) => {
      service.getUsers().subscribe(users => {
        expect(users).toBeDefined();
        expect(Array.isArray(users)).toBeTruthy();
        expect(users.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should return users with correct structure', (done) => {
      service.getUsers().subscribe(users => {
        const user = users[0];
        expect(user.id).toBeDefined();
        expect(user.username).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.role).toBeDefined();
        expect(user.status).toBeDefined();
        done();
      });
    });

    it('should return admin user in mock data', (done) => {
      service.getUsers().subscribe(users => {
        const adminUser = users.find(u => u.username === 'admin');
        expect(adminUser).toBeDefined();
        expect(adminUser?.email).toBe('admin@test.com');
        expect(adminUser?.role).toBe(UserRole.ADMIN);
        done();
      });
    });

    it('should return users with valid dates', (done) => {
      service.getUsers().subscribe(users => {
        users.forEach(user => {
          expect(user.createdAt).toBeInstanceOf(Date);
          expect(user.updatedAt).toBeInstanceOf(Date);
        });
        done();
      });
    });

    it('should return users with zero failed login attempts', (done) => {
      service.getUsers().subscribe(users => {
        users.forEach(user => {
          expect(user.failedLoginAttempts).toBe(0);
        });
        done();
      });
    });
  });

  // ==================== Tests getUser ====================
  
  describe('getUser', () => {
    it('should return a single user', (done) => {
      service.getUser('1').subscribe(user => {
        expect(user).toBeDefined();
        done();
      });
    });

    it('should accept any user id', (done) => {
      const testIds = ['1', '123', 'abc', 'user-id-123'];
      let completed = 0;

      testIds.forEach(id => {
        service.getUser(id).subscribe(user => {
          expect(user).toBeDefined();
          completed++;
          if (completed === testIds.length) {
            done();
          }
        });
      });
    });
  });

  // ==================== Tests createUser ====================
  
  describe('createUser', () => {
    it('should create a user', (done) => {
      const newUser: Partial<User> = {
        username: 'newuser',
        email: 'newuser@test.com',
        firstName: 'New',
        lastName: 'User'
      };

      service.createUser(newUser).subscribe(user => {
        expect(user).toBeDefined();
        done();
      });
    });

    it('should accept partial user data', (done) => {
      const minimalUser: Partial<User> = {
        username: 'minimal'
      };

      service.createUser(minimalUser).subscribe(user => {
        expect(user).toBeDefined();
        done();
      });
    });

    it('should handle empty user object', (done) => {
      service.createUser({}).subscribe(user => {
        expect(user).toBeDefined();
        done();
      });
    });
  });

  // ==================== Tests updateUser ====================
  
  describe('updateUser', () => {
    it('should update a user', (done) => {
      const updates: Partial<User> = {
        email: 'updated@test.com',
        firstName: 'Updated'
      };

      service.updateUser('1', updates).subscribe(user => {
        expect(user).toBeDefined();
        done();
      });
    });

    it('should accept any user id for update', (done) => {
      const updates: Partial<User> = { email: 'new@test.com' };

      service.updateUser('any-id', updates).subscribe(user => {
        expect(user).toBeDefined();
        done();
      });
    });

    it('should handle empty updates', (done) => {
      service.updateUser('1', {}).subscribe(user => {
        expect(user).toBeDefined();
        done();
      });
    });

    it('should handle single field update', (done) => {
      service.updateUser('1', { username: 'newname' }).subscribe(user => {
        expect(user).toBeDefined();
        done();
      });
    });
  });

  // ==================== Tests deleteUser ====================
  
  describe('deleteUser', () => {
    it('should delete a user', (done) => {
      service.deleteUser('1').subscribe(() => {
        expect(true).toBeTruthy(); // Si on arrive ici, c'est bon
        done();
      });
    });

    it('should accept any user id for deletion', (done) => {
      const testIds = ['1', '999', 'non-existent'];
      let completed = 0;

      testIds.forEach(id => {
        service.deleteUser(id).subscribe(() => {
          completed++;
          if (completed === testIds.length) {
            done();
          }
        });
      });
    });

    it('should return void on successful deletion', (done) => {
      service.deleteUser('1').subscribe(result => {
        expect(result).toBeUndefined();
        done();
      });
    });
  });

  // ==================== Tests d'intégration ====================
  
  describe('Integration Tests', () => {
    it('should handle multiple operations in sequence', (done) => {
      // Get users
      service.getUsers().subscribe(users => {
        expect(users.length).toBeGreaterThan(0);
        
        // Get single user
        service.getUser('1').subscribe(user => {
          expect(user).toBeDefined();
          
          // Create user
          service.createUser({ username: 'test' }).subscribe(newUser => {
            expect(newUser).toBeDefined();
            
            // Update user
            service.updateUser('1', { email: 'test@test.com' }).subscribe(updated => {
              expect(updated).toBeDefined();
              
              // Delete user
              service.deleteUser('1').subscribe(() => {
                expect(true).toBeTruthy();
                done();
              });
            });
          });
        });
      });
    });
  });
});
