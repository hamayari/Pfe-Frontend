import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { LoginComponent } from '../auth/login/login.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    LoginComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  showMobileMenu = false;
  showAuthModal = false;
  selectedRole: string | null = null;
  showRolesSection = false;
  
  loginForm = {
    username: '',
    password: ''
  };
  
  showPassword = false;
  isProcessing = false;
  loginAttempts = 0;
  MAX_LOGIN_ATTEMPTS = 3;
  
  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  roles = {
    admin: {
      displayName: 'Administrateur',
      icon: this.getDefaultAvatar('Admin'),
      color: '#3f51b5',
      image: this.getDefaultAvatar('Admin'),
      description: 'Gestion complète du système et des utilisateurs',
      responsibilities: [
        'Gestion des utilisateurs et permissions',
        'Configuration du système',
        'Maintenance et sécurité',
        'Rapports et analytics'
      ],
      dashboardRoute: '/admin-dashboard'
    },
    commercial: {
      displayName: 'Commercial',
      icon: this.getDefaultAvatar('Commercial'),
      color: '#4caf50',
      image: this.getDefaultAvatar('Commercial'),
      description: 'Gestion des clients et développement commercial',
      responsibilities: [
        'Gestion de la clientèle',
        'Suivi des ventes',
        'Prospection et devis',
        'Rapports commerciaux'
      ],
      dashboardRoute: '/commercial-dashboard'
    },
    'project-manager': {
      displayName: 'Chef de Projet',
      icon: this.getDefaultAvatar('Project Manager'),
      color: '#ff9800',
      image: this.getDefaultAvatar('Project Manager'),
      description: 'Coordination et suivi des projets',
      responsibilities: [
        'Planification des projets',
        'Gestion des équipes',
        'Suivi des délais',
        'Coordination des ressources'
      ],
      dashboardRoute: '/project-manager-dashboard'
    },
    'decision-maker': {
      displayName: 'Décideur',
      icon: this.getDefaultAvatar('Decision Maker'),
      color: '#9c27b0',
      image: this.getDefaultAvatar('Decision Maker'),
      description: 'Prise de décisions stratégiques',
      responsibilities: [
        'Analyse des données',
        'Décisions stratégiques',
        'Validation des projets',
        'Gestion des budgets'
      ],
      dashboardRoute: '/decision-maker-dashboard'
    }
  };

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Vérifier si un rôle est passé en paramètre pour ouvrir automatiquement le modal
    this.route.queryParams.subscribe(params => {
      const openLogin = params['openLogin'];
      const role = params['role'];
      
      if (openLogin === 'true' && role) {
        console.log('🔐 Ouverture automatique du modal pour le rôle:', role);
        setTimeout(() => {
          this.openLoginModal(role);
        }, 500);
      }
    });
  }

  // Méthode pour ouvrir le modal de connexion avec le rôle sélectionné
  openLoginModal(role: string) {
    this.selectedRole = role;
    this.showAuthModal = true;
    console.log('🔐 Ouverture du modal de connexion pour le rôle:', role);
  }

  // Méthode pour fermer le modal de connexion
  closeLoginModal() {
    this.showAuthModal = false;
    this.selectedRole = null;
    console.log('🔒 Fermeture du modal de connexion');
  }

  // Méthode pour obtenir l'icône du rôle
  getRoleIcon(role: string): string {
    switch (role) {
      case 'admin':
        return 'admin_panel_settings';
      case 'commercial':
        return 'store';
      case 'project-manager':
        return 'assignment';
      case 'decision-maker':
        return 'gavel';
      default:
        return 'person';
    }
  }

  // Méthode pour obtenir l'espace du rôle
  getRoleSpace(role: string): string {
    switch (role) {
      case 'admin':
        return 'Espace Administrateur';
      case 'commercial':
        return 'Espace Commercial';
      case 'project-manager':
        return 'Espace Chef de Projet';
      case 'decision-maker':
        return 'Espace Décideur';
      default:
        return 'Espace Rôle';
    }
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  // Méthode pour naviguer vers la section des rôles
  navigateToRolesSection(): void {
    this.scrollToSection('roles');
    // Fermer le menu mobile si ouvert
    if (this.showMobileMenu) {
      this.showMobileMenu = false;
    }
  }

  selectRole(role: string): void {
    this.selectedRole = role;
    this.showRolesSection = false;
    this.resetLoginForm();
    this.cdr.detectChanges();
  }

  backToRoleSelection(): void {
    this.selectedRole = null;
    this.showRolesSection = false;
    this.resetLoginForm();
  }

  getRoleDisplayName(role: string): string {
    return this.roles[role as keyof typeof this.roles]?.displayName || role;
  }

  getRoleIconFromRoles(role: string): string {
    return this.roles[role as keyof typeof this.roles]?.icon || this.getDefaultAvatar('User');
  }

  getRoleColor(role: string): string {
    return this.roles[role as keyof typeof this.roles]?.color || '#666';
  }

  getRoleImage(role: string): string {
    return this.roles[role as keyof typeof this.roles]?.image || this.getDefaultAvatar('User');
  }

  getRoleDescription(role: string): string {
    return this.roles[role as keyof typeof this.roles]?.description || '';
  }

  getRoleResponsibilities(role: string): string[] {
    return this.roles[role as keyof typeof this.roles]?.responsibilities || [];
  }

  getRoleDashboardRoute(role: string): string {
    return this.roles[role as keyof typeof this.roles]?.dashboardRoute || '/dashboard';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Méthode pour ouvrir le modal de login avec le rôle sélectionné
  authenticateAsRole(role: string): void {
    console.log(`🚨 === DÉBUT authenticateAsRole ===`);
    console.log(`🚨 Rôle demandé:`, role);
    console.log(`🚨 État initial - showAuthModal:`, this.showAuthModal);
    console.log(`🚨 État initial - selectedRole:`, this.selectedRole);
    
    // Sélectionner le rôle et ouvrir le modal
    this.selectedRole = role;
    this.showAuthModal = true;
    this.resetLoginForm();
    
    console.log(`✅ Après modification - showAuthModal:`, this.showAuthModal);
    console.log(`✅ Après modification - selectedRole:`, this.selectedRole);
    
    // Forcer la détection des changements
    this.cdr.detectChanges();
    
    // Vérifier que le modal est bien visible après un délai
    setTimeout(() => {
      console.log(`🔍 === VÉRIFICATION DU MODAL ===`);
      console.log(`🔍 showAuthModal après timeout:`, this.showAuthModal);
      console.log(`🔍 selectedRole après timeout:`, this.selectedRole);
      
      const modal = document.querySelector('.auth-modal');
      if (modal) {
        console.log(`✅ Modal trouvé dans le DOM:`, modal);
        console.log(`👁️ Classes du modal:`, modal.className);
        console.log(`👁️ Style display:`, window.getComputedStyle(modal).display);
        console.log(`👁️ Style visibility:`, window.getComputedStyle(modal).visibility);
        console.log(`👁️ Style opacity:`, window.getComputedStyle(modal).opacity);
        console.log(`👁️ Style z-index:`, window.getComputedStyle(modal).zIndex);
        
        // Vérifier si le modal a la classe 'active'
        if (modal.classList.contains('active')) {
          console.log(`✅ Modal a la classe 'active'`);
        } else {
          console.log(`❌ Modal n'a PAS la classe 'active'`);
          // Forcer l'ajout de la classe
          modal.classList.add('active');
          console.log(`🔧 Classe 'active' ajoutée manuellement`);
        }
        
        // Focus automatique sur le champ username
        const usernameInput = document.querySelector('#username') as HTMLInputElement;
        if (usernameInput) {
          usernameInput.focus();
          console.log(`🎯 Focus automatique sur le champ username`);
        }
      } else {
        console.log(`❌ Modal NON trouvé dans le DOM`);
        console.log(`🔍 Recherche de tous les éléments avec la classe 'auth-modal':`, document.querySelectorAll('.auth-modal'));
      }
      
      // Vérifier aussi dans le composant Angular
      console.log(`🔍 État du composant - showAuthModal:`, this.showAuthModal);
      console.log(`🔍 État du composant - selectedRole:`, this.selectedRole);
    }, 200);
    
    console.log(`🚨 === FIN authenticateAsRole ===`);
  }

  

  onLoginSubmit(): void {
    if (this.isProcessing || !this.selectedRole) return;
    
    if (this.loginForm.username.trim() === '' || this.loginForm.password.trim() === '') {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    this.performLogin();
  }

  private performLogin(): void {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    this.loginAttempts++;
    
    console.log(`Tentative de connexion ${this.loginAttempts}/${this.MAX_LOGIN_ATTEMPTS} pour le rôle: ${this.selectedRole}`);
    
    // Simulation d'authentification avec timeout de sécurité
    const loginPromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, role: this.selectedRole });
      }, 1000);
    });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 5000);
    });
    
    Promise.race([loginPromise, timeoutPromise])
      .then((result: any) => {
        if (result.success) {
          console.log(`Connexion réussie en tant que ${result.role}`);
          
          // Redirection vers le dashboard approprié
          const dashboardRoute = this.getRoleDashboardRoute(result.role);
          console.log(`Redirection vers: ${dashboardRoute}`);
          
          this.router.navigate([dashboardRoute]);
          this.closeLoginModal();
        }
      })
      .catch((error) => {
        console.error('Erreur de connexion:', error);
        
        if (this.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
          alert('Trop de tentatives de connexion. Veuillez réessayer plus tard.');
          this.isProcessing = false;
          return;
        }
        
        alert(`Échec de la connexion. Tentative ${this.loginAttempts}/${this.MAX_LOGIN_ATTEMPTS}`);
      })
      .finally(() => {
        this.isProcessing = false;
        this.cdr.detectChanges();
      });
  }

  private resetLoginForm(): void {
    this.loginForm = {
      username: '',
      password: ''
    };
    this.showPassword = false;
    this.isProcessing = false;
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    
    // Fermer le menu mobile si ouvert
    if (this.showMobileMenu) {
      this.showMobileMenu = false;
    }
  }

  onSubmitContactForm(): void {
    if (this.isProcessing) return;
    
    console.log('Contact form submitted:', this.contactForm);
    alert('Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.');
    
    // Reset form
    this.contactForm = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
  }

  onNavLinkClick(event: Event, sectionId: string): void {
    event.preventDefault();
    this.scrollToSection(sectionId);
  }

  private keyboardListener: ((event: KeyboardEvent) => void) | null = null;

  private setupKeyboardListeners(): void {
    // Écouter les touches du clavier globalement
    this.keyboardListener = (event: KeyboardEvent) => {
      // Fermer le modal avec la touche Échap
      if (event.key === 'Escape' && this.showAuthModal) {
        this.closeLoginModal();
      }
    };
    
    document.addEventListener('keydown', this.keyboardListener);
  }

  private cleanupKeyboardListeners(): void {
    if (this.keyboardListener) {
      document.removeEventListener('keydown', this.keyboardListener);
      this.keyboardListener = null;
    }
  }

  // Générer un avatar SVG par défaut
  getDefaultAvatar(name: string): string {
    // Générer un avatar SVG par défaut avec les initiales
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const colorIndex = name.length % colors.length;
    const backgroundColor = colors[colorIndex];
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="${backgroundColor}"/>
        <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">${initials}</text>
      </svg>
    `)}`;
  }
}