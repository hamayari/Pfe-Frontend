import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserService } from '../features/users/services/user.service';
import { User as ApiUser } from '../features/users/models/user.model';

// Interfaces
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  disabledUsers: number;
  totalStructures: number;
  totalConventions: number;
  totalTaxonomies: number;
  totalApplications: number;
  totalZones: number;
  criticalAlerts: number;
  warningAlerts: number;
  totalActions: number;
  actionsThisWeek: number;
  pendingActions: number;
  newUsersThisMonth: number;
  recentUsers: any[];
  systemAlerts: any[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  enabled: boolean;
  lastLogin?: Date;
  createdAt: Date;
  status: 'active' | 'pending' | 'inactive';
}

export interface Structure {
  id: string;
  name: string;
  type: string;
  governorate: string;
  contact: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface Convention {
  id: string;
  reference: string;
  label: string;
  structure: string;
  governorate: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'pending' | 'expired';
  amount: number;
}

export interface Nomenclature {
  id: string;
  name: string;
  type: 'application' | 'zone' | 'structure';
  description: string;
  parent?: string;
  region?: string;
  contact?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  priority: number;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  adminUser: string;
  action: string;
  target: string;
  result: 'success' | 'failure';
  details?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {

  constructor(private userService: UserService) { }

  // Obtenir les statistiques du dashboard
  getDashboardStats(): Observable<AdminStats> {
    return this.userService.getUsers().pipe(
      map(response => {
        // Gérer différents formats de réponse
        const users = response.data || response;
        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.enabled && u.isActive).length;
        const pendingUsers = users.filter(u => u.status === 'offline' && u.enabled).length;
        const disabledUsers = users.filter(u => !u.enabled || !u.isActive).length;
        
        // Prendre les 3 utilisateurs les plus récents
        const recentUsers = users
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3)
          .map(user => this.convertToDashboardFormat(user));

        const stats: AdminStats = {
          totalUsers,
          activeUsers,
          pendingUsers,
          disabledUsers,
          totalStructures: 23, // À remplacer par un vrai appel API
          totalConventions: 89, // À remplacer par un vrai appel API
          totalTaxonomies: 45, // À remplacer par un vrai appel API
          totalApplications: 25, // À remplacer par un vrai appel API
          totalZones: 15, // À remplacer par un vrai appel API
          criticalAlerts: 3, // À remplacer par un vrai appel API
          warningAlerts: 7, // À remplacer par un vrai appel API
          totalActions: 1247, // À remplacer par un vrai appel API
          actionsThisWeek: 89, // À remplacer par un vrai appel API
          pendingActions: 12, // À remplacer par un vrai appel API
          newUsersThisMonth: 15, // À remplacer par un vrai appel API
          recentUsers,
          systemAlerts: [
            { id: '1', type: 'critical', title: 'Base de données saturée', message: 'L\'utilisation de la base de données a atteint 95%', timestamp: new Date(Date.now() - 300000), resolved: false, priority: 1 },
            { id: '2', type: 'warning', title: 'Facture proche échéance', message: '15 factures arrivent à échéance dans les 3 jours', timestamp: new Date(Date.now() - 600000), resolved: false, priority: 2 },
            { id: '3', type: 'info', title: 'Sauvegarde automatique', message: 'Sauvegarde quotidienne terminée avec succès', timestamp: new Date(Date.now() - 900000), resolved: true, priority: 3 }
          ]
        };

        return stats;
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des statistiques:', error);
        // En cas d'erreur, retourner des statistiques par défaut
        return of({
          totalUsers: 0,
          activeUsers: 0,
          pendingUsers: 0,
          disabledUsers: 0,
          totalStructures: 0,
          totalConventions: 0,
          totalTaxonomies: 0,
          totalApplications: 0,
          totalZones: 0,
          criticalAlerts: 0,
          warningAlerts: 0,
          totalActions: 0,
          actionsThisWeek: 0,
          pendingActions: 0,
          newUsersThisMonth: 0,
          recentUsers: [],
          systemAlerts: []
        });
      })
    );
  }

