import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  {
    path: 'messaging',
    loadComponent: () => import('./shared/components/messaging/messaging.component').then(m => m.MessagingComponent),
    data: { title: 'Messagerie' }
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
    data: { title: 'Mon Profil' }
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./shared/components/dashboard-redirect/dashboard-redirect.component').then(m => m.DashboardRedirectComponent),
    data: { title: 'Dashboard' }
  },
  { 
    path: 'users', 
    loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule),
    data: { 
      title: 'User Management',
      breadcrumb: 'Users'
    }
  },
  // Routes des dashboards par rôle - Utilisation directe des composants standalone
  { 
    path: 'admin-dashboard', 
    loadComponent: () => import('./dashboard/admin-dashboard/complete-admin-dashboard.component').then(m => m.CompleteAdminDashboardComponent),
    data: { title: 'Dashboard Administrateur' }
  },
  { 
    path: 'commercial-dashboard', 
    loadComponent: () => import('./dashboard/commercial-dashboard/commercial-dashboard.component').then(m => m.CommercialDashboardComponent),
    data: { title: 'Dashboard Commercial' }
  },
  { 
    path: 'project-manager-dashboard', 
    loadComponent: () => import('./dashboard/project-manager-dashboard/project-manager-dashboard.component').then(m => m.ProjectManagerDashboardComponent),
    data: { title: 'Dashboard Chef de Projet' }
  },
  { 
    path: 'decision-maker-dashboard', 
    loadComponent: () => import('./dashboard/decision-maker-dashboard/decision-maker-dashboard.component').then(m => m.DecisionMakerDashboardComponent),
    data: { title: 'Dashboard Décideur' }
  },
  // Add more feature modules here
  { 
    path: '**', 
    redirectTo: '/dashboard',
    pathMatch: 'full' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { 
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }