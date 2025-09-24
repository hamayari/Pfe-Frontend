import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Nomenclature, NomenclatureType, NomenclatureFilter, NomenclatureListResponse } from '../models/nomenclature.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NomenclatureService {
  private apiUrl = `${environment.apiUrl}/nomenclatures`;
  
  constructor(private http: HttpClient) { }

  getNomenclatures(filter?: NomenclatureType | NomenclatureFilter): Observable<NomenclatureListResponse> {
    const params = this.createQueryParams(filter);
    return this.http.get<NomenclatureListResponse>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getNomenclature(id: string): Observable<Nomenclature> {
    return this.http.get<Nomenclature>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createNomenclature(nomenclature: Partial<Nomenclature>): Observable<Nomenclature> {
    return this.http.post<Nomenclature>(this.apiUrl, nomenclature).pipe(
      catchError(this.handleError)
    );
  }

  updateNomenclature(id: string, nomenclature: Partial<Nomenclature>): Observable<Nomenclature> {
    return this.http.put<Nomenclature>(`${this.apiUrl}/${id}`, nomenclature).pipe(
      catchError(this.handleError)
    );
  }

  deleteNomenclature(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getNomenclatureById(id: string): Observable<Nomenclature> {
    return this.http.get<Nomenclature>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  toggleStatus(id: string, isActive: boolean): Observable<Nomenclature> {
    return this.http.patch<Nomenclature>(`${this.apiUrl}/${id}/status`, { isActive }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Helper to create query parameters from filters
   */
  private createQueryParams(filter?: NomenclatureType | NomenclatureFilter): HttpParams {
    let params = new HttpParams();
    
    if (!filter) return params;
    
    if (typeof filter === 'string') {
      // If filter is a NomenclatureType
      params = params.set('type', filter);
    } else {
      // If filter is a NomenclatureFilter object
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }
    
    return params;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}