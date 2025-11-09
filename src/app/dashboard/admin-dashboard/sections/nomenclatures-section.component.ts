import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Application {
  id: string;
  name: string;
  code: string;
  description: string;
  version: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

interface GeographicZone {
  id: string;
  name: string;
  type: 'region' | 'governorate' | 'city' | 'district';
  parentZone?: string;
  code: string;
  description: string;
  createdAt: Date;
}

interface Structure {
  id: string;
  name: string;
  type: 'enterprise' | 'organization' | 'ministry' | 'association';
  governorate: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

@Component({
  selector: 'app-nomenclatures-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule
  ],
  template: `
    <div class="nomenclatures-section">
      <mat-card class="main-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>category</mat-icon>
            Gestion des Nomenclatures
          </mat-card-title>
          <mat-card-subtitle>Configuration des applications, zones géographiques et structures</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <mat-tab-group (selectedTabChange)="onTabChange($event)">
            
            <!-- Onglet Applications -->
            <mat-tab label="Applications">
              <div class="tab-content">
                <!-- Recherche -->
                <div class="search-section">
                  <mat-form-field appearance="outline" class="search-field">
                    <mat-label>Rechercher une application</mat-label>
                    <input matInput [(ngModel)]="appSearchTerm" placeholder="Nom, code, description...">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>
                </div>

                <!-- Actions -->
                <div class="actions-section">
                  <button mat-raised-button color="primary" (click)="addApplication()">
                    <mat-icon>add</mat-icon>
                    Ajouter Application
                  </button>
                  <button mat-raised-button (click)="exportApplications()">
                    <mat-icon>download</mat-icon>
                    Exporter
                  </button>
                </div>

                <!-- Tableau applications -->
                <table mat-table [dataSource]="applicationsDataSource" matSort class="applications-table">
                  <!-- Nom -->
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Nom</th>
                    <td mat-cell *matCellDef="let app">{{ app.name }}</td>
                  </ng-container>
                  
                  <!-- Code -->
                  <ng-container matColumnDef="code">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Code</th>
                    <td mat-cell *matCellDef="let app">{{ app.code }}</td>
                  </ng-container>
                  
                  <!-- Description -->
                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef>Description</th>
                    <td mat-cell *matCellDef="let app">{{ app.description }}</td>
                  </ng-container>
                  
                  <!-- Version -->
                  <ng-container matColumnDef="version">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Version</th>
                    <td mat-cell *matCellDef="let app">{{ app.version }}</td>
                  </ng-container>
                  
                  <!-- Statut -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
                    <td mat-cell *matCellDef="let app">
                      <mat-chip [ngClass]="getAppStatusColor(app.status)">
                        {{ getAppStatusLabel(app.status) }}
                      </mat-chip>
                    </td>
                  </ng-container>
                  
                  <!-- Date création -->
                  <ng-container matColumnDef="createdAt">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Créé le</th>
                    <td mat-cell *matCellDef="let app">{{ app.createdAt | date:'dd/MM/yyyy' }}</td>
                  </ng-container>
                  
                  <!-- Actions -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let app">
                      <button mat-icon-button [matMenuTriggerFor]="appMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #appMenu="matMenu">
                        <button mat-menu-item (click)="viewApplication(app)">
                          <mat-icon>visibility</mat-icon>
                          <span>Voir détails</span>
                        </button>
                        <button mat-menu-item (click)="editApplication(app)">
                          <mat-icon>edit</mat-icon>
                          <span>Modifier</span>
                        </button>
                        <button mat-menu-item (click)="deleteApplication(app)" class="delete-action">
                          <mat-icon>delete</mat-icon>
                          <span>Supprimer</span>
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>
                  
                  <tr mat-header-row *matHeaderRowDef="applicationsDisplayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: applicationsDisplayedColumns;"></tr>
                </table>
                
                <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
              </div>
            </mat-tab>
            
            <!-- Onglet Zones géographiques -->
            <mat-tab label="Zones géographiques">
              <div class="tab-content">
                <!-- Filtres -->
                <div class="filters-section">
                  <div class="filter-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Type de zone</mat-label>
                      <mat-select [(ngModel)]="selectedZoneType">
                        <mat-option value="all">Tous les types</mat-option>
                        <mat-option value="region">Région</mat-option>
                        <mat-option value="governorate">Gouvernorat</mat-option>
                        <mat-option value="city">Ville</mat-option>
                        <mat-option value="district">District</mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Recherche</mat-label>
                      <input matInput [(ngModel)]="zoneSearchTerm" placeholder="Nom, code...">
                      <mat-icon matSuffix>search</mat-icon>
                    </mat-form-field>
                  </div>
                </div>

                <!-- Actions -->
                <div class="actions-section">
                  <button mat-raised-button color="primary" (click)="addZone()">
                    <mat-icon>add_location</mat-icon>
                    Ajouter Zone
                  </button>
                  <button mat-raised-button (click)="exportZones()">
                    <mat-icon>download</mat-icon>
                    Exporter
                  </button>
                </div>

                <!-- Tableau zones -->
                <table mat-table [dataSource]="zonesDataSource" matSort class="zones-table">
                  <!-- Nom -->
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Nom</th>
                    <td mat-cell *matCellDef="let zone">{{ zone.name }}</td>
                  </ng-container>
                  
                  <!-- Type -->
                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                    <td mat-cell *matCellDef="let zone">
                      <mat-chip class="zone-type-chip">
                        {{ getZoneTypeLabel(zone.type) }}
                      </mat-chip>
                    </td>
                  </ng-container>
                  
                  <!-- Code -->
                  <ng-container matColumnDef="code">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Code</th>
                    <td mat-cell *matCellDef="let zone">{{ zone.code }}</td>
                  </ng-container>
                  
                  <!-- Zone parente -->
                  <ng-container matColumnDef="parentZone">
                    <th mat-header-cell *matHeaderCellDef>Zone parente</th>
                    <td mat-cell *matCellDef="let zone">{{ zone.parentZone || '-' }}</td>
                  </ng-container>
                  
                  <!-- Description -->
                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef>Description</th>
                    <td mat-cell *matCellDef="let zone">{{ zone.description }}</td>
                  </ng-container>
                  
                  <!-- Date création -->
                  <ng-container matColumnDef="createdAt">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Créé le</th>
                    <td mat-cell *matCellDef="let zone">{{ zone.createdAt | date:'dd/MM/yyyy' }}</td>
                  </ng-container>
                  
                  <!-- Actions -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let zone">
                      <button mat-icon-button [matMenuTriggerFor]="zoneMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #zoneMenu="matMenu">
                        <button mat-menu-item (click)="viewZone(zone)">
                          <mat-icon>visibility</mat-icon>
                          <span>Voir détails</span>
                        </button>
                        <button mat-menu-item (click)="editZone(zone)">
                          <mat-icon>edit</mat-icon>
                          <span>Modifier</span>
                        </button>
                        <button mat-menu-item (click)="deleteZone(zone)" class="delete-action">
                          <mat-icon>delete</mat-icon>
                          <span>Supprimer</span>
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>
                  
                  <tr mat-header-row *matHeaderRowDef="zonesDisplayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: zonesDisplayedColumns;"></tr>
                </table>
                
                <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
              </div>
            </mat-tab>
            
            <!-- Onglet Structures -->
            <mat-tab label="Structures">
              <div class="tab-content">
                <!-- Filtres -->
                <div class="filters-section">
                  <div class="filter-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Type de structure</mat-label>
                      <mat-select [(ngModel)]="selectedStructureType">
                        <mat-option value="all">Tous les types</mat-option>
                        <mat-option value="enterprise">Entreprise</mat-option>
                        <mat-option value="organization">Organisation</mat-option>
                        <mat-option value="ministry">Ministère</mat-option>
                        <mat-option value="association">Association</mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Gouvernorat</mat-label>
                      <mat-select [(ngModel)]="selectedGovernorate">
                        <mat-option value="all">Tous les gouvernorats</mat-option>
                        <mat-option *ngFor="let governorate of governorates" [value]="governorate">
                          {{ governorate }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Recherche</mat-label>
                      <input matInput [(ngModel)]="structureSearchTerm" placeholder="Nom, contact...">
                      <mat-icon matSuffix>search</mat-icon>
                    </mat-form-field>
                  </div>
                </div>

                <!-- Actions -->
                <div class="actions-section">
                  <button mat-raised-button color="primary" (click)="addStructure()">
                    <mat-icon>business</mat-icon>
                    Ajouter Structure
                  </button>
                  <button mat-raised-button (click)="exportStructures()">
                    <mat-icon>download</mat-icon>
                    Exporter
                  </button>
                </div>

                <!-- Tableau structures -->
                <table mat-table [dataSource]="structuresDataSource" matSort class="structures-table">
                  <!-- Nom -->
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Nom</th>
                    <td mat-cell *matCellDef="let structure">{{ structure.name }}</td>
                  </ng-container>
                  
                  <!-- Type -->
                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                    <td mat-cell *matCellDef="let structure">
                      <mat-chip class="structure-type-chip">
                        {{ getStructureTypeLabel(structure.type) }}
                      </mat-chip>
                    </td>
                  </ng-container>
                  
                  <!-- Gouvernorat -->
                  <ng-container matColumnDef="governorate">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Gouvernorat</th>
                    <td mat-cell *matCellDef="let structure">{{ structure.governorate }}</td>
                  </ng-container>
                  
                  <!-- Contact -->
                  <ng-container matColumnDef="contactPerson">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Contact</th>
                    <td mat-cell *matCellDef="let structure">{{ structure.contactPerson }}</td>
                  </ng-container>
                  
                  <!-- Téléphone -->
                  <ng-container matColumnDef="phone">
                    <th mat-header-cell *matHeaderCellDef>Téléphone</th>
                    <td mat-cell *matCellDef="let structure">{{ structure.phone }}</td>
                  </ng-container>
                  
                  <!-- Email -->
                  <ng-container matColumnDef="email">
                    <th mat-header-cell *matHeaderCellDef>Email</th>
                    <td mat-cell *matCellDef="let structure">{{ structure.email }}</td>
                  </ng-container>
                  
                  <!-- Statut -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
                    <td mat-cell *matCellDef="let structure">
                      <mat-chip [ngClass]="getStructureStatusColor(structure.status)">
                        {{ getStructureStatusLabel(structure.status) }}
                      </mat-chip>
                    </td>
                  </ng-container>
                  
                  <!-- Actions -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let structure">
                      <button mat-icon-button [matMenuTriggerFor]="structureMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #structureMenu="matMenu">
                        <button mat-menu-item (click)="viewStructure(structure)">
                          <mat-icon>visibility</mat-icon>
                          <span>Voir détails</span>
                        </button>
                        <button mat-menu-item (click)="editStructure(structure)">
                          <mat-icon>edit</mat-icon>
                          <span>Modifier</span>
                        </button>
                        <button mat-menu-item (click)="deleteStructure(structure)" class="delete-action">
                          <mat-icon>delete</mat-icon>
                          <span>Supprimer</span>
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>
                  
                  <tr mat-header-row *matHeaderRowDef="structuresDisplayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: structuresDisplayedColumns;"></tr>
                </table>
                
                <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .nomenclatures-section {
      padding: 24px;
    }

    .main-card {
      margin-bottom: 24px;
    }

    .tab-content {
      padding: 16px 0;
    }

    .search-section {
      margin-bottom: 24px;
    }

    .search-field {
      width: 100%;
      max-width: 400px;
    }

    .filters-section {
      margin-bottom: 24px;
      padding: 16px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .filter-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      align-items: end;
    }

    .actions-section {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .applications-table,
    .zones-table,
    .structures-table {
      width: 100%;
      margin-bottom: 16px;
    }

    .applications-table th,
    .zones-table th,
    .structures-table th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: #333;
    }

    .applications-table td,
    .zones-table td,
    .structures-table td {
      padding: 12px 8px;
    }

    mat-chip {
      font-size: 12px;
      font-weight: 500;
    }

    .status-active {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-inactive {
      background-color: #f5f5f5;
      color: #666;
    }

    .status-maintenance {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .zone-type-chip {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .structure-type-chip {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .delete-action {
      color: #f44336;
    }

    @media (max-width: 768px) {
      .filter-row {
        grid-template-columns: 1fr;
      }

      .actions-section {
        flex-direction: column;
      }

      .search-field {
        max-width: 100%;
      }
    }
  `]
})
export class NomenclaturesSectionComponent implements OnInit {
  // Filtres applications
  appSearchTerm = '';

