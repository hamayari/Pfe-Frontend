import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Convention, ConventionFilter, ConventionFormData } from '../models/convention.model';
import { environment } from '../../../environments/environment';

export interface ConventionListResponse {
  data: Convention[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConventionService {
  private apiUrl = `${environment.apiUrl}/conventions`;
  
  constructor(private http: HttpClient) { }

  getConventions(filter?: ConventionFilter): Observable<ConventionListResponse> {
    const params = this.createQueryParams(filter);
    return this.http.get<ConventionListResponse>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getConvention(id: string): Observable<Convention> {
    return this.http.get<Convention>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createConvention(convention: ConventionFormData): Observable<Convention> {
    return this.http.post<Convention>(this.apiUrl, convention).pipe(
      catchError(this.handleError)
    );
  }

  updateConvention(id: string, convention: ConventionFormData): Observable<Convention> {
    return this.http.put<Convention>(`${this.apiUrl}/${id}`, convention).pipe(
      catchError(this.handleError)
    );
  }

  deleteConvention(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Helper to create query parameters from filters
   */
  private createQueryParams(filter?: ConventionFilter): HttpParams {
    let params = new HttpParams();
    
    if (!filter) return params;
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    
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