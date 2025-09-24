import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import * as SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

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

  // Public properties for compatibility
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  public chatMessages$ = this.chatMessagesSubject.asObservable();
  public connectedUsers$ = this.connectedUsersSubject.asObservable();

  constructor(private authService: AuthService) {
    this.initializeConnection();
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

      // URL WebSocket avec SockJS
      const wsUrl = url || `${environment.apiUrl.replace('http', 'ws')}/ws`;
      console.log('🔌 Connecting to WebSocket:', wsUrl);

      // Créer le client STOMP
      this.stompClient = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        connectHeaders: {
          'Authorization': `Bearer ${this.authService.getToken()}`,
          'username': this.currentUser.username
        },
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        onConnect: (frame) => {
          console.log('✅ WebSocket connected successfully:', frame);
          this.connectionStatusSubject.next(true);
          
          // S'abonner aux topics
          this.subscribeToTopics();
          
          // Notifier la connexion
          this.notifyUserJoined();
        },
        onStompError: (frame) => {
          console.error('❌ WebSocket STOMP error:', frame);
          this.connectionStatusSubject.next(false);
          
          // Retry après 5 secondes
          setTimeout(() => {
            console.log('🔄 Retrying WebSocket connection...');
            this.connect();
          }, 5000);
        }
      });

      // Activer la connexion
      this.stompClient.activate();

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.connectionStatusSubject.next(false);
    }
  }

  private subscribeToTopics(): void {
    if (!this.stompClient) return;

    // S'abonner aux messages publics
    this.stompClient.subscribe('/topic/public', (message) => {
      const chatMessage = JSON.parse(message.body);
      console.log('📨 Public message received:', chatMessage);
      this.chatMessagesSubject.next(chatMessage);
    });

    // S'abonner aux utilisateurs connectés
    this.stompClient.subscribe('/topic/connectedUsers', (message) => {
      const connectedUsers = JSON.parse(message.body);
      console.log('👥 Connected users updated:', connectedUsers);
      this.connectedUsersSubject.next(connectedUsers);
    });

    // S'abonner aux messages privés
    this.stompClient.subscribe('/user/queue/private', (message) => {
      const privateMessage = JSON.parse(message.body);
      console.log('🔒 Private message received:', privateMessage);
      this.chatMessagesSubject.next(privateMessage);
    });

    // S'abonner aux pongs
    this.stompClient.subscribe('/user/queue/pong', (message) => {
      const pong = JSON.parse(message.body);
      console.log('🏓 Pong received:', pong);
    });
  }

  private notifyUserJoined(): void {
    if (this.stompClient && this.currentUser) {
      const joinMessage = {
        type: 'JOIN',
        sender: this.currentUser.username,
        content: `${this.currentUser.username} s'est connecté`,
        timestamp: new Date().toISOString()
      };
      
      this.stompClient.publish({
        destination: '/app/chat.addUser',
        body: JSON.stringify(joinMessage)
      });
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
        this.stompClient.publish({
          destination: '/app/chat.sendMessage',
          body: JSON.stringify(leaveMessage)
        });
      }
      
      this.stompClient.deactivate();
      this.stompClient = null;
      console.log('🔌 WebSocket disconnected');
      this.connectionStatusSubject.next(false);
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(message: any): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(message)
      });
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
      this.stompClient.publish({
        destination: '/app/chat.sendPrivateMessage',
        body: JSON.stringify(message)
      });
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
      this.stompClient.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify(message)
      });
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
      this.stompClient.publish({
        destination: '/app/chat.stopTyping',
        body: JSON.stringify(message)
      });
    }
  }

  ping(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/ping',
        body: JSON.stringify({})
      });
    }
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
