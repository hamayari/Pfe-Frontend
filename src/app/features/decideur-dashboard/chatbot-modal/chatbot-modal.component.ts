import { Component, Inject, OnInit, Optional, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChatbotService, ChatbotResponse } from '../../../services/chatbot.service';
import { ChatbotActionService } from '../../../services/chatbot-action.service';
import { ActionButtonsComponent, ActionButton } from './action-buttons/action-buttons.component';
import { ActionFormComponent } from './action-form/action-form.component';

interface Message {
  type: 'user' | 'bot' | 'action';
  text: string;
  kpi?: { [key: string]: any };
  graphique?: any;
  tableau?: { colonnes: string[]; lignes: any[][] } | null;
  actionButtons?: ActionButton[];
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatProgressSpinnerModule,
    NgxChartsModule,
    ActionButtonsComponent,
    ActionFormComponent
  ],
  templateUrl: './chatbot-modal.component.html',
  styleUrls: ['./chatbot-modal.component.scss']
})
export class ChatbotModalComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages') private chatMessagesContainer?: ElementRef;
  
  question: string = '';
  messages: Message[] = [];
  loading: boolean = false;
  isModal: boolean = false;
  private shouldScrollToBottom = false;
  
  // Gestion des actions
  showActionForm: boolean = false;
  currentAction: string = '';
  actionFormData: any = {};
  
  // Questions suggérées contextuelles
  suggestedQuestions: string[] = [
    '📊 Combien de conventions sont actives ?',
    '⚠️ Combien de factures sont en retard ?',
    '🏆 Quel gouvernorat génère le plus de revenus ?',
    '📈 Quelle est la performance globale ?'
  ];

  // Configuration des graphiques (taille responsive)
  view: [number, number] = [750, 400];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  colorScheme: any = {
    domain: ['#6a11cb', '#2575fc', '#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  constructor(
    @Optional() public dialogRef: MatDialogRef<ChatbotModalComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private chatbotService: ChatbotService,
    private actionService: ChatbotActionService
  ) {
    // Déterminer si on est en modal ou en page
    // Si dialogRef existe, c'est un vrai modal
    // Si data?.isModal est défini, on utilise cette valeur
    // Sinon, on considère qu'on est dans le panel (pas de header)
    this.isModal = this.dialogRef !== null || data?.isModal || false;
    console.log('🤖 Chatbot initialisé - Mode:', this.isModal ? 'Modal' : 'Panel/Page');
  }

  ngOnInit(): void {
    console.log('🤖 Chatbot Modal initialisé', { isModal: this.isModal });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.chatMessagesContainer) {
        const element = this.chatMessagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
        console.log('📜 Scroll vers le bas:', element.scrollHeight);
      }
    } catch (err) {
      console.error('Erreur lors du scroll:', err);
    }
  }

  private forceScrollToBottom(): void {
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
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

    this.addUserMessage(userQuestion);
    this.question = '';
    this.loading = true;

    this.chatbotService.ask(userQuestion).subscribe({
      next: (response: ChatbotResponse) => {
        console.log('✅ Réponse reçue:', response);
        this.loading = false;
        this.addBotResponse(response);
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
      this.suggestedQuestions = [
        '📊 Combien de conventions sont actives ?',
        '⚠️ Combien de factures sont en retard ?',
        '🏆 Quel gouvernorat génère le plus de revenus ?',
        '📈 Quelle est la performance globale ?'
      ];
    }
  }

  private addUserMessage(text: string): void {
    this.messages.push({
      type: 'user',
      text,
      timestamp: new Date()
    });
    console.log('👤 Message utilisateur ajouté. Total messages:', this.messages.length);
    this.forceScrollToBottom();
  }

  private addBotMessage(text: string): void {
    this.messages.push({
      type: 'bot',
      text,
      timestamp: new Date()
    });
  }

  private addBotResponse(response: ChatbotResponse): void {
    this.messages.push({
      type: 'bot',
      text: response.texte,
      kpi: response.kpi,
      graphique: response.graphique,
      tableau: response.tableau,
      timestamp: new Date()
    });
    console.log('🤖 Réponse bot ajoutée. Total messages:', this.messages.length);
    console.log('📊 Messages actuels:', this.messages);
    this.forceScrollToBottom();
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  close(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}