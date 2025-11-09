import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss']
})
export class ChangePasswordModalComponent {
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  
  hideOldPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<ChangePasswordModalComponent>,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    console.log('🔐 Modal de changement de mot de passe initialisé');
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    // Validation côté client
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.snackBar.open('Tous les champs sont requis', 'Fermer', { duration: 3000 });
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.snackBar.open('Le nouveau mot de passe et la confirmation ne correspondent pas', 'Fermer', { duration: 3000 });
      return;
    }

    if (this.newPassword.length < 6) {
      this.snackBar.open('Le mot de passe doit contenir au moins 6 caractères', 'Fermer', { duration: 3000 });
      return;
    }

    if (this.oldPassword === this.newPassword) {
      this.snackBar.open('Le nouveau mot de passe doit être différent de l\'ancien', 'Fermer', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    // Récupérer le token depuis localStorage
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const requestBody = {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    };

    this.http.post<any>('http://localhost:8085/api/user-profile/change-password', requestBody, { headers })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.snackBar.open('✅ Mot de passe changé avec succès', 'Fermer', { 
              duration: 5000,
              panelClass: ['success-snackbar']
            });
            this.dialogRef.close({ success: true });
          } else {
            this.snackBar.open(response.message || 'Erreur lors du changement de mot de passe', 'Fermer', { 
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur changement mot de passe:', error);
          
          let errorMessage = 'Erreur lors du changement de mot de passe';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 401) {
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          } else if (error.status === 400) {
            errorMessage = error.error?.message || 'Données invalides';
          }
          
          this.snackBar.open(errorMessage, 'Fermer', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }
}
