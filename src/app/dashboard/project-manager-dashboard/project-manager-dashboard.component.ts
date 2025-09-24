import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
import { ConventionService } from '../../services/convention.service';
import { InvoiceService } from '../../services/invoice.service';
import { Convention } from '../../models/convention.model';
import { Invoice } from '../../models/invoice.model';
import { WebsocketService, WebSocketMessage } from '../../services/websocket.service';
import { MonitoringService, SystemStats, MonitoringAlert } from '../../services/monitoring.service';
import { Subject, timer, forkJoin } from 'rxjs';
import { takeUntil, tap, catchError, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  currentTask?: string;
  lastActivity: Date;
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
    ProcessTimelineComponent
  ],
  templateUrl: './project-manager-dashboard.component.html',
  styleUrls: ['./project-manager-dashboard.component.scss']
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
  darkMode = false;
  
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
  systemStats: SystemStats | null = null;
  alerts: MonitoringAlert[] = [];

  teamMembers: TeamMember[] = [
    { id: '1', name: 'Ahmed Ben Ali', role: 'Commercial Senior', status: 'online', currentTask: 'Convention X', lastActivity: new Date() },
    { id: '2', name: 'Fatma Mansouri', role: 'Commercial Junior', status: 'busy', currentTask: 'Facture Y', lastActivity: new Date(Date.now() - 300000) },
    { id: '3', name: 'Mohamed Karray', role: 'Commercial Senior', status: 'offline', lastActivity: new Date(Date.now() - 1800000) }
  ];

  currentSprint: Sprint = {
    id: '1',
    name: 'Sprint 3 - Q2 2024',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-20'),
    status: 'active',
    tasks: [
      { id: '1', title: 'Finaliser conventions Q2', description: 'Compléter toutes les conventions en cours', assignedTo: 'Ahmed Ben Ali', status: 'in-progress', priority: 'high', dueDate: new Date('2024-06-15'), progress: 75 },
      { id: '2', title: 'Audit factures', description: 'Vérifier toutes les factures en attente', assignedTo: 'Fatma Mansouri', status: 'pending', priority: 'medium', dueDate: new Date('2024-06-18'), progress: 0 },
      { id: '3', title: 'Mise à jour nomenclatures', description: 'Actualiser les nomenclatures clients', assignedTo: 'Mohamed Karray', status: 'completed', priority: 'low', dueDate: new Date('2024-06-10'), progress: 100 }
    ],
    velocity: 12,
    burndownData: [
      { date: '2024-06-01', remaining: 15 },
      { date: '2024-06-05', remaining: 12 },
      { date: '2024-06-10', remaining: 8 },
      { date: '2024-06-15', remaining: 5 }
    ]
  };

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

  private destroy$ = new Subject<void>();

  constructor(
    private conventionService: ConventionService,
    private invoiceService: InvoiceService,
    private websocket: WebsocketService,
    private monitoringService: MonitoringService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setupRealTimeUpdates();
    this.setupWebSocketConnection();
    this.loadInitialData();
    this.startPeriodicUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Méthodes du header (même que admin)
  getDefaultAvatar(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0RjhERjkiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTRDOC42ODYyOSAxNCA2IDE2LjY4NjMgNiAyMEgxOEMxOCAxNi42ODYzIDE1LjMxMzcgMTQgMTIgMTRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+';
  }

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
  }

  logout() {
    console.log('Déconnexion du chef de projet');
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
          console.log('WebSocket connected for project manager dashboard');
        } else {
          console.log('WebSocket disconnected for project manager dashboard');
        }
      });
  }

  private loadInitialData(): void {
    this.isLoading.conventions = true;
    this.isLoading.invoices = true;

    forkJoin({
      conventions: this.conventionService.getAllConventions(),
      invoices: this.invoiceService.getAllInvoices()
    }).pipe(
      takeUntil(this.destroy$),
      tap(({ conventions, invoices }) => {
        this.conventions = conventions || [];
        this.invoices = invoices || [];
        this.updateStats();
        this.isLoading.conventions = false;
        this.isLoading.invoices = false;
      }),
      catchError(error => {
        console.error('Error loading initial data:', error);
        this.snackBar.open('Erreur lors du chargement des données', 'Fermer', { duration: 3000 });
        this.isLoading.conventions = false;
        this.isLoading.invoices = false;
        return [];
      })
    ).subscribe();
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
    if (data.sprint) {
      this.currentSprint = data.sprint;
      this.updateSprintProgress();
    }
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
    // Calculate sprint progress based on completed tasks
    const completedTasks = this.currentSprint.tasks.filter(t => t.status === 'completed').length;
    const totalTasks = this.currentSprint.tasks.length;
    this.stats.sprintProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return new Observable(observer => {
      observer.next(this.stats.sprintProgress);
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
      // Implement actual contact logic (chat, email, etc.)
    }
  }

  updateTaskStatus(taskId: string, status: 'pending' | 'in-progress' | 'completed' | 'blocked'): void {
    const task = this.currentSprint.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      if (status === 'completed') {
        task.progress = 100;
      } else if (status === 'in-progress') {
        task.progress = Math.min(task.progress + 25, 90);
      }
      
      // Send update via WebSocket
      this.websocket.sendMessage('/app/tasks/update', {
        taskId,
        status,
        progress: task.progress,
        timestamp: new Date().toISOString()
      });
      
      this.updateSprintProgress();
      this.snackBar.open('Statut de la tâche mis à jour', 'Fermer', { duration: 2000 });
    }
  }

  assignTask(taskId: string, teamMemberId: string): void {
    const task = this.currentSprint.tasks.find(t => t.id === taskId);
    const member = this.teamMembers.find(m => m.id === teamMemberId);
    
    if (task && member) {
      task.assignedTo = member.name;
      
      // Send assignment via WebSocket
      this.websocket.sendMessage('/app/tasks/assign', {
        taskId,
        assignedTo: member.name,
        timestamp: new Date().toISOString()
      });
      
      this.snackBar.open(`Tâche assignée à ${member.name}`, 'Fermer', { duration: 2000 });
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
}
