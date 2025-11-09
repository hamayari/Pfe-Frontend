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
    redirectTo: '/decideur',
    pathMatch: 'full'
  },
  
  // Routes pour le décideur
  {
    path: 'decideur',
    loadComponent: () => import('./features/decideur-dashboard/decideur-dashboard.component').then(m => m.DecideurDashboardComponent),
    title: 'Dashboard Décideur',
    canActivate: [],
    data: { roles: ['DECISION_MAKER', 'DECIDEUR', 'ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] }
  },
  {
    path: 'decideur/dashboard',
    loadComponent: () => import('./features/decideur-dashboard/decideur-dashboard.component').then(m => m.DecideurDashboardComponent),
    title: 'Dashboard Décideur',
    canActivate: [],
    data: { roles: ['DECISION_MAKER', 'DECIDEUR', 'ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] }
  },
  {
    path: 'decideur/chatbot',
    loadComponent: () => import('./features/chatbot-decideur/chatbot-decideur.component').then(m => m.ChatbotDecideurComponent),
    title: 'Assistant Décisionnel',
    canActivate: [],
    data: { roles: ['DECISION_MAKER', 'DECIDEUR', 'ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] }
  },
  {
    path: 'decideur/operational-chatbot',
    loadComponent: () => import('./features/decideur-dashboard/operational-chatbot/operational-chatbot.component').then(m => m.OperationalChatbotComponent),
    title: 'Assistant Opérationnel',
    canActivate: [],
    data: { roles: ['DECISION_MAKER', 'DECIDEUR', 'ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'COMMERCIAL'] }
  },
  {
    path: 'chatbot-decideur',
    loadComponent: () => import('./features/chatbot-decideur/chatbot-decideur.component').then(m => m.ChatbotDecideurComponent),
    title: 'Assistant Décisionnel',
    canActivate: [],
    data: { roles: ['DECISION_MAKER', 'DECIDEUR', 'ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] }
  },
  
  // Route pour la messagerie
  {
    path: 'messaging',
    loadComponent: () => import('./shared/components/messaging/messaging.component').then(m => m.MessagingComponent),
    title: 'Messagerie'
  },
  
  // Route pour le profil utilisateur
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
    title: 'Mon Profil'
  },
  
  // Route pour la gestion des alertes KPI
  {
    path: 'kpi-alerts',
    loadComponent: () => import('./components/kpi-alert-management/kpi-alert-management.component').then(m => m.KpiAlertManagementComponent),
    title: 'Gestion des Alertes KPI',
    canActivate: [],
    data: { roles: ['PROJECT_MANAGER', 'DECISION_MAKER', 'ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] }
  },
  
  // Route pour la configuration des alertes (Admin)
  {
    path: 'admin/alert-configuration',
    loadComponent: () => import('./features/admin/alert-configuration/alert-configuration.component').then(m => m.AlertConfigurationComponent),
    title: 'Configuration des Alertes',
    canActivate: [],
    data: { roles: ['ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] }
  },
  
  // Routes d'authentification (spécialisées par rôle)
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
    title: 'Connexion',
    data: { role: 'ANY', icon: 'lock' }
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    title: 'Mot de passe oublié'
  },
  {
    path: 'auth/reset-password',
    loadComponent: () => import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    title: 'Réinitialiser le mot de passe'
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