  // Filtres zones
  selectedZoneType = 'all';
  zoneSearchTerm = '';

  // Filtres structures
  selectedStructureType = 'all';
  selectedGovernorate = 'all';
  structureSearchTerm = '';

  governorates = ['Tunis', 'Sfax', 'Sousse', 'Monastir', 'Gabès', 'Gafsa', 'Bizerte', 'Nabeul'];

  // Données de démonstration
  applications: Application[] = [
    {
      id: '1',
      name: 'Système de Gestion des Conventions',
      code: 'SGC-001',
      description: 'Application principale pour la gestion des conventions et factures',
      version: '2.1.0',
      status: 'active',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-03-01')
    },
    {
      id: '2',
      name: 'Module de Reporting',
      code: 'REP-002',
      description: 'Module pour la génération de rapports et analyses',
      version: '1.5.2',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-02-15')
    },
    {
      id: '3',
      name: 'Interface Mobile',
      code: 'MOB-003',
      description: 'Application mobile pour consultation des données',
      version: '1.0.1',
      status: 'maintenance',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-03-10')
    }
  ];

  zones: GeographicZone[] = [
    {
      id: '1',
      name: 'Tunis',
      type: 'governorate',
      code: 'TN-11',
      description: 'Gouvernorat de Tunis',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Sfax',
      type: 'governorate',
      code: 'TN-61',
      description: 'Gouvernorat de Sfax',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '3',
      name: 'Sousse',
      type: 'governorate',
      code: 'TN-51',
      description: 'Gouvernorat de Sousse',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '4',
      name: 'Centre-ville Tunis',
      type: 'district',
      parentZone: 'Tunis',
      code: 'TN-11-01',
      description: 'District centre-ville de Tunis',
      createdAt: new Date('2024-01-15')
    }
  ];

