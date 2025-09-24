import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NavigationService } from '../../../services/navigation.service';

@Component({
  selector: 'app-dashboard-redirect',
  template: `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Redirection vers votre tableau de bord...</p>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    p {
      font-size: 16px;
      margin: 0;
      opacity: 0.9;
    }
  `]
})
export class DashboardRedirectComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService,
    private navigationService: NavigationService
  ) { }

  ngOnInit(): void {
    this.redirectToDashboard();
  }

  redirectToDashboard(): void {
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Attendre un peu pour afficher l'animation de chargement
    setTimeout(() => {
      this.navigationService.navigateToUserDashboard();
    }, 1000);
  }
}
