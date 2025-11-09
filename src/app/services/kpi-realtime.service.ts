import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, interval, BehaviorSubject } from 'rxjs';
import { switchMap, startWith, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface KpiData {
  name: string;
  displayName: string;
  value: number;
  previousValue: number;
  trend: number; // Pourcentage de changement
  status: 'normal' | 'warning' | 'critical';
  threshold: number;
  unit: string;
  icon: string;
  color: string;
}

export interface KpiHistoryPoint {
  date: string;
  value: number;
}

export interface KpiHistory {
  kpiName: string;
  data: KpiHistoryPoint[];
}

@Injectable({
  providedIn: 'root'
})
export class KpiRealtimeService {
  private apiUrl = 'http://localhost:8085/api';
  private kpisSubject = new BehaviorSubject<KpiData[]>([]);
  public kpis$ = this.kpisSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Démarrer le rafraîchissement automatique des KPI (toutes les 30 secondes)
   */
  startAutoRefresh(): Observable<KpiData[]> {
    return interval(30000).pipe(
      startWith(0),
      switchMap(() => this.fetchKpis()),
      catchError(error => {
        console.error('Erreur rafraîchissement KPI:', error);
        return of([]);
      })
    );
  }

  /**
   * Récupérer les KPI actuels
   */
  fetchKpis(): Observable<KpiData[]> {
    return new Observable(observer => {
      this.http.get<any>(`${this.apiUrl}/kpi-alerts/current-kpis`, {
        headers: this.getAuthHeaders()
      }).subscribe({
        next: (response) => {
          const kpis = this.transformKpiData(response);
          this.kpisSubject.next(kpis);
          observer.next(kpis);
          observer.complete();
        },
        error: (error) => {
          console.error('Erreur récupération KPI:', error);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Récupérer l'historique d'un KPI (30 derniers jours)
   */
  getKpiHistory(kpiName: string): Observable<KpiHistory> {
    return this.http.get<KpiHistory>(
      `${this.apiUrl}/kpi-alerts/history/${kpiName}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Déclencher une vérification manuelle des KPI
   */
  triggerKpiCheck(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/kpi-alerts/check-now`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Transformer les données brutes en KpiData
   */
  private transformKpiData(response: any): KpiData[] {
    const kpis: KpiData[] = [];

    // KPI 1: Taux de Recouvrement
    if (response.tauxRecouvrement !== undefined) {
      kpis.push({
        name: 'tauxRecouvrement',
        displayName: 'Taux de Recouvrement',
        value: response.tauxRecouvrement,
        previousValue: response.tauxRecouvrementPrevious || response.tauxRecouvrement,
        trend: this.calculateTrend(response.tauxRecouvrement, response.tauxRecouvrementPrevious),
        status: this.getStatus(response.tauxRecouvrement, 85, 70),
        threshold: 85,
        unit: '%',
        icon: 'trending_up',
        color: this.getColor(response.tauxRecouvrement, 85, 70)
      });
    }

    // KPI 2: Délai Moyen de Paiement
    if (response.delaiMoyenPaiement !== undefined) {
      kpis.push({
        name: 'delaiMoyenPaiement',
        displayName: 'Délai Moyen Paiement',
        value: response.delaiMoyenPaiement,
        previousValue: response.delaiMoyenPaiementPrevious || response.delaiMoyenPaiement,
        trend: this.calculateTrend(response.delaiMoyenPaiement, response.delaiMoyenPaiementPrevious),
        status: this.getStatus(response.delaiMoyenPaiement, 30, 45, true), // Inversé: moins c'est mieux
        threshold: 30,
        unit: 'jours',
        icon: 'schedule',
        color: this.getColor(response.delaiMoyenPaiement, 30, 45, true)
      });
    }

    // KPI 3: Taux de Factures en Retard
    if (response.tauxFacturesRetard !== undefined) {
      kpis.push({
        name: 'tauxFacturesRetard',
        displayName: 'Factures en Retard',
        value: response.tauxFacturesRetard,
        previousValue: response.tauxFacturesRetardPrevious || response.tauxFacturesRetard,
        trend: this.calculateTrend(response.tauxFacturesRetard, response.tauxFacturesRetardPrevious),
        status: this.getStatus(response.tauxFacturesRetard, 10, 15, true),
        threshold: 10,
        unit: '%',
        icon: 'warning',
        color: this.getColor(response.tauxFacturesRetard, 10, 15, true)
      });
    }

    // KPI 4: Montant Total Impayés
    if (response.montantTotalImpayes !== undefined) {
      kpis.push({
        name: 'montantTotalImpayes',
        displayName: 'Montant Impayés',
        value: response.montantTotalImpayes,
        previousValue: response.montantTotalImpayesPrevious || response.montantTotalImpayes,
        trend: this.calculateTrend(response.montantTotalImpayes, response.montantTotalImpayesPrevious),
        status: this.getStatus(response.montantTotalImpayes, 50000, 100000, true),
        threshold: 50000,
        unit: 'TND',
        icon: 'attach_money',
        color: this.getColor(response.montantTotalImpayes, 50000, 100000, true)
      });
    }

    // KPI 5: Nombre de Clients en Retard
    if (response.nombreClientsRetard !== undefined) {
      kpis.push({
        name: 'nombreClientsRetard',
        displayName: 'Clients en Retard',
        value: response.nombreClientsRetard,
        previousValue: response.nombreClientsRetardPrevious || response.nombreClientsRetard,
        trend: this.calculateTrend(response.nombreClientsRetard, response.nombreClientsRetardPrevious),
        status: this.getStatus(response.nombreClientsRetard, 5, 10, true),
        threshold: 5,
        unit: 'clients',
        icon: 'people',
        color: this.getColor(response.nombreClientsRetard, 5, 10, true)
      });
    }

    return kpis;
  }

  /**
   * Calculer la tendance (pourcentage de changement)
   */
  private calculateTrend(current: number, previous: number | undefined): number {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Déterminer le statut selon les seuils
   */
  private getStatus(
    value: number,
    warningThreshold: number,
    criticalThreshold: number,
    inverse: boolean = false
  ): 'normal' | 'warning' | 'critical' {
    if (inverse) {
      if (value >= criticalThreshold) return 'critical';
      if (value >= warningThreshold) return 'warning';
      return 'normal';
    } else {
      if (value <= criticalThreshold) return 'critical';
      if (value <= warningThreshold) return 'warning';
      return 'normal';
    }
  }

  /**
   * Déterminer la couleur selon le statut
   */
  private getColor(
    value: number,
    warningThreshold: number,
    criticalThreshold: number,
    inverse: boolean = false
  ): string {
    const status = this.getStatus(value, warningThreshold, criticalThreshold, inverse);
    switch (status) {
      case 'critical': return '#f44336';
      case 'warning': return '#ff9800';
      case 'normal': return '#4caf50';
    }
  }
}
