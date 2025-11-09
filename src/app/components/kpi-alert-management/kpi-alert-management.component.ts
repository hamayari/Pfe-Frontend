import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { KpiAlertService, KpiAlert, AlertStatistics } from '../../services/kpi-alert.service';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-kpi-alert-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatBadgeModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule
  ],
  templateUrl: './kpi-alert-management.component.html',
  styleUrls: ['./kpi-alert-management.component.scss']
})
export class KpiAlertManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Listes d'alertes
  activeAlerts: KpiAlert[] = [];
  resolvedAlerts: KpiAlert[] = [];
  archivedAlerts: KpiAlert[] = [];

  // Statistiques
  statistics: AlertStatistics = {
    new: 0,
    inProgress: 0,
    resolved: 0,
    archived: 0,
    total: 0,
    active: 0
  };

  // État de chargement
  loading = {
    active: false,
    resolved: false,
    archived: false,
    statistics: false
  };

  // Onglet actif
  selectedTab = 0;

  // Alerte sélectionnée pour les détails
  selectedAlert: KpiAlert | null = null;

  constructor(
    private alertService: KpiAlertService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAllData();
    
    // Rafraîchir automatiquement toutes les 30 secondes
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.refreshCurrentTab();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charger toutes les données
   */
  loadAllData(): void {
    this.loadActiveAlerts();
    this.loadStatistics();
  }

  /**
   * Charger les alertes actives
   */
  loadActiveAlerts(): void {
    this.loading.active = true;
    this.alertService.getActiveAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.activeAlerts = response.alerts || [];
          this.loading.active = false;
          console.log('✅ Alertes actives chargées:', this.activeAlerts.length);
        },
        error: (error) => {
          console.error('❌ Erreur chargement alertes actives:', error);
          this.loading.active = false;
          this.showError('Erreur lors du chargement des alertes actives');
        }
      });
  }

  /**
   * Charger les alertes résolues
   */
  loadResolvedAlerts(): void {
    this.loading.resolved = true;
    this.alertService.getResolvedAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.resolvedAlerts = response.alerts || [];
          this.loading.resolved = false;
          console.log('✅ Alertes résolues chargées:', this.resolvedAlerts.length);
        },
        error: (error) => {
          console.error('❌ Erreur chargement alertes résolues:', error);
          this.loading.resolved = false;
          this.showError('Erreur lors du chargement des alertes résolues');
        }
      });
  }

  /**
   * Charger les alertes archivées
   */
  loadArchivedAlerts(): void {
    this.loading.archived = true;
    this.alertService.getArchivedAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.archivedAlerts = response.alerts || [];
          this.loading.archived = false;
          console.log('✅ Alertes archivées chargées:', this.archivedAlerts.length);
        },
        error: (error) => {
          console.error('❌ Erreur chargement alertes archivées:', error);
          this.loading.archived = false;
          this.showError('Erreur lors du chargement des alertes archivées');
        }
      });
  }

  /**
   * Charger les statistiques
   */
  loadStatistics(): void {
    this.loading.statistics = true;
    this.alertService.getStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.statistics = response.statistics;
          this.loading.statistics = false;
          console.log('✅ Statistiques chargées:', this.statistics);
        },
        error: (error) => {
          console.error('❌ Erreur chargement statistiques:', error);
          this.loading.statistics = false;
        }
      });
  }

  /**
   * Rafraîchir l'onglet actuel
   */
  refreshCurrentTab(): void {
    switch (this.selectedTab) {
      case 0:
        this.loadActiveAlerts();
        break;
      case 1:
        this.loadResolvedAlerts();
        break;
      case 2:
        this.loadArchivedAlerts();
        break;
    }
    this.loadStatistics();
  }

  /**
   * Changement d'onglet
   */
  onTabChange(index: number): void {
    this.selectedTab = index;
    
    // Charger les données si pas encore chargées
    if (index === 1 && this.resolvedAlerts.length === 0) {
      this.loadResolvedAlerts();
    } else if (index === 2 && this.archivedAlerts.length === 0) {
      this.loadArchivedAlerts();
    }
  }

  /**
   * Prendre en charge une alerte
   */
  takeCharge(alert: KpiAlert): void {
    const comment = prompt('Commentaire (optionnel):');
    
    this.alertService.markAsInProgress(alert.id, comment || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Alerte prise en charge avec succès');
          this.loadActiveAlerts();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('❌ Erreur prise en charge:', error);
          this.showError('Erreur lors de la prise en charge');
        }
      });
  }

  /**
   * Résoudre une alerte
   */
  resolveAlert(alert: KpiAlert): void {
    // Ouvrir un dialog pour saisir les détails
    const resolutionComment = prompt('Commentaire de résolution (obligatoire):');
    
    if (!resolutionComment || resolutionComment.trim() === '') {
      this.showError('Le commentaire de résolution est obligatoire');
      return;
    }
    
    const actionsTaken = prompt('Actions prises (optionnel):');
    
    this.alertService.resolveAlert(alert.id, resolutionComment, actionsTaken || '')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('✅ Alerte résolue avec succès');
          this.loadActiveAlerts();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('❌ Erreur résolution:', error);
          this.showError('Erreur lors de la résolution');
        }
      });
  }

  /**
   * Archiver une alerte
   */
  archiveAlert(alert: KpiAlert): void {
    if (!confirm('Êtes-vous sûr de vouloir archiver cette alerte ?')) {
      return;
    }
    
    this.alertService.archiveAlert(alert.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('📦 Alerte archivée avec succès');
          this.loadResolvedAlerts();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('❌ Erreur archivage:', error);
          this.showError('Erreur lors de l\'archivage');
        }
      });
  }

  /**
   * Ajouter un commentaire
   */
  addComment(alert: KpiAlert): void {
    const comment = prompt('Votre commentaire:');
    
    if (!comment || comment.trim() === '') {
      return;
    }
    
    this.alertService.addComment(alert.id, comment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('💬 Commentaire ajouté avec succès');
          this.refreshCurrentTab();
        },
        error: (error) => {
          console.error('❌ Erreur ajout commentaire:', error);
          this.showError('Erreur lors de l\'ajout du commentaire');
        }
      });
  }

  /**
   * Voir l'historique d'une alerte
   */
  viewHistory(alert: KpiAlert): void {
    this.alertService.getAlertHistory(alert.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          alert.actionHistory = response.history;
          this.selectedAlert = alert;
          console.log('📜 Historique:', response.history);
        },
        error: (error) => {
          console.error('❌ Erreur chargement historique:', error);
          this.showError('Erreur lors du chargement de l\'historique');
        }
      });
  }

  /**
   * Obtenir l'icône selon la sévérité
   */
  getSeverityIcon(severity: string): string {
    const icons: { [key: string]: string } = {
      'HIGH': 'error',
      'CRITICAL': 'error',
      'MEDIUM': 'warning',
      'LOW': 'info'
    };
    return icons[severity] || 'info';
  }

  /**
   * Obtenir la couleur selon la sévérité
   */
  getSeverityColor(severity: string): string {
    const colors: { [key: string]: string } = {
      'HIGH': 'red',
      'CRITICAL': 'red',
      'MEDIUM': 'orange',
      'LOW': 'blue'
    };
    return colors[severity] || 'gray';
  }

  /**
   * Obtenir le libellé du statut
   */
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'NEW': 'Nouvelle',
      'IN_PROGRESS': 'En cours',
      'RESOLVED': 'Résolue',
      'ARCHIVED': 'Archivée'
    };
    return labels[status] || status;
  }

  /**
   * Formater la date
   */
  formatDate(date: Date | string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR') + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Obtenir le temps écoulé
   */
  getTimeAgo(date: Date | string): string {
    if (!date) return '-';
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  }

  /**
   * Afficher un message de succès
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Afficher un message d'erreur
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Déclencher une vérification manuelle
   */
  triggerManualCheck(): void {
    this.alertService.checkKpiNow()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('🔍 Vérification des KPI lancée');
          setTimeout(() => {
            this.loadActiveAlerts();
            this.loadStatistics();
          }, 2000);
        },
        error: (error) => {
          console.error('❌ Erreur vérification:', error);
          this.showError('Erreur lors de la vérification');
        }
      });
  }
}
