import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConventionDialogComponent } from './convention-dialog.component';
import { EventDetailsModalComponent } from './event-details-modal.component';
import { ConventionHistoryModalComponent } from './convention-history-modal.component';
import { ConventionInvoicesDialogComponent } from '../../features/convention-management/convention-invoices-dialog/convention-invoices-dialog.component';
import { ProfileSectionComponent } from '../../shared/components/profile-section/profile-section.component';
import { ChangePasswordModalComponent } from '../../shared/components/change-password-modal/change-password-modal.component';
import { MessagingPanelComponent } from '../../shared/components/messaging-panel/messaging-panel.component';
import { NotificationPreferencesComponent } from '../../shared/components/notification-preferences/notification-preferences.component';
import { ExportService } from '../../shared/services/export.service';
import { AuthService } from '../../core/services/auth.service';
import { WebSocketNotificationService, WebSocketNotification } from '../../services/websocket-notification.service';

interface Convention {
  id: string;
  reference: string;
  title: string;
  description: string;
  status: string;
  amount: number;
  dueDate: Date;
  governorate: string;
  tag?: string;
  createdAt: Date;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  conventionReference: string;
  amount: number;
  status: string;
  dueDate: Date;
}

interface KPIMetrics {
  totalConventions: number;
  activeConventions: number;
  expiredConventions: number;
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  collectionRate: number;
  averagePaymentTime: number;
  monthlyRevenue: number;
  pendingAmount: number;
}

interface AuditEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PAYMENT' | 'STATUS_CHANGE' | 'EXPORT';
  entityType: 'CONVENTION' | 'FACTURE';
  entityId: string;
  entityReference: string;
  description: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  details?: string;
}

@Component({
  selector: 'app-commercial-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    MatInputModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatTabsModule,
    MatMenuModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    ProfileSectionComponent,
    MessagingPanelComponent,
    NotificationPreferencesComponent
  ],
  templateUrl: './commercial-dashboard.component.html',
  styleUrls: ['./commercial-dashboard.component.scss']
})
export class CommercialDashboardComponent implements OnInit, AfterViewInit {

  // User info
  currentUser: any = { username: 'commercial' };
  currentDate = new Date();

  // Sidebar
  activeSection = 'dashboard';

  // Header properties (identique au dashboard admin)
  searchQuery = '';
  hasNotifications = false;
  notificationCount = 3;
  hasMessages = false;
  messageCount = 0;
  darkMode = false;
  userMenuOpen = false;
  notificationPanelOpen = false;

  // Notifications de test
  notifications: any[] = [
    {
      id: '1',
      title: 'Rappel de facture',
      message: 'La facture INV-2025-001 arrive à échéance dans 3 jours',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      type: 'WARNING',
      icon: 'warning'
    },
    {
      id: '2',
      title: 'Paiement reçu',
      message: 'Paiement de 1500€ reçu pour la facture INV-2024-999',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: false,
      type: 'SUCCESS',
      icon: 'check_circle'
    },
    {
      id: '3',
      title: 'Convention expirée',
      message: 'La convention CONV-2024-050 est arrivée à terme',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      type: 'INFO',
      icon: 'info'
    }
  ];

  // Nouvelles propriétés pour la restructuration
  activeTabIndex = 0;
  notificationSubTabIndex = 0; // 0 = Alertes Système, 1 = SMS/Email
  searchTerm = '';
  selectedStatusFilter: string | null = null;

  // Propriétés pour le calendrier
  currentCalendarDate = new Date();
  calendarDays: any[] = [];
  monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  // Propriétés pour les événements
  allEvents: any[] = [];
  upcomingEventsDataSource = new MatTableDataSource<any>([]);
  recentEventsDataSource = new MatTableDataSource<any>([]);
  @ViewChild('upcomingEventsPaginator') upcomingEventsPaginator!: MatPaginator;
  @ViewChild('recentEventsPaginator') recentEventsPaginator!: MatPaginator;

  // Pagination manuelle pour les événements
  upcomingEventsPageIndex = 0;
  upcomingEventsPageSize = 5;
  recentEventsPageIndex = 0;
  recentEventsPageSize = 5;

  // Pagination pour l'historique
  historyPageIndex = 0;
  historyPageSize = 5;

  // Pagination pour les échéances
  dueDatesPageIndex = 0;
  dueDatesPageSize = 5;

  // Pagination pour les échéances en retard
  overdueDatesPageIndex = 0;
  overdueDatesPageSize = 5;

  // Système d'audit
  auditLog: AuditEntry[] = [];

  // KPI et métriques (initialisés à 0, seront mis à jour avec les données réelles)
  kpiMetrics: KPIMetrics = {
    totalConventions: 0,
    activeConventions: 0,
    expiredConventions: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    collectionRate: 0,
    averagePaymentTime: 0,
    monthlyRevenue: 0,
    pendingAmount: 0
  };

  // Filtres avancés
  showAdvancedFilters = false;

  // Données de test
  conventions: Convention[] = []; // Données chargées depuis la base de données

  invoices: Invoice[] = []; // Données chargées depuis la base de données

  filteredConventions: Convention[] = [];
  filteredInvoices: Invoice[] = [];

  // DataSources pour les tableaux avec pagination
  conventionDataSource = new MatTableDataSource<Convention>([]);
  invoiceDataSource = new MatTableDataSource<Invoice>([]);
  filteredStatusInvoiceDataSource = new MatTableDataSource<Invoice>([]);

  // ViewChild pour les paginators
  @ViewChild('conventionPaginator') conventionPaginator!: MatPaginator;
  @ViewChild('invoicePaginator') invoicePaginator!: MatPaginator;
  overdueInvoices: Invoice[] = [];
  upcomingInvoices: Invoice[] = [];

  // Sélection multiple
  selectedConventions: string[] = [];
  selectedInvoices: string[] = [];
  selection = new SelectionModel<Convention>(true, []);

  // États de chargement
  loading = {
    conventions: false,
    invoices: false,
    kpi: false,
    notifications: false
  };

  // Table columns
  conventionColumns: string[] = ['select', 'reference', 'title', 'governorate', 'status', 'amount', 'dueDate', 'tags', 'actions'];
  invoiceColumns: string[] = ['select', 'invoiceNumber', 'convention', 'amount', 'status', 'dueDate', 'overdue', 'actions'];

  // Structures et gouvernorats
  structures: { id: string, name: string }[] = [
    { id: 'structure-1', name: 'Structure Tunis' },
    { id: 'structure-2', name: 'Structure Sfax' },
    { id: 'structure-3', name: 'Structure Sousse' }
  ];
  governorates: string[] = ['Tunis', 'Sfax', 'Sousse', 'Monastir', 'Gabès', 'Gafsa'];
  statuses: string[] = ['ACTIVE', 'PENDING', 'EXPIRED', 'COMPLETED'];
  invoiceStatuses: string[] = ['PENDING', 'PAID', 'OVERDUE', 'PARTIAL'];

