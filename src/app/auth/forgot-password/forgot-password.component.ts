import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
  selector: 'app-forgot-password',
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
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.snackBar.open('Veuillez entrer une adresse email valide', 'Fermer', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const email = this.forgotPasswordForm.value.email;

    console.log('🔐 Demande de réinitialisation pour:', email);

    this.http.post(`${environment.apiUrl}/auth/forgot-password?email=${encodeURIComponent(email)}`, {}, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('✅ Réponse du serveur:', response);
          this.isLoading = false;
          this.emailSent = true;
          this.snackBar.open(
            '✅ Un email de réinitialisation a été envoyé à votre adresse',
            'Fermer',
            { duration: 5000 }
          );
        },
        error: (error) => {
          console.error('❌ Erreur:', error);
          this.isLoading = false;
          
          let message = 'Erreur lors de l\'envoi de l\'email';
          
          if (error.status === 404) {
            message = 'Aucun compte trouvé avec cet email';
          } else if (error.status === 0) {
            message = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.';
          } else if (error.error?.message) {
            message = error.error.message;
          } else if (error.message) {
            message = error.message;
          }
          
          this.snackBar.open(message, 'Fermer', { duration: 5000 });
        }
      });
  }

  backToLogin(): void {
    this.router.navigate(['/home'], { 
      queryParams: { 
        openLogin: 'true',
        role: 'decision-maker' // Rôle par défaut
      } 
    });
  }
}
