import { Injectable } from '@angular/core';

export interface Entity {
  type: string;
  value: any;
  raw: string;
}

export interface NLPResult {
  intent: string;
  entities: Entity[];
  confidence: number;
  context?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NlpAdvancedService {
  private conversationContext: Map<string, any> = new Map();
  
  // Dictionnaire de synonymes
  private synonyms: { [key: string]: string[] } = {
    'créer': ['creer', 'ajouter', 'nouveau', 'nouvelle', 'faire', 'générer', 'établir'],
    'convention': ['contrat', 'accord', 'engagement', 'partenariat'],
    'facture': ['invoice', 'note', 'reçu', 'paiement'],
    'rappel': ['reminder', 'notification', 'alerte', 'notifier', 'rappeler'],
    'montrer': ['montre', 'affiche', 'voir', 'consulter', 'liste', 'lister', 'afficher'],
    'payé': ['payée', 'paid', 'réglé', 'réglée', 'soldé', 'soldée'],
    'impayé': ['impayée', 'unpaid', 'non payé', 'non payée', 'en retard', 'overdue'],
    'envoyer': ['send', 'transmettre', 'expédier', 'adresser']
  };

  constructor() {}

  /**
   * Analyse avancée du message avec NLP
   */
  analyzeMessage(message: string): NLPResult {
    const normalizedMessage = this.normalizeMessage(message);
    
    // Extraire les entités
    const entities = this.extractEntities(normalizedMessage);
    
    // Détecter l'intention
    const intent = this.detectAdvancedIntent(normalizedMessage, entities);
    
    // Calculer la confiance
    const confidence = this.calculateConfidence(normalizedMessage, intent, entities);
    
    // Récupérer le contexte
    const context = this.getContext();
    
    return {
      intent,
      entities,
      confidence,
      context
    };
  }

  /**
   * Normalise le message (synonymes, minuscules, etc.)
   */
  private normalizeMessage(message: string): string {
    let normalized = message.toLowerCase().trim();
    
    // Remplacer les synonymes par le terme principal
    for (const [main, syns] of Object.entries(this.synonyms)) {
      for (const syn of syns) {
        const regex = new RegExp(`\\b${syn}\\b`, 'gi');
        normalized = normalized.replace(regex, main);
      }
    }
    
    return normalized;
  }

  /**
   * Extrait les entités du message
   */
  private extractEntities(message: string): Entity[] {
    const entities: Entity[] = [];
    
    // 1. Extraire les IDs de convention (CONV-XXX, C-XXX)
    const conventionMatch = message.match(/\b(CONV-\d+|C-\d+)\b/i);
    if (conventionMatch) {
      entities.push({
        type: 'convention_id',
        value: conventionMatch[1].toUpperCase(),
        raw: conventionMatch[0]
      });
    }
    
    // 2. Extraire les IDs de facture (INV-XXX, F-XXX, FACT-XXX)
    const invoiceMatch = message.match(/\b(INV-\d+|F-\d+|FACT-\d+)\b/i);
    if (invoiceMatch) {
      entities.push({
        type: 'invoice_id',
        value: invoiceMatch[1].toUpperCase(),
        raw: invoiceMatch[0]
      });
    }
    
    // 3. Extraire les dates relatives
    const dateEntity = this.extractRelativeDate(message);
    if (dateEntity) {
      entities.push(dateEntity);
    }
    
    // 4. Extraire les montants
    const amountEntity = this.extractAmount(message);
    if (amountEntity) {
      entities.push(amountEntity);
    }
    
    // 5. Extraire les nombres de jours
    const daysMatch = message.match(/(\d+)\s*(jour|jours|day|days)/i);
    if (daysMatch) {
      entities.push({
        type: 'days',
        value: parseInt(daysMatch[1]),
        raw: daysMatch[0]
      });
    }
    
    // 6. Extraire les noms (structures, clients)
    const nameEntity = this.extractNames(message);
    if (nameEntity) {
      entities.push(nameEntity);
    }
    
    return entities;
  }

  /**
   * Extrait les dates relatives (demain, la semaine prochaine, etc.)
   */
  private extractRelativeDate(message: string): Entity | null {
    const today = new Date();
    let targetDate: Date | null = null;
    let raw = '';
    
    if (message.includes('demain')) {
      targetDate = new Date(today);
      targetDate.setDate(today.getDate() + 1);
      raw = 'demain';
    } else if (message.includes('après-demain') || message.includes('apres-demain')) {
      targetDate = new Date(today);
      targetDate.setDate(today.getDate() + 2);
      raw = 'après-demain';
    } else if (message.includes('semaine prochaine')) {
      targetDate = new Date(today);
      targetDate.setDate(today.getDate() + 7);
      raw = 'semaine prochaine';
    } else if (message.includes('mois prochain')) {
      targetDate = new Date(today);
      targetDate.setMonth(today.getMonth() + 1);
      raw = 'mois prochain';
    } else if (message.match(/dans (\d+) jour/)) {
      const match = message.match(/dans (\d+) jour/);
      if (match) {
        const days = parseInt(match[1]);
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() + days);
        raw = match[0];
      }
    }
    
    if (targetDate) {
      return {
        type: 'date',
        value: targetDate.toISOString().split('T')[0],
        raw
      };
    }
    
    return null;
  }

