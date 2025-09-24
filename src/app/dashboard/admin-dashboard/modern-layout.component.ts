import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
// import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-modern-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
    // FooterComponent
  ],
  template: `
    <div class="modern-layout" 
         [class.sidebar-collapsed]="sidebarCollapsed"
         [class.dark-theme]="darkTheme">
      
      <!-- Header -->
      <header class="layout-header">
        <ng-content select="[header-content]"></ng-content>
      </header>
      
      <!-- Sidebar -->
      <aside class="layout-sidebar" 
             [class.collapsed]="sidebarCollapsed"
             [class.mobile-open]="mobileSidebarOpen">
        <ng-content select="[sidebar-content]"></ng-content>
      </aside>
      
      <!-- Main Content -->
      <main class="main-content">
        <div class="content-container">
          <ng-content select="[main-content]"></ng-content>
        </div>
      </main>
      
      <!-- Footer -->
      <footer class="layout-footer">
        <!-- <app-footer></app-footer> -->
        <div class="footer-content">
          <p>&copy; 2024 Demo Application. Tous droits réservés.</p>
        </div>
      </footer>
      
      <!-- Mobile Sidebar Toggle -->
      <button class="sidebar-toggle" 
              (click)="toggleMobileSidebar()"
              *ngIf="isMobile"
              [attr.aria-label]="mobileSidebarOpen ? 'Fermer la navigation' : 'Ouvrir la navigation'">
        <mat-icon>{{ mobileSidebarOpen ? 'close' : 'menu' }}</mat-icon>
      </button>
      
      <!-- Mobile Overlay -->
      <div class="sidebar-overlay" 
           [class.active]="mobileSidebarOpen"
           (click)="closeMobileSidebar()"
           *ngIf="isMobile"></div>
    </div>
  `,
  styleUrls: ['./modern-layout.component.scss']
})
export class ModernLayoutComponent implements OnInit {
  @Input() darkTheme: boolean = false;
  @Input() sidebarCollapsed: boolean = false;
  @Output() sidebarToggle = new EventEmitter<boolean>();
  @Output() themeToggle = new EventEmitter<boolean>();

  isMobile: boolean = false;
  mobileSidebarOpen: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkScreenSize();
  }

  /**
   * Vérifier la taille de l'écran et ajuster le comportement
   */
  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
    
    // Fermer la sidebar mobile si on passe en desktop
    if (!this.isMobile && this.mobileSidebarOpen) {
      this.mobileSidebarOpen = false;
    }
  }

  /**
   * Basculer la sidebar mobile
   */
  toggleMobileSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  /**
   * Fermer la sidebar mobile
   */
  closeMobileSidebar(): void {
    this.mobileSidebarOpen = false;
  }

  /**
   * Basculer la sidebar (desktop)
   */
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.sidebarToggle.emit(this.sidebarCollapsed);
  }

  /**
   * Basculer le thème
   */
  toggleTheme(): void {
    this.darkTheme = !this.darkTheme;
    this.themeToggle.emit(this.darkTheme);
  }
}













