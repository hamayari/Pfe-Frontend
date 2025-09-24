import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  activeConventions: number;
  expiredConventions: number;
  pendingConventions: number;
  totalApplications: number;
  totalZones: number;
  totalStructures: number;
  totalTypes: number;
}

export interface Nomenclature {
  id: string;
  name: string;
  type: string;
  description: string;
  usage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemLog {
  id: string;
  level: string;
  message: string;
  timestamp: Date;
  userId?: string;
  action?: string;
}

export interface DatabaseInfo {
  name: string;
  version: string;
  size: string;
  connections: number;
  status: string;
}

export interface ConventionStats {
  total: number;
  active: number;
  expired: number;
  pending: number;
  overdue: number;
}

export interface InvoiceStats {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor() { }

  getStats(): Observable<DashboardStats> {
    // Simulation des données
    return of({
      totalUsers: 150,
      activeUsers: 120,
      pendingUsers: 30,
      activeConventions: 45,
      expiredConventions: 12,
      pendingConventions: 8,
      totalApplications: 89,
      totalZones: 23,
      totalStructures: 67,
      totalTypes: 15
    });
  }

  getAdminStats(): Observable<DashboardStats> {
    // Méthode spécifique pour les stats admin
    return this.getStats();
  }

  getConventionsStats(): Observable<ConventionStats> {
    return of({
      total: 65,
      active: 45,
      expired: 12,
      pending: 8,
      overdue: 5
    });
  }

  getInvoicesStats(): Observable<InvoiceStats> {
    return of({
      total: 234,
      paid: 180,
      pending: 45,
      overdue: 9
    });
  }

  getNomenclatures(): Observable<Nomenclature[]> {
    // Simulation des données
    return of([
      {
        id: '1',
        name: 'Zone Urbaine',
        type: 'Zone',
        description: 'Zone urbaine pour développement',
        usage: 'Urbanisme',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Structure Commerciale',
        type: 'Structure',
        description: 'Structure pour activités commerciales',
        usage: 'Commerce',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  }

  getSystemLogs(): Observable<SystemLog[]> {
    // Simulation des logs système
    return of([
      {
        id: '1',
        level: 'INFO',
        message: 'Utilisateur connecté avec succès',
        timestamp: new Date(),
        userId: 'user123',
        action: 'LOGIN'
      },
      {
        id: '2',
        level: 'WARN',
        message: 'Tentative de connexion échouée',
        timestamp: new Date(),
        userId: 'user456',
        action: 'LOGIN_FAILED'
      }
    ]);
  }

  getRecentLogs(): Observable<SystemLog[]> {
    // Méthode spécifique pour les logs récents
    return this.getSystemLogs();
  }

  createNomenclature(nomenclature: Partial<Nomenclature>): Observable<Nomenclature> {
    // Simulation de création
    const newNomenclature: Nomenclature = {
      id: Date.now().toString(),
      name: nomenclature.name || '',
      type: nomenclature.type || '',
      description: nomenclature.description || '',
      usage: nomenclature.usage || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return of(newNomenclature);
  }

  updateNomenclature(id: string, nomenclature: Partial<Nomenclature>): Observable<Nomenclature> {
    // Simulation de mise à jour
    const updatedNomenclature: Nomenclature = {
      id,
      name: nomenclature.name || '',
      type: nomenclature.type || '',
      description: nomenclature.description || '',
      usage: nomenclature.usage || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return of(updatedNomenclature);
  }

  deleteNomenclature(id: string): Observable<boolean> {
    // Simulation de suppression
    return of(true);
  }

  exportData(type: string): Observable<Blob> {
    // Simulation d'export
    const data = `Export ${type} - ${new Date().toISOString()}`;
    const blob = new Blob([data], { type: 'text/csv' });
    return of(blob);
  }

  getDatabaseInfo(): Observable<DatabaseInfo> {
    // Simulation des infos de base de données
    return of({
      name: 'MongoDB',
      version: '5.0.6',
      size: '2.3 GB',
      connections: 15,
      status: 'Online'
    });
  }
}
