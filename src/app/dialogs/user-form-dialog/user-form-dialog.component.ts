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
  selector: 'app-user-form-dialog',
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
      <mat-icon>person_add</mat-icon>
      {{ data.mode === 'create' ? 'Nouvel Utilisateur' : 'Modifier Utilisateur' }}
    </h2>
    
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom complet</mat-label>
            <input matInput formControlName="name" placeholder="Entrez le nom complet">
            <mat-error *ngIf="userForm.get('name')?.hasError('required')">
              Le nom est requis
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="Entrez l'email">
            <mat-error *ngIf="userForm.get('email')?.hasError('required')">
              L'email est requis
            </mat-error>
            <mat-error *ngIf="userForm.get('email')?.hasError('email')">
              Format d'email invalide
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Numéro de téléphone</mat-label>
            <input matInput formControlName="phoneNumber" type="tel" placeholder="+216 XX XXX XXX">
            <mat-hint>Format international requis (ex: +216 XX XXX XXX)</mat-hint>
            <mat-error *ngIf="userForm.get('phoneNumber')?.hasError('pattern')">
              Format invalide. Utilisez le format international (+216 XX XXX XXX)
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Rôle</mat-label>
            <mat-select formControlName="role">
              <mat-option value="Commercial">Commercial</mat-option>
              <mat-option value="Chef de Projet">Chef de Projet</mat-option>
              <mat-option value="Décideur">Décideur</mat-option>
              <mat-option value="Administrateur">Administrateur</mat-option>
            </mat-select>
            <mat-error *ngIf="userForm.get('role')?.hasError('required')">
              Le rôle est requis
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row" *ngIf="data.mode === 'create'">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Mot de passe</mat-label>
            <input matInput formControlName="password" type="password" placeholder="Entrez le mot de passe">
            <mat-error *ngIf="userForm.get('password')?.hasError('required')">
              Le mot de passe est requis
            </mat-error>
            <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
              Le mot de passe doit contenir au moins 6 caractères
            </mat-error>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">
          <mat-icon>cancel</mat-icon>
          Annuler
        </button>
        <button mat-raised-button color="primary" type="submit" [disabled]="userForm.invalid">
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
      min-width: 400px;
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
export class UserFormDialogComponent {
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', user?: any }
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^\+[1-9]\d{1,14}$/)]],
      role: ['', Validators.required],
      password: ['', data.mode === 'create' ? [Validators.required, Validators.minLength(6)] : []]
    });

    if (data.mode === 'edit' && data.user) {
      this.userForm.patchValue({
        name: data.user.name,
        email: data.user.email,
        phoneNumber: data.user.phoneNumber,
        role: data.user.role
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      const userData = {
        name: formValue.name,
        email: formValue.email,
        role: formValue.role,
        ...(this.data.mode === 'create' && { password: formValue.password })
      };
      
      this.dialogRef.close(userData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}