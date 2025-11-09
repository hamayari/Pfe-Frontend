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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { CreateUserRequest, UserRole, USER_ROLES } from '../../../models/user.model';

@Component({
  selector: 'app-add-user-dialog',
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
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="header-content">
          <div class="header-icon-wrapper">
            <mat-icon class="header-icon">person_add</mat-icon>
          </div>
          <div class="header-text">
            <h2 mat-dialog-title>Ajouter un nouvel utilisateur</h2>
            <p class="header-subtitle">Créez un nouveau compte utilisateur avec des rôles et permissions</p>
          </div>
        </div>
        <button mat-icon-button (click)="onCancel()" class="close-btn" matTooltip="Fermer">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
          <div class="form-section">
            <div class="section-header">
              <mat-icon class="section-icon">account_circle</mat-icon>
              <h3>Informations de base</h3>
            </div>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Nom d'utilisateur *</mat-label>
                <mat-icon matPrefix class="field-icon">person</mat-icon>
                <input matInput formControlName="username" placeholder="Entrez le nom d'utilisateur" matTooltip="Identifiant unique de l'utilisateur">
                <mat-hint>Min. 3 caractères</mat-hint>
                <mat-error *ngIf="userForm.get('username')?.hasError('required')">
                  Le nom d'utilisateur est requis
                </mat-error>
                <mat-error *ngIf="userForm.get('username')?.hasError('minlength')">
                  Le nom d'utilisateur doit contenir au moins 3 caractères
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Email *</mat-label>
                <mat-icon matPrefix class="field-icon">email</mat-icon>
                <input matInput formControlName="email" type="email" placeholder="exemple@email.com" matTooltip="Adresse email professionnelle">
                <mat-hint>Format: nom@domaine.com</mat-hint>
                <mat-error *ngIf="userForm.get('email')?.hasError('required')">
                  L'email est requis
                </mat-error>
                <mat-error *ngIf="userForm.get('email')?.hasError('email')">
                  Format d'email invalide
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Prénom</mat-label>
                <mat-icon matPrefix class="field-icon">badge</mat-icon>
                <input matInput formControlName="firstName" placeholder="Prénom">
                <mat-hint>Optionnel</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Nom</mat-label>
                <mat-icon matPrefix class="field-icon">badge</mat-icon>
                <input matInput formControlName="lastName" placeholder="Nom">
                <mat-hint>Optionnel</mat-hint>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Numéro de téléphone</mat-label>
                <mat-icon matPrefix class="field-icon">phone</mat-icon>
                <input matInput 
                       formControlName="phoneNumber" 
                       type="tel" 
                       placeholder="+216 XX XXX XXX"
                       (input)="onPhoneNumberChange($event)"
                       matTooltip="Numéro au format international">
                <mat-hint>Format: +216 XX XXX XXX</mat-hint>
                <mat-error *ngIf="userForm.get('phoneNumber')?.hasError('pattern')">
                  Format invalide. Utilisez le format international
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Pays</mat-label>
                <mat-icon matPrefix class="field-icon">flag</mat-icon>
                <mat-select formControlName="country" (selectionChange)="onCountryChange($event)">
                  <mat-option *ngFor="let country of countries" [value]="country.cca2">
                    <span class="country-option">
                      <span class="flag">{{ country.flag }}</span>
                      <span class="name">{{ country.name.common }}</span>
                      <span class="code">({{ country.cca2 }})</span>
                    </span>
                  </mat-option>
                </mat-select>
                <mat-hint>Sélectionnez le pays</mat-hint>
              </mat-form-field>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="form-section">
            <div class="section-header">
              <mat-icon class="section-icon">admin_panel_settings</mat-icon>
              <h3>Rôles et accès</h3>
            </div>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field full-width">
                <mat-label>Rôles *</mat-label>
                <mat-icon matPrefix class="field-icon">verified_user</mat-icon>
                <mat-select formControlName="roles" multiple matTooltip="Sélectionnez un ou plusieurs rôles">
                  <mat-option *ngFor="let role of getRoleOptions()" [value]="role.value">
                    <div class="role-option">
                      <span class="role-name">{{ role.label }}</span>
                      <span class="role-desc">{{ role.description }}</span>
                    </div>
                  </mat-option>
                </mat-select>
                <mat-hint>Sélectionnez au moins un rôle</mat-hint>
                <mat-error *ngIf="userForm.get('roles')?.hasError('required')">
                  Au moins un rôle doit être sélectionné
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <div class="form-field checkbox-field enhanced">
                <mat-icon class="checkbox-icon">power_settings_new</mat-icon>
                <label>
                  <input type="checkbox" formControlName="enabled">
                  <span class="checkbox-label">
                    <strong>Compte activé</strong>
                    <small>L'utilisateur pourra se connecter immédiatement</small>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="form-section">
            <div class="section-header">
              <mat-icon class="section-icon">lock</mat-icon>
              <h3>Sécurité</h3>
            </div>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Mot de passe *</mat-label>
                <mat-icon matPrefix class="field-icon">vpn_key</mat-icon>
                <input matInput formControlName="password" type="password" placeholder="••••••••" matTooltip="Minimum 6 caractères">
                <mat-hint>Min. 6 caractères</mat-hint>
                <mat-error *ngIf="userForm.get('password')?.hasError('required')">
                  Le mot de passe est requis
                </mat-error>
                <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
                  Le mot de passe doit contenir au moins 6 caractères
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Confirmer le mot de passe *</mat-label>
                <mat-icon matPrefix class="field-icon">check_circle</mat-icon>
                <input matInput formControlName="confirmPassword" type="password" placeholder="••••••••" matTooltip="Ressaisissez le mot de passe">
                <mat-hint>Doit correspondre au mot de passe</mat-hint>
                <mat-error *ngIf="userForm.get('confirmPassword')?.hasError('required')">
                  La confirmation du mot de passe est requise
                </mat-error>
                <mat-error *ngIf="userForm.hasError('passwordMismatch')">
                  Les mots de passe ne correspondent pas
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <div class="form-field checkbox-field enhanced">
                <mat-icon class="checkbox-icon">mail_outline</mat-icon>
                <label>
                  <input type="checkbox" formControlName="sendWelcomeEmail">
                  <span class="checkbox-label">
                    <strong>Envoyer un email de bienvenue</strong>
                    <small>L'utilisateur recevra ses identifiants par email</small>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-stroked-button (click)="onCancel()" class="cancel-btn" matTooltip="Annuler et fermer">
          <mat-icon>cancel</mat-icon>
          Annuler
        </button>
        <button mat-raised-button 
                color="primary" 
                (click)="onSubmit()" 
                [disabled]="userForm.invalid || isSubmitting"
                class="submit-btn"
                matTooltip="Créer le nouvel utilisateur">
          <mat-icon *ngIf="!isSubmitting">save</mat-icon>
          <mat-spinner *ngIf="isSubmitting" diameter="20" class="spinner"></mat-spinner>
          {{ isSubmitting ? 'Création en cours...' : 'Créer l\'utilisateur' }}
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
      padding: 28px 36px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 16px 16px 0 0;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.2);
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

    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
      position: relative;
      z-index: 1;
    }

    .header-icon-wrapper {
      width: 56px;
      height: 56px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .header-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .header-text h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .header-subtitle {
      margin: 4px 0 0 0;
      font-size: 13px;
      opacity: 0.9;
      font-weight: 400;
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

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #f0f0f0;
    }

    .section-icon {
      width: 28px;
      height: 28px;
      font-size: 28px;
      color: #667eea;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      border-radius: 8px;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .section-header h3 {
      margin: 0;
      color: #1a1a1a;
      font-weight: 600;
      font-size: 18px;
      flex: 1;
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
      border-color: #667eea;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
    }

    .form-field ::ng-deep .mat-mdc-text-field-wrapper.mdc-text-field--focused {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .checkbox-field {
      display: flex;
      align-items: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e1e5e9;
      transition: all 0.3s ease;
    }

    .checkbox-field:hover {
      background: #f0f2f5;
      border-color: #667eea;
    }

    .checkbox-field.enhanced {
      padding: 18px;
      gap: 14px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    }

    .checkbox-icon {
      color: #667eea;
      font-size: 24px;
      width: 24px;
      height: 24px;
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

    .checkbox-label {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .checkbox-label strong {
      font-size: 14px;
      color: #1a1a1a;
    }

    .checkbox-label small {
      font-size: 12px;
      color: #6c757d;
      font-weight: 400;
    }

    .checkbox-field input[type="checkbox"] {
      width: 20px;
      height: 20px;
      accent-color: #667eea;
      cursor: pointer;
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
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
      color: #667eea;
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

    /* Styles pour les options de pays */
    .country-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .country-option .flag {
      font-size: 18px;
      width: 24px;
      text-align: center;
    }

    .country-option .name {
      flex: 1;
      font-weight: 500;
    }

    .country-option .code {
      color: #6c757d;
      font-size: 12px;
      font-weight: 400;
    }

    /* Field icons */
    .field-icon {
      color: #667eea;
      margin-right: 8px;
      font-size: 20px;
    }

    /* Full width field */
    .full-width {
      grid-column: 1 / -1;
    }

    /* Role option styling */
    .role-option {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 4px 0;
    }

    .role-name {
      font-weight: 500;
      color: #1a1a1a;
    }

    .role-desc {
      font-size: 12px;
      color: #6c757d;
    }

    /* Spinner in button */
    .spinner {
      display: inline-block;
      margin-right: 8px;
    }

    .spinner ::ng-deep circle {
      stroke: white;
    }

    /* Enhanced hints */
    ::ng-deep .mat-mdc-form-field-hint {
      color: #6c757d;
      font-size: 12px;
    }
  `]
})
export class AddUserDialogComponent implements OnInit {
  userForm: FormGroup;
  isSubmitting = false;
  countries: any[] = [];
  selectedCountry: any = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddUserDialogComponent>,
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      firstName: [''],
      lastName: [''],
      phoneNumber: ['', [Validators.pattern(/^\+[1-9]\d{1,14}$/)]],
      country: ['TN'], // Tunisie par défaut
      roles: [[], Validators.required],
      enabled: [true],
      sendWelcomeEmail: [true]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    console.log('🔄 AddUserDialog initialisé');
    this.loadCountries();
  }

  loadCountries() {
    // Charger les pays depuis l'API REST Countries
    fetch('https://restcountries.com/v3.1/all')
      .then(response => response.json())
      .then(data => {
        this.countries = data
          .filter((country: any) => country.cca2 && country.name && country.flag)
          .sort((a: any, b: any) => a.name.common.localeCompare(b.name.common));
        
        // Sélectionner la Tunisie par défaut
        this.selectedCountry = this.countries.find(c => c.cca2 === 'TN');
        if (this.selectedCountry) {
          this.userForm.patchValue({ country: 'TN' });
        }
      })
      .catch(error => {
        console.error('Erreur lors du chargement des pays:', error);
        // Pays par défaut en cas d'erreur
        this.countries = [
          { cca2: 'TN', name: { common: 'Tunisia' }, flag: '🇹🇳' },
          { cca2: 'FR', name: { common: 'France' }, flag: '🇫🇷' },
          { cca2: 'DZ', name: { common: 'Algeria' }, flag: '🇩🇿' },
          { cca2: 'MA', name: { common: 'Morocco' }, flag: '🇲🇦' }
        ];
      });
  }

  onCountryChange(event: any) {
    const selectedCountryCode = event.value;
    this.selectedCountry = this.countries.find(c => c.cca2 === selectedCountryCode);
    
    if (this.selectedCountry) {
      // Mettre à jour le placeholder du numéro de téléphone
      const phoneInput = document.querySelector('input[formControlName="phoneNumber"]') as HTMLInputElement;
      if (phoneInput) {
        const phoneCode = this.getCountryPhoneCode(selectedCountryCode);
        phoneInput.placeholder = `${phoneCode} XX XXX XXX`;
      }
    }
  }

  onPhoneNumberChange(event: any) {
    const value = event.target.value;
    if (value && !value.startsWith('+')) {
      // Auto-ajouter le + si l'utilisateur ne l'a pas mis
      const countryCode = this.getCountryPhoneCode(this.userForm.get('country')?.value || 'TN');
      if (countryCode && !value.startsWith(countryCode)) {
        event.target.value = countryCode + value;
        this.userForm.patchValue({ phoneNumber: countryCode + value });
      }
    }
  }

  getCountryPhoneCode(countryCode: string): string {
    const phoneCodes: { [key: string]: string } = {
      'TN': '+216',
      'FR': '+33',
      'DZ': '+213',
      'MA': '+212',
      'US': '+1',
      'GB': '+44',
      'DE': '+49',
      'IT': '+39',
      'ES': '+34'
    };
    return phoneCodes[countryCode] || '+216';
  }

  getRoleOptions() {
    return Object.entries(USER_ROLES).map(([code, role]) => ({
      value: code as UserRole,
      label: role.name,
      description: role.description,
      color: role.color
    }));
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.isSubmitting = true;
      
      const userData: CreateUserRequest = {
        username: this.userForm.value.username,
        email: this.userForm.value.email,
        password: this.userForm.value.password,
        firstName: this.userForm.value.firstName,
        lastName: this.userForm.value.lastName,
        phoneNumber: this.userForm.value.phoneNumber,
        roles: this.userForm.value.roles,
        enabled: this.userForm.value.enabled,
        sendWelcomeEmail: this.userForm.value.sendWelcomeEmail
      };

      this.userService.createUser(userData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            this.dialogRef.close({
              success: true,
              user: response.data
            });
          } else {
            console.error('Erreur lors de la création:', response.message);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Erreur lors de la création:', error);
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
