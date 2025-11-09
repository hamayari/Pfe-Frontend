import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface KpiAlert {
  id: string;
  kpiName: string;
  currentValue: number;
  thresholdValue?: number;
  expectedValue?: number;
  severity: string;
  status: string;
  alertStatus: string;
  dimension: string;
  dimensionValue: string;
  message: string;
  recommendation: string;
  recipients: string[];
  detectedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  delegatedAt?: Date;
  delegatedBy?: string;
  delegatedTo?: string;
  acknowledgedAt?: Date;
  priority: string;
}

@Injectable({
  providedIn: 'root'
})
export class KpiAlertManagementService {
  private apiUrl = `${environment.apiUrl}/kpi-alerts/manage`;

  constructor(private http: HttpClient) {}

  /**
   * Obtenir les alertes actives (PENDING_DECISION pour Décideur, DELEGATED pour Chef de Projet)
   */
  getActiveAlerts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/active`);
  }

  /**
   * Obtenir les alertes résolues (historique)
   */
  getResolvedAlerts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/resolved`);
  }

  /**
   * Obtenir les alertes archivées
   */
  getArchivedAlerts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/archived`);
  }

  /**
   * Déléguer une alerte au Chef de Projet (Décideur uniquement)
   */
  sendToProjectManager(alertId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${alertId}/send-to-pm`, {});
  }

  /**
   * Marquer une alerte comme "En cours"
   */
  markAsInProgress(alertId: string, comment?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${alertId}/in-progress`, {
      comment: comment || 'Prise en charge de l\'alerte'
    });
  }

  /**
   * Résoudre une alerte (Chef de Projet)
   */
  resolveAlert(alertId: string, resolutionComment: string, actionsTaken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${alertId}/resolve`, {
      resolutionComment,
      actionsTaken
    });
  }

  /**
   * Marquer comme informé (Chef de Projet)
   */
  markAsAcknowledged(alertId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${alertId}/acknowledge`, {});
  }

  /**
   * Archiver une alerte
   */
  archiveAlert(alertId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${alertId}/archive`, {});
  }

  /**
   * Obtenir les statistiques des alertes
   */
  getStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`);
  }

  /**
   * Forcer la vérification des KPI
   */
  triggerKpiCheck(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/kpi-alerts/trigger-analysis`, {});
  }
}
