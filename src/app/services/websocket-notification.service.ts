import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as SockJS from 'sockjs-client';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

export interface WebSocketNotification {
  id?: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  timestamp: Date;
  read: boolean;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketNotificationService {
  private stompClient: Client | null = null;
  private notificationsSubject = new BehaviorSubject<WebSocketNotification[]>([]);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  public notifications$ = this.notificationsSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private notifications: WebSocketNotification[] = [];
  private subscription: StompSubscription | null = null;

  constructor() {
    console.log('🔔 WebSocketNotificationService initialisé');
  }

  /**
   * Connexion au WebSocket
   */
  connect(userId: string): void {
    if (this.stompClient?.connected) {
      console.log('✅ WebSocket déjà connecté');
      return;
    }

    console.log('🔌 Connexion au WebSocket pour l\'utilisateur:', userId);

    const token = localStorage.getItem('token');
    const socketUrl = 'http://localhost:8085/ws';

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        console.log('🔍 STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('✅ WebSocket connecté:', frame);
      this.connectionStatusSubject.next(true);
      this.subscribeToNotifications(userId);
    };

    this.stompClient.onStompError = (frame) => {
      console.error('❌ Erreur STOMP:', frame.headers['message']);
      console.error('Détails:', frame.body);
      this.connectionStatusSubject.next(false);
    };

    this.stompClient.onWebSocketError = (event) => {
      console.error('❌ Erreur WebSocket:', event);
      this.connectionStatusSubject.next(false);
    };

    this.stompClient.onDisconnect = () => {
      console.log('🔌 WebSocket déconnecté');
      this.connectionStatusSubject.next(false);
    };

    this.stompClient.activate();
  }

  /**
   * S'abonner aux notifications de l'utilisateur
   */
  private subscribeToNotifications(userId: string): void {
    if (!this.stompClient?.connected) {
      console.error('❌ Impossible de s\'abonner : WebSocket non connecté');
      return;
    }

    // S'abonner aux notifications personnelles de l'utilisateur
    const destination = `/user/${userId}/queue/notifications`;
    
    console.log('📬 Abonnement aux notifications:', destination);

    this.subscription = this.stompClient.subscribe(destination, (message: IMessage) => {
      console.log('📨 Notification reçue:', message.body);
      
      try {
        const notification: WebSocketNotification = JSON.parse(message.body);
        notification.timestamp = new Date(notification.timestamp);
        notification.read = false;
        
        this.addNotification(notification);
        
        // Afficher une notification navigateur si autorisé
        this.showBrowserNotification(notification);
        
      } catch (error) {
        console.error('❌ Erreur parsing notification:', error);
      }
    });

    // S'abonner aussi aux notifications globales
    this.stompClient.subscribe('/topic/notifications', (message: IMessage) => {
      console.log('📢 Notification globale reçue:', message.body);
      
      try {
        const notification: WebSocketNotification = JSON.parse(message.body);
        notification.timestamp = new Date(notification.timestamp);
        notification.read = false;
        
        this.addNotification(notification);
        
      } catch (error) {
        console.error('❌ Erreur parsing notification globale:', error);
      }
    });

    console.log('✅ Abonnement aux notifications établi');
  }

  /**
   * Ajouter une notification à la liste
   */
  private addNotification(notification: WebSocketNotification): void {
    this.notifications.unshift(notification);
    
    // Limiter à 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    
    this.notificationsSubject.next([...this.notifications]);
    this.updateUnreadCount();
  }

  /**
   * Afficher une notification navigateur
   */
  private showBrowserNotification(notification: WebSocketNotification): void {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      const browserNotif = new Notification(notification.title, {
        body: notification.message,
        icon: '/assets/icons/notification-icon.png',
        badge: '/assets/icons/badge-icon.png',
        tag: notification.id || 'notification',
        requireInteraction: notification.priority === 'URGENT'
      });

      browserNotif.onclick = () => {
        window.focus();
        browserNotif.close();
      };
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.showBrowserNotification(notification);
        }
      });
    }
  }

  /**
   * Marquer une notification comme lue
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notificationsSubject.next([...this.notifications]);
      this.updateUnreadCount();
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.notificationsSubject.next([...this.notifications]);
    this.updateUnreadCount();
  }

  /**
   * Supprimer une notification
   */
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notificationsSubject.next([...this.notifications]);
    this.updateUnreadCount();
  }

  /**
   * Vider toutes les notifications
   */
  clearAll(): void {
    this.notifications = [];
    this.notificationsSubject.next([]);
    this.updateUnreadCount();
  }

  /**
   * Mettre à jour le compteur de non lus
   */
  private updateUnreadCount(): void {
    const unreadCount = this.notifications.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  /**
   * Obtenir les notifications
   */
  getNotifications(): WebSocketNotification[] {
    return [...this.notifications];
  }

  /**
   * Obtenir le nombre de non lus
   */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * Déconnexion
   */
  disconnect(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (this.stompClient?.connected) {
      this.stompClient.deactivate();
      console.log('🔌 WebSocket déconnecté');
    }

    this.connectionStatusSubject.next(false);
  }

  /**
   * Envoyer une notification de test
   */
  sendTestNotification(): void {
    if (!this.stompClient?.connected) {
      console.error('❌ WebSocket non connecté');
      return;
    }

    const testNotification = {
      type: 'TEST',
      title: '🧪 Notification de Test',
      message: 'Ceci est une notification de test WebSocket',
      priority: 'MEDIUM',
      timestamp: new Date()
    };

    this.stompClient.publish({
      destination: '/app/test-notification',
      body: JSON.stringify(testNotification)
    });

    console.log('📤 Notification de test envoyée');
  }
}
