import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface SearchSuggestion { 
  id: string; 
  text: string; 
  icon: string; 
  category: string; 
  route: string; 
}

interface Notification { 
  id: string; 
  title: string; 
  message: string; 
  type: 'success' | 'warning' | 'error' | 'info'; 
  timestamp: Date; 
  read: boolean; 
  route?: string; 
}

@Component({
  selector: 'app-modern-header',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    MatBadgeModule, 
    MatTooltipModule, 
    MatMenuModule, 
    MatDividerModule, 
    MatFormFieldModule, 
    MatInputModule, 
    FormsModule
  ],
  template: `
    <header class="modern-header" [class.dark-theme]="darkTheme">
      <div class="header-content">
        <!-- Section gauche : Titre et icône -->
        <div class="header-left">
          <div class="page-info">
            <mat-icon class="page-icon">{{ pageIcon }}</mat-icon>
            <h1 class="page-title">{{ pageTitle }}</h1>
          </div>
        </div>

        <!-- Section centrale : Recherche globale -->
        <div class="header-center">
          <div class="search-container">
            <mat-form-field class="search-field" appearance="outline">
              <mat-icon matPrefix class="search-icon">search</mat-icon>
              <input matInput 
                     [(ngModel)]="searchQuery"
                     (input)="onSearchInput()"
                     (focus)="onSearchFocus()"
                     (blur)="onSearchBlur()"
                     placeholder="Rechercher utilisateurs, structures, nomenclatures..."
                     class="search-input"
                     #searchInput>
              <mat-icon matSuffix class="search-clear" 
                        *ngIf="searchQuery" 
                        (click)="searchQuery = ''; onSearchInput()">
                clear
              </mat-icon>
            </mat-form-field>

            <!-- Suggestions de recherche -->
            <div class="search-suggestions" 
                 *ngIf="showSearchSuggestions && searchSuggestions.length > 0"
                 [@slideDown]>
              <div class="suggestion-item" 
                   *ngFor="let suggestion of searchSuggestions"
                   (click)="onSuggestionClick(suggestion)">
                <mat-icon class="suggestion-icon">{{ suggestion.icon }}</mat-icon>
                <div class="suggestion-content">
                  <span class="suggestion-text">{{ suggestion.text }}</span>
                  <span class="suggestion-category">{{ suggestion.category }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section droite : Actions et profil -->
        <div class="header-right">
          <!-- Actions rapides -->
          <div class="quick-actions">
            <button mat-raised-button 
                    color="primary" 
                    (click)="addUser()"
                    class="action-btn primary"
                    matTooltip="Ajouter un utilisateur"
                    [matTooltipPosition]="'below'">
              <mat-icon>person_add</mat-icon>
              <span class="action-text">Utilisateur</span>
            </button>
            
            <button mat-raised-button 
                    color="accent" 
                    (click)="addStructure()"
                    class="action-btn accent"
                    matTooltip="Ajouter une structure"
                    [matTooltipPosition]="'below'">
              <mat-icon>business</mat-icon>
              <span class="action-text">Structure</span>
            </button>
            
            <button mat-raised-button 
                    color="warn" 
                    (click)="addNomenclature()"
                    class="action-btn warn"
                    matTooltip="Ajouter une nomenclature"
                    [matTooltipPosition]="'below'">
              <mat-icon>category</mat-icon>
              <span class="action-text">Nomenclature</span>
            </button>
          </div>

          <!-- Notifications (masquées pour admin) -->
          <!-- <button mat-icon-button 
                  [matMenuTriggerFor]="notificationMenu"
                  class="notification-btn"
                  matTooltip="Notifications"
                  [matTooltipPosition]="'below'">
            <mat-icon [matBadge]="unreadNotifications" 
                      [matBadgeHidden]="unreadNotifications === 0" 
                      matBadgeColor="warn">
              notifications
            </mat-icon>
          </button> -->

          <!-- Menu utilisateur -->
          <div class="user-menu">
            <button mat-button 
                    class="user-btn"
                    (click)="toggleUserMenu()"
                    [matMenuTriggerFor]="userMenu">
              
              <div class="user-avatar">
                {{ currentUser.name.charAt(0) }}
              </div>
              
              <div class="user-info" *ngIf="!isMobile">
                <span class="user-name">{{ currentUser.name }}</span>
                <span class="user-role">{{ currentUser.role }}</span>
              </div>
              
              <mat-icon class="user-arrow">expand_more</mat-icon>
            </button>

            <mat-menu #userMenu="matMenu" class="user-dropdown">
              <div class="user-menu-header">
                <div class="user-avatar-large">
                  {{ currentUser.name.charAt(0) }}
                </div>
                <div class="user-details">
                  <h4>{{ currentUser.name }}</h4>
                  <p>{{ currentUser.email }}</p>
                  <span class="user-role-badge">{{ currentUser.role }}</span>
                </div>
              </div>

              <mat-divider></mat-divider>

              <button mat-menu-item (click)="navigateToProfile()">
                <mat-icon>person</mat-icon>
                <span>Mon Profil</span>
              </button>

              <button mat-menu-item (click)="navigateToSettings()">
                <mat-icon>settings</mat-icon>
                <span>Paramètres</span>
              </button>

              <mat-divider></mat-divider>

              <button mat-menu-item (click)="toggleTheme()">
                <mat-icon>{{ darkTheme ? 'light_mode' : 'dark_mode' }}</mat-icon>
                <span>{{ darkTheme ? 'Mode Clair' : 'Mode Sombre' }}</span>
              </button>

              <mat-divider></mat-divider>

              <button mat-menu-item (click)="logout()" class="logout-btn">
                <mat-icon>logout</mat-icon>
                <span>Déconnexion</span>
              </button>
            </mat-menu>
          </div>
        </div>
      </div>
    </header>
  `,
  styleUrls: ['./modern-header.component.scss']
})
export class ModernHeaderComponent implements OnInit {
  @Input() pageTitle: string = 'Dashboard Admin';
  @Input() pageIcon: string = 'dashboard';
  @Input() darkTheme: boolean = false;
  @Output() themeToggle = new EventEmitter<boolean>();
  @Output() actionTriggered = new EventEmitter<string>();

