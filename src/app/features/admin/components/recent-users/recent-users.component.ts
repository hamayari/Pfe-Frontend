import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { User, UserRole } from '../../../../core/models/user.model';

@Component({
  selector: 'app-recent-users',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './recent-users.component.html',
  styleUrls: ['./recent-users.component.scss']
})
export class RecentUsersComponent implements OnChanges {
  @Input() users: User[] = [];
  @Input() maxItems: number = 5;
  
  displayedUsers: User[] = [];
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['users'] || changes['maxItems']) {
      this.updateDisplayedUsers();
    }
  }
  
  private updateDisplayedUsers(): void {
    if (this.users && this.users.length > 0) {
      this.displayedUsers = this.maxItems 
        ? [...this.users].slice(0, this.maxItems)
        : [...this.users];
    } else {
      this.displayedUsers = [];
    }
  }
  
  getRoleLabel(role: UserRole): string {
    const roleLabels: any = {
      [UserRole.ADMIN]: 'Administrateur',
      [UserRole.SUPER_ADMIN]: 'Super Admin',
      [UserRole.COMMERCIAL]: 'Commercial',
      [UserRole.PROJECT_MANAGER]: 'Chef de Projet',
      [UserRole.DECISION_MAKER]: 'Décideur'
    };
    
    return roleLabels[role] || role;
  }
  
  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  
  getRandomColor(seed: string): string {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 65%)`;
  }
  
  trackByUserId(index: number, user: User): string {
    return user.id;
  }
}
