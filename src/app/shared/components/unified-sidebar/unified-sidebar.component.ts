import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

export interface SidebarItem {
  label?: string;
  icon?: string;
  route?: string;
  children?: SidebarItem[];
  badge?: number;
  divider?: boolean;
  active?: boolean;
  expanded?: boolean;
}

@Component({
  selector: 'app-unified-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './unified-sidebar.component.html',
  styleUrls: ['./unified-sidebar.component.scss']
})
export class UnifiedSidebarComponent {
  @Input() collapsed = false;
  isCollapsed = false;
  @Input() userName = 'Admin User';
  @Input() userRole = 'Administrator';
  @Input() appName = 'GestionPro Admin';
  @Input() notificationCount = 0;
  @Output() collapseChange = new EventEmitter<boolean>();
  @Output() logoutEvent = new EventEmitter<void>();

  sidebarItems: SidebarItem[] = [
    {
      label: 'Administration',
      icon: 'admin_panel_settings',
      children: [
        { label: 'Tableau de Bord', icon: 'dashboard', route: '/admin/dashboard' },
        { label: 'Vue d\'ensemble', icon: 'visibility', route: '/admin/overview' },
        { label: 'Analytique', icon: 'analytics', route: '/admin/analytics' }
      ]
    },
    {
      label: 'Gestion des Utilisateurs',
      icon: 'people',
      children: [
        { label: 'Tous les utilisateurs', icon: 'group', route: '/admin/users', badge: 3 },
        { label: 'Rôles & Permissions', icon: 'security', route: '/admin/roles' },
        { label: 'Journal d\'audit', icon: 'history', route: '/admin/audit-logs' }
      ]
    },
    {
      label: 'Gestion des Nomenclatures',
      icon: 'category',
      children: [
        { label: 'Applications', icon: 'apps', route: '/admin/applications' },
        { label: 'Zones géographiques', icon: 'location_on', route: '/admin/zones' },
        { label: 'Structures', icon: 'business', route: '/admin/structures' }
      ]
    },
    {
      label: 'Monitoring Système',
      icon: 'monitor',
      children: [
        { label: 'Logs système', icon: 'list_alt', route: '/admin/system-logs' },
        { label: 'Alertes', icon: 'warning', route: '/admin/alerts', badge: 2 },
        { label: 'Statistiques serveur', icon: 'speed', route: '/admin/server-stats' }
      ]
    },
    { divider: true },
    {
      label: 'Système',
      icon: 'settings',
      children: [
        { label: 'Utilisateurs', icon: 'person', route: '/system/users' },
        { label: 'Nomenclatures', icon: 'category', route: '/system/nomenclatures' },
        { label: 'Surveillance', icon: 'monitoring', route: '/system/monitoring' },
        { label: 'Rapports', icon: 'assessment', route: '/system/reports' }
      ]
    },
    { divider: true },
    {
      label: 'Profil',
      icon: 'account_circle',
      route: '/profile'
    }
  ];

  toggleCollapse() {
    this.collapsed = !this.collapsed;
    this.collapseChange.emit(this.collapsed);
  }

  isSectionActive(section: SidebarItem): boolean {
    if (!section.children) return false;
    return section.children.some(child => child.active);
  }

  logout() {
    this.logoutEvent.emit();
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.collapsed = this.isCollapsed;
    this.collapseChange.emit(this.collapsed);
  }

  onItemClick(item: SidebarItem) {
    // Handle item click logic
    console.log('Item clicked:', item);
  }
}







