import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CompleteAdminDashboardComponent } from './dashboard/admin-dashboard/complete-admin-dashboard.component';

export const routes: Routes = [
  // Page d'accueil principale
  {
    path: '',
    component: HomeComponent,
    title: 'Accueil - Gestion Pro'
  },
  {
    path: 'home',
    component: HomeComponent,
    title: 'Accueil - Gestion Pro'
  },
  
  // Routes pour l'administration
  {
    path: 'admin',
    component: CompleteAdminDashboardComponent,
    title: 'Admin Dashboard Complet',
    canActivate: [],
    data: { roles: ['ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] }
  },
  {
    path: 'admin-dashboard',
    component: CompleteAdminDashboardComponent,
    title: 'Admin Dashboard',
    canActivate: [],
    data: { roles: ['ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] }
  },
  
  // Routes pour les autres dashboards
  {
    path: 'commercial-dashboard',
    loadComponent: () => import('./dashboard/commercial-dashboard/commercial-dashboard.component').then(m => m.CommercialDashboardComponent),
    title: 'Dashboard Commercial'
  },
  {
    path: 'project-manager-dashboard',
    loadComponent: () => import('./dashboard/project-manager-dashboard/project-manager-dashboard.component').then(m => m.ProjectManagerDashboardComponent),
    title: 'Dashboard Chef de Projet'
  },
  {
    path: 'decision-maker-dashboard',
    loadComponent: () => import('./dashboard/decision-maker-dashboard/decision-maker-dashboard.component').then(m => m.DecisionMakerDashboardComponent),
    title: 'Dashboard Décideur'
  },
  
  // Route pour la messagerie
  {
    path: 'messaging',
    loadComponent: () => import('./shared/components/messaging/messaging.component').then(m => m.MessagingComponent),
    title: 'Messagerie'
  },
  
  // Routes d'authentification (spécialisées par rôle)
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
    title: 'Connexion',
    data: { role: 'ANY', icon: 'lock' }
  },
  {
    path: 'auth/login-admin',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
    title: 'Connexion Administrateur',
    data: { role: 'ADMIN', icon: 'admin_panel_settings', label: 'Connexion Administrateur' }
  },
  {
    path: 'auth/login-commercial',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
    title: 'Connexion Commercial',
    data: { role: 'COMMERCIAL', icon: 'store', label: 'Connexion Commercial' }
  },
  {
    path: 'auth/login-project-manager',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
    title: 'Connexion Chef de Projet',
    data: { role: 'PROJECT_MANAGER', icon: 'assignment', label: 'Connexion Chef de Projet' }
  },
  {
    path: 'auth/login-decision-maker',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
    title: 'Connexion Décideur',
    data: { role: 'DECISION_MAKER', icon: 'gavel', label: 'Connexion Décideur' }
  },
  
  // Redirection par défaut vers la page d'accueil
  {
    path: '**',
    redirectTo: '/home',
    pathMatch: 'full'
  }
];