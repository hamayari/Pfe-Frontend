import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-notification-preferences-test',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="test-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>science</mat-icon>
            Test des Préférences de Notifications
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="test-section">
            <h3>🧪 Tests Disponibles</h3>
            
            <div class="test-buttons">
              <button mat-raised-button color="primary" (click)="createTestPreferences()">
                <mat-icon>add_circle</mat-icon>
                Créer Préférences de Test
              </button>

              <button mat-raised-button color="accent" (click)="checkPreferences()">
                <mat-icon>search</mat-icon>
                Vérifier Mes Préférences
              </button>

              <button mat-raised-button (click)="getAllPreferences()">
                <mat-icon>list</mat-icon>
                Lister Toutes les Préférences
              </button>

              <button mat-raised-button color="warn" (click)="deleteAllPreferences()">
                <mat-icon>delete_sweep</mat-icon>
                Supprimer Toutes
              </button>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="results-section" *ngIf="testResults">
            <h3>📊 Résultats</h3>
            <pre>{{ testResults | json }}</pre>
          </div>

          <div class="status-section" *ngIf="preferencesStatus">
            <h3>✅ Statut de Vos Préférences</h3>
            
            <mat-chip-set>
              <mat-chip [color]="preferencesStatus.emailEnabled ? 'primary' : 'basic'">
                <mat-icon>email</mat-icon>
                Email: {{ preferencesStatus.emailEnabled ? 'Activé' : 'Désactivé' }}
              </mat-chip>
              
              <mat-chip [color]="preferencesStatus.smsEnabled ? 'primary' : 'basic'">
                <mat-icon>sms</mat-icon>
                SMS: {{ preferencesStatus.smsEnabled ? 'Activé' : 'Désactivé' }}
              </mat-chip>
              
              <mat-chip [color]="preferencesStatus.pushEnabled ? 'primary' : 'basic'">
                <mat-icon>notifications</mat-icon>
                Push: {{ preferencesStatus.pushEnabled ? 'Activé' : 'Désactivé' }}
              </mat-chip>
              
              <mat-chip [color]="preferencesStatus.quietHoursEnabled ? 'accent' : 'basic'">
                <mat-icon>bedtime</mat-icon>
                Heures Silence: {{ preferencesStatus.quietHoursEnabled ? 'Activé' : 'Désactivé' }}
              </mat-chip>
            </mat-chip-set>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .test-container {
      padding: 20px;
      max-width: 900px;
      margin: 0 auto;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .test-section {
      margin: 20px 0;
    }

    .test-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 15px;
    }

    .test-buttons button {
      flex: 1;
      min-width: 200px;
    }

    .results-section, .status-section {
      margin: 20px 0;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .results-section pre {
      background: white;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      max-height: 400px;
    }

    mat-chip-set {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }

    mat-chip {
      font-size: 14px;
    }

    mat-chip mat-icon {
      margin-right: 5px;
    }

    h3 {
      margin: 10px 0;
      color: #1976d2;
    }
  `]
})
export class NotificationPreferencesTestComponent {
  testResults: any = null;
  preferencesStatus: any = null;

  private apiUrl = 'http://localhost:8085/api/test/notification-preferences';

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private getUserId(): string | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id;
    }
    return null;
  }

  createTestPreferences(): void {
    const userId = this.getUserId();
    if (!userId) {
      this.snackBar.open('❌ Utilisateur non connecté', 'Fermer', { duration: 3000 });
      return;
    }

    console.log('🧪 Création de préférences de test pour userId:', userId);

    this.http.post(`${this.apiUrl}/create-test/${userId}`, {}, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (response) => {
          console.log('✅ Préférences de test créées:', response);
          this.testResults = response;
          this.snackBar.open('✅ Préférences de test créées avec succès', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('❌ Erreur:', error);
          this.snackBar.open('❌ Erreur lors de la création', 'Fermer', { duration: 3000 });
        }
      });
  }

  checkPreferences(): void {
    const userId = this.getUserId();
    if (!userId) {
      this.snackBar.open('❌ Utilisateur non connecté', 'Fermer', { duration: 3000 });
      return;
    }

    console.log('🔍 Vérification des préférences pour userId:', userId);

    this.http.get(`${this.apiUrl}/check/${userId}`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (response: any) => {
          console.log('✅ Préférences trouvées:', response);
          this.testResults = response;
          this.preferencesStatus = response.preferences || response;
          
          const message = response.exists 
            ? '✅ Préférences configurées' 
            : '⚠️ Aucune préférence - Valeurs par défaut utilisées';
          
          this.snackBar.open(message, 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('❌ Erreur:', error);
          this.snackBar.open('❌ Erreur lors de la vérification', 'Fermer', { duration: 3000 });
        }
      });
  }

  getAllPreferences(): void {
    console.log('📋 Récupération de toutes les préférences');

    this.http.get(`${this.apiUrl}/all`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (response) => {
          console.log('✅ Toutes les préférences:', response);
          this.testResults = response;
          this.snackBar.open(`✅ ${(response as any[]).length} préférences trouvées`, 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('❌ Erreur:', error);
          this.snackBar.open('❌ Erreur lors de la récupération', 'Fermer', { duration: 3000 });
        }
      });
  }

  deleteAllPreferences(): void {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer TOUTES les préférences ?')) {
      return;
    }

    console.log('🗑️ Suppression de toutes les préférences');

    this.http.delete(`${this.apiUrl}/delete-all`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (response) => {
          console.log('✅ Préférences supprimées:', response);
          this.testResults = response;
          this.preferencesStatus = null;
          this.snackBar.open('✅ Toutes les préférences supprimées', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('❌ Erreur:', error);
          this.snackBar.open('❌ Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
  }
}
