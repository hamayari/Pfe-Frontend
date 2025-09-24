import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Check if user has any of the required roles
    const hasRequiredRole = user.roles?.some(userRole => requiredRoles.includes(userRole));
    if (hasRequiredRole) {
      return true;
    }

    // Redirect to appropriate dashboard based on user role
    let redirectPath = '/';
    const primaryRole = user.roles?.[0];
    switch (primaryRole) {
      case 'ROLE_ADMIN':
      case 'ROLE_SUPER_ADMIN':
        redirectPath = '/admin-dashboard'; // Éviter la boucle avec /admin
        break;
      case 'ROLE_COMMERCIAL':
        redirectPath = '/commercial-dashboard';
        break;
      case 'ROLE_PROJECT_MANAGER':
        redirectPath = '/project-manager-dashboard';
        break;
      case 'ROLE_DECISION_MAKER':
        redirectPath = '/decision-maker-dashboard';
        break;
      default:
        redirectPath = '/dashboard';
    }

    this.router.navigate([redirectPath]);
    return false;
  }
} 