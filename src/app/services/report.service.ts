import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface KPIMetrics {
  totalConventions: number;
  activeConventions: number;
  expiredConventions: number;
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  collectionRate: number;
  averagePaymentTime: number;
  monthlyRevenue: number;
  pendingAmount: number;
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  structureId?: string;
  governorate?: string;
  status?: string;
  type?: 'conventions' | 'invoices' | 'financial';
}

export interface ReportData {
  id: string;
  name: string;
  type: 'pdf' | 'excel' | 'csv';
  generatedAt: Date;
  status: 'completed' | 'processing' | 'failed';
  downloadUrl?: string;
}

@Injectable()
export class ReportService {
  private apiUrl = `${environment.apiUrl}/commercial/dashboard`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // KPI et métriques
  getKPIMetrics(filters?: ReportFilters): Observable<KPIMetrics> {
    let params = '';
    if (filters) {
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString());
      if (filters.structureId) queryParams.append('structureId', filters.structureId);
      if (filters.governorate) queryParams.append('governorate', filters.governorate);
      if (filters.status) queryParams.append('status', filters.status);
      params = '?' + queryParams.toString();
    }
    return this.http.get<KPIMetrics>(`${this.apiUrl}/kpi${params}`, { headers: this.getHeaders() });
  }

  // Génération de rapports
  generateReport(type: string, filters: ReportFilters): Observable<ReportData> {
    return this.http.post<ReportData>(`${this.apiUrl}/generate`, {
      type,
      filters
    }, { headers: this.getHeaders() });
  }

  // Liste des rapports générés
  getGeneratedReports(): Observable<ReportData[]> {
    return this.http.get<ReportData[]>(`${this.apiUrl}/generated`, { headers: this.getHeaders() });
  }

  // Téléchargement de rapport
  downloadReport(reportId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${reportId}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  // Rapports prédéfinis
  getConventionsReport(filters: ReportFilters): Observable<ReportData> {
    return this.generateReport('conventions', filters);
  }

  getInvoicesReport(filters: ReportFilters): Observable<ReportData> {
    return this.generateReport('invoices', filters);
  }

  getFinancialReport(filters: ReportFilters): Observable<ReportData> {
    return this.generateReport('financial', filters);
  }

  // Suppression de rapport
  deleteReport(reportId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reportId}`, { headers: this.getHeaders() });
  }
} 