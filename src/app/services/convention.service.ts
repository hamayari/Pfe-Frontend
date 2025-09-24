import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Convention as ConventionModel } from '../models/convention.model';

export interface Convention extends ConventionModel {}

export interface ConventionStats {
  total: number;
  active: number;
  expired: number;
  renewal: number;
  byGovernorate: { governorate: string; count: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class ConventionService {
  private apiUrl = `${environment.apiUrl}/api/conventions`;
  private conventionsSubject = new BehaviorSubject<Convention[]>([]);
  private statsSubject = new BehaviorSubject<ConventionStats | null>(null);

  constructor(private http: HttpClient) {}

  // Récupérer toutes les conventions
  getConventions(): Observable<Convention[]> {
    return this.http.get<Convention[]>(this.apiUrl);
  }

  // Alias pour getConventions (pour compatibilité)
  getAllConventions(): Observable<Convention[]> {
    return this.getConventions();
  }

  // Récupérer les conventions récentes
  getRecentConventions(limit: number = 5): Observable<Convention[]> {
    return this.http.get<Convention[]>(`${this.apiUrl}/recent?limit=${limit}`);
  }

  // Récupérer les statistiques des conventions
  getConventionStats(): Observable<ConventionStats> {
    return this.http.get<ConventionStats>(`${this.apiUrl}/stats`);
  }

  // Récupérer une convention par ID
  getConventionById(id: string): Observable<Convention> {
    return this.http.get<Convention>(`${this.apiUrl}/${id}`);
  }

  // Créer une nouvelle convention
  createConvention(convention: Partial<Convention>): Observable<Convention> {
    return this.http.post<Convention>(this.apiUrl, convention);
  }

  // Mettre à jour une convention
  updateConvention(id: string, convention: Partial<Convention>): Observable<Convention> {
    return this.http.put<Convention>(`${this.apiUrl}/${id}`, convention);
  }

  // Supprimer une convention
  deleteConvention(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Méthodes pour les observables
  get conventions$(): Observable<Convention[]> {
    return this.conventionsSubject.asObservable();
  }

  get stats$(): Observable<ConventionStats | null> {
    return this.statsSubject.asObservable();
  }

  // Mettre à jour les données
  refreshConventions(): void {
    this.getConventions().subscribe(conventions => {
      this.conventionsSubject.next(conventions);
    });
  }

  refreshStats(): void {
    this.getConventionStats().subscribe(stats => {
      this.statsSubject.next(stats);
    });
  }

  // Rafraîchir toutes les données
  refreshAllData(): void {
    this.refreshConventions();
    this.refreshStats();
  }
} 