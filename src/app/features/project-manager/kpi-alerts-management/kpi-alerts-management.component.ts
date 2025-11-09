import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-kpi-alerts-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './kpi-alerts-management.component.html',
  styleUrls: ['./kpi-alerts-management.component.scss']
})
export class KpiAlertsManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['kpiName', 'severity', 'priority', 'status', 'detectedAt', 'actions'];

  // Filtres
  filterStatus: string = 'ALL';
  filterPriority: string = 'ALL';
  filterKpi: string = 'ALL';
  searchText: string = '';

  // Statistiques
  stats = {
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0
  };

  isLoading: boolean = false;
  selectedAlert: any = null;

  private apiUrl = 'http://localhost:8085/api/kpi-alerts';

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAlerts();
    this.loadStats();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Charger les alertes du Chef de Projet
   */
  loadAlerts(): void {
    this.isLoading = true;
    
    this.http.get<any>(`${this.apiUrl}/manage/active`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (response) => {
          console.log('✅ Alertes chargées:', response);
          this.dataSource.data = response.alerts || [];
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Erreur chargement alertes:', error);
          this.snackBar.open('Erreur lors du chargement des alertes', 'Fermer', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  /**
   * Charger les statistiques
   */
  loadStats(): void {
    this.http.get<any>(`${this.apiUrl}/manage/stats`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (response) => {
          this.stats = response.stats || this.stats;
        },
        error: (error) => {
          console.error('❌ Erreur chargement stats:', error);
        }
      });
  }

  /**
   * Appliquer les filtres
   */
  applyFilters(): void {
    let filtered = this.dataSource.data;

    // Filtre par statut
    if (this.filterStatus !== 'ALL') {
      filtered = filtered.filter(alert => alert.alertStatus === this.filterStatus);
    }

    // Filtre par priorité
    if (this.filterPriority !== 'ALL') {
      filtered = filtered.filter(alert => alert.priority === this.filterPriority);
    }

    // Filtre par KPI
    if (this.filterKpi !== 'ALL') {
      filtered = filtered.filter(alert => alert.kpiName === this.filterKpi);
    }

    // Recherche textuelle
    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(alert => 
        alert.kpiName?.toLowerCase().includes(search) ||
        alert.message?.toLowerCase().includes(search) ||
        alert.recommendation?.toLowerCase().includes(search)
      );
    }

    this.dataSource.data = filtered;
  }

  /**
   * Réinitialiser les filtres
   */
  resetFilters(): void {
    this.filterStatus = 'ALL';
    this.filterPriority = 'ALL';
    this.filterKpi = 'ALL';
    this.searchText = '';
    this.loadAlerts();
  }

  /**
   * Prendre en charge une alerte
   */
  acknowledgeAlert(alert: any): void {
    const comment = prompt('Commentaire (optionnel):');
    
    this.http.put<any>(
      `${this.apiUrl}/manage/${alert.id}/acknowledge`,
      { comment: comment || 'Pris en charge' },
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (response) => {
        console.log('✅ Alerte prise en charge:', response);
        this.snackBar.open('✅ Alerte prise en charge avec succès', 'Fermer', { duration: 3000 });
        this.loadAlerts();
        this.loadStats();
      },
      error: (error) => {
        console.error('❌ Erreur:', error);
        this.snackBar.open('❌ Erreur lors de la prise en charge', 'Fermer', { duration: 3000 });
      }
    });
  }

  /**
   * Résoudre une alerte
   */
  resolveAlert(alert: any): void {
    const dialogRef = this.dialog.open(AlertResolutionDialogComponent, {
      width: '600px',
      data: { alert }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.loadAlerts();
        this.loadStats();
      }
    });
  }

  /**
   * Voir les détails d'une alerte
   */
  viewDetails(alert: any): void {
    this.selectedAlert = alert;
    
    const dialogRef = this.dialog.open(AlertDetailsDialogComponent, {
      width: '800px',
      data: { alert }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.selectedAlert = null;
    });
  }

  /**
   * Archiver une alerte
   */
  archiveAlert(alert: any): void {
    if (!confirm('Êtes-vous sûr de vouloir archiver cette alerte ?')) {
      return;
    }

    this.http.put<any>(
      `${this.apiUrl}/manage/${alert.id}/archive`,
      {},
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (response) => {
        console.log('✅ Alerte archivée:', response);
        this.snackBar.open('✅ Alerte archivée avec succès', 'Fermer', { duration: 3000 });
        this.loadAlerts();
        this.loadStats();
      },
      error: (error) => {
        console.error('❌ Erreur:', error);
        this.snackBar.open('❌ Erreur lors de l\'archivage', 'Fermer', { duration: 3000 });
      }
    });
  }

  /**
   * Obtenir la couleur selon la sévérité
   */
  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'HIGH':
      case 'CRITICAL':
        return 'warn';
      case 'MEDIUM':
        return 'accent';
      case 'LOW':
        return 'primary';
      default:
        return '';
    }
  }

  /**
   * Obtenir la couleur selon la priorité
   */
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'URGENT':
      case 'CRITICAL':
        return 'warn';
      case 'HIGH':
        return 'accent';
      case 'MEDIUM':
        return 'primary';
      default:
        return '';
    }
  }

  /**
   * Obtenir la couleur selon le statut
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'DELEGATED':
      case 'NEW':
        return 'warn';
      case 'IN_PROGRESS':
        return 'accent';
      case 'RESOLVED':
        return 'primary';
      default:
        return '';
    }
  }

  /**
   * Formater la date
   */
  formatDate(date: any): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('fr-FR');
  }

  /**
   * Rafraîchir les données
   */
  refresh(): void {
    this.loadAlerts();
    this.loadStats();
  }
}

