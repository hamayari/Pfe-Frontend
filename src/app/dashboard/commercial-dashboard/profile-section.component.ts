import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangePasswordModalComponent } from '../../shared/components/change-password-modal/change-password-modal.component';

@Component({
  selector: 'app-profile-section',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatDividerModule
  ],
  templateUrl: './profile-section.component.html',
  styleUrls: ['./profile-section.component.scss']
})
export class ProfileSectionComponent implements OnInit {
  currentUser: any = null;

  constructor(
    private dialog: MatDialog,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>('http://localhost:8085/api/commercial/dashboard/me', { headers })
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          console.log('✅ Profil utilisateur chargé:', user);
        },
        error: (error) => {
          console.error('❌ Erreur chargement profil:', error);
          // Fallback avec données de base
          this.currentUser = {
            username: 'commercial',
            name: 'Commercial',
            email: 'commercial@example.com',
            role: 'COMMERCIAL'
          };
        }
      });
  }

  openChangePasswordModal(): void {
    const dialogRef = this.dialog.open(ChangePasswordModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'change-password-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        console.log('✅ Mot de passe changé avec succès');
      }
    });
  }

  enable2FA(): void {
    console.log('🔐 Activation de l\'authentification à deux facteurs');
    // TODO: Implémenter l'activation de 2FA
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN':
      case 'ADMIN':
        return 'Administrateur';
      case 'ROLE_SUPER_ADMIN':
      case 'SUPER_ADMIN':
        return 'Super Administrateur';
      case 'ROLE_PROJECT_MANAGER':
      case 'PROJECT_MANAGER':
        return 'Chef de Projet';
      case 'ROLE_COMMERCIAL':
      case 'COMMERCIAL':
        return 'Commercial';
      case 'ROLE_DECISION_MAKER':
      case 'DECISION_MAKER':
      case 'DECIDEUR':
        return 'Décideur';
      case 'ROLE_USER':
      case 'USER':
        return 'Utilisateur';
      default:
        return role;
    }
  }
}
