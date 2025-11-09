import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, timer } from 'rxjs';
import { catchError, retry, shareReplay, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ProjectManagerStats {
  totalConventions: number;
  expiredConventions: number;
  activeConventions: number;
  upcomingDeadlines: number;
  totalInvoices: number;
  totalInvoicesAmount: number;
  overdueInvoices: number;
  overduePercentage: number;
  paidInvoices: number;
  pendingInvoices: number;
  teamPerformance: number;
  regularizationRate: number;
  pendingAlerts: number;
}

export interface InternalComment {
  id?: string;
  author: string;
  content: string;
  date: Date;
  mentionedCommercialId?: string;
  mentionedCommercialName?: string;
}

export interface TeamMemberStats {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: string;
  lastActivity: Date;
  assignedConventions: number;
  activeConventions: number;
  expiredConventions: number;
  totalInvoices: number;
  overdueInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  paymentRate: number;
  performanceScore: number;
  currentTask?: string;
  currentTaskType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectManagerService {
  private apiUrl = `${environment.apiUrl}/pm-dashboard`;
  
  // Cache pour les données
  private statsCache$?: Observable<ProjectManagerStats>;
  private conventionsCache$?: Observable<any[]>;
  private invoicesCache$?: Observable<any[]>;
  private teamStatsCache$?: Observable<TeamMemberStats[]>;
  
  // Cache TTL (Time To Live) en millisecondes
  private readonly CACHE_TTL = 60000; // 1 minute
  
  // BehaviorSubject pour forcer le refresh
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Gestion des erreurs HTTP avec retry
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code: ${error.status}, Message: ${error.message}`;
    }
    
    console.error('❌ [ProjectManagerService]', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Forcer le refresh du cache
   */
  refreshCache(): void {
    this.statsCache$ = undefined;
    this.conventionsCache$ = undefined;
    this.invoicesCache$ = undefined;
    this.teamStatsCache$ = undefined;
    this.refreshTrigger$.next();
    console.log('🔄 Cache invalidé - Refresh forcé');
  }

  /**
   * Obtenir les statistiques complètes avec cache
   */
  getCompleteStats(): Observable<ProjectManagerStats> {
    if (!this.statsCache$) {
      this.statsCache$ = this.refreshTrigger$.pipe(
        switchMap(() => timer(0, this.CACHE_TTL)),
        switchMap(() => 
          this.http.get<ProjectManagerStats>(`${this.apiUrl}/stats`, {
            headers: this.getHeaders()
          }).pipe(
            retry(2), // Retry 2 fois en cas d'erreur
            catchError(this.handleError),
            tap(stats => console.log('✅ Stats chargées:', stats))
          )
        ),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.statsCache$;
  }

  /**
   * Obtenir toutes les conventions avec cache
   */
  getAllConventions(): Observable<any[]> {
    if (!this.conventionsCache$) {
      this.conventionsCache$ = this.http.get<any[]>(`${this.apiUrl}/conventions`, {
        headers: this.getHeaders()
      }).pipe(
        retry(2),
        catchError(this.handleError),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.conventionsCache$;
  }

  /**
   * Obtenir toutes les factures avec cache
   */
  getAllInvoices(): Observable<any[]> {
    if (!this.invoicesCache$) {
      this.invoicesCache$ = this.http.get<any[]>(`${this.apiUrl}/invoices`, {
        headers: this.getHeaders()
      }).pipe(
        retry(2),
        catchError(this.handleError),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.invoicesCache$;
  }

  /**
   * Obtenir les factures en retard
   */
  getOverdueInvoices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/invoices/overdue`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtenir les membres de l'équipe
   */
  getTeamMembers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/team`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtenir les statistiques détaillées de chaque membre de l'équipe avec cache
   */
  getTeamMembersStats(): Observable<TeamMemberStats[]> {
    if (!this.teamStatsCache$) {
      this.teamStatsCache$ = this.http.get<TeamMemberStats[]>(`${this.apiUrl}/team/stats`, {
        headers: this.getHeaders()
      }).pipe(
        retry(2),
        catchError(this.handleError),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.teamStatsCache$;
  }

  /**
   * Obtenir tous les commentaires internes
   */
  getAllComments(): Observable<InternalComment[]> {
    return this.http.get<InternalComment[]>(`${this.apiUrl}/comments`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Ajouter un commentaire interne
   */
  addComment(comment: InternalComment): Observable<InternalComment> {
    return this.http.post<InternalComment>(`${this.apiUrl}/comments`, comment, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtenir les conventions par statut
   */
  getConventionsByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conventions/status/${status}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtenir les factures par statut
   */
  getInvoicesByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/invoices/status/${status}`, {
      headers: this.getHeaders()
    });
  }
}
