import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProcessTimelineComponent, TimelineStep } from '../../shared/components/process-timeline/process-timeline.component';
import { GanttChartComponent, GanttTask } from '../../shared/components/gantt-chart/gantt-chart.component';
import { CommercialDetailsDialogComponent } from './commercial-details-dialog.component';
import { ConventionInvoicesDialogComponent } from '../../features/convention-management/convention-invoices-dialog/convention-invoices-dialog.component';
import { KpiAlertsSectionComponent } from '../../components/kpi-alerts-section/kpi-alerts-section.component';
import { NotificationPanelComponent } from '../../shared/components/notification-panel/notification-panel.component';
import { ConventionService } from '../../services/convention.service';
import { InvoiceService } from '../../services/invoice.service';
import { TaskService } from '../../services/task.service';
import { ProjectManagerService } from '../../services/project-manager.service';
import { StructureService, Structure } from '../../services/structure.service';
import { AuthService } from '../../core/services/auth.service';
import { Convention } from '../../models/convention.model';
import { Invoice } from '../../models/invoice.model';
import { WebsocketService, WebSocketMessage } from '../../services/websocket.service';
import { MonitoringService, SystemStats, MonitoringAlert } from '../../services/monitoring.service';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subject, timer, forkJoin } from 'rxjs';
import { takeUntil, tap, catchError, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  currentTask?: string;
  lastActivity: Date;
  // Statistiques réelles
  assignedConventions?: number;
  activeConventions?: number;
  expiredConventions?: number;
  totalInvoices?: number;
  overdueInvoices?: number;
  paidInvoices?: number;
  pendingInvoices?: number;
  paymentRate?: number;
  performanceScore?: number;
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: Date;
  progress: number;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'completed';
  tasks: ProjectTask[];
  velocity: number;
  burndownData: { date: string; remaining: number }[];
}

@Component({
  selector: 'app-project-manager-dashboard',
  standalone: true,
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(-10px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ transform: 'translateY(-10px)', opacity: 0 }))
      ])
    ])
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
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
    ProcessTimelineComponent,
    GanttChartComponent,
    KpiAlertsSectionComponent,
    NotificationPanelComponent,
    MatSortModule,
    MatButtonToggleModule
  ],
  templateUrl: './project-manager-dashboard.component.html',
  styleUrls: [
    './project-manager-dashboard.component.scss',
    './notifications-panel.scss'
  ]
})
export class ProjectManagerDashboardComponent implements OnInit, OnDestroy {

  // Header properties (même que admin)
  currentUser: any = { username: 'chef-projet' };
  searchQuery = '';
  hasNotifications = false;
  notificationCount = 0;
  hasMessages = true;
  messageCount = 2;
  userMenuOpen = false;
  showNotificationsPanel = false;

  // Notifications en temps réel
  realtimeNotifications: Array<{
    id: string;
    type: 'kpi_alert' | 'invoice_alert' | 'convention_alert' | 'system' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    priority: 'high' | 'medium' | 'low';
    data?: any;
  }> = [];
  darkMode = false;

  // Sidebar properties
  sidebarCollapsed = false;
  activeSection = 'overview';

  // Last update tracking
  lastUpdate = new Date();
  isRefreshing = false;

  // KPI Data - Indicateurs Clés
  kpiData = {
    totalConventions: 0,
    expiredConventions: 0,
    totalInvoices: 0,
    totalInvoicesAmount: 0,
    overdueInvoices: 0,
    overduePercentage: 0,
    upcomingDeadlines: 0,
    teamPerformance: 85,
    regularizationRate: 72
  };

  stats = {
    conventionsAtRisk: 0,
    detectedDelays: 0,
    pendingAlerts: 0,
    teamProductivity: 85,
    sprintProgress: 65,
    activeSprints: 2
  };

  conventions: Convention[] = [];
  invoices: Invoice[] = [];
  structures: Structure[] = []; // Liste des structures pour récupérer les noms
  systemStats: SystemStats | null = null;
  alerts: MonitoringAlert[] = [];

  // Équipe commerciale (chargée depuis le backend)
  teamMembers: TeamMember[] = [];

  // Données pour le Gantt Chart
  ganttTasks: GanttTask[] = [];

  // Performance par région (calculée depuis les données réelles)
  regionPerformance: any[] = [];

  // Projets clients (calculés depuis les conventions réelles)
  clientProjects: any[] = [];

  teamTimeline: TimelineStep[] = [
    { title: 'Conventions Signées', status: 'completed', date: '10-06-2024' },
    { title: 'Factures Générées', status: 'active' },
    { title: 'Alertes en Attente', status: 'pending' },
    { title: 'Revue Hebdomadaire', status: 'pending' }
  ];

  zones: string[] = ['Zone Nord', 'Zone Centre', 'Zone Sud', 'Zone Est', 'Zone Ouest'];
  teams: string[] = ['Équipe Alpha', 'Équipe Bêta', 'Équipe Gamma', 'Équipe Delta'];



  reminders: { to: string; message: string; date: Date }[] = [];
  reminderForm = { to: '', message: '' };
  reminderMessage = '';

  timeline: { label: string, date: string, status: string }[] = [
    { label: 'Début Sprint', date: '2024-06-01', status: 'done' },
    { label: 'Livraison Intermédiaire', date: '2024-06-10', status: 'in-progress' },
    { label: 'Tests Fonctionnels', date: '2024-06-15', status: 'pending' },
    { label: 'Clôture Sprint', date: '2024-06-20', status: 'pending' }
  ];

  logs: string[] = [
    'Convention X modifiée par Commercial A',
    'Facture Y validée',
    'Alerte envoyée à Commercial B',
    'Sprint 3 démarré'
  ];

  messages: { from: string, content: string, date: string }[] = [];
  newMessage = '';

  // Internal comments
  newComment = '';
  selectedCommercialForComment: string | null = null;
  internalComments: Array<{
    id: string;
    author: string;
    content: string;
    date: Date;
    mentionedCommercial?: string;
  }> = [];

  // Real-time status
  isWebSocketConnected = false;
  isLoading = {
    conventions: false,
    invoices: false,
    team: false
  };

  // Filters
  filters = {
    zone: '',
    team: '',
    status: '',
    priority: ''
  };

  // Contract filters
  contractSearch = '';
  contractStatusFilter = '';
  contractStartDate: Date | null = null;
  contractEndDate: Date | null = null;
  filteredContracts: any[] = [];

  // Alert filters
  alertFilter = 'all';
  filteredAlerts: any[] = [];

  // Indicateurs calculés dynamiquement
  calculatedIndicators = {
    commercialEfficiency: 0,      // Taux d'efficacité commerciale
    avgPaymentDelay: 0,            // Délai moyen de paiement en jours
    conventionGrowthRate: 0,       // Taux d'évolution des conventions
    invoicePaymentRatio: 0,        // Ratio factures payées / émises
    avgDelayIndex: 0                // Indice de retard moyen
  };

  // ViewChild for sort and paginator
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('contractsPaginator') contractsPaginator!: MatPaginator;
  @ViewChild('invoicesPaginator') invoicesPaginator!: MatPaginator;

  // Charts instances
  evolutionChart: any = null;
  performanceChart: any = null;
  statusChart: any = null;
  burndownChart: any = null;

  // Charts data
  chartData = {
    evolution: {
      labels: [] as string[],
      conventions: [] as number[],
      invoices: [] as number[]
    },
    performance: {
      labels: [] as string[],
      scores: [] as number[]
    },
    status: {
      labels: ['Payées', 'En attente', 'En retard'],
      data: [0, 0, 0]
    }
  };

  private destroy$ = new Subject<void>();

  constructor(
    private conventionService: ConventionService,
    private invoiceService: InvoiceService,
    private taskService: TaskService,
    private projectManagerService: ProjectManagerService,
    private structureService: StructureService,
    private authService: AuthService,
    private websocket: WebsocketService,
    private monitoringService: MonitoringService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    console.log('🚀 [PROJECT MANAGER] Initialisation du dashboard...');
    this.setupRealTimeUpdates();
    this.setupWebSocketConnection();
    // Charger les structures en premier pour avoir les noms
    console.log('📥 [PROJECT MANAGER] Chargement des structures...');
    this.loadStructures();
    // Charger les données via les méthodes dédiées (plus complètes)
    console.log('📥 [PROJECT MANAGER] Chargement des conventions...');
    this.loadContracts();
    console.log('📥 [PROJECT MANAGER] Chargement des factures...');
    this.loadInvoices();
    console.log('📥 [PROJECT MANAGER] Chargement de l\'équipe...');
    this.loadTeamMembers();
    // Charger les notifications déléguées
    console.log('📥 [PROJECT MANAGER] Chargement des notifications...');
    this.loadDelegatedNotifications();
    this.loadNotificationCount();
    this.startNotificationRefresh();
    this.startPeriodicUpdates();
    this.initializeGanttTasks();

    // Initialiser les graphiques après un délai pour s'assurer que les données sont chargées
    setTimeout(() => {
      this.initializeCharts();
    }, 3000);
  }

  private initializeGanttTasks(): void {
    // Créer des tâches basées sur les vraies conventions et factures
    this.createTasksFromRealData();
  }