/**
 * Dialog pour résoudre une alerte
 */
@Component({
  selector: 'app-alert-resolution-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>check_circle</mat-icon>
      Résoudre l'Alerte
    </h2>

    <mat-dialog-content>
      <div class="resolution-form">
        <p><strong>{{ data.alert.kpiName }}</strong></p>
        <p class="alert-message">{{ data.alert.message }}</p>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Actions prises</mat-label>
          <textarea 
            matInput 
            [(ngModel)]="actionsTaken" 
            rows="4"
            placeholder="Décrivez les actions que vous avez prises..."
            required></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Commentaire de résolution</mat-label>
          <textarea 
            matInput 
            [(ngModel)]="resolutionComment" 
            rows="3"
            placeholder="Commentaire final sur la résolution..."></textarea>
        </mat-form-field>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button 
        mat-raised-button 
        color="primary" 
        (click)="onResolve()"
        [disabled]="!actionsTaken || isLoading">
        {{ isLoading ? 'Résolution...' : 'Résoudre' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .resolution-form { padding: 20px 0; }
    .full-width { width: 100%; margin-bottom: 15px; }
    .alert-message { color: #666; margin: 10px 0 20px 0; }
  `]
})
export class AlertResolutionDialogComponent {
  actionsTaken: string = '';
  resolutionComment: string = '';
  isLoading: boolean = false;

  private apiUrl = 'http://localhost:8085/api/kpi-alerts';

  constructor(
    public dialogRef: MatDialogRef<AlertResolutionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  onResolve(): void {
    if (!this.actionsTaken) {
      this.snackBar.open('Veuillez décrire les actions prises', 'Fermer', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    const resolutionData = {
      actionsTaken: this.actionsTaken,
      resolutionComment: this.resolutionComment
    };

    this.http.put<any>(
      `${this.apiUrl}/manage/${this.data.alert.id}/resolve`,
      resolutionData,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (response) => {
        console.log('✅ Alerte résolue:', response);
        this.snackBar.open('✅ Alerte résolue avec succès', 'Fermer', { duration: 3000 });
        this.dialogRef.close({ success: true, response });
      },
      error: (error) => {
        console.error('❌ Erreur:', error);
        this.snackBar.open('❌ Erreur lors de la résolution', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }
}

/**
 * Dialog pour voir les détails d'une alerte
 */
@Component({
  selector: 'app-alert-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>info</mat-icon>
      Détails de l'Alerte
    </h2>

    <mat-dialog-content>
      <div class="alert-details">
        <!-- En-tête -->
        <div class="alert-header">
          <h3>{{ data.alert.kpiName }}</h3>
          <div class="badges">
            <mat-chip [color]="getSeverityColor(data.alert.severity)" selected>
              {{ data.alert.severity }}
            </mat-chip>
            <mat-chip [color]="getPriorityColor(data.alert.priority)" selected>
              {{ data.alert.priority }}
            </mat-chip>
            <mat-chip [color]="getStatusColor(data.alert.alertStatus)" selected>
              {{ data.alert.alertStatus }}
            </mat-chip>
          </div>
        </div>

        <!-- Message -->
        <div class="section">
          <h4><mat-icon>message</mat-icon> Message</h4>
          <p>{{ data.alert.message }}</p>
        </div>

        <!-- Recommandation -->
        <div class="section" *ngIf="data.alert.recommendation">
          <h4><mat-icon>lightbulb</mat-icon> Recommandation</h4>
          <p>{{ data.alert.recommendation }}</p>
        </div>

        <!-- Informations -->
        <div class="section">
          <h4><mat-icon>info</mat-icon> Informations</h4>
          <div class="info-grid">
            <div class="info-item">
              <strong>Valeur actuelle:</strong>
              <span>{{ data.alert.currentValue }}</span>
            </div>
            <div class="info-item">
              <strong>Détecté le:</strong>
              <span>{{ formatDate(data.alert.detectedAt) }}</span>
            </div>
            <div class="info-item" *ngIf="data.alert.sentToProjectManagerAt">
              <strong>Délégué le:</strong>
              <span>{{ formatDate(data.alert.sentToProjectManagerAt) }}</span>
            </div>
            <div class="info-item" *ngIf="data.alert.acknowledgedAt">
              <strong>Pris en charge le:</strong>
              <span>{{ formatDate(data.alert.acknowledgedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Historique -->
        <div class="section" *ngIf="data.alert.actionHistory && data.alert.actionHistory.length > 0">
          <h4><mat-icon>history</mat-icon> Historique</h4>
          <div class="timeline">
            <div class="timeline-item" *ngFor="let action of data.alert.actionHistory">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <strong>{{ action.actionType }}</strong>
                <p>{{ action.comment }}</p>
                <small>{{ action.performedByName }} - {{ formatDate(action.performedAt) }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" (click)="onClose()">
        <mat-icon>close</mat-icon>
        Fermer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .alert-details { padding: 20px 0; }
    .alert-header { margin-bottom: 20px; }
    .alert-header h3 { margin: 0 0 10px 0; color: #1976d2; }
    .badges { display: flex; gap: 10px; flex-wrap: wrap; }
    .section { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
    .section h4 { display: flex; align-items: center; gap: 8px; margin: 0 0 10px 0; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
    .info-item strong { display: block; color: #666; font-size: 12px; }
    .timeline { position: relative; padding-left: 30px; }
    .timeline-item { position: relative; margin-bottom: 20px; }
    .timeline-marker { position: absolute; left: -30px; width: 12px; height: 12px; 
                       background: #1976d2; border-radius: 50%; top: 5px; }
    .timeline-content strong { display: block; color: #1976d2; }
    .timeline-content small { color: #999; }
  `]
})
export class AlertDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AlertDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  getSeverityColor(severity: string): string {
    return severity === 'HIGH' || severity === 'CRITICAL' ? 'warn' : 'accent';
  }

  getPriorityColor(priority: string): string {
    return priority === 'URGENT' || priority === 'CRITICAL' ? 'warn' : 'accent';
  }

  getStatusColor(status: string): string {
    return status === 'RESOLVED' ? 'primary' : 'accent';
  }

  formatDate(date: any): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('fr-FR');
  }

  onClose(): void {
    this.dialogRef.close();
  }
}

// Import nécessaire pour @Inject
import { Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
