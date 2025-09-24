import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-simplified-topbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './simplified-topbar.component.html',
  styleUrls: ['./simplified-topbar.component.scss']
})
export class SimplifiedTopbarComponent {
  @Input() appName = 'GestionPro Admin';
  @Input() userName = 'Admin User';
  @Input() userRole = 'Administrator';
  @Input() userEmail = 'admin@gestionpro.com';
  @Input() notificationCount = 5;
  @Input() isDarkMode = false;

  @Output() searchChange = new EventEmitter<string>();
  @Output() themeToggle = new EventEmitter<boolean>();
  @Output() logoutEvent = new EventEmitter<void>();
  @Output() profileEvent = new EventEmitter<void>();
  @Output() settingsEvent = new EventEmitter<void>();

  searchTerm = '';
  searchQuery = '';
  showSearch = true;

  constructor(private router: Router, private dialog: MatDialog) {}

  notifications = [
    {
      id: 1,
      type: 'info',
      title: 'Nouveau utilisateur inscrit',
      message: 'Un nouvel utilisateur s\'est inscrit sur la plateforme',
      time: 'Il y a 5 minutes',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Convention expirée',
      message: 'La convention CONV-2024-001 expire dans 3 jours',
      time: 'Il y a 1 heure',
      read: false
    },
    {
      id: 3,
      type: 'success',
      title: 'Facture payée',
      message: 'La facture INV-2024-001 a été payée avec succès',
      time: 'Il y a 2 heures',
      read: true
    }
  ];

  onSearchChange() {
    this.searchChange.emit(this.searchTerm);
  }

  clearSearch() {
    this.searchTerm = '';
    this.onSearchChange();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.themeToggle.emit(this.isDarkMode);
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'info': 'info',
      'warning': 'warning',
      'error': 'error',
      'success': 'check_circle'
    };
    return icons[type] || 'info';
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
  }

  viewAllNotifications() {
    console.log('View all notifications');
  }

  goToProfile() {
    this.profileEvent.emit();
  }

  goToSettings() {
    this.settingsEvent.emit();
  }

  logout() {
    this.logoutEvent.emit();
  }

  onSearch() {
    this.searchChange.emit(this.searchQuery);
  }

  onProfile() {
    this.profileEvent.emit();
  }

  onSettings() {
    this.settingsEvent.emit();
  }

  onLogout() {
    this.logoutEvent.emit();
  }

  openMessagingDialog(): void {
    alert('CLIC DÉTECTÉ !');
    console.log('🔔 Clic sur icône message détecté');
  }
}







