import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading = false;
  resetSuccess = false;
  hidePassword = true;
  hideConfirmPassword = true;
  token: string = '';
  userRole: string = 'decision-maker'; // Rôle par défaut

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Récupérer le token et le rôle depuis l'URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.userRole = params['role'] || 'decision-maker'; // Utiliser le rôle de l'URL ou par défaut
      
      if (!this.token) {
        this.snackBar.open('Token invalide ou manquant', 'Fermer', { duration: 5000 });
        this.router.navigate(['/home'], { 
          queryParams: { 
            openLogin: 'true',
            role: this.userRole
          } 
        });
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.token) {
      return;
    }

    this.isLoading = true;
    const newPassword = this.resetPasswordForm.value.password;

    this.http.post(
      `${environment.apiUrl}/auth/reset-password?token=${this.token}&newPassword=${newPassword}`,
      {},
      { responseType: 'text' }
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.resetSuccess = true;
        this.snackBar.open(
          '✅ Votre mot de passe a été réinitialisé avec succès',
          'Fermer',
          { duration: 5000 }
        );
        
        // Rediriger vers la page d'accueil avec modal de login après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/home'], { 
            queryParams: { 
              openLogin: 'true',
              role: this.userRole // Utiliser le rôle récupéré de l'URL
            } 
          });
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Erreur de réinitialisation:', error);
        
        let message = 'Erreur lors de la réinitialisation du mot de passe';
        
        if (error.status === 400) {
          message = 'Token invalide ou expiré. Veuillez faire une nouvelle demande de réinitialisation.';
        } else if (error.status === 500) {
          message = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else if (error.error) {
          // Essayer de parser le message d'erreur
          try {
            if (typeof error.error === 'string') {
              message = error.error;
            } else if (error.error.message) {
              message = error.error.message;
            }
          } catch (e) {
            console.error('Erreur de parsing:', e);
          }
        }
        
        this.snackBar.open(message, 'Fermer', { duration: 7000 });
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/home'], { 
      queryParams: { 
        openLogin: 'true',
        role: this.userRole // Utiliser le rôle récupéré de l'URL
      } 
    });
  }
}
