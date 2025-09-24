import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SimpleAuthService } from './simple-auth.service';
import { ZoneGeographique } from '../models/zone-geographique.model';

@Injectable({
  providedIn: 'root'
})
export class ZoneGeographiqueService {
  private apiUrl = 'http://localhost:8085/api/zones-geographiques';

  constructor(
    private http: HttpClient,
    private authService: SimpleAuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Récupérer toutes les zones géographiques
  getAllZonesGeographiques(): Observable<ZoneGeographique[]> {
    return this.http.get<ZoneGeographique[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  // Récupérer une zone géographique par ID
  getZoneGeographiqueById(id: string): Observable<ZoneGeographique> {
    return this.http.get<ZoneGeographique>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Créer une nouvelle zone géographique
  createZoneGeographique(zone: Partial<ZoneGeographique>): Observable<ZoneGeographique> {
    return this.http.post<ZoneGeographique>(this.apiUrl, zone, { headers: this.getAuthHeaders() });
  }

  // Mettre à jour une zone géographique
  updateZoneGeographique(id: string, zone: Partial<ZoneGeographique>): Observable<ZoneGeographique> {
    return this.http.put<ZoneGeographique>(`${this.apiUrl}/${id}`, zone, { headers: this.getAuthHeaders() });
  }

  // Supprimer une zone géographique
  deleteZoneGeographique(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Désactiver une zone géographique
  deactivateZoneGeographique(id: string): Observable<ZoneGeographique> {
    return this.http.put<ZoneGeographique>(`${this.apiUrl}/${id}/deactivate`, {}, { headers: this.getAuthHeaders() });
  }

  // Récupérer les zones par gouvernorat
  getZonesByGovernorate(governorate: string): Observable<ZoneGeographique[]> {
    return this.http.get<ZoneGeographique[]>(`${this.apiUrl}/by-governorate/${governorate}`, { headers: this.getAuthHeaders() });
  }

  // Utilitaires
  getGovernorateLabel(governorate: string): string {
    const governorates: { [key: string]: string } = {
      'TUNIS': 'Tunis',
      'SFAX': 'Sfax',
      'SOUSSE': 'Sousse',
      'MONASTIR': 'Monastir',
      'GABES': 'Gabès',
      'GAFSA': 'Gafsa',
      'BEN_AROUS': 'Ben Arous',
      'NABEUL': 'Nabeul',
      'HAMMAMET': 'Hammamet',
      'MAHDIA': 'Mahdia',
      'KAIROUAN': 'Kairouan',
      'BIZERTE': 'Bizerte',
      'SIDI_BOUZID': 'Sidi Bouzid',
      'KASSERINE': 'Kasserine',
      'SILIANA': 'Siliana',
      'BEJA': 'Béja',
      'JENDOUBA': 'Jendouba',
      'KEF': 'Le Kef',
      'MANOUBA': 'Manouba',
      'MEDENINE': 'Médenine',
      'TATAOUINE': 'Tataouine',
      'TOZEUR': 'Tozeur',
      'KEBILI': 'Kébili'
    };
    return governorates[governorate] || governorate;
  }

  getFullAddress(zone: ZoneGeographique): string {
    const parts = [];
    if (zone.gouvernement) parts.push(zone.gouvernement);
    return parts.join(', ');
  }

  formatPopulation(population: string): string {
    return population || 'Non renseigné';
  }

  formatSuperficie(superficie: string): string {
    return superficie || 'Non renseigné';
  }
}