  /**
   * Extrait les montants (5000, 5K, cinq mille, etc.)
   */
  private extractAmount(message: string): Entity | null {
    // Montants numériques
    const numMatch = message.match(/(\d+(?:[.,]\d+)?)\s*(dt|dinars?|euros?|€|\$)?/i);
    if (numMatch) {
      return {
        type: 'amount',
        value: parseFloat(numMatch[1].replace(',', '.')),
        raw: numMatch[0]
      };
    }
    
    // Montants avec K (5K = 5000)
    const kMatch = message.match(/(\d+)k/i);
    if (kMatch) {
      return {
        type: 'amount',
        value: parseInt(kMatch[1]) * 1000,
        raw: kMatch[0]
      };
    }
    
    return null;
  }

  /**
   * Extrait les noms (structures, clients)
   */
  private extractNames(message: string): Entity | null {
    // Chercher "pour [nom]" ou "de [nom]"
    const nameMatch = message.match(/(?:pour|de|client|structure)\s+([A-Z][a-zA-Z\s]+)/);
    if (nameMatch) {
      return {
        type: 'name',
        value: nameMatch[1].trim(),
        raw: nameMatch[0]
      };
    }
    
    return null;
  }

  /**
   * Détecte l'intention avec contexte
   */
  private detectAdvancedIntent(message: string, entities: Entity[]): string {
    // Créer
    if (this.containsWords(message, ['créer', 'ajouter', 'nouveau'])) {
      if (this.containsWords(message, ['convention', 'contrat'])) {
        return 'create_convention';
      }
      if (this.containsWords(message, ['facture', 'invoice'])) {
        return 'create_facture';
      }
    }
    
    // Rappel
    if (this.containsWords(message, ['rappel', 'reminder', 'notifier'])) {
      return 'send_reminder';
    }
    
    // Notification
    if (this.containsWords(message, ['envoyer', 'notification'])) {
      return 'send_notification';
    }
    
    // Consulter factures
    if (this.containsWords(message, ['montrer', 'affiche', 'voir', 'liste']) &&
        this.containsWords(message, ['facture', 'invoice'])) {
      if (this.containsWords(message, ['impayé', 'non payé', 'retard'])) {
        return 'get_unpaid_invoices';
      }
      return 'get_all_invoices';
    }
    
    // Marquer comme payée
    if (this.containsWords(message, ['marquer', 'valider']) &&
        this.containsWords(message, ['payé', 'paid'])) {
      return 'mark_as_paid';
    }
    
    // Statistiques
    if (this.containsWords(message, ['statistique', 'kpi', 'analyse', 'rapport'])) {
      return 'show_analytics';
    }
    
    return 'unknown';
  }

  /**
   * Vérifie si le message contient au moins un des mots
   */
  private containsWords(message: string, words: string[]): boolean {
    return words.some(word => message.includes(word));
  }

  /**
   * Calcule la confiance de la détection
   */
  private calculateConfidence(message: string, intent: string, entities: Entity[]): number {
    let confidence = 0.5; // Base
    
    // Augmenter si l'intention est claire
    if (intent !== 'unknown') {
      confidence += 0.2;
    }
    
    // Augmenter selon le nombre d'entités trouvées
    confidence += entities.length * 0.1;
    
    // Augmenter si le message est clair et court
    if (message.split(' ').length < 10) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Sauvegarde le contexte de la conversation
   */
  saveContext(key: string, value: any): void {
    this.conversationContext.set(key, value);
  }

  /**
   * Récupère le contexte
   */
  getContext(): any {
    return Object.fromEntries(this.conversationContext);
  }

  /**
   * Efface le contexte
   */
  clearContext(): void {
    this.conversationContext.clear();
  }
}
