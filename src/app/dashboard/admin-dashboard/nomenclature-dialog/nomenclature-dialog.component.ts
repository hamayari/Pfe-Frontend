import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-nomenclature-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  template: `
    <div class="dialog-container">
      <!-- Header -->
      <div class="dialog-header" [ngClass]="'header-' + data.mode">
        <div class="header-content">
          <div class="header-icon">
            <mat-icon>{{ data.mode === 'add' ? 'add_circle' : 'edit' }}</mat-icon>
          </div>
          <div class="header-text">
            <h2>{{ data.mode === 'add' ? 'Nouvelle Nomenclature' : 'Modifier Nomenclature' }}</h2>
            <p>{{ data.mode === 'add' ? 'Créer une nouvelle nomenclature' : 'Modifier les détails de la nomenclature' }}</p>
          </div>
        </div>
        <button class="close-button" (click)="onCancel()" mat-icon-button>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="dialog-content">
        <form>
          <!-- Informations de base -->
          <mat-card class="form-section">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>info</mat-icon>
                Informations de base
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Nom *</mat-label>
                  <input matInput [(ngModel)]="nomenclature.name" name="name" required placeholder="Nom de la nomenclature">
                  <mat-icon matSuffix>title</mat-icon>
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Type *</mat-label>
                  <mat-select [(ngModel)]="nomenclature.type" name="type" required>
                    <mat-option value="APPLICATION">
                      <mat-icon>apps</mat-icon>
                      Application
                    </mat-option>
                    <mat-option value="ZONE">
                      <mat-icon>location_on</mat-icon>
                      Zone Géographique
                    </mat-option>
                    <mat-option value="STRUCTURE">
                      <mat-icon>business</mat-icon>
                      Structure
                    </mat-option>
                  </mat-select>
                  <mat-icon matSuffix>category</mat-icon>
                </mat-form-field>
              </div>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput [(ngModel)]="nomenclature.description" name="description" rows="3" 
                         placeholder="Description détaillée de la nomenclature"></textarea>
                <mat-icon matSuffix>description</mat-icon>
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <!-- Aperçu -->
          <mat-card class="preview-section" *ngIf="nomenclature.name || nomenclature.type">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>preview</mat-icon>
                Aperçu
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="preview-content">
                <div class="preview-item">
                  <span class="preview-label">Nom:</span>
                  <span class="preview-value">{{ nomenclature.name || 'Non défini' }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Type:</span>
                  <span class="preview-value">{{ getTypeLabel(nomenclature.type) || 'Non défini' }}</span>
                </div>
                <div class="preview-item" *ngIf="nomenclature.description">
                  <span class="preview-label">Description:</span>
                  <span class="preview-value">{{ nomenclature.description }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </form>
      </div>

      <!-- Actions -->
      <div class="dialog-actions">
        <button mat-stroked-button type="button" (click)="onCancel()" class="cancel-button">
          <mat-icon>cancel</mat-icon>
          Annuler
        </button>
        <button mat-flat-button color="primary" (click)="onSave()" [disabled]="!nomenclature.name || !nomenclature.type" class="save-button">
          <mat-icon>{{ data.mode === 'add' ? 'add' : 'save' }}</mat-icon>
          {{ data.mode === 'add' ? 'Créer' : 'Sauvegarder' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-height: 85vh;
      width: 100%;
      max-width: 800px;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      margin: 0 auto;
      position: relative;
    }

    /* Header */
    .dialog-header {
      padding: 20px 24px;
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 12px 12px 0 0;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-icon {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .header-text h2 {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 600;
    }

    .header-text p {
      margin: 2px 0 0 0;
      opacity: 0.9;
      font-size: 0.9rem;
    }

    .close-button {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      transition: all 0.2s ease;
    }

    .close-button:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }

    /* Content */
    .dialog-content {
      flex: 1;
      padding: 20px 24px;
      overflow-y: auto;
      background: #f8f9fa;
      max-height: calc(85vh - 140px);
    }

    .form-section,
    .preview-section {
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      border: none;
      background: white;
    }

    .preview-section {
      margin-bottom: 0;
    }

    mat-card-header {
      padding: 16px 20px 0 20px;
      background: transparent;
      border-radius: 8px 8px 0 0;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    mat-card-title mat-icon {
      color: #2196f3;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    mat-card-content {
      padding: 20px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    mat-form-field {
      width: 100%;
    }

    mat-form-field mat-icon {
      color: #2196f3;
    }

    .preview-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .preview-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 8px 0;
    }

    .preview-label {
      font-weight: 500;
      color: #666;
      min-width: 100px;
    }

    .preview-value {
      font-weight: 600;
      color: #333;
      text-align: right;
      flex: 1;
    }

    /* Actions */
    .dialog-actions {
      padding: 20px 24px;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-radius: 0 0 12px 12px;
    }

    .cancel-button {
      border-radius: 6px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
    }

    .save-button {
      border-radius: 6px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
      font-size: 0.85rem;
    }

    .save-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .dialog-container {
        max-height: 90vh;
        margin: 16px;
        max-width: calc(100vw - 32px);
      }

      .dialog-header {
        padding: 16px 20px;
      }

      .dialog-content {
        padding: 16px 20px;
      }

      .dialog-actions {
        padding: 16px 20px;
        flex-direction: column;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 8px;
      }

      .header-text h2 {
        font-size: 1.2rem;
      }
    }

    /* Animations */
    .dialog-container {
      animation: slideInUp 0.3s ease-out;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Scrollbar styling */
    .dialog-content::-webkit-scrollbar {
      width: 6px;
    }

    .dialog-content::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .dialog-content::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .dialog-content::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }

    /* Global dialog styles - FORCER LE CENTRAGE */
    :host ::ng-deep .mat-mdc-dialog-container {
      padding: 0 !important;
      border-radius: 12px !important;
      overflow: hidden !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      min-height: 100vh !important;
    }

    :host ::ng-deep .mat-mdc-dialog-surface {
      padding: 0 !important;
      border-radius: 12px !important;
      overflow: hidden !important;
      box-shadow: none !important;
      margin: auto !important;
      position: relative !important;
      top: 0 !important;
      left: 0 !important;
      transform: none !important;
    }

    /* Override Material Dialog positioning */
    :host ::ng-deep .cdk-overlay-pane {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      height: 100vh !important;
      width: 100vw !important;
    }

    :host ::ng-deep .cdk-global-overlay-wrapper {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      height: 100vh !important;
      width: 100vw !important;
    }

    /* Force center positioning */
    :host ::ng-deep .mat-mdc-dialog-container {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      margin: 0 !important;
    }
  `]
})
export class NomenclatureDialogComponent {
  nomenclature: any = {
    name: '',
    type: '',
    description: ''
  };

  constructor(
    private dialogRef: MatDialogRef<NomenclatureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data.mode === 'edit' && this.data.item) {
      this.nomenclature = { ...this.data.item };
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'APPLICATION': return 'Application';
      case 'ZONE': return 'Zone Géographique';
      case 'STRUCTURE': return 'Structure';
      default: return type;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.nomenclature);
  }
}


