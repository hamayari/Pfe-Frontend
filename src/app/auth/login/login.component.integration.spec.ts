import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

/**
 * TESTS D'INTÉGRATION - LoginComponent
 * 
 * Ces tests vérifient le flux complet d'authentification
 * avec de vraies requêtes HTTP (mockées) et navigation réelle
 */
describe('LoginComponent - Tests d\'Intégration', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let router: Router;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'admin-dashboard', component: LoginComponent },
          { path: 'commercial-dashboard', component: LoginComponent },
          { path: 'auth/forgot-password', component: LoginComponent }
        ]),
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule
      ],
      providers: [AuthService]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie qu'il n'y a pas de requêtes HTTP en attente
  });

  // ==================== TESTS D'INTÉGRATION COMPLETS ====================

  describe('Flux complet d\'authentification', () => {
    it('devrait authentifier un admin et naviguer vers admin-dashboard', (done) => {
      // Arrange
      component.loginForm.patchValue({
        username: 'admin',
        password: 'admin123'
      });

      const mockResponse = {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        roles: ['ROLE_ADMIN'],
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        tokenType: 'Bearer'
      };

      // Act
      component.onSubmit();

      // Assert - Vérifier la requête HTTP
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        username: 'admin',
        password: 'admin123'
      });

      // Simuler la réponse du serveur
      req.flush(mockResponse);

      // Vérifier le résultat après la réponse
      setTimeout(() => {
        expect(component.isLoading).toBeFalse();
        expect(component.errorMessage).toBe('');
        expect(router.navigate).toHaveBeenCalledWith(['/admin-dashboard']);
        
        // Vérifier que les données sont stockées dans localStorage
        const storedUser = localStorage.getItem('currentUser');
        expect(storedUser).toBeTruthy();
        
        done();
      }, 100);
    });

    it('devrait authentifier un commercial et naviguer vers commercial-dashboard', (done) => {
      // Arrange
      component.loginForm.patchValue({
        username: 'commercial',
        password: 'password123'
      });

      const mockResponse = {
        id: '2',
        username: 'commercial',
        email: 'commercial@example.com',
        roles: ['ROLE_COMMERCIAL'],
        accessToken: 'token123',
        tokenType: 'Bearer'
      };

      // Act
      component.onSubmit();

      // Assert
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(mockResponse);

      setTimeout(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/commercial-dashboard']);
        done();
      }, 100);
    });

    it('devrait afficher une erreur pour des identifiants incorrects', (done) => {
      // Arrange
      component.loginForm.patchValue({
        username: 'wronguser',
        password: 'wrongpass'
      });

      // Act
      component.onSubmit();

      // Assert
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(
        { message: 'Identifiants incorrects' },
        { status: 401, statusText: 'Unauthorized' }
      );

      setTimeout(() => {
        expect(component.isLoading).toBeFalse();
        expect(component.errorMessage).toContain('Identifiants incorrects');
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      }, 100);
    });

    it('devrait gérer les erreurs serveur (500)', (done) => {
      // Arrange
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });

      // Act
      component.onSubmit();

      // Assert
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(
        'Internal Server Error',
        { status: 500, statusText: 'Internal Server Error' }
      );

      setTimeout(() => {
        expect(component.isLoading).toBeFalse();
        expect(component.errorMessage).toBeTruthy();
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  // ==================== TESTS D'INTÉGRATION UI ====================

  describe('Intégration UI et formulaire', () => {
    it('devrait désactiver le bouton submit quand le formulaire est invalide', () => {
      // Arrange
      component.loginForm.patchValue({
        username: '',
        password: ''
      });
      fixture.detectChanges();

      // Act
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

      // Assert
      expect(component.loginForm.invalid).toBeTrue();
      expect(submitButton.disabled).toBeTrue();
    });

    it('devrait activer le bouton submit quand le formulaire est valide', () => {
      // Arrange
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
      fixture.detectChanges();

      // Act
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

      // Assert
      expect(component.loginForm.valid).toBeTrue();
      expect(submitButton.disabled).toBeFalse();
    });

    it('devrait afficher le message d\'erreur dans le DOM', (done) => {
      // Arrange
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'wrongpass'
      });

      // Act
      component.onSubmit();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(
        { message: 'Mot de passe incorrect' },
        { status: 401, statusText: 'Unauthorized' }
      );

      setTimeout(() => {
        fixture.detectChanges();
        
        // Assert
        const errorElement = fixture.nativeElement.querySelector('.error-message');
        expect(errorElement).toBeTruthy();
        expect(errorElement.textContent).toContain('Mot de passe incorrect');
        done();
      }, 100);
    });
  });

  // ==================== TESTS D'INTÉGRATION AVEC LOCALSTORAGE ====================

  describe('Intégration avec localStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('devrait stocker les données utilisateur dans localStorage après connexion', (done) => {
      // Arrange
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });

      const mockResponse = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['ROLE_USER'],
        accessToken: 'token123',
        tokenType: 'Bearer'
      };

      // Act
      component.onSubmit();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(mockResponse);

      setTimeout(() => {
        // Assert
        const storedUser = localStorage.getItem('currentUser');
        expect(storedUser).toBeTruthy();
        
        const parsedUser = JSON.parse(storedUser!);
        expect(parsedUser.username).toBe('testuser');
        expect(parsedUser.accessToken).toBe('token123');
        
        done();
      }, 100);
    });

    it('ne devrait pas stocker de données en cas d\'échec', (done) => {
      // Arrange
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'wrongpass'
      });

      // Act
      component.onSubmit();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(
        { message: 'Erreur' },
        { status: 401, statusText: 'Unauthorized' }
      );

      setTimeout(() => {
        // Assert
        const storedUser = localStorage.getItem('currentUser');
        expect(storedUser).toBeFalsy();
        done();
      }, 100);
    });
  });

  // ==================== TESTS DE NAVIGATION ====================

  describe('Intégration avec le Router', () => {
    it('devrait naviguer vers forgot-password', () => {
      // Arrange
      const event = new Event('click');
      spyOn(event, 'preventDefault');

      // Act
      component.forgotPassword(event);

      // Assert
      expect(event.preventDefault).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/forgot-password']);
    });
  });
});