  // Tags disponibles
  availableTags: string[] = ['Prioritaire', 'Important', 'Urgent', 'Nouveau', 'Renouvellement'];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private wsNotificationService: WebSocketNotificationService
  ) {
    console.log('CommercialDashboardComponent chargé');
  }

  ngOnInit(): void {
    console.log('🚀 CommercialDashboard ngOnInit() appelé');
    this.loadCurrentUser();  // ✅ Charger l'utilisateur connecté
    this.loadDashboardData();
    this.generateCalendar();
    this.initializeWebSocketNotifications();  // ✅ Initialiser WebSocket
  }

  /**
   * Initialiser les notifications WebSocket en temps réel
   */
  initializeWebSocketNotifications(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const userId = user.id;
      
      console.log('🔌 Connexion WebSocket pour notifications temps réel...');
      this.wsNotificationService.connect(userId);
      
      // S'abonner aux notifications
      this.wsNotificationService.notifications$.subscribe((notifications: WebSocketNotification[]) => {
        console.log('📬 Notifications WebSocket reçues:', notifications.length);
        
        // Mettre à jour le compteur de notifications
        const unreadCount = notifications.filter(n => !n.read).length;
        this.notificationCount = unreadCount;
        this.hasNotifications = unreadCount > 0;
        
        // Afficher un snackbar pour les nouvelles notifications
        if (notifications.length > 0 && !notifications[0].read) {
          const latestNotif = notifications[0];
          this.snackBar.open(
            `🔔 ${latestNotif.title}: ${latestNotif.message}`,
            'Voir',
            { 
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['notification-snackbar']
            }
          );
        }
      });
      
      // Surveiller le statut de connexion
      this.wsNotificationService.connectionStatus$.subscribe((connected: boolean) => {
        if (connected) {
          console.log('✅ WebSocket connecté avec succès');
          this.snackBar.open('✅ Notifications temps réel activées', '', { duration: 2000 });
        } else {
          console.log('❌ WebSocket déconnecté');
        }
      });
    }
  }

  /**
   * Charge les informations de l'utilisateur connecté
   */
  loadCurrentUser(): void {
    console.log('👤 Chargement de l\'utilisateur connecté...');
    this.http.get<any>('http://localhost:8085/api/commercial/dashboard/me').subscribe({
      next: (user) => {
        this.currentUser = user;
        console.log('✅ Utilisateur chargé:', user);
        console.log('📛 Nom:', user.name);
        console.log('🎭 Rôle:', user.role);
        console.log('📊 Statistiques:', user.statistics);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement de l\'utilisateur:', error);
        this.currentUser = { username: 'commercial', name: 'Commercial', role: 'COMMERCIAL' };
      }
    });
  }

  ngAfterViewInit(): void {
    // Connecter les paginators aux datasources
    if (this.conventionPaginator) {
      this.conventionDataSource.paginator = this.conventionPaginator;
    }
    if (this.invoicePaginator) {
      this.invoiceDataSource.paginator = this.invoicePaginator;
    }
    if (this.upcomingEventsPaginator) {
      this.upcomingEventsDataSource.paginator = this.upcomingEventsPaginator;
    }
    if (this.recentEventsPaginator) {
      this.recentEventsDataSource.paginator = this.recentEventsPaginator;
    }
  }

  // Méthodes de sélection
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.conventionDataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.selectedConventions = [];
    } else {
      this.conventionDataSource.data.forEach(row => {
        this.selection.select(row);
        if (!this.selectedConventions.includes(row.id)) {
          this.selectedConventions.push(row.id);
        }
      });
    }
  }

  loadDashboardData(): void {
    console.log('🔄 loadDashboardData() appelé - Chargement des données depuis la base de données...');

    // Charger les conventions depuis la base de données
    // Les factures seront chargées automatiquement après les conventions
    this.loadConventions();
  }

  // Charger les conventions depuis la base de données
  loadConventions(): void {
    console.log('📋 Chargement des conventions...');

    const token = localStorage.getItem('token');
    console.log('🔑 Token dans localStorage:', token ? 'présent' : 'absent');
    if (token) {
      console.log('🔑 Token (premiers caractères):', token.substring(0, 50) + '...');
    }

    const headers = this.getAuthHeaders();
    console.log('🔑 Headers d\'authentification:', headers);

    this.http.get<any[]>('http://localhost:8085/api/conventions', { headers })
      .subscribe({
        next: (conventions: any[]) => {
          console.log('✅ Conventions chargées depuis la DB:', conventions.length);
          console.log('📊 Détail des conventions:', conventions);
          this.conventions = conventions;
          this.filteredConventions = [...conventions];
          this.conventionDataSource.data = conventions;
          console.log('📊 this.conventions après assignation:', this.conventions.length);
          console.log('📊 this.filteredConventions après assignation:', this.filteredConventions.length);
          console.log('📊 Contenu de filteredConventions:', this.filteredConventions);

          // Mettre à jour les KPI avec les données réelles
          this.updateKPIMetrics();

          // Régénérer le calendrier avec les nouvelles données
          this.generateCalendar();

          // Charger les factures après avoir chargé les conventions
          this.loadInvoices();
        },
        error: (error: any) => {
          console.error('❌ Erreur lors du chargement des conventions:', error);
          console.error('❌ Status:', error.status);
          console.error('❌ Message:', error.message);
          console.error('❌ URL:', error.url);
          console.error('❌ Headers envoyés:', headers);
          this.conventions = [];
          this.filteredConventions = [];
          this.conventionDataSource.data = [];
        }
      });
  }

  // Actions sur les conventions
  createConvention(): void {
    console.log('🚀 createConvention() appelé');
    const dialogRef = this.dialog.open(ConventionDialogComponent, {
      width: '700px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('📋 Dialog fermé avec résultat:', result);
      if (result) {
        console.log('🔄 Création d\'une nouvelle convention...');
        console.log('📋 Données à envoyer:', JSON.stringify(result, null, 2));
        console.log('🔑 Headers d\'authentification:', this.getAuthHeaders());

        // Appel à l'API pour créer la convention
        this.http.post<any>('http://localhost:8085/api/conventions', result, { headers: this.getAuthHeaders() })
          .subscribe({
            next: (newConvention: any) => {
              console.log('✅ Convention créée dans la DB:', newConvention);
              this.snackBar.open('Convention créée avec succès', 'Fermer', { duration: 3000 });

              // Recharger les données depuis la base
              this.loadConventions();
              this.loadInvoices(); // Les factures sont générées automatiquement
            },
            error: (error: any) => {
              console.error('❌ Erreur lors de la création de la convention:', error);
              console.error('❌ Status:', error.status);
              console.error('❌ Message:', error.message);
              console.error('❌ URL:', error.url);
              console.error('❌ Headers envoyés:', this.getAuthHeaders());
              this.snackBar.open('Erreur lors de la création de la convention', 'Fermer', { duration: 5000 });
            }
          });
      } else {
        console.log('❌ Aucune donnée reçue du dialog');
      }
    });
  }

  // Actions sur les factures
  generateInvoiceBatch(): void {
    if (this.selectedConventions.length === 0) {
      this.snackBar.open('Veuillez sélectionner au moins une convention', 'Fermer', { duration: 3000 });
      return;
    }
    this.snackBar.open(`${this.selectedConventions.length} factures générées avec succès`, 'Fermer', { duration: 3000 });
    this.selectedConventions = [];
  }

  // Export et rapports - DÉPLACÉ VERS LA FIN DU FICHIER (voir ligne 1052+)

  // Sélection multiple
  toggleConventionSelection(conventionId: string): void {
    const index = this.selectedConventions.indexOf(conventionId);
    if (index > -1) {
      this.selectedConventions.splice(index, 1);
      const convention = this.filteredConventions.find(c => c.id === conventionId);
      if (convention) {
        this.selection.deselect(convention);
      }
    } else {
      this.selectedConventions.push(conventionId);
      const convention = this.filteredConventions.find(c => c.id === conventionId);
      if (convention) {
        this.selection.select(convention);
      }
    }
  }

  toggleInvoiceSelection(invoiceId: string): void {
    const index = this.selectedInvoices.indexOf(invoiceId);
    if (index > -1) {
      this.selectedInvoices.splice(index, 1);
    } else {
      this.selectedInvoices.push(invoiceId);
    }
  }

  // Méthodes utilitaires
  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'status-active';
      case 'PENDING': return 'status-pending';
      case 'EXPIRED': return 'status-expired';
      case 'COMPLETED': return 'status-completed';
      default: return 'status-default';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Actif';
      case 'PENDING': return 'En attente';
      case 'EXPIRED': return 'Expiré';
      case 'COMPLETED': return 'Terminé';
      default: return status;
    }
  }

  getInvoiceStatusClass(status: string): string {
    switch (status) {
      case 'PAID': return 'status-paid';
      case 'PENDING': return 'status-pending';
      case 'OVERDUE': return 'status-overdue';
      case 'PARTIAL': return 'status-partial';
      default: return 'status-default';
    }
  }

  getInvoiceStatusLabel(status: string): string {
    switch (status) {
      case 'PAID': return 'Payée';
      case 'PENDING': return 'En attente';
      case 'OVERDUE': return 'En retard';
      case 'PARTIAL': return 'Partiel';
      default: return status;
    }
  }

  isOverdue(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj < new Date();
  }

  getDaysOverdue(dueDate: Date | string): number {
    // Convertir en Date si c'est une string
    const date = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const diffTime = Math.abs(new Date().getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getTagClass(tag: string): string {
    switch ((tag || '').toLowerCase()) {
      case 'important': return 'tag-important';
      case 'prioritaire': return 'tag-prioritaire';
      case 'renouvellement': return 'tag-renouvellement';
      case 'urgent': return 'tag-urgent';
      default: return 'tag-default';
    }
  }

  // Calculs KPI
  getCollectionRate(): number {
    return this.kpiMetrics.collectionRate;
  }

  getAveragePaymentTime(): number {
    return this.kpiMetrics.averagePaymentTime;
  }

  getPendingAmount(): number {
    return this.kpiMetrics.pendingAmount;
  }

  // Filtres
  clearFilters(): void {
    this.filteredConventions = [...this.conventions];
    this.filteredInvoices = [...this.invoices];
    this.conventionDataSource.data = this.conventions;
    this.invoiceDataSource.data = this.invoices;
  }

  onConventionSearch(event: any): void {
    const query = event.target.value.toLowerCase();
    if (query) {
      this.filteredConventions = this.conventions.filter(conv =>
        conv.reference.toLowerCase().includes(query) ||
        conv.title.toLowerCase().includes(query)
      );
      this.conventionDataSource.data = this.filteredConventions;
    } else {
      this.filteredConventions = [...this.conventions];
      this.conventionDataSource.data = this.conventions;
    }
  }

  // Actions sur les conventions
  editConvention(convention: Convention): void {
    console.log('📝 Édition de la convention:', convention);
    const dialogRef = this.dialog.open(ConventionDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { mode: 'edit', convention: convention }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('💾 Données de modification reçues:', result);

        // Afficher un indicateur de chargement
        const loadingSnackBar = this.snackBar.open('⏳ Mise à jour de la convention...', '', {
          duration: 0
        });

        // Appel API pour mettre à jour la convention dans la base de données
        this.http.put(`http://localhost:8085/api/conventions/${convention.id}`, result,
          { headers: this.getAuthHeaders() })
          .subscribe({
            next: (updatedConvention: any) => {
              loadingSnackBar.dismiss();
              console.log('✅ Convention mise à jour avec succès:', updatedConvention);

              // Recharger les conventions depuis la base de données pour garantir la cohérence
              this.loadConventions();

              this.snackBar.open(
                `✅ Convention ${updatedConvention.reference} modifiée avec succès`,
                'Fermer',
                { duration: 5000, panelClass: ['success-snackbar'] }
              );
            },
            error: (error) => {
              loadingSnackBar.dismiss();
              console.error('❌ Erreur lors de la mise à jour de la convention:', error);

              let errorMessage = 'Erreur lors de la mise à jour de la convention';
              if (error.status === 403) {
                errorMessage = 'Vous n\'avez pas les permissions nécessaires';
              } else if (error.error?.message) {
                errorMessage = error.error.message;
              }

              this.snackBar.open(errorMessage, 'Fermer', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });
      }
    });
  }

  createInvoiceForConvention(convention: Convention): void {
    console.log('Création de facture pour la convention:', convention);
    this.snackBar.open(`Création de facture pour ${convention.reference}`, 'Fermer', { duration: 3000 });

    // Simuler la création d'une facture
    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `FACT-${convention.reference}-${Date.now()}`,
      conventionReference: convention.reference,
      amount: convention.amount * 0.3, // 30% du montant de la convention
      status: 'PENDING',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 jours
    };

    this.invoices.unshift(newInvoice);
    this.filteredInvoices = [...this.invoices];
    this.invoiceDataSource.data = this.invoices;

    this.snackBar.open(`Facture créée: ${newInvoice.invoiceNumber}`, 'Fermer', { duration: 3000 });
  }

  deleteConvention(convention: Convention): void {
    console.log('🗑️ Suppression de la convention:', convention);

    if (confirm(`Êtes-vous sûr de vouloir supprimer la convention ${convention.reference} ?\n\nCette action supprimera aussi toutes les factures associées.`)) {
      // Appel à l'API pour supprimer la convention
      this.http.delete(`http://localhost:8085/api/conventions/${convention.id}`, { headers: this.getAuthHeaders() })
        .subscribe({
          next: () => {
            console.log('✅ Convention supprimée de la DB');
            this.snackBar.open('Convention supprimée avec succès', 'Fermer', { duration: 3000 });

            // Recharger les données depuis la base
            this.loadConventions();
            this.loadInvoices(); // Les factures associées sont supprimées automatiquement
          },
          error: (error: any) => {
            console.error('❌ Erreur lors de la suppression de la convention:', error);
            this.snackBar.open('Erreur lors de la suppression de la convention', 'Fermer', { duration: 5000 });
          }
        });
    }
  }

  viewConventionInvoices(convention: Convention): void {
    console.log('📄 Affichage des factures pour la convention:', convention);
    this.dialog.open(ConventionInvoicesDialogComponent, {
      width: '1000px',
      maxWidth: '95vw',
      data: { convention }
    });
  }

  // Actions sur les factures
  editInvoice(invoice: Invoice): void {
    console.log('Édition de la facture:', invoice);
    this.snackBar.open(`Édition de la facture ${invoice.invoiceNumber}`, 'Fermer', { duration: 3000 });
  }

  viewInvoiceDetails(invoice: Invoice, type: 'overdue' | 'upcoming' = 'overdue'): void {
    console.log('👁️ viewInvoiceDetails appelé avec:', invoice);

    if (!invoice) {
      console.error('❌ Invoice est null ou undefined');
      this.snackBar.open('Erreur: Facture introuvable', 'Fermer', { duration: 3000 });
      return;
    }

    // Déterminer le type basé sur le statut de la facture
    const modalType = this.isOverdue(invoice.dueDate) ? 'overdue' : 'upcoming';

    // Ouvrir le modal avec les détails de la facture
    const dialogRef = this.dialog.open(EventDetailsModalComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: { invoice, type: modalType }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'sendReminder') {
          this.sendReminderWithConfirmation(result.invoice);
        } else if (result.action === 'viewFullDetails') {
          // Navigation vers l'onglet factures avec sélection de la facture
          this.navigateToInvoiceDetails(result.invoice);
        }
      }
    });
  }

  deleteInvoice(invoice: Invoice): void {
    console.log('🗑️ Suppression de la facture:', invoice);

    if (confirm(`Êtes-vous sûr de vouloir supprimer la facture ${invoice.invoiceNumber} ?`)) {
      // Appel à l'API pour supprimer la facture
      this.http.delete(`http://localhost:8085/api/invoices/${invoice.id}`, { headers: this.getAuthHeaders() })
        .subscribe({
          next: () => {
            console.log('✅ Facture supprimée de la DB');
            this.snackBar.open('Facture supprimée avec succès', 'Fermer', { duration: 3000 });

            // Recharger les données depuis la base
            this.loadInvoices();
          },
          error: (error: any) => {
            console.error('❌ Erreur lors de la suppression de la facture:', error);
            this.snackBar.open('Erreur lors de la suppression de la facture', 'Fermer', { duration: 5000 });
          }
        });
    }
  }


  generateInvoices(): void {
    console.log('Génération de factures en lot');
    this.snackBar.open('Génération de factures en cours...', 'Fermer', { duration: 3000 });
  }

  exportData(): void {
    console.log('📊 Export des données - redirection vers exportConventions');
    // Par défaut, exporter les conventions en Excel
    this.exportConventions('excel');
  }

  // Actions sur les factures
  sendReminder(invoice: Invoice): void {
    console.log('🔔 sendReminder appelé avec:', invoice);

    if (!invoice) {
      console.error('❌ Invoice est null ou undefined');
      this.snackBar.open('Erreur: Facture introuvable', 'Fermer', { duration: 3000 });
      return;
    }

    // Utiliser invoiceNumber, ou id comme fallback
    const invoiceRef = invoice.invoiceNumber || invoice.id || 'Facture inconnue';

    // Afficher un indicateur de chargement
    const loadingSnackBar = this.snackBar.open(`📤 Envoi du rappel pour ${invoiceRef}...`, '', {
      duration: 0
    });

    // Appel API pour envoyer le rappel (Email + SMS)
    this.http.post(`http://localhost:8085/api/invoices/${invoice.id}/send-reminder`, {
      type: 'multi-channel' // Email + SMS
    }, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (response: any) => {
          loadingSnackBar.dismiss();
          console.log('✅ Rappel envoyé avec succès:', response);

          // Afficher la confirmation détaillée
          let successMessage = `✅ Rappel envoyé pour ${invoiceRef}`;
          if (response.emailSent) successMessage += ' 📧';
          if (response.smsSent) successMessage += ' 📱';

          this.snackBar.open(successMessage, 'Fermer', {
            duration: 6000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          loadingSnackBar.dismiss();
          console.error('❌ Erreur lors de l\'envoi du rappel:', error);

          let errorMessage = 'Erreur lors de l\'envoi du rappel';
          if (error.error?.message) {
            errorMessage = error.error.message;
          }

          this.snackBar.open(errorMessage, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  markAsPaid(invoice: Invoice): void {
    console.log('Marquage comme payée pour la facture:', invoice);

    if (!invoice || !invoice.id) {
      console.error('❌ Invoice invalide');
      this.snackBar.open('Erreur: Facture invalide', 'Fermer', { duration: 3000 });
      return;
    }

    const invoiceRef = invoice.invoiceNumber || invoice.id;

    // Afficher un indicateur de chargement
    const loadingSnackBar = this.snackBar.open(`⏳ Mise à jour du statut de ${invoiceRef}...`, '', {
      duration: 0
    });

    // Appel API pour mettre à jour le statut dans la base de données
    this.http.put(`http://localhost:8085/api/invoices/${invoice.id}/status?status=PAID`, {},
      { headers: this.getAuthHeaders() })
      .subscribe({
        next: (response: any) => {
          loadingSnackBar.dismiss();
          console.log('✅ Statut mis à jour avec succès:', response);

          // Mettre à jour l'état local après confirmation du backend
          invoice.status = 'PAID';

          // Recharger les factures pour s'assurer de la cohérence
          this.loadInvoices();

          this.snackBar.open(
            `✅ Facture ${invoiceRef} marquée comme payée`,
            'Fermer',
            { duration: 5000, panelClass: ['success-snackbar'] }
          );
        },
        error: (error) => {
          loadingSnackBar.dismiss();
          console.error('❌ Erreur lors de la mise à jour du statut:', error);

          let errorMessage = 'Erreur lors de la mise à jour du statut';
          if (error.status === 403) {
            errorMessage = 'Vous n\'avez pas les permissions nécessaires';
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          }

          this.snackBar.open(errorMessage, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  // Nouvelle méthode: Envoyer un rappel avec confirmation visuelle (PRODUCTION)
  sendReminderWithConfirmation(invoice: Invoice): void {
    console.log('🔔 Envoi de rappel multi-canal pour:', invoice);

    if (!invoice) {
      console.error('❌ Invoice est null ou undefined');
      this.snackBar.open('Erreur: Facture introuvable', 'Fermer', { duration: 3000 });
      return;
    }

    const invoiceRef = invoice.invoiceNumber || invoice.id || 'Facture inconnue';

    // Afficher un snackbar de chargement
    const loadingSnackBar = this.snackBar.open(`📤 Envoi du rappel multi-canal pour ${invoiceRef}...`, '', {
      duration: 0  // Pas de timeout automatique
    });

    // Appel API réel pour envoyer le rappel (Email + SMS + WebSocket)
    this.http.post(`http://localhost:8085/api/invoices/${invoice.id}/send-reminder`, {
      invoiceId: invoice.id,
      invoiceNumber: invoiceRef,
      amount: invoice.amount,
      dueDate: invoice.dueDate,
      channels: ['email', 'sms', 'websocket']  // Multi-canal
    }, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (response: any) => {
          loadingSnackBar.dismiss();

          console.log('✅ Rappel envoyé avec succès:', response);
          console.log('📊 Type de response:', typeof response);
          console.log('📊 Response est null?', response === null);
          console.log('📊 Response est undefined?', response === undefined);

          // Vérifier si la réponse est null ou undefined
          if (!response) {
            console.error('❌ La réponse du serveur est null ou undefined');
            this.snackBar.open('⚠️ Rappel envoyé mais réponse serveur invalide', 'Fermer', {
              duration: 5000,
              panelClass: ['warning-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            return;
          }

          // Afficher la confirmation détaillée
          let successMessage = `✅ Rappel envoyé pour ${invoiceRef}`;
          if (response.emailSent) successMessage += ' 📧';
          if (response.smsSent) successMessage += ' 📱';
          if (response.websocketSent) successMessage += ' 🔔';

          this.snackBar.open(successMessage, 'Fermer', {
            duration: 6000,
            panelClass: ['success-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        },
        error: (error) => {
          loadingSnackBar.dismiss();

          console.error('❌ Erreur lors de l\'envoi du rappel:', error);
          console.error('❌ Status:', error.status);
          console.error('❌ Error object:', error.error);
          console.error('❌ Message:', error.message);

          // Message d'erreur détaillé
          let errorMessage = '❌ Erreur lors de l\'envoi du rappel';
          if (error.error && error.error.message) {
            errorMessage += ': ' + error.error.message;
          } else if (error.message) {
            errorMessage += ': ' + error.message;
          }

          this.snackBar.open(errorMessage, 'Fermer', {
            duration: 7000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
  }

  // Nouvelle méthode: Naviguer vers les détails de la facture avec sélection
  navigateToInvoiceDetails(invoice: Invoice): void {
    console.log('📋 Navigation vers les détails de la facture:', invoice);

    if (!invoice) {
      console.error('❌ Invoice est null ou undefined');
      return;
    }

    // Naviguer vers l'onglet Factures
    this.activeTabIndex = 1; // Onglet Factures
    this.activeSection = 'invoices';

    // Réorganiser les factures pour mettre la facture sélectionnée en premier
    const invoiceIndex = this.invoices.findIndex(inv => inv.id === invoice.id);
    if (invoiceIndex > -1) {
      // Retirer la facture de sa position actuelle
      const selectedInvoice = this.invoices.splice(invoiceIndex, 1)[0];
      // L'ajouter au début
      this.invoices.unshift(selectedInvoice);
      // Mettre à jour le dataSource
      this.invoiceDataSource.data = [...this.invoices];

      // Réinitialiser le paginator à la première page
      if (this.invoicePaginator) {
        this.invoicePaginator.firstPage();
      }
    }

    // Attendre que l'onglet soit chargé puis scroller et mettre en surbrillance
    setTimeout(() => {
      // Scroller vers la section des onglets
      const tabsSection = document.querySelector('.tabs-section');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Mettre en surbrillance la facture dans le tableau
      setTimeout(() => {
        this.highlightInvoiceRow(invoice.id);
      }, 500);
    }, 100);

    // Afficher un message de confirmation
    const invoiceRef = invoice.invoiceNumber || invoice.id || 'Facture';
    this.snackBar.open(`📋 Affichage de la facture ${invoiceRef}`, 'Fermer', { duration: 3000 });
  }

  // Méthode pour mettre en surbrillance une ligne de facture
  highlightInvoiceRow(invoiceId: string): void {
    // Trouver la ligne du tableau correspondant à la facture
    const rows = document.querySelectorAll('.data-table tbody tr');
    rows.forEach((row: any) => {
      row.classList.remove('highlighted-row');
    });

    // Trouver et mettre en surbrillance la première ligne (car on l'a mise en premier)
    if (rows.length > 0) {
      const firstRow = rows[0] as HTMLElement;
      firstRow.classList.add('highlighted-row');

      // Scroller vers la ligne avec un petit délai
      setTimeout(() => {
        firstRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);

      // Retirer la surbrillance après 8 secondes
      setTimeout(() => {
        firstRow.classList.remove('highlighted-row');
      }, 8000);
    }
  }

  // Gestion des tags
  addTagToConvention(convention: Convention, tag: string): void {
    console.log('Ajout du tag', tag, 'à la convention:', convention);

    // Mettre à jour le tag de la convention
    convention.tag = tag;

    // Mettre à jour dans les listes
    const index = this.conventions.findIndex(c => c.id === convention.id);
    if (index !== -1) {
      this.conventions[index].tag = tag;
      this.filteredConventions = [...this.conventions];
    }

    this.snackBar.open(`Tag "${tag}" ajouté à la convention ${convention.reference}`, 'Fermer', { duration: 3000 });
  }

  // Méthodes pour la sidebar
  setActiveSection(section: string): void {
    this.activeSection = section;
    console.log('Section active:', section);

    // Actions spécifiques selon la section
    switch (section) {
      case 'new-convention':
        this.createConvention();
        break;
      case 'generate-invoice':
        this.generateInvoices();
        break;
      case 'invoice-status':
        // Naviguer vers l'onglet de suivi des statuts
        this.navigateToInvoiceStatusTracking();
        break;
      case 'due-dates':
        // Naviguer vers la vue des échéances
        this.navigateToDueDates();
        break;
      case 'events':
        // Naviguer vers la vue des événements
        this.navigateToEvents();
        break;
      case 'history':
        // Naviguer vers l'historique
        this.navigateToHistory();
        break;
      case 'reports':
        // Naviguer vers les rapports
        this.navigateToReports();
        break;
      case 'alerts':
        // Naviguer vers la gestion des alertes SMS/Email
        this.navigateToAlertsManagement();
        break;
      case 'exports':
        this.exportData();
        break;
      case 'profile':
        // Navigation vers le profil
        this.router.navigate(['/profile']);
        break;
      case 'settings':
        // Navigation vers les paramètres
        break;
    }
  }

  getDefaultAvatar(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0RjhERjkiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTRDOC42ODYyOSAxNCA2IDE2LjY4NjMgNiAyMEgxOEMxOCAxNi42ODYzIDE1LjMxMzcgMTQgMTIgMTRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+';
  }

  logout(): void {
    console.log('🚪 Déconnexion du commercial...');
    this.snackBar.open('Déconnexion en cours...', 'Fermer', { duration: 2000 });
    this.authService.logout();
    // Redirection vers la page d'accueil
    // this.router.navigate(['/home']);
  }

  // Méthode pour ouvrir le modal de changement de mot de passe
  openChangePasswordModal(): void {
    alert('CLIC DÉTECTÉ !');
    console.log('🔐 Ouverture du modal de changement de mot de passe...');

    try {
      const dialogRef = this.dialog.open(ChangePasswordModalComponent, {
        width: '500px',
        maxWidth: '90vw',
        disableClose: false,
        panelClass: 'change-password-dialog',
        hasBackdrop: true,
        backdropClass: 'custom-backdrop'
      });

      console.log('✅ Modal ouvert:', dialogRef);

      dialogRef.afterClosed().subscribe(result => {
        console.log('📋 Modal fermé avec résultat:', result);
        if (result?.success) {
          this.snackBar.open('✅ Mot de passe changé avec succès', 'Fermer', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'ouverture du modal:', error);
      alert('ERREUR: ' + error);
      this.snackBar.open('Erreur lors de l\'ouverture du modal', 'Fermer', { duration: 3000 });
    }
  }

  // Méthodes du header (même que admin)
  toggleNotifications() {
    console.log('🔔 Clic sur icône cloche détecté');
    this.notificationPanelOpen = !this.notificationPanelOpen;
    console.log('📋 Panneau notifications:', this.notificationPanelOpen ? 'OUVERT' : 'FERMÉ');
  }

  markNotificationAsRead(notification: any) {
    console.log('✅ Marquer comme lu:', notification.title);
    notification.read = true;
    this.updateNotificationCount();
  }

  markAllNotificationsAsRead() {
    console.log('✅ Marquer toutes comme lues');
    this.notifications.forEach(n => n.read = true);
    this.updateNotificationCount();
    this.notificationPanelOpen = false;
  }

  updateNotificationCount() {
    this.notificationCount = this.notifications.filter(n => !n.read).length;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'À l\'instant';
  }

  viewAllNotifications() {
    console.log('📄 Voir toutes les notifications');
    this.notificationPanelOpen = false;
    this.navigateToNotifications();
  }

  toggleMessages() {
    console.log('🔔 Clic sur icône message - Navigation vers /messaging');
    this.router.navigate(['/messaging']);
  }

  toggleSettings() {
    console.log('Toggle settings');
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    console.log('Toggle dark mode:', this.darkMode);
  }

  /**
   * Tester l'envoi d'une notification WebSocket
   */
  testWebSocketNotification(): void {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.snackBar.open('❌ Utilisateur non connecté', 'Fermer', { duration: 3000 });
      return;
    }

    const user = JSON.parse(userStr);
    const userId = user.id;

    console.log('🧪 Test de notification WebSocket pour userId:', userId);

    this.http.post(`http://localhost:8085/api/websocket-test/send-notification/${userId}`, {})
      .subscribe({
        next: (response: any) => {
          console.log('✅ Notification de test envoyée:', response);
          this.snackBar.open(
            '✅ Notification de test envoyée ! Vérifiez le badge de notifications.',
            'OK',
            { 
              duration: 5000,
              panelClass: ['success-snackbar']
            }
          );
        },
        error: (error) => {
          console.error('❌ Erreur lors du test:', error);
          this.snackBar.open(
            '❌ Erreur lors de l\'envoi de la notification de test',
            'Fermer',
            { duration: 3000 }
          );
        }
      });
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  goToProfile() {
    console.log('Navigation vers le profil');
    this.userMenuOpen = false;
    this.router.navigate(['/profile']);
  }

  performSearch() {
    console.log('Search query:', this.searchQuery);
    // Implémenter la logique de recherche
  }


  // Nouvelles méthodes pour la restructuration
  onTabChange(index: number): void {
    this.activeTabIndex = index;
    console.log('Onglet actif:', index);
  }

  drillDown(type: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    console.log('Drill-down:', type);

    switch (type) {
      case 'conventions':
        this.activeTabIndex = 0; // Onglet Conventions
        break;
      case 'conventions-active':
        this.activeTabIndex = 0;
        // Filtrer les conventions actives
        break;
      case 'conventions-expired':
        this.activeTabIndex = 0;
        // Filtrer les conventions expirées
        break;
      case 'invoices':
        this.activeTabIndex = 1; // Onglet Factures
        break;
      case 'invoices-paid':
        this.activeTabIndex = 1;
        // Filtrer les factures payées
        break;
      case 'invoices-overdue':
        this.activeTabIndex = 1;
        // Filtrer les factures en retard
        break;
      case 'invoices-upcoming':
        this.activeTabIndex = 1;
        // Filtrer les factures à échéance
        break;
      case 'collection-rate':
        this.activeTabIndex = 1;
        // Afficher les détails du taux de recouvrement
        break;
      case 'payment-delay':
        this.activeTabIndex = 1;
        // Afficher les détails des délais de paiement
        break;
      case 'payments':
        this.activeTabIndex = 1;
        // Afficher les paiements
        break;
    }
  }

  viewUpcomingInvoices(event: Event): void {
    event.stopPropagation();
    this.drillDown('invoices-upcoming');
  }

  exportChart(type: string): void {
    console.log('📊 Export du graphique:', type);

    try {
      // Créer un canvas temporaire pour capturer le graphique
      const canvas = document.querySelector(`#${type}Chart canvas`) as HTMLCanvasElement;

      if (!canvas) {
        this.snackBar.open('Graphique non trouvé', 'Fermer', { duration: 2000 });
        return;
      }

      // Convertir en image et télécharger
      canvas.toBlob((blob) => {
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `graphique-${type}-${new Date().toISOString().split('T')[0]}.png`;
          link.click();
          window.URL.revokeObjectURL(url);

          this.snackBar.open('✅ Graphique exporté avec succès', 'Fermer', { duration: 2000 });
        }
      });
    } catch (error) {
      console.error('❌ Erreur export graphique:', error);
      this.snackBar.open('❌ Erreur lors de l\'export du graphique', 'Fermer', { duration: 3000 });
    }
  }

  // Navigation vers les conventions
  navigateToConventions(): void {
    this.activeSection = 'conventions';
    this.activeTabIndex = 0; // Onglet Conventions
    console.log('Navigation vers les conventions');

    // Scroll vers la section des onglets
    setTimeout(() => {
      const tabsSection = document.querySelector('.tabs-section');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Navigation vers les factures
  navigateToInvoices(): void {
    this.activeSection = 'invoices';
    this.activeTabIndex = 1; // Onglet Factures
    console.log('Navigation vers les factures');

    // Scroll vers la section des onglets
    setTimeout(() => {
      const tabsSection = document.querySelector('.tabs-section');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Navigation vers les notifications (alertes système)
  navigateToNotifications(): void {
    this.activeSection = 'notifications';
    this.activeTabIndex = 3; // Onglet Notifications (index 3)
    this.notificationSubTabIndex = 0; // Sous-onglet Alertes Système
    console.log('Navigation vers les alertes système');

    // Scroll vers la section des onglets
    setTimeout(() => {
      const tabsSection = document.querySelector('.tabs-section');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Navigation vers la gestion des alertes SMS/Email
  navigateToAlertsManagement(): void {
    this.activeSection = 'alerts';
    this.activeTabIndex = 3; // Onglet Notifications (index 3)
    this.notificationSubTabIndex = 1; // Sous-onglet SMS/Email
    console.log('Navigation vers la gestion des alertes SMS/Email');

    // Scroll vers la section des onglets
    setTimeout(() => {
      const tabsSection = document.querySelector('.tabs-section');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Navigation vers le suivi des conventions
  navigateToConventionTracking(): void {
    this.activeSection = 'convention-tracking';
    this.activeTabIndex = 0; // Onglet Conventions
    console.log('🔍 Navigation vers le suivi des conventions');

    // Activer le mode suivi avec filtres automatiques
    this.applyTrackingFilters();

    // Scroll vers la section des onglets
    setTimeout(() => {
      const tabsSection = document.querySelector('.tabs-section');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Appliquer les filtres de suivi automatiques
  applyTrackingFilters(): void {
    console.log('🎯 Application des filtres de suivi');

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Filtrer les conventions nécessitant un suivi
    this.filteredConventions = this.conventions.filter(convention => {
      const dueDate = new Date(convention.dueDate);

      // Conventions expirées
      const isExpired = dueDate < today;

      // Conventions expirant dans les 30 jours
      const isExpiringSoon = dueDate >= today && dueDate <= thirtyDaysFromNow;

      // Conventions avec statut nécessitant attention
      const needsAttention = convention.status === 'EXPIRED' ||
        convention.status === 'PENDING' ||
        convention.tag === 'Urgent' ||
        convention.tag === 'Prioritaire';

      return isExpired || isExpiringSoon || needsAttention;
    });

    // Trier par urgence (expirées en premier, puis par date)
    this.filteredConventions.sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);

      // Expirées en premier
      if (dateA < today && dateB >= today) return -1;
      if (dateA >= today && dateB < today) return 1;

      // Sinon trier par date
      return dateA.getTime() - dateB.getTime();
    });

    // Mettre à jour le datasource
    this.conventionDataSource.data = this.filteredConventions;

    console.log(`✅ ${this.filteredConventions.length} conventions nécessitent un suivi`);

    // Afficher une notification
    this.snackBar.open(
      `🔍 Mode Suivi: ${this.filteredConventions.length} convention(s) nécessitent votre attention`,
      'Fermer',
      { duration: 4000 }
    );
  }

  // Obtenir le niveau d'urgence d'une convention
  getUrgencyLevel(convention: Convention): 'critical' | 'warning' | 'normal' {
    const today = new Date();
    const dueDate = new Date(convention.dueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return 'critical'; // Expiré
    if (daysUntilDue <= 7) return 'critical'; // Moins de 7 jours
    if (daysUntilDue <= 30) return 'warning'; // Moins de 30 jours
    return 'normal';
  }

  // Obtenir le texte d'urgence
  getUrgencyText(convention: Convention): string {
    const today = new Date();
    const dueDate = new Date(convention.dueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return `Expirée depuis ${Math.abs(daysUntilDue)} jour(s)`;
    if (daysUntilDue === 0) return 'Expire aujourd\'hui';
    if (daysUntilDue === 1) return 'Expire demain';
    if (daysUntilDue <= 7) return `Expire dans ${daysUntilDue} jours`;
    if (daysUntilDue <= 30) return `Expire dans ${daysUntilDue} jours`;
    return 'Actif';
  }

  // Obtenir l'icône d'urgence
  getUrgencyIcon(convention: Convention): string {
    const level = this.getUrgencyLevel(convention);
    switch (level) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      default: return 'check_circle';
    }
  }

  // Charger les factures
  loadInvoices(): void {
    console.log('📋 Chargement des factures...');

    this.http.get<any[]>('http://localhost:8085/api/invoices', { headers: this.getAuthHeaders() })
      .subscribe({
        next: (invoices: any[]) => {
          console.log('✅ Factures chargées depuis la DB:', invoices.length);

          // Log pour voir la structure des factures
          console.log('🔍 Structure d\'une facture:', invoices[0]);

          // Enrichir les factures avec les informations de convention
          const enrichedInvoices = invoices.map(invoice => {
            const convention = this.conventions.find(c => c.id === invoice.conventionId);
            return {
              ...invoice,
              // S'assurer que invoiceNumber existe (utiliser id si invoiceNumber n'existe pas)
              invoiceNumber: invoice.invoiceNumber || invoice.number || invoice.id || 'N/A',
              conventionReference: convention ? convention.reference : 'N/A',
              conventionTitle: convention ? convention.title : 'N/A'
            };
          });

          this.invoices = enrichedInvoices;
          this.filteredInvoices = [...enrichedInvoices];
          this.invoiceDataSource.data = enrichedInvoices;

          // Mettre à jour les factures en retard et à venir
          this.overdueInvoices = enrichedInvoices.filter(inv => inv.status === 'OVERDUE');
          this.upcomingInvoices = enrichedInvoices.filter(inv => inv.status === 'PENDING');

          console.log('📊 Factures en retard:', this.overdueInvoices.length);
          console.log('📊 Détails factures en retard:', this.overdueInvoices);
          console.log('📊 Factures en attente:', this.upcomingInvoices.length);
          console.log('📊 Détails factures en attente:', this.upcomingInvoices);

          // Mettre à jour les KPI avec les données réelles
          this.updateKPIMetrics();

          // Régénérer le calendrier avec les factures chargées
          this.generateCalendar();

          // Charger tous les événements
          this.loadAllEvents();

          // Initialiser le journal d'audit
          this.initializeAuditLog();
        },
        error: (error: any) => {
          console.error('❌ Erreur lors du chargement des factures:', error);
          this.invoices = [];
          this.filteredInvoices = [];
          this.invoiceDataSource.data = [];
          this.overdueInvoices = [];
          this.upcomingInvoices = [];
        }
      });
  }


  // Supprimer toutes les factures
  deleteAllInvoices(): void {
    const confirmDialog = confirm('⚠️ Êtes-vous sûr de vouloir supprimer TOUTES les factures ?\n\nCette action est irréversible !');

    if (confirmDialog) {
      console.log('🗑️ Suppression de toutes les factures...');

      // Appel à l'API pour supprimer toutes les factures
      this.http.delete<any>('http://localhost:8085/api/invoices/all', { headers: this.getAuthHeaders() })
        .subscribe({
          next: (response) => {
            console.log('✅ Toutes les factures supprimées:', response);
            this.snackBar.open(
              `✅ ${response.deletedCount} facture(s) supprimée(s) avec succès`,
              'Fermer',
              { duration: 5000, panelClass: ['success-snackbar'] }
            );

            // Recharger les données
            this.loadInvoices();
          },
          error: (error) => {
            console.error('❌ Erreur lors de la suppression:', error);
            this.snackBar.open(
              '❌ Erreur lors de la suppression des factures',
              'Fermer',
              { duration: 5000, panelClass: ['error-snackbar'] }
            );
          }
        });
    }
  }

  // Obtenir les headers d'authentification
  getAuthHeaders(): any {
    const token = localStorage.getItem('token');
    console.log('🔑 Token récupéré:', token ? 'présent' : 'absent');
    if (token) {
      console.log('🔑 Token (premiers caractères):', token.substring(0, 20) + '...');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Supprimer les factures sélectionnées
  deleteSelectedInvoices(): void {
    if (this.selectedInvoices.length === 0) {
      this.snackBar.open('⚠️ Aucune facture sélectionnée', 'Fermer', { duration: 3000 });
      return;
    }

    const confirmDialog = confirm(`⚠️ Êtes-vous sûr de vouloir supprimer ${this.selectedInvoices.length} facture(s) sélectionnée(s) ?\n\nCette action est irréversible !`);

    if (confirmDialog) {
      console.log('🗑️ Suppression des factures sélectionnées:', this.selectedInvoices);

      // Supprimer chaque facture sélectionnée
      let deletedCount = 0;
      let errorCount = 0;

      this.selectedInvoices.forEach(invoiceId => {
        this.http.delete(`http://localhost:8085/api/invoices/${invoiceId}`, { headers: this.getAuthHeaders() })
          .subscribe({
            next: () => {
              deletedCount++;
              if (deletedCount + errorCount === this.selectedInvoices.length) {
                this.snackBar.open(
                  `✅ ${deletedCount} facture(s) supprimée(s) avec succès`,
                  'Fermer',
                  { duration: 5000, panelClass: ['success-snackbar'] }
                );
                this.selectedInvoices = [];
                this.loadInvoices();
              }
            },
            error: (error: any) => {
              errorCount++;
              console.error('❌ Erreur lors de la suppression de la facture:', invoiceId, error);
              if (deletedCount + errorCount === this.selectedInvoices.length) {
                this.snackBar.open(
                  `⚠️ ${deletedCount} facture(s) supprimée(s), ${errorCount} erreur(s)`,
                  'Fermer',
                  { duration: 5000, panelClass: ['warning-snackbar'] }
                );
                this.selectedInvoices = [];
                this.loadInvoices();
              }
            }
          });
      });
    }
  }

  // Télécharger PDF d'une facture
  downloadInvoicePDF(invoice: any): void {
    console.log('📄 Téléchargement PDF pour la facture:', invoice.reference);

    this.http.get(`http://localhost:8085/api/invoices/${invoice.id}/pdf`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        console.log('✅ PDF généré avec succès');
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `facture_${invoice.reference}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('PDF téléchargé avec succès', 'Fermer', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('❌ Erreur lors du téléchargement PDF:', error);
        this.snackBar.open('Erreur lors du téléchargement du PDF', 'Fermer', { duration: 3000 });
      }
    });
  }

  // Obtenir le texte du statut de retard
  getOverdueStatusText(invoice: any): string {
    if (invoice.status === 'PAID' || invoice.status === 'PAYÉE') {
      return 'Payée';
    }

    if (this.isOverdue(invoice.dueDate)) {
      const daysOverdue = this.getDaysOverdue(invoice.dueDate);
      if (daysOverdue > 30) {
        return 'Urgent';
      }
      return `${daysOverdue} jours`;
    }

    return 'À jour';
  }

  // Obtenir la classe CSS pour le statut de retard
  getOverdueStatusClass(invoice: any): string {
    if (invoice.status === 'PAID' || invoice.status === 'PAYÉE') {
      return 'status-paid';
    }

    if (this.isOverdue(invoice.dueDate)) {
      const daysOverdue = this.getDaysOverdue(invoice.dueDate);
      if (daysOverdue > 30) {
        return 'status-urgent';
      }
      return 'status-overdue';
    }

    return 'status-ontime';
  }

  // ============= NOUVELLES FONCTIONNALITÉS COMPLÈTES =============

  // 1. Dupliquer une convention
  duplicateConvention(convention: Convention): void {
    console.log('📋 Duplication de la convention:', convention);

    if (confirm(`Voulez-vous dupliquer la convention "${convention.reference}" ?\n\nUne nouvelle convention sera créée avec les mêmes informations.`)) {
      // Appel à l'API backend pour dupliquer
      this.http.post<any>(`http://localhost:8085/api/commercial/dashboard/conventions/${convention.id}/duplicate`, {},
        { headers: this.getAuthHeaders() })
        .subscribe({
          next: (duplicatedConvention: any) => {
            console.log('✅ Convention dupliquée avec succès:', duplicatedConvention);
            this.snackBar.open(`Convention dupliquée: ${duplicatedConvention.reference}`, 'Fermer', { duration: 3000 });

            // Recharger les conventions
            this.loadConventions();
          },
          error: (error: any) => {
            console.error('❌ Erreur lors de la duplication:', error);
            this.snackBar.open('Erreur lors de la duplication de la convention', 'Fermer', { duration: 5000 });
          }
        });
    }
  }

  // 2. Télécharger le PDF d'une convention
  downloadConventionPDF(convention: Convention): void {
    console.log('📄 Téléchargement PDF pour la convention:', convention.reference);

    this.http.get(`http://localhost:8085/api/conventions/${convention.id}/pdf`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        console.log('✅ PDF généré avec succès');
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `convention_${convention.reference}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('PDF téléchargé avec succès', 'Fermer', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('❌ Erreur lors du téléchargement PDF:', error);
        this.snackBar.open('Erreur lors du téléchargement du PDF', 'Fermer', { duration: 3000 });
      }
    });
  }

  // 3. Voir l'historique d'audit d'une convention
  viewConventionAudit(convention: Convention): void {
    console.log('📜 Affichage de l\'historique pour:', convention.reference);

    // Afficher un indicateur de chargement
    const loadingSnackBar = this.snackBar.open('⏳ Chargement de l\'historique...', '', {
      duration: 0
    });

    this.http.get<any>(`http://localhost:8085/api/commercial/dashboard/conventions/${convention.id}/audit`,
      { headers: this.getAuthHeaders() })
      .subscribe({
        next: (auditHistory: any) => {
          loadingSnackBar.dismiss();
          console.log('✅ Historique récupéré:', auditHistory);

          // Ouvrir le modal professionnel avec l'historique
          const dialogRef = this.dialog.open(ConventionHistoryModalComponent, {
            width: '900px',
            maxWidth: '95vw',
            maxHeight: '90vh',
            data: {
              convention: convention,
              history: auditHistory || []
            },
            panelClass: 'history-modal-panel'
          });

          dialogRef.afterClosed().subscribe(result => {
            console.log('📜 Modal historique fermé');
          });
        },
        error: (error: any) => {
          loadingSnackBar.dismiss();
          console.error('❌ Erreur lors de la récupération de l\'historique:', error);
          this.snackBar.open('Erreur lors de la récupération de l\'historique', 'Fermer', { duration: 5000 });
        }
      });
  }

  // 4. Export des conventions (Excel, PDF, CSV) - COMPLÉTÉ
  exportConventions(format: 'excel' | 'pdf' | 'csv'): void {
    console.log(`📊 Export des conventions en ${format.toUpperCase()}`);

    // Construire les paramètres de recherche si des filtres sont appliqués
    let params = `format=${format}`;

    this.http.get(`http://localhost:8085/api/commercial/dashboard/conventions/export?${params}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        console.log('✅ Export généré avec succès');
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Définir le nom du fichier selon le format
        const timestamp = new Date().getTime();
        let filename = `conventions_${timestamp}`;

        switch (format) {
          case 'excel':
            filename += '.xlsx';
            break;
          case 'pdf':
            filename += '.pdf';
            break;
          case 'csv':
            filename += '.csv';
            break;
        }

        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);

        this.snackBar.open(`Export ${format.toUpperCase()} téléchargé avec succès`, 'Fermer', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('❌ Erreur lors de l\'export:', error);
        this.snackBar.open(`Erreur lors de l'export ${format.toUpperCase()}`, 'Fermer', { duration: 5000 });
      }
    });
  }

  // 5. Export des factures (Excel, PDF, CSV) - COMPLÉTÉ
  exportInvoices(format: 'excel' | 'pdf' | 'csv'): void {
    console.log(`📊 Export des factures en ${format.toUpperCase()}`);

    let params = `format=${format}`;

    this.http.get(`http://localhost:8085/api/commercial/dashboard/invoices/export?${params}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        console.log('✅ Export généré avec succès');
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const timestamp = new Date().getTime();
        let filename = `factures_${timestamp}`;

        switch (format) {
          case 'excel':
            filename += '.xlsx';
            break;
          case 'pdf':
            filename += '.pdf';
            break;
          case 'csv':
            filename += '.csv';
            break;
        }

        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);

        this.snackBar.open(`Export ${format.toUpperCase()} téléchargé avec succès`, 'Fermer', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('❌ Erreur lors de l\'export:', error);
        this.snackBar.open(`Erreur lors de l'export ${format.toUpperCase()}`, 'Fermer', { duration: 5000 });
      }
    });
  }

  // ============= MÉTHODES POUR LE SUIVI DES STATUTS =============

  // Navigation vers l'onglet de suivi des statuts
  navigateToInvoiceStatusTracking(): void {
    this.activeSection = 'invoice-status';
    this.activeTabIndex = 2; // Onglet "Suivi Statuts"
    console.log('Navigation vers le suivi des statuts de factures');

    // Scroll vers la section des onglets
    setTimeout(() => {
      const tabsSection = document.querySelector('.tabs-section');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Navigation vers la vue des échéances
  navigateToDueDates(): void {
    this.activeSection = 'due-dates';
    this.activeTabIndex = 5; // Onglet "Échéances" (Gestion des Échéances)
    console.log('📅 Navigation vers les échéances');

    // Scroll vers la section des onglets
    setTimeout(() => {
      const tabsSection = document.querySelector('.tabs-section');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Navigation vers le calendrier
  navigateToCalendar(): void {
    this.activeSection = 'calendar';
    this.activeTabIndex = 4; // Onglet "Calendrier" (Vue calendrier visuel)
    console.log('📅 Navigation vers le calendrier');

    // Scroll vers la section des onglets
    setTimeout(() => {
      const tabsSection = document.querySelector('.tabs-section');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Navigation vers les événements
  navigateToEvents(): void {
    this.activeSection = 'events';
    this.activeTabIndex = 6; // Onglet "Événements"
    console.log('📋 Navigation vers les événements');

    // Scroll vers la section des onglets
    setTimeout(() => {
      const tabsSection = document.querySelector('.tabs-section');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Navigation vers l'historique
  navigateToHistory(): void {
    this.activeSection = 'history';
    this.activeTabIndex = 7; // Onglet "Historique"
    console.log('📜 Navigation vers historique');

    // Scroll vers la section des onglets
    setTimeout(() => {
      const tabsSection = document.querySelector('.tabs-section');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Navigation vers les rapports
  navigateToReports(): void {
    this.activeSection = 'reports';
    this.activeTabIndex = 8; // Onglet "Rapports"
    console.log('📊 Navigation vers les rapports');

    // Scroll vers la section des onglets
    setTimeout(() => {
      const tabsSection = document.querySelector('.tabs-section');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // ============= GÉNÉRATION DES RAPPORTS =============

  // Rapport financier global
  getFinancialReport(): any {
    const totalRevenue = this.conventions.reduce((sum, conv) => sum + conv.amount, 0);
    const paidAmount = this.invoices
      .filter(inv => inv.status === 'PAID' || inv.status === 'PAYÉE')
      .reduce((sum, inv) => sum + inv.amount, 0);
    const pendingAmount = this.invoices
      .filter(inv => inv.status === 'PENDING' || inv.status === 'EN_ATTENTE')
      .reduce((sum, inv) => sum + inv.amount, 0);
    const overdueAmount = this.invoices
      .filter(inv => inv.status === 'OVERDUE' || inv.status === 'EN_RETARD')
      .reduce((sum, inv) => sum + inv.amount, 0);

    return {
      totalRevenue,
      paidAmount,
      pendingAmount,
      overdueAmount,
      collectionRate: totalRevenue > 0 ? (paidAmount / totalRevenue) * 100 : 0
    };
  }

  // Rapport par gouvernorat
  getReportByGovernorate(): any[] {
    const governorateMap = new Map<string, any>();

    this.conventions.forEach(conv => {
      if (!governorateMap.has(conv.governorate)) {
        governorateMap.set(conv.governorate, {
          governorate: conv.governorate,
          count: 0,
          totalAmount: 0,
          activeCount: 0,
          expiredCount: 0
        });
      }

      const data = governorateMap.get(conv.governorate);
      data.count++;
      data.totalAmount += conv.amount;
      if (conv.status === 'ACTIVE' || conv.status === 'ACTIF') data.activeCount++;
      if (conv.status === 'EXPIRED' || conv.status === 'EXPIRÉ') data.expiredCount++;
    });

    return Array.from(governorateMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  }

  // Rapport par période (mois)
  getReportByMonth(): any[] {
    const monthMap = new Map<string, any>();

    this.conventions.forEach(conv => {
      const date = new Date(conv.dueDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          month: monthKey,
          monthName: this.monthNames[date.getMonth()] + ' ' + date.getFullYear(),
          conventionsCount: 0,
          totalAmount: 0
        });
      }

      const data = monthMap.get(monthKey);
      data.conventionsCount++;
      data.totalAmount += conv.amount;
    });

    return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }

  // Rapport de performance
  getPerformanceReport(): any {
    const totalConventions = this.conventions.length;
    const totalInvoices = this.invoices.length;
    const paidInvoices = this.invoices.filter(inv => inv.status === 'PAID' || inv.status === 'PAYÉE').length;
    const overdueInvoices = this.invoices.filter(inv => inv.status === 'OVERDUE' || inv.status === 'EN_RETARD').length;

    return {
      totalConventions,
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      paymentRate: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0,
      overdueRate: totalInvoices > 0 ? (overdueInvoices / totalInvoices) * 100 : 0,
      averageConventionAmount: totalConventions > 0
        ? this.conventions.reduce((sum, c) => sum + c.amount, 0) / totalConventions
        : 0
    };
  }

  // ============= SYSTÈME D'AUDIT PROFESSIONNEL =============

  // Enregistrer une entrée d'audit
  logAudit(
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PAYMENT' | 'STATUS_CHANGE' | 'EXPORT',
    entityType: 'CONVENTION' | 'FACTURE',
    entityId: string,
    entityReference: string,
    description: string,
    oldValue?: any,
    newValue?: any,
    details?: string
  ): void {
    const auditEntry: AuditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date(),
      user: this.currentUser.username || 'commercial',
      action,
      entityType,
      entityId,
      entityReference,
      description,
      oldValue,
      newValue,
      ipAddress: '192.168.1.1', // À remplacer par l'IP réelle
      details
    };

    this.auditLog.unshift(auditEntry); // Ajouter au début
    console.log('📝 Audit enregistré:', auditEntry);

    // Dans un vrai système, envoyer au backend
    // this.http.post('/api/audit', auditEntry).subscribe();
  }

  // Générer un ID unique pour l'audit
  generateAuditId(): string {
    return `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Obtenir l'historique d'audit complet (filtré par utilisateur)
  getFullHistory(): any[] {
    const currentUsername = this.currentUser.username || 'commercial';

    // Filtrer uniquement les entrées de l'utilisateur connecté
    return this.auditLog
      .filter(entry => entry.user === currentUsername)
      .map(entry => ({
        id: entry.id,
        type: entry.entityType.toLowerCase(),
        action: this.getActionLabel(entry.action),
        entity: entry.entityType === 'CONVENTION' ? 'Convention' : 'Facture',
        reference: entry.entityReference,
        title: entry.description,
        date: entry.timestamp,
        user: entry.user,
        status: entry.action,
        icon: this.getActionIcon(entry.action),
        color: this.getActionColor(entry.action),
        details: entry.details,
        oldValue: entry.oldValue,
        newValue: entry.newValue
      }));
  }

  // Obtenir l'historique complet (admin uniquement - pour référence)
  getAllUsersHistory(): any[] {
    return this.auditLog.map(entry => ({
      id: entry.id,
      type: entry.entityType.toLowerCase(),
      action: this.getActionLabel(entry.action),
      entity: entry.entityType === 'CONVENTION' ? 'Convention' : 'Facture',
      reference: entry.entityReference,
      title: entry.description,
      date: entry.timestamp,
      user: entry.user,
      status: entry.action,
      icon: this.getActionIcon(entry.action),
      color: this.getActionColor(entry.action),
      details: entry.details,
      oldValue: entry.oldValue,
      newValue: entry.newValue
    }));
  }

  // Obtenir les statistiques d'audit pour l'utilisateur connecté
  getUserAuditStats(): any {
    const currentUsername = this.currentUser.username || 'commercial';
    const userEntries = this.auditLog.filter(entry => entry.user === currentUsername);

    return {
      total: userEntries.length,
      creates: userEntries.filter(e => e.action === 'CREATE').length,
      updates: userEntries.filter(e => e.action === 'UPDATE').length,
      deletes: userEntries.filter(e => e.action === 'DELETE').length,
      payments: userEntries.filter(e => e.action === 'PAYMENT').length,
      statusChanges: userEntries.filter(e => e.action === 'STATUS_CHANGE').length,
      exports: userEntries.filter(e => e.action === 'EXPORT').length,
      conventions: userEntries.filter(e => e.entityType === 'CONVENTION').length,
      factures: userEntries.filter(e => e.entityType === 'FACTURE').length
    };
  }

  // Obtenir le libellé de l'action
  getActionLabel(action: string): string {
    const labels: any = {
      'CREATE': 'Création',
      'UPDATE': 'Modification',
      'DELETE': 'Suppression',
      'PAYMENT': 'Paiement reçu',
      'STATUS_CHANGE': 'Changement de statut',
      'EXPORT': 'Export de données'
    };
    return labels[action] || action;
  }

  // Obtenir l'icône de l'action
  getActionIcon(action: string): string {
    const icons: any = {
      'CREATE': 'add_circle',
      'UPDATE': 'edit',
      'DELETE': 'delete',
      'PAYMENT': 'check_circle',
      'STATUS_CHANGE': 'swap_horiz',
      'EXPORT': 'cloud_download'
    };
    return icons[action] || 'info';
  }

  // Obtenir la couleur de l'action
  getActionColor(action: string): string {
    const colors: any = {
      'CREATE': 'primary',
      'UPDATE': 'accent',
      'DELETE': 'warn',
      'PAYMENT': 'success',
      'STATUS_CHANGE': 'info',
      'EXPORT': 'accent'
    };
    return colors[action] || 'primary';
  }

  // Initialiser l'audit avec les données existantes
  initializeAuditLog(): void {
    console.log('🔍 Initialisation du journal d\'audit...');

    // Créer des entrées d'audit pour les conventions existantes
    this.conventions.forEach(conv => {
      this.logAudit(
        'CREATE',
        'CONVENTION',
        conv.id,
        conv.reference,
        `Convention créée: ${conv.title}`,
        null,
        conv,
        `Montant: ${conv.amount}€, Gouvernorat: ${conv.governorate}`
      );
    });

    // Créer des entrées d'audit pour les factures existantes
    this.invoices.forEach(inv => {
      this.logAudit(
        'CREATE',
        'FACTURE',
        inv.id,
        inv.invoiceNumber,
        `Facture créée pour ${inv.conventionReference}`,
        null,
        inv,
        `Montant: ${inv.amount}€, Statut: ${inv.status}`
      );

      // Si la facture est payée, ajouter une entrée de paiement
      if (inv.status === 'PAID' || inv.status === 'PAYÉE') {
        this.logAudit(
          'PAYMENT',
          'FACTURE',
          inv.id,
          inv.invoiceNumber,
          `Paiement reçu pour ${inv.conventionReference}`,
          { status: 'PENDING' },
          { status: 'PAID' },
          `Montant payé: ${inv.amount}€`
        );
      }
    });

    console.log(`✅ ${this.auditLog.length} entrées d'audit créées`);
  }

  // Charger et générer tous les événements depuis la base de données
  loadAllEvents(): void {
    console.log('📋 Chargement des événements depuis la base de données...');

    const events: any[] = [];
    const now = new Date();

    // Générer des événements depuis les conventions
    this.conventions.forEach(conv => {
      const convDate = new Date(conv.dueDate);
      events.push({
        type: 'convention',
        action: convDate < now ? 'Échéance passée' : 'Échéance',
        title: conv.title,
        reference: conv.reference,
        date: convDate,
        status: conv.status,
        amount: conv.amount,
        icon: 'description',
        daysUntil: this.getDaysUntil(convDate)
      });
    });

    // Générer des événements depuis les factures
    this.invoices.forEach(inv => {
      const invDate = new Date(inv.dueDate);
      events.push({
        type: 'facture',
        action: invDate < now ? 'Paiement en retard' : 'Paiement dû',
        title: inv.conventionReference || 'Facture',
        reference: inv.invoiceNumber,
        date: invDate,
        status: inv.status,
        amount: inv.amount,
        icon: 'receipt',
        daysUntil: this.getDaysUntil(invDate)
      });
    });

    // Stocker tous les événements
    this.allEvents = events;

    // Mettre à jour les datasources
    this.updateEventDataSources();

    console.log('✅ Événements chargés:', this.allEvents.length);
  }

  // Mettre à jour les datasources des événements
  updateEventDataSources(): void {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Événements à venir (7 prochains jours)
    const upcoming = this.allEvents
      .filter(event => event.date >= now && event.date <= sevenDaysFromNow)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Événements récents (30 derniers jours)
    const recent = this.allEvents
      .filter(event => event.date >= thirtyDaysAgo && event.date <= now)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    // Mettre à jour les datasources
    this.upcomingEventsDataSource.data = upcoming;
    this.recentEventsDataSource.data = recent;

    console.log('📊 Événements à venir:', upcoming.length);
    console.log('📊 Événements récents:', recent.length);
  }

  // Obtenir tous les événements récents (pour les statistiques)
  getRecentEvents(): any[] {
    return this.recentEventsDataSource.data;
  }

  // Obtenir les événements à venir (pour les statistiques)
  getUpcomingEvents(): any[] {
    return this.upcomingEventsDataSource.data;
  }

  // Obtenir les événements à venir paginés
  getPagedUpcomingEvents(): any[] {
    const startIndex = this.upcomingEventsPageIndex * this.upcomingEventsPageSize;
    const endIndex = startIndex + this.upcomingEventsPageSize;
    return this.upcomingEventsDataSource.data.slice(startIndex, endIndex);
  }

  // Obtenir les événements récents paginés
  getPagedRecentEvents(): any[] {
    const startIndex = this.recentEventsPageIndex * this.recentEventsPageSize;
    const endIndex = startIndex + this.recentEventsPageSize;
    return this.recentEventsDataSource.data.slice(startIndex, endIndex);
  }

  // Gérer le changement de page pour les événements à venir
  onUpcomingEventsPageChange(event: any): void {
    this.upcomingEventsPageIndex = event.pageIndex;
    this.upcomingEventsPageSize = event.pageSize;
  }

  // Gérer le changement de page pour les événements récents
  onRecentEventsPageChange(event: any): void {
    this.recentEventsPageIndex = event.pageIndex;
    this.recentEventsPageSize = event.pageSize;
  }

  // Obtenir l'historique paginé
  getPagedHistory(): any[] {
    const history = this.getFullHistory();
    const startIndex = this.historyPageIndex * this.historyPageSize;
    const endIndex = startIndex + this.historyPageSize;
    return history.slice(startIndex, endIndex);
  }

  // Gérer le changement de page pour l'historique
  onHistoryPageChange(event: any): void {
    this.historyPageIndex = event.pageIndex;
    this.historyPageSize = event.pageSize;
  }

  // Obtenir toutes les échéances (conventions + factures) triées par date
  getAllDueDates(): any[] {
    const dueDates: any[] = [];

    // Ajouter les échéances des conventions
    this.conventions.forEach(conv => {
      dueDates.push({
        type: 'convention',
        id: conv.id,
        reference: conv.reference,
        title: conv.title,
        dueDate: new Date(conv.dueDate),
        amount: conv.amount,
        status: conv.status,
        governorate: conv.governorate,
        tag: conv.tag
      });
    });

    // Ajouter les échéances des factures
    this.invoices.forEach(inv => {
      dueDates.push({
        type: 'facture',
        id: inv.id,
        reference: inv.invoiceNumber,
        title: inv.conventionReference || 'Facture',
        dueDate: new Date(inv.dueDate),
        amount: inv.amount,
        status: inv.status
      });
    });

    // Trier par date (les plus proches en premier)
    return dueDates.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  // Obtenir les échéances à venir (dans les 30 prochains jours)
  getUpcomingDueDates(): any[] {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return this.getAllDueDates().filter(item => {
      return item.dueDate >= today && item.dueDate <= thirtyDaysFromNow;
    });
  }

  // Obtenir les échéances à venir paginées
  getPagedUpcomingDueDates(): any[] {
    const allDueDates = this.getUpcomingDueDates();
    const startIndex = this.dueDatesPageIndex * this.dueDatesPageSize;
    const endIndex = startIndex + this.dueDatesPageSize;
    return allDueDates.slice(startIndex, endIndex);
  }

  // Gérer le changement de page pour les échéances
  onDueDatesPageChange(event: any): void {
    this.dueDatesPageIndex = event.pageIndex;
    this.dueDatesPageSize = event.pageSize;
  }

  // Obtenir les échéances en retard
  getOverdueDueDates(): any[] {
    const today = new Date();
    return this.getAllDueDates().filter(item => item.dueDate < today);
  }

  // Obtenir les échéances en retard paginées
  getPagedOverdueDueDates(): any[] {
    const allOverdueDates = this.getOverdueDueDates();
    const startIndex = this.overdueDatesPageIndex * this.overdueDatesPageSize;
    const endIndex = startIndex + this.overdueDatesPageSize;
    return allOverdueDates.slice(startIndex, endIndex);
  }

  // Gérer le changement de page pour les échéances en retard
  onOverdueDatesPageChange(event: any): void {
    this.overdueDatesPageIndex = event.pageIndex;
    this.overdueDatesPageSize = event.pageSize;
  }

  // Calculer le nombre de jours jusqu'à une date
  getDaysUntil(dueDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Calculer le total des factures par statut
  calculateTotalByStatus(status: string): number {
    return this.invoices
      .filter(inv => inv.status === status)
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }

  // Filtrer les factures par statut
  filterInvoicesByStatus(status: string): void {
    this.selectedStatusFilter = status;
    console.log('🔍 Filtrage des factures par statut:', status);

    // Filtrer les factures selon le statut sélectionné
    const filtered = this.invoices.filter(inv => inv.status === status);
    console.log(`✅ ${filtered.length} facture(s) trouvée(s) avec le statut ${status}`);

    // Mettre à jour le datasource pour afficher le tableau
    this.filteredStatusInvoiceDataSource.data = filtered;

    // Scroll vers le tableau filtré
    setTimeout(() => {
      const filteredCard = document.querySelector('.filtered-invoices-card');
      if (filteredCard) {
        filteredCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Effacer le filtre de statut
  clearStatusFilter(): void {
    this.selectedStatusFilter = null;
    this.filteredStatusInvoiceDataSource.data = [];
    console.log('🧹 Filtre de statut effacé');
  }

  // Obtenir les factures filtrées par statut (pour compatibilité)
  getFilteredInvoicesByStatus(): Invoice[] {
    if (!this.selectedStatusFilter) {
      return [];
    }
    return this.invoices.filter(inv => inv.status === this.selectedStatusFilter);
  }

  // Calculer le pourcentage d'un statut
  getStatusPercentage(status: string): number {
    if (this.invoices.length === 0) {
      return 0;
    }
    const count = this.invoices.filter(inv => inv.status === status).length;
    return (count / this.invoices.length) * 100;
  }

  // Obtenir le nombre de factures par statut
  getInvoiceCountByStatus(status: string): number {
    return this.invoices.filter(inv => inv.status === status).length;
  }

  // Mettre à jour les KPI avec les données réelles de la base de données
  updateKPIMetrics(): void {
    console.log('🔄 Mise à jour des KPI avec les données réelles...');

    // Calculer les métriques des conventions
    const totalConventions = this.conventions.length;
    const activeConventions = this.conventions.filter(c => c.status === 'ACTIVE').length;
    const expiredConventions = this.conventions.filter(c => c.status === 'EXPIRED').length;

    // Calculer les métriques des factures
    const totalInvoices = this.invoices.length;
    const paidInvoices = this.invoices.filter(inv => inv.status === 'PAID' || inv.status === 'PAYÉE').length;
    const overdueInvoices = this.invoices.filter(inv => inv.status === 'OVERDUE').length;

    // Calculer le taux de recouvrement
    const collectionRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

    // Calculer le délai moyen de paiement (simulation basée sur les factures payées)
    const averagePaymentTime = paidInvoices > 0 ? 28 : 0; // À améliorer avec des vraies dates de paiement

    // Calculer le revenu mensuel (somme des factures payées)
    const monthlyRevenue = this.invoices
      .filter(inv => inv.status === 'PAID' || inv.status === 'PAYÉE')
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);

    // Calculer le montant en attente
    const pendingAmount = this.invoices
      .filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE' || inv.status === 'PARTIAL')
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);

    // Mettre à jour l'objet kpiMetrics
    this.kpiMetrics = {
      totalConventions,
      activeConventions,
      expiredConventions,
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      collectionRate,
      averagePaymentTime,
      monthlyRevenue,
      pendingAmount
    };

    console.log('✅ KPI mis à jour:', this.kpiMetrics);
  }

  // ============= MÉTHODES POUR LE CALENDRIER =============

  // Générer le calendrier du mois actuel
  generateCalendar(): void {
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();

    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);

    // Jour de la semaine du premier jour (0 = Dimanche)
    const firstDayOfWeek = firstDay.getDay();

    // Nombre de jours dans le mois
    const daysInMonth = lastDay.getDate();

    // Réinitialiser le tableau
    this.calendarDays = [];

    // Ajouter les jours vides au début
    for (let i = 0; i < firstDayOfWeek; i++) {
      this.calendarDays.push({ date: null, events: [] });
    }

    // Ajouter tous les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const events = this.getEventsForDate(currentDate);

      this.calendarDays.push({
        date: currentDate,
        day: day,
        isToday: this.isToday(currentDate),
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
        events: events,
        hasEvents: events.length > 0
      });
    }

    console.log('📅 Calendrier généré:', this.calendarDays.length, 'jours');
  }

  // Obtenir les événements pour une date donnée
  getEventsForDate(date: Date): any[] {
    const events: any[] = [];

    // Vérifier les conventions
    this.conventions.forEach(conv => {
      const convDate = new Date(conv.dueDate);
      if (this.isSameDay(convDate, date)) {
        events.push({
          type: 'convention',
          title: conv.title,
          reference: conv.reference,
          status: conv.status,
          amount: conv.amount,
          data: conv
        });
      }
    });

    // Vérifier les factures
    this.invoices.forEach(inv => {
      const invDate = new Date(inv.dueDate);
      if (this.isSameDay(invDate, date)) {
        events.push({
          type: 'facture',
          title: inv.conventionReference || 'Facture',
          reference: inv.invoiceNumber,
          status: inv.status,
          amount: inv.amount,
          data: inv
        });
      }
    });

    return events;
  }

  // Vérifier si deux dates sont le même jour
  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  }

  // Vérifier si une date est aujourd'hui
  isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDay(date, today);
  }

  // Naviguer au mois précédent
  previousMonth(): void {
    this.currentCalendarDate = new Date(
      this.currentCalendarDate.getFullYear(),
      this.currentCalendarDate.getMonth() - 1,
      1
    );
    this.generateCalendar();
  }

  // Naviguer au mois suivant
  nextMonth(): void {
    this.currentCalendarDate = new Date(
      this.currentCalendarDate.getFullYear(),
      this.currentCalendarDate.getMonth() + 1,
      1
    );
    this.generateCalendar();
  }

  // Aller au mois actuel
  goToToday(): void {
    this.currentCalendarDate = new Date();
    this.generateCalendar();
  }

  // Obtenir le nom du mois et l'année
  getCurrentMonthYear(): string {
    const month = this.monthNames[this.currentCalendarDate.getMonth()];
    const year = this.currentCalendarDate.getFullYear();
    return `${month} ${year}`;
  }

  // ===== MÉTHODES AMÉLIORÉES POUR L'HISTORIQUE D'AUDIT =====

  historySearchTerm = '';
  historyFilterAction: string | null = null;
  historyFilterEntity: string | null = null;
  filteredHistory: any[] = [];

  /**
   * Filtrer l'historique selon les critères
   */
  filterHistory(): void {
    let history = this.getFullHistory();

    // Filtre par recherche
    if (this.historySearchTerm) {
      const term = this.historySearchTerm.toLowerCase();
      history = history.filter(item =>
        item.title?.toLowerCase().includes(term) ||
        item.reference?.toLowerCase().includes(term) ||
        item.user?.toLowerCase().includes(term) ||
        item.details?.toLowerCase().includes(term)
      );
    }

    // Filtre par action
    if (this.historyFilterAction) {
      history = history.filter(item => item.action === this.historyFilterAction);
    }

    // Filtre par entité
    if (this.historyFilterEntity) {
      history = history.filter(item => item.entity === this.historyFilterEntity);
    }

    this.filteredHistory = history;
  }

  /**
   * Obtenir l'historique filtré
   */
  getFilteredHistory(): any[] {
    if (!this.filteredHistory || this.filteredHistory.length === 0) {
      return this.getFullHistory();
    }
    return this.filteredHistory;
  }

  /**
   * Réinitialiser les filtres
   */
  resetHistoryFilters(): void {
    this.historySearchTerm = '';
    this.historyFilterAction = null;
    this.historyFilterEntity = null;
    this.filteredHistory = [];
  }

  /**
   * Exporter l'historique en CSV
   */
  exportHistoryCSV(): void {
    const history = this.getFilteredHistory();
    const headers = ['Date', 'Action', 'Type', 'Référence', 'Utilisateur', 'Détails'];
    const rows = history.map(item => [
      new Date(item.date).toLocaleString(),
      item.action,
      item.entity,
      item.reference,
      item.user,
      item.details || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    this.downloadFile(csvContent, 'historique-audit.csv', 'text/csv');
  }

  /**
   * Exporter l'historique en JSON
   */
  exportHistoryJSON(): void {
    const history = this.getFilteredHistory();
    const json = JSON.stringify(history, null, 2);
    this.downloadFile(json, 'historique-audit.json', 'application/json');
  }

  /**
   * Télécharger un fichier
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Obtenir la couleur du chip selon l'action
   */
  getActionChipColor(action: string): string {
    const colors: { [key: string]: string } = {
      'CREATE': 'primary',
      'UPDATE': 'accent',
      'DELETE': 'warn',
      'PAYMENT': 'primary',
      'STATUS_CHANGE': 'accent',
      'EXPORT': ''
    };
    return colors[action] || '';
  }

  // ===== MÉTHODES POUR RELANCES AUTOMATIQUES =====

  schedulerStatus: any = null;
  notificationFilter = 'all';
  mockNotifications = [
    {
      type: 'email',
      subject: 'Rappel de paiement - Facture #001',
      recipient: 'client@example.com',
      timestamp: new Date(),
      status: 'sent',
      message: 'Votre facture arrive à échéance dans 3 jours'
    },
    {
      type: 'sms',
      subject: 'Rappel échéance',
      recipient: '+216 12 345 678',
      timestamp: new Date(Date.now() - 86400000),
      status: 'sent',
      message: 'Facture #002 échéance demain'
    },
    {
      type: 'system',
      subject: 'Notification système',
      recipient: 'Système',
      timestamp: new Date(Date.now() - 172800000),
      status: 'sent',
      message: 'Vérification automatique effectuée'
    }
  ];

  /**
   * Déclencher manuellement le scheduler
   */
  triggerManualScheduler(): void {
    this.http.post('http://localhost:8085/api/test/scheduler/trigger-check', {}).subscribe({
      next: (response: any) => {
        this.snackBar.open(response.message || 'Vérification déclenchée avec succès', 'Fermer', {
          duration: 3000
        });
        console.log('✅ Scheduler déclenché:', response);
      },
      error: (error) => {
        this.snackBar.open('Erreur lors du déclenchement du scheduler', 'Fermer', {
          duration: 3000
        });
        console.error('❌ Erreur scheduler:', error);
      }
    });
  }

  /**
   * Obtenir le statut du scheduler
   */
  getSchedulerStatus(): void {
    this.http.get('http://localhost:8085/api/test/scheduler/status').subscribe({
      next: (response: any) => {
        this.schedulerStatus = response;
        this.snackBar.open('Statut du scheduler récupéré', 'Fermer', {
          duration: 2000
        });
        console.log('📊 Statut scheduler:', response);
      },
      error: (error) => {
        this.snackBar.open('Erreur lors de la récupération du statut', 'Fermer', {
          duration: 3000
        });
        console.error('❌ Erreur statut:', error);
      }
    });
  }

  /**
   * Filtrer les notifications
   */
  filterNotifications(): void {
    // La méthode getFilteredNotifications() gère le filtrage
  }

  /**
   * Obtenir les notifications filtrées
   */
  getFilteredNotifications(): any[] {
    if (this.notificationFilter === 'all') {
      return this.mockNotifications;
    }
    return this.mockNotifications.filter(n => n.type === this.notificationFilter);
  }

  // Obtenir la classe CSS pour un jour avec événements
  getDayEventClass(day: any): string {
    if (!day.hasEvents) return '';

    const hasConvention = day.events.some((e: any) => e.type === 'convention');
    const hasInvoice = day.events.some((e: any) => e.type === 'facture');
    const hasOverdue = day.events.some((e: any) => e.status === 'OVERDUE' || e.status === 'EXPIRED');

    if (hasOverdue) return 'has-overdue';
    if (hasConvention && hasInvoice) return 'has-both';
    if (hasConvention) return 'has-convention';
    if (hasInvoice) return 'has-invoice';

    return '';
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
