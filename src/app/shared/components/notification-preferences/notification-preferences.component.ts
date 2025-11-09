import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface NotificationPreferences {
  id?: string;
  userId?: string;
  emailEnabled: boolean;
  emailFrequency: string;
  emailTypes: {
    conventions: boolean;
    invoices: boolean;
    payments: boolean;
    system: boolean;
    security: boolean;
  };
  smsEnabled: boolean;
  smsTypes: {
    urgent: boolean;
    overdue: boolean;
    system: boolean;
  };
  pushEnabled: boolean;
  pushTypes: {
    conventions: boolean;
    invoices: boolean;
    payments: boolean;
    system: boolean;
  };
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  quietHoursDays: string[];
  timezone: string;
}

@Component({
  selector: 'app-notification-preferences',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSelectModule,
    MatChipsModule
  ],
  template: `
    <div class="notification-preferences-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>notifications</mat-icon>
            Préférences de Notifications
          </mat-card-title>
          <mat-card-subtitle>
            Personnalisez vos notifications selon vos préférences
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="preferencesForm" *ngIf="!isLoading">
            
            <!-- Email Notifications -->
            <div class="preference-section">
              <h3><mat-icon>email</mat-icon> Notifications Email</h3>
              <mat-divider></mat-divider>
              
              <div class="toggle-row">
                <mat-slide-toggle formControlName="emailEnabled">
                  Activer les notifications par email
                </mat-slide-toggle>
              </div>

              <div *ngIf="preferencesForm.get('emailEnabled')?.value" class="sub-options">
                <mat-form-field appearance="outline">
                  <mat-label>Fréquence d'envoi</mat-label>
                  <mat-select formControlName="emailFrequency">
                    <mat-option value="immediate">Immédiat</mat-option>
                    <mat-option value="hourly">Toutes les heures</mat-option>
                    <mat-option value="daily">Quotidien</mat-option>
                    <mat-option value="weekly">Hebdomadaire</mat-option>
                  </mat-select>
                </mat-form-field>

                <div class="checkbox-group" formGroupName="emailTypes">
                  <h4>Types de notifications email</h4>
                  <mat-slide-toggle formControlName="conventions">Conventions</mat-slide-toggle>
                  <mat-slide-toggle formControlName="invoices">Factures</mat-slide-toggle>
                  <mat-slide-toggle formControlName="payments">Paiements</mat-slide-toggle>
                  <mat-slide-toggle formControlName="system">Système</mat-slide-toggle>
                  <mat-slide-toggle formControlName="security">Sécurité</mat-slide-toggle>
                </div>
              </div>
            </div>

            <!-- SMS Notifications -->
            <div class="preference-section">
              <h3><mat-icon>sms</mat-icon> Notifications SMS</h3>
              <mat-divider></mat-divider>
              
              <div class="toggle-row">
                <mat-slide-toggle formControlName="smsEnabled">
                  Activer les notifications par SMS
                </mat-slide-toggle>
              </div>

              <div *ngIf="preferencesForm.get('smsEnabled')?.value" class="sub-options">
                <div class="checkbox-group" formGroupName="smsTypes">
                  <h4>Types de notifications SMS</h4>
                  <mat-slide-toggle formControlName="urgent">Urgent uniquement</mat-slide-toggle>
                  <mat-slide-toggle formControlName="overdue">Échéances dépassées</mat-slide-toggle>
                  <mat-slide-toggle formControlName="system">Alertes système</mat-slide-toggle>
                </div>
              </div>
            </div>

            <!-- Push Notifications -->
            <div class="preference-section">
              <h3><mat-icon>notifications_active</mat-icon> Notifications Push (Navigateur)</h3>
              <mat-divider></mat-divider>
              
              <div class="toggle-row">
                <mat-slide-toggle formControlName="pushEnabled">
                  Activer les notifications push
                </mat-slide-toggle>
              </div>

              <div *ngIf="preferencesForm.get('pushEnabled')?.value" class="sub-options">
                <div class="checkbox-group" formGroupName="pushTypes">
                  <h4>Types de notifications push</h4>
                  <mat-slide-toggle formControlName="conventions">Conventions</mat-slide-toggle>
                  <mat-slide-toggle formControlName="invoices">Factures</mat-slide-toggle>
                  <mat-slide-toggle formControlName="payments">Paiements</mat-slide-toggle>
                  <mat-slide-toggle formControlName="system">Système</mat-slide-toggle>
                </div>
              </div>
            </div>

            <!-- Quiet Hours -->
            <div class="preference-section">
              <h3><mat-icon>bedtime</mat-icon> Heures de Silence</h3>
              <mat-divider></mat-divider>
              
              <div class="toggle-row">
                <mat-slide-toggle formControlName="quietHoursEnabled">
                  Activer les heures de silence
                </mat-slide-toggle>
              </div>

              <div *ngIf="preferencesForm.get('quietHoursEnabled')?.value" class="sub-options">
                <div class="time-range">
                  <mat-form-field appearance="outline">
                    <mat-label>Début</mat-label>
                    <input matInput type="time" formControlName="quietHoursStart">
                  </mat-form-field>
                  <span class="separator">à</span>
                  <mat-form-field appearance="outline">
                    <mat-label>Fin</mat-label>
                    <input matInput type="time" formControlName="quietHoursEnd">
                  </mat-form-field>
                </div>
                <p class="hint">Aucune notification ne sera envoyée pendant ces heures</p>
              </div>
            </div>

          </form>

          <div *ngIf="isLoading" class="loading-container">
            <mat-spinner></mat-spinner>
            <p>Chargement des préférences...</p>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <button mat-raised-button color="primary" 
                  (click)="savePreferences()" 
                  [disabled]="isSaving || preferencesForm.invalid">
            <mat-icon>save</mat-icon>
            {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
          <button mat-button (click)="resetPreferences()" [disabled]="isSaving">
            <mat-icon>refresh</mat-icon>
            Réinitialiser
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .notification-preferences-container {
      padding: 20px;
      max-width: 900px;
      margin: 0 auto;
    }

    mat-card {
      margin-bottom: 20px;
    }

    mat-card-header {
      margin-bottom: 20px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 24px;
    }

    .preference-section {
      margin-bottom: 30px;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .preference-section h3 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 15px 0;
      color: #1976d2;
    }

    .toggle-row {
      margin: 15px 0;
    }

    .sub-options {
      margin-left: 30px;
      margin-top: 15px;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 10px;
    }

    .checkbox-group h4 {
      margin: 10px 0 5px 0;
      font-size: 14px;
      color: #666;
    }

    .time-range {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-top: 10px;
    }

    .separator {
      font-weight: bold;
      color: #666;
    }

    .hint {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
    }

    mat-card-actions {
      display: flex;
      gap: 10px;
      padding: 16px;
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 10px;
    }
  `]
})
export class NotificationPreferencesComponent implements OnInit {
  preferencesForm: FormGroup;
  isLoading = false;
  isSaving = false;

