import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MonitoringService } from '../../../services/monitoring.service';

interface MonitoringThreshold {
  id: string;
  metric: string;
  metricName?: string;
  description?: string;
  warningThreshold: number;
  criticalThreshold: number;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Component({
  selector: 'app-thresholds-dialog',
  templateUrl: './thresholds-dialog.component.html',
  styleUrls: ['./thresholds-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ]
})
export class ThresholdsDialogComponent implements OnInit {
  thresholds: MonitoringThreshold[] = [];
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<ThresholdsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private monitoringService: MonitoringService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadThresholds();
  }

  loadThresholds() {
    this.loading = true;
    this.monitoringService.getThresholds().subscribe({
      next: (thresholds) => {
        this.thresholds = thresholds;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading thresholds:', error);
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des seuils', 'Fermer', { duration: 3000 });
      }
    });
  }

  updateThreshold(threshold: MonitoringThreshold) {
    this.monitoringService.updateThreshold(threshold.id, threshold).subscribe({
      next: (updatedThreshold) => {
        const index = this.thresholds.findIndex(t => t.id === threshold.id);
        if (index !== -1) {
          this.thresholds[index] = updatedThreshold;
        }
        this.snackBar.open('Seuil mis à jour avec succès', 'Fermer', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error updating threshold:', error);
        this.snackBar.open('Erreur lors de la mise à jour du seuil', 'Fermer', { duration: 3000 });
      }
    });
  }

  initializeDefaults() {
    // Initialize default thresholds
    this.thresholds = [
      { 
        id: '1', 
        metric: 'CPU', 
        metricName: 'Processeur',
        description: 'Utilisation du processeur',
        warningThreshold: 80,
        criticalThreshold: 90,
        enabled: true
      },
      { 
        id: '2', 
        metric: 'RAM', 
        metricName: 'Mémoire RAM',
        description: 'Utilisation de la mémoire RAM',
        warningThreshold: 85,
        criticalThreshold: 95,
        enabled: true
      },
      { 
        id: '3', 
        metric: 'DISK', 
        metricName: 'Espace disque',
        description: 'Utilisation de l\'espace disque',
        warningThreshold: 90,
        criticalThreshold: 95,
        enabled: true
      },
      { 
        id: '4', 
        metric: 'RESPONSE_TIME', 
        metricName: 'Temps de réponse',
        description: 'Temps de réponse des API',
        warningThreshold: 1000,
        criticalThreshold: 2000,
        enabled: true
      }
    ];
  }

  saveAll() {
    this.loading = true;
    const updatePromises = this.thresholds.map(threshold => 
      this.monitoringService.updateThreshold(threshold.id, threshold).toPromise()
    );

    Promise.all(updatePromises)
      .then(() => {
        this.snackBar.open('Tous les seuils ont été mis à jour', 'Fermer', { duration: 3000 });
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error saving thresholds:', error);
        this.snackBar.open('Erreur lors de la sauvegarde des seuils', 'Fermer', { duration: 3000 });
        this.loading = false;
      });
  }

  resetToDefaults() {
    this.initializeDefaults();
    this.saveAll();
  }

  toggleThreshold(threshold: MonitoringThreshold) {
    threshold.enabled = !threshold.enabled;
    this.updateThreshold(threshold);
  }

  getAlertLevelColor(threshold: MonitoringThreshold, currentValue: number): string {
    if (currentValue >= threshold.criticalThreshold) return 'red';
    if (currentValue >= threshold.warningThreshold) return 'orange';
    return 'green';
  }

  close() {
    this.dialogRef.close();
  }
}