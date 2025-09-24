import { Component, OnInit, OnDestroy, Input, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
                <span class="dm-name">{{ dm.name }}</span>
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
                  <img [src]="user.avatar" [alt]="user.name" class="user-avatar-small">
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

          <!-- Messages style Instagram/Messenger -->
          <div class="messages-container" #messagesContainer>
            <div class="messages-list">
              <div *ngFor="let message of messages" 
                   class="message-row" 
                   [ngClass]="{ 'outgoing': isOutgoing(message), 'incoming': !isOutgoing(message) }">
                <img *ngIf="!isOutgoing(message)" 
                     class="bubble-avatar" 
                     [src]="message.senderAvatar || getDefaultAvatar(message.senderName)" 
                     [alt]="message.senderName">
                <div class="bubble">
                  <div *ngIf="message.pinned" class="pin-badge">
                    <span class="pin-text">Épinglé</span>
                    <span class="pin-dot"></span>
                  </div>
                  <div class="bubble-text" [innerHTML]="renderMessageHtml(message)"></div>
                  <div class="bubble-reactions" *ngIf="(message.reactions?.length || 0) > 0">
                    <span class="reaction-chip" *ngFor="let r of groupReactions(message.reactions)">{{ r.emoji }} {{ r.count }}</span>
                  </div>
                  <div class="reactions-overlay" *ngIf="groupReactions(message.reactions).length">
                    <span class="overlay-emoji" *ngFor="let r of groupReactions(message.reactions) | slice:0:3">
                      {{ r.emoji }}<span *ngIf="r.count>1" class="overlay-count">{{ r.count }}</span>
                    </span>
                  </div>
                  <div class="bubble-meta">
                    {{ formatSlackTime(message.sentAt) }}
                    <span *ngIf="isOutgoing(message)" class="ticks">
                      <mat-icon class="tick" [class.read]="message.read || message.status==='READ'">{{ (message.read || message.status==='READ') ? 'done_all' : 'done' }}</mat-icon>
                    </span>
                    <button *ngIf="isOutgoing(message)" class="bubble-action" mat-icon-button [matMenuTriggerFor]="outMenu" #outTrigger="matMenuTrigger" (click)="$event.stopPropagation(); setContextMessage(message); outTrigger.openMenu()">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <button *ngIf="!isOutgoing(message)" class="bubble-action" mat-icon-button [matMenuTriggerFor]="inMenu" #inTrigger="matMenuTrigger" (click)="$event.stopPropagation(); setContextMessage(message); inTrigger.openMenu()">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
              <mat-menu #outMenu="matMenu">
                <button mat-menu-item (click)="$event.stopPropagation(); editMessage(contextMessage)"><mat-icon>edit</mat-icon><span>Modifier</span></button>
                <button mat-menu-item (click)="$event.stopPropagation(); deleteMessage(contextMessage)"><mat-icon>delete</mat-icon><span>Supprimer</span></button>
                <button mat-menu-item (click)="$event.stopPropagation(); togglePin(contextMessage)"><mat-icon>push_pin</mat-icon><span>{{ contextMessage?.pinned ? 'Désépingler' : 'Épingler' }}</span></button>
                <button mat-menu-item (click)="$event.stopPropagation(); reactToMessage(contextMessage, '👍')"><mat-icon>thumb_up</mat-icon><span>Réagir 👍</span></button>
              </mat-menu>
              <mat-menu #inMenu="matMenu">
                <button mat-menu-item (click)="$event.stopPropagation(); reactToMessage(contextMessage, '👍')"><mat-icon>thumb_up</mat-icon><span>Réagir 👍</span></button>
                <button mat-menu-item (click)="$event.stopPropagation(); startThread(contextMessage)"><mat-icon>chat_bubble</mat-icon><span>Répondre en fil</span></button>
              </mat-menu>
            </div>
          </div>

          <!-- Zone de saisie Slack-style -->
          <div class="message-input-container">
            <div class="message-input-wrapper">
              <div class="input-toolbar">
                <input #fileInput type="file" hidden (change)="onFileSelected($event)" />
                <button mat-icon-button class="attach-btn" (click)="fileInput.click()">
                  <mat-icon>attach_file</mat-icon>
                </button>
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

        <!-- Message d'accueil -->
        <div class="slack-welcome" *ngIf="!selectedConversation">
          <div class="welcome-content">
            <mat-icon class="welcome-icon">chat_bubble_outline</mat-icon>
            <h3>Bienvenue sur GestionPro</h3>
            <p>Sélectionnez un canal ou démarrez une conversation pour commencer.</p>
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

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    /* New chat bubble styles */
    .message-row {
      display: flex;
      align-items: flex-end;
      margin: 6px 0;
      gap: 8px;
    }

    .message-row.outgoing {
      justify-content: flex-end;
    }

    .bubble-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
    }

    .bubble {
      max-width: 70%;
      padding: 8px 12px;
      border-radius: 16px;
      background: #f1f2f4; /* incoming */
      color: #1d1c1d;
      box-shadow: 0 1px 1px rgba(0,0,0,0.04);
      position: relative;
    }

    .message-row.outgoing .bubble {
      background: #007aff;
      color: white;
      border-top-right-radius: 4px;
      border-top-left-radius: 16px;
    }

    .message-row.incoming .bubble {
      background: #e9ecef;
      color: #1d1c1d;
      border-top-left-radius: 4px;
      border-top-right-radius: 16px;
    }

    .bubble-text {
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 15px;
      line-height: 1.4;
    }

    .bubble-meta {
      margin-top: 4px;
      font-size: 11px;
      opacity: 0.75;
      text-align: right;
    }
    .bubble-reactions { margin-top: 4px; display: flex; gap: 4px; flex-wrap: wrap; }
    .reaction-chip { background: rgba(0,0,0,0.06); border-radius: 12px; padding: 2px 6px; font-size: 12px; }
    .pin-badge { position: absolute; top: -10px; right: 8px; display: flex; align-items: center; gap: 6px; }
    .pin-text { font-size: 11px; color: #cfd8dc; }
    .pin-dot { width: 6px; height: 6px; background: #e53935; border-radius: 50%; display: inline-block; }
    .reactions-overlay { position: absolute; bottom: -8px; right: 6px; display: flex; gap: 4px; }
    .overlay-emoji { background: #2b2b2b; color: #fff; border-radius: 12px; padding: 0 6px; line-height: 18px; height: 18px; font-size: 12px; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.25); }
    .overlay-count { font-size: 11px; opacity: 0.9; }
    .bubble-action { width: 24px; height: 24px; vertical-align: middle; margin-left: 4px; }
    .ticks { margin-left: 6px; }
    .tick { font-size: 16px; vertical-align: middle; opacity: 0.75; }
    .tick.read { color: #2eb67d; opacity: 1; }
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

  // Données
  conversations: Conversation[] = [];
  channels: Conversation[] = [];
  directMessages: Conversation[] = [];
  onlineUsers: any[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  unreadCount: number = 0;

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

  isOutgoing(msg: any): boolean {
    return (msg?.senderId && msg.senderId === this.currentUserId) ||
           (msg?.senderName && msg.senderName === this.currentUserName);
  }

  private buildCanonicalDmId(userIdA: string, userIdB: string): string {
    const pair = [userIdA, userIdB].sort();
    return `dm_${pair[0]}_${pair[1]}`;
  }

  ngOnInit() {
    this.cleanupOldData();
    
    // Charger conversations depuis le backend
    this.messagingService.getConversations().subscribe({
      next: (conversations) => {
      // Séparer groupes et DMs selon le type
      this.channels = conversations.filter((c: any) => c.type === 'GROUP' || c.type === 'CHANNEL');
      this.directMessages = conversations.filter((c: any) => c.type === 'DIRECT');
      this.conversations = conversations as any;
      },
      error: (err) => {
        console.error('❌ Chargement conversations', err);
        // Fallback pour garder l'UI fonctionnelle si le backend renvoie 500
        this.channels = [
          { id: 'g1', name: 'général', type: 'GROUP', participantIds: [], unreadCount: 0 } as any,
          { id: 'g2', name: 'commercial', type: 'GROUP', participantIds: [], unreadCount: 0 } as any
        ];
        this.directMessages = [
          { id: 'dm_admin', name: 'Administrateur', type: 'DIRECT', participantIds: [], unreadCount: 0 } as any
        ];
        this.conversations = [...(this.channels as any), ...(this.directMessages as any)] as any;
      }
    });

    // Charger présence utilisateurs
    this.loadOnlineUsers();

    // WS temps réel
    this.setupWebSocketConnection();
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
    // Cleanup des listeners
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
  }

  private setupMessageSync() {
    // Écouter les changements de localStorage pour la synchronisation
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  private setupWebSocketConnection() {
    this.websocketService.connectionStatus$.subscribe((connected: boolean) => {
      this.isWebSocketConnected = connected;
      console.log('🔌 WebSocket connection status:', connected);
      
      if (connected) {
        // Demander la liste des utilisateurs connectés
        this.websocketService.ping();
      }
    });

    this.websocketService.chatMessages$.subscribe((wsMessage: any) => {
      console.log('📨 New chat message received:', wsMessage);
      this.handleRealTimeMessage(wsMessage);
    });

    this.websocketService.connectedUsers$.subscribe((users: any[]) => {
      this.onlineUsers = users || [];
      console.log('👥 Connected users updated:', this.onlineUsers);
    });
  }

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

    this.loadUnreadCount();
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
    this.messagingService.getConversations().subscribe(conversations => {
      this.channels = conversations.filter((c: any) => c.type === 'GROUP' || c.type === 'CHANNEL');
      this.directMessages = conversations.filter((c: any) => c.type === 'DIRECT');
      this.conversations = conversations as any;
    });
  }

  loadMessages() {
    if (!this.selectedConversation) return;
    // Canoniser l'ID pour DM
    let convId: string = this.selectedConversation.id as any;
    if ((this.selectedConversation as any).type === 'DIRECT') {
      const p = (this.selectedConversation as any).participantIds || [];
      if (p.length === 2) convId = this.buildCanonicalDmId(p[0], p[1]);
    }
    this.messagingService.getMessages(convId, { limit: 50 }).subscribe(messages => {
      this.messages = (messages || []).map((m: any) => ({
        ...m,
        senderAvatar: this.getDefaultAvatar(m.senderName),
        timestamp: new Date(m.timestamp || m.sentAt || new Date()),
        sentAt: new Date(m.sentAt || m.timestamp || new Date())
      }));
      setTimeout(() => this.scrollToBottom(), 50);

      // Marquer comme lu côté serveur
      this.messagingService.markConversationRead(convId).subscribe(() => {
        (this.selectedConversation as any).unreadCount = 0;
        this.loadUnreadCount();
      });
    });
  }

  loadOnlineUsers() {
    this.messagingService.getUsersPresence().subscribe({
      next: (users) => {
      this.onlineUsers = (users || []).map((u: any) => ({
        id: u.userId || u.id,
        name: u.username || u.name,
        avatar: this.getDefaultAvatar(u.username || u.name || 'U'),
        status: (u.status || 'online').toLowerCase(),
        statusMessage: u.statusMessage || ''
      }));
      },
      error: (err) => {
        console.error('❌ Chargement présence utilisateurs', err);
        // Aucun fallback: on affiche vide si le backend ne répond pas
        this.onlineUsers = [];
      }
    });
  }

  loadUnreadCount() {
    // Charger depuis serveur pour précision
    this.messagingService.getUnreadCounts().subscribe(map => {
      let total = 0;
      [...this.channels, ...this.directMessages].forEach((c: any) => {
        c.unreadCount = map[c.id] || 0;
        total += c.unreadCount;
      });
      this.unreadCount = total;
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
      mentions: this.pendingMentions
    };

    this.messagingService.sendMessage(payload).subscribe({
      next: saved => {
        this.messages.push({
          ...saved,
          senderAvatar: this.getDefaultAvatar(saved.senderName),
          timestamp: new Date(saved.timestamp || new Date()),
          sentAt: new Date(saved.sentAt || new Date())
        } as any);
        this.websocketService.sendChatMessage(this.selectedConversation!.id!, payload.content);
        this.scrollToBottom();
        this.resetNewMessage();
        this.pendingMentions = [];
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
    // Créer ou trouver la conversation directe
    const dmId = this.buildCanonicalDmId(this.currentUserId, user.id);
    let dm = this.directMessages.find(d => d.id === dmId);
    if (!dm) {
      dm = {
        id: dmId,
        name: user.name,
        type: 'DIRECT',
        participants: [this.currentUserId, user.id],
        participantIds: [this.currentUserId, user.id],
        unreadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        otherUserName: user.name,
        otherUserAvatar: user.avatar,
        otherUserStatus: user.status
      } as Conversation;
      this.directMessages.push(dm);
    }
    this.selectConversation(dm!);
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
    this.messagingService.addReaction(message.id, emoji).subscribe(() => {
      if (!message.reactions) message.reactions = [] as any;
      const exists = (message.reactions as any[]).some(r => r.emoji === emoji && r.userId === this.currentUserId);
      if (!exists) (message.reactions as any[]).push({ emoji, userId: this.currentUserId, userName: this.currentUserName, timestamp: new Date() });
    });
  }
  startThread(message: any) { console.log('Thread for', message.id); }

  togglePin(message: any) {
    this.messagingService.togglePin(message.id).subscribe((updated: any) => {
      if (updated && typeof updated.pinned === 'boolean') message.pinned = updated.pinned;
      else message.pinned = !message.pinned;
    });
  }

  onFileSelected(event: any) {
    const file = event?.target?.files?.[0];
    if (!file || !this.selectedConversation) return;
    this.messagingService.uploadAttachment(file, (this.selectedConversation as any).id as string)
      .subscribe(att => {
        // Envoyer un message système avec lien de fichier minimal
        const name = att?.name || file.name;
        const url = att?.url;
        this.newMessage.content = `${this.newMessage.content || ''}\n[Pièce jointe] ${name}`.trim();
        if (url) (this as any)._lastAttachment = { name, url };
      });
  }
  attachFile() { console.log('Joindre fichier'); }
  openEmojiPicker() { console.log('Sélecteur emoji'); }

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

  renderMessageHtml(msg: any): string {
    const content: string = (msg?.content || '').toString();
    // Convertir quelques emojis texte basiques en Unicode
    const emojified = content
      .replace(/:\)/g, '😊')
      .replace(/:\(/g, '🙁')
      .replace(/:D/g, '😃')
      .replace(/<3/g, '❤️');
    // Mettre en valeur @username
    let html = emojified.replace(/(^|\s)@([a-zA-Z0-9_\.\-]+)/g, (full, space, name) => `${space}<span class="mention-highlight">@${name}</span>`);
    const attachment = (this as any)._lastAttachment;
    if (attachment && html.includes('[Pièce jointe]')) {
      const safe = attachment.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`\\[Pièce jointe\\] ${safe}`);
      html = html.replace(re, `<a href="#" class=\"attachment-link\">[Pièce jointe] ${attachment.name}</a>`);
    }
    return html;
  }

  groupReactions(reactions: any[] = []): { emoji: string; count: number }[] {
    const map = new Map<string, number>();
    for (const r of reactions) {
      map.set(r.emoji, (map.get(r.emoji) || 0) + 1);
    }
    return Array.from(map.entries()).map(([emoji, count]) => ({ emoji, count }));
  }

  ngAfterViewInit() {
    document.addEventListener('click', (e: any) => {
      const a = e.target as HTMLElement;
      if (a && a.classList && a.classList.contains('attachment-link')) {
        e.preventDefault();
        const att = (this as any)._lastAttachment;
        if (att) console.log('Ouverture attachment viewer:', att); // Commenté pour éviter l'erreur de provider
      }
    });
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
  dismissNotification(n: any) {
    this.incomingNotifications = this.incomingNotifications.filter(x => x !== n);
  }
  openFromNotification(n: any) {
    if (n.conv) this.selectConversation(n.conv);
    this.dismissNotification(n);
  }
  setContextMessage(m: any) { this.contextMessage = m || null; }
}
