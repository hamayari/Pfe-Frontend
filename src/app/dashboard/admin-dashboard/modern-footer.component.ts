import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';

interface FooterLink { 
  id: string; 
  label: string; 
  route?: string; 
  icon?: string; 
  external?: boolean; 
  active?: boolean; 
}

interface SystemInfo { 
  type: 'status' | 'version' | 'uptime' | 'memory' | 'storage'; 
  label: string; 
  value: string; 
  icon: string; 
  color?: string; 
}

@Component({
  selector: 'app-modern-footer',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatIconModule, 
    MatButtonModule, 
    MatTooltipModule
  ],
  template: `
    <footer class="modern-footer" [class.dark-theme]="darkTheme" [class.mobile]="isMobile" [class.compact]="isCompact">
      <div class="footer-content">
        <!-- Informations de base -->
        <div class="footer-section">
          <div class="copyright">
            <span>© {{ currentYear }} GestionPro. Tous droits réservés.</span>
          </div>
          
          <div class="version-info">
            <span class="version">v{{ appVersion }}</span>
            <span class="separator">•</span>
            <span class="status" [class]="getSystemStatusClass()">
              <mat-icon>{{ getSystemStatusIcon() }}</mat-icon>
              {{ systemStatus }}
            </span>
          </div>
        </div>

        <!-- Liens utiles -->
        <div class="footer-section" *ngIf="!isCompact">
          <nav class="footer-nav">
            <a *ngFor="let link of footerLinks" 
               [routerLink]="link.route"
               [class.active]="link.active"
               (click)="onLinkClick(link)"
               class="footer-link"
               [matTooltip]="link.label"
               [matTooltipPosition]="'below'">
              
              <mat-icon *ngIf="link.icon">{{ link.icon }}</mat-icon>
              <span>{{ link.label }}</span>
            </a>
          </nav>
        </div>

        <!-- Informations système -->
        <div class="footer-section system-info" *ngIf="!isCompact">
          <div class="info-item" *ngFor="let info of systemInfoItems">
            <mat-icon [style.color]="info.color">{{ info.icon }}</mat-icon>
            <span class="info-label">{{ info.label }}:</span>
            <span class="info-value">{{ info.value }}</span>
          </div>
        </div>

        <!-- Actions rapides -->
        <div class="footer-section actions" *ngIf="!isCompact">
          <button mat-icon-button 
                  (click)="refreshPage()" 
                  matTooltip="Actualiser la page"
                  class="action-btn">
            <mat-icon>refresh</mat-icon>
          </button>
          
          <button mat-icon-button 
                  (click)="showSystemStatus()" 
                  matTooltip="Statut système"
                  class="action-btn">
            <mat-icon>info</mat-icon>
          </button>
          
          <button mat-icon-button 
                  (click)="showAbout()" 
                  matTooltip="À propos"
                  class="action-btn">
            <mat-icon>help</mat-icon>
          </button>
        </div>
      </div>

      <!-- Mode compact - Une seule ligne -->
      <div class="footer-compact" *ngIf="isCompact">
        <div class="compact-content">
          <span class="compact-copyright">© {{ currentYear }} GestionPro v{{ appVersion }}</span>
          <span class="compact-separator">•</span>
          <span class="compact-status" [class]="getSystemStatusClass()">{{ systemStatus }}</span>
          <span class="compact-separator">•</span>
          <button mat-button (click)="showAbout()" class="compact-link">Aide</button>
        </div>
      </div>
    </footer>
  `,
  styleUrls: ['./modern-footer.component.scss']
})
export class ModernFooterComponent implements OnInit {
  @Input() darkTheme: boolean = false;
  @Input() isMobile: boolean = false;
  @Input() isCompact: boolean = false;
  @Output() linkClicked = new EventEmitter<FooterLink>();
  @Output() actionTriggered = new EventEmitter<string>();

  currentYear: number = new Date().getFullYear();
  appVersion: string = '2.1.0';
  systemStatus: string = 'En ligne';
  uptime: string = '24h 32m';
  memoryUsage: string = '68%';
  storageUsage: string = '45%';
  
  footerLinks: FooterLink[] = [
    { id: 'help', label: 'Aide', route: '/help', icon: 'help' },
    { id: 'support', label: 'Support', route: '/support', icon: 'support_agent' },
    { id: 'privacy', label: 'Confidentialité', route: '/privacy', icon: 'security' },
    { id: 'terms', label: 'Conditions', route: '/terms', icon: 'description' }
  ];

