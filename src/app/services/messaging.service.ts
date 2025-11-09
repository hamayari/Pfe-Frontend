import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

// Interfaces
export interface Message {
  id?: string;
  content: string;
  senderId: string;
  senderName: string;
  conversationId: string;
  recipientIds: string[];
  timestamp: Date;
  read: boolean;
  sentAt?: Date;
  status?: 'SENT' | 'READ' | 'DELIVERED';
  metadata?: any;
  parentMessageId?: string;
  reactions?: MessageReaction[];
  mentions?: string[];
  edited?: boolean;
  editedAt?: Date;
  deleted?: boolean;
  deletedAt?: Date;
  senderAvatar?: string;
  pinned?: boolean;
  // Réponse à un message
  replyTo?: {
    messageId: string;
    senderName: string;
    content: string;
  };
}

export interface Conversation {
  id?: string;
  name: string;
  type: 'DIRECT' | 'GROUP' | 'CHANNEL';
  participants: string[];
  participantIds?: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
  otherUserAvatar?: string;
  otherUserStatus?: string;
  description?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface MessageAttachment {
  id: string;
  name: string;
  originalFileName: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface UserPresence {
  userId: string;
  status: 'ONLINE' | 'OFFLINE' | 'AWAY';
  lastSeen: Date;
  statusMessage?: string;
}

export interface SearchResult {
  messages: Message[];
  totalCount: number;
  hasMore: boolean;
}

export interface SystemStats {
  totalMessages: number;
  totalConversations: number;
  activeUsers: number;
  storageUsed: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private apiUrl = environment.apiUrl;
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);

  constructor(private http: HttpClient, private auth: AuthService) {}

  // Basic messaging methods
  getMessages(conversationId: string, options?: { before?: string; limit?: number }): Observable<Message[]> {
    const params: any = {};
    if (options?.before) params.before = options.before;
    if (options?.limit) params.limit = options.limit;

    const primary$ = this.http.get<Message[]>(`${this.apiUrl}/conversations/${conversationId}/messages`, { params }).pipe(
      tap(list => this.messagesSubject.next(list || []))
    );
    // Fallback DM: si conversationId est de la forme dm_<id1>_<id2>, utiliser l'endpoint direct
    let dmFallback$: Observable<Message[]> = of([] as Message[]);
    if (conversationId?.startsWith('dm_')) {
      const parts = conversationId.split('_');
      if (parts.length >= 3) {
        const id1 = parts[1];
        const id2 = parts[2];
        dmFallback$ = this.http.get<Message[]>(`${this.apiUrl}/messages/conversation/${id1}/${id2}`, { params });
      }
    }
    const fallback$ = this.http.get<Message[]>(`${this.apiUrl}/messages/conversation/${conversationId}/messages`, { params });

    return primary$.pipe(
      catchError(() => dmFallback$),
      catchError(() => fallback$),
      catchError(() => of([] as Message[]))
    );
  }

  sendMessage(message: Message): Observable<Message> {
    // S'assurer que conversationId pour DM suit la forme canonique si payload contient deux participants
    const body: any = { ...message };
    if (!body.messageType && (!body.type || body.type === 'text')) {
      body.messageType = 'DIRECT';
    }
    const primary$ = this.http.post<Message>(`${this.apiUrl}/messages`, body);
    const fallback$ = this.http.post<Message>(`${this.apiUrl}/messages/send`, body);
    return primary$.pipe(
      catchError(() => fallback$),
      tap(newMessage => {
        const currentMessages = this.messagesSubject.value;
        this.messagesSubject.next([...currentMessages, newMessage]);
      })
    );
  }

  getConversations(): Observable<Conversation[]> {
    const currentUser = this.auth.getCurrentUser();
    const primary$ = this.http.get<Conversation[]>(`${this.apiUrl}/conversations`);
    const withUser$ = currentUser?.id
      ? this.http.get<Conversation[]>(`${this.apiUrl}/conversations/user/${currentUser.id}`)
      : of([] as Conversation[]);
    return primary$.pipe(
      catchError(() => withUser$),
      catchError(() => of([] as Conversation[])),
      tap(conversations => this.conversationsSubject.next(conversations))
    );
  }

  createConversation(conversation: Partial<Conversation>): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/conversations`, conversation)
      .pipe(tap(newConversation => {
        const currentConversations = this.conversationsSubject.value;
        this.conversationsSubject.next([...currentConversations, newConversation]);
      }));
  }

  getDirectConversation(userId1: string, userId2: string): Observable<Conversation | null> {
    return this.http.get<Conversation>(`${this.apiUrl}/conversations/direct/${userId1}/${userId2}`)
      .pipe(
        catchError(() => of(null))
      );
  }

  // Owner updates: title/description/privacy
  updateConversation(conversationId: string, update: Partial<Conversation & { isPublic: boolean }>): Observable<Conversation> {
    return this.http.put<Conversation>(`${this.apiUrl}/conversations/${conversationId}`, update).pipe(
      tap(updated => {
        const list = this.conversationsSubject.value.map(c => c.id === updated.id ? { ...(c as any), ...(updated as any) } : c);
        this.conversationsSubject.next(list);
      })
    );
  }

  // Participants management
  addParticipant(conversationId: string, userId: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/conversations/${conversationId}/participant/${userId}`, {});
  }

  removeParticipant(conversationId: string, userId: string): Observable<Conversation> {
    return this.http.delete<Conversation>(`${this.apiUrl}/conversations/${conversationId}/participant/${userId}`);
  }

  // Advanced messaging methods
  markConversationRead(conversationId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/conversations/${conversationId}/read`, {});
  }

  getUnreadCounts(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.apiUrl}/conversations/unread-counts`);
  }

  searchMessages(userId: string, query: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/search?userId=${userId}&query=${query}`);
  }

  getMessageThread(messageId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/messages/${messageId}/thread`);
  }

  replyToMessage(parentMessageId: string, content: string, conversationId: string): Observable<Message> {
    const reply: Partial<Message> = {
      content,
      conversationId,
      parentMessageId
    };
    return this.http.post<Message>(`${this.apiUrl}/messages/${parentMessageId}/reply`, reply);
  }

  editMessage(messageId: string, content: string): Observable<Message> {
    return this.http.put<Message>(`${this.apiUrl}/messages/${messageId}`, { content });
  }

  deleteMessage(messageId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/messages/${messageId}`, { params: { userId } });
  }

  addReaction(messageId: string, emoji: string): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/messages/${messageId}/reactions`, { emoji });
  }

  removeReaction(messageId: string, emoji: string): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/messages/${messageId}/reactions/${emoji}`);
  }

  togglePin(messageId: string): Observable<Message> {
    // Backend may return updated message or nothing; accept Message for flexibility
    return this.http.post<Message>(`${this.apiUrl}/messages/${messageId}/pin`, {});
  }

  uploadAttachment(file: File, conversationId: string): Observable<MessageAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);
    return this.http.post<MessageAttachment>(`${this.apiUrl}/attachments/upload`, formData);
  }

  downloadAttachment(attachmentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/attachments/${attachmentId}/download`, { responseType: 'blob' });
  }

  // User presence methods
  getUsersPresence(): Observable<UserPresence[]> {
    return this.http.get<UserPresence[]>(`${this.apiUrl}/users/presence`);
  }

  // Admin methods
  getSystemStats(): Observable<SystemStats> {
    return this.http.get<SystemStats>(`${this.apiUrl}/admin/stats`);
  }

  cleanupOldData(daysOld: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/cleanup`, { daysOld });
  }

  // Getters for observables
  get messages$() {
    return this.messagesSubject.asObservable();
  }

  get conversations$() {
    return this.conversationsSubject.asObservable();
  }
}