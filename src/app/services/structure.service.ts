import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SimpleAuthService } from './simple-auth.service';

export interface Structure {
  id: string;
  code: string;
  libelle: string;
  description: string;
  typeStructure: string;
  adresse: string;
  zoneGeographiqueId: string;
  gouvernement?: string; // Nouveau champ gouvernement
  governorate?: string; // Pour l'affichage frontend
  contactPerson?: string; // Pour l'affichage frontend
  phone?: string; // Pour l'affichage frontend
  email?: string; // Pour l'affichage frontend
  actif: boolean;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: Date;
  lastModifiedAt?: Date;
}

export interface StructureFormData {
  code: string;
  libelle: string;
  description: string;
  typeStructure: string;
  adresse: string;
  gouvernement?: string;
  actif: boolean;
  createdBy?: string;
  lastModifiedBy?: string;
}

export interface Governorate {
  id: string;
  name: string;
  code?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StructureService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: SimpleAuthService) {}

  // CRUD Structures
  getAllStructures(): Observable<Structure[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Structure[]>(`${this.apiUrl}/structures`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getStructureById(id: string): Observable<Structure> {
    return this.http.get<Structure>(`${this.apiUrl}/structures/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createStructure(structure: StructureFormData): Observable<Structure> {
    const headers = this.getAuthHeaders();
    return this.http.post<Structure>(`${this.apiUrl}/structures`, structure, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateStructure(id: string, structure: StructureFormData): Observable<Structure> {
    return this.http.put<Structure>(`${this.apiUrl}/structures/${id}`, structure).pipe(
      catchError(this.handleError)
    );
  }

  deleteStructure(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/structures/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // API Gouvernorats
  getAllGovernorates(): Observable<Governorate[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Governorate[]>(`${this.apiUrl}/governorates`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Types de structures prédéfinis
  getStructureTypes(): string[] {
    return [
      'ENTREPRISE',
      'ORGANISATION',
      'MINISTERE',
      'ASSOCIATION',
      'ETABLISSEMENT_PUBLIC',
      'COLLECTIVITE_LOCALE',
      'ONG',
      'COOPERATIVE'
    ];
  }

  // Utilitaires
  getStructureTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'ENTREPRISE': 'Entreprise',
      'ORGANISATION': 'Organisation',
      'MINISTERE': 'Ministère',
      'ASSOCIATION': 'Association',
      'ETABLISSEMENT_PUBLIC': 'Établissement Public',
      'COLLECTIVITE_LOCALE': 'Collectivité Locale',
      'ONG': 'ONG',
      'COOPERATIVE': 'Coopérative'
    };
    return labels[type] || type;
  }

  getStructureStatusLabel(actif: boolean): string {
    return actif ? 'Actif' : 'Inactif';
  }

  getStructureStatusColor(actif: boolean): string {
    return actif ? 'status-active' : 'status-inactive';
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('Structure Service Error:', error);
    let errorMessage = 'Une erreur est survenue lors de l\'opération sur les structures';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 404) {
      errorMessage = 'Structure non trouvée';
    } else if (error.status === 400) {
      errorMessage = 'Données invalides';
    } else if (error.status === 401) {
      errorMessage = 'Non autorisé - Vérifiez vos permissions';
    } else if (error.status === 403) {
      errorMessage = 'Accès interdit';
    } else if (error.status === 500) {
      errorMessage = 'Erreur serveur interne';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
