import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-exports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule
  ],
  template: `
    <div class="exports-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>download</mat-icon>
            Exports et Rapports
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="export-options">
            <mat-form-field appearance="outline">
              <mat-label>Type d'export</mat-label>
              <mat-select [(ngModel)]="selectedExportType">
                <mat-option value="conventions">Conventions</mat-option>
                <mat-option value="invoices">Factures</mat-option>
                <mat-option value="users">Utilisateurs</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Format</mat-label>
              <mat-select [(ngModel)]="selectedFormat">
                <mat-option value="excel">Excel</mat-option>
                <mat-option value="pdf">PDF</mat-option>
                <mat-option value="csv">CSV</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          
          <div class="export-actions">
            <button mat-raised-button color="primary" (click)="exportData()">
              <mat-icon>download</mat-icon>
              Exporter
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .exports-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .export-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    
    .export-actions {
      text-align: center;
    }
  `]
})
export class ExportsComponent implements OnInit {
  selectedExportType = 'conventions';
  selectedFormat = 'excel';

  constructor() {}

  ngOnInit(): void {}

  exportData(): void {
    console.log(`Exporting ${this.selectedExportType} as ${this.selectedFormat}`);
    // TODO: Implement actual export functionality
  }
}







































