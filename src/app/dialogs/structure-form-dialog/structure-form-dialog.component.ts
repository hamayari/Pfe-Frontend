import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-structure-form-dialog',
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
      <mat-icon>business</mat-icon>
      {{ data.mode === 'create' ? 'Nouvelle Structure' : 'Modifier Structure' }}
    </h2>
    
    <form [formGroup]="structureForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom de la structure</mat-label>
            <input matInput formControlName="name" placeholder="Entrez le nom de la structure">
            <mat-error *ngIf="structureForm.get('name')?.hasError('required')">
              Le nom est requis
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Type</mat-label>
            <mat-select formControlName="type">
              <mat-option value="Commercial">Commercial</mat-option>
              <mat-option value="Industrial">Industriel</mat-option>
              <mat-option value="Residential">Résidentiel</mat-option>
              <mat-option value="Public">Public</mat-option>
              <mat-option value="Educational">Éducatif</mat-option>
              <mat-option value="Healthcare">Santé</mat-option>
            </mat-select>
            <mat-error *ngIf="structureForm.get('type')?.hasError('required')">
              Le type est requis
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Gouvernorat</mat-label>
            <mat-select formControlName="governorate">
              <mat-option value="Tunis">Tunis</mat-option>
              <mat-option value="Sfax">Sfax</mat-option>
              <mat-option value="Sousse">Sousse</mat-option>
              <mat-option value="Monastir">Monastir</mat-option>
              <mat-option value="Gabès">Gabès</mat-option>
              <mat-option value="Gafsa">Gafsa</mat-option>
              <mat-option value="Kairouan">Kairouan</mat-option>
              <mat-option value="Bizerte">Bizerte</mat-option>
              <mat-option value="Ariana">Ariana</mat-option>
              <mat-option value="Nabeul">Nabeul</mat-option>
            </mat-select>
            <mat-error *ngIf="structureForm.get('governorate')?.hasError('required')">
              Le gouvernorat est requis
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Contact</mat-label>
            <input matInput formControlName="contact" placeholder="Email ou téléphone de contact">
            <mat-error *ngIf="structureForm.get('contact')?.hasError('required')">
              Le contact est requis
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3" placeholder="Description de la structure"></textarea>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">
          <mat-icon>cancel</mat-icon>
          Annuler
        </button>
        <button mat-raised-button color="primary" type="submit" [disabled]="structureForm.invalid">
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
export class StructureFormDialogComponent {
  structureForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<StructureFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', structure?: any }
  ) {
    this.structureForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      governorate: ['', Validators.required],
      contact: ['', Validators.required],
      description: ['']
    });

    if (data.mode === 'edit' && data.structure) {
      this.structureForm.patchValue({
        name: data.structure.name,
        type: data.structure.type,
        governorate: data.structure.governorate,
        contact: data.structure.contact,
        description: data.structure.description
      });
    }
  }

  onSubmit(): void {
    if (this.structureForm.valid) {
      const formValue = this.structureForm.value;
      const structureData = {
        name: formValue.name,
        type: formValue.type,
        governorate: formValue.governorate,
        contact: formValue.contact,
        description: formValue.description
      };
      
      this.dialogRef.close(structureData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}