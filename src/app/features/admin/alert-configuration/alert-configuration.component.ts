import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface AlertConfiguration {
  id?: string;
  alertThreshold30Days: number;
  alertThreshold15Days: number;
  alertThreshold7Days: number;
  alertThreshold1Day: number;
  alert30DaysEnabled: boolean;
  alert15DaysEnabled: boolean;
  alert7DaysEnabled: boolean;
  alert1DayEnabled: boolean;
  alertSameDayEnabled: boolean;
  schedulerHour: number;
  schedulerMinute: number;
  emailNotificationsEnabled: boolean;
  websocketNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  notifyCreator: boolean;
  notifyCommercial: boolean;
  notifyProjectManager: boolean;
  notifyAdmins: boolean;
}

@Component({
  selector: 'app-alert-configuration',
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
    MatTooltipModule
  ],
  templateUrl: './alert-configuration.component.html',
  styleUrls: ['./alert-configuration.component.scss']
})
export class AlertConfigurationComponent implements OnInit {
  configForm: FormGroup;
  isLoading = false;
  isSaving = false;

  private apiUrl = `${environment.apiUrl}/alert-configuration`;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.configForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadConfiguration();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Seuils d'alerte
      alertThreshold30Days: [30, [Validators.required, Validators.min(1)]],
      alertThreshold15Days: [15, [Validators.required, Validators.min(1)]],
      alertThreshold7Days: [7, [Validators.required, Validators.min(1)]],
      alertThreshold1Day: [1, [Validators.required, Validators.min(1)]],
      
      // Activation des alertes
      alert30DaysEnabled: [true],
      alert15DaysEnabled: [true],
      alert7DaysEnabled: [true],
      alert1DayEnabled: [true],
      alertSameDayEnabled: [true],
      
      // Planification
      schedulerHour: [9, [Validators.required, Validators.min(0), Validators.max(23)]],
      schedulerMinute: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      
      // Canaux de notification
      emailNotificationsEnabled: [true],
      websocketNotificationsEnabled: [true],
      smsNotificationsEnabled: [false],
      
      // Destinataires
      notifyCreator: [true],
      notifyCommercial: [true],
      notifyProjectManager: [true],
      notifyAdmins: [false]
    });
  }

  loadConfiguration(): void {
    this.isLoading = true;
    this.http.get<AlertConfiguration>(this.apiUrl).subscribe({
      next: (config) => {
        this.configForm.patchValue(config);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading configuration:', error);
        this.snackBar.open('Erreur lors du chargement de la configuration', 'Fermer', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  saveConfiguration(): void {
    if (this.configForm.invalid) {
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const config = this.configForm.value;

    this.http.put<AlertConfiguration>(this.apiUrl, config).subscribe({
      next: () => {
        this.snackBar.open('Configuration enregistrée avec succès', 'Fermer', { duration: 3000 });
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error saving configuration:', error);
        this.snackBar.open('Erreur lors de l\'enregistrement de la configuration', 'Fermer', { duration: 5000 });
        this.isSaving = false;
      }
    });
  }

  resetConfiguration(): void {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser la configuration aux valeurs par défaut ?')) {
      return;
    }

    this.isLoading = true;
    this.http.post<AlertConfiguration>(`${this.apiUrl}/reset`, {}).subscribe({
      next: (config) => {
        this.configForm.patchValue(config);
        this.snackBar.open('Configuration réinitialisée avec succès', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error resetting configuration:', error);
        this.snackBar.open('Erreur lors de la réinitialisation', 'Fermer', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  testAlert(): void {
    this.http.post(`${this.apiUrl}/test`, {}).subscribe({
      next: () => {
        this.snackBar.open('Alerte de test envoyée avec succès', 'Fermer', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error sending test alert:', error);
        this.snackBar.open('Erreur lors de l\'envoi de l\'alerte de test', 'Fermer', { duration: 5000 });
      }
    });
  }

  getCronExpression(): string {
    const hour = this.configForm.get('schedulerHour')?.value || 0;
    const minute = this.configForm.get('schedulerMinute')?.value || 0;
    return `0 ${minute} ${hour} * * ?`;
  }
}
