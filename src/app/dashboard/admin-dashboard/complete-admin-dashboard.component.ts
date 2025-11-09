import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// AdminDashboardService supprimé - nous utilisons uniquement les vraies données
import { UserService } from '../../services/user.service';
import { StructureService } from '../../services/structure.service';
import { AuthService } from '../../services/auth.service';
import { SimpleAuthService } from '../../services/simple-auth.service';
import { ApplicationService } from '../../services/application.service';
import { ZoneGeographiqueService } from '../../services/zone-geographique.service';
import { GovernmentApiService, Governorate } from '../../services/government-api.service';
import { NotificationHistoryComponent } from '../../shared/components/notification-history/notification-history.component';
import { Application } from '../../models/application.model';
import { ZoneGeographique } from '../../models/zone-geographique.model';
import { UserUtils, USER_ROLES, USER_STATUSES } from '../../models/user.model';
// import { FooterComponent } from '../../shared/components/footer/footer.component';

// Import Chart.js
import Chart from 'chart.js/auto';

// Interfaces
interface KPICard {
  id: string;
  title: string;
  value: number;
  unit?: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  icon: string;
  breakdown?: { label: string; value: number; color: string }[];
}

interface User {
  id: string;
  username?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  roles?: string[];
  status: 'active' | 'pending' | 'inactive' | 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  lastLogin?: Date;
  createdAt: Date | string;
  avatar?: string;
  enabled?: boolean;
  emailVerified?: boolean;
  phoneNumber?: string;
  country?: string;
}

interface Structure {
  id: string;
  code: string;
  libelle: string;
  description: string;
  typeStructure: string;
  adresse: string;
  zoneGeographiqueId: string;
  gouvernement?: string; // Nouveau champ gouvernement
  governorate?: string; // Pour l'affichage frontend
  contactPerson?: string; // Pour l'affichage frontend
  phone?: string; // Pour l'affichage frontend
  email?: string; // Pour l'affichage frontend
  actif: boolean;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: Date;
  lastModifiedAt?: Date;
}

interface Convention {
  id: string;
  reference: string;
  label: string;
  structure: string;
  governorate: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'pending' | 'expired';
  amount: number;
}

