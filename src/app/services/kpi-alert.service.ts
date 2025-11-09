import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface KpiAlert {
  id: string;
  kpiName: string;
  currentValue: number;
  expectedValue?: number;
  thresholdValue?: number;
  status: string;
  severity: string;
  dimension: string;
  dimensionValue: string;
  message: string;
  
  recommendation: string;
  recipients: string[];
  alertStatus: string; // NEW, IN_PROGRESS, RESOLVED, ARCHIVED
  detectedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolvedByName?: string;
  resolutionComment?: string;
  actionsTaken?: string;
  archivedAt?: Date;
  archivedBy?: string;
  priority: string;
  actionHistory: AlertAction[];
}

export interface AlertAction {
  actionType: string;
  performedBy: string;
  performedByName: string;
  performedAt: Date;
  comment: string;
  previousStatus?: string;
  newStatus?: string;
}

export interface AlertStatistics {
  new: number;
  inProgress: number;
  resolved: number;
  archived: number;
  total: number;
  active: number;
}

@Injectable({
  providedIn: 'root'
})
export class KpiAlertService {
  private apiUrl = `${environment.apiUrl}/kpi-alerts/manage`;

  constructor(private http: HttpClient) {}

  /**
   * Obtenir les alertes actives (NEW + IN_PROGRESS)
   */
  getActiveAlerts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/active`);
  }

  /**
   * Obtenir les alertes résolues récemment (7 derniers jours)
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
   * Déclencher la vérification manuelle des KPI
   */
  triggerKpiCheck(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/kpi-alerts/check-now`, {});
  }

  /**
   * Envoyer une alerte au Chef de Projet (Décideur)
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
   * Résoudre une alerte
   */
  resolveAlert(alertId: string, resolutionComment: string, actionsTaken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${alertId}/resolve`, {
      resolutionComment,
      actionsTaken
    });
  }

  /**
   * Archiver une alerte
   */
  archiveAlert(alertId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${alertId}/archive`, {});
  }

  /**
   * Ajouter un commentaire à une alerte
   */
  addComment(alertId: string, comment: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${alertId}/comment`, {
      comment
    });
  }

  /**
   * Obtenir l'historique complet d'une alerte
   */
  getAlertHistory(alertId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${alertId}/history`);
  }

  /**
   * Obtenir les statistiques des alertes
   */
  getStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`);
  }

  /**
   * Déclencher une vérification manuelle des KPI
   */
  checkKpiNow(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/kpi-alerts/check-now`, {});
  }
}
