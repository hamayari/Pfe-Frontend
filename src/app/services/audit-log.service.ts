import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuditLog {
  id: string;
  timestamp: string;
  username: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
}

export interface AuditLogPage {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AuditLogFilters {
  entityType?: string;
  entityId?: string;
  action?: string;
  username?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private apiUrl = `${environment.apiUrl || 'http://localhost:8085/api'}/audit`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer les logs d'audit avec filtres et pagination
   */
  getAuditLogs(filters: AuditLogFilters = {}): Observable<AuditLogPage> {
    let params = new HttpParams();
    
    if (filters.entityType) params = params.set('entityType', filters.entityType);
    if (filters.entityId) params = params.set('entityId', filters.entityId);
    if (filters.action) params = params.set('action', filters.action);
    if (filters.username) params = params.set('username', filters.username);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.page !== undefined) params = params.set('page', filters.page.toString());
    if (filters.size !== undefined) params = params.set('size', filters.size.toString());

    return this.http.get<AuditLogPage>(this.apiUrl, { params });
  }

  /**
   * Récupérer les logs d'un utilisateur spécifique
   */
  getUserAuditLogs(username: string, page: number = 0, size: number = 10): Observable<AuditLogPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<AuditLogPage>(`${this.apiUrl}/user/${username}`, { params });
  }

  /**
   * Exporter les logs en CSV
   */
  exportToCSV(filters: AuditLogFilters = {}): void {
    this.getAuditLogs({ ...filters, size: 10000 }).subscribe(response => {
      const logs = response.content;
      const csv = this.convertToCSV(logs);
      this.downloadFile(csv, 'audit-logs.csv', 'text/csv');
    });
  }

  /**
   * Exporter les logs en JSON
   */
  exportToJSON(filters: AuditLogFilters = {}): void {
    this.getAuditLogs({ ...filters, size: 10000 }).subscribe(response => {
      const logs = response.content;
      const json = JSON.stringify(logs, null, 2);
      this.downloadFile(json, 'audit-logs.json', 'application/json');
    });
  }

  /**
   * Convertir les logs en CSV
   */
  private convertToCSV(logs: AuditLog[]): string {
    if (logs.length === 0) return '';

    const headers = ['Date', 'Utilisateur', 'Action', 'Type', 'ID Entité', 'Détails', 'IP'];
    const rows = logs.map(log => [
      log.timestamp,
      log.username,
      log.action,
      log.entityType,
      log.entityId,
      log.details || '',
      log.ipAddress || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Télécharger un fichier
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Obtenir les statistiques des logs
   */
  getStatistics(filters: AuditLogFilters = {}): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`, { params: filters as any });
  }
}
