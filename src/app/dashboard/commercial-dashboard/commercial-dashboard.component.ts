import { Component, OnInit } from '@angular/core';
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
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
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
    MatProgressSpinnerModule
  ],
  templateUrl: './commercial-dashboard.component.html',
  styleUrls: ['./commercial-dashboard.component.scss']
})
export class CommercialDashboardComponent implements OnInit {

  // User info
  currentUser: any = { username: 'commercial' };
  currentDate = new Date();
  
  // Sidebar
  activeSection = 'dashboard';
  
  // Header properties (identique au dashboard admin)
  searchQuery = '';
  hasNotifications = false;
  notificationCount = 0;
  hasMessages = false;
  messageCount = 0;
  darkMode = false;
  userMenuOpen = false;
  
  // Nouvelles propriétés pour la restructuration
  activeTabIndex = 0;
  searchTerm = '';

  // KPI et métriques
  kpiMetrics: KPIMetrics = {
    totalConventions: 12,
    activeConventions: 8,
    expiredConventions: 2,
    totalInvoices: 25,
    paidInvoices: 18,
    overdueInvoices: 3,
    collectionRate: 72,
    averagePaymentTime: 28,
    monthlyRevenue: 45000,
    pendingAmount: 12500
  };

  // Filtres avancés
  showAdvancedFilters = false;

  // Données de test
  conventions: Convention[] = []; // Données chargées depuis la base de données

  invoices: Invoice[] = []; // Données chargées depuis la base de données

