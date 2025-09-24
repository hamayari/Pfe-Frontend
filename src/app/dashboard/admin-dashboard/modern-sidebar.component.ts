import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';

interface NavItem { 
  id: string; 
  label: string; 
  icon: string; 
  route?: string; 
  badge?: number; 
  active?: boolean; 
  expanded?: boolean; 
  subItems?: NavItem[]; 
}

interface NavSection { 
  label: string; 
  items: NavItem[]; 
}

@Component({
  selector: 'app-modern-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    MatBadgeModule, 
    MatTooltipModule, 
    MatMenuModule, 
    MatDividerModule
  ],
  template: `
    <div class="modern-sidebar" [class.collapsed]="collapsed" [class.dark-theme]="darkTheme">
      <!-- Logo et Titre -->
      <div class="sidebar-header">
        <div class="logo-container">
          <mat-icon class="logo-icon">admin_panel_settings</mat-icon>
          <h2 class="logo-text" *ngIf="!collapsed">GestionPro</h2>
        </div>
      </div>

      <!-- Navigation par Sections -->
      <nav class="sidebar-nav">
        <div class="nav-section" *ngFor="let section of navSections">
          <h3 class="section-title" *ngIf="!collapsed">{{ section.label }}</h3>
          
          <ul class="nav-items">
            <li *ngFor="let item of section.items" 
                class="nav-item" 
                [class.active]="item.active"
                [class.has-subitems]="item.subItems && item.subItems.length > 0">
              
              <button class="nav-button" 
                      (click)="onNavItemClick(item)"
                      [matTooltip]="collapsed ? item.label : ''"
                      [matTooltipPosition]="'right'"
                      [matTooltipDisabled]="!collapsed">
                
                <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
                
                <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
                
                <mat-icon *ngIf="item.badge && !collapsed" 
                          class="badge-icon" 
                          [matBadge]="item.badge" 
                          matBadgeColor="warn">
                  notifications
                </mat-icon>
                
                <mat-icon *ngIf="item.subItems && item.subItems.length > 0 && !collapsed" 
                          class="expand-icon"
                          [class.expanded]="item.expanded">
                  expand_more
                </mat-icon>
              </button>
              
              <!-- Sous-éléments -->
              <ul class="sub-items" *ngIf="item.subItems && item.subItems.length > 0 && !collapsed && item.expanded">
                <li *ngFor="let subItem of item.subItems" 
                    class="sub-item"
                    [class.active]="subItem.active">
                  
                  <button class="sub-button" 
                          (click)="onNavItemClick(subItem)"
                          [matTooltip]="subItem.label"
                          [matTooltipPosition]="'right'">
                    
                    <mat-icon class="sub-icon">{{ subItem.icon }}</mat-icon>
                    <span class="sub-label">{{ subItem.label }}</span>
                    
                    <mat-icon *ngIf="subItem.badge" 
                              class="badge-icon" 
                              [matBadge]="subItem.badge" 
                              matBadgeColor="warn">
                      notifications
                    </mat-icon>
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Actions Rapides -->
      <div class="sidebar-actions" *ngIf="!collapsed">
        <mat-divider></mat-divider>
        <h3 class="actions-title">Actions Rapides</h3>
        
        <div class="quick-actions">
          <button mat-mini-fab 
                  color="primary" 
                  (click)="onQuickAction('add-user')"
                  matTooltip="Ajouter un utilisateur">
            <mat-icon>person_add</mat-icon>
          </button>
          
          <button mat-mini-fab 
                  color="accent" 
                  (click)="onQuickAction('add-structure')"
                  matTooltip="Ajouter une structure">
            <mat-icon>business</mat-icon>
          </button>
          
          <button mat-mini-fab 
                  color="warn" 
                  (click)="onQuickAction('add-nomenclature')"
                  matTooltip="Ajouter une nomenclature">
            <mat-icon>category</mat-icon>
          </button>
        </div>
      </div>

      <!-- Toggle Sidebar -->
      <div class="sidebar-toggle">
        <button mat-icon-button 
                (click)="onToggleCollapse()" 
                matTooltip="Réduire/Étendre la navigation">
          <mat-icon>{{ collapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./modern-sidebar.component.scss']
})
export class ModernSidebarComponent implements OnInit {
  @Input() collapsed: boolean = false;
  @Input() darkTheme: boolean = false;
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() navigationChange = new EventEmitter<string>();

  navSections: NavSection[] = [
    {
      label: 'ADMINISTRATION',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard', active: true },
        { id: 'overview', label: 'Vue d\'ensemble', icon: 'visibility', route: '/admin/overview' }
      ]
    },
    {
      label: 'UTILISATEURS',
      items: [
        { id: 'users', label: 'Gestion Utilisateurs', icon: 'people', route: '/admin/users', badge: 3 },
        { id: 'roles', label: 'Gestion Rôles', icon: 'security', route: '/admin/roles' },
        { id: 'permissions', label: 'Permissions', icon: 'lock', route: '/admin/permissions' }
      ]
    },
    {
      label: 'NOMENCLATURES',
      items: [
        { id: 'taxonomies', label: 'Taxonomies', icon: 'category', route: '/admin/taxonomies' },
        { id: 'structures', label: 'Structures', icon: 'business', route: '/admin/structures' },
        { id: 'conventions', label: 'Conventions', icon: 'description', route: '/admin/conventions' }
      ]
    },
    {
      label: 'SURVEILLANCE',
      items: [
        { id: 'alerts', label: 'Alertes', icon: 'notifications', route: '/admin/alerts', badge: 5 },
        { id: 'monitoring', label: 'Monitoring', icon: 'monitor', route: '/admin/monitoring' },
        { id: 'logs', label: 'Journaux', icon: 'article', route: '/admin/logs' }
      ]
    },
    {
      label: 'RAPPORTS',
      items: [
        { id: 'analytics', label: 'Analytics', icon: 'analytics', route: '/admin/analytics' },
        { id: 'exports', label: 'Exports', icon: 'download', route: '/admin/exports' },
        { id: 'statistics', label: 'Statistiques', icon: 'bar_chart', route: '/admin/statistics' }
      ]
    },
    {
      label: 'PARAMÈTRES',
      items: [
        { id: 'settings', label: 'Configuration', icon: 'settings', route: '/admin/settings' },
        { id: 'system', label: 'Système', icon: 'build', route: '/admin/system' },
        { id: 'backup', label: 'Sauvegarde', icon: 'backup', route: '/admin/backup' }
      ]
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.setActiveLink();
  }

  /**
   * Définir le lien actif basé sur la route courante
   */
  private setActiveLink(): void {
    const currentRoute = this.router.url;
    
    this.navSections.forEach(section => {
      section.items.forEach(item => {
        item.active = item.route === currentRoute;
        
        if (item.subItems) {
          item.subItems.forEach(subItem => {
            subItem.active = subItem.route === currentRoute;
          });
        }
      });
    });
  }

  /**
   * Gérer le clic sur un élément de navigation
   */
  onNavItemClick(item: NavItem): void {
    if (item.subItems && item.subItems.length > 0) {
      // Basculer l'expansion des sous-éléments
      item.expanded = !item.expanded;
    } else if (item.route) {
      // Naviguer vers la route
      this.router.navigate([item.route]);
      this.navigationChange.emit(item.id);
    }
  }

  /**
   * Gérer les actions rapides
   */
  onQuickAction(action: string): void {
    console.log(`🚀 Action rapide: ${action}`);
    
    switch (action) {
      case 'add-user':
        this.router.navigate(['/admin/users/new']);
        break;
      case 'add-structure':
        this.router.navigate(['/admin/structures/new']);
        break;
      case 'add-nomenclature':
        this.router.navigate(['/admin/taxonomies/new']);
        break;
    }
  }

  /**
   * Basculer la réduction de la sidebar
   */
  onToggleCollapse(): void {
    this.toggleCollapse.emit();
  }
}
