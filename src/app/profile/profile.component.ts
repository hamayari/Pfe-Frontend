import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

import { AuthService, User } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule
  ],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <mat-card-header>
          <mat-card-title>Profil Utilisateur</mat-card-title>
          <mat-card-subtitle>Gérez vos informations personnelles</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form *ngIf="user" (ngSubmit)="onSubmit()" #profileForm="ngForm" class="profile-form">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Prénom</mat-label>
                <input matInput [(ngModel)]="user.firstName" name="firstName" required>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Nom</mat-label>
                <input matInput [(ngModel)]="user.lastName" name="lastName" required>
              </mat-form-field>
            </div>
            
            <mat-form-field appearance="outline">
              <mat-label>Nom d'utilisateur</mat-label>
              <input matInput [(ngModel)]="user.username" name="username" required readonly>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput [(ngModel)]="user.email" name="email" type="email" required>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Rôle</mat-label>
              <input matInput [value]="getRoleLabel(user.roles && user.roles[0] || '')" readonly>
            </mat-form-field>
            
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="isLoading">
                Sauvegarder
              </button>
              <button mat-button type="button" (click)="resetForm()">
                Réinitialiser
              </button>
            </div>
          </form>
          
          <div *ngIf="!user" class="loading-message">
            <p>Chargement du profil...</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .profile-card {
      padding: 20px;
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  originalUser: User | null = null;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.originalUser = { ...this.user };
    }
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
}
