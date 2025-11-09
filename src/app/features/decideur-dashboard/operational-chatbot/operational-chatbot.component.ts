import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChatbotActionService } from '../../../services/chatbot-action.service';
import { NlpAdvancedService } from '../../../services/nlp-advanced.service';
import { ProactiveNotificationsService } from '../../../services/proactive-notifications.service';
import { ActionButtonsComponent, ActionButton } from '../chatbot-modal/action-buttons/action-buttons.component';
import { ActionFormComponent } from '../chatbot-modal/action-form/action-form.component';
import { Nl2brPipe } from '../../../pipes/nl2br.pipe';

interface OperationalMessage {
  type: 'user' | 'bot' | 'action' | 'success' | 'error';
  text: string;
  actionButtons?: ActionButton[];
  data?: any;
  timestamp: Date;
}

@Component({
  selector: 'app-operational-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatProgressSpinnerModule,
    ActionButtonsComponent,
    ActionFormComponent,
    Nl2brPipe
  ],
  templateUrl: './operational-chatbot.component.html',
  styleUrls: ['./operational-chatbot.component.scss']
})
export class OperationalChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages') private chatMessagesContainer?: ElementRef;

  userMessage: string = '';
  messages: OperationalMessage[] = [];
  loading: boolean = false;
  showActionForm: boolean = false;
  currentAction: string = '';
  private shouldScrollToBottom = false;

  // Actions suggérées
  quickActions: ActionButton[] = [
    { action: 'create_convention', label: '📄 Créer une Convention', icon: 'description', color: 'primary' },
    { action: 'create_facture', label: '🧾 Créer une Facture', icon: 'receipt', color: 'accent' },
    { action: 'send_reminder', label: '🔔 Programmer un Rappel', icon: 'notifications', color: 'warn' },
    { action: 'send_notification', label: '📧 Envoyer une Notification', icon: 'email', color: 'primary' },
    { action: 'get_unpaid_invoices', label: '📋 Factures Non Payées', icon: 'list', color: 'primary' },
    { action: 'mark_as_paid', label: '✅ Marquer Payée', icon: 'check_circle', color: 'accent' }
  ];

  constructor(
    private actionService: ChatbotActionService,
    private nlpService: NlpAdvancedService,
    private proactiveService: ProactiveNotificationsService
  ) {}

  ngOnInit(): void {
    this.addWelcomeMessage();
    this.initProactiveNotifications();
  }

  /**
   * Initialise le système de notifications proactives
   */
  private initProactiveNotifications(): void {
    // Polling toutes les 30 secondes
    this.proactiveService.startPolling().subscribe({
      next: (notifications) => {
        if (notifications && notifications.length > 0) {
          console.log('🔔 [PROACTIF] Nouvelles notifications:', notifications.length);
          this.displayProactiveNotifications(notifications);
        }
      },
      error: (error) => {
        console.error('❌ [PROACTIF] Erreur polling:', error);
      }
    });
  }

  /**
   * Affiche les notifications proactives dans le chat
   */
  private displayProactiveNotifications(notifications: any[]): void {
    notifications.forEach(notif => {
      // Afficher la notification comme un message bot
      this.messages.push({
        type: 'bot',
        text: `🔔 **${notif.subject}**\n\n${notif.message}`,
        timestamp: new Date(notif.sentAt)
      });
      
      // Marquer comme lue
      this.proactiveService.markAsRead(notif.id).subscribe();
    });
    
    this.forceScrollToBottom();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private addWelcomeMessage(): void {
    this.messages.push({
      type: 'bot',
      text: '👋 Bonjour ! Je suis votre assistant opérationnel.\n\n' +
            'Je peux vous aider à :\n' +
            '• Créer des conventions et factures\n' +
            '• Programmer des rappels automatiques\n' +
            '• Consulter les factures non payées\n' +
            '• Marquer des factures comme payées\n\n' +
            'Choisissez une action rapide ou décrivez ce que vous voulez faire !',
      timestamp: new Date()
    });
  }

  sendMessage(): void {
    if (!this.userMessage.trim()) return;

    // Ajouter le message utilisateur
    this.messages.push({
      type: 'user',
      text: this.userMessage,
      timestamp: new Date()
    });

    const message = this.userMessage;
    this.userMessage = '';
    this.loading = true;
    this.forceScrollToBottom();

    // Envoyer le prompt directement au backend pour traitement CRUD
    this.actionService.sendPrompt(message).subscribe({
      next: (response) => {
        this.loading = false;
        
        console.log('✅ [PROMPT] Réponse reçue:', response);
        
        // Afficher la réponse du bot
        const responseText = response.texte || response.response || 'Réponse vide';
        this.messages.push({
          type: responseText.includes('✅') ? 'success' : 
                responseText.includes('❌') ? 'error' : 'bot',
          text: responseText,
          data: response.kpi || response.data,
          timestamp: new Date()
        });
        
        this.forceScrollToBottom();
      },
      error: (error) => {
        this.loading = false;
        console.error('❌ [PROMPT] Erreur:', error);
        
        this.messages.push({
          type: 'error',
          text: '❌ Une erreur est survenue lors du traitement de votre demande.\n\n' +
                'Veuillez réessayer ou reformuler votre demande.',
          timestamp: new Date()
        });
        
        this.forceScrollToBottom();
      }
    });
  }

  private handleIntent(intent: string, entities: any[] = []): void {
    if (intent === 'get_unpaid_invoices') {
      // Exécuter directement sans formulaire
      this.executeAction(intent, {});
    } else if (intent === 'show_analytics') {
      // Rediriger vers le chatbot analytique
      this.messages.push({
        type: 'bot',
        text: '📊 Pour consulter les statistiques et analyses, je vous redirige vers l\'**Assistant Analytique** (Gemini).\n\n' +
              'Cliquez sur le bouton ci-dessous :',
        timestamp: new Date()
      });
      
      this.messages.push({
        type: 'action',
        text: '',
        actionButtons: [
          { action: 'redirect_analytics', label: '📊 Ouvrir l\'Assistant Analytique', icon: 'analytics', color: 'primary' }
        ],
        timestamp: new Date()
      });
      this.forceScrollToBottom();
    } else {
      // Afficher le formulaire
      this.currentAction = intent;
      this.showActionForm = true;
      
      this.messages.push({
        type: 'bot',
        text: '📝 Parfait ! Veuillez remplir le formulaire ci-dessous :',
        timestamp: new Date()
      });
      this.forceScrollToBottom();
    }
  }

  onQuickActionSelected(action: string): void {
    console.log('⚡ Action rapide sélectionnée:', action);
    
    // Gérer la redirection vers le chatbot analytique
    if (action === 'redirect_analytics') {
      window.location.href = '/decideur/chatbot';
      return;
    }
    
    this.handleIntent(action);
  }

  onActionFormSubmit(formData: any): void {
    console.log('📝 Formulaire soumis:', formData);
    this.showActionForm = false;
    this.executeAction(this.currentAction, formData);
  }

  onActionFormCancel(): void {
    this.showActionForm = false;
    this.messages.push({
      type: 'bot',
      text: '❌ Action annulée. Que puis-je faire d\'autre pour vous ?',
      actionButtons: this.quickActions,
      timestamp: new Date()
    });
    this.forceScrollToBottom();
  }

  private executeAction(action: string, parameters: any): void {
    this.loading = true;

    this.messages.push({
      type: 'bot',
      text: '⚙️ Exécution de l\'action en cours...',
      timestamp: new Date()
    });
    this.forceScrollToBottom();

    this.actionService.executeAction(action, parameters).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (response.success) {
          this.messages.push({
            type: 'success',
            text: `✅ ${response.message}`,
            data: response.data,
            timestamp: new Date()
          });

          // Afficher les données si disponibles
          if (response.data) {
            this.displayActionResult(action, response.data);
          }
        } else {
          this.messages.push({
            type: 'error',
            text: `❌ ${response.message}`,
            timestamp: new Date()
          });
        }

        // Proposer d'autres actions
        this.messages.push({
          type: 'bot',
          text: '💡 Que voulez-vous faire ensuite ?',
          actionButtons: this.quickActions,
          timestamp: new Date()
        });

        this.forceScrollToBottom();
      },
      error: (error) => {
        this.loading = false;
        console.error('❌ Erreur:', error);
        
        this.messages.push({
          type: 'error',
          text: '❌ Une erreur s\'est produite lors de l\'exécution de l\'action.',
          timestamp: new Date()
        });
        this.forceScrollToBottom();
      }
    });
  }

  private displayActionResult(action: string, data: any): void {
    if (action === 'get_unpaid_invoices' && Array.isArray(data)) {
      const invoices = data;
      let resultText = `📋 **${invoices.length} facture(s) non payée(s) trouvée(s) :**\n\n`;
      
      invoices.forEach((inv: any, index: number) => {
        resultText += `${index + 1}. **${inv.invoiceNumber || inv.reference}**\n`;
        resultText += `   💰 Montant: ${inv.amount} DT\n`;
        resultText += `   📅 Échéance: ${inv.dueDate}\n`;
        resultText += `   📊 Statut: ${inv.status}\n\n`;
      });

      this.messages.push({
        type: 'bot',
        text: resultText,
        data: invoices,
        timestamp: new Date()
      });
    } else if (data.id) {
      // Afficher les détails de l'objet créé
      let detailText = '📄 **Détails :**\n\n';
      detailText += `🆔 ID: ${data.id}\n`;
      if (data.reference) detailText += `📋 Référence: ${data.reference}\n`;
      if (data.title) detailText += `📝 Titre: ${data.title}\n`;
      if (data.amount) detailText += `💰 Montant: ${data.amount} DT\n`;
      if (data.status) detailText += `📊 Statut: ${data.status}\n`;

      this.messages.push({
        type: 'bot',
        text: detailText,
        timestamp: new Date()
      });
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.chatMessagesContainer) {
        const element = this.chatMessagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Erreur lors du scroll:', err);
    }
  }

  private forceScrollToBottom(): void {
    this.shouldScrollToBottom = true;
  }

  /**
   * Retourne le label lisible pour un type d'entité
   */
  private getEntityLabel(entityType: string): string {
    const labels: { [key: string]: string } = {
      'convention_id': 'Convention',
      'invoice_id': 'Facture',
      'date': 'Date',
      'amount': 'Montant',
      'days': 'Jours',
      'name': 'Nom'
    };
    return labels[entityType] || entityType;
  }
}
