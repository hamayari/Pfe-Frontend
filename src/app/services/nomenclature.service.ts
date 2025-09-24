import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Nomenclature {
  id: string;
  name: string;
  type: 'APPLICATION' | 'ZONE' | 'STRUCTURE';
  description: string;
  code?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NomenclatureService {
  private apiUrl = `${environment.apiUrl}/api/nomenclatures`;
  private nomenclaturesSubject = new BehaviorSubject<Nomenclature[]>([]);

  constructor(private http: HttpClient) {}

  // Récupérer toutes les nomenclatures
  getNomenclatures(): Observable<Nomenclature[]> {
    return this.http.get<Nomenclature[]>(this.apiUrl);
  }

  // Récupérer les nomenclatures par type
  getNomenclaturesByType(type: string): Observable<Nomenclature[]> {
    return this.http.get<Nomenclature[]>(`${this.apiUrl}/type/${type}`);
  }

  // Récupérer une nomenclature par ID
  getNomenclatureById(id: string): Observable<Nomenclature> {
    return this.http.get<Nomenclature>(`${this.apiUrl}/${id}`);
  }

  // Créer une nouvelle nomenclature
  createNomenclature(nomenclature: Partial<Nomenclature>): Observable<Nomenclature> {
    return this.http.post<Nomenclature>(this.apiUrl, nomenclature);
  }

  // Mettre à jour une nomenclature
  updateNomenclature(id: string, nomenclature: Partial<Nomenclature>): Observable<Nomenclature> {
    return this.http.put<Nomenclature>(`${this.apiUrl}/${id}`, nomenclature);
  }

  // Supprimer une nomenclature
  deleteNomenclature(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Méthodes pour les observables
  get nomenclatures$(): Observable<Nomenclature[]> {
    return this.nomenclaturesSubject.asObservable();
  }

  // Mettre à jour les données
  refreshNomenclatures(): void {
    this.getNomenclatures().subscribe(nomenclatures => {
      this.nomenclaturesSubject.next(nomenclatures);
    });
  }
}































