import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ActionRequest {
  action: string;
  parameters: { [key: string]: any };
}

export interface ActionResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotActionService {
  private apiUrl = `${environment.apiUrl}/decideur`;

  constructor(private http: HttpClient) {}

  /**
   * Exécute une action opérationnelle
   */
  executeAction(action: string, parameters: { [key: string]: any }): Observable<ActionResponse> {
    const headers = this.getAuthHeaders();
    const request: ActionRequest = { action, parameters };
    
    console.log('⚙️ [ACTION SERVICE] Exécution de l\'action:', action);
    console.log('📊 [ACTION SERVICE] Paramètres:', parameters);
    
    return this.http.post<ActionResponse>(`${this.apiUrl}/action`, request, { headers });
  }

  /**
   * Envoie un prompt pour exécuter une action CRUD en langage naturel
   */
  sendPrompt(prompt: string): Observable<any> {
    const headers = this.getAuthHeaders();
    
    console.log('💬 [PROMPT SERVICE] Envoi du prompt:', prompt);
    
    return this.http.post<any>(`${this.apiUrl}/prompt`, { question: prompt }, { headers });
  }

  /**
   * Récupère les headers d'authentification
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Détecte l'intention dans un message utilisateur avec extraction d'entités
   */
  detectIntent(message: string): { intent: string; entities: any } | null {
    const messageLower = message.toLowerCase();

    // Créer une convention
    if (this.matchesPattern(messageLower, ['créer', 'creer', 'nouvelle', 'ajouter', 'nouveau'])) {
      if (this.matchesPattern(messageLower, ['convention', 'contrat'])) {
        return { intent: 'create_convention', entities: this.extractConventionEntities(message) };
      }
      if (this.matchesPattern(messageLower, ['facture', 'invoice'])) {
        return { intent: 'create_facture', entities: this.extractInvoiceEntities(message) };
      }
    }

    // Rappel / Notification
    if (this.matchesPattern(messageLower, ['rappel', 'reminder', 'rappeler', 'notifier'])) {
      return { intent: 'send_reminder', entities: this.extractReminderEntities(message) };
    }

    // Envoyer notification
    if (this.matchesPattern(messageLower, ['envoyer', 'notification', 'notif', 'alerter'])) {
      return { intent: 'send_notification', entities: this.extractNotificationEntities(message) };
    }

    // Factures non payées
    if (this.matchesPattern(messageLower, ['facture', 'invoice']) && 
        this.matchesPattern(messageLower, ['non payée', 'impayée', 'unpaid', 'en retard', 'overdue'])) {
      return { intent: 'get_unpaid_invoices', entities: {} };
    }

    // Lister/Consulter factures
    if (this.matchesPattern(messageLower, ['liste', 'montre', 'affiche', 'voir', 'consulter']) &&
        this.matchesPattern(messageLower, ['facture', 'invoice'])) {
      return { intent: 'get_unpaid_invoices', entities: {} };
    }

    // Marquer comme payée
    if (this.matchesPattern(messageLower, ['marquer', 'valider', 'confirmer']) && 
        this.matchesPattern(messageLower, ['payée', 'payé', 'paid'])) {
      return { intent: 'mark_as_paid', entities: this.extractPaymentEntities(message) };
    }

    // Statistiques / KPI (rediriger vers chatbot analytique)
    if (this.matchesPattern(messageLower, ['statistique', 'kpi', 'analyse', 'rapport', 'performance'])) {
      return { intent: 'show_analytics', entities: {} };
    }

    return null;
  }

  /**
   * Vérifie si le message contient au moins un des patterns
   */
  private matchesPattern(message: string, patterns: string[]): boolean {
    return patterns.some(pattern => message.includes(pattern));
  }

  /**
   * Extrait les entités pour créer une convention
   */
  private extractConventionEntities(message: string): any {
    // Extraction basique - à améliorer avec NLP
    return {
      // Les valeurs seront saisies via un formulaire
    };
  }

  /**
   * Extrait les entités pour créer une facture
   */
  private extractInvoiceEntities(message: string): any {
    return {};
  }

  /**
   * Extrait les entités pour un rappel
   */
  private extractReminderEntities(message: string): any {
    // Chercher un nombre de jours
    const daysMatch = message.match(/(\d+)\s*(jour|day)/i);
    
    // Chercher un ID de convention (format CONV-XXX ou C-XXX)
    const conventionIdMatch = message.match(/(CONV-\d+|C-\d+)/i);
    
    return {
      daysBeforeExpiry: daysMatch ? parseInt(daysMatch[1]) : 3,
      conventionId: conventionIdMatch ? conventionIdMatch[1] : null
    };
  }

  /**
   * Extrait les entités pour une notification
   */
  private extractNotificationEntities(message: string): any {
    // Extraction basique d'informations
    return {
      // Les détails seront saisis via formulaire
    };
  }

  /**
   * Extrait les entités pour marquer comme payée
   */
  private extractPaymentEntities(message: string): any {
    // Chercher un ID de facture (format INV-XXX ou F-XXX)
    const invoiceIdMatch = message.match(/(INV-\d+|F-\d+)/i);
    
    return {
      invoiceId: invoiceIdMatch ? invoiceIdMatch[1] : null
    };
  }
}
