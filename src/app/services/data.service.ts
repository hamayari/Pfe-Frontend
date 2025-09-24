import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Governorate {
  id: number;
  name: string;
  code: string;
}

export interface Structure {
  id: number;
  libelle: string;
  code: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getAllGovernorates(): Observable<Governorate[]> {
    return this.http.get<Governorate[]>(`${this.apiUrl}/data/governorates`).pipe(
      catchError(this.handleError)
    );
  }

  getAllStructures(): Observable<Structure[]> {
    return this.http.get<Structure[]>(`${this.apiUrl}/data/structures`).pipe(
      catchError(this.handleError)
    );
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


























