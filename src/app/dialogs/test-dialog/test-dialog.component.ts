import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, User } from '../../core/services/auth.service';
import { AdminDashboardService } from '../../services/admin-dashboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-test-dialog',
  templateUrl: './test-dialog.component.html',
  styleUrls: ['./test-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class TestDialogComponent implements OnInit {
  isAuthenticated = false;
  currentUser: User | null = null;

  constructor(
    public dialogRef: MatDialogRef<TestDialogComponent>,
    private authService: AuthService,
    private adminDashboardService: AdminDashboardService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.currentUserValue;
  }

  testLogin() {
    this.authService.login('admin', 'password').subscribe({
      next: (user) => {
        this.checkAuthStatus();
        this.snackBar.open('✅ Connexion réussie !', 'Fermer', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('❌ Erreur de connexion', 'Fermer', { duration: 3000 });
      }
    });
  }

  testLogout() {
    this.authService.logout();
    this.checkAuthStatus();
    this.snackBar.open('✅ Déconnexion réussie !', 'Fermer', { duration: 3000 });
  }

  testAPI() {
    this.adminDashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.snackBar.open('✅ API Admin accessible !', 'Fermer', { duration: 3000 });
        console.log('📊 Stats admin:', stats);
      },
      error: (error) => {
        this.snackBar.open(`❌ Erreur API: ${error.status}`, 'Fermer', { duration: 3000 });
        console.error('❌ Erreur API admin:', error);
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}