  structures: Structure[] = [
    {
      id: '1',
      name: 'Ministère des Finances',
      type: 'ministry',
      governorate: 'Tunis',
      address: 'Rue de la Monnaie, Tunis 1000',
      contactPerson: 'Ahmed Ben Salem',
      phone: '+216 71 234 567',
      email: 'contact@finances.gov.tn',
      status: 'active',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Entreprise Tunisienne de Télécommunications',
      type: 'enterprise',
      governorate: 'Tunis',
      address: 'Avenue Habib Bourguiba, Tunis 1001',
      contactPerson: 'Fatma Mansouri',
      phone: '+216 71 345 678',
      email: 'contact@ett.com.tn',
      status: 'active',
      createdAt: new Date('2024-01-10')
    },
    {
      id: '3',
      name: 'Association Tunisienne des Développeurs',
      type: 'association',
      governorate: 'Sfax',
      address: 'Rue de la Liberté, Sfax 3000',
      contactPerson: 'Mohamed Karray',
      phone: '+216 74 456 789',
      email: 'contact@atd.org.tn',
      status: 'active',
      createdAt: new Date('2024-02-01')
    }
  ];

  applicationsDataSource = this.applications;
  zonesDataSource = this.zones;
  structuresDataSource = this.structures;

  applicationsDisplayedColumns = ['name', 'code', 'description', 'version', 'status', 'createdAt', 'actions'];
  zonesDisplayedColumns = ['name', 'type', 'code', 'parentZone', 'description', 'createdAt', 'actions'];
  structuresDisplayedColumns = ['name', 'type', 'governorate', 'contactPerson', 'phone', 'email', 'status', 'actions'];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    console.log('Chargement des données de nomenclatures');
  }

  onTabChange(event: any) {
    console.log('Onglet sélectionné:', event.index);
  }

  // Méthodes applications
  addApplication() {
    console.log('Ajouter une nouvelle application');
    this.snackBar.open('Fonctionnalité d\'ajout d\'application', 'Fermer', { duration: 2000 });
  }

  viewApplication(app: Application) {
    console.log('Voir application:', app);
  }

  editApplication(app: Application) {
    console.log('Modifier application:', app);
  }

  deleteApplication(app: Application) {
    console.log('Supprimer application:', app);
    this.snackBar.open(`Application ${app.name} supprimée`, 'Fermer', { duration: 2000 });
  }

  exportApplications() {
    console.log('Exporter les applications');
    this.snackBar.open('Export des applications en cours...', 'Fermer', { duration: 2000 });
  }

  // Méthodes zones
  addZone() {
    console.log('Ajouter une nouvelle zone');
    this.snackBar.open('Fonctionnalité d\'ajout de zone', 'Fermer', { duration: 2000 });
  }

  viewZone(zone: GeographicZone) {
    console.log('Voir zone:', zone);
  }

  editZone(zone: GeographicZone) {
    console.log('Modifier zone:', zone);
  }

  deleteZone(zone: GeographicZone) {
    console.log('Supprimer zone:', zone);
    this.snackBar.open(`Zone ${zone.name} supprimée`, 'Fermer', { duration: 2000 });
  }

  exportZones() {
    console.log('Exporter les zones');
    this.snackBar.open('Export des zones en cours...', 'Fermer', { duration: 2000 });
  }

  // Méthodes structures
  addStructure() {
    console.log('Ajouter une nouvelle structure');
    this.snackBar.open('Fonctionnalité d\'ajout de structure', 'Fermer', { duration: 2000 });
  }

  viewStructure(structure: Structure) {
    console.log('Voir structure:', structure);
  }

  editStructure(structure: Structure) {
    console.log('Modifier structure:', structure);
  }

  deleteStructure(structure: Structure) {
    console.log('Supprimer structure:', structure);
    this.snackBar.open(`Structure ${structure.name} supprimée`, 'Fermer', { duration: 2000 });
  }

  exportStructures() {
    console.log('Exporter les structures');
    this.snackBar.open('Export des structures en cours...', 'Fermer', { duration: 2000 });
  }

  // Méthodes utilitaires
  getAppStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'maintenance': return 'status-maintenance';
      default: return 'status-inactive';
    }
  }

  getAppStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'maintenance': return 'Maintenance';
      default: return 'Inconnu';
    }
  }

  getZoneTypeLabel(type: string): string {
    switch (type) {
      case 'region': return 'Région';
      case 'governorate': return 'Gouvernorat';
      case 'city': return 'Ville';
      case 'district': return 'District';
      default: return type;
    }
  }

  getStructureTypeLabel(type: string): string {
    switch (type) {
      case 'enterprise': return 'Entreprise';
      case 'organization': return 'Organisation';
      case 'ministry': return 'Ministère';
      case 'association': return 'Association';
      default: return type;
    }
  }

  getStructureStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      default: return 'status-inactive';
    }
  }

  getStructureStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      default: return 'Inconnu';
    }
  }
}






































