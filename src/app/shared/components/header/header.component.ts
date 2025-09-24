import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule, MatDialogModule],
  template: `
    <mat-toolbar color="primary" class="header-toolbar">
      <button mat-icon-button class="menu-button">
        <mat-icon>menu</mat-icon>
      </button>
      
      <span class="app-title">Gestion Pro</span>
      
      <span class="spacer"></span>
      
      <button mat-icon-button aria-label="Messages" (click)="openMessagingDialog()" style="background: red; color: white;">
        <mat-icon>chat</mat-icon>
      </button>
      
      <button mat-icon-button [matMenuTriggerFor]="userMenu">
        <mat-icon>account_circle</mat-icon>
      </button>
      
      <mat-menu #userMenu="matMenu">
        <button mat-menu-item>
          <mat-icon>person</mat-icon>
          <span>Profil</span>
        </button>
        <button mat-menu-item>
          <mat-icon>settings</mat-icon>
          <span>Paramètres</span>
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item>
          <mat-icon>logout</mat-icon>
          <span>Déconnexion</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }
    
    .menu-button {
      margin-right: 16px;
    }
    
    .app-title {
      font-size: 1.2rem;
      font-weight: 500;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
  `]
})
export class HeaderComponent {
  constructor(private router: Router, private dialog: MatDialog) {}

  openMessagingDialog(): void {
    console.log('🔔 Clic sur icône chat détecté');
    alert('Clic détecté - ouverture messagerie');
  }
}
