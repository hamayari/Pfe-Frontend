import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Service pour le module Analyse & Notification KPI
 */
@Injectable({
  providedIn: 'root'
})
export class KpiAnalysisService {
  
  private apiUrl = `${environment.apiUrl}/kpi-analysis`;
  
  constructor(private http: HttpClient) { }
  
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  
  /**
   * Récupérer les KPI globaux
   */
  getGlobalKpis(): Observable<any> {
    return this.http.get(`${this.apiUrl}/global`, { headers: this.getHeaders() });
  }
  
  /**
   * Récupérer les KPI par gouvernorat
   */
  getKpisByGouvernorat(): Observable<any> {
    return this.http.get(`${this.apiUrl}/by-gouvernorat`, { headers: this.getHeaders() });
  }
  
  /**
   * Récupérer les KPI par structure
   */
  getKpisByStructure(): Observable<any> {
    return this.http.get(`${this.apiUrl}/by-structure`, { headers: this.getHeaders() });
  }
  
  /**
   * Récupérer toutes les alertes actives
   */
  getActiveAlerts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/alerts`, { headers: this.getHeaders() });
  }
  
  /**
   * Récupérer les alertes critiques
   */
  getCriticalAlerts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/alerts/critical`, { headers: this.getHeaders() });
  }
  
  /**
   * Déclencher une analyse manuelle
   */
  triggerAnalysis(): Observable<any> {
    return this.http.post(`${this.apiUrl}/analyze`, {}, { headers: this.getHeaders() });
  }
  
  /**
   * Résoudre une alerte
   */
  resolveAlert(alertId: string, resolvedBy: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/alerts/${alertId}/resolve?resolvedBy=${resolvedBy}`,
      {},
      { headers: this.getHeaders() }
    );
  }
  
  /**
   * Récupérer tous les seuils configurés
   */
  getThresholds(): Observable<any> {
    return this.http.get(`${this.apiUrl}/thresholds`, { headers: this.getHeaders() });
  }
  
  /**
   * Créer ou modifier un seuil
   */
  saveThreshold(threshold: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/thresholds`, threshold, { headers: this.getHeaders() });
  }
  
  /**
   * Récupérer le dashboard complet pour DECIDEUR
   */
  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`, { headers: this.getHeaders() });
  }
  
  /**
   * Déléguer une alerte au Chef de Projet
   */
  delegateAlertToProjectManager(alertId: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/kpi-alerts/${alertId}/delegate-to-pm`,
      {},
      { headers: this.getHeaders() }
    );
  }
  
  /**
   * Récupérer l'historique des alertes déléguées
   */
  getDelegatedAlerts(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/alerts/delegated`,
      { headers: this.getHeaders() }
    );
  }
}