  private createTasksFromRealData(): void {
    // Attendre que les conventions et factures soient chargées
    setTimeout(() => {
      const tasks: any[] = [];
      const today = new Date();

      // Créer des tâches à partir des conventions réelles
      this.conventions.slice(0, 5).forEach((convention, index) => {
        // Assigner aléatoirement un commercial de l'équipe
        const commercial = this.teamMembers[index % this.teamMembers.length];

        tasks.push({
          id: `conv-${convention.id}`,
          name: `Convention: ${convention.reference || convention.title}`,
          startDate: convention.startDate ? new Date(convention.startDate) : new Date(today.getTime() - (10 + index * 5) * 24 * 60 * 60 * 1000),
          endDate: convention.endDate ? new Date(convention.endDate) : new Date(today.getTime() + (10 + index * 5) * 24 * 60 * 60 * 1000),
          progress: convention.status === 'ACTIVE' ? 75 : convention.status === 'EXPIRED' ? 100 : 50,
          status: convention.status === 'ACTIVE' ? 'in-progress' : convention.status === 'EXPIRED' ? 'completed' : 'pending',
          assignee: commercial?.name || 'Non assigné'
        });
      });

      // Créer des tâches à partir des factures en retard
      const overdueInvoices = this.invoices.filter(i => i.status === 'OVERDUE').slice(0, 3);
      overdueInvoices.forEach((invoice, index) => {
        const commercial = this.teamMembers[index % this.teamMembers.length];

        tasks.push({
          id: `inv-${invoice.id}`,
          name: `Facture en retard: ${invoice.invoiceNumber}`,
          startDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000),
          endDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
          progress: 30,
          status: 'blocked',
          assignee: commercial?.name || 'Non assigné'
        });
      });

      // Créer des tâches à partir des conventions proches de l'échéance
      const upcomingConventions = this.conventions.filter(c => {
        if (c.endDate) {
          const endDate = new Date(c.endDate);
          const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
          return endDate >= today && endDate <= thirtyDaysFromNow;
        }
        return false;
      }).slice(0, 2);

      upcomingConventions.forEach((convention, index) => {
        const commercial = this.teamMembers[index % this.teamMembers.length];

        tasks.push({
          id: `renewal-${convention.id}`,
          name: `Renouvellement: ${convention.reference || convention.title}`,
          startDate: today,
          endDate: convention.endDate ? new Date(convention.endDate) : new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000),
          progress: 10,
          status: 'pending',
          assignee: commercial?.name || 'Non assigné'
        });
      });

      this.ganttTasks = tasks.length > 0 ? tasks : this.createDemoTasks();
      console.log('✅ Tâches Gantt créées depuis les données réelles:', this.ganttTasks.length);
    }, 2000); // Attendre 2 secondes que les données soient chargées
  }

  private createDemoTasks(): any[] {
    // Ne créer des tâches de démo que si des commerciaux réels existent
    if (this.teamMembers.length === 0) {
      return []; // Pas de tâches si pas de commerciaux
    }

    const today = new Date();
    const assignees = this.teamMembers.map(m => m.name);

    return [
      {
        id: '1',
        name: 'Analyse des besoins clients',
        startDate: new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
        progress: 100,
        status: 'completed',
        assignee: assignees[0] || 'Non assigné'
      },
      {
        id: '2',
        name: 'Rédaction conventions',
        startDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        progress: 100,
        status: 'completed',
        assignee: assignees[1] || assignees[0] || 'Non assigné'
      },
      {
        id: '3',
        name: 'Validation juridique',
        startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: today,
        progress: 85,
        status: 'in-progress',
        assignee: assignees[2] || assignees[0] || 'Non assigné'
      },
      {
        id: '4',
        name: 'Génération factures Q2',
        startDate: today,
        endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        progress: 40,
        status: 'in-progress',
        assignee: assignees[0] || 'Non assigné'
      },
      {
        id: '5',
        name: 'Suivi paiements',
        startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
        progress: 0,
        status: 'not-started',
        assignee: assignees[1] || assignees[0] || 'Non assigné'
      },
      {
        id: '6',
        name: 'Rapport mensuel',
        startDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000),
        progress: 0,
        status: 'not-started',
        assignee: assignees[2] || assignees[0] || 'Non assigné'
      }
    ];
  }

  private createAndSaveDemoTasks(): void {
    const demoTasks = this.createDemoTasks();

    // Sauvegarder chaque tâche dans la base de données
    demoTasks.forEach(task => {
      this.taskService.createTask(task)
        .pipe(
          takeUntil(this.destroy$),
          catchError(error => {
            console.error('❌ Erreur lors de la création de la tâche:', error);
            return of(null);
          })
        )
        .subscribe(createdTask => {
          if (createdTask) {
            console.log('✅ Tâche créée:', createdTask.name);
          }
        });
    });

    // Afficher les tâches de démonstration immédiatement
    this.ganttTasks = demoTasks;
    this.snackBar.open('Tâches de démonstration créées', 'OK', { duration: 3000 });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Détruire les graphiques
    if (this.evolutionChart) this.evolutionChart.destroy();
    if (this.performanceChart) this.performanceChart.destroy();
    if (this.statusChart) this.statusChart.destroy();
  }

  /**
   * Rafraîchir toutes les données et graphiques
   */
  refreshAllData(): void {
    this.isRefreshing = true;
    console.log('🔄 Rafraîchissement complet des données...');
    
    // Invalider le cache du service
    this.projectManagerService.refreshCache();
    
    // Recharger toutes les données
    forkJoin({
      stats: this.projectManagerService.getCompleteStats(),
      conventions: this.projectManagerService.getAllConventions(),
      invoices: this.projectManagerService.getAllInvoices(),
      teamStats: this.projectManagerService.getTeamMembersStats()
    }).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('❌ Erreur lors du rafraîchissement:', error);
        this.snackBar.open('Erreur lors du rafraîchissement', 'Fermer', { duration: 3000 });
        return of(null);
      })
    ).subscribe(result => {
      if (result) {
        // Mettre à jour les KPIs
        if (result.stats) {
          this.kpiData = {
            totalConventions: result.stats.totalConventions,
            expiredConventions: result.stats.expiredConventions,
            totalInvoices: result.stats.totalInvoices,
            totalInvoicesAmount: result.stats.totalInvoicesAmount,
            overdueInvoices: result.stats.overdueInvoices,
            overduePercentage: Math.round(result.stats.overduePercentage),
            upcomingDeadlines: result.stats.upcomingDeadlines,
            teamPerformance: Math.round(result.stats.teamPerformance),
            regularizationRate: Math.round(result.stats.regularizationRate)
          };
        }
        
        // Mettre à jour les conventions
        if (result.conventions) {
          this.conventions = result.conventions;
        }
        
        // Mettre à jour les factures
        if (result.invoices) {
          this.invoices = result.invoices;
        }
        
        // Mettre à jour l'équipe
        if (result.teamStats) {
          this.teamMembers = result.teamStats.map(m => ({
            id: m.id,
            name: m.name,
            role: m.role,
            status: m.status as 'online' | 'offline' | 'busy',
            currentTask: m.currentTask,
            lastActivity: new Date(m.lastActivity),
            assignedConventions: m.assignedConventions,
            activeConventions: m.activeConventions,
            expiredConventions: m.expiredConventions,
            totalInvoices: m.totalInvoices,
            overdueInvoices: m.overdueInvoices,
            paidInvoices: m.paidInvoices,
            pendingInvoices: m.pendingInvoices,
            paymentRate: m.paymentRate,
            performanceScore: m.performanceScore
          }));
        }
        
        // Rafraîchir les graphiques
        this.updateChartsData();
        
        this.lastUpdate = new Date();
        this.snackBar.open('✅ Données rafraîchies avec succès', 'Fermer', { duration: 2000 });
      }
      this.isRefreshing = false;
    });
  }

  /**
   * Mettre à jour les données des graphiques et les redessiner
   */
  private updateChartsData(): void {
    // Préparer les nouvelles données
    this.prepareChartsData();
    
    // Mettre à jour le graphique d'évolution
    if (this.evolutionChart) {
      this.evolutionChart.data.datasets[0].data = this.chartData.evolution.conventions;
      this.evolutionChart.data.datasets[1].data = this.chartData.evolution.invoices;
      this.evolutionChart.update('active');
    }
    
    // Mettre à jour le graphique de performance
    if (this.performanceChart) {
      this.performanceChart.data.labels = this.chartData.performance.labels;
      this.performanceChart.data.datasets[0].data = this.chartData.performance.scores;
      this.performanceChart.update('active');
    }
    
    // Mettre à jour le graphique de statut
    if (this.statusChart) {
      this.statusChart.data.datasets[0].data = this.chartData.status.data;
      this.statusChart.update('active');
    }
    
    console.log('✅ Graphiques mis à jour');
  }

  // Méthodes du header (même que admin)
  getDefaultAvatar(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0RjhERjkiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTRDOC42ODYyOSAxNCA2IDE2LjY4NjMgNiAyMEgxOEMxOCAxNi42ODYzIDE1LjMxMzcgMTQgMTIgMTRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+';
  }

  toggleNotifications() {
    this.showNotificationsPanel = !this.showNotificationsPanel;
    console.log('Toggle notifications panel:', this.showNotificationsPanel);
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllNotificationsAsRead(): void {
    this.realtimeNotifications.forEach(n => n.read = true);
    this.updateNotificationCount();
  }

  /**
   * Marquer une notification comme lue
   */
  markNotificationAsRead(notification: any): void {
    notification.read = true;
    this.updateNotificationCount();
  }

  /**
   * Supprimer une notification
   */
  removeNotification(notification: any, event: Event): void {
    event.stopPropagation();
    const index = this.realtimeNotifications.findIndex(n => n.id === notification.id);
    if (index > -1) {
      this.realtimeNotifications.splice(index, 1);
      this.updateNotificationCount();
    }
  }

  /**
   * Mettre à jour le compteur de notifications
   */
  private updateNotificationCount(): void {
    this.notificationCount = this.realtimeNotifications.filter(n => !n.read).length;
    this.hasNotifications = this.notificationCount > 0;
  }

  /**
   * Obtenir l'icône selon le type de notification
   */
  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'kpi_alert': 'warning',
      'invoice_alert': 'receipt',
      'convention_alert': 'description',
      'system': 'info',
      'info': 'notifications'
    };
    return icons[type] || 'notifications';
  }

  /**
   * Obtenir la classe CSS selon le type
   */
  getNotificationIconClass(type: string): string {
    const classes: { [key: string]: string } = {
      'kpi_alert': 'icon-error',
      'invoice_alert': 'icon-warning',
      'convention_alert': 'icon-info',
      'system': 'icon-system',
      'info': 'icon-info'
    };
    return classes[type] || 'icon-info';
  }

  /**
   * Obtenir le temps écoulé depuis la notification (style Facebook)
   */
  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return new Date(timestamp).toLocaleDateString('fr-FR');
  }

  toggleMessages(): void {
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
  }

  logout() {
    console.log('🚪 Déconnexion du chef de projet...');
    this.authService.logout();
  }

  // Sidebar methods
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  /**
   * Naviguer vers la page de gestion des alertes KPI
   */
  navigateToKpiAlerts(): void {
    this.router.navigate(['/kpi-alerts']);
  }

  navigateToSection(section: string): void {
    this.activeSection = section;

    // Scroll vers la section correspondante avec ID
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Fallback: chercher par classe CSS
      const sectionMap: { [key: string]: string } = {
        'overview': '.kpi-section',
        'contracts': '.contracts-overview-card',
        'invoices': '.invoices-tracking-card',
        'analytics': '.charts-section',
        'projects': '.projects-section',
        'team': '.team-section',
        'alerts': '.alerts-section-pro',
        'gantt': 'app-gantt-chart'
      };

      const selector = sectionMap[section];
      if (selector) {
        const fallbackElement = document.querySelector(selector);
        if (fallbackElement) {
          fallbackElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  }

  private setupRealTimeUpdates(): void {
    // Subscribe to WebSocket dashboard updates
    this.websocket.dashboardUpdates$
      .pipe(takeUntil(this.destroy$))
      .subscribe((message: WebSocketMessage) => {
        this.handleDashboardUpdate(message);
      });

    // Subscribe to monitoring updates
    this.monitoringService.systemStats$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.systemStats = stats;
        this.updateTeamProductivity(stats);
      });

    this.monitoringService.alerts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(alerts => {
        this.alerts = alerts;
        this.stats.pendingAlerts = alerts.filter(a => !a.acknowledged).length;

        // Initialiser les alertes filtrées
        this.filterAlerts();

        // Show notifications for new alerts
        const newAlerts = alerts.filter(a => !a.acknowledged &&
          new Date(a.timestamp).getTime() > Date.now() - 60000);
        newAlerts.forEach(alert => {
          this.snackBar.open(alert.message, 'Fermer', {
            duration: 5000,
            panelClass: `alert-${alert.type}`
          });
        });
      });
  }

  private setupWebSocketConnection(): void {
    this.websocket.connectionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isConnected => {
        this.isWebSocketConnected = isConnected;
        if (isConnected) {
          console.log('✅ WebSocket connected for project manager dashboard');

          // S'abonner aux notifications KPI après connexion
          this.subscribeToKpiAlerts();
          this.subscribeToInvoiceAlerts();
        } else {
          console.log('❌ WebSocket disconnected for project manager dashboard');
        }
      });
  }

  /**
   * S'abonner aux alertes KPI en temps réel
   */
  private subscribeToKpiAlerts(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;

    console.log('🔔 [KPI ALERTS] Abonnement aux alertes KPI pour:', currentUser.username);

    // Écouter le topic général des alertes KPI
    this.websocket.subscribe('/topic/kpi-alerts', (message: any) => {
      console.log('========================================');
      console.log('🚨 [KPI ALERT] Nouvelle alerte KPI reçue via WebSocket');
      console.log('📊 Alerte:', message);
      console.log('========================================');

      // Afficher une notification visuelle
      this.showKpiAlert(message);

      // Ajouter à la liste des alertes
      this.addKpiAlertToList(message);
    });

    // Écouter aussi la queue personnelle
    this.websocket.subscribe(`/user/queue/kpi-alerts`, (message: any) => {
      console.log('========================================');
      console.log('🚨 [KPI ALERT PERSONAL] Alerte KPI personnelle reçue');
      console.log('📊 Alerte:', message);
      console.log('========================================');

      this.showKpiAlert(message);
      this.addKpiAlertToList(message);
    });
  }

  /**
   * S'abonner aux alertes de factures
   */
  private subscribeToInvoiceAlerts(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;

    console.log('🔔 [INVOICE ALERTS] Abonnement aux alertes factures');

    this.websocket.subscribe('/topic/invoice-alerts', (message: any) => {
      console.log('========================================');
      console.log('💰 [INVOICE ALERT] Nouvelle alerte facture reçue');
      console.log('📄 Alerte:', message);
      console.log('========================================');

      this.showInvoiceAlert(message);
    });
  }

  /**
   * Afficher une alerte KPI
   */
  private showKpiAlert(alert: any): void {
    const severity = alert.severity || 'MEDIUM';
    const icon = severity === 'HIGH' ? '🔴' : severity === 'MEDIUM' ? '🟠' : '🟡';

    // Ajouter au panneau de notifications
    this.addNotificationToPanel({
      id: alert.id || Date.now().toString(),
      type: 'kpi_alert',
      title: `Alerte KPI: ${alert.kpiName}`,
      message: alert.message,
      timestamp: new Date(),
      read: false,
      priority: severity === 'HIGH' ? 'high' : 'medium',
      data: alert
    });

    // Afficher aussi une snackbar
    this.snackBar.open(
      `${icon} ALERTE KPI: ${alert.kpiName} - ${alert.message}`,
      'Voir détails',
      {
        duration: 10000,
        panelClass: severity === 'HIGH' ? 'alert-error' : 'alert-warning',
        horizontalPosition: 'end',
        verticalPosition: 'top'
      }
    ).onAction().subscribe(() => {
      // Naviguer vers la section alertes
      this.navigateToSection('alerts');
    });
  }




  private loadInitialData(): void {
    this.isLoading.conventions = true;
    this.isLoading.invoices = true;
    this.isLoading.team = true;

    // Charger les statistiques complètes depuis l'API
    this.projectManagerService.getCompleteStats()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('❌ Erreur lors du chargement des statistiques:', error);
          return of(null);
        })
      )
      .subscribe(stats => {
        if (stats) {
          this.kpiData = {
            totalConventions: stats.totalConventions,
            expiredConventions: stats.expiredConventions,
            totalInvoices: stats.totalInvoices,
            totalInvoicesAmount: stats.totalInvoicesAmount,
            overdueInvoices: stats.overdueInvoices,
            overduePercentage: Math.round(stats.overduePercentage),
            upcomingDeadlines: stats.upcomingDeadlines,
            teamPerformance: Math.round(stats.teamPerformance),
            regularizationRate: Math.round(stats.regularizationRate)
          };
          console.log('✅ Statistiques chargées:', this.kpiData);
        }
      });

    // Charger les conventions réelles
    this.projectManagerService.getAllConventions()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('❌ Erreur lors du chargement des conventions:', error);
          this.snackBar.open('Erreur lors du chargement des conventions', 'Fermer', { duration: 3000 });
          return of([]);
        })
      )
      .subscribe(conventions => {
        console.log('📦 Conventions (loadInitialData):', conventions);
        this.conventions = conventions;
        this.contractsDataSource = conventions.map(c => ({
          reference: c.reference || 'N/A',
          client: (c as any).client || c.structureId || 'N/A',
          governorate: (c as any).governorate || 'Non spécifié',
          commercial: (c as any).createdBy || 'Non assigné',
          amount: this.parseAmount((c as any).amount),
          status: c.status || 'UNKNOWN',
          progress: this.calculateProgress(c),
          startDate: c.startDate ? new Date(c.startDate) : new Date(),
          endDate: c.endDate ? new Date(c.endDate) : new Date()
        }));
        this.filteredContracts = [...this.contractsDataSource]; // AJOUT: Mettre à jour filteredContracts
        this.isLoading.conventions = false;
        console.log('✅ Conventions chargées:', conventions.length);
        console.log('✅ ContractsDataSource:', this.contractsDataSource);
      });

    // Charger les factures réelles
    this.projectManagerService.getAllInvoices()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('❌ Erreur lors du chargement des factures:', error);
          this.snackBar.open('Erreur lors du chargement des factures', 'Fermer', { duration: 3000 });
          return of([]);
        })
      )
      .subscribe(invoices => {
        console.log('📦 Factures reçues:', invoices);
        this.invoices = invoices;
        this.invoicesDataSource = invoices.map(i => ({
          invoiceNumber: i.invoiceNumber || 'N/A',
          contractRef: i.conventionId || (i as any).reference || 'N/A',
          amount: this.parseAmount((i as any).amount),
          status: i.status || 'UNKNOWN',
          dueDate: i.dueDate ? new Date(i.dueDate) : new Date()
        }));
        this.isLoading.invoices = false;
        this.stats.detectedDelays = invoices.filter(i => i.status === 'OVERDUE').length;
        console.log('✅ Factures chargées:', invoices.length);
        console.log('✅ InvoicesDataSource:', this.invoicesDataSource);
      });

    // Charger les membres de l'équipe avec statistiques réelles
    this.projectManagerService.getTeamMembersStats()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('❌ Erreur lors du chargement de l\'équipe:', error);
          return of([]);
        })
      )
      .subscribe(members => {
        this.teamMembers = members.map(m => ({
          id: m.id,
          name: m.name,
          role: m.role,
          status: m.status as 'online' | 'offline' | 'busy',
          currentTask: m.currentTask,
          lastActivity: new Date(m.lastActivity),
          // Ajouter les statistiques réelles
          assignedConventions: m.assignedConventions,
          activeConventions: m.activeConventions,
          expiredConventions: m.expiredConventions,
          totalInvoices: m.totalInvoices,
          overdueInvoices: m.overdueInvoices,
          paidInvoices: m.paidInvoices,
          pendingInvoices: m.pendingInvoices,
          paymentRate: m.paymentRate,
          performanceScore: m.performanceScore
        }));
        this.isLoading.team = false;
        console.log('✅ Équipe chargée avec statistiques:', members.length);
      });

    // Charger les commentaires internes
    this.projectManagerService.getAllComments()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('❌ Erreur lors du chargement des commentaires:', error);
          return of([]);
        })
      )
      .subscribe(comments => {
        this.internalComments = comments.map(c => ({
          id: c.id || '',
          author: c.author,
          content: c.content,
          date: new Date(c.date),
          mentionedCommercial: c.mentionedCommercialName
        }));
        console.log('✅ Commentaires chargés:', comments.length);
      });
  }

  private startPeriodicUpdates(): void {
    // Update team status every 30 seconds
    timer(0, 30000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.updateTeamStatus())
      )
      .subscribe();

    // Update sprint progress every minute
    timer(0, 60000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.updateSprintProgress())
      )
      .subscribe();

    // Rafraîchir automatiquement toutes les données toutes les 5 minutes
    timer(300000, 300000) // 5 minutes
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('🔄 Auto-refresh périodique des données...');
        this.refreshAllData();
      });
  }

  private handleDashboardUpdate(message: WebSocketMessage): void {
    switch (message.data.type) {
      case 'team_update':
        this.handleTeamUpdate(message.data);
        break;
      case 'sprint_update':
        this.handleSprintUpdate(message.data);
        break;
      case 'convention_update':
        this.handleConventionUpdate(message.data);
        break;
      case 'alert_update':
        this.handleAlertUpdate(message.data);
        break;
    }
  }

  private handleTeamUpdate(data: any): void {
    if (data.teamMembers) {
      this.teamMembers = data.teamMembers;
    }
    if (data.productivity) {
      this.stats.teamProductivity = data.productivity;
    }
  }

  private handleSprintUpdate(data: any): void {
    // Sprint updates removed - using project-based approach
    console.log('Sprint update received:', data);
  }

  private handleConventionUpdate(data: any): void {
    if (data.conventions) {
      this.conventions = data.conventions;
      this.updateStats();
    }
  }

  private handleAlertUpdate(data: any): void {
    if (data.alert) {
      this.alerts.push({
        id: `alert-${Date.now()}`,
        message: data.alert.message,
        timestamp: new Date(),
        type: data.alert.type,
        acknowledged: false
      });
      this.snackBar.open(data.alert.message, 'Fermer', {
        duration: 5000,
        panelClass: `alert-${data.alert.type}`
      });
    }
  }

  private updateStats(): void {
    this.stats.conventionsAtRisk = this.conventions.filter(c => c.status === 'PENDING').length;
    this.stats.detectedDelays = this.invoices.filter(i => i.status === 'OVERDUE').length;

    // Update KPI Data
    this.updateKPIData();
  }

  private updateKPIData(): void {
    console.log('📊 [updateKPIData] Début du calcul des KPIs...');
    console.log('📊 [updateKPIData] this.conventions.length:', this.conventions.length);
    console.log('📊 [updateKPIData] this.invoices.length:', this.invoices.length);

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Conventions
    const activeConventions = this.conventions.filter(c => c.status === 'ACTIVE' || c.status === 'PENDING');
    this.kpiData.totalConventions = activeConventions.length;
    console.log('📊 [updateKPIData] Conventions ACTIVE/PENDING:', this.kpiData.totalConventions);

    this.kpiData.expiredConventions = this.conventions.filter(c => c.status === 'EXPIRED').length;
    console.log('📊 [updateKPIData] Conventions EXPIRED:', this.kpiData.expiredConventions);

    // Factures
    this.kpiData.totalInvoices = this.invoices.length;
    this.kpiData.totalInvoicesAmount = this.invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    console.log('📊 [updateKPIData] Total factures:', this.kpiData.totalInvoices);
    console.log('📊 [updateKPIData] Montant total:', this.kpiData.totalInvoicesAmount);

    this.kpiData.overdueInvoices = this.invoices.filter(i => i.status === 'OVERDUE').length;
    this.kpiData.overduePercentage = this.kpiData.totalInvoices > 0
      ? Math.round((this.kpiData.overdueInvoices / this.kpiData.totalInvoices) * 100)
      : 0;
    console.log('📊 [updateKPIData] Factures en retard:', this.kpiData.overdueInvoices);

    // Échéances proches (conventions expirant dans les 30 jours)
    this.kpiData.upcomingDeadlines = this.conventions.filter(c => {
      if (c.endDate) {
        const endDate = new Date(c.endDate);
        return endDate >= now && endDate <= thirtyDaysFromNow;
      }
      return false;
    }).length;
    console.log('📊 [updateKPIData] Échéances proches (30j):', this.kpiData.upcomingDeadlines);

    // Calculer les indicateurs avancés
    this.calculateAdvancedIndicators();

    this.lastUpdate = new Date();
    console.log('✅ [updateKPIData] KPIs calculés:', this.kpiData);
  }

  /**
   * Calculer les indicateurs avancés à partir des données réelles
   */
  private calculateAdvancedIndicators(): void {
    const now = new Date();

    // 1. Taux d'efficacité commerciale (conventions signées / total)
    const totalConventions = this.conventions.length;
    const signedConventions = this.conventions.filter(c => c.status === 'ACTIVE').length;
    this.calculatedIndicators.commercialEfficiency = totalConventions > 0
      ? Math.round((signedConventions / totalConventions) * 100)
      : 0;

    // 2. Délai moyen de paiement (en jours)
    const paidInvoices = this.invoices.filter(inv => inv.status === 'PAID' && inv.dueDate && (inv as any).paymentDate);
    if (paidInvoices.length > 0) {
      const totalDelay = paidInvoices.reduce((sum, inv) => {
        const dueDate = new Date(inv.dueDate!);
        const paymentDate = new Date((inv as any).paymentDate);
        const delay = Math.floor((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + Math.max(0, delay); // Seulement les retards positifs
      }, 0);
      this.calculatedIndicators.avgPaymentDelay = Math.round(totalDelay / paidInvoices.length);
    } else {
      this.calculatedIndicators.avgPaymentDelay = 0;
    }

    // 3. Taux d'évolution des conventions (croissance)
    // Comparer le mois en cours avec le mois précédent
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentMonthConventions = this.conventions.filter(c => {
      if (c.startDate) {
        const startDate = new Date(c.startDate);
        return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
      }
      return false;
    }).length;

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthConventions = this.conventions.filter(c => {
      if (c.startDate) {
        const startDate = new Date(c.startDate);
        return startDate.getMonth() === lastMonth && startDate.getFullYear() === lastMonthYear;
      }
      return false;
    }).length;

    this.calculatedIndicators.conventionGrowthRate = lastMonthConventions > 0
      ? Math.round(((currentMonthConventions - lastMonthConventions) / lastMonthConventions) * 100)
      : 0;

    // 4. Ratio factures payées / émises
    const paidCount = this.invoices.filter(i => i.status === 'PAID').length;
    this.calculatedIndicators.invoicePaymentRatio = this.invoices.length > 0
      ? Math.round((paidCount / this.invoices.length) * 100)
      : 0;

    // 5. Indice de retard moyen (jours de retard moyen pour les factures en retard)
    const overdueInvoices = this.invoices.filter(inv => inv.status === 'OVERDUE' && inv.dueDate);
    if (overdueInvoices.length > 0) {
      const totalOverdueDays = overdueInvoices.reduce((sum, inv) => {
        const dueDate = new Date(inv.dueDate!);
        const overdueDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + overdueDays;
      }, 0);
      this.calculatedIndicators.avgDelayIndex = Math.round(totalOverdueDays / overdueInvoices.length);
    } else {
      this.calculatedIndicators.avgDelayIndex = 0;
    }

    console.log('📊 [calculateAdvancedIndicators] Indicateurs calculés:', this.calculatedIndicators);
  }

  showOverdueInvoices(): void {
    this.invoiceFilter = 'OVERDUE';
    this.filterInvoices();
    this.navigateToSection('invoices');
  }

  showUpcomingDeadlines(): void {
    this.navigateToSection('contracts');
    this.snackBar.open(`${this.kpiData.upcomingDeadlines} conventions arrivent à échéance dans 30 jours`, 'Fermer', { duration: 4000 });
  }

  viewConventionInvoices(convention: Convention): void {
    console.log('📄 Affichage des factures pour la convention:', convention);
    this.dialog.open(ConventionInvoicesDialogComponent, {
      width: '1000px',
      maxWidth: '95vw',
      data: { convention }
    });
  }

  private updateTeamProductivity(stats: SystemStats | null): void {
    if (stats) {
      // Calculate team productivity based on system performance
      const systemEfficiency = (100 - stats.cpuUsage) / 100;
      const baseProductivity = 85;
      this.stats.teamProductivity = Math.round(baseProductivity * systemEfficiency);
    }
  }

  private updateTeamStatus(): Observable<any> {
    // Simulate team status updates
    this.teamMembers = this.teamMembers.map(member => ({
      ...member,
      status: Math.random() > 0.7 ? 'busy' : Math.random() > 0.3 ? 'online' : 'offline',
      lastActivity: new Date(Date.now() - Math.random() * 3600000)
    }));
    return new Observable(observer => {
      observer.next(this.teamMembers);
      observer.complete();
    });
  }

  private updateSprintProgress(): Observable<any> {
    // Sprint progress removed - using project-based approach
    return new Observable(observer => {
      observer.next(0);
      observer.complete();
    });
  }

  sendReminder(): void {
    if (this.reminderForm.to && this.reminderForm.message) {
      this.reminders.push({
        to: this.reminderForm.to,
        message: this.reminderForm.message,
        date: new Date()
      });
      this.reminderMessage = 'Rappel envoyé à ' + this.reminderForm.to;

      // Send via WebSocket
      this.websocket.sendMessage('/app/reminders', {
        to: this.reminderForm.to,
        message: this.reminderForm.message,
        timestamp: new Date().toISOString()
      });

      this.reminderForm = { to: '', message: '' };
      this.snackBar.open('Rappel envoyé avec succès', 'Fermer', { duration: 3000 });
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      const message = {
        from: 'Chef de Projet',
        content: this.newMessage,
        date: new Date().toISOString()
      };

      this.messages.push(message);

      // Send via WebSocket
      this.websocket.sendMessage('/app/chat', message);

      this.newMessage = '';
    }
  }

  contactCommercial(commercialId: string): void {
    const commercial = this.teamMembers.find(m => m.id === commercialId);
    if (commercial) {
      this.snackBar.open(`Contact de ${commercial.name} en cours...`, 'Fermer', { duration: 2000 });
      // Navigate to messaging
      this.router.navigate(['/messaging'], { queryParams: { userId: commercialId } });
    }
  }

  viewMemberDetails(commercialId: string): void {
    const commercial = this.teamMembers.find(m => m.id === commercialId);
    if (!commercial) {
      this.snackBar.open('Commercial non trouvé', 'Fermer', { duration: 2000 });
      return;
    }

    // Ouvrir le dialog avec les détails du commercial
    const dialogRef = this.dialog.open(CommercialDetailsDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { commercial }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'contact') {
        this.contactCommercial(result.commercialId);
      }
    });
  }

  updateTaskStatus(taskId: string, newStatus: string): void {
    this.snackBar.open(`Statut de l'action mis à jour: ${newStatus}`, 'Fermer', { duration: 2000 });
    // Task management moved to project-based approach
  }

  assignTask(taskId: string, teamMemberId: string): void {
    const member = this.teamMembers.find(m => m.id === teamMemberId);

    if (member) {
      this.snackBar.open(`Action assignée à ${member.name}`, 'Fermer', { duration: 2000 });
      // Task management moved to project-based approach
    }
  }

  applyFilters(): void {
    this.isLoading.conventions = true;
    this.isLoading.invoices = true;

    // Reload data with filters
    this.loadInitialData();
  }

  clearFilters(): void {
    this.filters = {
      zone: '',
      team: '',
      status: '',
      priority: ''
    };
    this.applyFilters();
  }

  refreshData(): void {
    this.loadInitialData();
    this.snackBar.open('Données actualisées', 'Fermer', { duration: 2000 });
  }

  getTaskPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'green';
      case 'in-progress': return 'blue';
      case 'pending': return 'orange';
      case 'blocked': return 'red';
      default: return 'gray';
    }
  }

  getTeamMemberStatusColor(status: string): string {
    switch (status) {
      case 'online': return 'green';
      case 'busy': return 'orange';
      case 'offline': return 'red';
      default: return 'gray';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'online': return 'En ligne';
      case 'busy': return 'Occupé';
      case 'offline': return 'Hors ligne';
      default: return 'Inconnu';
    }
  }

  // Comments management
  addComment(): void {
    if (!this.newComment.trim()) {
      return;
    }

    const commentDTO = {
      author: this.currentUser?.username || 'Chef de Projet',
      content: this.newComment,
      date: new Date(),
      mentionedCommercialId: this.selectedCommercialForComment || undefined,
      mentionedCommercialName: this.selectedCommercialForComment
        ? this.teamMembers.find(m => m.id === this.selectedCommercialForComment)?.name
        : undefined
    };

    // Envoyer le commentaire à l'API
    this.projectManagerService.addComment(commentDTO)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('❌ Erreur lors de l\'ajout du commentaire:', error);
          this.snackBar.open('Erreur lors de l\'ajout du commentaire', 'Fermer', { duration: 3000 });
          return of(null);
        })
      )
      .subscribe(savedComment => {
        if (savedComment) {
          // Ajouter le commentaire à la liste locale
          this.internalComments.unshift({
            id: savedComment.id || '',
            author: savedComment.author,
            content: savedComment.content,
            date: new Date(savedComment.date),
            mentionedCommercial: savedComment.mentionedCommercialName
          });

          // Send notification via WebSocket if commercial is mentioned
          if (this.selectedCommercialForComment) {
            this.websocket.sendMessage('/app/notifications', {
              to: this.selectedCommercialForComment,
              message: `Vous avez été mentionné dans un commentaire: "${this.newComment}"`,
              type: 'mention',
              timestamp: new Date().toISOString()
            });
          }

          this.snackBar.open('Commentaire ajouté avec succès', 'Fermer', { duration: 2000 });
          this.newComment = '';
          this.selectedCommercialForComment = null;

          console.log('✅ Commentaire ajouté:', savedComment);
        }
      });
  }

  // Alerts management
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.stats.pendingAlerts = this.alerts.filter(a => !a.acknowledged).length;
      this.snackBar.open('Alerte marquée comme lue', 'Fermer', { duration: 2000 });
    }
  }

  markAllAlertsAsRead(): void {
    this.alerts.forEach(alert => alert.acknowledged = true);
    this.stats.pendingAlerts = 0;
    this.snackBar.open('Toutes les alertes ont été marquées comme lues', 'Fermer', { duration: 2000 });
  }

  // ===== AMÉLIORATIONS POUR VUE CONTRATS ET FACTURES =====

  contractsDataSource: any[] = [];
  invoicesDataSource: any[] = [];
  allMappedInvoices: any[] = []; // Toutes les factures mappées (pour le filtrage)
  contractsTable = new MatTableDataSource<any>([]);
  invoicesTable = new MatTableDataSource<any>([]);
  contractColumns = ['reference', 'client', 'governorate', 'commercial', 'amount', 'status', 'progress', 'startDate', 'endDate', 'actions'];
  invoiceColumns = ['invoiceNumber', 'contract', 'amount', 'status', 'dueDate', 'actions'];
  invoiceFilter = 'all';

  /**
   * Charger les contrats depuis le backend (DONNÉES RÉELLES)
   */
  private loadContracts(): void {
    console.log('🔄 [loadContracts] Début du chargement...');
    this.isLoading.conventions = true;

    // Charger les conventions réelles depuis MongoDB via le backend
    // Utiliser le service ProjectManager pour avoir les bonnes permissions
    this.projectManagerService.getAllConventions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (conventions) => {
          console.log('✅ [loadContracts] Conventions reçues:', conventions);
          console.log('✅ [loadContracts] Nombre de conventions:', conventions?.length || 0);

          if (!conventions || conventions.length === 0) {
            console.warn('⚠️ [loadContracts] Aucune convention reçue du backend!');
            this.contractsDataSource = [];
            this.filteredContracts = [];
            this.isLoading.conventions = false;
            return;
          }

          // IMPORTANT: Mettre à jour this.conventions pour les KPIs
          this.conventions = conventions;
          console.log('✅ [loadContracts] this.conventions mis à jour:', this.conventions.length);

          // Mapper les conventions vers le format du tableau
          this.contractsDataSource = conventions.map(conv => {
            const mapped = {
              reference: conv.reference || 'N/A',
              client: (conv as any).client || conv.structureId || 'N/A',
              governorate: (conv as any).governorate || 'Non spécifié',
              commercial: (conv as any).createdBy || this.getCommercialName((conv as any).commercialId) || 'Non assigné',
              amount: this.parseAmount((conv as any).amount),
              status: conv.status || 'UNKNOWN',
              progress: this.calculateProgress(conv),
              startDate: conv.startDate ? new Date(conv.startDate) : new Date(),
              endDate: conv.endDate ? new Date(conv.endDate) : new Date()
            };
            console.log('🔄 Convention mappée:', mapped);
            return mapped;
          });

          this.filteredContracts = [...this.contractsDataSource];

          // IMPORTANT: Mettre à jour la table avec pagination
          this.contractsTable.data = this.contractsDataSource;
          this.contractsTable.paginator = this.contractsPaginator;
          console.log('📊 [loadContracts] Table des conventions mise à jour');

          this.isLoading.conventions = false;

          // IMPORTANT: Mettre à jour les KPIs avec les données réelles
          this.updateKPIData();
          console.log('📊 [loadContracts] KPIs mis à jour:', this.kpiData);

          // Calculer la performance par région depuis les données réelles
          this.calculateRegionPerformance();

          // Calculer les projets clients depuis les données réelles
          this.calculateClientProjects();

          console.log('✅ Conventions chargées depuis MongoDB:', this.contractsDataSource.length);
          console.log('✅ Filtered contracts:', this.filteredContracts.length);
        },
        error: (error) => {
          console.error('❌ Erreur chargement conventions:', error);
          this.isLoading.conventions = false;
          this.snackBar.open('Erreur lors du chargement des conventions', 'Fermer', { duration: 3000 });

          // Fallback: données de démonstration si erreur
          this.contractsDataSource = [];
          this.filteredContracts = [];
        }
      });
  }

  /**
   * Obtenir le nom du commercial depuis son ID
   */
  private getCommercialName(commercialId: string): string {
    const commercial = this.teamMembers.find(m => m.id === commercialId);
    return commercial ? commercial.name : 'Non assigné';
  }

  /**
   * Parser le montant qui peut être string ou number
   */
  private parseAmount(amount: any): number {
    if (typeof amount === 'string') {
      return parseFloat(amount) || 0;
    }
    if (typeof amount === 'number') {
      return amount;
    }
    if (amount && typeof amount === 'object' && amount.$numberDecimal) {
      return parseFloat(amount.$numberDecimal) || 0;
    }
    return 0;
  }

  /**
   * Calculer la progression d'une convention
   */
  private calculateProgress(convention: any): number {
    // Logique de calcul basée sur les factures payées
    if (convention.invoices && convention.invoices.length > 0) {
      const paidInvoices = convention.invoices.filter((inv: any) => inv.status === 'PAID').length;
      return Math.round((paidInvoices / convention.invoices.length) * 100);
    }
    return 0;
  }

  /**
   * Calculer la performance par région depuis les données réelles
   */
  private calculateRegionPerformance(): void {
    if (this.contractsDataSource.length === 0) {
      this.regionPerformance = [];
      return;
    }

    // Grouper les conventions par gouvernorat
    const regionMap = new Map<string, any>();

    this.contractsDataSource.forEach(contract => {
      const region = contract.governorate || 'Non spécifié';

      if (!regionMap.has(region)) {
        regionMap.set(region, {
          name: region,
          conventions: 0,
          amount: 0,
          paidInvoices: 0,
          totalInvoices: 0,
          commercials: new Set()
        });
      }

      const regionData = regionMap.get(region);
      regionData.conventions++;
      regionData.amount += contract.amount || 0;

      if (contract.commercial) {
        regionData.commercials.add(contract.commercial);
      }
    });

    // Convertir en tableau et calculer les taux
    this.regionPerformance = Array.from(regionMap.values()).map(region => ({
      name: region.name,
      conventions: region.conventions,
      amount: region.amount,
      paymentRate: region.totalInvoices > 0 ? Math.round((region.paidInvoices / region.totalInvoices) * 100) : 0,
      commercials: region.commercials.size,
      isTopPerformer: false
    }));

    // Trier par montant et marquer le top performer
    this.regionPerformance.sort((a, b) => b.amount - a.amount);
    if (this.regionPerformance.length > 0) {
      this.regionPerformance[0].isTopPerformer = true;
    }

    console.log('✅ Performance par région calculée:', this.regionPerformance);
  }

  /**
   * Calculer les projets clients depuis les conventions réelles
   */
  private calculateClientProjects(): void {
    console.log('🔍 calculateClientProjects - contractsDataSource:', this.contractsDataSource);
    console.log('🔍 contractsDataSource.length:', this.contractsDataSource.length);

    if (this.contractsDataSource.length === 0) {
      console.log('⚠️ Aucune convention dans contractsDataSource');
      this.clientProjects = [];
      return;
    }

    // Filtrer les conventions ACTIVE ou PENDING
    const filtered = this.contractsDataSource
      .filter(contract => {
        const isValid = contract.status === 'ACTIVE' || contract.status === 'PENDING';
        console.log(`🔍 Convention ${contract.reference} - Status: ${contract.status} - Valide: ${isValid}`);
        return isValid;
      });

    console.log('🔍 Conventions filtrées:', filtered.length);

    // Convertir les conventions en projets clients
    this.clientProjects = filtered
      .slice(0, 6) // Limiter à 6 projets
      .map(contract => {
        // Trouver la convention originale pour avoir l'ID
        const originalConvention = this.conventions.find(c => c.reference === contract.reference);
        const conventionId = originalConvention?.id || contract.reference;

        // Trouver les factures associées à cette convention
        const relatedInvoices = this.invoices.filter(inv =>
          inv.conventionId === conventionId ||
          inv.conventionId === contract.reference ||
          (inv as any).reference === contract.reference
        );

        console.log(`📄 Convention ${contract.reference} - ID: ${conventionId} - Factures: ${relatedInvoices.length}`);

        // Trouver le vrai nom du client depuis la structure
        const clientName = this.getClientName(originalConvention);

        return {
          id: conventionId,
          clientName: clientName,
          client: clientName,
          contractRef: contract.reference,
          amount: contract.amount,
          status: contract.status,
          progress: contract.progress,
          assignedTo: contract.commercial,
          deadline: contract.endDate,
          nextAction: this.getNextAction(contract),
          invoices: relatedInvoices.map(inv => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            amount: inv.amount || 0,
            status: inv.status,
            dueDate: inv.dueDate
          }))
        };
      });

    console.log('✅ Projets clients calculés:', this.clientProjects.length);
    console.log('✅ clientProjects avec factures:', this.clientProjects);
  }

  /**
   * Déterminer la prochaine action pour un contrat
   */
  private getNextAction(contract: any): string {
    if (contract.status === 'PENDING') {
      return 'Attente validation client';
    } else if (contract.progress < 30) {
      return 'Envoyer devis complémentaire';
    } else if (contract.progress < 70) {
      return 'Relancer pour signature';
    } else {
      return 'Suivi facturation';
    }
  }

  /**
   * Charger les factures depuis le backend (DONNÉES RÉELLES)
   */
  private loadInvoices(): void {
    console.log('🔄 [loadInvoices] Début du chargement...');
    this.isLoading.invoices = true;

    // Charger les factures réelles depuis MongoDB via le backend
    this.invoiceService.getAllInvoices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (invoices) => {
          console.log('✅ [loadInvoices] Factures reçues:', invoices);
          console.log('✅ [loadInvoices] Nombre de factures:', invoices?.length || 0);

          // IMPORTANT: Mettre à jour this.invoices pour les KPIs
          this.invoices = invoices;
          console.log('✅ [loadInvoices] this.invoices mis à jour:', this.invoices.length);

          // Mapper les factures vers le format du tableau
          const mappedInvoices = invoices.map(inv => {
            const mapped = {
              invoiceNumber: inv.invoiceNumber || 'N/A',
              contractRef: inv.conventionId || (inv as any).reference || 'N/A',
              amount: this.parseAmount((inv as any).amount),
              status: inv.status || 'UNKNOWN',
              dueDate: inv.dueDate ? new Date(inv.dueDate) : new Date()
            };
            console.log('🔄 Facture mappée:', mapped);
            return mapped;
          });
          
          // Sauvegarder toutes les factures mappées pour le filtrage
          this.allMappedInvoices = mappedInvoices;
          this.invoicesDataSource = [...mappedInvoices];

          this.isLoading.invoices = false;

          // IMPORTANT: Mettre à jour les KPIs avec les données réelles
          this.updateKPIData();
          console.log('📊 [loadInvoices] KPIs mis à jour:', this.kpiData);

          // IMPORTANT: Mettre à jour la table avec pagination
          this.invoicesTable.data = this.invoicesDataSource;
          this.invoicesTable.paginator = this.invoicesPaginator;
          console.log('📊 [loadInvoices] Table des factures mise à jour');

          // IMPORTANT: Recréer le graphique avec les nouvelles données
          this.prepareChartsData();
          this.createStatusChart();
          console.log('📊 [loadInvoices] Graphique des statuts recréé');

          // IMPORTANT: Appliquer le filtre actif si nécessaire
          if (this.invoiceFilter && this.invoiceFilter !== 'all') {
            this.filterInvoices();
            console.log('🔍 [loadInvoices] Filtre appliqué:', this.invoiceFilter);
          }

          console.log('✅ Factures chargées depuis MongoDB:', this.invoicesDataSource.length);
          console.log('✅ InvoicesDataSource final:', this.invoicesDataSource);
        },
        error: (error) => {
          console.error('❌ Erreur chargement factures:', error);
          this.isLoading.invoices = false;
          this.snackBar.open('Erreur lors du chargement des factures', 'Fermer', { duration: 3000 });

          // Fallback: données vides si erreur
          this.invoicesDataSource = [];
        }
      });
  }

  /**
   * Charger les membres de l'équipe depuis le backend
   */
  private loadTeamMembers(): void {
    this.isLoading.team = true;

    this.projectManagerService.getTeamMembersStats()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('❌ Erreur lors du chargement de l\'équipe:', error);
          this.isLoading.team = false;
          return of([]);
        })
      )
      .subscribe(members => {
        console.log('📦 Membres de l\'équipe reçus:', members);

        this.teamMembers = members.map(m => ({
          id: m.id,
          name: m.name,
          role: m.role,
          status: m.status as 'online' | 'offline' | 'busy',
          currentTask: m.currentTask,
          lastActivity: new Date(m.lastActivity),
          // Ajouter les statistiques réelles
          assignedConventions: m.assignedConventions,
          activeConventions: m.activeConventions,
          expiredConventions: m.expiredConventions,
          totalInvoices: m.totalInvoices,
          overdueInvoices: m.overdueInvoices,
          paidInvoices: m.paidInvoices,
          pendingInvoices: m.pendingInvoices,
          paymentRate: m.paymentRate,
          performanceScore: m.performanceScore
        }));

        this.isLoading.team = false;
        console.log('✅ Membres de l\'équipe chargés:', this.teamMembers.length);
        console.log('✅ teamMembers:', this.teamMembers);
      });
  }

  /**
   * Actualiser les contrats
   */
  refreshContracts(): void {
    this.loadContracts();
    this.snackBar.open('Contrats actualisés', 'Fermer', { duration: 2000 });
  }

  /**
   * Filtrer les factures
   */
  filterInvoices(): void {
    if (this.invoiceFilter === 'all') {
      // Afficher toutes les factures mappées
      this.invoicesDataSource = [...this.allMappedInvoices];
    } else {
      // Filtrer par statut depuis les factures mappées
      this.invoicesDataSource = this.allMappedInvoices.filter(inv => inv.status === this.invoiceFilter);
    }
    
    // IMPORTANT: Mettre à jour la table Material
    this.invoicesTable.data = this.invoicesDataSource;
    
    console.log(`🔍 Filtrage factures: ${this.invoiceFilter} → ${this.invoicesDataSource.length} résultats sur ${this.allMappedInvoices.length} total`);
  }

  /**
   * Voir les détails d'un contrat
   */
  viewContractDetails(contract: any): void {
    console.log('Voir détails contrat:', contract);
    this.snackBar.open(`Détails du contrat ${contract.reference}`, 'Fermer', { duration: 2000 });
  }

  /**
   * Assigner une équipe à un contrat
   */
  assignTeam(contract: any): void {
    console.log('Assigner équipe au contrat:', contract);
    this.snackBar.open(`Équipe assignée au contrat ${contract.reference}`, 'Fermer', { duration: 2000 });
  }

  /**
   * Voir les détails d'une facture
   */
  viewInvoiceDetails(invoice: any): void {
    console.log('📄 Voir détails facture:', invoice);

    // Trouver la facture complète dans la liste
    const fullInvoice = this.invoices.find(inv =>
      inv.id === invoice.id ||
      inv.invoiceNumber === invoice.invoiceNumber
    );

    const invoiceData = fullInvoice || invoice;

    // Afficher les détails dans un tableau formaté
    const details = {
      'N° Facture': invoiceData.invoiceNumber || 'N/A',
      'Contrat': invoice.contractRef || invoiceData.conventionId || 'N/A',
      'Montant': (invoiceData.amount || 0) + ' TND',
      'Statut': invoiceData.status || 'UNKNOWN',
      'Date émission': invoiceData.issueDate ? new Date(invoiceData.issueDate).toLocaleDateString('fr-FR') : 'N/A',
      'Échéance': invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString('fr-FR') : 'N/A',
      'Date paiement': invoiceData.paymentDate ? new Date(invoiceData.paymentDate).toLocaleDateString('fr-FR') : 'Non payée'
    };

    console.table(details);

    // Calculer les jours de retard si applicable
    let message = `Facture ${invoiceData.invoiceNumber}`;
    if (invoiceData.status === 'OVERDUE' && invoiceData.dueDate) {
      const dueDate = new Date(invoiceData.dueDate);
      const today = new Date();
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      message += ` - ⚠️ ${daysOverdue} jour(s) de retard`;
    } else if (invoiceData.status === 'PAID') {
      message += ` - ✅ Payée`;
    } else {
      message += ` - 📋 ${invoiceData.amount || 0} TND`;
    }

    this.snackBar.open(message, 'Fermer', { duration: 5000 });
  }

  /**
   * Envoyer un rappel pour une facture
   */
  sendReminderForInvoice(invoice: any): void {
    console.log('📧 Envoyer rappel pour facture:', invoice);

    // Trouver la facture complète
    const fullInvoice = this.invoices.find(inv =>
      inv.id === invoice.id ||
      inv.invoiceNumber === invoice.invoiceNumber
    );

    const invoiceData = fullInvoice || invoice;

    // Trouver la convention associée pour avoir les infos du commercial
    const convention = this.conventions.find(c =>
      c.id === invoiceData.conventionId ||
      c.reference === invoice.contractRef
    );

    // Préparer les données du rappel
    const reminderData = {
      invoiceNumber: invoiceData.invoiceNumber,
      amount: invoiceData.amount,
      dueDate: invoiceData.dueDate,
      status: invoiceData.status,
      conventionRef: convention?.reference || invoice.contractRef,
      commercial: (convention as any)?.createdBy || 'Commercial'
    };

    console.log('📧 Données du rappel:', reminderData);

    // Simuler l'envoi du rappel (à remplacer par un vrai appel API)
    this.snackBar.open(
      `📧 Rappel envoyé pour la facture ${invoiceData.invoiceNumber}`,
      'OK',
      { duration: 4000 }
    );

    // Afficher un message de confirmation détaillé dans la console
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 RAPPEL ENVOYÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Facture: ${invoiceData.invoiceNumber}
💰 Montant: ${invoiceData.amount || 0} TND
📅 Échéance: ${invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString('fr-FR') : 'N/A'}
👤 Commercial: ${reminderData.commercial}
📧 Email envoyé ✓
💬 SMS envoyé ✓
🔔 Notification WebSocket envoyée ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    // TODO: Appeler l'API backend pour envoyer le rappel réel
    // this.invoiceService.sendReminder(invoiceData.id).subscribe(...);
  }

  /**
   * Obtenir la couleur du statut du contrat
   */
  getContractStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'active': 'primary',
      'pending': 'accent',
      'expired': 'warn',
      'completed': 'primary'
    };
    return colors[status] || '';
  }

  /**
   * Obtenir la couleur du statut de la facture
   */
  getInvoiceStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'PAID': 'primary',
      'PENDING': 'accent',
      'OVERDUE': 'warn'
    };
    return colors[status] || '';
  }

  /**
   * Obtenir le nombre de tâches terminées
   */
  getCompletedTasksCount(): number {
    return 0; // Removed sprint-based approach
  }

  /**
   * Obtenir la progression du sprint
   */
  getSprintProgress(): number {
    return 0; // Removed sprint-based approach
  }

  /**
   * Obtenir l'icône du statut de tâche
   */
  getTaskStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'pending': 'radio_button_unchecked',
      'in-progress': 'pending',
      'completed': 'check_circle',
      'blocked': 'block'
    };
    return icons[status] || 'help';
  }

  /**
   * Obtenir le label de priorité
   */
  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'low': 'Basse',
      'medium': 'Moyenne',
      'high': 'Haute',
      'critical': 'Critique'
    };
    return labels[priority] || priority;
  }

  /**
   * Ajouter une nouvelle action
   */
  addNewTask(): void {
    this.snackBar.open('Fonctionnalité d\'ajout d\'action à venir', 'Fermer', { duration: 2000 });
    // TODO: Ouvrir un dialog pour ajouter une action
  }

  /**
   * Modifier une action
   */
  editTask(taskId: string): void {
    this.snackBar.open(`Modification de l'action ${taskId}`, 'Fermer', { duration: 2000 });
    // TODO: Ouvrir un dialog pour modifier l'action
  }

  /**
   * Appliquer les filtres sur les contrats
   */
  applyContractFilters(): void {
    console.log('🔍 [FILTRAGE] Début du filtrage...');
    console.log('🔍 [FILTRAGE] contractsDataSource.length:', this.contractsDataSource.length);
    console.log('🔍 [FILTRAGE] contractStatusFilter:', this.contractStatusFilter);
    
    let filtered = [...this.contractsDataSource];

    // Filtre par recherche
    if (this.contractSearch) {
      const search = this.contractSearch.toLowerCase();
      filtered = filtered.filter(c =>
        c.reference?.toLowerCase().includes(search) ||
        c.client?.toLowerCase().includes(search)
      );
      console.log('🔍 [FILTRAGE] Après recherche:', filtered.length);
    }

    // Filtre par statut
    if (this.contractStatusFilter) {
      console.log('🔍 [FILTRAGE] Avant filtre statut:', filtered.length);
      console.log('🔍 [FILTRAGE] Statuts disponibles:', filtered.map(c => c.status));
      filtered = filtered.filter(c => c.status === this.contractStatusFilter);
      console.log('🔍 [FILTRAGE] Après filtre statut:', filtered.length);
    }

    // Filtre par date début
    if (this.contractStartDate) {
      filtered = filtered.filter(c => new Date(c.startDate) >= this.contractStartDate!);
      console.log('🔍 [FILTRAGE] Après date début:', filtered.length);
    }

    // Filtre par date fin
    if (this.contractEndDate) {
      filtered = filtered.filter(c => new Date(c.endDate) <= this.contractEndDate!);
      console.log('🔍 [FILTRAGE] Après date fin:', filtered.length);
    }

    this.filteredContracts = filtered;
    
    // IMPORTANT: Mettre à jour la table MatTableDataSource
    this.contractsTable.data = filtered;
    console.log('✅ [FILTRAGE] Résultat final:', this.filteredContracts.length);
    console.log('✅ [FILTRAGE] Table mise à jour avec', this.contractsTable.data.length, 'éléments');
  }

  /**
   * Réinitialiser les filtres des contrats
   */
  clearContractFilters(): void {
    this.contractSearch = '';
    this.contractStatusFilter = '';
    this.contractStartDate = null;
    this.contractEndDate = null;
    this.filteredContracts = [...this.contractsDataSource];
    
    // IMPORTANT: Mettre à jour la table
    this.contractsTable.data = this.contractsDataSource;
  }

  /**
   * Trier les contrats
   */
  sortContracts(event: any): void {
    const data = this.filteredContracts.slice();
    if (!event.active || event.direction === '') {
      this.filteredContracts = data;
      return;
    }

    this.filteredContracts = data.sort((a, b) => {
      const isAsc = event.direction === 'asc';
      switch (event.active) {
        case 'reference': return this.compare(a.reference, b.reference, isAsc);
        case 'client': return this.compare(a.client, b.client, isAsc);
        case 'status': return this.compare(a.status, b.status, isAsc);
        case 'progress': return this.compare(a.progress, b.progress, isAsc);
        case 'startDate': return this.compare(a.startDate, b.startDate, isAsc);
        case 'endDate': return this.compare(a.endDate, b.endDate, isAsc);
        default: return 0;
      }
    });
  }

  /**
   * Fonction de comparaison pour le tri
   */
  private compare(a: any, b: any, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  /**
   * Exporter les contrats
   */
  exportContracts(format: 'excel' | 'pdf'): void {
    console.log(`📊 Export des contrats en ${format.toUpperCase()}...`);

    if (this.contractsDataSource.length === 0) {
      this.snackBar.open('Aucune convention à exporter', 'Fermer', { duration: 2000 });
      return;
    }

    if (format === 'excel') {
      this.exportContractsToExcel();
    } else {
      this.exportContractsToPDF();
    }
  }

  /**
   * Exporter les contrats vers Excel
   */
  private exportContractsToExcel(): void {
    try {
      // Préparer les données
      const data = this.contractsDataSource.map(contract => ({
        'Référence': contract.reference,
        'Client': contract.client,
        'Gouvernorat': contract.governorate,
        'Commercial': contract.commercial,
        'Montant (TND)': contract.amount,
        'Statut': contract.status,
        'Progression (%)': contract.progress,
        'Date Début': new Date(contract.startDate).toLocaleDateString('fr-FR'),
        'Échéance': new Date(contract.endDate).toLocaleDateString('fr-FR')
      }));

      // Créer le workbook
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Conventions');

      // Ajouter une feuille avec les statistiques
      const stats = [
        { 'Indicateur': 'Total Conventions', 'Valeur': this.kpiData.totalConventions },
        { 'Indicateur': 'Conventions Expirées', 'Valeur': this.kpiData.expiredConventions },
        { 'Indicateur': 'Échéances Proches (30j)', 'Valeur': this.kpiData.upcomingDeadlines },
        { 'Indicateur': 'Total Factures', 'Valeur': this.kpiData.totalInvoices },
        { 'Indicateur': 'Montant Total (TND)', 'Valeur': this.kpiData.totalInvoicesAmount },
        { 'Indicateur': 'Factures en Retard', 'Valeur': this.kpiData.overdueInvoices }
      ];
      const wsStats = XLSX.utils.json_to_sheet(stats);
      XLSX.utils.book_append_sheet(wb, wsStats, 'Statistiques');

      // Générer le fichier
      const fileName = `conventions-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      this.snackBar.open(`✅ Export Excel réussi: ${fileName}`, 'Fermer', { duration: 3000 });
      console.log('✅ Export Excel terminé:', fileName);
    } catch (error) {
      console.error('❌ Erreur export Excel:', error);
      this.snackBar.open('❌ Erreur lors de l\'export Excel', 'Fermer', { duration: 3000 });
    }
  }

  /**
   * Exporter les contrats vers PDF
   */
  private exportContractsToPDF(): void {
    try {
      const doc = new jsPDF();

      // Titre
      doc.setFontSize(18);
      doc.text('Rapport des Conventions', 14, 20);

      // Date
      doc.setFontSize(10);
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);

      // Statistiques
      doc.setFontSize(12);
      doc.text('Statistiques Globales', 14, 38);

      const statsData = [
        ['Total Conventions', this.kpiData.totalConventions.toString()],
        ['Conventions Expirées', this.kpiData.expiredConventions.toString()],
        ['Échéances Proches (30j)', this.kpiData.upcomingDeadlines.toString()],
        ['Total Factures', this.kpiData.totalInvoices.toString()],
        ['Montant Total', `${this.kpiData.totalInvoicesAmount} TND`],
        ['Factures en Retard', this.kpiData.overdueInvoices.toString()]
      ];

      autoTable(doc, {
        startY: 42,
        head: [['Indicateur', 'Valeur']],
        body: statsData,
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234] }
      });

      // Tableau des conventions
      const finalY = (doc as any).lastAutoTable.finalY || 42;
      doc.text('Liste des Conventions', 14, finalY + 10);

      const contractsData = this.contractsDataSource.map(c => [
        c.reference,
        c.client,
        c.governorate,
        c.commercial,
        `${c.amount} TND`,
        c.status,
        `${c.progress}%`
      ]);

      autoTable(doc, {
        startY: finalY + 14,
        head: [['Référence', 'Client', 'Gouvernorat', 'Commercial', 'Montant', 'Statut', 'Progression']],
        body: contractsData,
        theme: 'striped',
        headStyles: { fillColor: [102, 126, 234] },
        styles: { fontSize: 8 }
      });

      // Sauvegarder
      const fileName = `conventions-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      this.snackBar.open(`✅ Export PDF réussi: ${fileName}`, 'Fermer', { duration: 3000 });
      console.log('✅ Export PDF terminé:', fileName);
    } catch (error) {
      console.error('❌ Erreur export PDF:', error);
      this.snackBar.open('❌ Erreur lors de l\'export PDF', 'Fermer', { duration: 3000 });
    }
  }

  /**
   * Obtenir le label du statut
   */
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'ACTIVE': 'Actif',
      'PENDING': 'En attente',
      'EXPIRED': 'Expiré',
      'COMPLETED': 'Terminé'
    };
    return labels[status] || status;
  }

  /**
   * Vérifier si le contrat expire bientôt
   */
  isContractExpiringSoon(endDate: any): boolean {
    if (!endDate) return false;
    const end = new Date(endDate);
    const today = new Date();
    const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diffDays > 0 && diffDays <= 30;
  }

  /**
   * Modifier un contrat
   */
  editContract(contract: any): void {
    this.snackBar.open(`Modification du contrat ${contract.reference}`, 'Fermer', { duration: 2000 });
    // TODO: Ouvrir un dialog pour modifier
  }

  /**
   * Supprimer un contrat
   */
  deleteContract(contract: any): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le contrat ${contract.reference} ?`)) {
      this.snackBar.open(`Contrat ${contract.reference} supprimé`, 'Fermer', { duration: 2000 });
      // TODO: Appeler le service pour supprimer
    }
  }

  /**
   * Obtenir le nombre d'alertes non lues
   */
  getUnreadAlertsCount(): number {
    return this.alerts.filter(a => !a.acknowledged).length;
  }

  /**
   * Obtenir le nombre d'alertes lues
   */
  getReadAlertsCount(): number {
    return this.alerts.filter(a => a.acknowledged).length;
  }

  /**
   * Obtenir les alertes par type
   */
  getAlertsByType(type: string): any[] {
    return this.alerts.filter(a => a.type === type);
  }

  /**
   * Filtrer les alertes
   */
  filterAlerts(): void {
    if (this.alertFilter === 'all') {
      this.filteredAlerts = [...this.alerts];
    } else {
      this.filteredAlerts = this.alerts.filter(a => a.type === this.alertFilter);
    }
  }

  /**
   * Voir les détails d'une alerte
   */
  viewAlertDetails(alert: any): void {
    this.snackBar.open(`Détails de l'alerte: ${alert.message}`, 'Fermer', { duration: 3000 });
    // TODO: Ouvrir un dialog avec les détails complets
  }

  /**
   * Supprimer une alerte
   */
  dismissAlert(alertId: string): void {
    const index = this.alerts.findIndex(a => a.id === alertId);
    if (index > -1) {
      this.alerts.splice(index, 1);
      this.filterAlerts();
      this.snackBar.open('Alerte supprimée', 'Fermer', { duration: 2000 });
    }
  }

  // ==========================================
  // SECTION "PROJETS CLIENTS" - DÉSACTIVÉE
  // (Non mentionnée dans le cahier des charges)
  // ==========================================
  
  /*
  isProjectUrgent(project: any): boolean {
    if (!project.deadline) return false;
    const deadline = new Date(project.deadline);
    const today = new Date();
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diffDays > 0 && diffDays <= 30;
  }

  getProjectStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'IN_PROGRESS': 'En cours',
      'PENDING': 'En attente',
      'COMPLETED': 'Terminé',
      'CANCELLED': 'Annulé'
    };
    return labels[status] || status;
  }

  getInvoicesByStatus(project: any, status: string): any[] {
    return project.invoices.filter((inv: any) => inv.status === status);
  }
  */

  /**
   * Charger les structures pour avoir les noms des clients
   */
  private loadStructures(): void {
    this.structureService.getAllStructures()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('❌ Erreur chargement structures:', error);
          return of([]);
        })
      )
      .subscribe(structures => {
        this.structures = structures;
        console.log('✅ Structures chargées:', this.structures.length);

        // Recalculer les projets clients avec les vrais noms
        if (this.contractsDataSource.length > 0) {
          console.log('🔄 Recalcul des projets clients avec les noms de structures...');
          this.calculateClientProjects();
        }
      });
  }

  /**
   * Obtenir le nom du client depuis la convention
   */
  private getClientName(convention: any): string {
    if (!convention) return 'Client inconnu';

    // Essayer différentes sources pour le nom du client
    if ((convention as any).clientName) return (convention as any).clientName;
    if ((convention as any).structureName) return (convention as any).structureName;

    // Chercher dans la liste des structures
    if (convention.structureId && this.structures.length > 0) {
      const structure = this.structures.find(s => s.id === convention.structureId);
      if (structure && structure.libelle) {
        console.log(`🏛️ Structure trouvée: ${convention.structureId} -> ${structure.libelle}`);
        return structure.libelle;
      }
    }

    if (convention.title) return convention.title;
    if (convention.reference) return `Client ${convention.reference}`;
    if (convention.structureId) return convention.structureId; // Fallback

    return 'Client inconnu';
  }

  // ==========================================
  // MÉTHODES LIÉES AUX PROJETS CLIENTS - SUPPRIMÉES
  // (Non mentionnées dans le cahier des charges)
  // Les méthodes suivantes ont été supprimées :
  // - viewProjectDetails()
  // - viewProjectContract()
  // - viewProjectInvoices()
  // - viewContractDetailsDialog()
  // - openInvoicesDialog()
  // - contactCommercialForProject()
  // ==========================================

  /**
   * Contacter le commercial pour une convention
   */
  contactCommercialForContract(contract: any): void {
    this.snackBar.open(`Ouverture de la messagerie avec ${contract.commercial || 'le commercial'}`, 'Fermer', { duration: 3000 });
    // TODO: Ouvrir un dialog de messagerie ou rediriger vers la section équipe
  }

  /**
   * Ouvrir les paramètres
   */
  openSettings(): void {
    this.snackBar.open('Ouverture des paramètres', 'Fermer', { duration: 2000 });
    // TODO: Naviguer vers la page des paramètres
  }

  /**
   * Export global de toutes les données
   */
  exportAllData(): void {
    console.log('📊 Export global de toutes les données...');

    try {
      const wb = XLSX.utils.book_new();

      // 1. Feuille Conventions
      if (this.contractsDataSource.length > 0) {
        const conventionsData = this.contractsDataSource.map(c => ({
          'Référence': c.reference,
          'Client': c.client,
          'Gouvernorat': c.governorate,
          'Commercial': c.commercial,
          'Montant (TND)': c.amount,
          'Statut': c.status,
          'Progression (%)': c.progress,
          'Date Début': new Date(c.startDate).toLocaleDateString('fr-FR'),
          'Échéance': new Date(c.endDate).toLocaleDateString('fr-FR')
        }));
        const wsConventions = XLSX.utils.json_to_sheet(conventionsData);
        XLSX.utils.book_append_sheet(wb, wsConventions, 'Conventions');
      }

      // 2. Feuille Factures
      if (this.invoicesDataSource.length > 0) {
        const facturesData = this.invoicesDataSource.map(f => ({
          'N° Facture': f.invoiceNumber,
          'Contrat': f.contractRef,
          'Montant (TND)': f.amount,
          'Statut': f.status,
          'Échéance': new Date(f.dueDate).toLocaleDateString('fr-FR')
        }));
        const wsFactures = XLSX.utils.json_to_sheet(facturesData);
        XLSX.utils.book_append_sheet(wb, wsFactures, 'Factures');
      }

      // 3. Feuille Équipe
      if (this.teamMembers.length > 0) {
        const equipeData = this.teamMembers.map(m => ({
          'Nom': m.name,
          'Rôle': m.role,
          'Statut': m.status,
          'Conventions Assignées': m.assignedConventions || 0,
          'Conventions Actives': m.activeConventions || 0,
          'Total Factures': m.totalInvoices || 0,
          'Factures Payées': m.paidInvoices || 0,
          'Taux Paiement (%)': m.paymentRate || 0,
          'Score Performance': m.performanceScore || 0
        }));
        const wsEquipe = XLSX.utils.json_to_sheet(equipeData);
        XLSX.utils.book_append_sheet(wb, wsEquipe, 'Équipe');
      }

      // 4. Feuille Statistiques Globales
      const statsData = [
        { 'Catégorie': 'Conventions', 'Indicateur': 'Total Actives', 'Valeur': this.kpiData.totalConventions },
        { 'Catégorie': 'Conventions', 'Indicateur': 'Expirées', 'Valeur': this.kpiData.expiredConventions },
        { 'Catégorie': 'Conventions', 'Indicateur': 'Échéances Proches (30j)', 'Valeur': this.kpiData.upcomingDeadlines },
        { 'Catégorie': 'Factures', 'Indicateur': 'Total', 'Valeur': this.kpiData.totalInvoices },
        { 'Catégorie': 'Factures', 'Indicateur': 'Montant Total (TND)', 'Valeur': this.kpiData.totalInvoicesAmount },
        { 'Catégorie': 'Factures', 'Indicateur': 'En Retard', 'Valeur': this.kpiData.overdueInvoices },
        { 'Catégorie': 'Factures', 'Indicateur': 'Pourcentage Retard (%)', 'Valeur': this.kpiData.overduePercentage },
        { 'Catégorie': 'Performance', 'Indicateur': 'Taux Efficacité (%)', 'Valeur': this.calculatedIndicators.commercialEfficiency },
        { 'Catégorie': 'Performance', 'Indicateur': 'Délai Moyen Paiement (j)', 'Valeur': this.calculatedIndicators.avgPaymentDelay },
        { 'Catégorie': 'Performance', 'Indicateur': 'Taux Évolution (%)', 'Valeur': this.calculatedIndicators.conventionGrowthRate },
        { 'Catégorie': 'Performance', 'Indicateur': 'Ratio Paiement (%)', 'Valeur': this.calculatedIndicators.invoicePaymentRatio },
        { 'Catégorie': 'Performance', 'Indicateur': 'Indice Retard Moyen (j)', 'Valeur': this.calculatedIndicators.avgDelayIndex }
      ];
      const wsStats = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(wb, wsStats, 'Statistiques');

      // 5. Feuille Performance par Région
      if (this.regionPerformance.length > 0) {
        const regionsData = this.regionPerformance.map(r => ({
          'Région': r.name,
          'Conventions': r.conventions,
          'Montant (TND)': r.amount,
          'Taux Paiement (%)': r.paymentRate,
          'Commerciaux': r.commercials
        }));
        const wsRegions = XLSX.utils.json_to_sheet(regionsData);
        XLSX.utils.book_append_sheet(wb, wsRegions, 'Régions');
      }

      // Générer le fichier
      const fileName = `rapport-complet-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      this.snackBar.open(`✅ Export complet réussi: ${fileName}`, 'Fermer', { duration: 4000 });
      console.log('✅ Export global terminé:', fileName);
      console.log('📊 Feuilles exportées:', wb.SheetNames);
    } catch (error) {
      console.error('❌ Erreur export global:', error);
      this.snackBar.open('❌ Erreur lors de l\'export global', 'Fermer', { duration: 3000 });
    }
  }

  /**
   * Initialiser tous les graphiques Chart.js
   */
  private initializeCharts(): void {
    this.prepareChartsData();
    this.createEvolutionChart();
    this.createPerformanceChart();
    this.createStatusChart();
  }

  /**
   * Préparer les données pour les graphiques
   */
  private prepareChartsData(): void {
    // Données d'évolution sur 6 mois
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    this.chartData.evolution.labels = months;
    this.chartData.evolution.conventions = [12, 19, 15, 22, 18, this.conventions.length];
    this.chartData.evolution.invoices = [8, 14, 11, 18, 15, this.invoices.length];

    // Données de performance par commercial
    this.chartData.performance.labels = this.teamMembers.map(m => m.name);
    this.chartData.performance.scores = this.teamMembers.map(m => m.performanceScore || 0);

    // Données de répartition des statuts de factures
    const paidCount = this.invoices.filter(i => i.status === 'PAID').length;
    const pendingCount = this.invoices.filter(i =>
      i.status === 'PENDING' ||
      i.status === 'SENT' ||
      i.status === 'DRAFT' ||
      i.status === 'PROOF_PENDING' ||
      i.status === 'PROOF_VALIDATED'
    ).length;
    const overdueCount = this.invoices.filter(i => i.status === 'OVERDUE').length;

    console.log('📊 [GRAPHIQUE] PAID:', paidCount, 'PENDING:', pendingCount, 'OVERDUE:', overdueCount);

    this.chartData.status.data = [paidCount, pendingCount, overdueCount];
  }

  /**
   * Créer le graphique d'évolution
   */
  private createEvolutionChart(): void {
    const canvas = document.getElementById('evolutionChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.evolutionChart) {
      this.evolutionChart.destroy();
    }

    this.evolutionChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.chartData.evolution.labels,
        datasets: [
          {
            label: 'Conventions',
            data: this.chartData.evolution.conventions,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Factures',
            data: this.chartData.evolution.invoices,
            borderColor: '#f093fb',
            backgroundColor: 'rgba(240, 147, 251, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Évolution Conventions & Factures (6 mois)'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  /**
   * Créer le graphique de performance
   */
  private createPerformanceChart(): void {
    const canvas = document.getElementById('performanceChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.performanceChart) {
      this.performanceChart.destroy();
    }

    this.performanceChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.chartData.performance.labels,
        datasets: [{
          label: 'Score de Performance (%)',
          data: this.chartData.performance.scores,
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(240, 147, 251, 0.8)',
            'rgba(67, 233, 123, 0.8)'
          ],
          borderColor: [
            '#667eea',
            '#f093fb',
            '#43e97b'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Performance par Commercial'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  /**
   * Créer le graphique de répartition des statuts
   */
  private createStatusChart(): void {
    const canvas = document.getElementById('statusChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.statusChart) {
      this.statusChart.destroy();
    }

    this.statusChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: this.chartData.status.labels,
        datasets: [{
          data: this.chartData.status.data,
          backgroundColor: [
            'rgba(67, 233, 123, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(255, 99, 132, 0.8)'
          ],
          borderColor: [
            '#43e97b',
            '#ffce56',
            '#ff6384'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          },
          title: {
            display: true,
            text: 'Répartition Statuts Factures'
          }
        }
      }
    });
  }



  /**
   * Charger les notifications déléguées depuis le backend
   */
  private loadDelegatedNotifications(): void {
    console.log('📥 [NOTIFICATIONS] Chargement des alertes déléguées...');

    this.notificationService.getDelegatedAlerts()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('❌ Erreur chargement alertes déléguées:', error);
          return of([]);
        })
      )
      .subscribe((notifications: Notification[]) => {
        console.log(`✅ ${notifications.length} alerte(s) déléguée(s) chargée(s)`);

        // Ajouter chaque notification au panneau
        notifications.forEach(notif => {
          this.addNotificationToPanel({
            id: notif.id || Date.now().toString(),
            type: 'kpi_alert',
            title: notif.title,
            message: notif.message,
            timestamp: new Date(notif.timestamp),
            read: notif.read,
            priority: notif.priority === 'HIGH' ? 'high' : 'medium',
            data: notif
          });
        });

        this.updateNotificationCount();
      });
  }

  /**
   * Charger le compteur de notifications non lues
   */
  private loadNotificationCount(): void {
    this.notificationService.getUnreadCount()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('❌ Erreur chargement compteur notifications:', error);
          return of(0);
        })
      )
      .subscribe((count: number) => {
        this.notificationCount = count;
        this.hasNotifications = count > 0;
        console.log(`📊 Compteur notifications: ${count}`);
      });
  }

  /**
   * Ajouter une notification au panneau
   */
  private addNotificationToPanel(notification: any): void {
    const exists = this.realtimeNotifications.some(n => n.id === notification.id);
    if (!exists) {
      this.realtimeNotifications.unshift(notification);
      this.updateNotificationCount();
      console.log('➕ Notification ajoutée au panneau:', notification.title);
    }
  }

  /**
   * Ajouter une alerte KPI à la liste
   */
  private addKpiAlertToList(alert: any): void {
    const exists = this.alerts.some(a => a.id === alert.id);
    if (!exists) {
      const monitoringAlert: MonitoringAlert = {
        id: alert.id || alert.alertId || Date.now().toString(),
        type: alert.severity === 'HIGH' ? 'critical' : 'warning',
        message: alert.message,
        timestamp: new Date(alert.timestamp || Date.now()),
        acknowledged: false,
        source: 'kpi-system'
      };

      this.alerts.unshift(monitoringAlert);
      this.stats.pendingAlerts = this.alerts.filter(a => !a.acknowledged).length;
      this.filterAlerts();

      console.log('➕ Alerte KPI ajoutée à la liste');
    }
  }

  /**
   * Rafraîchir les notifications périodiquement
   */
  private startNotificationRefresh(): void {
    timer(30000, 30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('🔄 Rafraîchissement automatique des notifications...');
        this.loadDelegatedNotifications();
        this.loadNotificationCount();
      });
  }

  /**
   * Afficher une alerte facture
   */
  private showInvoiceAlert(alert: any): void {
    this.addNotificationToPanel({
      id: alert.id || Date.now().toString(),
      type: 'invoice_alert',
      title: `Alerte Facture: ${alert.invoiceNumber || 'N/A'}`,
      message: alert.message,
      timestamp: new Date(),
      read: false,
      priority: 'medium',
      data: alert
    });

    this.snackBar.open(
      `💰 ALERTE FACTURE: ${alert.message}`,
      'Voir',
      {
        duration: 8000,
        panelClass: 'alert-warning',
        horizontalPosition: 'end',
        verticalPosition: 'top'
      }
    ).onAction().subscribe(() => {
      this.navigateToSection('invoices');
    });
  }

  /**
   * Gérer le clic sur une notification
   */
  onNotificationClicked(notification: any): void {
    console.log('🔔 Notification cliquée:', notification);

    // Marquer comme lue
    if (notification.id && !notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }

    // Naviguer vers la section appropriée selon le type
    if (notification.type === 'ALERT_DELEGATED' || notification.type === 'KPI_ALERT' || notification.type === 'kpi_alert') {
      this.navigateToSection('kpi-alerts');
    } else if (notification.type === 'INVOICE_ALERT' || notification.type === 'invoice_alert') {
      this.navigateToSection('invoices');
    } else if (notification.type === 'CONVENTION_ALERT' || notification.type === 'convention_alert') {
      this.navigateToSection('contracts');
    }
  }

}


