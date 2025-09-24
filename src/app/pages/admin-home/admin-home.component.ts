import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnifiedSidebarComponent } from '../../shared/components/unified-sidebar/unified-sidebar.component';
import { SimplifiedTopbarComponent } from '../../shared/components/simplified-topbar/simplified-topbar.component';
import { CompleteAdminDashboardComponent } from '../../dashboard/admin-dashboard/complete-admin-dashboard.component';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [
    CommonModule,
    UnifiedSidebarComponent,
    SimplifiedTopbarComponent,
    CompleteAdminDashboardComponent
  ],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent {
  sidebarCollapsed = false;
  isDarkMode = false;

  onSidebarCollapse(event: any) {
    const collapsed = event.target?.checked || event;
    this.sidebarCollapsed = collapsed;
  }

  onSearchChange(event: any) {
    const searchTerm = event.target?.value || event;
    console.log('Search term:', searchTerm);
    // Implémenter la recherche globale
  }

  onThemeToggle(event: any) {
    const isDark = event.target?.checked || event;
    this.isDarkMode = isDark;
    // Implémenter le changement de thème
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  onLogout() {
    console.log('Logout clicked');
    // Implémenter la déconnexion
  }

  onProfileClick() {
    console.log('Profile clicked');
    // Navigation vers le profil
  }

  onSettingsClick() {
    console.log('Settings clicked');
    // Navigation vers les paramètres
  }
}







