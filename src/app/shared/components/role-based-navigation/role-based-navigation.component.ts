import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../../services/navigation.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-role-based-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="role-navigation">
      <ul class="nav-list">
        <li *ngFor="let item of navigationItems" class="nav-item">
          <a 
            [routerLink]="item.route" 
            routerLinkActive="active"
            class="nav-link"
            [class.disabled]="!canAccessItem(item)"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        </li>
      </ul>
    </nav>
  `,
  styles: [`
    .role-navigation {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 16px;
    }

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-item {
      margin-bottom: 8px;
    }

    .nav-item:last-child {
      margin-bottom: 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      text-decoration: none;
      color: #333;
      border-radius: 6px;
      transition: all 0.2s ease;
      font-weight: 500;
    }

    .nav-link:hover {
      background-color: #f5f5f5;
      color: #2196f3;
    }

    .nav-link.active {
      background-color: #e3f2fd;
      color: #2196f3;
      border-left: 4px solid #2196f3;
    }

    .nav-link.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    .nav-icon {
      margin-right: 12px;
      font-size: 18px;
      width: 20px;
      text-align: center;
    }

    .nav-label {
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .role-navigation {
        padding: 12px;
      }

      .nav-link {
        padding: 10px 12px;
      }

      .nav-icon {
        margin-right: 8px;
        font-size: 16px;
      }

      .nav-label {
        font-size: 13px;
      }
    }
  `]
})
export class RoleBasedNavigationComponent implements OnInit {
  navigationItems: any[] = [];

  constructor(
    private navigationService: NavigationService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadNavigationItems();
  }

  loadNavigationItems(): void {
    this.navigationItems = this.navigationService.getNavigationItems();
  }

  canAccessItem(item: any): boolean {
    if (!item.roles || item.roles.includes('*')) {
      return true;
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      return false;
    }

    return user.roles.some(role => item.roles.includes(role));
  }
}
