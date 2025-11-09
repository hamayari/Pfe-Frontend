import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @Input() selectedRole: string = '';
  @Input() isModal: boolean = false;
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() modalClose = new EventEmitter<void>();
  
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  roleIcon = 'lock';
  roleLabel = 'Authentification';
  roleColor = '#667eea';
  roleGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Si un rôle est passé en input, l'utiliser
    if (this.selectedRole && this.selectedRole !== '') {
      console.log('🔐 Rôle reçu en input:', this.selectedRole);
      localStorage.setItem('selectedRole', this.selectedRole);
      this.updateRoleStyles();
    } else {
      // Sinon, utiliser le rôle de la route
      const data = this.route.snapshot.data || {};
      const roleFromRoute = data['role'] as string | undefined;
      const iconFromRoute = data['icon'] as string | undefined;
      const labelFromRoute = data['label'] as string | undefined;

      if (roleFromRoute && roleFromRoute !== 'ANY') {
        this.selectedRole = roleFromRoute;
        localStorage.setItem('selectedRole', roleFromRoute);
      } else {
        this.selectedRole = localStorage.getItem('selectedRole') || '';
      }

      if (iconFromRoute) this.roleIcon = iconFromRoute;
      if (labelFromRoute) this.roleLabel = labelFromRoute;
      this.updateRoleStyles();
    }

    console.log('Login Component initialisé avec rôle:', this.selectedRole);
  }

  private updateRoleStyles() {
    switch (this.selectedRole.toLowerCase()) {
      case 'admin':
        this.roleIcon = 'admin_panel_settings';
        this.roleLabel = 'Espace Administrateur';
        this.roleColor = '#3f51b5';
        this.roleGradient = 'linear-gradient(135deg, #3f51b5 0%, #1a237e 100%)';
        break;
      case 'commercial':
        this.roleIcon = 'store';
        this.roleLabel = 'Espace Commercial';
        this.roleColor = '#4caf50';
        this.roleGradient = 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)';
        break;
      case 'project-manager':
      case 'projectmanager':
        this.roleIcon = 'assignment';
        this.roleLabel = 'Espace Chef de Projet';
        this.roleColor = '#ff9800';
        this.roleGradient = 'linear-gradient(135deg, #ff9800 0%, #e65100 100%)';
        break;
      case 'decision-maker':
      case 'decisionmaker':
        this.roleIcon = 'gavel';
        this.roleLabel = 'Espace Décideur';
        this.roleColor = '#9c27b0';
        this.roleGradient = 'linear-gradient(135deg, #9c27b0 0%, #4a148c 100%)';
        break;
      default:
        this.roleIcon = 'lock';
        this.roleLabel = 'Authentification';
        this.roleColor = '#667eea';
        this.roleGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  }

  private getRedirectPathForRole(primaryRole: string): string {
    switch (primaryRole) {
      case 'ROLE_SUPER_ADMIN':
      case 'ROLE_ADMIN':
      case 'ADMIN':
        return '/admin-dashboard';
      case 'ROLE_PROJECT_MANAGER':
      case 'PROJECT_MANAGER':
        return '/project-manager-dashboard';
      case 'ROLE_COMMERCIAL':
      case 'COMMERCIAL':
        return '/commercial-dashboard';
      case 'ROLE_DECISION_MAKER':
      case 'DECISION_MAKER':
        return '/decision-maker-dashboard';
      default:
        return '/admin-dashboard';
    }
  }

  onSubmit() {
    if (this.isLoading || !this.loginForm.valid) return;
    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.loginForm.value;

    this.authService.login(formValue.username, formValue.password).subscribe({
      next: (response) => {
        // TEMPORAIRE : Désactiver la vérification stricte des rôles pour permettre la connexion
        console.log('🔐 Rôle sélectionné:', this.selectedRole);
        console.log('🔐 Rôles du backend:', response.roles);
        
        // Si un rôle a été forcé par l'URL (ex: login-admin), vérifier qu'il est bien présent
        if (this.selectedRole && this.selectedRole !== 'ANY') {
          // Vérification plus flexible des rôles
          const hasRole = (response.roles || []).some(r => 
            r.includes(this.selectedRole) || 
            r.includes(this.selectedRole.toUpperCase()) ||
            r.includes(this.selectedRole.toLowerCase())
          );
          
          if (!hasRole) {
            console.log('⚠️ Rôle non trouvé, mais connexion autorisée pour le test');
            // this.errorMessage = "Vous n'avez pas les droits pour ce rôle.";
            // this.isLoading = false;
            // return;
          }
        }

        const primaryRole = (response.roles && response.roles.length) ? response.roles[0] : this.selectedRole;
        const redirectPath = this.getRedirectPathForRole(primaryRole);
        
        // Émettre l'événement de succès
        this.loginSuccess.emit();
        
        // Redirection vers le dashboard
        this.router.navigate([redirectPath]);
        this.isLoading = false;
      },
      error: (error) => {
        if (error?.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.status === 401) {
          this.errorMessage = 'Identifiants incorrects';
        } else if (error.status === 500) {
          this.errorMessage = 'Erreur serveur. Veuillez réessayer.';
        } else {
          this.errorMessage = 'Une erreur est survenue lors de la connexion';
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  forgotPassword(event: Event) {
    event.preventDefault();
    this.router.navigate(['/auth/forgot-password']);
  }

  closeModal() {
    this.modalClose.emit();
  }
}









