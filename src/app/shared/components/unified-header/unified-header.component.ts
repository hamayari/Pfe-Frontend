import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-unified-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="unified-header">
      <div class="header-left">
        <button mat-icon-button class="menu-toggle">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="app-title">Gestion Pro</span>
      </div>

      <!-- Barre de recherche globale -->
      <div class="header-search">
        <mat-form-field appearance="outline" class="search-field">
          <mat-icon matPrefix>search</mat-icon>
          <input 
            matInput 
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            placeholder="Rechercher convention, structure, commercial..."
            [matAutocomplete]="auto">
          <button mat-icon-button matSuffix *ngIf="searchQuery" (click)="clearSearch()">
            <mat-icon>close</mat-icon>
          </button>
          <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onSelectResult($event)">
            <mat-option *ngFor="let result of searchResults" [value]="result">
              <div class="search-result-item">
                <mat-icon>{{ result.icon }}</mat-icon>
                <div class="result-info">
                  <span class="result-title">{{ result.title }}</span>
                  <span class="result-subtitle">{{ result.subtitle }}</span>
                </div>
              </div>
            </mat-option>
          </mat-autocomplete>
        </mat-form-field>
      </div>

      <div class="header-right">
        <!-- Mode Clair/Sombre -->
        <button mat-icon-button (click)="toggleTheme()" [matTooltip]="isDarkMode ? 'Mode clair' : 'Mode sombre'">
          <mat-icon>{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>

        <!-- Messages (masqués pour admin) -->
        <!-- <button mat-icon-button routerLink="/messaging">
          <mat-icon [matBadge]="messageCount" matBadgeColor="accent">mail</mat-icon>
        </button> -->

        <!-- Profil -->
        <button mat-button [matMenuTriggerFor]="profileMenu" class="profile-button">
          <mat-icon>account_circle</mat-icon>
          <span>Décideur</span>
        </button>
        <mat-menu #profileMenu="matMenu">
          <button mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon>
            <span>Mon Profil</span>
          </button>
          <button mat-menu-item routerLink="/decideur/parametres">
            <mat-icon>settings</mat-icon>
            <span>Paramètres</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>exit_to_app</mat-icon>
            <span>Déconnexion</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .unified-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      height: 64px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .app-title {
      font-size: 20px;
      font-weight: 600;
      color: #1a237e;
    }

    .header-search {
      flex: 1;
      max-width: 600px;
      margin: 0 24px;

      .search-field {
        width: 100%;
        
        ::ng-deep .mat-mdc-form-field-subscript-wrapper {
          display: none;
        }

        ::ng-deep .mat-mdc-text-field-wrapper {
          background: #f5f7fa;
          border-radius: 24px;
        }

        ::ng-deep .mat-mdc-form-field-infix {
          padding: 8px 0;
        }

        input {
          font-size: 14px;
        }

        mat-icon[matPrefix] {
          margin-right: 12px;
          color: #666;
        }

        button[matSuffix] {
          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }
      }
    }

    ::ng-deep .search-result-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;

      mat-icon {
        color: #1976d2;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .result-info {
        display: flex;
        flex-direction: column;
        flex: 1;

        .result-title {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .result-subtitle {
          font-size: 12px;
          color: #666;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .profile-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .notification-header {
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
    }
  `]
})
export class UnifiedHeaderComponent implements OnInit {
  messageCount = 5;
  searchQuery = '';
  searchResults: any[] = [];
  isDarkMode = false;

  // Données de recherche simulées
  allData = [
    { type: 'convention', icon: 'description', title: 'CONV-2024-001', subtitle: 'Convention Formation IT - Tunis' },
    { type: 'convention', icon: 'description', title: 'CONV-2024-002', subtitle: 'Convention Maintenance - Sfax' },
    { type: 'convention', icon: 'description', title: 'CONV-2024-003', subtitle: 'Convention Support Technique - Sousse' },
    { type: 'structure', icon: 'business', title: 'Structure A', subtitle: '15 conventions actives' },
    { type: 'structure', icon: 'business', title: 'Structure B', subtitle: '12 conventions actives' },
    { type: 'structure', icon: 'business', title: 'Structure C', subtitle: '8 conventions actives' },
    { type: 'commercial', icon: 'person', title: 'Ahmed Ben Ali', subtitle: '18 conventions - 540K DT' },
    { type: 'commercial', icon: 'person', title: 'Fatma Gharbi', subtitle: '15 conventions - 480K DT' },
    { type: 'commercial', icon: 'person', title: 'Mohamed Trabelsi', subtitle: '12 conventions - 420K DT' },
    { type: 'gouvernorat', icon: 'location_on', title: 'Tunis', subtitle: '15 conventions' },
    { type: 'gouvernorat', icon: 'location_on', title: 'Sfax', subtitle: '12 conventions' },
    { type: 'gouvernorat', icon: 'location_on', title: 'Sousse', subtitle: '8 conventions' }
  ];

  /**
   * Recherche dans les données
   */
  onSearch(): void {
    if (!this.searchQuery || this.searchQuery.trim().length < 2) {
      this.searchResults = [];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.searchResults = this.allData.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.subtitle.toLowerCase().includes(query)
    ).slice(0, 8); // Limiter à 8 résultats
  }

  /**
   * Sélection d'un résultat
   */
  onSelectResult(event: any): void {
    const result = event.option.value;
    console.log('Résultat sélectionné:', result);
    
    // Navigation selon le type
    switch (result.type) {
      case 'convention':
        // Naviguer vers la page de détails de la convention
        console.log('Naviguer vers convention:', result.title);
        break;
      case 'structure':
        // Filtrer par structure
        console.log('Filtrer par structure:', result.title);
        break;
      case 'commercial':
        // Filtrer par commercial
        console.log('Filtrer par commercial:', result.title);
        break;
      case 'gouvernorat':
        // Filtrer par gouvernorat
        console.log('Filtrer par gouvernorat:', result.title);
        break;
    }

    this.clearSearch();
  }

  /**
   * Effacer la recherche
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
  }

  /**
   * Toggle entre mode clair et sombre
   */
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    
    // Appliquer le thème au body
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
    
    console.log('🌙 Mode:', this.isDarkMode ? 'Sombre' : 'Clair');
  }

  /**
   * Initialisation - Charger le thème sauvegardé
   */
  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark-theme');
    }
  }

  logout() {
    console.log('Déconnexion');
    // Implémenter la logique de déconnexion
  }
}
