import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-admin-nomenclatures',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="admin-nomenclatures-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>category</mat-icon>
            Gestion des Nomenclatures
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="actions">
            <button mat-raised-button color="primary">
              <mat-icon>add</mat-icon>
              Ajouter Nomenclature
            </button>
          </div>
          
          <mat-form-field appearance="outline">
            <mat-label>Rechercher</mat-label>
            <input matInput placeholder="Nom, type...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          
          <p>Liste des nomenclatures (à implémenter)</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-nomenclatures-container {
      padding: 20px;
    }
    
    .actions {
      margin-bottom: 20px;
    }
  `]
})
export class AdminNomenclaturesComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}







































