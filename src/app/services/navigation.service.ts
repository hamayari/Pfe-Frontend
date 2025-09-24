import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  /**
   * Redirige l'utilisateur vers son tableau de bord approprié selon son rôle
   */
  navigateToUserDashboard(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const dashboardPath = this.getDashboardPath(user.roles);
    this.router.navigate([dashboardPath]);
  }

  /**
   * Retourne le chemin du tableau de bord selon le rôle principal de l'utilisateur
   */
  getDashboardPath(roles: string[]): string {
    if (!roles || roles.length === 0) {
      return '/home';
    }

    // Priorité des rôles pour la redirection
    const rolePriority = [
      'SUPER_ADMIN',
      'ADMIN', 
      'COMMERCIAL',
      'DECIDEUR',
      'PROJECT_MANAGER',
      'USER'
    ];

    // Trouver le rôle avec la priorité la plus élevée
    for (const role of rolePriority) {
      if (roles.includes(role)) {
        return this.getDashboardByRole(role);
      }
    }

    return '/home';
  }

  /**
   * Retourne le chemin du tableau de bord pour un rôle spécifique
   */
  private getDashboardByRole(role: string): string {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return '/admin-dashboard';
      case 'COMMERCIAL':
        return '/commercial-dashboard';
      case 'DECIDEUR':
        return '/decision-maker-dashboard';
      case 'PROJECT_MANAGER':
        return '/project-manager-dashboard';
      case 'USER':
        return '/user-dashboard';
      default:
        return '/home';
    }
  }

  /**
   * Vérifie si l'utilisateur peut accéder à une route spécifique
   */
  canAccessRoute(route: string): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return false;
    }

    // Logique de vérification des permissions par route
    const routePermissions: { [key: string]: string[] } = {
      '/admin-dashboard': ['SUPER_ADMIN', 'ADMIN'],
      '/commercial-dashboard': ['SUPER_ADMIN', 'ADMIN', 'COMMERCIAL'],
      '/decision-maker-dashboard': ['SUPER_ADMIN', 'ADMIN', 'DECIDEUR'],
      '/project-manager-dashboard': ['SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER'],
      '/user-dashboard': ['SUPER_ADMIN', 'ADMIN', 'USER']
    };

    for (const [routePrefix, allowedRoles] of Object.entries(routePermissions)) {
      if (route.startsWith(routePrefix)) {
        return user.roles.some(role => allowedRoles.includes(role));
      }
    }

    return true; // Routes publiques
  }

  /**
   * Retourne les éléments de navigation disponibles pour l'utilisateur actuel
   */
  getNavigationItems(): any[] {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return [];
    }

    const items = [];

    // Éléments communs
    items.push({
      label: 'Accueil',
      icon: 'home',
      route: '/home',
      roles: ['*']
    });

    // Éléments selon les rôles
    if (user.roles.includes('SUPER_ADMIN') || user.roles.includes('ADMIN')) {
      items.push(
        {
          label: 'Tableau de bord Admin',
          icon: 'dashboard',
          route: '/admin-dashboard',
          roles: ['SUPER_ADMIN', 'ADMIN']
        },
        {
          label: 'Gestion des utilisateurs',
          icon: 'people',
          route: '/admin/users',
          roles: ['SUPER_ADMIN', 'ADMIN']
        },
        {
          label: 'Monitoring',
          icon: 'monitor',
          route: '/admin/monitoring',
          roles: ['SUPER_ADMIN', 'ADMIN']
        }
      );
    }

    if (user.roles.includes('COMMERCIAL')) {
      items.push(
        {
          label: 'Tableau de bord Commercial',
          icon: 'business',
          route: '/commercial-dashboard',
          roles: ['COMMERCIAL']
        },
        {
          label: 'Conventions',
          icon: 'description',
          route: '/commercial/conventions',
          roles: ['COMMERCIAL']
        },
        {
          label: 'Factures',
          icon: 'receipt',
          route: '/commercial/invoices',
          roles: ['COMMERCIAL']
        }
      );
    }

    if (user.roles.includes('DECIDEUR')) {
      items.push(
        {
          label: 'Tableau de bord Décisionnel',
          icon: 'analytics',
          route: '/decision-maker-dashboard',
          roles: ['DECIDEUR']
        },
        {
          label: 'Rapports',
          icon: 'assessment',
          route: '/decision-maker/reports',
          roles: ['DECIDEUR']
        }
      );
    }

    if (user.roles.includes('PROJECT_MANAGER')) {
      items.push(
        {
          label: 'Tableau de bord Projet',
          icon: 'project',
          route: '/project-manager-dashboard',
          roles: ['PROJECT_MANAGER']
        },
        {
          label: 'Gestion des projets',
          icon: 'folder',
          route: '/project-manager/projects',
          roles: ['PROJECT_MANAGER']
        }
      );
    }

    // Éléments communs pour tous les utilisateurs connectés
    items.push(
      {
        label: 'Profil',
        icon: 'person',
        route: '/profile',
        roles: ['*']
      },
      {
        label: 'Messagerie',
        icon: 'chat',
        route: '/messaging',
        roles: ['*']
      },
      {
        label: 'Notifications',
        icon: 'notifications',
        route: '/notifications',
        roles: ['*']
      }
    );

    return items;
  }

  /**
   * Redirige vers la page de connexion avec l'URL de retour
   */
  redirectToLogin(returnUrl?: string): void {
    if (returnUrl) {
      localStorage.setItem('redirectUrl', returnUrl);
    }
    this.router.navigate(['/login']);
  }

  /**
   * Redirige vers l'URL de retour après connexion
   */
  redirectAfterLogin(): void {
    const returnUrl = localStorage.getItem('redirectUrl');
    if (returnUrl) {
      localStorage.removeItem('redirectUrl');
      this.router.navigateByUrl(returnUrl);
    } else {
      this.navigateToUserDashboard();
    }
  }
}