  // Obtenir la liste des utilisateurs
  getUsers(): Observable<User[]> {
    return this.userService.getUsers().pipe(
      map(response => {
        // Convertir les données de l'API vers le format attendu par le dashboard
        const users = response.data || response;
        return users.map(user => this.convertToDashboardFormat(user));
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        // En cas d'erreur, retourner un tableau vide
        return of([]);
      })
    );
  }

  // Convertir les données de l'API vers le format du dashboard
  private convertToDashboardFormat(user: ApiUser): User {
    return {
      id: user._id || user.id || '',
      name: user.name,
      email: user.email,
      roles: user.roles,
      enabled: user.enabled,
      lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt) : new Date(),
      createdAt: new Date(user.createdAt),
      status: this.convertStatus(user.status, user.enabled, user.isActive)
    };
  }

  // Convertir le statut de la base de données vers le format d'affichage
  private convertStatus(status: string, enabled: boolean, isActive: boolean): 'active' | 'pending' | 'inactive' {
    if (!enabled || !isActive) {
      return 'inactive';
    }
    if (status === 'offline') {
      return 'pending';
    }
    return 'active';
  }

  // Obtenir la liste des structures
  getStructures(): Observable<Structure[]> {
    const mockStructures: Structure[] = [
      { id: '1', name: 'Centre Commercial Tunis City', type: 'Commercial', governorate: 'Tunis', contact: 'contact@tuniscity.tn', status: 'active', createdAt: new Date('2024-01-01') },
      { id: '2', name: 'Zone Industrielle Sfax', type: 'Industrial', governorate: 'Sfax', contact: 'info@zis.tn', status: 'active', createdAt: new Date('2024-02-01') },
      { id: '3', name: 'Résidence Les Jardins', type: 'Residential', governorate: 'Sousse', contact: 'residence@jardins.tn', status: 'active', createdAt: new Date('2024-03-01') },
      { id: '4', name: 'Complexe Sportif Monastir', type: 'Public', governorate: 'Monastir', contact: 'sport@monastir.tn', status: 'inactive', createdAt: new Date('2024-01-15') }
    ];

    return of(mockStructures).pipe(delay(300));
  }

  // Obtenir la liste des conventions
  getConventions(): Observable<Convention[]> {
    const mockConventions: Convention[] = [
      { id: '1', reference: 'CONV-2024-001', label: 'Convention Formation', structure: 'Centre Formation', governorate: 'Tunis', startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), status: 'active', amount: 50000 },
      { id: '2', reference: 'CONV-2024-002', label: 'Convention Infrastructure', structure: 'Ministère', governorate: 'Sfax', startDate: new Date('2024-02-01'), endDate: new Date('2024-08-31'), status: 'active', amount: 75000 },
      { id: '3', reference: 'CONV-2024-003', label: 'Convention IT', structure: 'Entreprise Tech', governorate: 'Sousse', startDate: new Date('2024-03-01'), endDate: new Date('2024-09-30'), status: 'pending', amount: 30000 },
      { id: '4', reference: 'CONV-2024-004', label: 'Convention Santé', structure: 'Hôpital Régional', governorate: 'Gabès', startDate: new Date('2023-06-01'), endDate: new Date('2024-05-31'), status: 'expired', amount: 120000 }
    ];

    return of(mockConventions).pipe(delay(300));
  }

  // Obtenir la liste des nomenclatures
  getNomenclatures(): Observable<Nomenclature[]> {
    const mockNomenclatures: Nomenclature[] = [
      { id: '1', name: 'Application Web', type: 'application', description: 'Application web de gestion des conventions', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
      { id: '2', name: 'Zone Industrielle', type: 'zone', description: 'Zone industrielle de Sfax', region: 'Sfax', createdAt: new Date('2024-02-01'), updatedAt: new Date('2024-02-01') },
      { id: '3', name: 'Structure Commerciale', type: 'structure', description: 'Centre commercial et zones commerciales', contact: 'contact@cc.tn', createdAt: new Date('2024-03-01'), updatedAt: new Date('2024-03-01') },
      { id: '4', name: 'Application Mobile', type: 'application', description: 'Application mobile pour la gestion des factures', createdAt: new Date('2024-01-15'), updatedAt: new Date('2024-01-15') },
      { id: '5', name: 'Zone Résidentielle', type: 'zone', description: 'Zones résidentielles et urbaines', region: 'Tunis', createdAt: new Date('2024-02-15'), updatedAt: new Date('2024-02-15') }
    ];

    return of(mockNomenclatures).pipe(delay(300));
  }

  // Obtenir la liste des alertes système
  getSystemAlerts(): Observable<SystemAlert[]> {
    const mockAlerts: SystemAlert[] = [
      { id: '1', type: 'critical', title: 'Base de données saturée', message: 'L\'utilisation de la base de données a atteint 95%', timestamp: new Date(Date.now() - 300000), resolved: false, priority: 1 },
      { id: '2', type: 'warning', title: 'Facture proche échéance', message: '15 factures arrivent à échéance dans les 3 jours', timestamp: new Date(Date.now() - 600000), resolved: false, priority: 2 },
      { id: '3', type: 'info', title: 'Sauvegarde automatique', message: 'Sauvegarde quotidienne terminée avec succès', timestamp: new Date(Date.now() - 900000), resolved: true, priority: 3 },
      { id: '4', type: 'warning', title: 'Utilisation mémoire élevée', message: 'L\'utilisation de la mémoire serveur atteint 85%', timestamp: new Date(Date.now() - 1200000), resolved: false, priority: 2 },
      { id: '5', type: 'info', title: 'Mise à jour système', message: 'Nouvelle version disponible pour le système', timestamp: new Date(Date.now() - 1500000), resolved: true, priority: 3 }
    ];

    return of(mockAlerts).pipe(delay(300));
  }

  // Obtenir la liste des logs d'audit
  getAuditLogs(): Observable<AuditLog[]> {
    const mockAuditLogs: AuditLog[] = [
      { id: '1', timestamp: new Date(Date.now() - 1800000), adminUser: 'superadmin', action: 'User Created', target: 'ahmed@example.com', result: 'success' },
      { id: '2', timestamp: new Date(Date.now() - 3600000), adminUser: 'admin1', action: 'Role Updated', target: 'fatma@example.com', result: 'success' },
      { id: '3', timestamp: new Date(Date.now() - 5400000), adminUser: 'superadmin', action: 'Structure Deleted', target: 'Zone Industrielle Gabès', result: 'success' },
      { id: '4', timestamp: new Date(Date.now() - 7200000), adminUser: 'admin2', action: 'Convention Modified', target: 'CONV-2024-001', result: 'success' },
      { id: '5', timestamp: new Date(Date.now() - 9000000), adminUser: 'superadmin', action: 'System Backup', target: 'Database Backup', result: 'success' },
      { id: '6', timestamp: new Date(Date.now() - 10800000), adminUser: 'admin1', action: 'User Deactivated', target: 'salma@example.com', result: 'success' }
    ];

    return of(mockAuditLogs).pipe(delay(300));
  }

  // Créer un nouvel utilisateur
  createUser(user: Partial<User>): Observable<User> {
    const newUser: User = {
      id: Date.now().toString(),
      name: user.name || '',
      email: user.email || '',
      roles: user.roles || [],
      enabled: user.enabled ?? true,
      createdAt: new Date(),
      status: 'pending'
    };

    return of(newUser).pipe(delay(500));
  }

  // Mettre à jour un utilisateur
  updateUser(id: string, updates: Partial<User>): Observable<User> {
    // Simulation de mise à jour
    return of({ id, ...updates } as User).pipe(delay(500));
  }

  // Supprimer un utilisateur
  deleteUser(id: string): Observable<boolean> {
    return of(true).pipe(delay(300));
  }

  // Créer une nouvelle structure
  createStructure(structure: Partial<Structure>): Observable<Structure> {
    const newStructure: Structure = {
      id: Date.now().toString(),
      name: structure.name || '',
      type: structure.type || '',
      governorate: structure.governorate || '',
      contact: structure.contact || '',
      status: 'active',
      createdAt: new Date()
    };

    return of(newStructure).pipe(delay(500));
  }

  // Mettre à jour une structure
  updateStructure(id: string, updates: Partial<Structure>): Observable<Structure> {
    return of({ id, ...updates } as Structure).pipe(delay(500));
  }

  // Supprimer une structure
  deleteStructure(id: string): Observable<boolean> {
    return of(true).pipe(delay(300));
  }

  // Créer une nouvelle nomenclature
  createNomenclature(nomenclature: Partial<Nomenclature>): Observable<Nomenclature> {
    const newNomenclature: Nomenclature = {
      id: Date.now().toString(),
      name: nomenclature.name || '',
      type: nomenclature.type || 'application',
      description: nomenclature.description || '',
      parent: nomenclature.parent,
      region: nomenclature.region,
      contact: nomenclature.contact,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return of(newNomenclature).pipe(delay(500));
  }

  // Mettre à jour une nomenclature
  updateNomenclature(id: string, updates: Partial<Nomenclature>): Observable<Nomenclature> {
    return of({ id, ...updates, updatedAt: new Date() } as Nomenclature).pipe(delay(500));
  }

  // Supprimer une nomenclature
  deleteNomenclature(id: string): Observable<boolean> {
    return of(true).pipe(delay(300));
  }

  // Résoudre une alerte
  resolveAlert(id: string): Observable<boolean> {
    return of(true).pipe(delay(300));
  }

  // Exporter les données
  exportData(format: 'csv' | 'xlsx' | 'pdf'): Observable<string> {
    const filename = `admin-dashboard-export-${new Date().toISOString().split('T')[0]}.${format}`;
    return of(filename).pipe(delay(1000));
  }

  // Obtenir les statistiques des conventions
  getConventionsStats(): Observable<any> {
    const stats = {
      total: 89,
      active: 75,
      expired: 12,
      overdue: 2,
      byGovernorate: {
        'Tunis': 25,
        'Sfax': 20,
        'Sousse': 15,
        'Monastir': 12,
        'Gabès': 17
      }
    };

    return of(stats).pipe(delay(300));
  }

  // Obtenir les statistiques des factures
  getInvoicesStats(): Observable<any> {
    const stats = {
      total: 156,
      paid: 120,
      pending: 25,
      overdue: 11,
      totalAmount: 1250000,
      byMonth: {
        'Jan': 125000,
        'Feb': 135000,
        'Mar': 145000,
        'Apr': 155000,
        'May': 165000,
        'Jun': 175000
      }
    };

    return of(stats).pipe(delay(300));
  }

  // Obtenir les informations de la base de données
  getDatabaseInfo(): Observable<any> {
    const info = {
      size: '2.5 GB',
      tables: 24,
      connections: 15,
      uptime: '15 jours',
      lastBackup: new Date(Date.now() - 86400000),
      performance: 'Excellent'
    };

    return of(info).pipe(delay(300));
  }

  // Obtenir les logs récents
  getRecentLogs(): Observable<any[]> {
    const logs = [
      { id: '1', level: 'info', message: 'Système démarré avec succès', timestamp: new Date(Date.now() - 300000) },
      { id: '2', level: 'info', message: 'Sauvegarde automatique terminée', timestamp: new Date(Date.now() - 600000) },
      { id: '3', level: 'warning', message: 'Utilisation mémoire élevée', timestamp: new Date(Date.now() - 900000) },
      { id: '4', level: 'info', message: 'Nouvel utilisateur connecté', timestamp: new Date(Date.now() - 1200000) }
    ];

    return of(logs).pipe(delay(300));
  }
}
