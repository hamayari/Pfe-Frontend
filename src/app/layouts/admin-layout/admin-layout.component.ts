import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject, map, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { NotificationService } from '../../core/services/notification.service';
import { ModernSidebarComponent } from '../../dashboard/admin-dashboard/modern-sidebar.component';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
  children?: MenuItem[];
  badge?: number;
  badgeColor?: string;
  requiredRole?: string[];
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    ModernSidebarComponent
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  isHandset$: Observable<boolean> = this.breakpointObserver.observe([
    Breakpoints.Handset,
    Breakpoints.TabletPortrait
  ]).pipe(
    map(result => result.matches)
  );

  isSidebarOpen = true;
  sidebarCollapsed = false;
  currentUser: User | null = null;
  unreadNotificationsCount = 0;
  
  menuItems: MenuItem[] = [
    {
      title: 'Tableau de bord',
      icon: 'dashboard',
      route: '/admin/dashboard'
    },
    {
      title: 'Utilisateurs',
      icon: 'people',
      route: '/admin/users',
      requiredRole: ['ADMIN', 'SUPER_ADMIN']
    },
    {
      title: 'Rôles & Permissions',
      icon: 'admin_panel_settings',
      route: '/admin/roles',
      requiredRole: ['SUPER_ADMIN']
    },
    {
      title: 'Contenu',
      icon: 'article',
      route: '/admin/content',
      children: [
        { title: 'Articles', icon: 'article', route: '/admin/content/articles' },
        { title: 'Catégories', icon: 'category', route: '/admin/content/categories' },
        { title: 'Médias', icon: 'photo_library', route: '/admin/content/media' },
      ]
    },
    {
      title: 'Conventions',
      icon: 'description',
      route: '/admin/conventions',
      badge: 5,
      badgeColor: 'warn'
    },
    {
      title: 'Factures',
      icon: 'receipt',
      route: '/admin/invoices',
      badge: 2,
      badgeColor: 'accent'
    },
    {
      title: 'Rapports',
      icon: 'analytics',
      route: '/admin/reports',
      children: [
        { title: 'Ventes', icon: 'show_chart', route: '/admin/reports/sales' },
        { title: 'Utilisateurs', icon: 'people', route: '/admin/reports/users' },
        { title: 'Système', icon: 'computer', route: '/admin/reports/system' },
      ]
    },
    {
      title: 'Paramètres',
      icon: 'settings',
      route: '/admin/settings',
      children: [
        { title: 'Général', icon: 'tune', route: '/admin/settings/general' },
        { title: 'Email', icon: 'email', route: '/admin/settings/email' },
        { title: 'Sécurité', icon: 'security', route: '/admin/settings/security' },
        { title: 'API', icon: 'api', route: '/admin/settings/api' },
      ]
    }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: any) => {
        this.currentUser = user;
      });

    // Subscribe to unread notifications count
    this.notificationService.getUnreadCount(this.currentUser?.id || '')
      .pipe(takeUntil(this.destroy$))
      .subscribe((count: any) => {
        this.unreadNotificationsCount = count;
      });

    // Check screen size on init
    this.isHandset$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isHandset => {
        this.isSidebarOpen = !isHandset;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onToggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onNavigationChange(section: string): void {
    console.log('Navigation changed to:', section);
    // Handle navigation change if needed
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  hasRole(requiredRoles?: string[]): boolean {
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    if (!this.currentUser) {
      return false;
    }
    
    return requiredRoles.some(role => this.currentUser?.role === role);
  }

  // Filter menu items based on user role
  get filteredMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => this.hasRole(item.requiredRole));
  }
}
