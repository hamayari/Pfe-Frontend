import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SimpleAuthService } from './simple-auth.service';
import { Application } from '../models/application.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = 'http://localhost:8085/api/applications';

  constructor(
    private http: HttpClient,
    private authService: SimpleAuthService
  ) {}

  getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Récupérer toutes les applications
  getAllApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  // Récupérer une application par ID
  getApplicationById(id: string): Observable<Application> {
    return this.http.get<Application>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Créer une nouvelle application
  createApplication(application: Partial<Application>): Observable<Application> {
    return this.http.post<Application>(this.apiUrl, application, { headers: this.getAuthHeaders() });
  }

  // Mettre à jour une application
  updateApplication(id: string, application: Partial<Application>): Observable<Application> {
    return this.http.put<Application>(`${this.apiUrl}/${id}`, application, { headers: this.getAuthHeaders() });
  }

  // Supprimer une application
  deleteApplication(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Désactiver une application
  deactivateApplication(id: string): Observable<Application> {
    return this.http.put<Application>(`${this.apiUrl}/${id}/deactivate`, {}, { headers: this.getAuthHeaders() });
  }

  // Utilitaires
  getApplicationTypeLabel(type: string): string {
    return type || 'Non spécifié';
  }

  getTechnologyLabel(technology: string): string {
    return technology || 'Non spécifié';
  }

  getEnvironmentLabel(environment: string): string {
    return environment || 'Non spécifié';
  }

  getStatusLabel(status: string): string {
    return status || 'Non spécifié';
  }
}