@Component({
  selector: 'app-complete-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    NotificationHistoryComponent,
    // FooterComponent,
  ],
  templateUrl: './complete-admin-dashboard.component.html',
  styleUrls: ['./complete-admin-dashboard.component.scss', './profile-simple.styles.scss', './profile-centered.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompleteAdminDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('usersChart') usersChartRef!: ElementRef;
  @ViewChild('evolutionChart') evolutionChartRef!: ElementRef;
  @ViewChild('structuresChart') structuresChartRef!: ElementRef;
  @ViewChild('alertsChart') alertsChartRef!: ElementRef;

  private destroy$ = new Subject<void>();
  
  // État de l'interface
  currentSection = 'dashboard';
  darkMode = false;
  isLoading = false;
  
  // Menu déroulant des nomenclatures
  nomenclatureMenuExpanded = false;
  
  // Header et navigation
  searchQuery = '';
  hasNotifications = true;
  notificationCount = 3;
  hasMessages = true;
  messageCount = 2;
  
  // Menu utilisateur
  userMenuOpen = false;

  // Modales
  showUserModal = false;
  showStructureModal = false;
  showEditStructureModal = false;
  showNomenclatureModal = false;
  isEditMode = false;
  editingUserId: string | null = null;
  editingStructure: Structure | null = null;

  // Sélection multiple
  selectedUserIds: Set<string> = new Set();

  // Tri
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  // Pagination et tri pour les structures
  currentPageStructures = 1;
  itemsPerPageStructures = 5;
  totalStructures = 0;
  sortFieldStructures = 'libelle';
  sortDirectionStructures = 'asc';
  searchTermStructures = '';

  // Statistiques des structures
  structureStats = {
    total: 0,
    actives: 0,
    inactives: 0,
    enAttente: 0
  };

  // Filtres pour les structures
  structureFilters = {
    type: 'all',
    status: 'all'
  };

  // Sélection multiple pour les structures
  selectedStructureIds: Set<string> = new Set();

  // Formulaires
  userForm = {
    name: '',
    email: '',
    phoneNumber: '',
    country: 'TN',
    role: '',
    password: ''
  };

  countries: any[] = [];
  selectedCountry: any = null;

  structureForm = {
    code: '',
    libelle: '',
    description: '',
    typeStructure: '',
    adresse: '',
    gouvernement: '',
    actif: true,
    createdBy: '',
    lastModifiedBy: ''
  };

  nomenclatureForm = {
    name: '',
    category: '',
    description: ''
  };

  applicationForm = {
    code: '',
    libelle: '',
    description: '',
    actif: true,
    createdBy: '',
    lastModifiedBy: ''
  };

  zoneForm = {
    code: '',
    libelle: '',
    description: '',
    gouvernement: '',
    actif: true,
    createdBy: '',
    lastModifiedBy: ''
  };

  // Utilisateur actuel
  currentUser: User | null = null;

  // Propriétés pour la page profil
  lastPasswordChange: string = '02-04-2025 06:38:41';
  currentToken: string = 'eyJhbGci0iJIUzUxMiJ9...USamc4m6XB4Uj2AP fuQQ';

  // Gouvernorats depuis l'API gouvernement
  gouvernorats: Governorate[] = [];

  // Filtres et pagination pour les zones
  zoneFilters = {
    status: 'all',
    government: 'all'
  };
  searchTermZones = '';
  selectedZoneIds: string[] = [];
  currentZonePage = 0;
  zonesPerPage = 5;
  sortFieldZones = '';
  sortDirectionZones: 'asc' | 'desc' = 'asc';

  // Modal de gestion des zones
  showAddZoneModal = false;
  zoneModalMode: 'add' | 'edit' = 'add';
  editingZone: ZoneGeographique | null = null;

  // Filtres globaux
  globalFilters = {
    dateRange: 'month',
    role: 'all',
    governorate: 'all',
    status: 'all' // Ajout du filtre de statut
  };

  // Données d'activité récente
  recentActivities: any[] = [];
  
  // Propriétés pour le template
  searchTerm: string = '';
  selectedPeriod: string = 'month';

  // Méthode appelée lors du changement de recherche
  onSearchChange(): void {
    this.currentPage = 1; // Réinitialiser à la première page
    this.cdr.detectChanges();
  }

  // KPI Cards
  kpiCards: KPICard[] = [];

  // Données des graphiques
  chartData = {
    usersByRole: {
      labels: [] as string[],
      datasets: [{
        data: [] as number[],
        backgroundColor: ['#ff9800', '#9c27b0', '#3f51b5', '#4caf50'] // Commercial, Decision Maker, Admin (inclut Super Admin), Project Manager
      }]
    },
    applicationsByStatus: {
      labels: ['Actives', 'Inactives'] as string[],
      datasets: [{
        data: [] as number[],
        backgroundColor: ['#4caf50', '#f44336']
      }]
    },
    zonesByGovernment: {
      labels: [] as string[],
      datasets: [{
        data: [] as number[],
        backgroundColor: ['#3f51b5', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#795548', '#607d8b']
      }]
    },
    structuresByType: {
      labels: [] as string[],
      datasets: [{
        data: [] as number[],
        backgroundColor: ['#3f51b5', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4']
      }]
    }
  };

  // Données des tableaux
  users: User[] = [];
  structures: Structure[] = [];
  conventions: Convention[] = [];
  recentUsers: User[] = [];
  
  
  // Gouvernorats
  governorates: any[] = [];

  // Propriétés pour les nomenclatures
  applications: Application[] = [];
  zonesGeographiques: ZoneGeographique[] = [];
  showAddApplicationModal = false;
  showEditApplicationModal = false;
  editingApplication: Application | null = null;
  currentNomenclatureTab: 'applications' | 'zones' = 'applications';

  // Propriétés pour les paramètres de notifications
  activeNotificationTab: string = 'email';
  notificationSettings = {
    email: {
      enabled: true,
      frequency: 'daily',
      types: {
        conventions: true,
        invoices: true,
        payments: true,
        system: false,
        security: true
      }
    },
    sms: {
      enabled: false,
      types: {
        urgent: true,
        overdue: true,
        system: false
      }
    },
    push: {
      enabled: true,
      types: {
        conventions: true,
        invoices: true,
        payments: true,
        system: false
      }
    },
    thresholds: {
      overdueInvoices: 7,
      lowBalance: 1000,
      systemErrors: 10
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }
  };

  weekDays = [
    { value: 'monday', label: 'Lundi' },
    { value: 'tuesday', label: 'Mardi' },
    { value: 'wednesday', label: 'Mercredi' },
    { value: 'thursday', label: 'Jeudi' },
    { value: 'friday', label: 'Vendredi' },
    { value: 'saturday', label: 'Samedi' },
    { value: 'sunday', label: 'Dimanche' }
  ];


  // Propriétés pour la pagination et tri des applications
  currentPageApplications = 1;
  itemsPerPageApplications = 5;
  totalApplications = 0;
  sortFieldApplications = 'libelle';
  sortDirectionApplications: 'asc' | 'desc' = 'asc';
  searchTermApplications = '';
  selectedApplicationIds: string[] = [];
  applicationFilters = {
    status: 'all'
  };

  structureTypes: string[] = [];

  // Statistiques
  stats: any = {
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    disabledUsers: 0,
    totalStructures: 0,
    totalConventions: 0,
    totalTaxonomies: 0,
    criticalAlerts: 0,
    warningAlerts: 0,
    newUsersThisMonth: 0
  };

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    public structureService: StructureService,
    private authService: AuthService,
    private simpleAuthService: SimpleAuthService,
    public applicationService: ApplicationService,
    public zoneGeographiqueService: ZoneGeographiqueService,
    private governmentApiService: GovernmentApiService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    console.log('🚀 CompleteAdminDashboardComponent initialized');
    console.log('🔍 recentUsers initial:', this.recentUsers);
    this.loadGovernorates();
    this.loadCountries(); // Charger les pays pour le formulaire utilisateur
    console.log('📞 Chargement des données réelles depuis l\'API...');
    this.loadUsers(); // Charger UNIQUEMENT les utilisateurs réels depuis l'API
    this.loadCurrentUser(); // Charger l'utilisateur connecté
    this.loadStructures(); // Charger les structures
    this.loadStructureTypes(); // Charger les types de structures
    this.loadApplications(); // Charger les applications pour les KPI
    this.loadZonesGeographiques(); // Charger les zones pour les KPI
    console.log('📍 Initial currentSection:', this.currentSection);
    console.log('🔍 recentUsers après loadUsers:', this.recentUsers);
    
    // Fermer le menu utilisateur quand on clique à l'extérieur
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  ngAfterViewInit(): void {
    // Initialisation des graphiques après que la vue soit chargée
    setTimeout(() => {
      if (this.currentSection === 'dashboard') {
        this.initializeCharts();
      }
    }, 500);
  }

  /**
   * Helper method pour récupérer l'utilisateur connecté
   * Utilisé pour remplir les champs createdBy et lastModifiedBy
   */
  private getCurrentUsername(): string {
    const currentUser = this.authService.currentUserValue;
    return currentUser?.username || 'system';
  }

  // Initialisation des graphiques Chart.js
  private initializeCharts(): void {
    try {
      console.log('🔄 Initialisation des graphiques...');
      
      // Générer les données réelles avant de créer les graphiques
      this.generateChartData();

      // Chart 1: Users by Role (Donut)
      if (this.usersChartRef?.nativeElement) {
        console.log('📊 Création du graphique Users by Role');
        new Chart(this.usersChartRef.nativeElement, {
          type: 'doughnut',
          data: this.chartData.usersByRole,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }
        } as any);
        console.log('✅ Graphique Users by Role créé');
      }

      // Chart 2: Applications by Status (Donut)
      if (this.evolutionChartRef?.nativeElement) {
        console.log('📱 Création du graphique Applications by Status');
        new Chart(this.evolutionChartRef.nativeElement, {
          type: 'doughnut',
          data: this.chartData.applicationsByStatus,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }
        } as any);
        console.log('✅ Graphique Applications by Status créé');
      }

      // Chart 3: Zones by Government (Bar)
      if (this.structuresChartRef?.nativeElement) {
        console.log('🗺️ Création du graphique Zones by Government');
        new Chart(this.structuresChartRef.nativeElement, {
          type: 'bar',
          data: this.chartData.zonesByGovernment,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        } as any);
        console.log('✅ Graphique Zones by Government créé');
      }

      // Chart 4: Structures by Type (Bar)
      if (this.alertsChartRef?.nativeElement) {
        console.log('🏗️ Création du graphique Structures by Type');
        new Chart(this.alertsChartRef.nativeElement, {
          type: 'bar',
          data: this.chartData.structuresByType,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        } as any);
        console.log('✅ Graphique Structures by Type créé');
      }

      console.log('📊 Charts initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing charts:', error);
    }
  }

  // Navigation entre sections
  navigateToSection(route: string): void {
    console.log('🔄 Navigating to section:', route);
    this.currentSection = route;
    
    // Ouvrir automatiquement le menu des nomenclatures si on navigue vers une sous-section
    if (['applications', 'zones', 'structures-nomenclatures'].includes(route)) {
      this.nomenclatureMenuExpanded = true;
    }
    
    this.cdr.detectChanges();
    
    // Charger les données spécifiques à chaque section
    if (route === 'dashboard') {
      setTimeout(() => {
        this.initializeCharts();
      }, 300);
    } else if (route === 'users') {
      this.loadUsers();
    } else if (route === 'structures') {
      this.loadStructures();
      this.loadStructureTypes();
      this.loadGovernorates();
    } else if (route === 'applications') {
      this.loadApplications();
    } else if (route === 'zones') {
      this.loadZonesGeographiques();
    } else if (route === 'structures-nomenclatures') {
      this.loadStructures();
      this.loadStructureTypes();
      this.loadGovernorates();
    } else if (route === 'taxonomies') {
      // Charger les taxonomies si nécessaire
    }
  }

  // Toggle du menu déroulant des nomenclatures
  toggleNomenclatureMenu(): void {
    this.nomenclatureMenuExpanded = !this.nomenclatureMenuExpanded;
    this.cdr.detectChanges();
  }

  // Vérifier si une section de nomenclature est active
  isNomenclatureSectionActive(): boolean {
    return ['applications', 'zones', 'structures-nomenclatures'].includes(this.currentSection);
  }

  // Navigation vers les sous-sections des nomenclatures
  navigateToSubSection(subSection: string): void {
    console.log('🔄 Navigating to sub-section:', subSection);
    
    switch (subSection) {
      case 'applications':
        this.currentSection = 'applications';
        this.loadApplications();
        break;
      case 'zones':
        this.currentSection = 'zones';
        this.loadZonesGeographiques();
        break;
      case 'structures':
        this.currentSection = 'structures-nomenclatures';
        this.loadStructures();
        this.loadStructureTypes();
        this.loadGovernorates();
        break;
      default:
        console.warn('⚠️ Sous-section inconnue:', subSection);
        return;
    }
    
    this.cdr.detectChanges();
  }

  // Charger l'utilisateur actuel
  private loadCurrentUser(): void {
    // Récupérer l'utilisateur connecté depuis le service d'authentification
    const authUser = this.authService.getCurrentUser();
    
    if (authUser) {
      // Utiliser l'utilisateur connecté depuis le service d'authentification
    this.currentUser = {
        id: authUser.id,
        name: authUser.username || (authUser.firstName && authUser.lastName ? `${authUser.firstName} ${authUser.lastName}` : 'Utilisateur'),
        username: authUser.username,
        firstName: authUser.firstName,
        lastName: authUser.lastName,
        email: authUser.email,
        role: authUser.roles && authUser.roles.length > 0 ? authUser.roles[0] : 'ROLE_USER',
        roles: authUser.roles,
        status: 'ACTIVE', // Par défaut actif si connecté
        createdAt: new Date().toISOString(),
        avatar: authUser.profileImage,
        enabled: true,
        emailVerified: true
      };
      console.log('✅ Utilisateur connecté chargé depuis AuthService:', this.currentUser);
    } else {
      // Si pas d'utilisateur connecté, essayer de récupérer depuis l'API
      this.userService.getUsers().subscribe({
        next: (response) => {
          if (response.success && response.data.users && response.data.users.length > 0) {
            // Prendre le premier utilisateur comme utilisateur connecté (fallback)
            const user = response.data.users[0];
            this.currentUser = {
              id: user.id,
              name: user.username || user.firstName + ' ' + user.lastName || 'Admin',
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.roles && user.roles.length > 0 ? user.roles[0] : 'ROLE_ADMIN',
              roles: user.roles,
              status: user.status,
              createdAt: user.createdAt,
              avatar: user.avatar,
              enabled: user.enabled,
              emailVerified: user.emailVerified
            };
            console.log('✅ Utilisateur connecté chargé depuis API (fallback):', this.currentUser);
          }
        },
        error: (error: any) => {
          console.error('❌ Erreur lors du chargement de l\'utilisateur connecté:', error);
          // Utiliser un utilisateur par défaut en cas d'erreur
          this.currentUser = {
            id: '1',
            name: 'Admin System',
            username: 'admin',
            email: 'admin@gestionpro.tn',
            firstName: 'Admin',
            lastName: 'System',
            role: 'ROLE_ADMIN',
            roles: ['ROLE_ADMIN'],
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            enabled: true,
            emailVerified: true
          };
        }
      });
    }
  }

  // Cette méthode est supprimée - nous utilisons uniquement les vraies données de l'API

  // Cette méthode est supprimée - nous calculons les statistiques directement depuis les vraies données

  // Toutes les méthodes de mock sont supprimées - nous utilisons uniquement les vraies données de l'API

  // Actions rapides - Modales
  openAddUserDialog(): void {
    console.log('📝 Ouvrir modal ajout utilisateur');
    this.isEditMode = false;
    this.editingUserId = null;
    this.resetUserForm();
    this.showUserModal = true;
    this.cdr.detectChanges();
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.isEditMode = false;
    this.editingUserId = null;
    this.resetUserForm();
    this.cdr.detectChanges();
  }

  openAddStructureDialog(): void {
    console.log('🏗️ Ouvrir modal ajout structure');
    this.showStructureModal = true;
    this.cdr.detectChanges();
  }

  closeStructureModal(): void {
    this.showStructureModal = false;
    this.resetStructureForm();
    this.cdr.detectChanges();
  }

  openAddTaxonomyDialog(): void {
    console.log('📋 Ouvrir modal ajout nomenclature');
    this.showNomenclatureModal = true;
    this.cdr.detectChanges();
  }

  closeNomenclatureModal(): void {
    this.showNomenclatureModal = false;
    this.resetNomenclatureForm();
    this.cdr.detectChanges();
  }

  closeAddApplicationModal(): void {
    this.showAddApplicationModal = false;
    this.resetApplicationForm();
    this.cdr.detectChanges();
  }


  // Soumission des formulaires avec alertes de succès
  submitUserForm(): void {
    console.log('✅ Utilisateur à traiter:', this.userForm);
    
    // Validation du formulaire
    if (!this.userForm.name || !this.userForm.email || !this.userForm.role) {
      this.showErrorAlert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.userForm.email)) {
      this.showErrorAlert('Veuillez saisir une adresse email valide');
      return;
    }

    // Validation mot de passe (seulement pour la création)
    const isEditMode = this.userForm.password === ''; // Si pas de mot de passe, c'est une édition
    if (!isEditMode && this.userForm.password.length < 6) {
      this.showErrorAlert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Préparer les données pour l'API
    const userData: any = {
      username: this.userForm.name.toLowerCase().replace(/\s+/g, '.'),
      email: this.userForm.email,
      name: this.userForm.name,
      phoneNumber: this.userForm.phoneNumber,
      country: this.userForm.country || 'TN',  // ✅ AJOUTÉ
      roles: [this.userForm.role] // Envoyer le rôle comme tableau (le backend attend roles: [])
    };

    // Ajouter le mot de passe seulement pour la création
    if (!isEditMode) {
      userData.password = this.userForm.password;
    }

    console.log('📤 Envoi des données à l\'API:', userData);

    // Déterminer si c'est une création ou une édition
    if (this.isEditMode && this.editingUserId) {
      // Mode édition - utiliser le nouvel endpoint simple
      this.userService.updateUser(this.editingUserId, userData).subscribe({
        next: (response: any) => {
          console.log('✅ Utilisateur modifié avec succès:', response);
          
          // Fermer la modal et réinitialiser le formulaire
          this.closeUserModal();
          
          // Afficher l'alerte de succès
          this.showSuccessAlert('Utilisateur modifié avec succès !');
          
          // Rafraîchir la liste des utilisateurs
          this.loadUsers();
          
          // Rafraîchir les statistiques
          this.calculateRealStats();
        },
        error: (error: any) => {
          console.error('❌ Erreur lors de la modification de l\'utilisateur:', error);
          
          let errorMessage = 'Erreur lors de la modification de l\'utilisateur';
          
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.status === 404) {
            errorMessage = 'Utilisateur non trouvé';
          } else if (error.status === 400) {
            errorMessage = 'Données invalides';
          }
          
          this.showErrorAlert(errorMessage);
        }
      });
    } else {
      // Mode création
      this.userService.createUser(userData).subscribe({
        next: (response) => {
          console.log('✅ Utilisateur créé avec succès:', response);
          
          // Fermer la modal et réinitialiser le formulaire
          this.closeUserModal();
          
          // Afficher l'alerte de succès
          this.showSuccessAlert('Utilisateur ajouté avec succès !');
          
          // Rafraîchir la liste des utilisateurs
          this.loadUsers();
          
          // Rafraîchir les statistiques
          this.calculateRealStats();
        },
        error: (error) => {
          console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
          
          let errorMessage = 'Erreur lors de la création de l\'utilisateur';
          
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.status === 405) {
            errorMessage = '⚠️ Endpoint POST non disponible\n\nLe backend n\'expose pas l\'endpoint pour créer des utilisateurs.\n\nPour activer cette fonctionnalité, le backend doit implémenter :\n- POST /admin/dashboard/users\n- ou POST /users avec les bonnes permissions';
          } else if (error.status === 409) {
            errorMessage = 'Un utilisateur avec cet email existe déjà';
          } else if (error.status === 400) {
            errorMessage = 'Données invalides';
          } else if (error.status === 401) {
            errorMessage = 'Non autorisé - Vérifiez vos permissions';
          }
          
          this.showErrorAlert(errorMessage);
        }
      });
    }
  }

  submitStructureForm(): void {
    console.log('✅ Structure à ajouter:', this.structureForm);

    // Validation du formulaire
    if (!this.structureForm.code || !this.structureForm.libelle || !this.structureForm.typeStructure) {
      this.showErrorAlert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier l'authentification avant d'envoyer la requête
    if (!this.simpleAuthService.isAuthenticated()) {
      console.log('🔄 Utilisateur non authentifié, tentative de reconnexion...');
      this.simpleAuthService.forceReconnect().subscribe({
        next: () => {
          console.log('✅ Reconnexion réussie, retry de la création de structure');
          this.createStructureAfterAuth();
        },
        error: (authError) => {
          console.error('❌ Échec de la reconnexion:', authError);
          this.showErrorAlert('Erreur d\'authentification. Veuillez vous reconnecter.');
        }
      });
    } else {
      this.createStructureAfterAuth();
    }
  }

  private createStructureAfterAuth(): void {
    // Remplir les champs createdBy et lastModifiedBy avec l'utilisateur actuel
    const structureData = {
      ...this.structureForm,
      createdBy: this.getCurrentUsername(),
      lastModifiedBy: this.getCurrentUsername()
    };
    
    console.log('📤 Données structure à envoyer:', structureData);
    
    // Appel à l'API pour créer la structure
    this.structureService.createStructure(structureData).subscribe({
      next: (response) => {
        console.log('✅ Structure créée avec succès:', response);

        // Fermer la modal et réinitialiser le formulaire
        this.closeStructureModal();

        // Afficher l'alerte de succès
        this.showSuccessAlert('Structure créée avec succès !');

        // Rafraîchir les données
        this.loadStructures();
        this.calculateRealStats();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de la structure:', error);

        let errorMessage = 'Erreur lors de la création de la structure';

        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 400) {
          errorMessage = 'Données invalides';
        } else if (error.status === 401) {
          errorMessage = 'Non autorisé - Vérifiez vos permissions';
        }

        this.showErrorAlert(errorMessage);
      }
    });
  }

  submitNomenclatureForm(): void {
    console.log('✅ Nomenclature à ajouter:', this.nomenclatureForm);
    
    // Afficher alerte de succès
    this.showSuccessAlert('Nomenclature créée avec succès !');
    
    // Fermer la modal et recharger les données
    this.closeNomenclatureModal();
    this.calculateRealStats();
  }

  submitApplicationForm(): void {
    console.log('✅ Application à ajouter:', this.applicationForm);
    
    // Validation du formulaire
    if (!this.applicationForm.code || !this.applicationForm.libelle) {
      this.showErrorAlert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier l'authentification avant d'envoyer la requête
    if (!this.simpleAuthService.isAuthenticated()) {
      console.log('🔐 Non authentifié, tentative de reconnexion...');
      this.simpleAuthService.forceReconnect().subscribe({
        next: () => {
          this.createApplication();
        },
        error: () => {
          this.showErrorAlert('Erreur d\'authentification. Veuillez vous reconnecter.');
        }
      });
      return;
    }

    this.createApplication();
  }

  private createApplication(): void {
    // Remplir les champs createdBy et lastModifiedBy avec l'utilisateur actuel
    const applicationData = {
      ...this.applicationForm,
      createdBy: this.getCurrentUsername(),
      lastModifiedBy: this.getCurrentUsername()
    };
    
    console.log('📤 Données à envoyer:', applicationData);
    console.log('📤 Headers:', this.applicationService.getAuthHeaders());
    
    this.applicationService.createApplication(applicationData).subscribe({
      next: (response) => {
        console.log('✅ Application créée avec succès:', response);
        this.closeAddApplicationModal();
        this.showSuccessAlert('Application créée avec succès !');
        this.loadApplications();
      },
      error: (error) => {
        console.error('❌ Erreur complète:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Status Text:', error.statusText);
        console.error('❌ Headers:', error.headers);
        console.error('❌ URL:', error.url);
        console.error('❌ Error body:', error.error);
        console.error('❌ Message:', error.message);
        
        let errorMessage = 'Erreur lors de la création de l\'application';
        if (error.status === 400) {
          // Utiliser le message d'erreur du backend s'il existe
          errorMessage = error.error || 'Données invalides. Vérifiez que tous les champs sont correctement remplis.';
        } else if (error.status === 401) {
          errorMessage = 'Erreur d\'authentification. Veuillez vous reconnecter.';
        } else if (error.status === 403) {
          errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        } else if (error.status === 500) {
          errorMessage = error.error || 'Erreur serveur. Veuillez réessayer plus tard.';
        }
        
        this.showErrorAlert(errorMessage);
      }
    });
  }


  // Reset des formulaires
  resetUserForm(): void {
    this.userForm = {
      name: '',
      email: '',
      phoneNumber: '',
      country: 'TN',
      role: '',
      password: ''
    };
  }

  resetStructureForm(): void {
    this.structureForm = {
      code: '',
      libelle: '',
      description: '',
      typeStructure: '',
      adresse: '',
      gouvernement: '',
      actif: true,
      createdBy: '',
      lastModifiedBy: ''
    };
  }

  resetNomenclatureForm(): void {
    this.nomenclatureForm = {
      name: '',
      category: '',
      description: ''
    };
  }

  resetApplicationForm(): void {
    this.applicationForm = {
      code: '',
      libelle: '',
      description: '',
      actif: true,
      createdBy: '',
      lastModifiedBy: ''
    };
  }

  // Gestion des utilisateurs
  editUser(user: User): void {
    console.log('✏️ Modifier utilisateur:', user);
    console.log('📋 Données utilisateur complètes:', JSON.stringify(user, null, 2));
    
    // Activer le mode édition
    this.isEditMode = true;
    this.editingUserId = user.id;
    
    // Extraire le rôle correctement
    let userRole = '';
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      // Si roles est un tableau d'objets avec name ou un tableau de strings
      const firstRole = user.roles[0];
      if (typeof firstRole === 'object' && firstRole !== null && 'name' in firstRole) {
        userRole = (firstRole as any).name;
      } else {
        userRole = String(firstRole);
      }
    } else if (user.role) {
      // Si role est une propriété directe
      userRole = user.role;
    }
    
    console.log('🔍 Rôle extrait:', userRole);
    console.log('📱 Téléphone de l\'utilisateur:', user.phoneNumber);
    console.log('🌍 Pays de l\'utilisateur:', user.country);
    
    // Pré-remplir le formulaire avec les données de l'utilisateur
    this.userForm = {
      name: user.name || user.username || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || (user as any).phone || '',
      country: user.country || 'TN',
      role: userRole,
      password: '' // Ne pas pré-remplir le mot de passe pour la sécurité
    };
    
    console.log('📝 Formulaire pré-rempli:', this.userForm);
    console.log('📝 Téléphone dans le formulaire:', this.userForm.phoneNumber);
    
    // Ouvrir la modal en mode édition
    this.showUserModal = true;
    
    // Forcer la détection des changements pour mettre à jour le formulaire
    setTimeout(() => {
      this.cdr.detectChanges();
      console.log('🔄 Formulaire rafraîchi');
    }, 100);
    
    this.showSuccessAlert(`Modification de l'utilisateur ${user.name || user.username} - Modifiez les champs nécessaires`);
  }

  viewUser(user: User): void {
    console.log('👁️ Voir détails utilisateur:', user);
    
    // Afficher les détails de l'utilisateur dans une alerte
    const details = `
      Nom: ${user.name}
      Email: ${user.email}
      Rôle: ${user.role}
      Statut: ${this.getStatusLabel(user.status)}
      Dernière connexion: ${user.lastLogin ? this.formatDate(user.lastLogin) : 'Jamais'}
    `;
    
    alert(`Détails de l'utilisateur:\n\n${details}`);
  }

  deleteUser(user: User): void {
    console.log('🗑️ Supprimer utilisateur:', user);
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.name} ?\n\nCette action est irréversible.`)) {
      // Appel à l'API pour supprimer l'utilisateur
      this.userService.deleteUser(user.id).subscribe({
        next: (response) => {
          console.log('✅ Utilisateur supprimé avec succès:', response);
          
          // Supprimer de la liste locale
          this.recentUsers = this.recentUsers.filter(u => u.id !== user.id);
          
          // Mettre à jour les statistiques
          this.calculateRealStats();
          
          // Afficher alerte de succès
          this.showSuccessAlert(`Utilisateur ${user.name} supprimé avec succès !`);
          
          // Rafraîchir les données
          this.loadUsers();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ Erreur lors de la suppression de l\'utilisateur:', error);
          
          let errorMessage = 'Erreur lors de la suppression de l\'utilisateur';
          
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.status === 400) {
            errorMessage = '⚠️ Erreur de format d\'ID\n\nLe backend attend un ID numérique simple (ex: 1, 2, 3)\nmais reçoit un ID MongoDB complexe.\n\nPour corriger cela, le backend doit :\n- Accepter les IDs MongoDB\n- ou mapper les IDs MongoDB vers des IDs numériques';
          } else if (error.status === 404) {
            errorMessage = 'Utilisateur non trouvé';
          } else if (error.status === 403) {
            errorMessage = 'Vous n\'avez pas les permissions pour supprimer cet utilisateur';
          } else if (error.status === 401) {
            errorMessage = 'Non autorisé - Vérifiez vos permissions';
          }
          
          this.showErrorAlert(errorMessage);
        }
      });
    }
  }

  // Filtrage des utilisateurs
  getFilteredUsers(): User[] {
    let filtered = this.recentUsers;

    // Filtre par recherche intelligente
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(user => {
        // Recherche dans le nom
        const nameMatch = user.name?.toLowerCase().includes(term);
        // Recherche dans l'email
        const emailMatch = user.email?.toLowerCase().includes(term);
        // Recherche dans le nom d'utilisateur
        const usernameMatch = user.username?.toLowerCase().includes(term);
        // Recherche dans le rôle
        const roleMatch = this.getUserRole(user).toLowerCase().includes(term);
        // Recherche dans le statut
        const statusMatch = (user.status || 'inactive').toLowerCase().includes(term);
        
        return nameMatch || emailMatch || usernameMatch || roleMatch || statusMatch;
      });
    }

    // Filtre par rôle
    if (this.globalFilters.role !== 'all') {
      filtered = filtered.filter(user => 
        user.role.toLowerCase().includes(this.globalFilters.role.toLowerCase())
      );
    }

    // Filtre par statut
    if (this.globalFilters.status !== 'all') {
      filtered = filtered.filter(user => user.status === this.globalFilters.status);
    }

    return filtered;
  }

  // Statistiques des utilisateurs
  getActiveUsersCount(): number {
    return this.recentUsers.filter(user => user.status === 'active').length;
  }

  getPendingUsersCount(): number {
    return this.recentUsers.filter(user => user.status === 'pending').length;
  }

  getInactiveUsersCount(): number {
    return this.recentUsers.filter(user => user.status === 'inactive').length;
  }

  // Utilitaires pour l'affichage
  getRoleClass(role: string): string {
    if (!role) return 'default';
    const roleLower = role.toLowerCase();
    
    // Rôles spécifiques avec couleurs distinctes
    if (roleLower === 'role_super_admin' || roleLower === 'super_admin' || roleLower.includes('superadmin')) {
      return 'super-admin';
    }
    if (roleLower === 'role_admin' || roleLower === 'admin') {
      return 'admin';
    }
    if (roleLower === 'role_commercial' || roleLower === 'commercial') {
      return 'commercial';
    }
    if (roleLower === 'role_project_manager' || roleLower === 'project_manager' || roleLower.includes('project') || roleLower.includes('manager')) {
      return 'project-manager';
    }
    if (roleLower === 'role_decision_maker' || roleLower === 'decision_maker' || roleLower.includes('decision') || roleLower.includes('maker')) {
      return 'decision-maker';
    }
    if (roleLower === 'role_user' || roleLower === 'user') {
      return 'user';
    }
    
    return 'default';
  }

  // Obtenir la couleur d'un rôle (pour utilisation dans d'autres composants)
  getRoleColor(role: string): string {
    const roleClass = this.getRoleClass(role);
    
    const colorMap: { [key: string]: string } = {
      'super-admin': '#ff4757',
      'admin': '#3742fa',
      'commercial': '#ffa502',
      'project-manager': '#2ed573',
      'decision-maker': '#a55eea',
      'user': '#747d8c',
      'default': '#57606f'
    };
    
    return colorMap[roleClass] || colorMap['default'];
  }

  // Obtenir l'icône d'un rôle
  getRoleIcon(role: string): string {
    const roleLower = role.toLowerCase();
    
    if (roleLower === 'role_super_admin' || roleLower === 'super_admin' || roleLower.includes('superadmin')) {
      return 'admin_panel_settings';
    }
    if (roleLower === 'role_admin' || roleLower === 'admin') {
      return 'admin_panel_settings';
    }
    if (roleLower === 'role_commercial' || roleLower === 'commercial') {
      return 'business_center';
    }
    if (roleLower === 'role_project_manager' || roleLower === 'project_manager' || roleLower.includes('project') || roleLower.includes('manager')) {
      return 'assignment_ind';
    }
    if (roleLower === 'role_decision_maker' || roleLower === 'decision_maker' || roleLower.includes('decision') || roleLower.includes('maker')) {
      return 'gavel';
    }
    if (roleLower === 'role_user' || roleLower === 'user') {
      return 'person';
    }
    
    return 'person';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active': return 'check_circle';
      case 'pending': return 'pending';
      case 'inactive': return 'cancel';
      default: return 'help';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'inactive': return 'Inactif';
      default: return 'Inconnu';
    }
  }

  // Alertes de succès
  showSuccessAlert(message: string): void {
    // Créer une alerte visuelle
    const alert = document.createElement('div');
    alert.className = 'success-alert';
    alert.innerHTML = `
      <div class="alert-content">
        <i class="material-icons">check_circle</i>
        <span>${message}</span>
      </div>
    `;
    
    // Ajouter au DOM
    document.body.appendChild(alert);
    
    // Animation d'entrée
    setTimeout(() => alert.classList.add('show'), 100);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
      alert.classList.remove('show');
      setTimeout(() => document.body.removeChild(alert), 300);
    }, 3000);
  }

  // Toggle dark mode
  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-theme', this.darkMode);
    this.cdr.detectChanges();
  }

  // Recherche globale
  performSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Recherche:', this.searchQuery);
      // Implémenter la logique de recherche
    }
  }

  // Notifications
  toggleNotifications(): void {
    console.log('Ouvrir notifications');
    // Implémenter l'ouverture du panneau de notifications
  }

  // Messages
  toggleMessages(): void {
    console.log('🔔 Clic sur icône message - Navigation vers /messaging');
    this.router.navigate(['/messaging']);
  }

  // Paramètres
  toggleSettings(): void {
    console.log('Ouvrir paramètres');
    // Implémenter l'ouverture du panneau de paramètres
  }

  // Menu utilisateur
  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  goToProfile(): void {
    console.log('Navigation vers le profil');
    this.closeUserMenu();
    this.router.navigate(['/profile']);
  }

  logout(): void {
    // Déconnexion et redirection vers la page d'accueil
    this.authService.logout();
    this.router.navigate(['/']);
    this.closeUserMenu();
  }

  handleDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const userProfile = target.closest('.user-profile');
    const userMenu = target.closest('.user-menu');
    
    if (!userProfile && !userMenu) {
      this.closeUserMenu();
    }
  }

  // Obtenir l'heure actuelle pour le footer
  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // Navigation vers les sections du footer
  scrollToSection(section: string): void {
    console.log(`Navigation vers la section: ${section}`);
    // Implémenter la navigation vers les sections
    switch (section) {
      case 'help':
        // Navigation vers l'aide
        break;
      case 'documentation':
        // Navigation vers la documentation
        break;
      case 'contact':
        // Navigation vers le contact
        break;
      case 'support':
        // Navigation vers le support
        break;
    }
  }

  // Charger les gouvernorats (liste statique)
  loadGovernorates(): void {
    console.log('🌍 Chargement des gouvernorats...');
    
    // Utiliser directement la liste statique des gouvernorats tunisiens
    this.governmentApiService.getGovernorates().subscribe({
      next: (governorates) => {
        console.log('✅ Gouvernorats chargés:', governorates.length);
        this.gouvernorats = governorates;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des gouvernorats:', error);
        this.loadGovernoratesFallback();
      }
    });
  }


  private loadGovernoratesFallback(): void {
    // En cas d'erreur, utiliser des données par défaut
    this.gouvernorats = [
      { id: '1', name: 'Tunis', code: 'TN-11', population: 1056247, area: 346 },
      { id: '2', name: 'Ariana', code: 'TN-12', population: 576088, area: 482 },
      { id: '3', name: 'Ben Arous', code: 'TN-13', population: 631842, area: 761 },
      { id: '4', name: 'Manouba', code: 'TN-14', population: 379518, area: 1137 },
      { id: '5', name: 'Bizerte', code: 'TN-23', population: 568219, area: 3741 },
      { id: '6', name: 'Nabeul', code: 'TN-21', population: 787920, area: 2788 },
      { id: '7', name: 'Béja', code: 'TN-31', population: 303032, area: 3738 },
      { id: '8', name: 'Jendouba', code: 'TN-32', population: 401477, area: 3102 },
      { id: '9', name: 'Kef', code: 'TN-33', population: 243156, area: 4965 },
      { id: '10', name: 'Siliana', code: 'TN-34', population: 223087, area: 4642 },
      { id: '11', name: 'Sousse', code: 'TN-51', population: 674971, area: 2669 },
      { id: '12', name: 'Monastir', code: 'TN-52', population: 548828, area: 1019 },
      { id: '13', name: 'Mahdia', code: 'TN-53', population: 410812, area: 2966 },
      { id: '14', name: 'Sfax', code: 'TN-61', population: 955421, area: 7545 },
      { id: '15', name: 'Kairouan', code: 'TN-41', population: 570559, area: 6712 },
      { id: '16', name: 'Kasserine', code: 'TN-42', population: 439243, area: 8066 },
      { id: '17', name: 'Sidi Bouzid', code: 'TN-43', population: 429912, area: 6994 },
      { id: '18', name: 'Gabès', code: 'TN-81', population: 374300, area: 7166 },
      { id: '19', name: 'Medenine', code: 'TN-82', population: 479520, area: 9167 },
      { id: '20', name: 'Tataouine', code: 'TN-83', population: 149453, area: 38889 },
      { id: '21', name: 'Gafsa', code: 'TN-71', population: 337331, area: 8908 },
      { id: '22', name: 'Tozeur', code: 'TN-72', population: 107912, area: 4719 },
      { id: '23', name: 'Kebili', code: 'TN-73', population: 156961, area: 22184 }
    ];
    this.cdr.detectChanges();
    console.log('📋 Utilisation des gouvernorats de fallback');
  }

  // Charger les types de structures
  loadStructureTypes(): void {
    console.log('🏗️ Chargement des types de structures...');
    this.structureTypes = this.structureService.getStructureTypes();
    console.log('✅ Types de structures chargés:', this.structureTypes);
  }

  // Charger les structures depuis l'API
  loadStructures(): void {
    console.log('🏗️ Chargement des structures...');
    this.structureService.getAllStructures().subscribe({
      next: (structures) => {
        console.log('✅ Structures chargées:', structures);
        this.structures = structures;
        this.totalStructures = structures.length;
        this.calculateStructureStats();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des structures:', error);
        // En cas d'erreur, garder les structures existantes ou afficher un message
        if (this.structures.length === 0) {
          console.warn('⚠️ Aucune structure chargée');
        }
        this.totalStructures = this.structures.length;
        this.calculateStructureStats();
      }
    });
  }

  // Charger les applications depuis l'API
  loadApplications(): void {
    console.log('📱 Chargement des applications...');
    this.applicationService.getAllApplications().subscribe({
      next: (applications) => {
        console.log('✅ Applications chargées:', applications.length, 'applications');
        this.applications = applications;
        this.calculateRealStats(); // Recalculer les stats après chargement
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des applications:', error);
        if (this.applications.length === 0) {
          console.warn('⚠️ Aucune application chargée');
        }
      }
    });
  }

  // Charger les zones géographiques depuis l'API
  loadZonesGeographiques(): void {
    console.log('🗺️ Chargement des zones géographiques...');
    this.zoneGeographiqueService.getAllZonesGeographiques().subscribe({
      next: (zones) => {
        console.log('✅ Zones géographiques chargées:', zones.length, 'zones');
        this.zonesGeographiques = zones;
        this.calculateRealStats(); // Recalculer les stats après chargement
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des zones géographiques:', error);
        if (this.zonesGeographiques.length === 0) {
          console.warn('⚠️ Aucune zone géographique chargée');
        }
      }
    });
  }

  // Calculer les statistiques des structures
  calculateStructureStats(): void {
    this.structureStats = {
      total: this.structures.length,
      actives: this.structures.filter(s => s.actif).length,
      inactives: this.structures.filter(s => !s.actif).length,
      enAttente: 0 // Pour l'instant, pas de statut "en attente" pour les structures
    };
  }

  // === MÉTHODES POUR LE TABLEAU DES STRUCTURES ===

  // Obtenir les structures filtrées et triées
  getFilteredStructures(): Structure[] {
    let filtered = this.structures;

    // Filtrage par terme de recherche
    if (this.searchTermStructures) {
      const searchLower = this.searchTermStructures.toLowerCase();
      filtered = filtered.filter(structure =>
        structure.libelle.toLowerCase().includes(searchLower) ||
        structure.code.toLowerCase().includes(searchLower) ||
        structure.typeStructure.toLowerCase().includes(searchLower) ||
        structure.adresse?.toLowerCase().includes(searchLower)
      );
    }

    // Tri
    filtered.sort((a, b) => {
      const aValue = this.getStructureFieldValue(a, this.sortFieldStructures);
      const bValue = this.getStructureFieldValue(b, this.sortFieldStructures);
      
      if (this.sortDirectionStructures === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }

  // Obtenir la valeur d'un champ pour le tri
  private getStructureFieldValue(structure: Structure, field: string): any {
    switch (field) {
      case 'code': return structure.code;
      case 'libelle': return structure.libelle;
      case 'typeStructure': return structure.typeStructure;
      case 'adresse': return structure.adresse || '';
      case 'actif': return structure.actif ? 1 : 0;
      default: return structure.libelle;
    }
  }

  // Obtenir les structures paginées
  getPaginatedStructures(): Structure[] {
    const filtered = this.getFilteredStructures();
    const startIndex = (this.currentPageStructures - 1) * this.itemsPerPageStructures;
    const endIndex = startIndex + this.itemsPerPageStructures;
    return filtered.slice(startIndex, endIndex);
  }

  // Obtenir le nombre total de pages pour les structures
  getTotalPagesStructures(): number {
    const filtered = this.getFilteredStructures();
    return Math.ceil(filtered.length / this.itemsPerPageStructures);
  }

  // Changer de page pour les structures
  changePageStructures(page: number): void {
    const totalPages = this.getTotalPagesStructures();
    if (page >= 1 && page <= totalPages) {
      this.currentPageStructures = page;
    }
  }

  // Trier les structures
  sortStructures(field: string): void {
    if (this.sortFieldStructures === field) {
      this.sortDirectionStructures = this.sortDirectionStructures === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortFieldStructures = field;
      this.sortDirectionStructures = 'asc';
    }
    this.currentPageStructures = 1; // Retourner à la première page
  }

  // Rechercher dans les structures
  searchStructures(): void {
    this.currentPageStructures = 1; // Retourner à la première page
  }

  // Éditer une structure
  editStructure(structure: Structure): void {
    this.editingStructure = structure;
    this.structureForm = {
      code: structure.code,
      libelle: structure.libelle,
      description: structure.description,
      typeStructure: structure.typeStructure,
      adresse: structure.adresse,
      gouvernement: structure.governorate || '',
      actif: structure.actif,
      createdBy: structure.createdBy || '',
      lastModifiedBy: structure.lastModifiedBy || ''
    };
    this.showEditStructureModal = true;
  }

  // Supprimer une structure
  deleteStructure(structure: Structure): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la structure "${structure.libelle}" ?`)) {
      this.structureService.deleteStructure(structure.id).subscribe({
        next: () => {
          this.showSuccessAlert('Structure supprimée avec succès !');
          this.loadStructures();
        },
        error: (error) => {
          console.error('❌ Erreur lors de la suppression:', error);
          this.showErrorAlert('Erreur lors de la suppression de la structure');
        }
      });
    }
  }

  // Fermer la modal d'édition
  closeEditStructureModal(): void {
    this.showEditStructureModal = false;
    this.editingStructure = null;
    this.resetStructureForm();
  }

  // Soumettre le formulaire d'édition
  submitEditStructureForm(): void {
    if (!this.editingStructure) return;

    const updatedStructure = {
      ...this.structureForm,
      id: this.editingStructure.id
    };

    this.structureService.updateStructure(this.editingStructure.id, this.structureForm).subscribe({
      next: (response) => {
        console.log('✅ Structure mise à jour:', response);
        this.closeEditStructureModal();
        this.showSuccessAlert('Structure mise à jour avec succès !');
        this.loadStructures();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour:', error);
        this.showErrorAlert('Erreur lors de la mise à jour de la structure');
      }
    });
  }

  // TrackBy pour les structures
  trackByStructureId(index: number, structure: Structure): string {
    return structure.id;
  }

  // Obtenir les initiales d'une structure pour l'avatar
  getStructureInitials(structure: Structure): string {
    if (!structure.libelle) return 'ST';
    const words = structure.libelle.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return structure.libelle.substring(0, 2).toUpperCase();
  }

  // Obtenir la couleur de l'avatar d'une structure
  getStructureAvatarColor(structure: Structure): string {
    const colors = [
      '#4F8DF9', '#2ECC71', '#E74C3C', '#F39C12', 
      '#9B59B6', '#1ABC9C', '#34495E', '#E67E22'
    ];
    const hash = structure.id ? structure.id.charCodeAt(0) : structure.libelle.charCodeAt(0);
    return colors[hash % colors.length];
  }

  // Obtenir la date actuelle formatée
  getCurrentDate(): string {
    const now = new Date();
    return now.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // === MÉTHODES POUR LA SÉLECTION MULTIPLE DES STRUCTURES ===

  // Vérifier si une structure est sélectionnée
  isStructureSelected(structureId: string): boolean {
    return this.selectedStructureIds.has(structureId);
  }

  // Basculer la sélection d'une structure
  toggleStructureSelection(structureId: string): void {
    if (this.selectedStructureIds.has(structureId)) {
      this.selectedStructureIds.delete(structureId);
    } else {
      this.selectedStructureIds.add(structureId);
    }
  }

  // Vérifier si toutes les structures sont sélectionnées
  isAllStructuresSelected(): boolean {
    const filteredStructures = this.getFilteredStructures();
    return filteredStructures.length > 0 && filteredStructures.every(structure => this.selectedStructureIds.has(structure.id));
  }

  // Basculer la sélection de toutes les structures
  toggleSelectAllStructures(): void {
    const filteredStructures = this.getFilteredStructures();
    if (this.isAllStructuresSelected()) {
      // Désélectionner toutes les structures filtrées
      filteredStructures.forEach(structure => this.selectedStructureIds.delete(structure.id));
    } else {
      // Sélectionner toutes les structures filtrées
      filteredStructures.forEach(structure => this.selectedStructureIds.add(structure.id));
    }
  }

  // Obtenir les structures sélectionnées
  getSelectedStructures(): Structure[] {
    return this.structures.filter(structure => this.selectedStructureIds.has(structure.id));
  }

  // === MÉTHODES POUR LE TRI DES STRUCTURES ===

  // Obtenir l'icône de tri pour les structures
  getStructureSortIcon(field: string): string {
    if (this.sortFieldStructures !== field) {
      return 'unfold_more';
    }
    return this.sortDirectionStructures === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  }

  // === MÉTHODES POUR LES TYPES DE STRUCTURES ===

  // Obtenir la classe CSS pour le type de structure
  getStructureTypeClass(type: string): string {
    const typeClasses: { [key: string]: string } = {
      'ENTREPRISE': 'role-entreprise',
      'ORGANISATION': 'role-organisation',
      'MINISTERE': 'role-ministere',
      'ASSOCIATION': 'role-association',
      'COOPERATIVE': 'role-cooperative'
    };
    return typeClasses[type] || 'role-default';
  }

  // === MÉTHODES POUR LES DATES ===

  // Formater la date d'une structure
  formatStructureDate(date: string | Date | undefined | null): string {
    if (!date || date === null || date === 'null') return 'Non renseigné';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Vérifier si la date est valide
      if (isNaN(dateObj.getTime())) return 'Non renseigné';
      
      return dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Non renseigné';
    }
  }

  // Obtenir le nom du gouvernorat par son ID
  getGovernorateName(governorateId: string): string {
    if (!governorateId || !this.governorates) return '';
    const governorate = this.governorates.find(g => g.id === governorateId);
    return governorate ? governorate.name : '';
  }

  // === MÉTHODES POUR LA PAGINATION DES STRUCTURES ===

  // Obtenir les numéros de pages pour la pagination
  getPaginationPages(): number[] {
    const totalPages = this.getTotalPagesStructures();
    const currentPage = this.currentPageStructures;
    const pages: number[] = [];
    
    // Logique de pagination similaire à celle des utilisateurs
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Obtenir l'index de fin pour la pagination
  getEndIndexStructures(): number {
    return Math.min(this.currentPageStructures * this.itemsPerPageStructures, this.getFilteredStructures().length);
  }

  // === MÉTHODES POUR LES ACTIONS GROUPÉES ===

  // Désactiver les structures sélectionnées
  bulkDeactivateStructures(): void {
    const selectedStructures = this.getSelectedStructures();
    if (selectedStructures.length === 0) return;

    if (confirm(`Êtes-vous sûr de vouloir désactiver ${selectedStructures.length} structure(s) ?`)) {
      this.isLoading = true;
      
      // Désactiver chaque structure sélectionnée
      const deactivationPromises = selectedStructures.map(structure => 
        this.structureService.updateStructure(structure.id, { ...structure, actif: false }).toPromise()
      );

      Promise.all(deactivationPromises)
        .then(() => {
          this.showSuccessAlert(`${selectedStructures.length} structure(s) désactivée(s) avec succès !`);
          this.selectedStructureIds.clear();
          this.loadStructures(); // Recharger la liste
          this.cdr.detectChanges();
        })
        .catch(error => {
          console.error('Erreur lors de la désactivation:', error);
          this.showErrorAlert('Erreur lors de la désactivation des structures');
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  // Supprimer les structures sélectionnées
  bulkDeleteStructures(): void {
    const selectedStructures = this.getSelectedStructures();
    if (selectedStructures.length === 0) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedStructures.length} structure(s) ? Cette action est irréversible.`)) {
      this.isLoading = true;
      
      // Supprimer chaque structure sélectionnée
      const deletionPromises = selectedStructures.map(structure => 
        this.structureService.deleteStructure(structure.id).toPromise()
      );

      Promise.all(deletionPromises)
        .then(() => {
          this.showSuccessAlert(`${selectedStructures.length} structure(s) supprimée(s) avec succès !`);
          this.selectedStructureIds.clear();
          this.loadStructures(); // Recharger la liste
          this.cdr.detectChanges();
        })
        .catch(error => {
          console.error('Erreur lors de la suppression:', error);
          this.showErrorAlert('Erreur lors de la suppression des structures');
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  // Charger les utilisateurs depuis l'API
  loadUsers(): void {
    console.log('🔄 loadUsers() appelé - Début du chargement...');
    console.log('🌐 Appel à userService.getUsers()...');
    this.userService.getUsers().subscribe({
      next: (response) => {
        console.log('📥 Utilisateurs chargés:', response);
        
        // Gérer différents formats de réponse
        let users: any[] = [];
        
        if (response && (response as any).data) {
          // Format avec propriété data
          users = (response as any).data;
        } else if (Array.isArray(response)) {
          // Format tableau direct
          users = response;
        } else {
          console.warn('⚠️ Format de réponse inattendu:', response);
          users = [];
        }
        
        // Mapper les utilisateurs vers le format attendu par le composant
        this.recentUsers = users.map(user => {
          console.log('🔍 User data:', user);
          console.log('🔍 User roles:', user.roles);
          console.log('🔍 User phoneNumber:', user.phoneNumber);
          
          return {
            id: user.id,
            name: user.name || user.username,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,  // ✅ AJOUTÉ
            country: user.country,           // ✅ AJOUTÉ
            role: this.getUserRole(user),
            roles: user.roles,               // ✅ AJOUTÉ (pour le pré-remplissage)
            status: user.enabled ? 'active' : 'inactive',
            lastLogin: user.lastLogin ? new Date(user.lastLogin) : new Date(),
            createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
            avatar: user.avatar || this.getDefaultAvatar(user.name || user.username)
          };
        });
        
        console.log('👥 Utilisateurs mappés:', this.recentUsers);
        
        // Calculer les statistiques directement depuis les vraies données
        this.calculateRealStats();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des utilisateurs:', error);
        // En cas d'erreur, ne pas écraser les données existantes
        // Garder les utilisateurs déjà chargés ou afficher un message d'erreur
        if (this.recentUsers.length === 0) {
          console.warn('⚠️ Aucun utilisateur chargé, affichage d\'un message d\'erreur');
        }
      }
    });
  }

  // Calculer les statistiques réelles depuis les vraies données
  private calculateRealStats(): void {
    console.log('📊 Calcul des statistiques réelles...');
    
    // Statistiques des utilisateurs
    this.stats.totalUsers = this.recentUsers.length;
    this.stats.activeUsers = this.recentUsers.filter(user => user.status === 'active').length;
    this.stats.pendingUsers = this.recentUsers.filter(user => user.status === 'pending').length;
    this.stats.disabledUsers = this.recentUsers.filter(user => user.status === 'inactive').length;
    
    // Calculer les statistiques des structures
    const totalStructures = this.structures.length;
    const activeStructures = this.structures.filter(s => s.actif).length;
    const inactiveStructures = this.structures.filter(s => !s.actif).length;
    
    // Calculer les statistiques des applications
    const totalApplications = this.applications.length;
    const activeApplications = this.applications.filter(a => a.actif).length;
    const inactiveApplications = this.applications.filter(a => !a.actif).length;
    
    // Calculer les statistiques des zones
    const totalZones = this.zonesGeographiques.length;
    const activeZones = this.zonesGeographiques.filter(z => z.actif).length;
    const inactiveZones = this.zonesGeographiques.filter(z => !z.actif).length;
    
    // Créer les KPI Cards avec les vraies données de supervision (4 KPI seulement)
    this.kpiCards = [
      {
        id: 'users',
        title: 'Utilisateurs',
        value: this.stats.totalUsers,
        unit: `(${this.stats.activeUsers} actifs / ${this.stats.pendingUsers} en attente)`,
        trend: 'up',
        trendValue: 0,
        icon: 'people',
        breakdown: [
          { label: 'Actifs', value: this.stats.activeUsers, color: '#4CAF50' },
          { label: 'En attente', value: this.stats.pendingUsers, color: '#FF9800' },
          { label: 'Désactivés', value: this.stats.disabledUsers, color: '#F44336' }
        ]
      },
      {
        id: 'structures',
        title: 'Structures',
        value: totalStructures,
        unit: `(${activeStructures} actives / ${inactiveStructures} inactives)`,
        trend: 'up',
        trendValue: 0,
        icon: 'business',
        breakdown: [
          { label: 'Actives', value: activeStructures, color: '#4CAF50' },
          { label: 'Inactives', value: inactiveStructures, color: '#F44336' }
        ]
      },
      {
        id: 'applications',
        title: 'Applications',
        value: totalApplications,
        unit: `(${activeApplications} actives / ${inactiveApplications} inactives)`,
        trend: 'up',
        trendValue: 0,
        icon: 'apps',
        breakdown: [
          { label: 'Actives', value: activeApplications, color: '#4CAF50' },
          { label: 'Inactives', value: inactiveApplications, color: '#F44336' }
        ]
      },
      {
        id: 'zones',
        title: 'Zones Géographiques',
        value: totalZones,
        unit: `(${activeZones} actives / ${inactiveZones} inactives)`,
        trend: 'up',
        trendValue: 0,
        icon: 'map',
        breakdown: [
          { label: 'Actives', value: activeZones, color: '#4CAF50' },
          { label: 'Inactives', value: inactiveZones, color: '#F44336' }
        ]
      }
    ];
    
    console.log('📊 Statistiques réelles calculées:', this.stats);
    console.log('📊 KPI Cards créées:', this.kpiCards);
  }

  // Afficher une alerte d'erreur
  showErrorAlert(message: string): void {
    const alert = document.createElement('div');
    alert.className = 'error-alert show';
    alert.innerHTML = `
      <div class="alert-content">
        <i class="material-icons">error</i>
        <span>${message}</span>
      </div>
    `;
    
    // Styles pour l'alerte d'erreur
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #E74C3C;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(alert);
    
    // Animation d'entrée
    setTimeout(() => {
      alert.style.transform = 'translateX(0)';
    }, 100);
    
    // Supprimer après 4 secondes
    setTimeout(() => {
      alert.style.transform = 'translateX(100%)';
      setTimeout(() => document.body.removeChild(alert), 300);
    }, 4000);
  }

  // Méthodes utilitaires
  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      default: return 'trending_flat';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'user_created': return 'person_add';
      case 'role_updated': return 'security';
      case 'structure_deleted': return 'delete';
      default: return 'info';
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  // Méthodes pour générer les données réelles des graphiques
  generateChartData(): void {
    this.generateUsersByRoleData();
    this.generateApplicationsByStatusData();
    this.generateZonesByGovernmentData();
    this.generateStructuresByTypeData();
  }

  generateUsersByRoleData(): void {
    const roleCounts = new Map<string, number>();
    
    this.recentUsers.forEach(user => {
      const role = user.role || 'ROLE_COMMERCIAL';
      // Filtrer seulement les rôles valides de l'application
      if (['ROLE_COMMERCIAL', 'ROLE_DECISION_MAKER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_PROJECT_MANAGER'].includes(role)) {
        // Traiter Super Admin et Admin comme le même rôle
        const normalizedRole = (role === 'ROLE_SUPER_ADMIN') ? 'ROLE_ADMIN' : role;
        roleCounts.set(normalizedRole, (roleCounts.get(normalizedRole) || 0) + 1);
      }
    });

    // Mapper les rôles pour l'affichage
    const roleLabels = new Map<string, string>([
      ['ROLE_COMMERCIAL', 'Commercial'],
      ['ROLE_DECISION_MAKER', 'Decision Maker'],
      ['ROLE_ADMIN', 'Admin'], // Inclut Super Admin
      ['ROLE_PROJECT_MANAGER', 'Project Manager']
    ]);

    this.chartData.usersByRole.labels = Array.from(roleCounts.keys()).map(role => roleLabels.get(role) || role);
    this.chartData.usersByRole.datasets[0].data = Array.from(roleCounts.values());
  }

  generateApplicationsByStatusData(): void {
    const activeCount = this.applications.filter(app => app.actif).length;
    const inactiveCount = this.applications.filter(app => !app.actif).length;
    
    this.chartData.applicationsByStatus.datasets[0].data = [activeCount, inactiveCount];
  }

  generateZonesByGovernmentData(): void {
    const governmentCounts = new Map<string, number>();
    
    this.zonesGeographiques.forEach(zone => {
      const government = zone.gouvernement || 'Non renseigné';
      governmentCounts.set(government, (governmentCounts.get(government) || 0) + 1);
    });

    this.chartData.zonesByGovernment.labels = Array.from(governmentCounts.keys());
    this.chartData.zonesByGovernment.datasets[0].data = Array.from(governmentCounts.values());
  }

  generateStructuresByTypeData(): void {
    const typeCounts = new Map<string, number>();
    
    this.structures.forEach(structure => {
      const type = structure.typeStructure || 'Non renseigné';
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    });

    this.chartData.structuresByType.labels = Array.from(typeCounts.keys());
    this.chartData.structuresByType.datasets[0].data = Array.from(typeCounts.values());
  }

  // Méthodes pour les graphiques
  refreshChart(): void {
    console.log('🔄 Actualisation des graphiques...');
    this.generateChartData();
    this.initializeCharts();
  }

  exportChart(): void {
    console.log('📊 Export des graphiques...');
    // Implémentation de l'export des graphiques
    alert('Fonctionnalité d\'export en cours de développement');
  }


  // === MÉTHODES POUR LES NOMENCLATURES ===

  // Méthodes pour les Applications
  getApplicationInitials(app: Application): string {
    if (!app.libelle) return 'APP';
    const words = app.libelle.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return app.libelle.substring(0, 2).toUpperCase();
  }

  getApplicationAvatarColor(app: Application): string {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];
    const hash = app.id ? app.id.charCodeAt(0) : 0;
    return colors[hash % colors.length];
  }

  getApplicationTypeClass(type: string): string {
    const typeClasses: { [key: string]: string } = {
      'WEB': 'role-web',
      'MOBILE': 'role-mobile',
      'DESKTOP': 'role-desktop',
      'API': 'role-api',
      'SERVICE': 'role-service',
      'OTHER': 'role-default'
    };
    return typeClasses[type] || 'role-default';
  }

  editApplication(app: Application): void {
    this.editingApplication = app;
    this.showEditApplicationModal = true;
  }

  deleteApplication(app: Application): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'application "${app.libelle}" ?`)) {
      this.applicationService.deleteApplication(app.id).subscribe({
        next: () => {
          this.showSuccessAlert('Application supprimée avec succès !');
          this.loadApplications();
        },
        error: (error) => {
          console.error('❌ Erreur lors de la suppression:', error);
          this.showErrorAlert('Erreur lors de la suppression de l\'application');
        }
      });
    }
  }

  // Méthodes pour la pagination et tri des applications
  getFilteredApplications(): Application[] {
    let filtered = this.applications;
    
    // Filtre par statut
    if (this.applicationFilters.status !== 'all') {
      const isActive = this.applicationFilters.status === 'active';
      filtered = filtered.filter(app => app.actif === isActive);
    }
    
    // Filtre par recherche
    if (this.searchTermApplications) {
      const searchLower = this.searchTermApplications.toLowerCase();
      filtered = filtered.filter(app => 
        app.libelle?.toLowerCase().includes(searchLower) ||
        app.code?.toLowerCase().includes(searchLower) ||
        app.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Tri
    filtered.sort((a, b) => {
      let aValue: any = this.getApplicationFieldValue(a, this.sortFieldApplications);
      let bValue: any = this.getApplicationFieldValue(b, this.sortFieldApplications);
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (this.sortDirectionApplications === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return filtered;
  }

  getApplicationFieldValue(app: Application, field: string): any {
    switch (field) {
      case 'libelle': return app.libelle || '';
      case 'code': return app.code || '';
      case 'description': return app.description || '';
      case 'actif': return app.actif;
      default: return '';
    }
  }

  getPaginatedApplications(): Application[] {
    const filtered = this.getFilteredApplications();
    const startIndex = (this.currentPageApplications - 1) * this.itemsPerPageApplications;
    const endIndex = startIndex + this.itemsPerPageApplications;
    return filtered.slice(startIndex, endIndex);
  }

  getTotalPagesApplications(): number {
    return Math.ceil(this.getFilteredApplications().length / this.itemsPerPageApplications);
  }

  changePageApplications(page: number): void {
    if (page >= 1 && page <= this.getTotalPagesApplications()) {
      this.currentPageApplications = page;
    }
  }

  sortApplications(field: string): void {
    if (this.sortFieldApplications === field) {
      this.sortDirectionApplications = this.sortDirectionApplications === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortFieldApplications = field;
      this.sortDirectionApplications = 'asc';
    }
    this.currentPageApplications = 1;
  }

  searchApplications(): void {
    this.currentPageApplications = 1;
  }

  getApplicationSortIcon(field: string): string {
    if (this.sortFieldApplications !== field) {
      return 'unfold_more';
    }
    return this.sortDirectionApplications === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  }

  getEndIndexApplications(): number {
    return Math.min(this.currentPageApplications * this.itemsPerPageApplications, this.getFilteredApplications().length);
  }

  getPageNumbersApplications(): number[] {
    const totalPages = this.getTotalPagesApplications();
    const currentPage = this.currentPageApplications;
    const pages: number[] = [];
    
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Méthodes pour la sélection multiple des applications
  isApplicationSelected(appId: string): boolean {
    return this.selectedApplicationIds.includes(appId);
  }

  toggleApplicationSelection(appId: string): void {
    const index = this.selectedApplicationIds.indexOf(appId);
    if (index > -1) {
      this.selectedApplicationIds.splice(index, 1);
    } else {
      this.selectedApplicationIds.push(appId);
    }
  }

  isAllApplicationsSelected(): boolean {
    const filteredApps = this.getFilteredApplications();
    return filteredApps.length > 0 && filteredApps.every(app => this.selectedApplicationIds.includes(app.id));
  }

  toggleSelectAllApplications(): void {
    const filteredApps = this.getFilteredApplications();
    if (this.isAllApplicationsSelected()) {
      this.selectedApplicationIds = [];
    } else {
      this.selectedApplicationIds = filteredApps.map(app => app.id);
    }
  }

  bulkDeactivateApplications(): void {
    if (this.selectedApplicationIds.length === 0) return;
    
    if (confirm(`Êtes-vous sûr de vouloir désactiver ${this.selectedApplicationIds.length} application(s) ?`)) {
      const promises = this.selectedApplicationIds.map(id => 
        this.applicationService.deactivateApplication(id).toPromise()
      );
      
      Promise.all(promises).then(() => {
        this.showSuccessAlert(`${this.selectedApplicationIds.length} application(s) désactivée(s) avec succès !`);
        this.selectedApplicationIds = [];
        this.loadApplications();
      }).catch(error => {
        console.error('❌ Erreur lors de la désactivation en masse:', error);
        this.showErrorAlert('Erreur lors de la désactivation des applications');
      });
    }
  }

  bulkDeleteApplications(): void {
    if (this.selectedApplicationIds.length === 0) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedApplicationIds.length} application(s) ? Cette action est irréversible.`)) {
      const promises = this.selectedApplicationIds.map(id => 
        this.applicationService.deleteApplication(id).toPromise()
      );
      
      Promise.all(promises).then(() => {
        this.showSuccessAlert(`${this.selectedApplicationIds.length} application(s) supprimée(s) avec succès !`);
        this.selectedApplicationIds = [];
        this.loadApplications();
      }).catch(error => {
        console.error('❌ Erreur lors de la suppression en masse:', error);
        this.showErrorAlert('Erreur lors de la suppression des applications');
      });
    }
  }

  trackByApplicationId(index: number, app: Application): string {
    return app.id;
  }

  // Méthodes pour les statistiques des applications
  getTotalApplicationsCount(): number {
    return this.applications.length;
  }

  getActiveApplicationsCount(): number {
    return this.applications.filter(app => app.actif).length;
  }

  getInactiveApplicationsCount(): number {
    return this.applications.filter(app => !app.actif).length;
  }

  // Méthodes pour les Zones Géographiques
  getZoneInitials(zone: ZoneGeographique): string {
    if (!zone.libelle) return 'ZG';
    const words = zone.libelle.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return zone.libelle.substring(0, 2).toUpperCase();
  }

  getZoneAvatarColor(zone: ZoneGeographique): string {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];
    const hash = zone.id ? zone.id.charCodeAt(0) : 0;
    return colors[hash % colors.length];
  }


  deleteZone(zone: ZoneGeographique): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la zone "${zone.libelle}" ?`)) {
      this.zoneGeographiqueService.deleteZoneGeographique(zone.id).subscribe({
        next: () => {
          this.showSuccessAlert('Zone géographique supprimée avec succès !');
          this.loadZonesGeographiques();
        },
        error: (error) => {
          console.error('❌ Erreur lors de la suppression:', error);
          this.showErrorAlert('Erreur lors de la suppression de la zone géographique');
        }
      });
    }
  }

  // Méthodes pour gérer les pays et numéros de téléphone
  loadCountries(): void {
    // Utiliser directement la liste de fallback au lieu de l'API externe
    // L'API restcountries.com est souvent instable et retourne des erreurs 400
    console.log('📍 Chargement de la liste des pays (fallback local)');
    
    this.countries = [
      { cca2: 'TN', name: { common: 'Tunisie' }, flag: '🇹🇳', idd: { root: '+216', suffixes: [''] } },
      { cca2: 'FR', name: { common: 'France' }, flag: '🇫🇷', idd: { root: '+33', suffixes: [''] } },
      { cca2: 'DZ', name: { common: 'Algérie' }, flag: '🇩🇿', idd: { root: '+213', suffixes: [''] } },
      { cca2: 'MA', name: { common: 'Maroc' }, flag: '🇲🇦', idd: { root: '+212', suffixes: [''] } },
      { cca2: 'LY', name: { common: 'Libye' }, flag: '🇱🇾', idd: { root: '+218', suffixes: [''] } },
      { cca2: 'EG', name: { common: 'Égypte' }, flag: '🇪🇬', idd: { root: '+20', suffixes: [''] } },
      { cca2: 'US', name: { common: 'États-Unis' }, flag: '🇺🇸', idd: { root: '+1', suffixes: [''] } },
      { cca2: 'GB', name: { common: 'Royaume-Uni' }, flag: '🇬🇧', idd: { root: '+44', suffixes: [''] } },
      { cca2: 'DE', name: { common: 'Allemagne' }, flag: '🇩🇪', idd: { root: '+49', suffixes: [''] } },
      { cca2: 'IT', name: { common: 'Italie' }, flag: '🇮🇹', idd: { root: '+39', suffixes: [''] } },
      { cca2: 'ES', name: { common: 'Espagne' }, flag: '🇪🇸', idd: { root: '+34', suffixes: [''] } },
      { cca2: 'CA', name: { common: 'Canada' }, flag: '🇨🇦', idd: { root: '+1', suffixes: [''] } },
      { cca2: 'BE', name: { common: 'Belgique' }, flag: '🇧🇪', idd: { root: '+32', suffixes: [''] } },
      { cca2: 'CH', name: { common: 'Suisse' }, flag: '🇨🇭', idd: { root: '+41', suffixes: [''] } },
      { cca2: 'SA', name: { common: 'Arabie Saoudite' }, flag: '🇸🇦', idd: { root: '+966', suffixes: [''] } },
      { cca2: 'AE', name: { common: 'Émirats Arabes Unis' }, flag: '🇦🇪', idd: { root: '+971', suffixes: [''] } },
      { cca2: 'QA', name: { common: 'Qatar' }, flag: '🇶🇦', idd: { root: '+974', suffixes: [''] } }
    ];
    
    // Sélectionner la Tunisie par défaut
    this.selectedCountry = this.countries.find(c => c.cca2 === 'TN');
    if (this.selectedCountry) {
      this.userForm.country = 'TN';
    }
    
    console.log('✅ Liste des pays chargée:', this.countries.length, 'pays disponibles');
  }

  onCountryChange(event: any): void {
    const selectedCountryCode = event.target.value;
    this.selectedCountry = this.countries.find(c => c.cca2 === selectedCountryCode);
    
    if (this.selectedCountry) {
      // Mettre à jour le placeholder du numéro de téléphone
      const phoneInput = document.querySelector('input[name="phoneNumber"]') as HTMLInputElement;
      if (phoneInput) {
        const phoneCode = this.getCountryPhoneCode(selectedCountryCode);
        phoneInput.placeholder = `${phoneCode} XX XXX XXX`;
      }
    }
  }

  getCountryPhoneCode(countryCode: string): string {
    const phoneCodes: { [key: string]: string } = {
      'TN': '+216',
      'FR': '+33',
      'DZ': '+213',
      'MA': '+212',
      'US': '+1',
      'GB': '+44',
      'DE': '+49',
      'IT': '+39',
      'ES': '+34'
    };
    return phoneCodes[countryCode] || '+216';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Nettoyer l'événement de clic sur le document
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }

  // Forcer le rechargement des utilisateurs pour test
  forceReloadUsers(): void {
    console.log('🔄 FORCE RELOAD - Avant:', this.recentUsers);
    this.recentUsers = []; // Vider la liste
    this.cdr.detectChanges();
    console.log('🔄 FORCE RELOAD - Après vidage:', this.recentUsers);
    this.loadUsers(); // Recharger depuis l'API
  }

  // Obtenir le rôle d'un utilisateur
  getUserRole(user: any): string {
    if (!user) return 'ROLE_USER';
    
    // Si user.roles existe et est un tableau
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      // Prendre le premier rôle (le plus important)
      const firstRole = user.roles[0];
      if (typeof firstRole === 'string') return firstRole;
      if (firstRole.name) return firstRole.name;
      if (firstRole.role) return firstRole.role;
      return firstRole.toString();
    }
    
    // Si user.role existe (propriété directe)
    if (user.role) {
      return user.role;
    }
    
    // Si user.authorities existe
    if (user.authorities && Array.isArray(user.authorities) && user.authorities.length > 0) {
      return user.authorities[0].authority || user.authorities[0];
    }
    
    // Rôle par défaut basé sur le nom d'utilisateur
    if (user.username) {
      const username = user.username.toLowerCase();
      if (username === 'admin') return 'ROLE_ADMIN';
      if (username === 'superadmin') return 'ROLE_SUPER_ADMIN';
      if (username === 'commercial') return 'ROLE_COMMERCIAL';
      if (username === 'projectmanager') return 'ROLE_PROJECT_MANAGER';
      if (username === 'decisionmaker') return 'ROLE_DECISION_MAKER';
    }
    
    // Par défaut
    return 'ROLE_USER';
  }

  // ================ GESTION DE LA SÉLECTION MULTIPLE ================

  // Vérifier si un utilisateur est sélectionné
  isUserSelected(userId: string): boolean {
    return this.selectedUserIds.has(userId);
  }

  // Basculer la sélection d'un utilisateur
  toggleUserSelection(userId: string): void {
    if (this.selectedUserIds.has(userId)) {
      this.selectedUserIds.delete(userId);
    } else {
      this.selectedUserIds.add(userId);
    }
    this.cdr.detectChanges();
  }

  // Vérifier si tous les utilisateurs sont sélectionnés
  isAllSelected(): boolean {
    const filteredUsers = this.getFilteredUsers();
    return filteredUsers.length > 0 && filteredUsers.every(user => this.selectedUserIds.has(user.id));
  }

  // Basculer la sélection de tous les utilisateurs
  toggleSelectAll(): void {
    const filteredUsers = this.getFilteredUsers();
    if (this.isAllSelected()) {
      // Désélectionner tous les utilisateurs filtrés
      filteredUsers.forEach(user => this.selectedUserIds.delete(user.id));
    } else {
      // Sélectionner tous les utilisateurs filtrés
      filteredUsers.forEach(user => this.selectedUserIds.add(user.id));
    }
    this.cdr.detectChanges();
  }

  // Obtenir les utilisateurs sélectionnés
  getSelectedUsers(): User[] {
    return this.recentUsers.filter(user => this.selectedUserIds.has(user.id));
  }

  // Actions groupées
  bulkDeactivateUsers(): void {
    const selectedUsers = this.getSelectedUsers();
    if (selectedUsers.length === 0) return;

    const confirmMessage = `Êtes-vous sûr de vouloir désactiver ${selectedUsers.length} utilisateur(s) ?`;
    if (confirm(confirmMessage)) {
      this.isLoading = true;
      
      // Désactiver chaque utilisateur sélectionné
      const deactivationPromises = selectedUsers.map(user => 
        this.userService.changeUserStatus(user.id, 'INACTIVE').toPromise()
      );

      Promise.all(deactivationPromises)
        .then(() => {
          this.showSuccessAlert(`${selectedUsers.length} utilisateur(s) désactivé(s) avec succès`);
          this.selectedUserIds.clear();
          this.loadUsers(); // Recharger la liste
          this.cdr.detectChanges();
        })
        .catch(error => {
          console.error('Erreur lors de la désactivation:', error);
          this.showErrorAlert('Erreur lors de la désactivation des utilisateurs');
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  bulkDeleteUsers(): void {
    const selectedUsers = this.getSelectedUsers();
    if (selectedUsers.length === 0) return;

    const confirmMessage = `Êtes-vous sûr de vouloir supprimer définitivement ${selectedUsers.length} utilisateur(s) ? Cette action est irréversible.`;
    if (confirm(confirmMessage)) {
      this.isLoading = true;
      
      // Supprimer chaque utilisateur sélectionné
      const deletionPromises = selectedUsers.map(user => 
        this.userService.deleteUser(user.id).toPromise()
      );

      Promise.all(deletionPromises)
        .then(() => {
          this.showSuccessAlert(`${selectedUsers.length} utilisateur(s) supprimé(s) avec succès`);
          this.selectedUserIds.clear();
          this.loadUsers(); // Recharger la liste
          this.cdr.detectChanges();
        })
        .catch(error => {
          console.error('Erreur lors de la suppression:', error);
          this.showErrorAlert('Erreur lors de la suppression des utilisateurs');
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  // ================ GESTION DU TRI ================

  // Trier par un champ
  sortBy(field: string): void {
    if (this.sortField === field) {
      // Inverser la direction si c'est le même champ
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Nouveau champ, commencer par ascendant
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    // Réinitialiser à la première page lors du tri
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  // Obtenir l'icône de tri
  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return 'unfold_more';
    }
    return this.sortDirection === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  }

  // Obtenir les utilisateurs filtrés et triés
  getFilteredAndSortedUsers(): User[] {
    let users = this.getFilteredUsers();
    
    if (this.sortField) {
      users = users.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (this.sortField) {
          case 'name':
            aValue = a.name?.toLowerCase() || '';
            bValue = b.name?.toLowerCase() || '';
            break;
          case 'email':
            aValue = a.email?.toLowerCase() || '';
            bValue = b.email?.toLowerCase() || '';
            break;
          case 'role':
            aValue = this.getUserRole(a).toLowerCase();
            bValue = this.getUserRole(b).toLowerCase();
            break;
          case 'status':
            aValue = a.status || 'inactive';
            bValue = b.status || 'inactive';
            break;
          case 'lastLogin':
            aValue = new Date(a.lastLogin || 0).getTime();
            bValue = new Date(b.lastLogin || 0).getTime();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return this.sortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return this.sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return users;
  }

  // Obtenir les utilisateurs paginés
  getPaginatedUsers(): User[] {
    const allUsers = this.getFilteredAndSortedUsers();
    this.totalPages = Math.ceil(allUsers.length / this.itemsPerPage);
    
    // Réinitialiser à la première page si on dépasse le nombre total de pages
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    return allUsers.slice(startIndex, endIndex);
  }

  // Méthodes de pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cdr.detectChanges();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cdr.detectChanges();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Méthode pour calculer le nombre d'éléments affichés
  getDisplayedItemsCount(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.getFilteredAndSortedUsers().length);
  }

  // Méthode pour calculer le nombre d'éléments de début
  getStartItemIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
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

  // ===== MÉTHODES POUR LES ZONES GÉOGRAPHIQUES =====

  // Statistiques des zones
  getTotalZonesCount(): number {
    return this.zonesGeographiques.length;
  }

  getActiveZonesCount(): number {
    return this.zonesGeographiques.filter(zone => zone.actif).length;
  }

  getInactiveZonesCount(): number {
    return this.zonesGeographiques.filter(zone => !zone.actif).length;
  }

  // Méthodes pour la gestion des paramètres de notifications
  setActiveNotificationTab(tab: string): void {
    this.activeNotificationTab = tab;
  }

  toggleQuietHoursDay(day: string): void {
    const index = this.notificationSettings.quietHours.days.indexOf(day);
    if (index > -1) {
      this.notificationSettings.quietHours.days.splice(index, 1);
    } else {
      this.notificationSettings.quietHours.days.push(day);
    }
  }

  saveNotificationSettings(): void {
    console.log('💾 Sauvegarde des paramètres de notifications:', this.notificationSettings);
    
    // Ici vous pouvez ajouter l'appel API pour sauvegarder les paramètres
    // this.notificationService.saveSettings(this.notificationSettings).subscribe({
    //   next: (response) => {
    //     console.log('✅ Paramètres sauvegardés avec succès');
    //     this.showSuccessMessage('Paramètres de notifications sauvegardés avec succès');
    //   },
    //   error: (error) => {
    //     console.error('❌ Erreur lors de la sauvegarde:', error);
    //     this.showErrorMessage('Erreur lors de la sauvegarde des paramètres');
    //   }
    // });

    // Pour l'instant, on simule une sauvegarde réussie
    setTimeout(() => {
      console.log('✅ Paramètres de notifications sauvegardés avec succès');
      alert('Paramètres de notifications sauvegardés avec succès !');
    }, 500);
  }

  resetNotificationSettings(): void {
    console.log('🔄 Réinitialisation des paramètres de notifications');
    
    this.notificationSettings = {
      email: {
        enabled: true,
        frequency: 'daily',
        types: {
          conventions: true,
          invoices: true,
          payments: true,
          system: false,
          security: true
        }
      },
      sms: {
        enabled: false,
        types: {
          urgent: true,
          overdue: true,
          system: false
        }
      },
      push: {
        enabled: true,
        types: {
          conventions: true,
          invoices: true,
          payments: true,
          system: false
        }
      },
      thresholds: {
        overdueInvoices: 7,
        lowBalance: 1000,
        systemErrors: 10
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      }
    };

    console.log('✅ Paramètres réinitialisés aux valeurs par défaut');
    alert('Paramètres de notifications réinitialisés aux valeurs par défaut !');
  }

  // Test d'envoi d'email réel
  testEmailNotification(): void {
    console.log('📧 Test d\'envoi d\'email réel...');
    
    const testData = {
      recipient: 'hamza.benabdallah@gmail.com',
      subject: '🔔 Test Email Réel - GestionPro',
      content: `Bonjour,

Ceci est un test d'envoi d'email RÉEL depuis le système GestionPro.

✅ Le système de notifications fonctionne correctement !
📧 Cet email a été envoyé automatiquement depuis l'interface admin.
⏰ Heure d'envoi: ${new Date().toLocaleString()}

Cordialement,
L'équipe GestionPro`
    };

    // Appel API pour envoyer l'email
    fetch('http://localhost:8085/api/test/notifications/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('✅ Email envoyé avec succès:', data);
        alert(`✅ Email envoyé avec succès !\n\n📧 Destinataire: ${data.recipient}\n⏰ Heure: ${data.timestamp}\n\nVérifiez votre boîte email !`);
      } else {
        console.error('❌ Erreur:', data.error);
        alert(`❌ Erreur lors de l'envoi: ${data.error}`);
      }
    })
    .catch(error => {
      console.error('❌ Erreur réseau:', error);
      alert(`❌ Erreur réseau: ${error.message}`);
    });
  }

  // Filtrage des zones
  getFilteredZones(): ZoneGeographique[] {
    let filtered = this.zonesGeographiques;

    // Filtre par statut
    if (this.zoneFilters.status !== 'all') {
      const isActive = this.zoneFilters.status === 'active';
      filtered = filtered.filter(zone => zone.actif === isActive);
    }

    // Filtre par gouvernement
    if (this.zoneFilters.government !== 'all') {
      filtered = filtered.filter(zone => zone.gouvernement === this.zoneFilters.government);
    }

    // Filtre par recherche
    if (this.searchTermZones.trim()) {
      const searchTerm = this.searchTermZones.toLowerCase();
      filtered = filtered.filter(zone => 
        zone.libelle.toLowerCase().includes(searchTerm) ||
        zone.code.toLowerCase().includes(searchTerm) ||
        (zone.gouvernement && zone.gouvernement.toLowerCase().includes(searchTerm))
      );
    }

    return filtered;
  }

  // Tri des zones
  sortZones(field: string): void {
    if (this.sortFieldZones === field) {
      this.sortDirectionZones = this.sortDirectionZones === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortFieldZones = field;
      this.sortDirectionZones = 'asc';
    }
  }

  getSortedZones(): ZoneGeographique[] {
    const filtered = this.getFilteredZones();
    
    if (!this.sortFieldZones) {
      return filtered;
    }

    return filtered.sort((a, b) => {
      let aValue: any = a[this.sortFieldZones as keyof ZoneGeographique];
      let bValue: any = b[this.sortFieldZones as keyof ZoneGeographique];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return this.sortDirectionZones === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirectionZones === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  getZoneSortIcon(field: string): string {
    if (this.sortFieldZones !== field) {
      return 'unfold_more';
    }
    return this.sortDirectionZones === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  }

  // Pagination des zones
  getPaginatedZones(): ZoneGeographique[] {
    const sorted = this.getSortedZones();
    const startIndex = this.currentZonePage * this.zonesPerPage;
    const endIndex = startIndex + this.zonesPerPage;
    return sorted.slice(startIndex, endIndex);
  }

  getTotalZonePages(): number {
    return Math.ceil(this.getFilteredZones().length / this.zonesPerPage);
  }

  getZonePaginationStart(): number {
    return this.currentZonePage * this.zonesPerPage + 1;
  }

  getZonePaginationEnd(): number {
    const end = (this.currentZonePage + 1) * this.zonesPerPage;
    return Math.min(end, this.getFilteredZones().length);
  }

  previousZonePage(): void {
    if (this.currentZonePage > 0) {
      this.currentZonePage--;
    }
  }

  nextZonePage(): void {
    if (this.currentZonePage < this.getTotalZonePages() - 1) {
      this.currentZonePage++;
    }
  }

  // Sélection des zones
  isZoneSelected(zoneId: string): boolean {
    return this.selectedZoneIds.includes(zoneId);
  }

  toggleZoneSelection(zoneId: string): void {
    const index = this.selectedZoneIds.indexOf(zoneId);
    if (index > -1) {
      this.selectedZoneIds.splice(index, 1);
    } else {
      this.selectedZoneIds.push(zoneId);
    }
  }

  isAllZonesSelected(): boolean {
    const paginatedZones = this.getPaginatedZones();
    return paginatedZones.length > 0 && paginatedZones.every(zone => this.selectedZoneIds.includes(zone.id));
  }

  toggleSelectAllZones(): void {
    const paginatedZones = this.getPaginatedZones();
    if (this.isAllZonesSelected()) {
      // Désélectionner toutes les zones de la page
      paginatedZones.forEach(zone => {
        const index = this.selectedZoneIds.indexOf(zone.id);
        if (index > -1) {
          this.selectedZoneIds.splice(index, 1);
        }
      });
    } else {
      // Sélectionner toutes les zones de la page
      paginatedZones.forEach(zone => {
        if (!this.selectedZoneIds.includes(zone.id)) {
          this.selectedZoneIds.push(zone.id);
        }
      });
    }
  }

  // Recherche des zones
  searchZones(): void {
    this.currentZonePage = 0; // Reset à la première page lors de la recherche
  }

  clearZoneFilters(): void {
    this.zoneFilters = {
      status: 'all',
      government: 'all'
    };
    this.searchTermZones = '';
    this.currentZonePage = 0;
  }

  // Actions groupées sur les zones
  bulkDeactivateZones(): void {
    if (this.selectedZoneIds.length === 0) return;
    
    const selectedZones = this.zonesGeographiques.filter(zone => this.selectedZoneIds.includes(zone.id));
    console.log('Désactiver les zones:', selectedZones);
    
    // TODO: Implémenter la désactivation groupée
    this.selectedZoneIds = [];
  }

  bulkDeleteZones(): void {
    if (this.selectedZoneIds.length === 0) return;
    
    const selectedZones = this.zonesGeographiques.filter(zone => this.selectedZoneIds.includes(zone.id));
    console.log('Supprimer les zones:', selectedZones);
    
    // TODO: Implémenter la suppression groupée
    this.selectedZoneIds = [];
  }

  // TrackBy pour les zones
  trackByZoneId(index: number, zone: ZoneGeographique): string {
    return zone.id;
  }

  // ===== MÉTHODES POUR LE MODAL DES ZONES =====

  // Ouvrir le modal en mode ajout
  openAddZoneModal(): void {
    this.zoneModalMode = 'add';
    this.editingZone = null;
    this.resetZoneForm();
    this.showAddZoneModal = true;
  }

  // Ouvrir le modal en mode édition
  editZone(zone: ZoneGeographique): void {
    this.zoneModalMode = 'edit';
    this.editingZone = zone;
    this.populateZoneForm(zone);
    this.showAddZoneModal = true;
  }

  // Fermer le modal
  closeAddZoneModal(): void {
    this.showAddZoneModal = false;
    this.zoneModalMode = 'add';
    this.editingZone = null;
    this.resetZoneForm();
  }

  // Réinitialiser le formulaire
  resetZoneForm(): void {
    this.zoneForm = {
      code: '',
      libelle: '',
      description: '',
      gouvernement: '',
      actif: true,
      createdBy: '',
      lastModifiedBy: ''
    };
  }

  // Pré-remplir le formulaire avec les données de la zone
  populateZoneForm(zone: ZoneGeographique): void {
    this.zoneForm = {
      code: zone.code,
      libelle: zone.libelle,
      description: zone.description || '',
      gouvernement: zone.gouvernement || '',
      actif: zone.actif,
      createdBy: zone.createdBy || '',
      lastModifiedBy: zone.lastModifiedBy || ''
    };
  }

  // Soumettre le formulaire (ajout ou modification)
  submitZoneForm(): void {
    if (this.zoneModalMode === 'add') {
      this.addZone();
    } else if (this.zoneModalMode === 'edit' && this.editingZone) {
      this.updateZone();
    }
  }

  // Ajouter une nouvelle zone
  addZone(): void {
    if (!this.zoneForm.code || !this.zoneForm.libelle || !this.zoneForm.gouvernement) {
      this.showErrorAlert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Remplir les champs createdBy et lastModifiedBy avec l'utilisateur actuel
    const zoneData = {
      ...this.zoneForm,
      createdBy: this.getCurrentUsername(),
      lastModifiedBy: this.getCurrentUsername()
    };

    console.log('📤 Données zone à envoyer:', zoneData);

    this.zoneGeographiqueService.createZoneGeographique(zoneData).subscribe({
      next: (response) => {
        console.log('✅ Zone créée avec succès:', response);
        this.closeAddZoneModal();
        this.showSuccessAlert('Zone géographique créée avec succès !');
        this.loadZonesGeographiques();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de la zone:', error);
        console.error('❌ Détails de l\'erreur:', error.error);
        this.showErrorAlert('Erreur lors de la création de la zone: ' + (error.error?.message || error.message));
      }
    });
  }

  // Modifier une zone existante
  updateZone(): void {
    if (!this.editingZone || !this.zoneForm.code || !this.zoneForm.libelle || !this.zoneForm.gouvernement) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const zoneIndex = this.zonesGeographiques.findIndex(z => z.id === this.editingZone!.id);
    if (zoneIndex !== -1) {
      this.zonesGeographiques[zoneIndex] = {
        ...this.zonesGeographiques[zoneIndex],
        code: this.zoneForm.code,
        libelle: this.zoneForm.libelle,
        description: this.zoneForm.description,
        gouvernement: this.zoneForm.gouvernement,
        actif: this.zoneForm.actif,
        dateModification: new Date()
      };
      
      console.log('Zone modifiée:', this.zonesGeographiques[zoneIndex]);
    }

    this.closeAddZoneModal();
  }

  // Générer un ID unique pour une nouvelle zone
  private generateZoneId(): string {
    return 'zone_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Navigation directe vers une page spécifique pour les zones
  goToZonePage(page: number): void {
    if (page >= 0 && page < this.getTotalZonePages()) {
      this.currentZonePage = page;
    }
  }

  // Obtenir les numéros de pages à afficher pour les zones
  getZonePageNumbers(): number[] {
    const totalPages = this.getTotalZonePages();
    const currentPage = this.currentZonePage;
    const pages: number[] = [];
    
    // Afficher 5 pages maximum autour de la page actuelle
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Obtenir les numéros de pages à afficher pour les structures
  getStructurePageNumbers(): number[] {
    const totalPages = this.getTotalPagesStructures();
    const currentPage = this.currentPageStructures;
    const pages: number[] = [];
    
    // Afficher 5 pages maximum autour de la page actuelle
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }


  // Méthode pour éditer le profil
  editProfile(): void {
    // TODO: Implémenter l'édition du profil
    console.log('Édition du profil utilisateur');
    this.showSuccessAlert('Ouverture de l\'éditeur de profil');
  }

  // Méthodes utilitaires pour la page profil
  getCurrentUserName(): string {
    if (!this.currentUser) return 'Utilisateur';
    if (this.currentUser.firstName && this.currentUser.lastName) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return this.currentUser.name || this.currentUser.username || 'Utilisateur';
  }

  getCurrentUserEmail(): string {
    return this.currentUser?.email || 'email@example.com';
  }

  getCurrentUserRole(): string {
    if (!this.currentUser) return 'Utilisateur';
    
    // Utiliser roles si disponible, sinon role
    if (this.currentUser.roles && this.currentUser.roles.length > 0) {
      const primaryRole = this.currentUser.roles[0];
      return USER_ROLES[primaryRole as keyof typeof USER_ROLES]?.name || primaryRole;
    }
    
    return this.currentUser.role || 'Utilisateur';
  }

  getCurrentUserStatus(): string {
    if (!this.currentUser) return 'Inconnu';
    
    // Normaliser le statut
    const status = this.currentUser.status.toUpperCase();
    return USER_STATUSES[status as keyof typeof USER_STATUSES]?.name || this.currentUser.status;
  }

  getCurrentUserCreatedDate(): string {
    if (!this.currentUser?.createdAt) return 'Date inconnue';
    const date = new Date(this.currentUser.createdAt);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getCurrentUserInitials(): string {
    if (!this.currentUser) return 'U';
    if (this.currentUser.firstName && this.currentUser.lastName) {
      return `${this.currentUser.firstName.charAt(0)}${this.currentUser.lastName.charAt(0)}`.toUpperCase();
    }
    const name = this.currentUser.name || this.currentUser.username || 'U';
    return name.substring(0, 2).toUpperCase();
  }

  getCurrentUserAvatarUrl(): string {
    if (!this.currentUser) return '';
    if (this.currentUser.avatar) return this.currentUser.avatar;
    const name = this.getCurrentUserName();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff&size=128`;
  }

  isCurrentUserAdmin(): boolean {
    if (!this.currentUser) return false;
    
    if (this.currentUser.roles) {
      return this.currentUser.roles.includes('ROLE_ADMIN') || this.currentUser.roles.includes('ROLE_SUPER_ADMIN');
    }
    
    return this.currentUser.role === 'ROLE_ADMIN' || this.currentUser.role === 'ROLE_SUPER_ADMIN';
  }

  isCurrentUserSuperAdmin(): boolean {
    if (!this.currentUser) return false;

    if (this.currentUser.roles) {
      return this.currentUser.roles.includes('ROLE_SUPER_ADMIN');
    }

    return this.currentUser.role === 'ROLE_SUPER_ADMIN';
  }

  // ==================== CHATBOT OPÉRATIONNEL ====================
  isOperationalChatbotOpen = false;

  openOperationalChatbot() {
    this.isOperationalChatbotOpen = true;
  }

  closeOperationalChatbot() {
    this.isOperationalChatbotOpen = false;
  }
}