import { Injectable, OnDestroy } from '@angular/core';
import { Client, Message, StompSubscription } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { Observable, Subject, BehaviorSubject, timer } from 'rxjs';
import { takeUntil, retryWhen, delayWhen, tap } from 'rxjs/operators';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class WebsocketService implements OnDestroy {
  private client!: Client;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;
  
  // Subjects for different types of messages
  private dashboardSubject = new Subject<WebSocketMessage>();
  private notificationSubject = new Subject<WebSocketMessage>();
  private monitoringSubject = new Subject<WebSocketMessage>();
  private chatSubject = new Subject<WebSocketMessage>();
  
  // Connection status
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  
  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();

  constructor() {
    this.initializeWebSocket();
  }

  private initializeWebSocket(): void {
    this.client = new Client({
      webSocketFactory: () => new SockJS('/api/ws'),
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
      },
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('WebSocket Debug:', str);
      }
    });

    this.setupEventHandlers();
    this.connect();
  }

  private setupEventHandlers(): void {
    this.client.onConnect = () => {
      console.log('WebSocket connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.connectionStatusSubject.next(true);
      this.subscribeToTopics();
    };

    this.client.onDisconnect = () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.connectionStatusSubject.next(false);
    };

    this.client.onStompError = (frame) => {
      console.error('WebSocket STOMP error:', frame);
      this.handleReconnection();
    };

    this.client.onWebSocketError = (error) => {
      console.error('WebSocket error:', error);
      this.handleReconnection();
    };

    this.client.onWebSocketClose = () => {
      console.log('WebSocket connection closed');
      this.isConnected = false;
      this.connectionStatusSubject.next(false);
      this.handleReconnection();
    };
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      timer(this.reconnectDelay * this.reconnectAttempts)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.connect();
        });
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private connect(): void {
    try {
      this.client.activate();
    } catch (error) {
      console.error('Error activating WebSocket client:', error);
    }
  }

  private subscribeToTopics(): void {
    // Dashboard updates
    this.subscribeToTopic('/topic/dashboard', (message) => {
      this.dashboardSubject.next({
        type: 'dashboard',
        data: JSON.parse(message.body),
        timestamp: Date.now()
      });
    });

    // Notifications
    this.subscribeToTopic('/topic/notifications', (message) => {
      this.notificationSubject.next({
        type: 'notification',
        data: JSON.parse(message.body),
        timestamp: Date.now()
      });
    });

    // Monitoring updates
    this.subscribeToTopic('/topic/system-stats', (message) => {
      this.monitoringSubject.next({
        type: 'monitoring',
        data: JSON.parse(message.body),
        timestamp: Date.now()
      });
    });

    // Chat messages
    this.subscribeToTopic('/topic/chat', (message) => {
      this.chatSubject.next({
        type: 'chat',
        data: JSON.parse(message.body),
        timestamp: Date.now()
      });
    });
  }

  private subscribeToTopic(destination: string, callback: (message: Message) => void): StompSubscription | null {
    try {
      return this.client.subscribe(destination, callback);
    } catch (error) {
      console.error(`Error subscribing to ${destination}:`, error);
      return null;
    }
  }

  // Public methods to send messages
  sendMessage(destination: string, message: any): void {
    if (this.isConnected) {
      try {
        this.client.publish({
          destination,
          body: JSON.stringify(message)
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  // Observable getters
  get dashboardUpdates$(): Observable<WebSocketMessage> {
    return this.dashboardSubject.asObservable();
  }

  get notifications$(): Observable<WebSocketMessage> {
    return this.notificationSubject.asObservable();
  }

  get monitoringUpdates$(): Observable<WebSocketMessage> {
    return this.monitoringSubject.asObservable();
  }

  get chatMessages$(): Observable<WebSocketMessage> {
    return this.chatSubject.asObservable();
  }

  get connectionStatus$(): Observable<boolean> {
    return this.connectionStatusSubject.asObservable();
  }

  // Utility methods
  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }
} 