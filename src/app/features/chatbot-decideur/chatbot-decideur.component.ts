import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChatbotService, ChatbotResponse } from '../../services/chatbot.service';

interface Message {
  type: 'user' | 'bot';
  text: string;
  kpi?: { [key: string]: any };
  graphique?: any;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot-decideur',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgxChartsModule
  ],
  templateUrl: './chatbot-decideur.component.html',
  styleUrls: ['./chatbot-decideur.component.scss']
})
export class ChatbotDecideurComponent implements OnInit {
  question: string = '';
  messages: Message[] = [];
  loading: boolean = false;
  
  // Questions prédéfinies pour l'aide à la décision
  suggestedQuestions: string[] = [
    // Analyse des conventions
    '📊 Combien de conventions sont actives ?',
    '⏰ Quelles conventions expirent dans les 30 prochains jours ?',
    '📍 Quelle est la répartition géographique des conventions ?',
    '💰 Quel est le montant total des conventions actives ?',
    
    // Analyse des factures
    '⚠️ Combien de factures sont en retard ?',
    '💵 Quel est le taux de paiement des factures ?',
    '📈 Quel est le chiffre d\'affaires total ?',
    '🔴 Quel montant est en retard de paiement ?',
    
    // Analyses comparatives
    '🏆 Quel gouvernorat génère le plus de revenus ?',
    '📊 Quelle est la performance globale ce mois-ci ?',
    '🎯 Quels sont les indicateurs clés de performance ?',
    '⚡ Y a-t-il des alertes importantes ?'
  ];

  // Configuration des graphiques
  view: [number, number] = [700, 400];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  colorScheme: any = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    console.log('🤖 Chatbot Décideur initialisé');
    this.addBotMessage('Bonjour ! Je suis votre assistant décisionnel. Posez-moi une question sur vos conventions et factures.');
  }

  /**
   * Envoie une question au chatbot
   */
  sendQuestion(): void {
    if (!this.question.trim()) {
      return;
    }

    const userQuestion = this.question.trim();
    console.log('📤 Envoi de la question:', userQuestion);

    // Ajouter le message de l'utilisateur
    this.addUserMessage(userQuestion);
    this.question = '';
    this.loading = true;

    // Appeler le service
    this.chatbotService.ask(userQuestion).subscribe({
      next: (response: ChatbotResponse) => {
        console.log('✅ Réponse reçue:', response);
        this.loading = false;
        this.addBotResponse(response);
        // Mettre à jour les questions suggérées en fonction du contexte
        this.updateSuggestedQuestions(userQuestion);
      },
      error: (error) => {
        console.error('❌ Erreur:', error);
        this.loading = false;
        this.addBotMessage('Désolé, une erreur s\'est produite. Veuillez réessayer.');
      }
    });
  }

  /**
   * Utilise une question suggérée
   */
  useSuggestedQuestion(question: string): void {
    this.question = question;
    this.sendQuestion();
  }

  /**
   * Met à jour les questions suggérées en fonction du contexte
   */
  private updateSuggestedQuestions(lastQuestion: string): void {
    // Questions de suivi contextuelles
    const followUpQuestions: { [key: string]: string[] } = {
      'convention': [
        '📊 Combien de conventions sont actives ?',
        '⏰ Quelles conventions expirent bientôt ?',
        '💰 Quel est le montant total des conventions ?',
        '📍 Quelle est la répartition géographique ?'
      ],
      'facture': [
        '⚠️ Combien de factures sont en retard ?',
        '💵 Quel est le taux de paiement ?',
        '📈 Quel est le chiffre d\'affaires total ?',
        '🔴 Quel montant est en retard ?'
      ],
      'gouvernorat': [
        '🏆 Quel gouvernorat génère le plus de revenus ?',
        '📊 Comparaison entre gouvernorats ?',
        '📍 Performance par région ?',
        '🎯 Top 3 des gouvernorats ?'
      ],
      'performance': [
        '📊 Quelle est la performance globale ?',
        '🎯 Quels sont les KPI principaux ?',
        '⚡ Y a-t-il des alertes ?',
        '📈 Tendances du mois ?'
      ]
    };

    // Déterminer le contexte de la dernière question
    const lowerQuestion = lastQuestion.toLowerCase();
    
    if (lowerQuestion.includes('convention')) {
      this.suggestedQuestions = followUpQuestions['convention'];
    } else if (lowerQuestion.includes('facture') || lowerQuestion.includes('paiement')) {
      this.suggestedQuestions = followUpQuestions['facture'];
    } else if (lowerQuestion.includes('gouvernorat') || lowerQuestion.includes('région')) {
      this.suggestedQuestions = followUpQuestions['gouvernorat'];
    } else if (lowerQuestion.includes('performance') || lowerQuestion.includes('kpi')) {
      this.suggestedQuestions = followUpQuestions['performance'];
    } else {
      // Questions générales par défaut
      this.suggestedQuestions = [
        '📊 Combien de conventions sont actives ?',
        '⚠️ Combien de factures sont en retard ?',
        '🏆 Quel gouvernorat génère le plus de revenus ?',
        '📈 Quelle est la performance globale ?'
      ];
    }
  }

  /**
   * Ajoute un message utilisateur
   */
  private addUserMessage(text: string): void {
    this.messages.push({
      type: 'user',
      text: text,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  /**
   * Ajoute un message bot simple
   */
  private addBotMessage(text: string): void {
    this.messages.push({
      type: 'bot',
      text: text,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  /**
   * Ajoute une réponse complète du bot
   */
  private addBotResponse(response: ChatbotResponse): void {
    const chartData = this.prepareChartData(response.graphique);
    
    this.messages.push({
      type: 'bot',
      text: response.texte,
      kpi: response.kpi,
      graphique: chartData,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  /**
   * Prépare les données pour ngx-charts
   */
  private prepareChartData(graphique: any): any {
    if (!graphique) {
      return null;
    }

    const data = graphique.labels.map((label: string, index: number) => ({
      name: label,
      value: graphique.values[index]
    }));

    return {
      type: graphique.type,
      data: data
    };
  }

  /**
   * Scroll vers le bas de la conversation
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }

  /**
   * Obtient les clés d'un objet (pour ngFor)
   */
  objectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }
}