  filteredConventions: Convention[] = [];
  filteredInvoices: Invoice[] = [];
  invoiceDataSource: any = { data: [] };
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
    private router: Router
  ) {
    console.log('CommercialDashboardComponent chargé');
  }

  ngOnInit(): void {
    console.log('🚀 CommercialDashboard ngOnInit() appelé');
    this.loadDashboardData();
  }

  // Méthodes de sélection
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.filteredConventions.length;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.selectedConventions = [];
    } else {
      this.filteredConventions.forEach(row => {
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
          console.log('📊 this.conventions après assignation:', this.conventions.length);
          console.log('📊 this.filteredConventions après assignation:', this.filteredConventions.length);
          console.log('📊 Contenu de filteredConventions:', this.filteredConventions);
          
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

  // Export et rapports
  exportConventions(format: 'excel' | 'pdf' | 'csv'): void {
    this.snackBar.open(`Export des conventions en ${format.toUpperCase()}`, 'Fermer', { duration: 3000 });
  }

  exportInvoices(format: 'excel' | 'pdf' | 'csv'): void {
    this.snackBar.open(`Export des factures en ${format.toUpperCase()}`, 'Fermer', { duration: 3000 });
  }

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

  isOverdue(date: Date): boolean {
    return date < new Date();
  }

  getDaysOverdue(dueDate: Date): number {
    const diffTime = Math.abs(new Date().getTime() - dueDate.getTime());
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
  }

  onConventionSearch(event: any): void {
    const query = event.target.value.toLowerCase();
    if (query) {
      this.filteredConventions = this.conventions.filter(conv => 
        conv.reference.toLowerCase().includes(query) ||
        conv.title.toLowerCase().includes(query)
      );
    } else {
      this.filteredConventions = [...this.conventions];
    }
  }

  // Actions sur les conventions
  editConvention(convention: Convention): void {
    console.log('Édition de la convention:', convention);
    const dialogRef = this.dialog.open(ConventionDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { mode: 'edit', convention: convention }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Convention modifiée:', result);
        // Mettre à jour la convention dans la liste
        const index = this.conventions.findIndex(c => c.id === convention.id);
        if (index !== -1) {
          this.conventions[index] = { ...this.conventions[index], ...result };
          this.filteredConventions = [...this.conventions];
          this.snackBar.open('Convention modifiée avec succès', 'Fermer', { duration: 3000 });
        }
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

  // Actions sur les factures
  editInvoice(invoice: Invoice): void {
    console.log('Édition de la facture:', invoice);
    this.snackBar.open(`Édition de la facture ${invoice.invoiceNumber}`, 'Fermer', { duration: 3000 });
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
    console.log('Export des données');
    this.snackBar.open('Export en cours...', 'Fermer', { duration: 3000 });
  }

  // Actions sur les factures
  sendReminder(invoice: Invoice): void {
    console.log('Envoi de rappel pour la facture:', invoice);
    this.snackBar.open(`Rappel envoyé pour ${invoice.invoiceNumber}`, 'Fermer', { duration: 3000 });
  }

  markAsPaid(invoice: Invoice): void {
    console.log('Marquage comme payée pour la facture:', invoice);
    invoice.status = 'PAID';
    this.snackBar.open(`Facture ${invoice.invoiceNumber} marquée comme payée`, 'Fermer', { duration: 3000 });
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
      case 'exports':
        this.exportData();
        break;
      case 'profile':
        // Navigation vers le profil
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
    console.log('Déconnexion du commercial');
    // Implémenter la logique de déconnexion
    this.snackBar.open('Déconnexion en cours...', 'Fermer', { duration: 2000 });
    // Redirection vers la page d'accueil
    // this.router.navigate(['/home']);
  }

  // Méthodes du header (même que admin)
  toggleNotifications() {
    this.hasNotifications = !this.hasNotifications;
    console.log('Toggle notifications');
  }

  toggleMessages() {
    console.log('🔔 Clic sur icône message détecté');
    import('../../shared/components/messaging/messaging.component').then(m => {
      console.log('✅ Import réussi, ouverture dialog');
      this.dialog.open(m.MessagingComponent, {
        width: '95vw',
        maxWidth: '1200px',
        height: '90vh',
        panelClass: 'messaging-dialog',
        disableClose: false,
        autoFocus: false
      });
    }).catch((error) => {
      console.error('❌ Erreur import:', error);
      console.log('Redirection vers /messaging');
      this.router.navigate(['/messaging']);
    });
  }

  toggleSettings() {
    console.log('Toggle settings');
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    console.log('Toggle dark mode:', this.darkMode);
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  goToProfile() {
    console.log('Go to profile');
    this.userMenuOpen = false;
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
    console.log('Export du graphique:', type);
    this.snackBar.open(`Export du graphique ${type} en cours...`, 'Fermer', { duration: 2000 });
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

  // Navigation vers les notifications
  navigateToNotifications(): void {
    this.activeSection = 'notifications';
    this.activeTabIndex = 2; // Onglet Notifications
    console.log('Navigation vers les notifications');
    
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
    this.activeTabIndex = 3; // Onglet Calendrier
    console.log('Navigation vers le calendrier');
    
    // Scroll vers la section des onglets
    setTimeout(() => {
      const tabsSection = document.querySelector('.tabs-section');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Charger les factures
  loadInvoices(): void {
    console.log('📋 Chargement des factures...');
    
    this.http.get<any[]>('http://localhost:8085/api/invoices', { headers: this.getAuthHeaders() })
      .subscribe({
        next: (invoices: any[]) => {
          console.log('✅ Factures chargées depuis la DB:', invoices.length);
          
          // Enrichir les factures avec les informations de convention
          const enrichedInvoices = invoices.map(invoice => {
            const convention = this.conventions.find(c => c.id === invoice.conventionId);
            return {
              ...invoice,
              conventionReference: convention ? convention.reference : 'N/A',
              conventionTitle: convention ? convention.title : 'N/A'
            };
          });
          
          this.invoices = enrichedInvoices;
          this.invoiceDataSource.data = enrichedInvoices;
          this.filteredInvoices = [...enrichedInvoices];
          
          // Mettre à jour les factures en retard et à venir
          this.overdueInvoices = enrichedInvoices.filter(inv => inv.status === 'OVERDUE');
          this.upcomingInvoices = enrichedInvoices.filter(inv => inv.status === 'PENDING');
          
          console.log('📊 Factures en retard:', this.overdueInvoices.length);
          console.log('📊 Factures en attente:', this.upcomingInvoices.length);
        },
        error: (error: any) => {
          console.error('❌ Erreur lors du chargement des factures:', error);
          this.invoices = [];
          this.invoiceDataSource.data = [];
          this.filteredInvoices = [];
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
}
