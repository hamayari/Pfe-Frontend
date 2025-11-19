import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let localStorageSpy: jasmine.Spy;

  const mockLoginResponse = {
    token: 'mock-token',
    refreshToken: 'mock-refresh-token',
    type: 'Bearer',
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['ROLE_ADMIN'],
    forcePasswordChange: false
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = {
      snapshot: {
        data: {
          role: 'admin',
          icon: 'admin_panel_settings',
          label: 'Espace Administrateur'
        }
      }
    };

    // Mock localStorage
    let store: { [key: string]: string } = {};
    const mockLocalStorage = {
      getItem: (key: string): string | null => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      }
    };

    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
    spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize the login form with empty values', () => {
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('username')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should have required validators on username and password', () => {
      const usernameControl = component.loginForm.get('username');
      const passwordControl = component.loginForm.get('password');

      expect(usernameControl?.hasError('required')).toBe(true);
      expect(passwordControl?.hasError('required')).toBe(true);
    });

    it('should have minLength validators', () => {
      const usernameControl = component.loginForm.get('username');
      const passwordControl = component.loginForm.get('password');

      usernameControl?.setValue('ab');
      passwordControl?.setValue('12345');

      expect(usernameControl?.hasError('minlength')).toBe(true);
      expect(passwordControl?.hasError('minlength')).toBe(true);
    });

    it('should initialize with default role styles when no role is provided', () => {
      component.selectedRole = '';
      component.ngOnInit();
      
      expect(component.roleIcon).toBeDefined();
      expect(component.roleLabel).toBeDefined();
    });

    it('should use role from input when provided', () => {
      component.selectedRole = 'admin';
      component.ngOnInit();
      
      expect(localStorage.setItem).toHaveBeenCalledWith('selectedRole', 'admin');
    });

    it('should use role from route data when available', () => {
      component.selectedRole = '';
      component.ngOnInit();
      
      expect(component.selectedRole).toBe('admin');
    });
  });

  describe('Form Validation', () => {
    it('should be invalid when empty', () => {
      expect(component.loginForm.valid).toBe(false);
    });

    it('should be invalid with username less than 3 characters', () => {
      component.loginForm.patchValue({
        username: 'ab',
        password: 'password123'
      });
      
      expect(component.loginForm.valid).toBe(false);
    });

    it('should be invalid with password less than 6 characters', () => {
      component.loginForm.patchValue({
        username: 'testuser',
        password: '12345'
      });
      
      expect(component.loginForm.valid).toBe(false);
    });

    it('should be valid with correct username and password', () => {
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
      
      expect(component.loginForm.valid).toBe(true);
    });
  });

  describe('Form Submission - Success Cases', () => {
    beforeEach(() => {
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
    });

    it('should call authService.login on valid form submission', fakeAsync(() => {
      authService.login.and.returnValue(of(mockLoginResponse));

      component.onSubmit();
      tick();

      expect(authService.login).toHaveBeenCalledWith('testuser', 'password123');
    }));

    it('should navigate to admin dashboard on successful admin login', fakeAsync(() => {
      authService.login.and.returnValue(of(mockLoginResponse));

      component.onSubmit();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/admin-dashboard']);
    }));

    it('should navigate to commercial dashboard for commercial role', fakeAsync(() => {
      const commercialResponse = { ...mockLoginResponse, roles: ['ROLE_COMMERCIAL'] };
      authService.login.and.returnValue(of(commercialResponse));

      component.onSubmit();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/commercial-dashboard']);
    }));

    it('should navigate to project manager dashboard for project manager role', fakeAsync(() => {
      const pmResponse = { ...mockLoginResponse, roles: ['ROLE_PROJECT_MANAGER'] };
      authService.login.and.returnValue(of(pmResponse));

      component.onSubmit();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/project-manager-dashboard']);
    }));

    it('should navigate to decision maker dashboard for decision maker role', fakeAsync(() => {
      const dmResponse = { ...mockLoginResponse, roles: ['ROLE_DECISION_MAKER'] };
      authService.login.and.returnValue(of(dmResponse));

      component.onSubmit();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/decision-maker-dashboard']);
    }));

    it('should emit loginSuccess event on successful login', fakeAsync(() => {
      authService.login.and.returnValue(of(mockLoginResponse));
      spyOn(component.loginSuccess, 'emit');

      component.onSubmit();
      tick();

      expect(component.loginSuccess.emit).toHaveBeenCalled();
    }));

    it('should clear error message on successful login', fakeAsync(() => {
      component.errorMessage = 'Previous error';
      authService.login.and.returnValue(of(mockLoginResponse));

      component.onSubmit();
      tick();

      expect(component.errorMessage).toBe('');
    }));
  });

  describe('Form Submission - Error Cases', () => {
    beforeEach(() => {
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
    });

    it('should not submit if form is invalid', () => {
      component.loginForm.patchValue({
        username: '',
        password: ''
      });

      component.onSubmit();

      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should display custom error message from backend', fakeAsync(() => {
      const errorResponse = { error: { message: 'Custom error message' } };
      authService.login.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();
      tick();

      expect(component.errorMessage).toBe('Custom error message');
      expect(component.isLoading).toBe(false);
    }));

    it('should display error message on 401 Unauthorized', fakeAsync(() => {
      const errorResponse = { status: 401 };
      authService.login.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();
      tick();

      expect(component.errorMessage).toBe('Identifiants incorrects');
    }));

    it('should display error message on 500 Server Error', fakeAsync(() => {
      const errorResponse = { status: 500 };
      authService.login.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();
      tick();

      expect(component.errorMessage).toBe('Erreur serveur. Veuillez réessayer.');
    }));

    it('should display generic error message for unknown errors', fakeAsync(() => {
      authService.login.and.returnValue(throwError(() => ({})));

      component.onSubmit();
      tick();

      expect(component.errorMessage).toBe('Une erreur est survenue lors de la connexion');
    }));
  });

  describe('Role Styles', () => {
    it('should apply correct styles for admin role', () => {
      component.selectedRole = 'admin';
      component.ngOnInit();
      
      expect(component.roleIcon).toBe('admin_panel_settings');
      expect(component.roleLabel).toBe('Espace Administrateur');
      expect(component.roleColor).toBe('#3f51b5');
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

  describe('UI Interactions', () => {
    it('should toggle password visibility', () => {
      expect(component.showPassword).toBe(false);
      
      component.togglePasswordVisibility();
      expect(component.showPassword).toBe(true);
      
      component.togglePasswordVisibility();
      expect(component.showPassword).toBe(false);
    });

    it('should navigate to forgot password page', () => {
      const event = new Event('click');
      spyOn(event, 'preventDefault');
      
      component.forgotPassword(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/forgot-password']);
    });

    it('should emit modalClose event when closeModal is called', () => {
      spyOn(component.modalClose, 'emit');
      
      component.closeModal();
      
      expect(component.modalClose.emit).toHaveBeenCalled();
    });
  });

  describe('LocalStorage Interaction', () => {
    it('should store selected role in localStorage', () => {
      component.selectedRole = 'admin';
      component.ngOnInit();
      
      expect(localStorage.setItem).toHaveBeenCalledWith('selectedRole', 'admin');
    });

    it('should retrieve role from localStorage when not provided', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('commercial');
      component.selectedRole = '';
      
      component.ngOnInit();
      
      expect(localStorage.getItem).toHaveBeenCalledWith('selectedRole');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty roles array from backend', fakeAsync(() => {
      const responseWithoutRoles = { ...mockLoginResponse, roles: [] };
      authService.login.and.returnValue(of(responseWithoutRoles));
      component.selectedRole = 'admin';

      component.onSubmit();
      tick();

      expect(router.navigate).toHaveBeenCalled();
    }));

    it('should not submit when already loading', () => {
      component.isLoading = true;
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });

      component.onSubmit();

      expect(authService.login).not.toHaveBeenCalled();
    });
  });
});


  describe('Edge Cases', () => {
    it('should handle empty roles array from backend', fakeAsync(() => {
      const responseWithoutRoles = { ...mockLoginResponse, roles: [] };
      authService.login.and.returnValue(of(responseWithoutRoles));
      component.selectedRole = 'admin';
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });

      component.onSubmit();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/admin-dashboard']);
    }));

    it('should not submit when already loading', () => {
      component.isLoading = true;
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });

      component.onSubmit();

      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('LocalStorage Interaction', () => {
    it('should retrieve role from localStorage when not provided', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('commercial');
      component.selectedRole = '';
      
      component.ngOnInit();
      
      expect(localStorage.getItem).toHaveBeenCalledWith('selectedRole');
    });

    it('should store selected role in localStorage on init', () => {
      component.selectedRole = 'admin';
      component.ngOnInit();
      
      expect(localStorage.setItem).toHaveBeenCalledWith('selectedRole', 'admin');
    });
  });
});
