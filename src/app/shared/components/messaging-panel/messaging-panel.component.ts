import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}

@Component({
  selector: 'app-messaging-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="messaging-container">
      <div class="conversations-panel">
        <mat-card>
          <mat-card-header>
            <mat-card-title>
              <mat-icon>forum</mat-icon>
              Mes Conversations
              <span class="unread-badge" *ngIf="totalUnread > 0">{{totalUnread}}</span>
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="isLoadingConversations" class="loading">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
            
            <mat-list *ngIf="!isLoadingConversations">
              <mat-list-item 
                *ngFor="let conversation of conversations"
                [class.active]="selectedConversation?.id === conversation.id"
                [class.unread]="conversation.unreadCount > 0"
                (click)="selectConversation(conversation)">
                <mat-icon matListItemIcon>
                  {{ conversation.unreadCount > 0 ? 'mark_email_unread' : 'email' }}
                </mat-icon>
                <div matListItemTitle class="conversation-title">
                  {{ getConversationTitle(conversation) }}
                  <span class="unread-count" *ngIf="conversation.unreadCount > 0">
                    {{ conversation.unreadCount }}
                  </span>
                </div>
                <div matListItemLine class="last-message">
                  {{ conversation.lastMessage?.content || 'Aucun message' }}
                </div>
                <div matListItemLine class="timestamp">
                  {{ conversation.updatedAt | date:'short' }}
                </div>
              </mat-list-item>
              
              <div *ngIf="conversations.length === 0" class="empty-state">
                <mat-icon>inbox</mat-icon>
                <p>Aucune conversation</p>
              </div>
            </mat-list>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="messages-panel">
        <mat-card *ngIf="selectedConversation">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>chat</mat-icon>
              {{ getConversationTitle(selectedConversation) }}
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="messages-container" #messagesContainer>
              <div *ngIf="isLoadingMessages" class="loading">
                <mat-spinner diameter="40"></mat-spinner>
              </div>

              <div *ngIf="!isLoadingMessages" class="messages-list">
                <div *ngFor="let message of messages" 
                     class="message"
                     [class.own-message]="isOwnMessage(message)">
                  <div class="message-header">
                    <strong>{{ message.senderName }}</strong>
                    <span class="message-time">{{ message.timestamp | date:'short' }}</span>
                  </div>
                  <div class="message-content">
                    {{ message.content }}
                  </div>
                </div>

                <div *ngIf="messages.length === 0" class="empty-state">
                  <mat-icon>chat_bubble_outline</mat-icon>
                  <p>Aucun message dans cette conversation</p>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="message-input">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Écrire un message...</mat-label>
                <textarea matInput 
                          [(ngModel)]="newMessage"
                          (keydown.enter)="sendMessage($event)"
                          rows="3"></textarea>
              </mat-form-field>
              <button mat-raised-button color="primary" 
                      (click)="sendMessage()"
                      [disabled]="!newMessage.trim() || isSending">
                <mat-icon>send</mat-icon>
                {{ isSending ? 'Envoi...' : 'Envoyer' }}
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <div *ngIf="!selectedConversation" class="no-conversation-selected">
          <mat-icon>chat_bubble_outline</mat-icon>
          <p>Sélectionnez une conversation pour commencer</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .messaging-container {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 20px;
      height: calc(100vh - 200px);
      padding: 20px;
    }

    .conversations-panel, .messages-panel {
      height: 100%;
    }

    mat-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    mat-card-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .unread-badge {
      background: #f44336;
      color: white;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 12px;
      margin-left: auto;
    }

    mat-list {
      overflow-y: auto;
      flex: 1;
    }

    mat-list-item {
      cursor: pointer;
      border-bottom: 1px solid #e0e0e0;
      transition: background-color 0.2s;
    }

    mat-list-item:hover {
      background-color: #f5f5f5;
    }

    mat-list-item.active {
      background-color: #e3f2fd;
    }

    mat-list-item.unread {
      font-weight: bold;
      background-color: #fff3e0;
    }

    .conversation-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .unread-count {
      background: #f44336;
      color: white;
      border-radius: 10px;
      padding: 2px 6px;
      font-size: 11px;
      margin-left: 8px;
    }

    .last-message {
      color: #666;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .timestamp {
      color: #999;
      font-size: 11px;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #fafafa;
    }

    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .message {
      max-width: 70%;
      padding: 12px;
      border-radius: 12px;
      background: white;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .message.own-message {
      align-self: flex-end;
      background: #e3f2fd;
      margin-left: auto;
    }

    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 12px;
    }

    .message-time {
      color: #999;
    }

    .message-content {
      word-wrap: break-word;
    }

    .message-input {
      display: flex;
      gap: 10px;
      padding: 15px;
      background: white;
    }

    .full-width {
      flex: 1;
    }

    .loading, .empty-state, .no-conversation-selected {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #999;
    }

    .empty-state mat-icon, .no-conversation-selected mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }
  `]
})
export class MessagingPanelComponent implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  messages: Message[] = [];
  selectedConversation: Conversation | null = null;
  newMessage = '';
  currentUserId = '';
  totalUnread = 0;

  isLoadingConversations = false;
  isLoadingMessages = false;
  isSending = false;

  private refreshSubscription?: Subscription;
  private apiUrl = 'http://localhost:8085/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadConversations();
    
    // Rafraîchir les conversations toutes les 30 secondes
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadConversations();
      if (this.selectedConversation) {
        this.loadMessages(this.selectedConversation.id);
      }
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private loadCurrentUser(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.currentUserId = user.id;
    }
  }

  loadConversations(): void {
    this.isLoadingConversations = true;
    
    // Charger les conversations de l'utilisateur connecté
    this.http.get<any[]>(`${this.apiUrl}/conversations/user/${this.currentUserId}`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (conversations) => {
          // Mapper les conversations au format attendu
          this.conversations = conversations.map(conv => ({
            id: conv.id,
            participants: conv.participantIds || [],
            participantNames: conv.participantNames || [],
            lastMessage: conv.lastMessage,
            unreadCount: conv.unreadCount || 0,
            updatedAt: new Date(conv.updatedAt)
          }));
          
          this.totalUnread = this.conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
          this.isLoadingConversations = false;
          
          console.log('✅ Conversations chargées:', this.conversations.length);
        },
        error: (error) => {
          console.error('❌ Erreur chargement conversations:', error);
          this.isLoadingConversations = false;
          
          // Fallback : créer une conversation de démonstration
          this.conversations = [];
        }
      });
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    this.loadMessages(conversation.id);
    this.markConversationAsRead(conversation.id);
  }

  loadMessages(conversationId: string): void {
    this.isLoadingMessages = true;
    this.http.get<Message[]>(`${this.apiUrl}/conversations/${conversationId}/messages`, 
      { headers: this.getAuthHeaders() })
      .subscribe({
        next: (messages) => {
          this.messages = messages;
          this.isLoadingMessages = false;
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (error) => {
          console.error('Erreur chargement messages:', error);
          this.isLoadingMessages = false;
        }
      });
  }

  sendMessage(event?: Event): void {
    // Cast to KeyboardEvent if it's a keyboard event
    const keyEvent = event as KeyboardEvent;
    if (keyEvent && keyEvent.key === 'Enter' && !keyEvent.shiftKey) {
      keyEvent.preventDefault();
    } else if (keyEvent && keyEvent.key === 'Enter') {
      return;
    }

    if (!this.newMessage.trim() || !this.selectedConversation) {
      return;
    }

    this.isSending = true;
    const messageData = {
      conversationId: this.selectedConversation.id,
      senderId: this.currentUserId,
      content: this.newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    console.log('📤 Envoi message:', messageData);

    this.http.post<any>(`${this.apiUrl}/messages/send`, messageData, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (response) => {
          console.log('✅ Message envoyé:', response);
          
          // Ajouter le message à la liste
          const newMessage: Message = {
            id: response.id || Date.now().toString(),
            conversationId: this.selectedConversation!.id,
            senderId: this.currentUserId,
            senderName: 'Moi',
            content: this.newMessage.trim(),
            timestamp: new Date(),
            read: true
          };
          
          this.messages.push(newMessage);
          this.newMessage = '';
          this.isSending = false;
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (error) => {
          console.error('❌ Erreur envoi message:', error);
          this.isSending = false;
          alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
        }
      });
  }

  markConversationAsRead(conversationId: string): void {
    this.http.put(`${this.apiUrl}/conversations/${conversationId}/mark-read`, {}, 
      { headers: this.getAuthHeaders() })
      .subscribe({
        next: () => {
          const conv = this.conversations.find(c => c.id === conversationId);
          if (conv) {
            this.totalUnread -= conv.unreadCount;
            conv.unreadCount = 0;
          }
        },
        error: (error) => console.error('Erreur marquage lu:', error)
      });
  }

  getConversationTitle(conversation: Conversation): string {
    return conversation.participantNames
      .filter(name => name !== 'Moi')
      .join(', ') || 'Conversation';
  }

  isOwnMessage(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  private scrollToBottom(): void {
    const container = document.querySelector('.messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}
