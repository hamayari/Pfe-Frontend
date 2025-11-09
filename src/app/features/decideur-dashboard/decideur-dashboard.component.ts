import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ConventionService } from '../../services/convention.service';
import { DecideurService, NomenclatureDTO } from '../../services/decideur.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ChatbotModalComponent } from './chatbot-modal/chatbot-modal.component';
import { KpiAlertsComponent } from './kpi-alerts/kpi-alerts.component';
import { KpiAlertsSectionComponent } from '../../components/kpi-alerts-section/kpi-alerts-section.component';
import { KpiAnalysisService } from '../../services/kpi-analysis.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ChangePasswordModalComponent } from '../../shared/components/change-password-modal/change-password-modal.component';

@Component({
  selector: 'app-decideur-dashboard',
  standalone: true,
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ChatbotModalComponent,
    KpiAlertsComponent,
    KpiAlertsSectionComponent,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './decideur-dashboard.component.html',
  styleUrls: ['./decideur-dashboard.component.scss']
})
export class DecideurDashboardComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  // Variables pour le header
  searchQuery = '';
  isDarkMode = false;
  notificationCount = 3;
  messageCount = 5;
  userMenuOpen = false;
  
  // Chatbot
  isChatbotOpen = false;

  // Filtres
  filters = {
    periode: 'mois',
    gouvernorats: [] as string[],
    structures: [] as string[],
    applications: [] as string[],
    statutConvention: 'tous',
    statutFacture: 'tous',
    dateDebut: null as Date | null,
    dateFin: null as Date | null
  };

  // Options pour les filtres
  periodes = [
    { value: 'jour', label: 'Aujourd\'hui' },
    { value: 'semaine', label: 'Cette semaine' },
    { value: 'mois', label: 'Ce mois' },
    { value: 'trimestre', label: 'Ce trimestre' },
    { value: 'annee', label: 'Cette année' },
    { value: 'personnalise', label: 'Période personnalisée' }
  ];

  gouvernorats = [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba',
    'Nabeul', 'Zaghouan', 'Bizerte', 'Béja',
    'Jendouba', 'Le Kef', 'Siliana', 'Kairouan',
    'Kasserine', 'Sidi Bouzid', 'Sousse', 'Monastir',
    'Mahdia', 'Sfax', 'Gafsa', 'Tozeur',
    'Kebili', 'Gabès', 'Médenine', 'Tataouine'
  ];

  structures: string[] = []; // Codes des structures depuis le backend

  applications: string[] = []; // Codes des applications depuis le backend

  statutsConvention = [
    { value: 'tous', label: 'Tous' },
    { value: 'active', label: 'Actives' },
    { value: 'expiree', label: 'Expirées' },
    { value: 'en_attente', label: 'En attente' }
  ];

  statutsFacture = [
    { value: 'tous', label: 'Tous' },
    { value: 'payee', label: 'Payées' },
    { value: 'impayee', label: 'Impayées' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'en_retard', label: 'En retard' }
  ];

  // Statistiques principales (seront mises à jour avec les données réelles)
  totalConventions = 0;
  activeConventions = 0;
  totalRevenue = 0;
  pendingInvoices = 0;

  // KPIs (valeurs initiales, seront remplacées par les données réelles)
  kpis = [
    {
      icon: 'description',
      title: 'Conventions Actives',
      value: '...',
      subtitle: 'Chargement...',
      color: 'primary',
      trend: '+5%',
      hasAlert: false,
      alertSeverity: '',
      alertMessage: '',
      kpiType: 'CONVENTIONS'
    },
    {
      icon: 'attach_money',
      title: 'Factures Payées',
      value: '...',
      subtitle: 'Chargement...',
      color: 'accent',
      trend: '+12%',
      hasAlert: false,
      alertSeverity: '',
      alertMessage: '',
      kpiType: 'FACTURES_PAYEES'
    },
    {
      icon: 'receipt',
      title: 'Factures en Attente',
      value: '...',
      subtitle: 'Chargement...',
      color: 'warn',
      trend: '-3%',
      hasAlert: false,
      alertSeverity: '',
      alertMessage: '',
      kpiType: 'FACTURES_ATTENTE'
    },
    {
      icon: 'trending_up',
      title: 'Taux de Paiement',
      value: '...',
      subtitle: 'Chargement...',
      color: 'primary',
      trend: '+8%',
      hasAlert: false,
      alertSeverity: '',
      alertMessage: '',
      kpiType: 'TAUX_PAIEMENT'
    }
  ];

  // Alertes importantes (seront générées depuis les données réelles)
  alerts: any[] = [];

  // Activités récentes
  recentActivities: any[] = [];
  isLoadingActivities = false;

  // Graphiques de performance
  performanceData: any[] = [];
  isLoadingPerformance = false;

  // Répartition par gouvernorat
  gouvernoratData: any[] = [];
  isLoadingGouvernorat = false;

  // Répartition par structure
  structureData: any[] = [];
  isLoadingStructure = false;

  // Top 5 commerciaux
  topCommerciaux: any[] = [];
  isLoadingTopCommerciaux = false;

  // Données du tableau
  displayedColumns: string[] = ['reference', 'libelle', 'structure', 'gouvernorat', 'montant', 'statutFacture', 'echeance', 'commercial', 'actions'];
  
  allConventions: any[] = []; // Toutes les conventions (avant filtrage)
  conventionsData: any[] = []; // Conventions filtrées (affichées)
  isLoadingConventions = false;

  // Pagination
  pageSize = 5;
  pageIndex = 0;
  totalItems = 0;

  /**
   * Retourne les conventions paginées pour l'affichage
   */
  get paginatedConventions(): any[] {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.conventionsData.slice(startIndex, endIndex);
  }

  constructor(
    private conventionService: ConventionService,
    private decideurService: DecideurService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('🎯 Dashboard Décideur initialisé');
    this.loadKPIs();
    this.loadConventions(); // applyFilters() sera appelé après le chargement
    this.loadTopCommerciaux();
    this.loadRepartitionGouvernorat();
    this.loadRepartitionStructure();
    this.loadPerformanceData();
    this.loadRecentActivities();
    this.loadStructures();
    this.loadApplications();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Méthode pour ouvrir le modal de changement de mot de passe
  openChangePasswordModal(): void {
    console.log('🔐 Ouverture du modal de changement de mot de passe...');
    
    const dialogRef = this.dialog.open(ChangePasswordModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'change-password-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.snackBar.open('✅ Mot de passe changé avec succès', 'Fermer', { 
          duration: 5000
        });
      }
    });
  }

  /**
   * Charger les conventions depuis la base de données
   */
  loadConventions(): void {
    this.isLoadingConventions = true;
    console.log('📥 Chargement des conventions depuis la base de données...');
    
    const sub = this.conventionService.getConventions().subscribe({
      next: (conventions) => {
        console.log('✅ Conventions chargées:', conventions.length);
        console.log('📋 Données brutes:', conventions);
        
        if (!conventions || conventions.length === 0) {
          console.warn('⚠️ Aucune convention retournée par le serveur');
          this.conventionsData = [];
          this.totalItems = 0;
          this.isLoadingConventions = false;
          return;
        }
        
        // Transformer les données pour le tableau
        this.allConventions = conventions.map(conv => ({
          id: conv.id,
          reference: conv.reference || 'N/A',
          libelle: conv.title,
          structure: conv.structureId || 'N/A',
          gouvernorat: conv.zoneGeographiqueId || 'N/A',
          application: (conv as any).applicationId || 'N/A',
          montant: conv.amount,
          statutFacture: this.mapStatus(conv.status),
          echeance: conv.endDate ? new Date(conv.endDate) : new Date(),
          commercial: conv.commercial || conv.createdBy || 'N/A',
          status: conv.status
        }));
        
        console.log('✅ Conventions transformées:', this.allConventions.length);
        this.isLoadingConventions = false;
        
        // Appliquer les filtres (au début, affiche toutes les conventions)
        this.applyFilters();
        
        // Vérifier les anomalies KPI et mettre à jour les cartes
        this.checkKpiAnomalies();
        
        // Générer les alertes basées sur les conventions chargées
        this.generateAlerts();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des conventions:', error);
        console.error('📊 Détails de l\'erreur:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        this.isLoadingConventions = false;
        this.conventionsData = [];
        this.totalItems = 0;
      }
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Mapper le statut de convention vers le statut de facture
   */
  private mapStatus(status: string): string {
    const statusMap: any = {
      'ACTIVE': 'payee',
      'PENDING': 'en_attente',
      'EXPIRED': 'en_retard',
      'CANCELLED': 'impayee'
    };
    return statusMap[status] || 'en_attente';
  }

  /**
   * Charger les KPIs réels depuis le backend
   */
  loadKPIs(): void {
    console.log('📊 Chargement des KPIs réels...');
    
    const sub = this.decideurService.getKPIs().subscribe({
      next: (data) => {
        console.log('✅ KPIs chargés:', data);
        
        this.totalConventions = data.totalConventions;
        this.activeConventions = data.activeConventions;
        this.totalRevenue = data.totalRevenue;
        this.pendingInvoices = data.pendingInvoices;
        
        // Mettre à jour les KPIs affichés
        this.kpis[0].value = data.activeConventions.toString();
        this.kpis[0].subtitle = `sur ${data.totalConventions} total`;
        this.kpis[1].value = `${(data.totalRevenue / 1000).toFixed(0)}K DT`;
        this.kpis[1].subtitle = `${data.paidInvoices} facture${data.paidInvoices > 1 ? 's' : ''} payée${data.paidInvoices > 1 ? 's' : ''}`;
        this.kpis[2].value = data.pendingInvoices.toString();
        this.kpis[2].subtitle = `${(data.pendingAmount / 1000).toFixed(0)}K DT`;
        this.kpis[3].value = `${Math.round(data.paymentRate)}%`;
        
        console.log('📊 KPIs mis à jour:', {
          total: data.totalConventions,
          active: data.activeConventions,
          revenue: data.totalRevenue,
          pending: data.pendingInvoices,
          paymentRate: data.paymentRate
        });
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des KPIs:', error);
      }
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Générer les alertes basées sur les données réelles
   */
  private generateAlerts(): void {
    this.alerts = [];
    
    // Alerte 1: Conventions expirant bientôt
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringSoon = this.conventionsData.filter(c => {
      const echeance = new Date(c.echeance);
      return echeance > now && echeance < thirtyDaysLater;
    }).length;
    
    if (expiringSoon > 0) {
      this.alerts.push({
        type: 'warning',
        icon: 'warning',
        title: `${expiringSoon} convention${expiringSoon > 1 ? 's' : ''} expire${expiringSoon > 1 ? 'nt' : ''} dans 30 jours`,
        action: 'Voir détails',
        link: '/decideur/conventions'
      });
    }
    
    // Alerte 2: Factures en retard
    const lateInvoices = this.conventionsData.filter(c => c.statutFacture === 'en_retard').length;
    if (lateInvoices > 0) {
      this.alerts.push({
        type: 'error',
        icon: 'error',
        title: `${lateInvoices} facture${lateInvoices > 1 ? 's' : ''} en retard`,
        action: 'Relancer',
        link: '/decideur/factures'
      });
    }
    
    // Alerte 3: Factures en attente
    if (this.pendingInvoices > 0) {
      this.alerts.push({
        type: 'info',
        icon: 'info',
        title: `${this.pendingInvoices} facture${this.pendingInvoices > 1 ? 's' : ''} en attente de paiement`,
        action: 'Consulter',
        link: '/decideur/factures'
      });
    }
    
    console.log('🔔 Alertes générées:', this.alerts.length);
  }

  /**
   * Charger le top 5 des commerciaux depuis la base de données
   */
  loadTopCommerciaux(): void {
    this.isLoadingTopCommerciaux = true;
    console.log('🏆 Chargement du top 5 des commerciaux...');
    
    const sub = this.decideurService.getTopCommercials().subscribe({
      next: (commerciaux) => {
        console.log('✅ Top commerciaux chargés:', commerciaux.length);
        console.log('📋 Données brutes:', commerciaux);
        
        if (!commerciaux || commerciaux.length === 0) {
          console.warn('⚠️ Aucun commercial retourné par le serveur');
          this.topCommerciaux = [];
          this.isLoadingTopCommerciaux = false;
          return;
        }
        
        this.topCommerciaux = commerciaux.map(c => ({
          name: c.name,
          conventions: c.conventions,
          ca: c.ca,
          performance: Math.round(c.performance)
        }));
        console.log('✅ Top commerciaux transformés:', this.topCommerciaux);
        this.isLoadingTopCommerciaux = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement du top commerciaux:', error);
        console.error('📊 Détails de l\'erreur:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        this.isLoadingTopCommerciaux = false;
        // Garder un tableau vide en cas d'erreur
        this.topCommerciaux = [];
      }
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Charger la répartition par gouvernorat
   */
  loadRepartitionGouvernorat(): void {
    this.isLoadingGouvernorat = true;
    console.log('📊 Chargement de la répartition par gouvernorat...');
    
    const sub = this.decideurService.getRepartitionGouvernorat().subscribe({
      next: (data) => {
        console.log('✅ Répartition gouvernorat chargée:', data.length);
        this.gouvernoratData = data;
        this.isLoadingGouvernorat = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement de la répartition gouvernorat:', error);
        this.isLoadingGouvernorat = false;
        this.gouvernoratData = [];
      }
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Charger la répartition par structure
   */
  loadRepartitionStructure(): void {
    this.isLoadingStructure = true;
    console.log('📊 Chargement de la répartition par structure...');
    
    const sub = this.decideurService.getRepartitionStructure().subscribe({
      next: (data) => {
        console.log('✅ Répartition structure chargée:', data.length);
        this.structureData = data;
        this.isLoadingStructure = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement de la répartition structure:', error);
        this.isLoadingStructure = false;
        this.structureData = [];
      }
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Charger les données de performance (évolution du CA)
   */
  loadPerformanceData(): void {
    this.isLoadingPerformance = true;
    console.log('📈 Chargement des données de performance...');
    
    const sub = this.decideurService.getPerformanceData().subscribe({
      next: (data) => {
        console.log('✅ Performance chargée:', data.length);
        this.performanceData = data;
        this.isLoadingPerformance = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement de la performance:', error);
        this.isLoadingPerformance = false;
        this.performanceData = [];
      }
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Charger les activités récentes
   */
  loadRecentActivities(): void {
    this.isLoadingActivities = true;
    console.log('🔔 Chargement des activités récentes...');
    
    const sub = this.decideurService.getRecentActivities().subscribe({
      next: (data) => {
        console.log('✅ Activités chargées:', data.length);
        this.recentActivities = data;
        this.isLoadingActivities = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des activités:', error);
        this.isLoadingActivities = false;
        this.recentActivities = [];
      }
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Applique les filtres et met à jour les données
   */
  applyFilters(): void {
    console.log('🔍 Application des filtres:', this.filters);
    
    if (!this.allConventions || this.allConventions.length === 0) {
      console.log('⚠️ Aucune convention à filtrer');
      return;
    }
    
    // Filtrer les conventions
    let filtered = [...this.allConventions];
    
    // Filtre par statut de convention
    if (this.filters.statutConvention && this.filters.statutConvention !== 'tous') {
      filtered = filtered.filter(c => {
        const status = c.status?.toLowerCase();
        return status === this.filters.statutConvention;
      });
    }
    
    // Filtre par statut de facture
    if (this.filters.statutFacture && this.filters.statutFacture !== 'tous') {
      filtered = filtered.filter(c => c.statutFacture === this.filters.statutFacture);
    }
    
    // Filtre par gouvernorat
    if (this.filters.gouvernorats && this.filters.gouvernorats.length > 0) {
      filtered = filtered.filter(c => 
        this.filters.gouvernorats.includes(c.gouvernorat)
      );
    }
    
    // Filtre par structure
    if (this.filters.structures && this.filters.structures.length > 0) {
      filtered = filtered.filter(c => 
        this.filters.structures.includes(c.structure)
      );
    }
    
    // Filtre par application
    if (this.filters.applications && this.filters.applications.length > 0) {
      filtered = filtered.filter(c => 
        this.filters.applications.includes(c.application)
      );
    }
    
    this.conventionsData = filtered;
    this.totalItems = filtered.length;
    
    console.log(`✅ Filtres appliqués: ${this.allConventions.length} → ${filtered.length} conventions`);
  }

  /**
   * Réinitialise tous les filtres
   */
  resetFilters(): void {
    this.filters = {
      periode: 'mois',
      gouvernorats: [],
      structures: [],
      applications: [],
      statutConvention: 'tous',
      statutFacture: 'tous',
      dateDebut: null,
      dateFin: null
    };
    this.applyFilters();
  }

  /**
   * Met à jour les KPIs selon les filtres
   */
  private updateKPIs(): void {
    // Simulation - à remplacer par un appel API
    console.log('📊 Mise à jour des KPIs...');
  }

  /**
   * Met à jour les graphiques selon les filtres
   */
  private updateCharts(): void {
    // Simulation - à remplacer par un appel API
    console.log('📈 Mise à jour des graphiques...');
  }

  /**
   * Vérifie si la période personnalisée est sélectionnée
   */
  isCustomPeriod(): boolean {
    return this.filters.periode === 'personnalise';
  }

  getAlertClass(type: string): string {
    return `alert-${type}`;
  }

  getActivityColor(color: string): string {
    return color;
  }

  /**
   * Retourne la classe CSS selon le statut de la facture
   */
  getStatutClass(statut: string): string {
    const classes: any = {
      'payee': 'statut-payee',
      'impayee': 'statut-impayee',
      'en_attente': 'statut-en-attente',
      'en_retard': 'statut-en-retard'
    };
    return classes[statut] || '';
  }

  /**
   * Retourne le label du statut
   */
  getStatutLabel(statut: string): string {
    const labels: any = {
      'payee': 'Payée',
      'impayee': 'Impayée',
      'en_attente': 'En attente',
      'en_retard': 'En retard'
    };
    return labels[statut] || statut;
  }

  /**
   * Retourne l'icône du statut
   */
  getStatutIcon(statut: string): string {
    const icons: any = {
      'payee': 'check_circle',
      'impayee': 'cancel',
      'en_attente': 'schedule',
      'en_retard': 'warning'
    };
    return icons[statut] || 'help';
  }

  /**
   * Vérifie si l'échéance est dépassée
   */
  isEcheanceDepassee(echeance: Date): boolean {
    return new Date(echeance) < new Date();
  }

  /**
   * Export Excel
   */
  exportExcel(): void {
    console.log('📥 Export Excel...');
    // Implémenter l'export Excel
    alert('Export Excel en cours de développement');
  }

  /**
   * Export PDF
   */
  exportPDF(): void {
    console.log('📥 Export PDF...');
    // Implémenter l'export PDF
    alert('Export PDF en cours de développement');
  }

  /**
   * Voir les détails d'une convention
   */
  viewDetails(convention: any): void {
    console.log('👁️ Voir détails:', convention);
    // Naviguer vers la page de détails
  }

  /**
   * Modifier une convention
   */
  editConvention(convention: any): void {
    console.log('✏️ Modifier:', convention);
    // Naviguer vers la page d'édition
  }

  /**
   * Changement de page
   */
  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    console.log('📄 Page changée:', event);
  }

  /**
   * Supprimer un gouvernorat des filtres
   */
  removeGouvernorat(gouv: string): void {
    this.filters.gouvernorats = this.filters.gouvernorats.filter(g => g !== gouv);
    this.applyFilters();
  }

  /**
   * Supprimer une structure des filtres
   */
  removeStructure(struct: string): void {
    this.filters.structures = this.filters.structures.filter(s => s !== struct);
    this.applyFilters();
  }

  /**
   * Supprimer une application des filtres
   */
  removeApplication(app: string): void {
    this.filters.applications = this.filters.applications.filter(a => a !== app);
    this.applyFilters();
  }

  /**
   * Toggle mode sombre
   */
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  /**
   * Gérer l'action d'une alerte
   */
  handleAlertAction(alert: any): void {
    console.log('🔔 Action alerte:', alert);
    
    if (alert.action === 'Relancer') {
      // Afficher une confirmation avant de relancer
      if (confirm(`Voulez-vous vraiment relancer les factures en retard ?`)) {
        console.log('📧 Relance des factures en cours...');
        // Ici vous pouvez appeler un service pour envoyer les relances
        alert('Relances envoyées avec succès !');
      }
    } else if (alert.link) {
      // Naviguer vers le lien spécifié
      this.router.navigate([alert.link]);
    }
  }

  /**
   * Ouvrir la messagerie interne
   */
  openMessaging(): void {
    console.log('🔔 Clic sur icône message - Navigation vers /messaging');
    this.router.navigate(['/messaging']);
  }

  /**
   * Ouvrir les paramètres
   */
  openSettings(): void {
    console.log('⚙️ Ouvrir les paramètres');
    // À implémenter
  }

  /**
   * Effectuer une recherche
   */
  performSearch(): void {
    console.log('🔍 Recherche:', this.searchQuery);
    // Implémenter la logique de recherche
  }

  /**
   * Toggle menu utilisateur
   */
  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  /**
   * Obtenir avatar par défaut
   */
  getDefaultAvatar(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0RjhERjkiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTRDOC42ODYyOSAxNCA2IDE2LjY4NjMgNiAyMEgxOEMxOCAxNi42ODYzIDE1LjMxMzcgMTQgMTIgMTRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+';
  }

  /**
   * Charger les structures depuis le backend
   */
  loadStructures(): void {
    console.log('🏢 Chargement des structures...');
    
    const sub = this.decideurService.getStructures().subscribe({
      next: (data) => {
        console.log('✅ Structures chargées:', data.length);
        this.structures = data;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des structures:', error);
      }
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Charger les applications depuis le backend
   */
  loadApplications(): void {
    console.log('📱 Chargement des applications...');
    
    const sub = this.decideurService.getApplications().subscribe({
      next: (data) => {
        console.log('✅ Applications chargées:', data.length);
        this.applications = data;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des applications:', error);
      }
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Vérifier les anomalies KPI et mettre à jour les cartes
   */
  checkKpiAnomalies(): void {
    // Calculer le taux de retard
    const totalInvoices = this.allConventions.length;
    const overdueInvoices = this.allConventions.filter(c => c.statutFacture === 'OVERDUE').length;
    const tauxRetard = totalInvoices > 0 ? (overdueInvoices * 100) / totalInvoices : 0;
    
    // Calculer le montant impayé
    const montantImpaye = this.allConventions
      .filter(c => c.statutFacture === 'OVERDUE' || c.statutFacture === 'PENDING')
      .reduce((sum, c) => sum + (c.montant || 0), 0);
    
    // Seuils d'alerte
    const SEUIL_TAUX_RETARD = 15; // 15%
    const SEUIL_MONTANT_IMPAYE = 30000; // 30,000 TND
    
    // Vérifier Factures en Attente (correspond au taux de retard)
    const facturesAttenteKpi = this.kpis.find(k => k.kpiType === 'FACTURES_ATTENTE');
    if (facturesAttenteKpi && tauxRetard > SEUIL_TAUX_RETARD) {
      facturesAttenteKpi.hasAlert = true;
      facturesAttenteKpi.alertSeverity = tauxRetard > 30 ? 'HIGH' : 'MEDIUM';
      facturesAttenteKpi.alertMessage = `⚠️ Taux de retard élevé: ${tauxRetard.toFixed(1)}% (${overdueInvoices}/${totalInvoices} factures)`;
      facturesAttenteKpi.color = 'warn';
    }
    
    // Vérifier Montant impayé
    const facturesPayeesKpi = this.kpis.find(k => k.kpiType === 'FACTURES_PAYEES');
    if (facturesPayeesKpi && montantImpaye > SEUIL_MONTANT_IMPAYE) {
      facturesPayeesKpi.hasAlert = true;
      facturesPayeesKpi.alertSeverity = montantImpaye > 50000 ? 'HIGH' : 'MEDIUM';
      facturesPayeesKpi.alertMessage = `⚠️ Montant impayé élevé: ${montantImpaye.toFixed(0)} TND`;
      facturesPayeesKpi.color = 'warn';
    }
    
    console.log('🔍 Vérification anomalies KPI:', {
      tauxRetard: tauxRetard.toFixed(1) + '%',
      overdueInvoices,
      totalInvoices,
      montantImpaye: montantImpaye.toFixed(0) + ' TND',
      alertes: this.kpis.filter(k => k.hasAlert).length
    });
  }
  
  /**
   * Afficher les détails d'une alerte KPI
   */
  viewKpiAlertDetails(kpi: any): void {
    console.log('📊 Afficher détails alerte KPI:', kpi);
    // Scroll vers la section des alertes détaillées
    this.scrollToSection('kpi-alerts-section');
  }

  /**
   * Basculer l'affichage du chatbot dans le dashboard
   */
  openChatbot(): void {
    console.log('🤖 Basculer chatbot:', !this.isChatbotOpen);
    this.isChatbotOpen = !this.isChatbotOpen;
  }
  
  /**
   * Fermer le chatbot
   */
  closeChatbot(): void {
    console.log('🤖 Fermer chatbot');
    this.isChatbotOpen = false;
  }

  /**
   * Déconnexion
   */
  logout(): void {
    console.log('Déconnexion');
    // Implémenter la logique de déconnexion
  }

  /**
   * Scroll vers une section spécifique du dashboard
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
      console.log(`📍 Navigation vers la section: ${sectionId}`);
    } else {
      console.warn(`⚠️ Section non trouvée: ${sectionId}`);
    }
  }
}
