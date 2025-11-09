import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = `${environment.apiUrl || 'http://localhost:8085/api'}/permissions`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les permissions
   */
  getAllPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.apiUrl);
  }

  /**
   * Créer une nouvelle permission
   */
  createPermission(permission: Permission): Observable<Permission> {
    return this.http.post<Permission>(this.apiUrl, permission);
  }

  /**
   * Mettre à jour une permission
   */
  updatePermission(id: string, permission: Permission): Observable<Permission> {
    return this.http.put<Permission>(`${this.apiUrl}/${id}`, permission);
  }

  /**
   * Supprimer une permission
   */
  deletePermission(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Assigner une permission à un rôle
   */
  assignToRole(permissionId: string, roleId: string): Observable<Permission> {
    return this.http.post<Permission>(`${this.apiUrl}/${permissionId}/roles/${roleId}`, {});
  }

  /**
   * Retirer une permission d'un rôle
   */
  removeFromRole(permissionId: string, roleId: string): Observable<Permission> {
    return this.http.delete<Permission>(`${this.apiUrl}/${permissionId}/roles/${roleId}`);
  }
}
