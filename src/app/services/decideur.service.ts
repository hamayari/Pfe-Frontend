import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CommercialStats {
  name: string;
  username: string;
  conventions: number;
  ca: number;
  performance: number;
}

export interface RepartitionStats {
  name: string;
  value: number;
  montant: number;
}

export interface StructureStats {
  name: string;
  value: number;
  color: string;
}

export interface PerformanceData {
  month: string;
  value: number;
}

export interface ActivityData {
  icon: string;
  title: string;
  description: string;
  time: string;
  color: string;
}

export interface KPIData {
  totalConventions: number;
  activeConventions: number;
  totalRevenue: number;
  pendingInvoices: number;
  pendingAmount: number;
  paidInvoices: number;
  paymentRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class DecideurService {
  private apiUrl = `${environment.apiUrl}/decideur`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère le top 5 des commerciaux avec leur score de performance
   */
  getTopCommercials(): Observable<CommercialStats[]> {
    return this.http.get<CommercialStats[]>(`${this.apiUrl}/top-commercials`);
  }

  /**
   * Récupère la répartition des conventions par gouvernorat
   */
  getRepartitionGouvernorat(): Observable<RepartitionStats[]> {
    return this.http.get<RepartitionStats[]>(`${this.apiUrl}/repartition-gouvernorat`);
  }

  /**
   * Récupère la répartition des conventions par structure
   */
  getRepartitionStructure(): Observable<StructureStats[]> {
    return this.http.get<StructureStats[]>(`${this.apiUrl}/repartition-structure`);
  }

  /**
   * Récupère les données de performance (évolution du CA)
   */
  getPerformanceData(): Observable<PerformanceData[]> {
    return this.http.get<PerformanceData[]>(`${this.apiUrl}/performance`);
  }

  /**
   * Récupère les activités récentes
   */
  getRecentActivities(): Observable<ActivityData[]> {
    return this.http.get<ActivityData[]>(`${this.apiUrl}/recent-activities`);
  }

  /**
   * Récupère les KPIs réels (conventions + factures)
   */
  getKPIs(): Observable<KPIData> {
    return this.http.get<KPIData>(`${this.apiUrl}/kpis`);
  }

  /**
   * Récupère la liste des structures (codes)
   */
  getStructures(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/structures`);
  }

  /**
   * Récupère la liste des applications (codes)
   */
  getApplications(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/applications`);
  }
}

/**
 * Interface pour les nomenclatures (Structure, Application)
 */
export interface NomenclatureDTO {
  code: string;
  libelle: string;
}
