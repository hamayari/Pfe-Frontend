import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectManagerGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.hasRole('ROLE_PROJECT_MANAGER')) {
      return true;
    }
    
    this.router.navigate(['/home']);
    return false;
  }
}





