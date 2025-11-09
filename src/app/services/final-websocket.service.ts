import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { SecurityService } from '../core/services/security.service';
import { environment } from '../../environments/environment';
import * as SockJS from 'sockjs-client';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FinalWebSocketService {
  private socket: WebSocket | null = null;
  private stompClient: Client | null = null;
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private messagesSubject = new BehaviorSubject<WebSocketMessage[]>([]);
  private chatMessagesSubject = new BehaviorSubject<any>(null);
  private connectedUsersSubject = new BehaviorSubject<any[]>([]);
  private currentUser: any = null;
  private conversationSubscriptions = new Map<string, StompSubscription>();

  // Public properties for compatibility
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  public chatMessages$ = this.chatMessagesSubject.asObservable();
  public connectedUsers$ = this.connectedUsersSubject.asObservable();

  constructor(
    private authService: AuthService,
    private securityService: SecurityService
  ) {
    this.initializeConnection();
  }

  // Subscribe to a specific conversation topic to receive real-time events (reactions, pin updates, etc.)
  subscribeToConversationTopic(conversationId: string, handler: (payload: any) => void): StompSubscription | null {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('STOMP client not connected, cannot subscribe to conversation topic');
      return null;
    }
    const destination = `/topic/conversation/${conversationId}`;
    const sub = this.stompClient.subscribe(destination, (message: IMessage) => {
      try {
        const payload = JSON.parse(message.body);
        handler(payload);
      } catch (e) {
        console.warn('Failed to parse conversation payload', e);
      }
    });
    // Keep only one subscription per conversation id
    const existing = this.conversationSubscriptions.get(conversationId);
    if (existing) existing.unsubscribe();
    this.conversationSubscriptions.set(conversationId, sub);
    return sub;
  }

  // Unsubscribe helper
  unsubscribeFromConversationTopic(conversationId: string): void {
    const sub = this.conversationSubscriptions.get(conversationId);
    if (sub) {
      sub.unsubscribe();
      this.conversationSubscriptions.delete(conversationId);
    }
  }

  private initializeConnection(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.connect();
    }
  }

  connect(url?: string): void {
    try {
      if (!this.currentUser) {
        console.warn('No authenticated user found');
        return;
      }

      // Déconnecter l'ancienne connexion si elle existe
      if (this.stompClient) {
        console.log('🔄 Closing existing WebSocket connection');
        try {
          this.stompClient.deactivate();
        } catch (e) {
          console.warn('Error closing existing connection:', e);
        }
        this.stompClient = null;
      }

      // URL WebSocket SockJS attend une URL http(s), pas ws(s)
      const wsUrl = url || `${environment.apiUrl}/ws`;
      console.log('🔌 Connecting to WebSocket:', wsUrl);

      // Créer la connexion SockJS
      const sock = new (SockJS as any)(wsUrl);
      this.stompClient = new Client({
        webSocketFactory: () => sock as any,
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        connectionTimeout: 10000, // Timeout de 10 secondes
        connectHeaders: {
          Authorization: `Bearer ${this.authService.getToken()}`,
          username: this.currentUser.username
        },
        onConnect: () => {
          console.log('✅ WebSocket connected successfully');
          this.connectionStatusSubject.next(true);
          this.subscribeToTopics();
          this.notifyUserJoined();
          // Demander la liste initiale des utilisateurs connectés
          try {
            this.stompClient?.publish({ destination: '/app/getConnectedUsers', body: '' });
          } catch (e) {
            console.warn('Error requesting connected users:', e);
          }
        },
        onStompError: frame => {
          console.error('❌ STOMP error', frame.headers['message']);
          this.connectionStatusSubject.next(false);
        },
        onWebSocketClose: () => {
          console.warn('🔌 WebSocket disconnected');
          this.connectionStatusSubject.next(false);
        },
        onWebSocketError: (e) => {
          console.error('❌ WebSocket error', e);
          this.connectionStatusSubject.next(false);
        }
      });

      // Timeout de sécurité pour éviter le blocage
      const connectionTimeout = setTimeout(() => {
        if (!this.connectionStatusSubject.value) {
          console.warn('⏱️ WebSocket connection timeout - continuing without WebSocket');
          this.connectionStatusSubject.next(false);
        }
      }, 15000); // 15 secondes

      this.stompClient.activate();

      // Nettoyer le timeout si la connexion réussit
      this.connectionStatus$.subscribe(connected => {
        if (connected) {
          clearTimeout(connectionTimeout);
        }
      });

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.connectionStatusSubject.next(false);
    }
  }

  private subscribeToTopics(): void {
    const client = this.stompClient;
    if (!client) { return; }
    
    try {
      // S'abonner aux messages publics
      client.subscribe('/topic/public', (message: any) => {
        try {
          const chatMessage = JSON.parse(message.body);
          console.log('📨 Public message received:', chatMessage);
          // Utiliser setTimeout pour éviter le blocage de l'UI
          setTimeout(() => {
            this.chatMessagesSubject.next(chatMessage);
          }, 0);
        } catch (e) {
          console.error('Error parsing public message:', e);
        }
      });

      // S'abonner aux utilisateurs connectés
      client.subscribe('/topic/connectedUsers', (message: any) => {
        try {
          const connectedUsers = JSON.parse(message.body);
          console.log('👥 Connected users updated:', connectedUsers);
          setTimeout(() => {
            this.connectedUsersSubject.next(connectedUsers);
          }, 0);
        } catch (e) {
          console.error('Error parsing connected users:', e);
        }
      });

      // S'abonner aux messages privés
      client.subscribe('/user/queue/private', (message: any) => {
        try {
          const privateMessage = JSON.parse(message.body);
          console.log('🔒 Private message received:', privateMessage);
          setTimeout(() => {
            this.chatMessagesSubject.next(privateMessage);
          }, 0);
        } catch (e) {
          console.error('Error parsing private message:', e);
        }
      });

      // S'abonner aux pongs (endpoint renvoie sur /topic/pong)
      client.subscribe('/topic/pong', (message: any) => {
        try {
          const pong = JSON.parse(message.body);
          console.log('🏓 Pong received:', pong);
        } catch (e) {
          console.error('Error parsing pong:', e);
        }
      });
      
      console.log('✅ All topics subscribed successfully');
    } catch (error) {
      console.error('❌ Error subscribing to topics:', error);
    }
  }

  private notifyUserJoined(): void {
    if (this.stompClient && this.currentUser) {
      const joinMessage = {
        type: 'JOIN',
        sender: this.currentUser.username,
        content: `${this.currentUser.username} s'est connecté`,
        timestamp: new Date().toISOString()
      };
      
      this.stompClient.publish({ destination: '/app/chat.addUser', body: JSON.stringify(joinMessage) });
    }
  }

  disconnect(): void {
    if (this.stompClient) {
      // Notifier la déconnexion
      if (this.currentUser) {
        const leaveMessage = {
          type: 'LEAVE',
          sender: this.currentUser.username,
          content: `${this.currentUser.username} s'est déconnecté`,
          timestamp: new Date().toISOString()
        };
        this.stompClient.publish({ destination: '/app/chat.sendMessage', body: JSON.stringify(leaveMessage) });
      }
      
      this.stompClient.deactivate();
      this.connectionStatusSubject.next(false);
      this.stompClient = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(message: any): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({ destination: '/app/chat.sendMessage', body: JSON.stringify(message) });
    }
  }

  sendChatMessage(conversationId: string, content: string): void {
    if (this.stompClient && this.stompClient.connected && this.currentUser) {
      const message = {
        type: 'CHAT',
        sender: this.currentUser.username,
        content: content,
        conversationId: conversationId,
        timestamp: new Date().toISOString()
      };
      this.sendMessage(message);
    }
  }

  sendPrivateMessage(recipient: string, content: string): void {
    if (this.stompClient && this.stompClient.connected && this.currentUser) {
      const message = {
        type: 'CHAT',
        sender: this.currentUser.username,
        recipient: recipient,
        content: content,
        timestamp: new Date().toISOString()
      };
      this.stompClient.publish({ destination: '/app/chat.sendPrivateMessage', body: JSON.stringify(message) });
    }
  }

  sendTyping(conversationId: string): void {
    if (this.stompClient && this.stompClient.connected && this.currentUser) {
      const message = {
        type: 'TYPING',
        sender: this.currentUser.username,
        conversationId: conversationId,
        timestamp: new Date().toISOString()
      };
      this.stompClient.publish({ destination: '/app/chat.typing', body: JSON.stringify(message) });
    }
  }

  sendStopTyping(conversationId: string): void {
    if (this.stompClient && this.stompClient.connected && this.currentUser) {
      const message = {
        type: 'STOP_TYPING',
        sender: this.currentUser.username,
        conversationId: conversationId,
        timestamp: new Date().toISOString()
      };
      this.stompClient.publish({ destination: '/app/chat.stopTyping', body: JSON.stringify(message) });
    }
  }

  ping(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({ destination: '/app/ping', body: JSON.stringify({}) });
    }
  }

  // Envoyer une réaction via WebSocket (sécurisée)
  sendReaction(messageId: string, emoji: string, userId: string): void {
    if (!this.stompClient || !this.stompClient.connected || !this.currentUser) {
      console.warn('🔒 WebSocket non connecté pour l\'envoi de réaction');
      return;
    }

    // Valider les paramètres d'entrée
    const sanitizedMessageId = this.securityService.sanitizeInput(messageId);
    const sanitizedEmoji = this.securityService.sanitizeInput(emoji);
    const sanitizedUserId = this.securityService.sanitizeInput(userId);
    const sanitizedUserName = this.securityService.sanitizeInput(this.currentUser.username);

    if (!sanitizedMessageId || !sanitizedEmoji || !sanitizedUserId) {
      console.warn('🔒 Paramètres de réaction invalides');
      return;
    }

    const reactionData = {
      type: 'REACTION',
      messageId: sanitizedMessageId,
      emoji: sanitizedEmoji,
      userId: sanitizedUserId,
      userName: sanitizedUserName,
      timestamp: new Date().toISOString()
    };
    
    this.stompClient.publish({ 
      destination: '/app/chat.reaction', 
      body: JSON.stringify(reactionData) 
    });
    
    console.log('📤 Réaction sécurisée envoyée via WebSocket:', this.securityService.sanitizeLogData(reactionData));
  }

  // Envoyer une mise à jour d'épinglage via WebSocket (sécurisée)
  sendPinUpdate(messageId: string, pinned: boolean, userId: string): void {
    if (!this.stompClient || !this.stompClient.connected || !this.currentUser) {
      console.warn('🔒 WebSocket non connecté pour l\'envoi de mise à jour d\'épinglage');
      return;
    }

    // Valider les paramètres d'entrée
    const sanitizedMessageId = this.securityService.sanitizeInput(messageId);
    const sanitizedUserId = this.securityService.sanitizeInput(userId);
    const sanitizedUserName = this.securityService.sanitizeInput(this.currentUser.username);

    if (!sanitizedMessageId || !sanitizedUserId || typeof pinned !== 'boolean') {
      console.warn('🔒 Paramètres d\'épinglage invalides');
      return;
    }

    const pinData = {
      type: 'PIN_UPDATE',
      messageId: sanitizedMessageId,
      pinned: pinned,
      userId: sanitizedUserId,
      userName: sanitizedUserName,
      timestamp: new Date().toISOString()
    };
    
    this.stompClient.publish({ 
      destination: '/app/chat.pin', 
      body: JSON.stringify(pinData) 
    });
    
    console.log('📌 Mise à jour d\'épinglage sécurisée envoyée via WebSocket:', this.securityService.sanitizeLogData(pinData));
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatusSubject.asObservable();
  }

  getMessages(): Observable<WebSocketMessage[]> {
    return this.messagesSubject.asObservable();
  }

  getCurrentUser(): any {
    return this.currentUser;
  }
}
