import { Component, OnInit, OnDestroy, Input, inject, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MessagingService, Message, Conversation } from '../../../services/messaging.service';
import { AuthService } from '../../../services/auth.service';
import { FinalWebSocketService } from '../../../services/final-websocket.service';
// import { NotificationService } from '../../services/notification.service'; // Commenté pour éviter l'erreur MatDialog
import { AttachmentViewerComponent } from '../attachment-viewer/attachment-viewer.component';

@Component({
  selector: 'app-messaging',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatTabsModule,
    MatListModule,
    MatChipsModule,
    MatBadgeModule,
    MatDividerModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="slack-container">
      <!-- Header Slack-style -->
      <div class="slack-header">
        <div class="workspace-info">
          <h1>🏢 GestionPro</h1>
          <span class="workspace-subtitle">Messagerie d'entreprise</span>
        </div>
        <div class="connection-status">
          <div class="connection-indicator" [class.connected]="isWebSocketConnected">
            <mat-icon>{{ isWebSocketConnected ? 'wifi' : 'wifi_off' }}</mat-icon>
            <span>{{ isWebSocketConnected ? 'Connecté' : 'Déconnecté' }}</span>
          </div>
        </div>
        <div class="header-actions">
            <button mat-icon-button class="search-btn" (click)="openGlobalSearch()">
              <mat-icon>search</mat-icon>
            </button>
            <button mat-icon-button [matBadge]="unreadCount" matBadgeColor="warn" (click)="showUnreadMessages()">
              <mat-icon>notifications</mat-icon>
            </button>
            <button mat-icon-button (click)="debugState()" title="Debug">
              <mat-icon>bug_report</mat-icon>
            </button>
            <div class="user-profile" (click)="openUserMenu()">
              <img [src]="currentUserAvatar" [alt]="currentUserName" class="user-avatar">
              <div class="user-status" [class]="currentUserStatus"></div>
            </div>
          </div>
      </div>

      <div class="slack-content">
        <!-- Sidebar Slack-style -->
        <div class="slack-sidebar">
          <!-- Canaux -->
          <div class="sidebar-section">
            <div class="section-header" (click)="toggleChannels()">
              <mat-icon class="expand-icon" [class.expanded]="channelsExpanded">keyboard_arrow_right</mat-icon>
              <span>Canaux</span>
              <button mat-icon-button class="add-channel-btn" (click)="createChannel()">
                <mat-icon>add</mat-icon>
              </button>
            </div>
            <div class="channels-list" [class.collapsed]="!channelsExpanded">
              <div *ngFor="let channel of channels" 
                   class="channel-item" 
                   [class.active]="selectedConversation?.id === channel.id"
                   (click)="selectConversation(channel)">
                <span class="channel-hash">#</span>
                <span class="channel-name">{{ channel.name }}</span>
                <span *ngIf="channel.unreadCount > 0" class="unread-count">{{ channel.unreadCount }}</span>
              </div>
            </div>
          </div>

          <!-- Messages Directs -->
          <div class="sidebar-section">
            <div class="section-header" (click)="toggleDirectMessages()">
              <mat-icon class="expand-icon" [class.expanded]="directMessagesExpanded">keyboard_arrow_right</mat-icon>
              <span>Messages directs</span>
              <button mat-icon-button class="add-dm-btn" (click)="startDirectMessage()">
                <mat-icon>add</mat-icon>
              </button>
            </div>
            <div class="direct-messages-list" [class.collapsed]="!directMessagesExpanded">
              <div *ngFor="let dm of directMessages" 
                   class="dm-item" 
                   [class.active]="selectedConversation?.id === dm.id"
                   (click)="selectConversation(dm)">
                <div class="dm-avatar">
                  <img [src]="dm.otherUserAvatar || getDefaultAvatar(dm.name)" [alt]="dm.name" class="user-avatar-small">
                  <div class="user-status-indicator" [class]="dm.otherUserStatus || 'online'"></div>
                </div>
                <span class="dm-name">{{ dm.name || 'Conversation sans nom' }}</span>
                <span *ngIf="dm.unreadCount > 0" class="unread-count">{{ dm.unreadCount }}</span>
              </div>
            </div>
          </div>

          <!-- Utilisateurs en ligne -->
          <div class="sidebar-section">
            <div class="section-header" (click)="toggleOnlineUsers()">
              <mat-icon class="expand-icon" [class.expanded]="onlineUsersExpanded">keyboard_arrow_right</mat-icon>
              <span>En ligne ({{ onlineUsers.length }})</span>
            </div>
            <div class="online-users-list" [class.collapsed]="!onlineUsersExpanded">
              <div *ngFor="let user of onlineUsers" 
                   class="user-item" 
                   (click)="startDirectMessageWith(user)">
                <div class="user-avatar-container">
                  <img [src]="user.avatar || getDefaultAvatar(user.name)" [alt]="user.name" class="user-avatar-small">
                  <div class="user-status-indicator" [class]="user.status"></div>
                </div>
                <div class="user-info">
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-status-text">{{ user.statusMessage || getStatusText(user.status) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Zone de messages Slack-style -->
        <div class="slack-main-content" *ngIf="selectedConversation">
          <!-- Header du canal/conversation -->
          <div class="conversation-header">
            <div class="conversation-info">
              <h2 class="conversation-title">
                <span *ngIf="selectedConversation.type === 'GROUP'" class="channel-hash">#</span>
                {{ selectedConversation.name }}
              </h2>
              <div class="conversation-details">
                <span class="member-count" *ngIf="selectedConversation.type === 'GROUP'">
                  {{ selectedConversation.participantIds?.length || 0 }} membres
                </span>
                <span class="conversation-description" *ngIf="selectedConversation.description">
                  {{ selectedConversation.description }}
                </span>
              </div>
            </div>
            <div class="conversation-actions">
              <button mat-icon-button (click)="toggleConversationInfo()" matTooltip="Infos conversation">
                <mat-icon>info</mat-icon>
              </button>
            </div>
          </div>

          <!-- Section Messages Épinglés -->
          <div class="pinned-messages-section" *ngIf="getPinnedMessages().length > 0">
            <div class="pinned-header">
              <mat-icon class="pin-icon">push_pin</mat-icon>
              <span class="pinned-title">Messages épinglés</span>
              <button mat-icon-button class="close-pinned-btn" (click)="hidePinnedSection = !hidePinnedSection">
                <mat-icon>{{ hidePinnedSection ? 'expand_more' : 'expand_less' }}</mat-icon>
              </button>
            </div>
            <div class="pinned-messages-list" *ngIf="!hidePinnedSection">
              <div class="pinned-message-item" *ngFor="let pinnedMsg of getPinnedMessages()">
                <div class="pinned-message-content" (click)="scrollToMessage(pinnedMsg.id)">
                  <span class="pinned-message-text">{{ pinnedMsg.content }}</span>
                </div>
                <button mat-icon-button class="unpin-btn" 
                        matTooltip="Désépingler"
                        (click)="togglePin(pinnedMsg)">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Messages style Instagram/Messenger -->
          <div class="messages-container" #messagesContainer>
            <div class="messages-list">
              <div *ngFor="let message of messages" 
                   class="message-row" 
                   [attr.data-message-id]="message.id"
                   [ngClass]="{ 'outgoing': isOutgoing(message), 'incoming': !isOutgoing(message) }">
                
                <!-- Avatar pour messages entrants -->
                <img *ngIf="!isOutgoing(message)" 
                     class="bubble-avatar" 
                     [src]="message.senderAvatar || getDefaultAvatar(message.senderName)" 
                     [alt]="message.senderName">
                
                <!-- Conteneur du message -->
                <div class="message-wrapper">
                  <!-- Nom de l'expéditeur (messages entrants uniquement) -->
                  <div *ngIf="!isOutgoing(message)" class="sender-name">
                    {{ message.senderName || 'Utilisateur' }}
                  </div>
                  
                  <!-- Bulle + Réactions groupées -->
                  <div class="bubble-container">
                    <!-- Bulle du message -->
                    <div class="bubble">
                      <div *ngIf="message.pinned" class="pin-badge">
                        <span class="pin-text">Épinglé</span>
                        <span class="pin-dot"></span>
                      </div>
                      
                      <div class="bubble-text" [innerHTML]="renderMessageHtml(message)"></div>
                    </div>
                    
                    <!-- Réactions EXTERNES (hors bulle, juste en dessous) -->
                    <div class="external-reactions" *ngIf="groupReactions(message.reactions).length">
                      <span class="reaction-chip" 
                            *ngFor="let r of groupReactions(message.reactions).slice(0, 3)"
                            [class.user-reacted]="hasUserReacted(message, r.emoji)"
                            (click)="reactToMessage(message, r.emoji)">
                        <span class="emoji">{{ r.emoji }}</span>
                        <span class="count">{{ r.count }}</span>
                      </span>
                      <span class="reaction-more" *ngIf="groupReactions(message.reactions).length > 3">
                        +{{ groupReactions(message.reactions).length - 3 }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Métadonnées : Heure (très discrète) -->
                  <div class="bubble-meta">
                    <span class="message-time">{{ formatSlackTime(message.sentAt) }}</span>
                    <span *ngIf="isOutgoing(message)" class="ticks">
                      <mat-icon class="tick" [class.read]="message.read || message.status==='READ'">{{ (message.read || message.status==='READ') ? 'done_all' : 'done' }}</mat-icon>
                    </span>
                  </div>
                  
                  <!-- Actions flottantes style Messenger (au survol) -->
                  <div class="message-actions-toolbar">
                    <!-- Bouton réaction rapide -->
                    <button class="action-btn reaction-btn" 
                            matTooltip="Réagir"
                            (click)="$event.stopPropagation(); toggleEmojiPicker(message.id)">
                      <mat-icon>sentiment_satisfied</mat-icon>
                    </button>
                    

                    
                    <!-- Menu 3 points -->
                    <button class="action-btn more-btn" 
                            mat-icon-button 
                            [matMenuTriggerFor]="isOutgoing(message) ? outMenu : inMenu"
                            matTooltip="Plus d'actions"
                            #trigger="matMenuTrigger" 
                            (click)="$event.stopPropagation(); setContextMessage(message); trigger.openMenu()">
                      <mat-icon>more_horiz</mat-icon>
                    </button>
                  </div>
                  
                  <!-- Picker d'emoji flottant -->
                  <div class="emoji-picker-popup" *ngIf="showEmojiPickerForMessage === message.id" (click)="$event.stopPropagation()">
                    <div class="emoji-picker-grid">
                      <button *ngFor="let emoji of reactionEmojis" 
                              class="emoji-option"
                              (click)="reactToMessage(message, emoji)">
                        {{ emoji }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Indicateur de frappe -->
              <div class="typing-indicator" *ngIf="typingUsers.length > 0">
                <div class="typing-avatar-group">
                  <img *ngFor="let user of typingUsers.slice(0, 3)" 
                       [src]="getDefaultAvatar(user)" 
                       class="typing-avatar"
                       [alt]="user">
                </div>
                <div class="typing-text">
                  <span *ngIf="typingUsers.length === 1">{{ typingUsers[0] }} est en train d'écrire</span>
                  <span *ngIf="typingUsers.length === 2">{{ typingUsers[0] }} et {{ typingUsers[1] }} sont en train d'écrire</span>
                  <span *ngIf="typingUsers.length > 2">{{ typingUsers.length }} personnes sont en train d'écrire</span>
                  <span class="typing-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Menus contextuels (en dehors du ngFor) -->
            <mat-menu #outMenu="matMenu" class="message-context-menu">
              <button mat-menu-item (click)="$event.stopPropagation(); reactToMessage(contextMessage, '❤️')">
                <mat-icon>favorite</mat-icon>
                <span>Réagir avec ❤️</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="$event.stopPropagation(); editMessage(contextMessage)">
                <mat-icon>edit</mat-icon>
                <span>Modifier le message</span>
              </button>
              <button mat-menu-item (click)="$event.stopPropagation(); togglePin(contextMessage)">
                <mat-icon>{{ contextMessage?.pinned ? 'push_pin' : 'push_pin' }}</mat-icon>
                <span>{{ contextMessage?.pinned ? 'Désépingler' : 'Épingler' }}</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="$event.stopPropagation(); deleteMessageForMe(contextMessage)" class="delete-action">
                <mat-icon>delete_outline</mat-icon>
                <span>Supprimer pour moi</span>
              </button>
              <button mat-menu-item (click)="$event.stopPropagation(); deleteMessageForEveryone(contextMessage)" class="delete-action-danger">
                <mat-icon>delete</mat-icon>
                <span>Supprimer pour tous</span>
              </button>
            </mat-menu>
            
            <mat-menu #inMenu="matMenu" class="message-context-menu">
              <button mat-menu-item (click)="$event.stopPropagation(); reactToMessage(contextMessage, '❤️')">
                <mat-icon>favorite</mat-icon>
                <span>Réagir avec ❤️</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="$event.stopPropagation(); togglePin(contextMessage)">
                <mat-icon>{{ contextMessage?.pinned ? 'push_pin' : 'push_pin' }}</mat-icon>
                <span>{{ contextMessage?.pinned ? 'Désépingler' : 'Épingler' }}</span>
              </button>
            </mat-menu>
          </div>

          <!-- Zone de saisie Slack-style -->
          <div class="message-input-container">
            
            <div class="message-input-wrapper">
              <div class="input-toolbar">
                <button mat-icon-button class="emoji-btn" (click)="openEmojiPicker()">
                  <mat-icon>sentiment_satisfied</mat-icon>
                </button>
              </div>

              <div class="message-input-field">
                <textarea 
                  [(ngModel)]="newMessage.content"
                  placeholder="Envoyer un message à {{ selectedConversation.name }}"
                  class="message-textarea"
                  (input)="onMessageInput($event)"
                  (keydown)="onMessageKeydown($event)"
                  (keydown.enter)="handleEnterKey($event)"
                  #messageInput></textarea>
                
                <!-- Picker d'emoji pour l'input -->
                <div class="input-emoji-picker" *ngIf="showInputEmojiPicker" (click)="$event.stopPropagation()">
                  <div class="emoji-picker-header">
                    <span>Choisir un emoji</span>
                    <button mat-icon-button class="close-picker-btn" (click)="showInputEmojiPicker = false">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                  <div class="input-emoji-grid">
                    <button *ngFor="let emoji of inputEmojis" 
                            class="input-emoji-option"
                            (click)="insertEmoji(emoji)">
                      {{ emoji }}
                    </button>
                  </div>
                </div>
                
                <div class="mention-suggestions" *ngIf="isMentioning && mentionSuggestions.length">
                  <div class="mention-item" *ngFor="let u of mentionSuggestions; let i = index" [class.active]="i===mentionActiveIndex" (mousedown)="selectMention(u)">
                    <img [src]="u.avatar || getDefaultAvatar(u.username)" class="mention-avatar" />
                    <span class="mention-name">@{{ u.username }}</span>
                    <span class="mention-email">{{ u.email }}</span>
                  </div>
                </div>
              </div>

              <div class="input-actions">
                <button mat-icon-button 
                        class="send-btn"
                        [disabled]="!newMessage.content?.trim() || sending"
                        (click)="sendMessage()">
                  <mat-icon>send</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Message d'accueil ou chargement -->
        <div class="slack-welcome" *ngIf="!selectedConversation">
          <div class="welcome-content">
            <mat-spinner *ngIf="isLoading" diameter="50"></mat-spinner>
            <ng-container *ngIf="!isLoading">
              <mat-icon class="welcome-icon">chat_bubble_outline</mat-icon>
              <h3>Bienvenue sur GestionPro</h3>
              <p>Sélectionnez un canal ou démarrez une conversation pour commencer.</p>
            </ng-container>
          </div>
        </div>

        <!-- Panneau d'info conversation (owner) -->
        <div class="conversation-info-panel" *ngIf="showConversationInfo && selectedConversation">
          <h3>Réglages de la discussion</h3>
          <div class="field-row">
            <label>Titre</label>
            <input [(ngModel)]="conversationEdit.name" placeholder="Titre de la discussion" />
          </div>
          <div class="field-row">
            <label>Description</label>
            <textarea [(ngModel)]="conversationEdit.description" rows="2" placeholder="Description"></textarea>
          </div>
          <div class="field-row">
            <label>Confidentialité</label>
            <mat-select [(ngModel)]="conversationEdit.isPublic">
              <mat-option [value]="false">Privée</mat-option>
              <mat-option [value]="true">Publique</mat-option>
            </mat-select>
          </div>
          <div class="field-row">
            <label>Participants</label>
            <div class="participants">
              <div class="participant" *ngFor="let pid of selectedParticipantIds">
                <span>{{ getUserNameById(pid) }}</span>
                <button mat-icon-button color="warn" (click)="removeParticipant(pid)" [disabled]="pid===currentUserId" matTooltip="Retirer">
                  <mat-icon>remove_circle</mat-icon>
                </button>
              </div>
            </div>
            <div class="invite-row">
              <input [(ngModel)]="inviteQuery" (input)="searchUsers()" placeholder="Inviter par nom ou email" />
              <div class="search-results" *ngIf="userSearchResults.length">
                <div class="result-item" *ngFor="let u of userSearchResults" (click)="addParticipant(u)">
                  <img [src]="u.avatar || getDefaultAvatar(u.username)" class="result-avatar" />
                  <span>{{ u.username }} ({{ u.email }})</span>
                </div>
              </div>
            </div>
          </div>
          <div class="actions">
            <button mat-stroked-button (click)="showConversationInfo=false">Annuler</button>
            <button mat-flat-button color="primary" (click)="saveConversationSettings()">Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Messenger-like floating popups -->
    <div class="messenger-popups" *ngIf="incomingNotifications.length">
      <div class="popup-card" *ngFor="let n of incomingNotifications">
        <img class="popup-avatar" [src]="getDefaultAvatar(n.senderName)" />
        <div class="popup-content" (click)="openFromNotification(n)">
          <div class="popup-title">{{ n.senderName }}</div>
          <div class="popup-preview">{{ n.preview }}</div>
        </div>
        <button class="popup-close" (click)="dismissNotification(n)">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .slack-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f8f9fa;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* Header Slack-style */
    .slack-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #350d36;
      color: white;
      padding: 8px 16px;
      box-shadow: 0 1px 0 rgba(255,255,255,0.1);
    }

    .workspace-info h1 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
    }

    .workspace-subtitle {
      font-size: 12px;
      opacity: 0.8;
    }

    .connection-status {
      display: flex;
      align-items: center;
      margin: 0 16px;
    }

    .connection-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      background: rgba(255,255,255,0.1);
      color: #ff6b6b;
    }

    .connection-indicator.connected {
      color: #51cf66;
    }

    .connection-indicator mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-profile {
      display: flex;
      align-items: center;
      cursor: pointer;
      position: relative;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      object-fit: cover;
    }

    .user-status {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid #350d36;
    }

    .user-status.online { background: #2eb67d; }
    .user-status.away { background: #ecb22e; }
    .user-status.busy { background: #e01e5a; }
    .user-status.offline { background: #868686; }

    /* Content Layout */
    .slack-content {
      display: flex;
      flex: 1;
      min-height: 0;
    }

    /* Sidebar */
    .slack-sidebar {
      width: 260px;
      background: #19171d;
      color: #d1d2d3;
      overflow-y: auto;
      border-right: 1px solid #3f3f46;
    }

    .sidebar-section {
      margin-bottom: 16px;
    }

    .section-header {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      cursor: pointer;
      font-weight: 600;
      font-size: 15px;
      color: #d1d2d3;
    }

    .section-header:hover {
      background: rgba(255,255,255,0.04);
    }

    .expand-icon {
      font-size: 18px;
      margin-right: 8px;
      transition: transform 0.2s;
    }

    .expand-icon.expanded {
      transform: rotate(90deg);
    }

    .add-channel-btn, .add-dm-btn {
      margin-left: auto;
      width: 24px;
      height: 24px;
      color: #d1d2d3;
    }

    /* Channels */
    .channels-list, .direct-messages-list, .online-users-list {
      max-height: 200px;
      overflow-y: auto;
    }

    .channels-list.collapsed, .direct-messages-list.collapsed, .online-users-list.collapsed {
      display: none;
    }

    .channel-item, .dm-item {
      display: flex;
      align-items: center;
      padding: 4px 16px 4px 40px;
      cursor: pointer;
      color: #d1d2d3;
      font-size: 15px;
    }

    .channel-item:hover, .dm-item:hover {
      background: rgba(255,255,255,0.04);
    }

    .channel-item.active, .dm-item.active {
      background: #1164a3;
      color: white;
    }

    .channel-hash {
      margin-right: 8px;
      font-weight: bold;
    }

    .channel-name, .dm-name {
      flex: 1;
    }

    .unread-count {
      background: #e01e5a;
      color: white;
      border-radius: 10px;
      padding: 2px 6px;
      font-size: 12px;
      font-weight: 600;
      margin-left: auto;
    }

    .dm-avatar {
      position: relative;
      margin-right: 8px;
    }

    .user-avatar-small {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      object-fit: cover;
      background: #e0e0e0;
    }
    
    .user-avatar-small[src="null"],
    .user-avatar-small[src=""],
    .user-avatar-small:not([src]) {
      content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect fill="%23ccc" width="20" height="20"/><text x="10" y="14" text-anchor="middle" fill="white" font-size="10">?</text></svg>');
    }

    .user-status-indicator {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: 1px solid #19171d;
    }

    .user-status-indicator.online { background: #2eb67d; }
    .user-status-indicator.away { background: #ecb22e; }
    .user-status-indicator.busy { background: #e01e5a; }
    .user-status-indicator.offline { background: #868686; }

    .user-item {
      display: flex;
      align-items: center;
      padding: 6px 16px 6px 40px;
      cursor: pointer;
      color: #d1d2d3;
    }

    .user-item:hover {
      background: rgba(255,255,255,0.04);
    }

    .user-avatar-container {
      position: relative;
      margin-right: 8px;
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      display: block;
      font-size: 15px;
      font-weight: 600;
    }

    .user-status-text {
      display: block;
      font-size: 13px;
      color: #868686;
    }

    /* Main Content */
    .slack-main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: white;
    }

    .conversation-info-panel {
      position: absolute;
      right: 16px;
      top: 64px;
      width: 320px;
      background: #fff;
      border: 1px solid #e1e5e9;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      z-index: 10;
    }
    .conversation-info-panel h3 { margin: 0 0 8px 0; font-size: 16px; }
    .conversation-info-panel .field-row { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
    .conversation-info-panel input, .conversation-info-panel textarea { border: 1px solid #e1e5e9; border-radius: 6px; padding: 8px; font: inherit; }
    .conversation-info-panel .actions { display: flex; gap: 8px; justify-content: flex-end; }
    .participants { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
    .participant { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 8px; background: #f8f9fa; border-radius: 6px; }
    .invite-row { position: relative; }
    .invite-row input { width: 100%; border: 1px solid #e1e5e9; border-radius: 6px; padding: 8px; }
    .search-results { position: absolute; left: 0; right: 0; background: #fff; border: 1px solid #e1e5e9; border-radius: 6px; max-height: 220px; overflow: auto; z-index: 20; }
    .result-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; cursor: pointer; }
    .result-item:hover { background: #f5f7fb; }
    .result-avatar { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; }

    .conversation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid #e1e5e9;
      background: white;
    }

    .conversation-title {
      margin: 0;
      font-size: 18px;
      font-weight: 900;
      color: #1d1c1d;
    }

    .conversation-details {
      font-size: 13px;
      color: #616061;
      margin-top: 2px;
    }

    /* Section Messages Épinglés */
    .pinned-messages-section {
      background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
      border-bottom: 2px solid #e1e5e9;
      padding: 12px 16px;
      animation: slideDown 0.3s ease;
    }

    .pinned-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      cursor: pointer;
    }

    .pin-icon {
      color: #1976d2;
      font-size: 20px;
      width: 20px;
      height: 20px;
      transform: rotate(45deg);
    }

    .pinned-title {
      font-size: 14px;
      font-weight: 600;
      color: #1976d2;
      flex: 1;
    }

    .close-pinned-btn {
      width: 28px !important;
      height: 28px !important;
      padding: 0 !important;
    }

    .close-pinned-btn mat-icon {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
    }

    .pinned-messages-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      animation: fadeIn 0.3s ease;
    }

    .pinned-message-item {
      display: flex;
      align-items: center;
      gap: 8px;
      background: white;
      padding: 8px 12px;
      border-radius: 8px;
      border-left: 3px solid #1976d2;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      transition: all 0.2s ease;
    }

    .pinned-message-item:hover {
      box-shadow: 0 2px 6px rgba(0,0,0,0.12);
      transform: translateX(2px);
    }

    .pinned-message-content {
      flex: 1;
      cursor: pointer;
    }

    .pinned-message-text {
      font-size: 13px;
      color: #1d1c1d;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .unpin-btn {
      width: 24px !important;
      height: 24px !important;
      padding: 0 !important;
      opacity: 0.6;
      transition: opacity 0.2s ease;
    }

    .unpin-btn:hover {
      opacity: 1;
      background: rgba(0,0,0,0.05) !important;
    }

    .unpin-btn mat-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Highlight message effect */
    .highlight-message {
      animation: highlightPulse 2s ease;
    }

    @keyframes highlightPulse {
      0%, 100% {
        background-color: transparent;
      }
      50% {
        background-color: rgba(25, 118, 210, 0.15);
      }
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
    }

    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 4px;  /* Espacement entre les messages */
    }

    /* Indicateur de frappe */
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 8px;
      margin-top: 8px;
      animation: fadeIn 0.3s ease;
    }

    .typing-avatar-group {
      display: flex;
      gap: -8px;
    }

    .typing-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      margin-left: -8px;
    }

    .typing-avatar:first-child {
      margin-left: 0;
    }

    .typing-text {
      font-size: 13px;
      color: #65676b;
      font-style: italic;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .typing-dots {
      display: inline-flex;
      gap: 3px;
      margin-left: 4px;
    }

    .typing-dots .dot {
      width: 4px;
      height: 4px;
      background: #65676b;
      border-radius: 50%;
      display: inline-block;
      animation: typingBounce 1.4s infinite ease-in-out;
    }

    .typing-dots .dot:nth-child(1) {
      animation-delay: 0s;
    }

    .typing-dots .dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-dots .dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typingBounce {
      0%, 60%, 100% {
        transform: translateY(0);
      }
      30% {
        transform: translateY(-8px);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* New chat bubble styles */
    .message-row {
      display: flex;
      align-items: flex-start;  /* Alignement en HAUT pour l'avatar */
      margin: 4px 0;
      gap: 8px;
      transition: background-color 0.2s ease;
      padding: 2px 0;
      position: relative;  /* Pour positionner la toolbar */
    }

    .message-row:hover {
      background-color: rgba(0, 0, 0, 0.02);
      border-radius: 8px;
      padding: 6px 8px;
      margin-left: -8px;
      margin-right: -8px;
    }

    .message-row.outgoing {
      justify-content: flex-end;
    }

    .bubble-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;  /* Empêche l'avatar de rétrécir */
      margin-top: 0;  /* Aligné avec le nom */
      align-self: flex-start;
    }

    /* Wrapper pour tout le contenu du message */
    .message-wrapper {
      display: flex;
      flex-direction: column;
      max-width: 65%;
      gap: 2px;
      min-width: 0;  /* Permet le word-wrap correct */
      position: relative;  /* Pour positionner la toolbar par rapport au wrapper */
    }

    .message-row.outgoing .message-wrapper {
      align-items: flex-end;
    }

    .message-row.incoming .message-wrapper {
      align-items: flex-start;
    }

    /* Nom de l'expéditeur */
    .sender-name {
      font-size: 12px;
      font-weight: 600;
      color: #65676b;
      padding-left: 12px;
      margin-bottom: 2px;
    }

    /* Conteneur pour bulle + réactions collées */
    .bubble-container {
      display: flex;
      flex-direction: column;
      gap: 3px;
      position: relative;
      width: 100%;
    }

    .bubble {
      padding: 10px 14px;
      border-radius: 18px;
      background: #f1f2f4; /* incoming */
      color: #1d1c1d;
      box-shadow: 0 1px 2px rgba(0,0,0,0.08);
      position: relative;
      width: fit-content;
      max-width: 100%;
    }

    .message-row.outgoing .bubble {
      background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .message-row.incoming .bubble {
      background: #e9ecef;
      color: #1d1c1d;
      border-bottom-left-radius: 4px;
    }

    /* Messages système */
    .message-row.system-message {
      justify-content: center;
      margin: 16px 0;
    }

    .message-row.system-message .bubble {
      background: rgba(0, 0, 0, 0.05);
      color: #65676b;
      font-size: 13px;
      padding: 6px 12px;
      border-radius: 12px;
      max-width: 80%;
      text-align: center;
      box-shadow: none;
    }

    .bubble-text {
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 15px;
      line-height: 1.4;
    }

    /* Réactions EXTERNES - hors bulle, collées à la bulle */
    .external-reactions {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: -2px;
      padding-left: 8px;
    }

    .message-row.outgoing .external-reactions {
      justify-content: flex-end;
      padding-left: 0;
      padding-right: 8px;
    }

    .message-row.incoming .external-reactions {
      justify-content: flex-start;
      padding-left: 8px;
    }

    .reaction-chip {
      background: #ffffff;
      border: 1px solid #e4e6eb;
      border-radius: 12px;
      padding: 3px 8px;
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .reaction-chip:hover {
      background: #f0f2f5;
      border-color: #007aff;
      transform: translateY(-1px);
    }

    /* Réaction de l'utilisateur actuel */
    .reaction-chip.user-reacted {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border-color: #007aff;
      border-width: 2px;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(0, 122, 255, 0.2);
    }

    .reaction-chip.user-reacted:hover {
      background: linear-gradient(135deg, #bbdefb 0%, #90caf9 100%);
      transform: translateY(-1px) scale(1.05);
    }

    .reaction-chip.user-reacted .count {
      color: #007aff;
      font-weight: 700;
    }

    .reaction-chip .emoji {
      font-size: 14px;
    }

    .reaction-chip .count {
      font-size: 11px;
      font-weight: 600;
      color: #65676b;
    }

    .reaction-more {
      background: #f0f2f5;
      border: 1px solid #e4e6eb;
      border-radius: 12px;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 600;
      color: #65676b;
      cursor: pointer;
    }

    /* Métadonnées (heure, statut) - très discrètes */
    .bubble-meta {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 0;
      font-size: 10px;
      opacity: 0;
      transition: opacity 0.2s ease;
      padding: 0 8px;
    }

    .message-row:hover .bubble-meta {
      opacity: 0.7;
    }

    .message-row.outgoing .bubble-meta {
      justify-content: flex-end;
      padding-right: 8px;
    }

    .message-row.incoming .bubble-meta {
      justify-content: flex-start;
      padding-left: 8px;
    }

    .message-time {
      font-size: 10px;
      color: #65676b;
      font-weight: 500;
    }

    /* Barre d'actions flottante style Messenger */
    .message-actions-toolbar {
      position: absolute;
      top: 0;
      display: flex;
      gap: 4px;
      background: white;
      border-radius: 20px;
      padding: 4px 6px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
      z-index: 100;
      pointer-events: none;
    }

    /* Position pour messages entrants (à droite du wrapper) */
    .message-row.incoming .message-wrapper .message-actions-toolbar {
      right: -116px;
    }

    /* Position pour messages sortants (à gauche du wrapper) */
    .message-row.outgoing .message-wrapper .message-actions-toolbar {
      left: -116px;
    }

    /* Afficher au survol */
    .message-row:hover .message-actions-toolbar {
      opacity: 1;
      visibility: visible;
      pointer-events: all;
    }

    /* Boutons d'action */
    .action-btn {
      width: 32px !important;
      height: 32px !important;
      min-width: 32px !important;
      min-height: 32px !important;
      border-radius: 50% !important;
      border: none;
      background: rgba(0, 0, 0, 0.05);
      cursor: pointer;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      color: #65676b;
      padding: 0 !important;
      line-height: 1 !important;
    }

    .action-btn:hover {
      background: #e4e6eb !important;
      transform: scale(1.15);
    }

    .action-btn mat-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      line-height: 18px !important;
    }

    .reaction-btn:hover {
      color: #f7b731 !important;
      background: #fff3cd !important;
    }

    .reply-btn:hover {
      color: #007aff !important;
      background: #e3f2fd !important;
    }

    .more-btn:hover {
      color: #1c1e21 !important;
      background: #e4e6eb !important;
    }

    /* Picker d'emoji flottant */
    .emoji-picker-popup {
      position: absolute;
      bottom: 100%;
      left: 0;
      margin-bottom: 8px;
      background: white;
      border-radius: 12px;
      padding: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      z-index: 150;
    }

    .message-row.outgoing .emoji-picker-popup {
      left: auto;
      right: 0;
    }

    .emoji-picker-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
    }

    .emoji-option {
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-size: 20px;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .emoji-option:hover {
      background: #f0f2f5;
      transform: scale(1.2);
    }



    /* Mentions */
    .mention-highlight {
      background: #e3f2fd;
      color: #007aff;
      padding: 2px 4px;
      border-radius: 4px;
      font-weight: 600;
    }

    /* Section de réponse */
    .reply-section {
      background: #f0f2f5;
      border-bottom: 1px solid #e4e6eb;
      padding: 8px 16px;
    }

    .reply-header-bar {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .reply-icon {
      color: #007aff;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .reply-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .reply-to-label {
      font-size: 12px;
      font-weight: 600;
      color: #007aff;
    }

    .reply-preview {
      font-size: 13px;
      color: #65676b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cancel-reply-btn {
      width: 24px !important;
      height: 24px !important;
      padding: 0 !important;
    }

    .cancel-reply-btn mat-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }

    /* Menu contextuel style Messenger */
    .message-context-menu {
      margin-top: 8px;
    }

    .message-context-menu .mat-mdc-menu-content {
      padding: 8px 0;
    }

    .message-context-menu button {
      min-height: 40px;
      font-size: 14px;
    }

    .message-context-menu mat-icon {
      margin-right: 12px;
      color: #65676b;
    }

    .message-context-menu .delete-action {
      color: #ff9800;
    }

    .message-context-menu .delete-action mat-icon {
      color: #ff9800;
    }

    .message-context-menu .delete-action-danger {
      color: #e53935;
      font-weight: 600;
    }

    .message-context-menu .delete-action-danger mat-icon {
      color: #e53935;
    }

    .message-context-menu .delete-action-danger:hover {
      background: #ffebee;
    }

    /* Cacher les réactions dans la bulle */
    .bubble .external-reactions,
    .bubble .bubble-reactions,
    .bubble .reactions-overlay {
      display: none !important;
    }
    .pin-badge { position: absolute; top: -10px; right: 8px; display: flex; align-items: center; gap: 6px; }
    .pin-text { font-size: 11px; color: #cfd8dc; }
    .pin-dot { width: 6px; height: 6px; background: #e53935; border-radius: 50%; display: inline-block; }
    
    .ticks { 
      display: inline-flex; 
      align-items: center; 
      margin-left: 2px; 
    }
    
    .tick { 
      font-size: 12px !important; 
      width: 12px !important;
      height: 12px !important;
      vertical-align: middle; 
      opacity: 0.75; 
    }
    
    .tick.read { 
      color: #2eb67d; 
      opacity: 1; 
    }
    /* Picker d'emoji pour l'input */
    .input-emoji-picker {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 100%;
      margin-bottom: 8px;
      background: white;
      border: 1px solid #e1e5e9;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      z-index: 40;
      max-height: 320px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .emoji-picker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #e1e5e9;
      background: #f8f9fa;
      font-weight: 600;
      font-size: 14px;
      color: #1d1c1d;
    }

    .close-picker-btn {
      width: 24px !important;
      height: 24px !important;
      padding: 0 !important;
    }

    .close-picker-btn mat-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }

    .input-emoji-grid {
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      gap: 4px;
      padding: 12px;
      overflow-y: auto;
      max-height: 260px;
    }

    .input-emoji-option {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      border-radius: 6px;
      font-size: 20px;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .input-emoji-option:hover {
      background: #f0f2f5;
      transform: scale(1.3);
    }

    .mention-suggestions { position: absolute; left: 0; right: 0; bottom: 48px; background: #fff; border: 1px solid #e1e5e9; border-radius: 8px; max-height: 220px; overflow: auto; box-shadow: 0 8px 24px rgba(0,0,0,0.08); z-index: 30; }
    .mention-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; cursor: pointer; }
    .mention-item.active, .mention-item:hover { background: #f5f7fb; }
    .mention-avatar { width: 22px; height: 22px; border-radius: 50%; object-fit: cover; }
    .mention-name { font-weight: 600; }
    .mention-email { font-size: 12px; color: #888; }
    .mention-highlight { color: #0b69ff; font-weight: 700; }

    /* Message Input */
    .message-input-container {
      padding: 20px;
      border-top: 1px solid #e1e5e9;
    }

    .message-input-wrapper {
      border: 1px solid #e1e5e9;
      border-radius: 8px;
      overflow: hidden;
    }

    .input-toolbar {
      display: flex;
      padding: 8px;
      border-bottom: 1px solid #e1e5e9;
      gap: 4px;
    }

    .attach-btn, .emoji-btn {
      width: 32px;
      height: 32px;
      color: #616061;
    }

    .message-input-field {
      position: relative;
    }

    .message-textarea {
      width: 100%;
      min-height: 44px;
      max-height: 200px;
      border: none;
      outline: none;
      padding: 12px;
      font-size: 15px;
      font-family: inherit;
      resize: none;
      background: transparent;
    }

    .input-actions {
      position: absolute;
      bottom: 8px;
      right: 8px;
    }

    .send-btn {
      width: 32px;
      height: 32px;
      background: #007a5a;
      color: white;
    }

    .send-btn:disabled {
      background: #e1e5e9;
      color: #616061;
    }

    /* Welcome Screen */
    .slack-welcome {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
    }

    /* Messenger-like popups */
    .messenger-popups {
      position: fixed;
      right: 16px;
      bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 9999;
    }
    .popup-card {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #fff;
      border: 1px solid #e1e5e9;
      border-radius: 12px;
      padding: 10px 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      max-width: 320px;
    }
    .popup-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
    .popup-content { cursor: pointer; }
    .popup-title { font-weight: 700; font-size: 14px; color: #111; }
    .popup-preview { font-size: 13px; color: #555; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .popup-close { border: none; background: transparent; cursor: pointer; color: #888; }

    .welcome-content {
      text-align: center;
      color: #616061;
    }

    .welcome-icon {
      font-size: 64px;
      color: #e1e5e9;
      margin-bottom: 16px;
    }

    .welcome-content h3 {
      margin-bottom: 8px;
      color: #1d1c1d;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .slack-sidebar {
        width: 240px;
      }
      
      .message-row { gap: 6px; }
    }
  `]
})
export class MessagingComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  // Subject pour gérer la destruction des subscriptions
  private destroy$ = new Subject<void>();
  isLoading = false;
  private isInitialized = false;

  // Données
  conversations: Conversation[] = [];
  channels: Conversation[] = [];
  directMessages: Conversation[] = [];
  onlineUsers: any[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  unreadCount: number = 0;
  
  // Getter pour les messages filtrés (utilisé dans le template)
  get filteredMessages(): Message[] {
    return this.messages;
  }

  // État de l'interface
  channelsExpanded: boolean = true;
  directMessagesExpanded: boolean = true;
  onlineUsersExpanded: boolean = true;

  // Utilisateur actuel
  currentUserId: string = '';
  currentUserName: string = '';
  currentUserAvatar: string = '';
  currentUserStatus: string = 'online';

  // Nouveau message
  newMessage: Partial<Message> = {
    content: ''
  };

  sending: boolean = false;
  typingUsers: string[] = [];
  isWebSocketConnected: boolean = false;

  private messagingService = inject(MessagingService);
  private authService = inject(AuthService);
  private websocketService = inject(FinalWebSocketService);
  private cdr = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);
  // private notificationService = inject(NotificationService); // Commenté pour éviter l'erreur MatDialog
  // private dialog = inject(MatDialog); // Commenté pour éviter l'erreur de provider

  constructor() {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id || '';
    this.currentUserName = currentUser?.username || '';
    this.currentUserAvatar = this.getDefaultAvatar(this.currentUserName);
  }

  // Mentions state
  isMentioning = false;
  mentionQuery = '';
  mentionSuggestions: any[] = [];
  mentionActiveIndex = 0;
  pendingMentions: string[] = []; // userIds
  incomingNotifications: any[] = [];
  contextMessage: any = null;
  
  // Réponse et réactions
  replyingTo: any = null;
  showEmojiPickerForMessage: string | null = null;
  showInputEmojiPicker: boolean = false;
  hidePinnedSection: boolean = false;
  reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🔥', '🎉', '✅'];
  inputEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
    '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤝', '🙏',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣️', '💕',
    '🔥', '✨', '💫', '⭐', '🌟', '💥', '💯', '✅', '❌', '⚠️'
  ];

  isOutgoing(msg: any): boolean {
    return (msg?.senderId && msg.senderId === this.currentUserId) ||
           (msg?.senderName && msg.senderName === this.currentUserName);
  }

  private buildCanonicalDmId(userIdA: string, userIdB: string): string {
    const pair = [userIdA, userIdB].sort();
    return `dm_${pair[0]}_${pair[1]}`;
  }
  
  private removeDuplicateConversations(conversations: any[]): any[] {
    const seenById = new Map();
    const seenByParticipants = new Map();
    const unique: any[] = [];
    
    for (const conv of conversations) {
      // Vérifier d'abord par ID
      if (seenById.has(conv.id)) {
        console.warn('⚠️ Conversation dupliquée (même ID) ignorée:', conv.id, conv.name);
        continue;
      }
      
      // Pour les messages directs, vérifier aussi par participants
      if (conv.type === 'DIRECT' && conv.participantIds && conv.participantIds.length >= 2) {
        // Créer une clé unique basée sur les participants (triés pour éviter les doublons)
        const participantKey = [...conv.participantIds].sort().join('_');
        
        if (seenByParticipants.has(participantKey)) {
          console.warn('⚠️ Conversation dupliquée (mêmes participants) ignorée:', conv.id, conv.name, 'participants:', conv.participantIds);
          continue;
        }
        
        seenByParticipants.set(participantKey, true);
      }
      
      seenById.set(conv.id, true);
      unique.push(conv);
    }
    
    return unique;
  }

  ngOnInit() {
    if (this.isInitialized) {
      console.warn('⚠️ ngOnInit déjà appelé, ignoré');
      return;
    }
    
    this.isInitialized = true;
    console.log('🚀 MessagingComponent ngOnInit');
    this.cleanupOldData();
    
    // Charger les conversations depuis le backend avec takeUntil pour éviter les fuites
    if (this.isLoading) {
      console.warn('⚠️ Chargement déjà en cours');
      return;
    }
    
    this.isLoading = true;
    this.messagingService.getConversations()
      .pipe(
        timeout(10000),
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('❌ Erreur chargement conversations:', err);
          this.isLoading = false;
          this.cdr.markForCheck();
          return of([]);
        })
      )
      .subscribe({
        next: (conversations) => {
          this.isLoading = false;
          console.log('✅ Conversations chargées:', conversations);
          
          // Supprimer les doublons basés sur l'ID
          const uniqueConversations = this.removeDuplicateConversations(conversations);
          console.log('🔄 Conversations après suppression des doublons:', uniqueConversations.length, 'sur', conversations.length);
          
          // Filtrer UNIQUEMENT les conversations DIRECT (pas de canaux)
          this.channels = []; // Désactiver les canaux pour simplifier
          this.directMessages = uniqueConversations
            .filter((c: any) => c.type === 'DIRECT')
            .filter((dm: any) => {
              // ❌ EXCLURE les conversations avec soi-même
              if (dm.participantIds && dm.participantIds.length === 2) {
                const [user1, user2] = dm.participantIds;
                if (user1 === user2) {
                  console.warn('🗑️ Conversation avec soi-même supprimée:', dm.id);
                  return false;
                }
                // Vérifier que l'utilisateur actuel fait partie de la conversation
                if (!dm.participantIds.includes(this.currentUserId)) {
                  console.warn('🗑️ Conversation sans utilisateur actuel supprimée:', dm.id);
                  return false;
                }
              }
              return true;
            })
            .map((dm: any) => {
              // Générer un nom à partir de l'AUTRE participant
              
              // Méthode 1: Utiliser participants (objets complets)
              if (dm.participants && dm.participants.length > 0) {
                const otherParticipants = dm.participants.filter((p: any) => p.id !== this.currentUserId);
                if (otherParticipants.length > 0) {
                  dm.name = otherParticipants.map((p: any) => p.username || p.name || 'Utilisateur').join(', ');
                  return dm;
                }
              }
              
              // Méthode 2: Utiliser participantNames (fallback)
              if (dm.participantNames && dm.participantNames.length > 0 && dm.participantIds && dm.participantIds.length > 0) {
                // Trouver l'index de l'autre participant
                const otherIndex = dm.participantIds.findIndex((id: string) => id !== this.currentUserId);
                if (otherIndex >= 0 && dm.participantNames[otherIndex]) {
                  dm.name = dm.participantNames[otherIndex];
                  return dm;
                }
              }
              
              // Méthode 3: Utiliser le nom existant si présent
              if (dm.name && dm.name.trim() !== '' && dm.name !== 'Conversation sans nom') {
                // Extraire seulement le nom de l'autre utilisateur si format "User1 - User2"
                if (dm.name.includes(' - ')) {
                  const names = dm.name.split(' - ');
                  // Trouver le nom qui n'est pas le nôtre
                  const otherName = names.find((n: string) => n.trim() !== this.currentUserName);
                  if (otherName) {
                    dm.name = otherName.trim();
                    return dm;
                  }
                }
                return dm;
              }
              
              // Si aucune méthode ne fonctionne, marquer comme invalide
              dm.name = null;
              return dm;
            })
            .filter((dm: any) => {
              // Supprimer les conversations sans nom valide
              if (!dm.name || dm.name.trim() === '') {
                console.warn('🗑️ Conversation sans nom supprimée:', dm.id, 'participants:', dm.participantIds, 'participantNames:', dm.participantNames);
                return false;
              }
              return true;
            });
          
          this.conversations = [...this.channels, ...this.directMessages] as any;
          
          console.log('📊 Channels:', this.channels.length, 'DMs:', this.directMessages.length);
          console.log('📋 Direct Messages détails:', this.directMessages.map(dm => ({ id: dm.id, name: dm.name, participants: dm.participantIds })));
          
          // Forcer la détection de changement
          this.cdr.markForCheck();
          
          // Sélectionner automatiquement la première conversation
          if (this.directMessages.length > 0) {
            console.log('📌 Sélection du premier DM');
            this.selectedConversation = this.directMessages[0];
            this.loadMessagesWithTimeout();
          } else if (this.channels.length > 0) {
            console.log('📌 Sélection du premier canal');
            this.selectedConversation = this.channels[0];
            this.loadMessagesWithTimeout();
          }
        },
        error: (err) => {
          console.error('❌ Erreur finale:', err);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    
    // Charger les utilisateurs en ligne
    this.loadOnlineUsers();
    
    // Setup WebSocket pour les messages en temps réel
    this.setupWebSocketConnection();
    console.log('✅ WebSocket ACTIVÉ (sans loadUnreadCount)');
  }
  
  private loadMessagesWithTimeout() {
    if (!this.selectedConversation) {
      console.warn('⚠️ loadMessagesWithTimeout: Aucune conversation sélectionnée');
      return;
    }
    
    const convId = this.selectedConversation.id as string;
    console.log('📨 loadMessagesWithTimeout: Chargement messages pour:', convId);
    console.log('📨 Conversation complète:', this.selectedConversation);
    
    this.messagingService.getMessages(convId, { limit: 50 })
      .pipe(
        timeout(10000),
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('❌ Erreur chargement messages:', err);
          return of([]);
        })
      )
      .subscribe({
        next: (messages) => {
          console.log('✅ Messages reçus depuis API:', messages?.length || 0, messages);
          if (!messages || messages.length === 0) {
            console.warn('⚠️ Aucun message reçu - tableau vide');
            this.messages = [];
          } else {
            this.messages = (messages || []).map((m: any) => ({
              ...m,
              senderAvatar: this.getDefaultAvatar(m.senderName),
              timestamp: new Date(m.timestamp || m.sentAt || new Date()),
              sentAt: new Date(m.sentAt || m.timestamp || new Date())
            }));
            console.log('✅ Messages après mapping:', this.messages.length, 'messages');
            console.log('✅ Premier message:', this.messages[0]);
          }
          
          // Forcer la détection de changement Angular
          console.log('🔄 Déclenchement de la détection de changement');
          this.cdr.markForCheck();
          
          setTimeout(() => this.scrollToBottom(), 50);
        },
        error: (err) => {
          console.error('❌ Erreur dans subscribe:', err);
          this.messages = [];
          this.cdr.markForCheck();
        }
      });
  }

  private cleanupOldData() {
    // Nettoyer les données avec les anciens noms pour éviter la confusion
    const onlineUsers = JSON.parse(localStorage.getItem('onlineUsers') || '[]');
    const cleanedUsers = onlineUsers.filter((u: any) => 
      u.name !== 'Chef de Projet' && u.name !== 'Décideur'
    );
    localStorage.setItem('onlineUsers', JSON.stringify(cleanedUsers));
  }

  ngOnDestroy() {
    // Émettre le signal de destruction pour unsubscribe de tous les observables
    this.destroy$.next();
    this.destroy$.complete();
    
    // Cleanup des listeners
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
    
    // Nettoyer le timeout si existe
    if (this.loadUnreadCountTimeout) {
      clearTimeout(this.loadUnreadCountTimeout);
    }
  }

  private setupMessageSync() {
    // Écouter les changements de localStorage pour la synchronisation
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  private setupWebSocketConnection() {
    // Utiliser takeUntil pour éviter les fuites mémoire et les subscriptions multiples
    this.websocketService.connectionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((connected: boolean) => {
        this.isWebSocketConnected = connected;
        console.log('🔌 WebSocket connection status:', connected);
        
        if (connected) {
          // Demander la liste des utilisateurs connectés
          this.websocketService.ping();
        }
      });

    this.websocketService.chatMessages$
      .pipe(takeUntil(this.destroy$))
      .subscribe((wsMessage: any) => {
        console.log('📨 New chat message received:', wsMessage);
        this.handleRealTimeMessage(wsMessage);
      });

    this.websocketService.connectedUsers$
      .pipe(takeUntil(this.destroy$))
      .subscribe((users: any[]) => {
        this.onlineUsers = users || [];
        console.log('👥 Connected users updated:', this.onlineUsers);
      });
  }

  private loadUnreadCountTimeout: any = null;
  
  private handleRealTimeMessage(wsMessage: any) {
    // Vérifier si le message est valide
    if (!wsMessage) {
      return;
    }
    
    // Supporte soit format { type, data: { conversationId, message } } soit message direct
    const envelope = wsMessage?.data ? wsMessage.data : wsMessage;
    const conversationId = envelope?.conversationId || envelope?.message?.conversationId;
    const msg = envelope.message || envelope;

    if (!msg || !conversationId) return;

    if (this.selectedConversation && this.selectedConversation.id === conversationId) {
      if (!this.messages.find(m => m.id === msg.id)) {
        this.messages.push({
          ...msg,
          senderAvatar: this.getDefaultAvatar(msg.senderName),
          timestamp: new Date(msg.timestamp || msg.sentAt || new Date()),
          sentAt: new Date(msg.sentAt || new Date())
        } as any);
        this.cdr.markForCheck();
        setTimeout(() => this.scrollToBottom(), 50);
      }
    } else {
      // Incrémenter non-lus sur la conversation concernée
      const conv = [...this.channels, ...this.directMessages].find(c => c.id === conversationId);
      if (conv) {
        (conv as any).unreadCount = ((conv as any).unreadCount || 0) + 1;
      }
      // Notification Messenger-like
      if (msg.senderId !== this.currentUserId) {
        const item = {
          conversationId,
          senderName: msg.senderName || 'Utilisateur',
          preview: String(msg.content || '').slice(0, 120),
          conv
        } as any;
        if (!Array.isArray(this.incomingNotifications)) this.incomingNotifications = [] as any;
        this.incomingNotifications.unshift(item);
        setTimeout(() => {
          this.incomingNotifications = this.incomingNotifications.filter(x => x !== item);
        }, 10000);
      }
    }

    // DÉSACTIVÉ: loadUnreadCount cause des blocages
    // Ne pas recharger le unread count pour éviter les boucles
    console.log('⚠️ loadUnreadCount désactivé pour éviter les blocages');
  }

  private handleStorageChange(event: StorageEvent) {
    if (event.key === 'onlineUsers') {
      // Recharger les utilisateurs en ligne
      this.loadOnlineUsers();
    } else if (event.key === 'newMessage' || (event.key && event.key.startsWith('messageSync_'))) {
      // Nouveau message reçu d'un autre onglet
      this.handleNewMessage(event.newValue);
    }
  }

  private handleNewMessage(messageData: string | null) {
    if (!messageData) return;
    
    try {
      const syncData = JSON.parse(messageData);
      const { conversationId, message } = syncData;
      
      // Si c'est pour la conversation actuellement affichée
      if (this.selectedConversation && this.selectedConversation.id === conversationId) {
        // Vérifier que le message n'existe pas déjà
        if (!this.messages.find(m => m.id === message.id)) {
          this.messages.push({
            ...message,
            senderAvatar: this.getDefaultAvatar(message.senderName),
            timestamp: new Date(message.timestamp),
            sentAt: new Date(message.sentAt)
          });
          setTimeout(() => this.scrollToBottom(), 100);
        }
      } else {
        // Si c'est pour une autre conversation, recharger quand on y retourne
        this.updateConversationUnreadCount(conversationId);
      }
    } catch (error) {
      console.error('Erreur parsing message sync:', error);
    }
  }

  private updateConversationUnreadCount(conversationId: string) {
    // Trouver la conversation et incrementer le compteur non lu
    const conversation = [...this.channels, ...this.directMessages].find(c => c.id === conversationId);
    if (conversation && conversation.id !== this.selectedConversation?.id) {
      conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    }
  }

  // Méthodes d'interface
  toggleChannels() {
    this.channelsExpanded = !this.channelsExpanded;
  }

  toggleDirectMessages() {
    this.directMessagesExpanded = !this.directMessagesExpanded;
  }

  toggleOnlineUsers() {
    this.onlineUsersExpanded = !this.onlineUsersExpanded;
  }

  // Méthodes de conversation
  selectConversation(conversation: Conversation) {
    console.log('Selecting conversation:', conversation);
    // Forcer ID DM canonique si nécessaire
    if ((conversation as any).type === 'DIRECT' && (conversation as any).participantIds?.length === 2) {
      const canonicalId = this.buildCanonicalDmId((conversation as any).participantIds[0], (conversation as any).participantIds[1]);
      (conversation as any).id = canonicalId;
    }
    this.selectedConversation = conversation;
    this.loadMessages();
    
    // Marquer la conversation comme lue
    if (conversation.unreadCount && conversation.unreadCount > 0) {
      conversation.unreadCount = 0;
    }
  }

  loadConversations() {
    this.messagingService.getConversations()
      .pipe(takeUntil(this.destroy$))
      .subscribe(conversations => {
      // Supprimer les doublons
      const uniqueConversations = this.removeDuplicateConversations(conversations);
      
      this.channels = uniqueConversations.filter((c: any) => c.type === 'GROUP' || c.type === 'CHANNEL');
      this.directMessages = uniqueConversations.filter((c: any) => c.type === 'DIRECT');
      this.conversations = uniqueConversations as any;
    });
  }

  loadMessages() {
    console.log('📥 loadMessages() appelé');
    if (!this.selectedConversation) {
      console.warn('⚠️ Aucune conversation sélectionnée');
      return;
    }
    
    // Canoniser l'ID pour DM
    let convId: string = this.selectedConversation.id as any;
    if ((this.selectedConversation as any).type === 'DIRECT') {
      const p = (this.selectedConversation as any).participantIds || [];
      if (p.length === 2) convId = this.buildCanonicalDmId(p[0], p[1]);
    }
    
    console.log('📨 Chargement des messages pour conversation:', convId);
    this.messagingService.getMessages(convId, { limit: 50 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (messages) => {
        console.log('✅ Messages reçus:', messages?.length || 0, messages);
        this.messages = (messages || []).map((m: any) => ({
          ...m,
          senderAvatar: this.getDefaultAvatar(m.senderName),
          timestamp: new Date(m.timestamp || m.sentAt || new Date()),
          sentAt: new Date(m.sentAt || m.timestamp || new Date())
        }));
        setTimeout(() => this.scrollToBottom(), 50);

        // Marquer comme lu côté serveur
        this.messagingService.markConversationRead(convId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
          next: () => {
            (this.selectedConversation as any).unreadCount = 0;
            // Ne pas recharger unreadCount ici pour éviter les boucles
            console.log('✅ Conversation marquée comme lue');
          },
          error: (err) => {
            console.error('❌ Erreur marquage comme lu:', err);
          }
        });
      },
      error: (err) => {
        console.error('❌ Erreur chargement messages:', err);
        this.messages = [];
      }
    });
  }

  loadOnlineUsers() {
    this.messagingService.getUsersPresence()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (users) => {
      this.onlineUsers = (users || [])
        .filter((u: any) => {
          // Filtrer uniquement les utilisateurs authentifiés (status !== 'offline')
          const status = (u.status || 'online').toLowerCase();
          return status !== 'offline' && status !== 'disconnected';
        })
        .filter((u: any) => {
          // ❌ EXCLURE l'utilisateur actuel de la liste "En ligne"
          const userId = u.userId || u.id;
          return userId !== this.currentUserId;
        })
        .map((u: any) => {
          const username = u.username || u.name || 'User';
          return {
            id: u.userId || u.id,
            name: username,
            avatar: this.getDefaultAvatar(username),
            status: (u.status || 'online').toLowerCase(),
            statusMessage: u.statusMessage || ''
          };
        });
      console.log('👥 Online users loaded (sans utilisateur actuel):', this.onlineUsers);
      this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Chargement présence utilisateurs', err);
        // Aucun fallback: on affiche vide si le backend ne répond pas
        this.onlineUsers = [];
      }
    });
  }

  loadUnreadCount() {
    console.log('🔢 loadUnreadCount() appelé');
    // Charger depuis serveur pour précision avec timeout de 5 secondes
    this.messagingService.getUnreadCounts()
      .pipe(
        timeout(5000), // Timeout de 5 secondes
        catchError(err => {
          console.error('❌ Erreur ou timeout chargement unread count:', err);
          return of({}); // Retourner un objet vide en cas d'erreur
        })
      )
      .subscribe({
        next: (map: any) => {
          let total = 0;
          [...this.channels, ...this.directMessages].forEach((c: any) => {
            c.unreadCount = (map && map[c.id]) || 0;
            total += c.unreadCount;
          });
          this.unreadCount = total;
          console.log('✅ Unread count mis à jour:', total);
        },
        error: (err) => {
          console.error('❌ Erreur finale chargement unread count:', err);
          this.unreadCount = 0;
        }
      });
  }

  initializeDefaultChannels() {
    // Créer les canaux par défaut s'ils n'existent pas
    const defaultChannels = [
      { name: 'général', description: 'Discussions générales' },
      { name: 'commercial', description: 'Équipe commerciale' },
      { name: 'projets', description: 'Gestion de projets' },
      { name: 'urgences', description: 'Messages critiques' }
    ];

    // TODO: Implémenter la création de canaux par défaut
  }

  // Méthodes de message
  sendMessage() {
    if (!this.newMessage.content?.trim() || !this.selectedConversation || this.sending) return;

    this.sending = true;
    const payload: any = {
      content: this.newMessage.content,
      senderId: this.currentUserId,
      senderName: this.currentUserName,
      // S'assurer d'utiliser l'ID canonique pour DM
      conversationId: ((this.selectedConversation as any).type === 'DIRECT' && (this.selectedConversation as any).participantIds?.length === 2)
        ? this.buildCanonicalDmId((this.selectedConversation as any).participantIds[0], (this.selectedConversation as any).participantIds[1])
        : (this.selectedConversation as any).id,
      // Utiliser participantIds et exclure l'expéditeur
      recipientIds: ((this.selectedConversation as any).participantIds || []).filter((id: string) => id !== this.currentUserId),
      messageType: (this.selectedConversation as any).type || 'DIRECT',
      timestamp: new Date(),
      read: false,
      mentions: this.pendingMentions,
      // Ajouter l'URL du fichier si présent
      fileUrl: (this.newMessage as any).fileUrl || null,
      fileName: (this.newMessage as any).fileName || null
    };

    this.messagingService.sendMessage(payload).subscribe({
      next: saved => {
        this.messages.push({
          ...saved,
          senderAvatar: this.getDefaultAvatar(saved.senderName),
          timestamp: new Date(saved.timestamp || new Date()),
          sentAt: new Date(saved.sentAt || new Date()),
          fileUrl: (this.newMessage as any).fileUrl, // Conserver l'URL du fichier
          fileName: (this.newMessage as any).fileName
        } as any);
        this.websocketService.sendChatMessage(this.selectedConversation!.id!, payload.content);
        this.scrollToBottom();
        this.resetNewMessage();
        this.pendingMentions = [];
        // Réinitialiser les infos de fichier
        delete (this.newMessage as any).fileUrl;
        delete (this.newMessage as any).fileName;
        (this as any)._lastAttachment = null;
        this.sending = false;
      },
      error: _ => {
        this.sending = false;
      }
    });
  }

  handleEnterKey(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  resetNewMessage() {
    this.newMessage = {
      content: ''
    };
    this.isMentioning = false;
    this.mentionQuery = '';
    this.mentionSuggestions = [];
    this.mentionActiveIndex = 0;
  }

  // Méthodes utilitaires
  getDefaultAvatar(name: string): string {
    if (!name) {
      name = 'User';
    }
    const colors = ['#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50'];
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colorIndex = name.length % colors.length;
    
    // Générer une image SVG avec les initiales
    const svg = `
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" fill="${colors[colorIndex]}" rx="6"/>
        <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="600">${initials}</text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  getUserAvatar(userId: string): string {
    const user = this.onlineUsers.find(u => u.id === userId);
    return user?.avatar || this.getDefaultAvatar(userId);
  }

  formatSlackTime(date: Date | string | undefined): string {
    if (!date) return '';
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'online': return 'En ligne';
      case 'away': return 'Absent';
      case 'busy': return 'Occupé';
      case 'offline': return 'Hors ligne';
      default: return 'Inconnu';
    }
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  // Méthodes d'action (à implémenter)
  openGlobalSearch() { console.log('Recherche globale'); }
  showUnreadMessages() { console.log('Messages non lus'); }
  openUserMenu() { console.log('Menu utilisateur'); }
  createChannel() { console.log('Créer un canal'); }
  startDirectMessage() { console.log('Nouveau message direct'); }
  startDirectMessageWith(user: any) { 
    console.log('Message direct avec', user.name); 
    
    // ❌ BLOQUER les conversations avec soi-même
    if (user.id === this.currentUserId) {
      console.warn('🚫 Impossible de créer une conversation avec soi-même');
      return;
    }
    
    // Vérifier si une conversation existe déjà dans la liste
    const existingDm = this.directMessages.find(dm => {
      if (!dm.participantIds || dm.participantIds.length !== 2) return false;
      return dm.participantIds.includes(this.currentUserId) && dm.participantIds.includes(user.id);
    });
    
    if (existingDm) {
      // Si la conversation existe déjà, la sélectionner
      console.log('✅ Conversation existante trouvée:', existingDm.id);
      this.selectConversation(existingDm);
      return;
    }
    
    // Sinon, vérifier côté backend si une conversation existe
    this.messagingService.getDirectConversation(this.currentUserId, user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (existingConv: Conversation | null) => {
          if (existingConv && existingConv.name && existingConv.name !== 'Conversation sans nom') {
            // Conversation valide trouvée
            console.log('✅ Conversation backend trouvée:', existingConv.id);
            // Vérifier qu'elle n'est pas déjà dans la liste
            if (!this.directMessages.find(dm => dm.id === existingConv.id)) {
              this.directMessages.push(existingConv);
            }
            this.selectConversation(existingConv);
            this.cdr.markForCheck();
          } else {
            // Créer une nouvelle conversation via le backend
            const newConv: any = {
              name: `${user.name}`, // Seulement le nom de l'autre utilisateur
              type: 'DIRECT',
              participantIds: [this.currentUserId, user.id],
              participantNames: [this.currentUserName, user.name],
              participants: [this.currentUserId, user.id],
              createdBy: this.currentUserId,
              createdByName: this.currentUserName,
              isPublic: false
            };
            
            this.messagingService.createConversation(newConv)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (created: Conversation) => {
                  if (created && created.name && created.name !== 'Conversation sans nom') {
                    this.directMessages.push(created);
                    this.selectConversation(created);
                    this.cdr.markForCheck();
                  }
                },
                error: (err: any) => {
                  console.error('❌ Erreur création conversation:', err);
                }
              });
          }
        },
        error: (err: any) => {
          console.error('❌ Erreur recherche conversation:', err);
        }
      });
  }
  // toggleConversationInfo fusionné ci-dessous
  showConversationInfo: boolean = false;
  conversationEdit: any = { name: '', description: '', isPublic: false };
  inviteQuery = '';
  userSearchResults: any[] = [];

  private userCache: Record<string, any> = {};
  get selectedParticipantIds(): string[] {
    return (this.selectedConversation as any)?.participantIds || [];
  }
  getUserNameById(id: string): string {
    const cached = this.userCache[id];
    if (cached?.username) return cached.username;
    const fromOnline = this.onlineUsers.find(u => u.id === id);
    return fromOnline?.name || id;
  }

  toggleConversationInfo() {
    this.showConversationInfo = !this.showConversationInfo;
    if (this.showConversationInfo && this.selectedConversation) {
      this.conversationEdit = {
        name: (this.selectedConversation as any).name || '',
        description: (this.selectedConversation as any).description || '',
        isPublic: (this.selectedConversation as any).isPublic || false
      };
    }
  }

  saveConversationSettings() {
    if (!this.selectedConversation) return;
    const id = (this.selectedConversation as any).id as string;
    this.messagingService.updateConversation(id, this.conversationEdit).subscribe(updated => {
      // Mettre à jour le titre dans l'en-tête
      (this.selectedConversation as any).name = (updated as any).name;
      (this.selectedConversation as any).description = (updated as any).description;
      (this.selectedConversation as any).isPublic = (updated as any).isPublic;
      this.showConversationInfo = false;
    });
  }

  searchUsers() {
    if (!this.inviteQuery || this.inviteQuery.length < 2) { this.userSearchResults = []; return; }
    fetch(`${this.messagingService['apiUrl']}/users/search?q=${encodeURIComponent(this.inviteQuery)}`, {
      headers: { 'Authorization': localStorage.getItem('accessToken') ? `Bearer ${localStorage.getItem('accessToken')}` : '' }
    }).then(r => r.json()).then(list => this.userSearchResults = list || []);
  }

  addParticipant(user: any) {
    if (!this.selectedConversation) return;
    const id = (this.selectedConversation as any).id as string;
    this.messagingService.addParticipant(id, user.id).subscribe(updated => {
      (this.selectedConversation as any).participantIds = (updated as any).participantIds;
      this.userSearchResults = [];
      this.inviteQuery = '';
      this.userCache[user.id] = user;
    });
  }

  removeParticipant(userId: string) {
    if (!this.selectedConversation) return;
    const id = (this.selectedConversation as any).id as string;
    this.messagingService.removeParticipant(id, userId).subscribe(updated => {
      (this.selectedConversation as any).participantIds = (updated as any).participantIds;
    });
  }
  addReaction(message: Message) { console.log('Ajouter réaction', message); }
  deleteMessage(message: any) {
    if (!confirm('Supprimer ce message ?')) return;
    this.messagingService.deleteMessage(message.id, this.currentUserId).subscribe({
      next: () => {
        this.messages = this.messages.filter(m => (m as any).id !== message.id);
      }
    });
  }
  
  deleteMessageForMe(message: any) {
    if (!confirm('Supprimer ce message pour vous uniquement ?')) return;
    this.messagingService.deleteMessage(message.id, this.currentUserId).subscribe({
      next: () => {
        // Marquer comme supprimé localement
        const msg = this.messages.find(m => (m as any).id === message.id);
        if (msg) (msg as any).deletedForMe = true;
      }
    });
  }
  
  deleteMessageForEveryone(message: any) {
    if (!confirm('⚠️ Supprimer ce message pour tout le monde ? Cette action est irréversible.')) return;
    this.messagingService.deleteMessage(message.id, 'everyone').subscribe({
      next: () => {
        this.messages = this.messages.filter(m => (m as any).id !== message.id);
      }
    });
  }
  editMessage(message: any) {
    const newContent = prompt('Modifier le message:', message.content);
    if (newContent == null || newContent.trim() === '' || newContent === message.content) return;
    this.messagingService.editMessage(message.id!, newContent).subscribe(updated => {
      message.content = (updated as any).content || newContent;
      message.edited = true;
      message.editedAt = new Date();
    });
  }
  reactToMessage(message: any, emoji: string) {
    if (!message.reactions) message.reactions = [] as any;
    
    // Trouver la réaction existante de l'utilisateur
    const existingReactionIndex = (message.reactions as any[]).findIndex(
      r => r.userId === this.currentUserId
    );
    
    // Si l'utilisateur a déjà une réaction
    if (existingReactionIndex !== -1) {
      const existingReaction = message.reactions[existingReactionIndex];
      
      // Si c'est le même emoji, retirer la réaction (toggle)
      if (existingReaction.emoji === emoji) {
        message.reactions.splice(existingReactionIndex, 1);
        this.messagingService.removeReaction(message.id, emoji).subscribe();
      } else {
        // Sinon, remplacer par le nouveau emoji
        existingReaction.emoji = emoji;
        existingReaction.timestamp = new Date();
        this.messagingService.addReaction(message.id, emoji).subscribe();
      }
    } else {
      // Pas de réaction existante, ajouter la nouvelle
      (message.reactions as any[]).push({ 
        emoji, 
        userId: this.currentUserId, 
        userName: this.currentUserName, 
        timestamp: new Date() 
      });
      this.messagingService.addReaction(message.id, emoji).subscribe();
    }
    
    // Fermer le picker après avoir réagi
    this.showEmojiPickerForMessage = null;
  }
  
  // Afficher/masquer le picker d'emoji pour un message
  toggleEmojiPicker(messageId: string | undefined) {
    if (!messageId) return;
    if (this.showEmojiPickerForMessage === messageId) {
      this.showEmojiPickerForMessage = null;
    } else {
      this.showEmojiPickerForMessage = messageId;
    }
  }
  
  // Démarrer une réponse à un message
  startThread(message: any) {
    this.replyingTo = {
      id: message.id,
      senderName: message.senderName,
      content: message.content,
      timestamp: message.sentAt || message.timestamp
    };
    // Focus sur l'input de message
    setTimeout(() => {
      const textarea = document.querySelector('.message-textarea') as HTMLTextAreaElement;
      if (textarea) textarea.focus();
    }, 100);
  }
  
  // Annuler la réponse
  cancelReply() {
    this.replyingTo = null;
  }

  togglePin(message: any) {
    this.messagingService.togglePin(message.id).subscribe((updated: any) => {
      if (updated && typeof updated.pinned === 'boolean') message.pinned = updated.pinned;
      else message.pinned = !message.pinned;
    });
  }
  
  getPinnedMessages(): any[] {
    return this.messages.filter(m => (m as any).pinned === true);
  }
  
  hasUserReacted(message: any, emoji: string): boolean {
    if (!message.reactions || !Array.isArray(message.reactions)) return false;
    return (message.reactions as any[]).some(
      r => r.userId === this.currentUserId && r.emoji === emoji
    );
  }
  
  scrollToMessage(messageId: string) {
    setTimeout(() => {
      const element = document.querySelector(`[data-message-id="${messageId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight temporaire
        element.classList.add('highlight-message');
        setTimeout(() => element.classList.remove('highlight-message'), 2000);
      }
    }, 100);
  }


  
  openEmojiPicker() {
    this.showInputEmojiPicker = !this.showInputEmojiPicker;
  }
  
  insertEmoji(emoji: string) {
    const currentContent = this.newMessage.content || '';
    this.newMessage.content = currentContent + emoji;
    this.showInputEmojiPicker = false;
    // Focus sur le textarea
    setTimeout(() => {
      const textarea = document.querySelector('.message-textarea') as HTMLTextAreaElement;
      if (textarea) textarea.focus();
    }, 50);
  }

  // Mentions: input handling
  onMessageInput(event: any) {
    const value: string = this.newMessage.content || '';
    const atIndex = value.lastIndexOf('@');
    if (atIndex >= 0) {
      const after = value.substring(atIndex + 1);
      const stop = /\s|\.|,|!|\?|:|;/.test(after);
      if (!stop) {
        this.isMentioning = true;
        this.mentionQuery = after.toLowerCase();
        this.fetchMentionSuggestions(this.mentionQuery);
        return;
      }
    }
    this.isMentioning = false;
    this.mentionQuery = '';
    this.mentionSuggestions = [];
  }

  onMessageKeydown(event: KeyboardEvent) {
    if (!this.isMentioning || !this.mentionSuggestions.length) return;
    if (event.key === 'ArrowDown') { this.mentionActiveIndex = (this.mentionActiveIndex + 1) % this.mentionSuggestions.length; event.preventDefault(); }
    if (event.key === 'ArrowUp') { this.mentionActiveIndex = (this.mentionActiveIndex - 1 + this.mentionSuggestions.length) % this.mentionSuggestions.length; event.preventDefault(); }
    if (event.key === 'Enter') { this.selectMention(this.mentionSuggestions[this.mentionActiveIndex]); event.preventDefault(); }
    if (event.key === 'Escape') { this.isMentioning = false; this.mentionSuggestions = []; }
  }

  fetchMentionSuggestions(q: string) {
    const participants = this.selectedParticipantIds
      .map(id => ({ id, username: this.getUserNameById(id), email: '', avatar: this.getUserAvatar(id) }))
      .filter(u => u.username.toLowerCase().includes(q));
    fetch(`${this.messagingService['apiUrl']}/users/search?q=${encodeURIComponent(q)}`, {
      headers: { 'Authorization': localStorage.getItem('accessToken') ? `Bearer ${localStorage.getItem('accessToken')}` : '' }
    }).then(r => r.json()).then(list => {
      const merged = [...participants, ...(list || [])];
      const dedup: any[] = [];
      const seen = new Set<string>();
      for (const u of merged) { if (!seen.has(u.id)) { seen.add(u.id); dedup.push(u); } }
      this.mentionSuggestions = dedup.slice(0, 10);
      this.mentionActiveIndex = 0;
    });
  }

  selectMention(user: any) {
    const value: string = this.newMessage.content || '';
    const atIndex = value.lastIndexOf('@');
    if (atIndex >= 0) {
      const prefix = value.substring(0, atIndex);
      const newValue = `${prefix}@${user.username} `;
      this.newMessage.content = newValue;
      if (!this.pendingMentions.includes(user.id)) this.pendingMentions.push(user.id);
    }
    this.isMentioning = false;
    this.mentionSuggestions = [];
  }



  groupReactions(reactions: any[] = []): { emoji: string; count: number }[] {
    if (!reactions || !Array.isArray(reactions)) {
      return [];
    }
    const map = new Map<string, number>();
    for (const r of reactions) {
      if (r && r.emoji) {
        map.set(r.emoji, (map.get(r.emoji) || 0) + 1);
      }
    }
    return Array.from(map.entries()).map(([emoji, count]) => ({ emoji, count }));
  }

  ngAfterViewInit() {
    // Rien à faire pour l'instant
  }
  
  /**
   * Rendre le HTML du message avec emojis et mentions
   */
  renderMessageHtml(message: any): SafeHtml {
    if (!message || !message.content) return '';
    
    let content = message.content;
    
    // Convertir quelques emojis texte basiques en Unicode
    content = content
      .replace(/:\)/g, '😊')
      .replace(/:\(/g, '🙁')
      .replace(/:D/g, '😃')
      .replace(/<3/g, '❤️');
    
    // Mettre en valeur @username
    content = content.replace(/(^|\s)@([a-zA-Z0-9_\.\-]+)/g, (full: string, space: string, name: string) => 
      `${space}<span class="mention-highlight">@${name}</span>`
    );
    
    // Convertir les URLs en liens cliquables
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    content = content.replace(urlRegex, '<a href="$1" target="_blank" style="color: #007aff; text-decoration: underline;">$1</a>');
    
    // Convertir les retours à la ligne en <br>
    content = content.replace(/\n/g, '<br>');
    
    // Marquer le HTML comme sûr
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  // Méthodes de debug
  debugState() {
    console.log('=== DEBUG STATE ===');
    console.log('Current User:', this.currentUserId, this.currentUserName);
    console.log('Selected Conversation:', this.selectedConversation);
    console.log('Channels:', this.channels);
    console.log('Direct Messages:', this.directMessages);
    console.log('Messages:', this.messages.length);
    console.log('Online Users:', this.onlineUsers);
  }
  
  // Méthode pour tester les notifications
  testNotification() {
    const testNotification = {
      conversationId: 'test-conv-' + Date.now(),
      senderName: 'Utilisateur Test',
      preview: 'Ceci est un message de test pour vérifier que les notifications s\'affichent correctement ! 🎉',
      conv: { id: 'test-conv', name: 'Test Conversation' }
    };
    
    if (!Array.isArray(this.incomingNotifications)) {
      this.incomingNotifications = [];
    }
    
    this.incomingNotifications.unshift(testNotification);
    
    // Auto-dismiss après 10 secondes
    setTimeout(() => {
      this.incomingNotifications = this.incomingNotifications.filter(x => x !== testNotification);
    }, 10000);
    
    console.log('✅ Notification de test ajoutée !');
  }
  dismissNotification(n: any) {
    this.incomingNotifications = this.incomingNotifications.filter(x => x !== n);
  }
  openFromNotification(n: any) {
    if (n.conv) this.selectConversation(n.conv);
    this.dismissNotification(n);
  }
  setContextMessage(m: any) { this.contextMessage = m || null; }
}
