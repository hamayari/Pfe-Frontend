import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  // URL du backend Spring Boot
  private readonly BACKEND_URL = 'http://localhost:8085/api/decideur/chat';

  constructor(private http: HttpClient) {}

  /**
   * Envoyer une question au chatbot via le backend Spring Boot
   * Le backend s'occupe d'appeler Gemini et de récupérer les données MongoDB
   */
  sendMessage(userMessage: string, dashboardData: any): Observable<string> {
    console.log('📤 Envoi du message au backend:', userMessage);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const requestBody = {
      message: userMessage
    };

    return this.http.post<any>(this.BACKEND_URL, requestBody, { headers }).pipe(
      map(response => {
        console.log('✅ Réponse reçue du backend:', response);
        if (response && response.response) {
          return response.response;
        }
        return "Désolé, je n'ai pas pu générer une réponse.";
      }),
      catchError(error => {
        console.error('❌ Erreur backend:', error);
        
        // Erreur de connexion au backend
        if (error.status === 0) {
          return throwError(() => new Error('❌ **Erreur de connexion au backend**\n\nImpossible de se connecter au serveur Spring Boot.\n\n💡 Vérifiez que le backend est démarré sur http://localhost:8085'));
        }
        
        // Erreur 401/403 - Authentification
        if (error.status === 401 || error.status === 403) {
          return throwError(() => new Error('❌ **Erreur d\'authentification**\n\nVous n\'êtes pas autorisé à utiliser le chatbot.\n\n💡 Reconnectez-vous.'));
        }
        
        // Erreur 500 - Erreur serveur
        if (error.status === 500) {
          return throwError(() => new Error('❌ **Erreur serveur**\n\nUne erreur s\'est produite sur le serveur.\n\n💡 Consultez les logs du backend.'));
        }
        
        // Erreur générique
        return throwError(() => new Error(` **Erreur** (${error.status})\n\n${error.error?.message || error.message}`));
      })
    );
  }

  /**
   * Construire le contexte avec les données du dashboard
   */
  private buildContext(data: any): string {
    if (!data) {
      return "Tu es un assistant IA pour un dashboard de gestion de conventions et factures.";
    }

    return `Tu es un assistant IA décisionnel pour un système de gestion de conventions et factures.

DONNÉES ACTUELLES DU DASHBOARD :

 CONVENTIONS :
- Total de conventions : ${data.totalConventions || 'N/A'}
- Conventions actives : ${data.activeConventions || 'N/A'}
- Conventions expirées : ${data.expiredConventions || 'N/A'}
- Taux d'activation : ${data.activationRate || 'N/A'}%

 CHIFFRE D'AFFAIRES :
- CA total : ${data.totalRevenue || 'N/A'} TND
- CA moyen par convention : ${data.averageRevenue || 'N/A'} TND
- Évolution mensuelle : ${data.revenueGrowth || 'N/A'}%

 FACTURES :
- Total de factures : ${data.totalInvoices || 'N/A'}
- Factures payées : ${data.paidInvoices || 'N/A'}
- Factures en attente : ${data.pendingInvoices || 'N/A'}
- Factures en retard : ${data.overdueInvoices || 'N/A'}
- Taux de paiement : ${data.paymentRate || 'N/A'}%
- Montant en retard : ${data.overdueAmount || 'N/A'} TND

 RÉPARTITION GÉOGRAPHIQUE :
${data.geographicData ? this.formatGeographicData(data.geographicData) : '- Données non disponibles'}

 TOP STRUCTURES :
${data.topStructures ? this.formatTopStructures(data.topStructures) : '- Données non disponibles'}

 ALERTES :
${data.alerts ? this.formatAlerts(data.alerts) : '- Aucune alerte'}

Utilise ces données pour répondre aux questions de manière précise et professionnelle.`;
  }

  private formatGeographicData(data: any[]): string {
    if (!data || data.length === 0) return '- Aucune donnée';
    return data.slice(0, 5).map((item, index) => 
      `${index + 1}. ${item.name} : ${item.value} conventions (${item.percentage}%)`
    ).join('\n');
  }

  private formatTopStructures(data: any[]): string {
    if (!data || data.length === 0) return '- Aucune donnée';
    return data.slice(0, 5).map((item, index) => 
      `${index + 1}. ${item.name} : ${item.revenue} TND`
    ).join('\n');
  }

  private formatAlerts(alerts: any[]): string {
    if (!alerts || alerts.length === 0) return '- Aucune alerte';
    return alerts.map(alert => 
      `${alert.icon} ${alert.title}`
    ).join('\n');
  }

  /**
   * Vérifier si le backend est configuré
   */
  isApiKeyConfigured(): boolean {
    return true; // Le backend gère le backend Spring Boot
  }
}