  @ViewChild('searchInput') searchInput!: ElementRef;
  
  searchQuery: string = '';
  showSearchSuggestions: boolean = false;
  showNotificationMenu: boolean = false;
  showUserMenu: boolean = false;
  isMobile: boolean = false;
  
  currentUser: any = { 
    name: 'Admin User', 
    email: 'admin@gestionpro.com', 
    role: 'Administrateur' 
  };
  
  searchSuggestions: SearchSuggestion[] = [
    { id: '1', text: 'Jean Dupont', icon: 'person', category: 'Utilisateur', route: '/admin/users/1' },
    { id: '2', text: 'ABC Corp', icon: 'business', category: 'Structure', route: '/admin/structures/1' },
    { id: '3', text: 'Marketing', icon: 'category', category: 'Nomenclature', route: '/admin/taxonomies/1' },
    { id: '4', text: 'Convention 2024', icon: 'description', category: 'Convention', route: '/admin/conventions/1' }
  ];
  
  notifications: Notification[] = [
    {
      id: '1',
      title: 'Nouvel utilisateur',
      message: 'Jean Dupont a été ajouté au système',
      type: 'success',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      title: 'Alerte système',
      message: 'Utilisation mémoire élevée (85%)',
      type: 'warning',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      title: 'Sauvegarde terminée',
      message: 'Sauvegarde automatique réussie',
      type: 'info',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Fermer les suggestions de recherche
    if (!target.closest('.search-container')) {
      this.showSearchSuggestions = false;
    }
  }

  /**
   * Vérifier la taille de l'écran
   */
  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  /**
   * Gérer l'input de recherche
   */
  onSearchInput(): void {
    this.showSearchSuggestions = this.searchQuery.length > 2;
  }

  /**
   * Gérer le focus sur la recherche
   */
  onSearchFocus(): void {
    if (this.searchQuery.length > 2) {
      this.showSearchSuggestions = true;
    }
  }

  /**
   * Gérer la perte de focus sur la recherche
   */
  onSearchBlur(): void {
    // Délai pour permettre le clic sur les suggestions
    setTimeout(() => {
      this.showSearchSuggestions = false;
    }, 200);
  }

  /**
   * Gérer le clic sur une suggestion
   */
  onSuggestionClick(suggestion: SearchSuggestion): void {
    this.searchQuery = suggestion.text;
    this.showSearchSuggestions = false;
    this.router.navigate([suggestion.route]);
  }

  /**
   * Ajouter un utilisateur
   */
  addUser(): void {
    this.actionTriggered.emit('add-user');
    this.router.navigate(['/admin/users/new']);
  }

  /**
   * Ajouter une structure
   */
  addStructure(): void {
    this.actionTriggered.emit('add-structure');
    this.router.navigate(['/admin/structures/new']);
  }

  /**
   * Ajouter une nomenclature
   */
  addNomenclature(): void {
    this.actionTriggered.emit('add-nomenclature');
    this.router.navigate(['/admin/taxonomies/new']);
  }

  /**
   * Basculer le menu des notifications
   */
  toggleNotificationMenu(): void {
    this.showNotificationMenu = !this.showNotificationMenu;
  }

  /**
   * Gérer le clic sur une notification
   */
  onNotificationClick(notification: Notification): void {
    notification.read = true;
    
    if (notification.route) {
      this.router.navigate([notification.route]);
    }
    
    this.showNotificationMenu = false;
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
  }

  /**
   * Voir toutes les notifications
   */
  viewAllNotifications(): void {
    this.router.navigate(['/admin/notifications']);
    this.showNotificationMenu = false;
  }

  /**
   * Obtenir l'icône de notification
   */
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'notifications';
    }
  }

  /**
   * Obtenir le temps écoulé
   */
  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return timestamp.toLocaleDateString('fr-FR');
  }

  /**
   * Basculer le menu utilisateur
   */
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  /**
   * Fermer le menu utilisateur
   */
  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  /**
   * Naviguer vers le profil
   */
  navigateToProfile(): void {
    this.router.navigate(['/admin/profile']);
    this.closeUserMenu();
  }

  /**
   * Naviguer vers les paramètres
   */
  navigateToSettings(): void {
    this.router.navigate(['/admin/settings']);
    this.closeUserMenu();
  }

  /**
   * Basculer le thème
   */
  toggleTheme(): void {
    this.darkTheme = !this.darkTheme;
    this.themeToggle.emit(this.darkTheme);
    this.closeUserMenu();
  }

  /**
   * Déconnexion
   */
  logout(): void {
    console.log('🚪 Déconnexion...');
    this.router.navigate(['/login']);
  }

  /**
   * Obtenir le nombre de notifications non lues
   */
  get unreadNotifications(): number {
    return this.notifications.filter(n => !n.read).length;
  }
}
