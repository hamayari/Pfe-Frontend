import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { KpiAlertManagementService, KpiAlert } from '../../../services/kpi-alert-management.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-kpi-alerts',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatTabsModule
  ],
  templateUrl: './kpi-alerts.component.html',
  styleUrls: ['./kpi-alerts.component.scss']
})
export class KpiAlertsComponent implements OnInit, OnDestroy {
  
  alerts: KpiAlert[] = [];
  criticalAlerts: KpiAlert[] = [];
  resolvedAlerts: KpiAlert[] = [];
  delegatedAlerts: KpiAlert[] = [];
  loading = false;
  selectedTab = 0; // 0 = Alertes actives, 1 = Historique
  private refreshSubscription?: Subscription;
  
  constructor(private kpiAlertService: KpiAlertManagementService) {}
  
  ngOnInit(): void {
    this.loadAlerts();
    this.loadResolvedHistory();
    
    // Rafraîchir toutes les 2 minutes
    this.refreshSubscription = interval(120000).subscribe(() => {
      this.loadAlerts();
      this.loadResolvedHistory();
    });
  }
  
  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
  
  loadAlerts(): void {
    this.loading = true;
    console.log('📥 [DÉCIDEUR] Chargement des alertes PENDING_DECISION...');
    
    // Charger toutes les alertes en attente de décision
    this.kpiAlertService.getActiveAlerts().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.alerts = response.alerts || [];
          this.criticalAlerts = this.alerts.filter(a => a.severity === 'HIGH' || a.severity === 'CRITICAL');
          console.log(`✅ ${this.alerts.length} alerte(s) chargée(s) (${this.criticalAlerts.length} critiques)`);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur chargement alertes:', error);
        this.loading = false;
      }
    });
  }
  
  resolveAlert(alert: KpiAlert): void {
    const comment = prompt('Commentaire de résolution (optionnel):');
    if (comment === null) return; // Annulé
    
    const actions = prompt('Actions prises (optionnel):');
    if (actions === null) return; // Annulé
    
    this.kpiAlertService.resolveAlert(alert.id, comment || 'Résolu', actions || 'N/A').subscribe({
      next: () => {
        console.log('✅ Alerte résolue:', alert.id);
        // Retirer l'alerte de la liste active
        this.alerts = this.alerts.filter(a => a.id !== alert.id);
        this.criticalAlerts = this.criticalAlerts.filter(a => a.id !== alert.id);
        
        window.alert('✅ Alerte résolue avec succès');
        this.loadResolvedHistory();
      },
      error: (error) => {
        console.error('❌ Erreur résolution alerte:', error);
        window.alert('❌ Erreur lors de la résolution');
      }
    });
  }
  
  getStatusIcon(status: string): string {
    switch (status) {
      case 'SAIN': return 'check_circle';
      case 'A_SURVEILLER': return 'warning';
      case 'ANORMAL': return 'error';
      default: return 'info';
    }
  }
  
  getStatusColor(status: string): string {
    switch (status) {
      case 'SAIN': return 'success';
      case 'A_SURVEILLER': return 'warning';
      case 'ANORMAL': return 'danger';
      default: return 'info';
    }
  }
  
  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'LOW': return 'info';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'error';
      case 'CRITICAL': return 'local_fire_department';
      default: return 'help';
    }
  }
  
  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'LOW': return 'primary';
      case 'MEDIUM': return 'accent';
      case 'HIGH': return 'warn';
      case 'CRITICAL': return 'warn';
      default: return 'primary';
    }
  }
  
  getKpiLabel(kpiName: string): string {
    const labels: { [key: string]: string } = {
      'TAUX_RETARD': 'Taux de Retard',
      'TAUX_PAIEMENT': 'Taux de Paiement',
      'MONTANT_IMPAYE_PERCENT': 'Montant Impayé',
      'DUREE_MOYENNE_PAIEMENT': 'Durée Moyenne de Paiement',
      'TAUX_CONVERSION': 'Taux de Conversion'
    };
    return labels[kpiName] || kpiName;
  }
  
  formatDate(date: Date): string {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  /**
   * Déléguer une alerte au Chef de Projet
   */
  delegateToProjectManager(alert: KpiAlert): void {
    if (!confirm(`Voulez-vous envoyer cette alerte au Chef de Projet ?\n\n${alert.message}`)) {
      return;
    }
    
    console.log('📤 Délégation de l\'alerte:', alert.id);
    
    this.kpiAlertService.sendToProjectManager(alert.id).subscribe({
      next: () => {
        console.log('✅ Alerte déléguée');
        
        // Retirer l'alerte de la liste active
        this.alerts = this.alerts.filter(a => a.id !== alert.id);
        this.criticalAlerts = this.criticalAlerts.filter(a => a.id !== alert.id);
        
        window.alert('✅ Alerte envoyée au Chef de Projet avec succès !');
        
        // Rafraîchir les alertes
        this.loadAlerts();
        this.loadResolvedHistory();
      },
      error: (err) => {
        console.error('❌ Erreur délégation:', err);
        window.alert('❌ Erreur lors de l\'envoi de l\'alerte');
      }
    });
  }
  
  /**
   * Voir l'historique d'une alerte
   */
  viewHistory(alert: KpiAlert): void {
    console.log('📜 Historique de l\'alerte:', alert);
    // Basculer vers l'onglet historique
    this.selectedTab = 1;
  }
  
  /**
   * Charger l'historique des alertes résolues
   */
  loadResolvedHistory(): void {
    console.log('📥 Chargement de l\'historique des alertes résolues...');
    
    this.kpiAlertService.getResolvedAlerts().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.resolvedAlerts = response.alerts || [];
          console.log(`✅ ${this.resolvedAlerts.length} alerte(s) résolue(s) chargée(s)`);
        }
      },
      error: (error) => {
        console.error('❌ Erreur chargement historique:', error);
      }
    });
  }
  
  /**
   * Charger l'historique des alertes déléguées (alias pour loadResolvedHistory)
   */
  loadDelegatedHistory(): void {
    this.delegatedAlerts = this.resolvedAlerts;
    this.loadResolvedHistory();
  }
  
  /**
   * Forcer la vérification des KPI
   */
  triggerKpiCheck(): void {
    console.log('🔧 Déclenchement manuel de la vérification KPI...');
    
    this.kpiAlertService.triggerKpiCheck().subscribe({
      next: () => {
        console.log('✅ Vérification déclenchée');
        window.alert('✅ Vérification des KPI déclenchée. Les alertes seront générées dans quelques instants.');
        
        // Rafraîchir après 5 secondes
        setTimeout(() => {
          this.loadAlerts();
        }, 5000);
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        window.alert('❌ Erreur lors du déclenchement de la vérification');
      }
    });
  }
  
  /**
   * Formater la date de délégation
   */
  formatDelegationDate(alert: KpiAlert): string {
    if ((alert as any).delegatedAt) {
      return new Date((alert as any).delegatedAt).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return 'N/A';
  }
}
