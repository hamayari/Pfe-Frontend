import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-add-nomenclature-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatCheckboxModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>category</mat-icon>
          Ajouter une nouvelle nomenclature
        </h2>
        <button mat-icon-button (click)="onCancel()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <form [formGroup]="nomenclatureForm" (ngSubmit)="onSubmit()">
          <div class="form-section">
            <h3>Informations générales</h3>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Type de nomenclature</mat-label>
                <mat-select formControlName="type" (selectionChange)="onTypeChange($event.value)">
                  <mat-option value="APPLICATION">Application</mat-option>
                  <mat-option value="GEOGRAPHIC_ZONE">Zone Géographique</mat-option>
                  <mat-option value="STRUCTURE">Structure</mat-option>
                </mat-select>
                <mat-error *ngIf="nomenclatureForm.get('type')?.hasError('required')">
                  Le type est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Code</mat-label>
                <input matInput formControlName="code" placeholder="Ex: APP001, ZONE001">
                <mat-error *ngIf="nomenclatureForm.get('code')?.hasError('required')">
                  Le code est requis
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Libellé</mat-label>
                <input matInput formControlName="label" placeholder="Nom de la nomenclature">
                <mat-error *ngIf="nomenclatureForm.get('label')?.hasError('required')">
                  Le libellé est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3" placeholder="Description détaillée"></textarea>
                <mat-error *ngIf="nomenclatureForm.get('description')?.hasError('required')">
                  La description est requise
                </mat-error>
              </mat-form-field>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Champs spécifiques selon le type -->
          <div class="form-section" *ngIf="nomenclatureForm.get('type')?.value === 'APPLICATION'">
            <h3>Informations Application</h3>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Version</mat-label>
                <input matInput formControlName="version" placeholder="Ex: 1.0.0">
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Développeur</mat-label>
                <input matInput formControlName="developer" placeholder="Nom du développeur">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>URL</mat-label>
                <input matInput formControlName="url" placeholder="https://exemple.com">
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Technologie</mat-label>
                <mat-select formControlName="technology">
                  <mat-option value="ANGULAR">Angular</mat-option>
                  <mat-option value="REACT">React</mat-option>
                  <mat-option value="VUE">Vue.js</mat-option>
                  <mat-option value="JAVA">Java</mat-option>
                  <mat-option value="PYTHON">Python</mat-option>
                  <mat-option value="PHP">PHP</mat-option>
                  <mat-option value="OTHER">Autre</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <div class="form-section" *ngIf="nomenclatureForm.get('type')?.value === 'GEOGRAPHIC_ZONE'">
            <h3>Informations Zone Géographique</h3>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Gouvernorat</mat-label>
                <mat-select formControlName="governorate">
                  <mat-option value="TUNIS">Tunis</mat-option>
                  <mat-option value="SFAX">Sfax</mat-option>
                  <mat-option value="SOUSSE">Sousse</mat-option>
                  <mat-option value="MONASTIR">Monastir</mat-option>
                  <mat-option value="GABES">Gabès</mat-option>
                  <mat-option value="GAFSA">Gafsa</mat-option>
                  <mat-option value="BEN_AROUS">Ben Arous</mat-option>
                  <mat-option value="NABEUL">Nabeul</mat-option>
                  <mat-option value="HAMMAMET">Hammamet</mat-option>
                  <mat-option value="MAHDIA">Mahdia</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Délégation</mat-label>
                <input matInput formControlName="delegation" placeholder="Nom de la délégation">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Code postal</mat-label>
                <input matInput formControlName="postalCode" placeholder="Ex: 1000">
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Population</mat-label>
                <input matInput formControlName="population" type="number" placeholder="Nombre d'habitants">
              </mat-form-field>
            </div>
          </div>

          <div class="form-section" *ngIf="nomenclatureForm.get('type')?.value === 'STRUCTURE'">
            <h3>Informations Structure</h3>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Type de structure</mat-label>
                <mat-select formControlName="structureType">
                  <mat-option value="PUBLIC">Publique</mat-option>
                  <mat-option value="PRIVATE">Privée</mat-option>
                  <mat-option value="ASSOCIATION">Association</mat-option>
                  <mat-option value="ONG">ONG</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Secteur d'activité</mat-label>
                <mat-select formControlName="sector">
                  <mat-option value="EDUCATION">Éducation</mat-option>
                  <mat-option value="SANTE">Santé</mat-option>
                  <mat-option value="TECHNOLOGIE">Technologie</mat-option>
                  <mat-option value="FINANCE">Finance</mat-option>
                  <mat-option value="COMMERCE">Commerce</mat-option>
                  <mat-option value="INDUSTRIE">Industrie</mat-option>
                  <mat-option value="SERVICES">Services</mat-option>
                  <mat-option value="AUTRE">Autre</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Adresse</mat-label>
                <textarea matInput formControlName="address" rows="2" placeholder="Adresse complète"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Téléphone</mat-label>
                <input matInput formControlName="phone" placeholder="+216 XX XXX XXX">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email" placeholder="contact@structure.com">
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Site web</mat-label>
                <input matInput formControlName="website" placeholder="https://www.structure.com">
              </mat-form-field>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="form-section">
            <h3>Paramètres</h3>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Statut</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="ACTIVE">Actif</mat-option>
                  <mat-option value="INACTIVE">Inactif</mat-option>
                  <mat-option value="PENDING">En attente</mat-option>
                </mat-select>
                <mat-error *ngIf="nomenclatureForm.get('status')?.hasError('required')">
                  Le statut est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Ordre d'affichage</mat-label>
                <input matInput formControlName="displayOrder" type="number" placeholder="1">
              </mat-form-field>
            </div>

            <div class="form-row">
              <div class="form-field checkbox-field">
                <label>
                  <input type="checkbox" formControlName="isDefault">
                  Nomenclature par défaut
                </label>
              </div>

              <div class="form-field checkbox-field">
                <label>
                  <input type="checkbox" formControlName="isVisible">
                  Visible dans les listes
                </label>
              </div>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-btn">
          <mat-icon>cancel</mat-icon>
          Annuler
        </button>
        <button mat-raised-button 
                color="primary" 
                (click)="onSubmit()" 
                [disabled]="nomenclatureForm.invalid || isSubmitting"
                class="submit-btn">
          <mat-icon>save</mat-icon>
          {{ isSubmitting ? 'Création...' : 'Créer la nomenclature' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 600px;
      max-width: 800px;
      width: 90vw;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      position: relative;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 32px;
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
      border-radius: 16px 16px 0 0;
      position: relative;
      overflow: hidden;
    }

    .dialog-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
      pointer-events: none;
    }

    .dialog-header h2 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 22px;
      font-weight: 600;
      position: relative;
      z-index: 1;
    }

    .dialog-header mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .close-btn {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }

    .dialog-content {
      padding: 32px;
      max-height: calc(90vh - 140px);
      overflow-y: auto;
      flex: 1;
      background: #fafbfc;
    }

    .dialog-content::-webkit-scrollbar {
      width: 8px;
    }

    .dialog-content::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    .dialog-content::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }

    .dialog-content::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }

    .form-section {
      margin-bottom: 32px;
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border: 1px solid #e8eaed;
    }

    .form-section:last-child {
      margin-bottom: 0;
    }

    .form-section h3 {
      margin: 0 0 20px 0;
      color: #1a1a1a;
      font-weight: 600;
      font-size: 18px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f0f0f0;
    }

    .form-section h3::before {
      content: '';
      width: 4px;
      height: 20px;
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      border-radius: 2px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-row:last-child {
      margin-bottom: 0;
    }

    .form-field {
      width: 100%;
    }

    .form-field mat-form-field {
      width: 100%;
    }

    .form-field ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }

    .form-field ::ng-deep .mat-mdc-text-field-wrapper {
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e1e5e9;
      transition: all 0.3s ease;
    }

    .form-field ::ng-deep .mat-mdc-text-field-wrapper:hover {
      border-color: #4caf50;
      box-shadow: 0 2px 8px rgba(76, 175, 80, 0.1);
    }

    .form-field ::ng-deep .mat-mdc-text-field-wrapper.mdc-text-field--focused {
      border-color: #4caf50;
      box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
    }

    .checkbox-field {
      display: flex;
      align-items: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e1e5e9;
    }

    .checkbox-field label {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      font-weight: 500;
      color: #333;
      margin: 0;
      width: 100%;
    }

    .checkbox-field input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #4caf50;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      padding: 24px 32px;
      border-top: 1px solid #e8eaed;
      background: white;
      border-radius: 0 0 16px 16px;
    }

    .cancel-btn, .submit-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 140px;
      height: 48px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .cancel-btn {
      background: #f8f9fa;
      color: #6c757d;
      border: 1px solid #dee2e6;
    }

    .cancel-btn:hover {
      background: #e9ecef;
      color: #495057;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .submit-btn {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
      border: none;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      transform: none;
      box-shadow: none;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .dialog-container {
        min-width: 95vw;
        max-width: 95vw;
        width: 95vw;
        max-height: 95vh;
        margin: 2.5vh auto;
      }

      .dialog-header {
        padding: 20px 24px;
      }

      .dialog-header h2 {
        font-size: 20px;
      }

      .dialog-content {
        padding: 24px 20px;
        max-height: calc(95vh - 120px);
      }

      .form-section {
        padding: 20px;
        margin-bottom: 24px;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .dialog-actions {
        padding: 20px 24px;
        flex-direction: column;
      }

      .cancel-btn, .submit-btn {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .dialog-container {
        min-width: 98vw;
        max-width: 98vw;
        width: 98vw;
        max-height: 98vh;
        margin: 1vh auto;
      }

      .dialog-header {
        padding: 16px 20px;
      }

      .dialog-header h2 {
        font-size: 18px;
      }

      .dialog-content {
        padding: 20px 16px;
        max-height: calc(98vh - 100px);
      }

      .form-section {
        padding: 16px;
      }

      .form-section h3 {
        font-size: 16px;
      }
    }

    /* Animation d'entrée */
    .dialog-container {
      animation: dialogSlideIn 0.3s ease-out;
    }

    @keyframes dialogSlideIn {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    /* Amélioration des champs de formulaire */
    .form-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .form-field ::ng-deep .mat-mdc-form-field-infix {
      padding: 12px 0;
      min-height: 48px;
    }

    .form-field ::ng-deep .mat-mdc-form-field-label {
      color: #6c757d;
      font-weight: 500;
    }

    .form-field ::ng-deep .mat-mdc-form-field-label.mat-mdc-form-field-label-animated {
      color: #4caf50;
    }

    /* Style des erreurs */
    .form-field ::ng-deep .mat-mdc-form-field.mat-form-field-invalid .mat-mdc-text-field-wrapper {
      border-color: #dc3545;
      box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
    }

    .form-field ::ng-deep .mat-mdc-form-field-error {
      color: #dc3545;
      font-size: 12px;
      margin-top: 4px;
    }
  `]
})
export class AddNomenclatureDialogComponent implements OnInit {
  nomenclatureForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddNomenclatureDialogComponent>
  ) {
    this.nomenclatureForm = this.fb.group({
      type: ['', Validators.required],
      code: ['', [Validators.required, Validators.minLength(3)]],
      label: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['ACTIVE', Validators.required],
      displayOrder: [1],
      isDefault: [false],
      isVisible: [true],
      // Champs spécifiques Application
      version: [''],
      developer: [''],
      url: [''],
      technology: [''],
      // Champs spécifiques Zone Géographique
      governorate: [''],
      delegation: [''],
      postalCode: [''],
      population: [''],
      // Champs spécifiques Structure
      structureType: [''],
      sector: [''],
      address: [''],
      phone: [''],
      email: [''],
      website: ['']
    });
  }

  ngOnInit() {
    console.log('🔄 AddNomenclatureDialog initialisé');
  }

  onTypeChange(type: string) {
    console.log('🔄 Type de nomenclature changé:', type);
    // Réinitialiser les champs spécifiques
    this.resetSpecificFields();
  }

  resetSpecificFields() {
    const type = this.nomenclatureForm.get('type')?.value;
    
    if (type !== 'APPLICATION') {
      this.nomenclatureForm.patchValue({
        version: '',
        developer: '',
        url: '',
        technology: ''
      });
    }
    
    if (type !== 'GEOGRAPHIC_ZONE') {
      this.nomenclatureForm.patchValue({
        governorate: '',
        delegation: '',
        postalCode: '',
        population: ''
      });
    }
    
    if (type !== 'STRUCTURE') {
      this.nomenclatureForm.patchValue({
        structureType: '',
        sector: '',
        address: '',
        phone: '',
        email: '',
        website: ''
      });
    }
  }

  onSubmit() {
    if (this.nomenclatureForm.valid) {
      this.isSubmitting = true;
      console.log('📝 Données du formulaire nomenclature:', this.nomenclatureForm.value);
      
      // Simulation d'une requête API
      setTimeout(() => {
        this.isSubmitting = false;
        this.dialogRef.close({
          success: true,
          nomenclature: this.nomenclatureForm.value
        });
      }, 2000);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
