import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-kpi-alert-delegation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>forward</mat-icon>
      Déléguer l'Alerte KPI
    </h2>

    <mat-dialog-content>
      <div class="delegation-form">
        <!-- Informations de l'alerte -->
        <div class="alert-info">
          <h3>{{ data.alert.kpiName }}</h3>
          <p class="alert-message">{{ data.alert.message }}</p>
          <div class="alert-meta">
            <span class="severity" [class]="'severity-' + data.alert.severity">
              {{ data.alert.severity }}
            </span>
            <span class="priority">Priorité: {{ data.alert.priority }}</span>
          </div>
        </div>

        <!-- Sélection Chef de Projet -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Chef de Projet</mat-label>
          <mat-select [(ngModel)]="selectedProjectManagerId" required>
            <mat-option *ngFor="let pm of projectManagers" [value]="pm.id">
              {{ pm.name }} ({{ pm.email }})
            </mat-option>
          </mat-select>
          <mat-icon matPrefix>person</mat-icon>
        </mat-form-field>

        <!-- Priorité -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Priorité</mat-label>
          <mat-select [(ngModel)]="priority">
            <mat-option value="LOW">Basse</mat-option>
            <mat-option value="MEDIUM">Moyenne</mat-option>
            <mat-option value="HIGH">Haute</mat-option>
            <mat-option value="CRITICAL">Critique</mat-option>
            <mat-option value="URGENT">Urgente</mat-option>
          </mat-select>
          <mat-icon matPrefix>flag</mat-icon>
        </mat-form-field>

        <!-- Commentaire -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Commentaire / Instructions</mat-label>
          <textarea 
            matInput 
            [(ngModel)]="comment" 
            rows="4"
            placeholder="Ajoutez des instructions ou commentaires pour le Chef de Projet..."></textarea>
          <mat-icon matPrefix>comment</mat-icon>
        </mat-form-field>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
        Annuler
      </button>
      <button 
        mat-raised-button 
        color="primary" 
        (click)="onDelegate()"
        [disabled]="!selectedProjectManagerId || isLoading">
        <mat-icon>send</mat-icon>
        {{ isLoading ? 'Délégation...' : 'Déléguer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .delegation-form {
      min-width: 500px;
      padding: 20px 0;
    }

    .alert-info {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .alert-info h3 {
      margin: 0 0 10px 0;
      color: #1976d2;
    }

    .alert-message {
      margin: 10px 0;
      color: #666;
    }

    .alert-meta {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }

    .severity {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }

    .severity-HIGH {
      background: #f44336;
      color: white;
    }

    .severity-MEDIUM {
      background: #ff9800;
      color: white;
    }

    .severity-LOW {
      background: #4caf50;
      color: white;
    }

    .priority {
      padding: 4px 12px;
      background: #e3f2fd;
      border-radius: 12px;
      font-size: 12px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }

    mat-dialog-actions {
      padding: 20px 0 0 0;
    }
  `]
})
export class KpiAlertDelegationDialogComponent {
  projectManagers: any[] = [];
  selectedProjectManagerId: string = '';
  priority: string = 'HIGH';
  comment: string = '';
  isLoading: boolean = false;

  private apiUrl = 'http://localhost:8085/api/kpi-alerts';

  constructor(
    public dialogRef: MatDialogRef<KpiAlertDelegationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.priority = data.alert.priority || 'HIGH';
    this.loadProjectManagers();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadProjectManagers(): void {
    this.http.get<any>(`${this.apiUrl}/available-project-managers`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (response) => {
          this.projectManagers = response.projectManagers || [];
          console.log('✅ Chefs de Projet chargés:', this.projectManagers.length);
        },
        error: (error) => {
          console.error('❌ Erreur chargement Chefs de Projet:', error);
          this.snackBar.open('Erreur lors du chargement des Chefs de Projet', 'Fermer', { duration: 3000 });
        }
      });
  }

  onDelegate(): void {
    if (!this.selectedProjectManagerId) {
      this.snackBar.open('Veuillez sélectionner un Chef de Projet', 'Fermer', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    const delegationData = {
      projectManagerId: this.selectedProjectManagerId,
      comment: this.comment,
      priority: this.priority
    };

    console.log('🔄 Délégation de l\'alerte:', this.data.alert.id);

    this.http.post<any>(
      `${this.apiUrl}/${this.data.alert.id}/delegate`,
      delegationData,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (response) => {
        console.log('✅ Alerte déléguée avec succès:', response);
        this.snackBar.open('✅ Alerte déléguée avec succès au Chef de Projet', 'Fermer', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close({ success: true, response });
      },
      error: (error) => {
        console.error('❌ Erreur lors de la délégation:', error);
        this.snackBar.open('❌ Erreur lors de la délégation: ' + (error.error?.message || error.message), 'Fermer', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }
}
