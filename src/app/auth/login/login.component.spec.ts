import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService, User } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  // Mock user pour les tests
  const mockUser: User = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['ROLE_ADMIN'],
    accessToken: 'mock-jwt-token',
    tokenType: 'Bearer'
  };

  beforeEach(async () => {
    // Création des mocks
    mockAuthService = jasmine.createSpyObj('AuthService', ['login']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        data: {}
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    
    // Clear localStorage avant chaque test
    localStorage.clear();
    
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ==================== Tests d'initialisation ====================
  
  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize the login form with empty values', () => {
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('username')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should have required validators on username and password', () => {
      const usernameControl = component.loginForm.get('username');
      const passwordControl = component.loginForm.get('password');

      expect(usernameControl?.hasError('required')).toBeTruthy();
      expect(passwordControl?.hasError('required')).toBeTruthy();
    });

    it('should have minLength validators', () => {
      const usernameControl = component.loginForm.get('username');
      const passwordControl = component.loginForm.get('password');

      usernameControl?.setValue('ab');
      passwordControl?.setValue('12345');

      expect(usernameControl?.hasError('minlength')).toBeTruthy();
      expect(passwordControl?.hasError('minlength')).toBeTruthy();
    });

    it('should initialize with default role styles when no role is provided', () => {
      expect(component.roleIcon).toBe('lock');
      expect(component.roleLabel).toBe('Authentification');
      expect(component.roleColor).toBe('#667eea');
    });

    it('should use role from input when provided', () => {
      component.selectedRole = 'admin';
      component.ngOnInit();
      
      expect(component.roleIcon).toBe('admin_panel_settings');
      expect(component.roleLabel).toBe('Espace Administrateur');
      expect(component.roleColor).toBe('#3f51b5');
    });

    it('should use role from route data when available', () => {
      mockActivatedRoute.snapshot.data = {
        role: 'commercial',
        icon: 'store',
        label: 'Espace Commercial'
      };
      
      component.ngOnInit();
      
      expect(component.selectedRole).toBe('commercial');
      expect(component.roleIcon).toBe('store');
      expect(component.roleLabel).toBe('Espace Commercial');
    });
  });

  // ==================== Tests de validation du formulaire ====================
  
  describe('Form Validation', () => {
    it('should be invalid when empty', () => {
      expect(component.loginForm.valid).toBeFalsy();
    });

    it('should be invalid with username less than 3 characters', () => {
      component.loginForm.patchValue({
        username: 'ab',
        password: 'password123'
      });
      
      expect(component.loginForm.valid).toBeFalsy();
      expect(component.loginForm.get('username')?.hasError('minlength')).toBeTruthy();
    });

    it('should be invalid with password less than 6 characters', () => {
      component.loginForm.patchValue({
        username: 'testuser',
        password: '12345'
      });
      
      expect(component.loginForm.valid).toBeFalsy();
      expect(component.loginForm.get('password')?.hasError('minlength')).toBeTruthy();
    });

    it('should be valid with correct username and password', () => {
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
      
      expect(component.loginForm.valid).toBeTruthy();
    });
  });

  // ==================== Tests de soumission du formulaire ====================
  
  describe('Form Submission - Success Cases', () => {
    beforeEach(() => {
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
    });

    it('should call authService.login on valid form submission', fakeAsync(() => {
      mockAuthService.login.and.returnValue(of(mockUser));
      
      component.onSubmit();
      tick();
      
      expect(mockAuthService.login).toHaveBeenCalledWith('testuser', 'password123');
    }));

    it('should set isLoading to true during login', () => {
      mockAuthService.login.and.returnValue(of(mockUser));
      
      component.onSubmit();
      
      expect(component.isLoading).toBeTruthy();
    });

    it('should navigate to admin dashboard on successful admin login', fakeAsync(() => {
      const adminUser = { ...mockUser, roles: ['ROLE_ADMIN'] };
      mockAuthService.login.and.returnValue(of(adminUser));
      
      component.onSubmit();
      tick();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin-dashboard']);
      expect(component.isLoading).toBeFalsy();
    }));

    it('should navigate to commercial dashboard for commercial role', fakeAsync(() => {
      const commercialUser = { ...mockUser, roles: ['ROLE_COMMERCIAL'] };
      mockAuthService.login.and.returnValue(of(commercialUser));
      
      component.onSubmit();
      tick();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/commercial-dashboard']);
    }));

    it('should navigate to project manager dashboard for project manager role', fakeAsync(() => {
      const pmUser = { ...mockUser, roles: ['ROLE_PROJECT_MANAGER'] };
      mockAuthService.login.and.returnValue(of(pmUser));
      
      component.onSubmit();
      tick();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/project-manager-dashboard']);
    }));

    it('should navigate to decision maker dashboard for decision maker role', fakeAsync(() => {
      const dmUser = { ...mockUser, roles: ['ROLE_DECISION_MAKER'] };
      mockAuthService.login.and.returnValue(of(dmUser));
      
      component.onSubmit();
      tick();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/decision-maker-dashboard']);
    }));

    it('should emit loginSuccess event on successful login', fakeAsync(() => {
      mockAuthService.login.and.returnValue(of(mockUser));
      spyOn(component.loginSuccess, 'emit');
      
      component.onSubmit();
      tick();
      
      expect(component.loginSuccess.emit).toHaveBeenCalled();
    }));

    it('should clear error message on successful login', fakeAsync(() => {
      component.errorMessage = 'Previous error';
      mockAuthService.login.and.returnValue(of(mockUser));
      
      component.onSubmit();
      tick();
      
      expect(component.errorMessage).toBe('');
    }));
  });

  // ==================== Tests de gestion des erreurs ====================
  
  describe('Form Submission - Error Cases', () => {
    beforeEach(() => {
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'wrongpassword'
      });
    });

    it('should not submit if form is invalid', () => {
      component.loginForm.patchValue({ username: '' });
      
      component.onSubmit();
      
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should not submit if already loading', () => {
      component.isLoading = true;
      
      component.onSubmit();
      
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should display error message on 401 Unauthorized', fakeAsync(() => {
      const error = { status: 401 };
      mockAuthService.login.and.returnValue(throwError(() => error));
      
      component.onSubmit();
      tick();
      
      expect(component.errorMessage).toBe('Identifiants incorrects');
      expect(component.isLoading).toBeFalsy();
    }));

    it('should display error message on 500 Server Error', fakeAsync(() => {
      const error = { status: 500 };
      mockAuthService.login.and.returnValue(throwError(() => error));
      
      component.onSubmit();
      tick();
      
      expect(component.errorMessage).toBe('Erreur serveur. Veuillez réessayer.');
      expect(component.isLoading).toBeFalsy();
    }));

    it('should display custom error message from backend', fakeAsync(() => {
      const error = { 
        error: { message: 'Compte bloqué' },
        status: 403
      };
      mockAuthService.login.and.returnValue(throwError(() => error));
      
      component.onSubmit();
      tick();
      
      expect(component.errorMessage).toBe('Compte bloqué');
      expect(component.isLoading).toBeFalsy();
    }));

    it('should display generic error message for unknown errors', fakeAsync(() => {
      const error = { status: 0 };
      mockAuthService.login.and.returnValue(throwError(() => error));
      
      component.onSubmit();
      tick();
      
      expect(component.errorMessage).toBe('Une erreur est survenue lors de la connexion');
      expect(component.isLoading).toBeFalsy();
    }));
  });

  // ==================== Tests des fonctionnalités UI ====================
  
  describe('UI Interactions', () => {
    it('should toggle password visibility', () => {
      expect(component.showPassword).toBeFalsy();
      
      component.togglePasswordVisibility();
      expect(component.showPassword).toBeTruthy();
      
      component.togglePasswordVisibility();
      expect(component.showPassword).toBeFalsy();
    });

    it('should navigate to forgot password page', () => {
      const event = new Event('click');
      spyOn(event, 'preventDefault');
      
      component.forgotPassword(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/forgot-password']);
    });

    it('should emit modalClose event when closeModal is called', () => {
      spyOn(component.modalClose, 'emit');
      
      component.closeModal();
      
      expect(component.modalClose.emit).toHaveBeenCalled();
    });
  });

  // ==================== Tests des styles de rôle ====================
  
  describe('Role Styles', () => {
    it('should apply correct styles for admin role', () => {
      component.selectedRole = 'admin';
      component.ngOnInit();
      
      expect(component.roleIcon).toBe('admin_panel_settings');
      expect(component.roleLabel).toBe('Espace Administrateur');
      expect(component.roleColor).toBe('#3f51b5');
      expect(component.roleGradient).toContain('#3f51b5');
    });

    it('should apply correct styles for commercial role', () => {
      component.selectedRole = 'commercial';
      component.ngOnInit();
      
      expect(component.roleIcon).toBe('store');
      expect(component.roleLabel).toBe('Espace Commercial');
      expect(component.roleColor).toBe('#4caf50');
    });

    it('should apply correct styles for project-manager role', () => {
      component.selectedRole = 'project-manager';
      component.ngOnInit();
      
      expect(component.roleIcon).toBe('assignment');
      expect(component.roleLabel).toBe('Espace Chef de Projet');
      expect(component.roleColor).toBe('#ff9800');
    });

    it('should apply correct styles for decision-maker role', () => {
      component.selectedRole = 'decision-maker';
      component.ngOnInit();
      
      expect(component.roleIcon).toBe('gavel');
      expect(component.roleLabel).toBe('Espace Décideur');
      expect(component.roleColor).toBe('#9c27b0');
    });

    it('should handle case-insensitive role names', () => {
      component.selectedRole = 'ADMIN';
      component.ngOnInit();
      
      expect(component.roleIcon).toBe('admin_panel_settings');
    });
  });

  // ==================== Tests de localStorage ====================
  
  describe('LocalStorage Interaction', () => {
    it('should store selected role in localStorage on init', () => {
      component.selectedRole = 'admin';
      component.ngOnInit();
      
      expect(localStorage.getItem('selectedRole')).toBe('admin');
    });

    it('should retrieve role from localStorage if not provided', () => {
      localStorage.setItem('selectedRole', 'commercial');
      
      component.selectedRole = '';
      component.ngOnInit();
      
      expect(component.selectedRole).toBe('commercial');
    });
  });
});
