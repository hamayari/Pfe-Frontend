import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

export interface ConventionDialogData {
  mode: 'create' | 'edit';
  convention?: any;
}

@Component({
  selector: 'app-convention-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="dialog-container">
      <!-- Header -->
      <div class="dialog-header" [ngClass]="'header-' + data.mode">
        <div class="header-content">
          <div class="header-icon">
            <mat-icon>{{ data.mode === 'create' ? 'add_circle' : 'edit' }}</mat-icon>
          </div>
          <div class="header-text">
            <h2>{{ data.mode === 'create' ? 'Nouvelle Convention' : 'Modifier Convention' }}</h2>
            <p>{{ data.mode === 'create' ? 'Créer une nouvelle convention commerciale' : 'Modifier les détails de la convention' }}</p>
          </div>
        </div>
        <button class="close-button" (click)="onCancel()" mat-icon-button>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="dialog-content">
        <form [formGroup]="conventionForm" (ngSubmit)="onSubmit()">
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
                  <mat-label>Référence</mat-label>
                  <input matInput formControlName="reference" placeholder="CONV-2024-001">
                  <mat-icon matSuffix>tag</mat-icon>
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Titre</mat-label>
                  <input matInput formControlName="title" placeholder="Titre de la convention">
                  <mat-icon matSuffix>title</mat-icon>
                </mat-form-field>
              </div>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3" placeholder="Description détaillée de la convention"></textarea>
                <mat-icon matSuffix>description</mat-icon>
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <!-- Localisation et montant -->
          <mat-card class="form-section">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>location_on</mat-icon>
                Localisation et montant
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Zone Géographique</mat-label>
                  <mat-select formControlName="geographicZone">
                    <mat-option value="Tunis">Tunis</mat-option>
                    <mat-option value="Sfax">Sfax</mat-option>
                    <mat-option value="Sousse">Sousse</mat-option>
                    <mat-option value="Monastir">Monastir</mat-option>
                    <mat-option value="Gabès">Gabès</mat-option>
                    <mat-option value="Gafsa">Gafsa</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>location_city</mat-icon>
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Montant</mat-label>
                  <input matInput type="number" formControlName="amount" placeholder="0.00">
                  <span matSuffix>€</span>
                  <mat-icon matSuffix>euro</mat-icon>
                </mat-form-field>
              </div>
              
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Client</mat-label>
                  <input matInput formControlName="client" placeholder="Nom du client">
                  <mat-icon matSuffix>person</mat-icon>
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Type</mat-label>
                  <mat-select formControlName="type">
                    <mat-option value="CONVENTION">Convention</mat-option>
                    <mat-option value="CONTRAT">Contrat</mat-option>
                    <mat-option value="ACCORD">Accord</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>category</mat-icon>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Dates et statut -->
          <mat-card class="form-section">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>schedule</mat-icon>
                Dates et statut
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Date de début</mat-label>
                  <input matInput [matDatepicker]="startPicker" formControlName="startDate">
                  <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                  <mat-datepicker #startPicker></mat-datepicker>
                  <mat-icon matSuffix>event</mat-icon>
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Date de fin</mat-label>
                  <input matInput [matDatepicker]="endPicker" formControlName="endDate">
                  <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                  <mat-datepicker #endPicker></mat-datepicker>
                  <mat-icon matSuffix>event</mat-icon>
                </mat-form-field>
              </div>
              
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Statut</mat-label>
                  <mat-select formControlName="status">
                    <mat-option value="ACTIVE">Actif</mat-option>
                    <mat-option value="PENDING">En attente</mat-option>
                    <mat-option value="EXPIRED">Expiré</mat-option>
                    <mat-option value="COMPLETED">Terminé</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>flag</mat-icon>
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Tag</mat-label>
                  <mat-select formControlName="tag">
                    <mat-option value="">Aucun</mat-option>
                    <mat-option value="Important">Important</mat-option>
                    <mat-option value="Prioritaire">Prioritaire</mat-option>
                    <mat-option value="Urgent">Urgent</mat-option>
                    <mat-option value="Nouveau">Nouveau</mat-option>
                    <mat-option value="Renouvellement">Renouvellement</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>label</mat-icon>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Termes de paiement -->
          <mat-card class="form-section">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>payment</mat-icon>
                Termes de paiement
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Nombre d'échéances</mat-label>
                  <input matInput type="number" formControlName="numberOfPayments" placeholder="1">
                  <mat-icon matSuffix>schedule</mat-icon>
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Intervalle (jours)</mat-label>
                  <input matInput type="number" formControlName="intervalDays" placeholder="30">
                  <mat-icon matSuffix>calendar_today</mat-icon>
                </mat-form-field>
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
        <button mat-flat-button color="primary" type="button" [disabled]="!conventionForm.valid" class="submit-button" (click)="onSubmit()">
          <mat-icon>{{ data.mode === 'create' ? 'add' : 'save' }}</mat-icon>
          {{ data.mode === 'create' ? 'Créer Convention' : 'Sauvegarder' }}
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

    .form-section {
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      border: none;
      background: white;
    }

    .form-section:last-child {
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
      color: #667eea;
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

    .form-grid:last-child {
      margin-bottom: 0;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    mat-form-field {
      width: 100%;
    }

    mat-form-field mat-icon {
      color: #667eea;
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

    .submit-button {
      border-radius: 6px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-size: 0.85rem;
    }

    .submit-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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
export class ConventionDialogComponent {
  conventionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ConventionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConventionDialogData
  ) {
    this.conventionForm = this.fb.group({
      reference: ['', [Validators.required, Validators.minLength(3)]],
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      clientId: ['CLIENT-001', Validators.required], // Champ requis par le backend
      client: ['Client Test', Validators.required], // Champ requis par le backend
      geographicZone: ['', Validators.required], // Renommé de governorate
      structure: ['STRUCT-001', Validators.required], // Champ requis par le backend
      amount: [0, [Validators.required, Validators.min(0)]],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      status: ['ACTIVE', Validators.required],
      tag: [''],
      type: ['CONVENTION', Validators.required], // Champ requis par le backend
      // PaymentTerms pour la génération des échéances
      numberOfPayments: [1, [Validators.required, Validators.min(1)]],
      intervalDays: [30, [Validators.required, Validators.min(1)]]
    });

    if (data.mode === 'edit' && data.convention) {
      console.log('📝 Mode édition - Convention reçue:', data.convention);
      this.conventionForm.patchValue({
        reference: data.convention.reference,
        title: data.convention.title,
        description: data.convention.description || '',
        clientId: data.convention.clientId || 'CLIENT-001',
        client: data.convention.client || 'Client Test',
        geographicZone: data.convention.governorate || data.convention.geographicZone || '',
        structure: data.convention.structureId || 'STRUCT-001',
        amount: data.convention.amount,
        startDate: data.convention.startDate ? new Date(data.convention.startDate) : null,
        endDate: data.convention.endDate ? new Date(data.convention.endDate) : null,
        status: data.convention.status || 'ACTIVE',
        tag: data.convention.tag || '',
        type: data.convention.type || 'CONVENTION',
        numberOfPayments: data.convention.paymentTerms?.numberOfPayments || 1,
        intervalDays: data.convention.paymentTerms?.intervalDays || 30
      });
      console.log('✅ Formulaire initialisé avec:', this.conventionForm.value);
    }
  }

  onSubmit(): void {
    console.log('🚀 onSubmit() appelé dans ConventionDialog');
    console.log('📋 Formulaire valide:', this.conventionForm.valid);
    console.log('📋 Valeurs du formulaire:', this.conventionForm.value);
    console.log('📋 Erreurs du formulaire:', this.conventionForm.errors);
    
    if (this.conventionForm.valid) {
      const formValue = this.conventionForm.value;
      
      // Construire l'objet ConventionRequest selon le format attendu par le backend
      const conventionRequest = {
        title: formValue.title,
        description: formValue.description,
        clientId: formValue.clientId,
        client: formValue.client,
        reference: formValue.reference,
        amount: formValue.amount,
        startDate: formValue.startDate ? formValue.startDate.toISOString() : null,
        endDate: formValue.endDate ? formValue.endDate.toISOString() : null,
        status: formValue.status,
        structure: formValue.structure,
        geographicZone: formValue.geographicZone,
        type: formValue.type,
        tag: formValue.tag,
        // Construire l'objet PaymentTerms
        paymentTerms: {
          numberOfPayments: formValue.numberOfPayments,
          intervalDays: formValue.intervalDays,
          currency: "EUR"
        }
      };
      
      console.log('📋 ConventionRequest construit:', conventionRequest);
      console.log('📋 Fermeture du dialog avec les données');
      this.dialogRef.close(conventionRequest);
    } else {
      console.log('❌ Formulaire invalide - impossible de soumettre');
      // Afficher les erreurs de validation
      Object.keys(this.conventionForm.controls).forEach(key => {
        const control = this.conventionForm.get(key);
        if (control && control.errors) {
          console.log(`❌ Erreur sur ${key}:`, control.errors);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
