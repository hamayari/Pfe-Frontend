import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GovernmentApiService, Governorate } from '../../services/government-api.service';

@Component({
  selector: 'app-nomenclature-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>category</mat-icon>
      {{ data.mode === 'create' ? 'Nouvelle Taxonomie' : 'Modifier Taxonomie' }}
    </h2>
    
    <form [formGroup]="nomenclatureForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="name" placeholder="Entrez le nom de la taxonomie">
            <mat-error *ngIf="nomenclatureForm.get('name')?.hasError('required')">
              Le nom est requis
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Type</mat-label>
            <mat-select formControlName="type" (selectionChange)="onTypeChange($event.value)">
              <mat-option value="application">Application</mat-option>
              <mat-option value="zone">Zone</mat-option>
              <mat-option value="structure">Structure</mat-option>
            </mat-select>
            <mat-error *ngIf="nomenclatureForm.get('type')?.hasError('required')">
              Le type est requis
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3" placeholder="Description de la taxonomie"></textarea>
            <mat-error *ngIf="nomenclatureForm.get('description')?.hasError('required')">
              La description est requise
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row" *ngIf="nomenclatureForm.get('type')?.value === 'zone'">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Gouvernement</mat-label>
            <mat-select formControlName="gouvernement">
              <mat-option *ngFor="let gouvernement of gouvernorats" [value]="gouvernement.name">
                {{ gouvernement.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-row" *ngIf="nomenclatureForm.get('type')?.value === 'structure'">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Contact</mat-label>
            <input matInput formControlName="contact" placeholder="Email ou téléphone de contact">
          </mat-form-field>
        </div>

        <div class="form-row" *ngIf="nomenclatureForm.get('type')?.value === 'application'">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Parent</mat-label>
            <input matInput formControlName="parent" placeholder="Application parente (optionnel)">
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">
          <mat-icon>cancel</mat-icon>
          Annuler
        </button>
        <button mat-raised-button color="primary" type="submit" [disabled]="nomenclatureForm.invalid">
          <mat-icon>save</mat-icon>
          {{ data.mode === 'create' ? 'Créer' : 'Modifier' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .form-row {
      margin-bottom: 16px;
    }
    
    .full-width {
      width: 100%;
    }
    
    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
    }
    
    mat-dialog-content {
      min-width: 450px;
    }
    
    mat-dialog-actions {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }
    
    button {
      margin-left: 8px;
    }
  `]
})
export class NomenclatureFormDialogComponent implements OnInit {
  nomenclatureForm: FormGroup;
  gouvernorats: Governorate[] = [];

  constructor(
    private fb: FormBuilder,
    private governmentApiService: GovernmentApiService,
    public dialogRef: MatDialogRef<NomenclatureFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', nomenclature?: any }
  ) {
    this.nomenclatureForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required],
      gouvernement: [''],
      contact: [''],
      parent: ['']
    });

    if (data.mode === 'edit' && data.nomenclature) {
      this.nomenclatureForm.patchValue({
        name: data.nomenclature.name,
        type: data.nomenclature.type,
        description: data.nomenclature.description,
        gouvernement: data.nomenclature.gouvernement || '',
        contact: data.nomenclature.contact || '',
        parent: data.nomenclature.parent || ''
      });
    }
  }

  ngOnInit(): void {
    this.loadGovernorates();
  }

  loadGovernorates(): void {
    this.governmentApiService.getGovernorates().subscribe({
      next: (governorates) => {
        this.gouvernorats = governorates;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des gouvernorats:', error);
        // Fallback avec une liste statique en cas d'erreur
        this.gouvernorats = [
          { id: '1', name: 'Tunis', code: 'TN-11', population: 1056247, area: 346 },
          { id: '2', name: 'Ariana', code: 'TN-12', population: 576088, area: 482 },
          { id: '3', name: 'Ben Arous', code: 'TN-13', population: 631842, area: 761 },
          { id: '4', name: 'Manouba', code: 'TN-14', population: 379518, area: 1137 },
          { id: '5', name: 'Bizerte', code: 'TN-23', population: 568219, area: 3741 },
          { id: '6', name: 'Nabeul', code: 'TN-21', population: 787920, area: 2788 },
          { id: '7', name: 'Béja', code: 'TN-31', population: 303032, area: 3738 },
          { id: '8', name: 'Jendouba', code: 'TN-32', population: 401477, area: 3102 },
          { id: '9', name: 'Kef', code: 'TN-33', population: 243156, area: 4965 },
          { id: '10', name: 'Siliana', code: 'TN-34', population: 223087, area: 4642 },
          { id: '11', name: 'Sousse', code: 'TN-51', population: 674971, area: 2669 },
          { id: '12', name: 'Monastir', code: 'TN-52', population: 548828, area: 1019 },
          { id: '13', name: 'Mahdia', code: 'TN-53', population: 410812, area: 2966 },
          { id: '14', name: 'Sfax', code: 'TN-61', population: 955421, area: 7545 },
          { id: '15', name: 'Kairouan', code: 'TN-41', population: 570559, area: 6712 },
          { id: '16', name: 'Kasserine', code: 'TN-42', population: 439243, area: 8066 },
          { id: '17', name: 'Sidi Bouzid', code: 'TN-43', population: 429912, area: 6994 },
          { id: '18', name: 'Gabès', code: 'TN-81', population: 374300, area: 7166 },
          { id: '19', name: 'Medenine', code: 'TN-82', population: 479520, area: 9167 },
          { id: '20', name: 'Tataouine', code: 'TN-83', population: 149453, area: 38889 },
          { id: '21', name: 'Gafsa', code: 'TN-71', population: 337331, area: 8908 },
          { id: '22', name: 'Tozeur', code: 'TN-72', population: 107912, area: 4719 },
          { id: '23', name: 'Kebili', code: 'TN-73', population: 156961, area: 22184 }
        ];
      }
    });
  }

  onTypeChange(type: string): void {
    // Réinitialiser les champs conditionnels
    this.nomenclatureForm.patchValue({
      gouvernement: '',
      contact: '',
      parent: ''
    });
  }

  onSubmit(): void {
    if (this.nomenclatureForm.valid) {
      const formValue = this.nomenclatureForm.value;
      const nomenclatureData = {
        name: formValue.name,
        type: formValue.type,
        description: formValue.description,
        ...(formValue.gouvernement && { gouvernement: formValue.gouvernement }),
        ...(formValue.contact && { contact: formValue.contact }),
        ...(formValue.parent && { parent: formValue.parent })
      };
      
      this.dialogRef.close(nomenclatureData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}