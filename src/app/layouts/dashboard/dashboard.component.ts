import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService, User } from '../../services/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

interface NavSection {
  section?: string; // Titre de section optionnel
  items: NavItem[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  userName: string = '';
  userRole: string = '';
  navSections: NavSection[] = [];

  isLoading = false;
  dataSource = { data: [] };

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    public router: Router
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.userName = user.firstName ? `${user.firstName} ${user.lastName}` : user.username;
        this.userRole = this.getRoleLabel(user.roles?.[0] || '');
        this.buildNavSections();
      }
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.firstName ? `${user.firstName} ${user.lastName}` : user.username;
        this.userRole = user.roles?.[0] || '';
        this.buildNavSections();
      }
    });
  }

  buildNavSections(): void {
    const role = this.currentUser?.roles?.[0];
    console.log('User:', this.currentUser);
    console.log('Role:', role);

    // Affiche le rôle détecté dans la sidebar pour debug
    if (!role) {
      this.navSections = [
        { section: undefined, items: [
          { path: '/admin-dashboard', label: 'Tableau de Bord (DEBUG)', icon: 'dashboard' },
          { path: '/admin/users', label: 'Gestion des Utilisateurs', icon: 'people' },
          { path: '/admin/nomenclatures', label: 'Gestion des Nomenclatures', icon: 'category' },
          { path: '/admin/monitoring', label: 'Monitoring Système', icon: 'monitor_heart' },
          { path: '/profile', label: 'Mon Profil', icon: 'account_circle' },
          { path: '#', label: 'Rôle détecté: ' + String(role), icon: 'info' }
        ]}
      ];
      return;
    }

    switch (role) {
      case 'ROLE_ADMIN':
      case 'ROLE_SUPER_ADMIN':
        this.navSections = [
          { section: 'Administration', items: [
            { path: '/admin-dashboard', label: 'Tableau de Bord', icon: 'dashboard' },
            { path: '/admin/users', label: 'Gestion des Utilisateurs', icon: 'people' },
            { path: '/admin/nomenclatures', label: 'Gestion des Nomenclatures', icon: 'category' },
            { path: '/admin/monitoring', label: 'Monitoring Système', icon: 'monitor_heart' }
          ]},
          { section: 'Système', items: [
            { path: '/user-management', label: 'Utilisateurs', icon: 'manage_accounts' },
            { path: '/nomenclature-management', label: 'Nomenclatures', icon: 'inventory' },
            { path: '/monitoring-system', label: 'Surveillance', icon: 'monitoring' },
            { path: '/reports', label: 'Rapports', icon: 'assessment' }
          ]},
          { section: 'Profil', items: [
            { path: '/profile', label: 'Mon Profil', icon: 'account_circle' }
          ]}
        ];
        break;
      case 'ROLE_PROJECT_MANAGER':
        this.navSections = [
          { section: 'Gestion de Projet', items: [
            { path: '/project-manager-dashboard', label: 'Tableau de Bord', icon: 'dashboard' },
            { path: '/invoice-management', label: 'Gestion Factures', icon: 'request_quote' },
            { path: '/messaging', label: 'Messagerie', icon: 'chat' },
            { path: '/notification-settings', label: 'Notifications', icon: 'notifications' }
          ]},
          { section: 'Rapports', items: [
            { path: '/reports', label: 'Rapports', icon: 'assessment' },
            { path: '/exports', label: 'Exports', icon: 'cloud_download' }
          ]},
          { section: 'Profil', items: [
            { path: '/profile', label: 'Mon Profil', icon: 'account_circle' }
          ]}
        ];
        break;
      case 'ROLE_DECISION_MAKER':
        this.navSections = [
          { section: 'Vue d\'ensemble', items: [
            { path: '/decision-maker-dashboard', label: 'Tableau de Bord', icon: 'dashboard' },
            { path: '/reports', label: 'Rapports Exécutifs', icon: 'assessment' },
            { path: '/monitoring-system', label: 'Surveillance', icon: 'visibility' }
          ]},
          { section: 'Profil', items: [
            { path: '/profile', label: 'Mon Profil', icon: 'account_circle' }
          ]}
        ];
        break;
      case 'ROLE_COMMERCIAL':
        this.navSections = [
          { section: 'Commercial', items: [
            { path: '/commercial-dashboard', label: 'Tableau de Bord', icon: 'dashboard' },
            { path: '/invoice-management', label: 'Gestion Factures', icon: 'receipt_long' },
            { path: '/paiement', label: 'Suivi Paiements', icon: 'payments' },
            { path: '/payment-proofs', label: 'Preuves de Paiement', icon: 'cloud_upload' }
          ]},
          { section: 'Outils', items: [
            { path: '/exports', label: 'Exports', icon: 'cloud_download' },
            { path: '/messaging', label: 'Messagerie', icon: 'chat' }
          ]},
          { section: 'Client', items: [
            { path: '/client-space', label: 'Espace Client', icon: 'person' }
          ]},
          { section: 'Profil', items: [
            { path: '/profile', label: 'Mon Profil', icon: 'account_circle' }
          ]}
        ];
        break;
      default:
        this.navSections = [
          { section: undefined, items: [
            { path: '/dashboard', label: 'Tableau de Bord', icon: 'dashboard' },
            { path: '/profile', label: 'Mon Profil', icon: 'account_circle' }
          ]}
        ];
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

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}