  systemInfoItems: SystemInfo[] = [
    { type: 'uptime', label: 'Uptime', value: this.uptime, icon: 'schedule', color: '#4caf50' },
    { type: 'memory', label: 'Mémoire', value: this.memoryUsage, icon: 'memory', color: this.getMemoryUsageColor() },
    { type: 'storage', label: 'Stockage', value: this.storageUsage, icon: 'storage', color: this.getStorageUsageColor() }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.setActiveLink();
    this.updateSystemInfo();
    
    // Mettre à jour les informations système périodiquement
    setInterval(() => {
      this.updateSystemInfo();
    }, 30000); // Toutes les 30 secondes
  }

  /**
   * Définir le lien actif basé sur la route courante
   */
  private setActiveLink(): void {
    const currentRoute = this.router.url;
    
    this.footerLinks.forEach(link => {
      link.active = link.route === currentRoute;
    });
  }

  /**
   * Mettre à jour les informations système
   */
  private updateSystemInfo(): void {
    this.updateUptime();
    this.updateMemoryUsage();
    this.updateStorageUsage();
    
    // Mettre à jour la liste des informations système
    this.systemInfoItems = [
      { type: 'uptime', label: 'Uptime', value: this.uptime, icon: 'schedule', color: '#4caf50' },
      { type: 'memory', label: 'Mémoire', value: this.memoryUsage, icon: 'memory', color: this.getMemoryUsageColor() },
      { type: 'storage', label: 'Stockage', value: this.storageUsage, icon: 'storage', color: this.getStorageUsageColor() }
    ];
  }

  /**
   * Mettre à jour l'uptime
   */
  private updateUptime(): void {
    // Simulation - à remplacer par de vraies données système
    const hours = Math.floor(Math.random() * 48) + 1;
    const minutes = Math.floor(Math.random() * 60);
    this.uptime = `${hours}h ${minutes}m`;
  }

  /**
   * Mettre à jour l'utilisation mémoire
   */
  private updateMemoryUsage(): void {
    // Simulation - à remplacer par de vraies données système
    this.memoryUsage = `${Math.floor(Math.random() * 30) + 50}%`;
  }

  /**
   * Mettre à jour l'utilisation stockage
   */
  private updateStorageUsage(): void {
    // Simulation - à remplacer par de vraies données système
    this.storageUsage = `${Math.floor(Math.random() * 40) + 30}%`;
  }

  /**
   * Gérer le clic sur un lien
   */
  onLinkClick(link: FooterLink): void {
    this.linkClicked.emit(link);
    
    if (link.external) {
      // Ouvrir le lien externe
      window.open(link.route, '_blank');
    } else if (link.route) {
      // Navigation interne
      this.router.navigate([link.route]);
    }
  }

  /**
   * Actualiser la page
   */
  refreshPage(): void {
    this.actionTriggered.emit('refresh');
    window.location.reload();
  }

  /**
   * Afficher le statut système
   */
  showSystemStatus(): void {
    this.actionTriggered.emit('system-status');
    console.log('📊 Statut système:', {
      status: this.systemStatus,
      uptime: this.uptime,
      memory: this.memoryUsage,
      storage: this.storageUsage
    });
  }

  /**
   * Afficher les informations à propos
   */
  showAbout(): void {
    this.actionTriggered.emit('about');
    console.log('ℹ️ À propos de GestionPro v' + this.appVersion);
  }

  /**
   * Obtenir l'icône du statut système
   */
  getSystemStatusIcon(): string {
    return this.systemStatus === 'En ligne' ? 'check_circle' : 'error';
  }

  /**
   * Obtenir la classe CSS du statut système
   */
  getSystemStatusClass(): string {
    return this.systemStatus === 'En ligne' ? 'status-online' : 'status-offline';
  }

  /**
   * Obtenir la couleur de l'utilisation mémoire
   */
  getMemoryUsageColor(): string {
    const usage = parseInt(this.memoryUsage);
    if (usage < 60) return '#4caf50';
    if (usage < 80) return '#ff9800';
    return '#f44336';
  }

  /**
   * Obtenir la couleur de l'utilisation stockage
   */
  getStorageUsageColor(): string {
    const usage = parseInt(this.storageUsage);
    if (usage < 50) return '#4caf50';
    if (usage < 75) return '#ff9800';
    return '#f44336';
  }
}
