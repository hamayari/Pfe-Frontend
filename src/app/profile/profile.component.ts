import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

import { AuthService, User } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChangePasswordModalComponent } from '../shared/components/change-password-modal/change-password-modal.component';
import { TwoFactorAuthModalComponent } from '../shared/components/two-factor-auth-modal/two-factor-auth-modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  originalUser: User | null = null;
  isLoading = false;
  twoFactorEnabled = false;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    console.log('👤 Chargement du profil utilisateur...');
    this.loadUserProfile();
    this.load2FAStatus();
  }

  loadUserProfile(): void {
    const token = localStorage.getItem('token');
    console.log('🔑 Token trouvé:', token ? 'OUI (longueur: ' + token.length + ')' : 'NON');
    
    if (!token) {
      console.error('❌ Pas de token trouvé');
      this.router.navigate(['/login']);
      return;
    }

    // Décoder le token pour voir ce qu'il contient
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('📋 Payload du token JWT:', payload);
        console.log('👤 Username dans le token:', payload.sub);
      }
    } catch (e) {
      console.error('❌ Erreur décodage token:', e);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    console.log('📡 Appel API: GET /api/user-profile/me');
    
    // Essayer de charger depuis l'endpoint universel
    this.http.get<any>('http://localhost:8085/api/user-profile/me', { headers })
      .subscribe({
        next: (userData) => {
          console.log('✅ Profil chargé depuis /api/user-profile/me:', userData);
          console.log('📧 Email:', userData.email);
          console.log('👤 Username:', userData.username);
          console.log('🎭 Role:', userData.role);
          
          this.user = {
            id: userData.id || '',
            username: userData.username || '',
            email: userData.email || '',
            roles: userData.roles || [userData.role] || [],
            firstName: userData.firstName || userData.username || '',
            lastName: userData.lastName || '',
            profileImage: userData.profileImage || ''
          };
          this.originalUser = { ...this.user };
          
          console.log('✅ User object créé:', this.user);
        },
        error: (error) => {
          console.error('❌ Erreur chargement profil:', error);
          console.error('📋 Détails erreur:', error.error);
          console.error('🔢 Status code:', error.status);
          
          // Fallback: utiliser les données du localStorage
          console.log('⚠️ Fallback: utilisation du localStorage');
          this.user = this.authService.getCurrentUser();
          console.log('📦 User depuis localStorage:', this.user);
          
          if (this.user) {
            this.originalUser = { ...this.user };
          }
        }
      });
  }

  onSubmit(): void {
    if (!this.user) return;

    this.isLoading = true;
    
    // Update user profile locally
    if (this.originalUser) {
      this.user = {
        ...this.user,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email
      };
      
      // Update in auth service
      this.authService.updateUserProfileImage(this.user.profileImage || '');
      
      this.snackBar.open('Profil mis à jour avec succès', 'Fermer', {
        duration: 3000
      });
      this.isLoading = false;
    }
  }

  resetForm(): void {
    if (this.originalUser) {
      this.user = { ...this.originalUser };
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN': return 'Administrateur';
      case 'ROLE_SUPER_ADMIN': return 'Super Administrateur';
      case 'ROLE_PROJECT_MANAGER': return 'Chef de Projet';
      case 'ROLE_COMMERCIAL': return 'Commercial';
      case 'ROLE_DECISION_MAKER': return 'Décideur';
      case 'ROLE_USER': return 'Utilisateur';
      default: return role;
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN':
      case 'ROLE_SUPER_ADMIN':
        return 'warn';
      case 'ROLE_PROJECT_MANAGER':
        return 'accent';
      case 'ROLE_COMMERCIAL':
        return 'primary';
      case 'ROLE_DECISION_MAKER':
        return 'primary';
      default:
        return 'primary';
    }
  }

  goBack(): void {
    this.router.navigate([this.authService.getDashboardRouteByRole()]);
  }

  openChangePasswordModal(): void {
    console.log('🔐 Ouverture du modal de changement de mot de passe...');
    
    const dialogRef = this.dialog.open(ChangePasswordModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'change-password-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.snackBar.open('✅ Mot de passe changé avec succès', 'Fermer', { 
          duration: 5000
        });
      }
    });
  }

  load2FAStatus(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>('http://localhost:8085/api/auth/2fa/status', { headers })
      .subscribe({
        next: (response) => {
          this.twoFactorEnabled = response.enabled;
          console.log('🔐 Statut 2FA:', this.twoFactorEnabled ? 'Activé' : 'Désactivé');
        },
        error: (error) => {
          console.error('❌ Erreur chargement statut 2FA:', error);
        }
      });
  }

  open2FAModal(): void {
    console.log('🔐 Ouverture du modal 2FA. État actuel:', this.twoFactorEnabled);
    
    const dialogRef = this.dialog.open(TwoFactorAuthModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'two-factor-dialog',
      data: {
        isEnabled: this.twoFactorEnabled
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.twoFactorEnabled = result.enabled;
        const message = result.enabled 
          ? '✅ Authentification à deux facteurs activée avec succès !' 
          : '✅ Authentification à deux facteurs désactivée';
        this.snackBar.open(message, 'Fermer', { duration: 5000 });
      }
    });
  }
}