  private apiUrl = 'http://localhost:8085/api/user/notification-preferences';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.preferencesForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadPreferences();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      emailEnabled: [true],
      emailFrequency: ['daily'],
      emailTypes: this.fb.group({
        conventions: [true],
        invoices: [true],
        payments: [true],
        system: [false],
        security: [true]
      }),
      smsEnabled: [false],
      smsTypes: this.fb.group({
        urgent: [true],
        overdue: [true],
        system: [false]
      }),
      pushEnabled: [true],
      pushTypes: this.fb.group({
        conventions: [true],
        invoices: [true],
        payments: [true],
        system: [false]
      }),
      quietHoursEnabled: [false],
      quietHoursStart: ['22:00'],
      quietHoursEnd: ['08:00'],
      timezone: ['Europe/Paris']
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadPreferences(): void {
    this.isLoading = true;
    this.http.get<NotificationPreferences>(this.apiUrl, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (prefs) => {
          this.preferencesForm.patchValue(prefs);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des préférences:', error);
          this.snackBar.open('Erreur lors du chargement des préférences', 'Fermer', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  savePreferences(): void {
    if (this.preferencesForm.invalid) {
      this.snackBar.open('⚠️ Veuillez corriger les erreurs du formulaire', 'Fermer', { duration: 3000 });
      return;
    }

    // Validation personnalisée
    const formValue = this.preferencesForm.value;
    if (formValue.quietHoursEnabled) {
      if (!formValue.quietHoursStart || !formValue.quietHoursEnd) {
        this.snackBar.open('⚠️ Veuillez définir les heures de silence', 'Fermer', { duration: 3000 });
        return;
      }
    }

    this.isSaving = true;
    const preferences = formValue;

    console.log('💾 Enregistrement des préférences:', preferences);

    this.http.put<NotificationPreferences>(this.apiUrl, preferences, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (savedPrefs) => {
          console.log('✅ Préférences enregistrées:', savedPrefs);
          this.snackBar.open('✅ Préférences enregistrées avec succès', 'Fermer', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.isSaving = false;
          
          // Afficher un résumé
          this.showPreferencesSummary(savedPrefs);
        },
        error: (error) => {
          console.error('❌ Erreur lors de l\'enregistrement:', error);
          this.snackBar.open('❌ Erreur lors de l\'enregistrement: ' + (error.error?.message || error.message), 'Fermer', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isSaving = false;
        }
      });
  }

  /**
   * Afficher un résumé des préférences sauvegardées
   */
  private showPreferencesSummary(prefs: NotificationPreferences): void {
    const channels: string[] = [];
    if (prefs.emailEnabled) channels.push('📧 Email');
    if (prefs.smsEnabled) channels.push('📱 SMS');
    if (prefs.pushEnabled) channels.push('🔔 Push');
    
    const summary = `Canaux actifs: ${channels.join(', ') || 'Aucun'}`;
    console.log('📊 Résumé des préférences:', summary);
  }

  resetPreferences(): void {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser vos préférences ?')) {
      this.isSaving = true;
      this.http.post<NotificationPreferences>(`${this.apiUrl}/reset`, {}, { headers: this.getAuthHeaders() })
        .subscribe({
          next: (prefs) => {
            this.preferencesForm.patchValue(prefs);
            this.snackBar.open('✅ Préférences réinitialisées', 'Fermer', { duration: 3000 });
            this.isSaving = false;
          },
          error: (error) => {
            console.error('Erreur lors de la réinitialisation:', error);
            this.snackBar.open('❌ Erreur lors de la réinitialisation', 'Fermer', { duration: 3000 });
            this.isSaving = false;
          }
        });
    }
  }
}
