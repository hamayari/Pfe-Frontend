import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatbotRequest {
  question: string;
}

export interface GraphiqueData {
  type: string;
  labels: string[];
  values: number[];
}

export interface TableauData {
  colonnes: string[];
  lignes: any[][];
}

export interface ChatbotResponse {
  texte: string;
  kpi: { [key: string]: any };
  graphique: GraphiqueData | null;
  tableau: TableauData | null;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'http://localhost:8085/api/decideur';

  constructor(private http: HttpClient) {}

  /**
   * Envoie une question au chatbot
   */
  ask(question: string): Observable<ChatbotResponse> {
    const headers = this.getAuthHeaders();
    const request: ChatbotRequest = { question };
    
    console.log('🤖 [CHATBOT SERVICE] Envoi de la question:', question);
    
    return this.http.post<ChatbotResponse>(`${this.apiUrl}/ask`, request, { headers });
  }

  /**
   * Vérifie la santé du service chatbot
   */
  health(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
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
}
