import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-two-factor-auth-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule
  ],
  template: `
    <div class="two-factor-modal">
      <div class="modal-header">
        <h2 mat-dialog-title>
          <mat-icon>security</mat-icon>
          {{ data.isEnabled ? 'Désactiver' : 'Activer' }} l'authentification à deux facteurs
        </h2>
        <button mat-icon-button mat-dialog-close class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <!-- Si 2FA est déjà activé -->
        <div *ngIf="data.isEnabled" class="disable-2fa-section">
          <div class="info-box warning">
            <mat-icon>warning</mat-icon>
            <p>La désactivation de l'authentification à deux facteurs réduira la sécurité de votre compte.</p>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Code de vérification</mat-label>
            <mat-icon matPrefix>vpn_key</mat-icon>
            <input matInput 
                   [(ngModel)]="verificationCode" 
                   placeholder="Entrez le code à 6 chiffres"
                   maxlength="6"
                   pattern="[0-9]*"
                   (keypress)="onlyNumbers($event)">
          </mat-form-field>

          <div class="actions">
            <button mat-stroked-button mat-dialog-close>
              <mat-icon>cancel</mat-icon>
              Annuler
            </button>
            <button mat-raised-button 
                    color="warn" 
                    (click)="disable2FA()"
                    [disabled]="isLoading || verificationCode.length !== 6">
              <mat-icon>lock_open</mat-icon>
              Désactiver 2FA
            </button>
          </div>
        </div>

        <!-- Si 2FA n'est pas activé -->
        <div *ngIf="!data.isEnabled" class="enable-2fa-section">
          <mat-stepper [linear]="true" #stepper>
            <!-- Étape 1: Installation de l'application -->
            <mat-step label="Installation">
              <div class="step-content">
                <h3>1. Installez une application d'authentification</h3>
                <p>Téléchargez et installez une application d'authentification sur votre smartphone :</p>
                
                <div class="app-suggestions">
                  <div class="app-card">
                    <mat-icon>phone_android</mat-icon>
                    <strong>Google Authenticator</strong>
                    <span>Android / iOS</span>
                  </div>
                  <div class="app-card">
                    <mat-icon>security</mat-icon>
                    <strong>Microsoft Authenticator</strong>
                    <span>Android / iOS</span>
                  </div>
                  <div class="app-card">
                    <mat-icon>verified_user</mat-icon>
                    <strong>Authy</strong>
                    <span>Android / iOS</span>
                  </div>
                </div>

                <button mat-raised-button color="primary" (click)="generateQRCode(); stepper.next()">
                  <mat-icon>arrow_forward</mat-icon>
                  Suivant
                </button>
              </div>
            </mat-step>

            <!-- Étape 2: Scanner le QR Code -->
            <mat-step label="Configuration">
              <div class="step-content">
                <h3>2. Scannez le QR Code</h3>
                <p>Ouvrez votre application d'authentification et scannez ce QR code :</p>

                <div class="qr-code-container" *ngIf="qrCodeUrl">
                  <img [src]="qrCodeUrl" alt="QR Code 2FA" class="qr-code">
                </div>

                <div class="loading-spinner" *ngIf="isLoadingQR">
                  <mat-spinner diameter="50"></mat-spinner>
                  <p>Génération du QR Code...</p>
                </div>

                <div class="secret-key-section" *ngIf="secretKey">
                  <p class="info-text">
                    <mat-icon>info</mat-icon>
                    Vous ne pouvez pas scanner le QR code ? Entrez cette clé manuellement :
                  </p>
                  <div class="secret-key">
                    <code>{{ secretKey }}</code>
                    <button mat-icon-button (click)="copySecretKey()" matTooltip="Copier">
                      <mat-icon>content_copy</mat-icon>
                    </button>
                  </div>
                </div>

                <div class="step-actions">
                  <button mat-stroked-button (click)="stepper.previous()">
                    <mat-icon>arrow_back</mat-icon>
                    Retour
                  </button>
                  <button mat-raised-button color="primary" (click)="stepper.next()">
                    <mat-icon>arrow_forward</mat-icon>
                    Suivant
                  </button>
                </div>
              </div>
            </mat-step>

            <!-- Étape 3: Vérification -->
            <mat-step label="Vérification">
              <div class="step-content">
                <h3>3. Vérifiez le code</h3>
                <p>Entrez le code à 6 chiffres généré par votre application :</p>

                <mat-form-field appearance="outline" class="full-width verification-field">
                  <mat-label>Code de vérification</mat-label>
                  <mat-icon matPrefix>vpn_key</mat-icon>
                  <input matInput 
                         [(ngModel)]="verificationCode" 
                         placeholder="000000"
                         maxlength="6"
                         pattern="[0-9]*"
                         (keypress)="onlyNumbers($event)"
                         class="verification-input">
                </mat-form-field>

                <div class="info-box success" *ngIf="verificationSuccess">
                  <mat-icon>check_circle</mat-icon>
                  <p>Code vérifié avec succès ! L'authentification à deux facteurs est maintenant activée.</p>
                </div>

                <div class="step-actions">
                  <button mat-stroked-button (click)="stepper.previous()" [disabled]="isLoading">
                    <mat-icon>arrow_back</mat-icon>
                    Retour
                  </button>
                  <button mat-raised-button 
                          color="primary" 
                          (click)="enable2FA()"
                          [disabled]="isLoading || verificationCode.length !== 6">
                    <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                    <mat-icon *ngIf="!isLoading">check</mat-icon>
                    {{ isLoading ? 'Vérification...' : 'Activer 2FA' }}
                  </button>
                </div>
              </div>
            </mat-step>
          </mat-stepper>
        </div>
      </mat-dialog-content>
    </div>
  `,
  styles: [`
    .two-factor-modal {
      min-width: 500px;
      max-width: 600px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;

      h2 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        font-size: 20px;
        font-weight: 600;

        mat-icon {
          color: #4caf50;
        }
      }

      .close-button {
        margin-left: auto;
      }
    }

    mat-dialog-content {
      padding: 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .disable-2fa-section,
    .enable-2fa-section {
      padding: 16px 0;
    }

    .info-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      p {
        margin: 0;
        flex: 1;
      }

      &.warning {
        background: #fff3e0;
        border: 1px solid #ff9800;
        color: #e65100;

        mat-icon {
          color: #ff9800;
        }
      }

      &.success {
        background: #e8f5e9;
        border: 1px solid #4caf50;
        color: #2e7d32;

        mat-icon {
          color: #4caf50;
        }
      }
    }

    .full-width {
      width: 100%;
    }

    .actions,
    .step-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }

    .step-content {
      padding: 24px 0;

      h3 {
        margin: 0 0 16px 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      p {
        margin: 0 0 16px 0;
        color: #666;
        line-height: 1.6;
      }
    }

    .app-suggestions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin: 24px 0;
    }

    .app-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      text-align: center;
      transition: all 0.3s ease;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #4caf50;
      }

      strong {
        font-size: 14px;
        color: #333;
      }

      span {
        font-size: 12px;
        color: #999;
      }

      &:hover {
        border-color: #4caf50;
        box-shadow: 0 4px 8px rgba(76, 175, 80, 0.2);
      }
    }

    .qr-code-container {
      display: flex;
      justify-content: center;
      padding: 24px;
      background: #f5f5f5;
      border-radius: 8px;
      margin: 24px 0;

      .qr-code {
        max-width: 250px;
        width: 100%;
        height: auto;
        border: 4px solid white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;

      p {
        margin: 0;
        color: #666;
      }
    }

    .secret-key-section {
      margin: 24px 0;

      .info-text {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #666;
        margin-bottom: 12px;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
          color: #2196f3;
        }
      }

      .secret-key {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: #f5f5f5;
        border: 1px solid #e0e0e0;
        border-radius: 4px;

        code {
          flex: 1;
          font-family: 'Courier New', monospace;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          letter-spacing: 2px;
        }
      }
    }

    .verification-field {
      margin: 24px 0;

      .verification-input {
        font-size: 24px;
        font-weight: 600;
        text-align: center;
        letter-spacing: 8px;
      }
    }

    @media (max-width: 600px) {
      .two-factor-modal {
        min-width: 100%;
      }

      .app-suggestions {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TwoFactorAuthModalComponent implements OnInit {
  verificationCode = '';
  qrCodeUrl = '';
  secretKey = '';
  isLoading = false;
  isLoadingQR = false;
  verificationSuccess = false;

  private apiUrl = 'http://localhost:8085/api';

  constructor(
    public dialogRef: MatDialogRef<TwoFactorAuthModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { isEnabled: boolean },
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('🔐 Modal 2FA ouverte. État actuel:', this.data.isEnabled ? 'Activé' : 'Désactivé');
  }

  generateQRCode(): void {
    this.isLoadingQR = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post<any>(`${this.apiUrl}/auth/2fa/generate`, {}, { headers })
      .subscribe({
        next: (response) => {
          console.log('✅ QR Code généré:', response);
          this.qrCodeUrl = response.qrCodeUrl;
          this.secretKey = response.secret;
          this.isLoadingQR = false;
        },
        error: (error) => {
          console.error('❌ Erreur génération QR Code:', error);
          this.isLoadingQR = false;
          this.snackBar.open('Erreur lors de la génération du QR Code', 'Fermer', { duration: 3000 });
        }
      });
  }

  enable2FA(): void {
    if (this.verificationCode.length !== 6) {
      this.snackBar.open('Le code doit contenir 6 chiffres', 'Fermer', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post<any>(`${this.apiUrl}/auth/2fa/enable`, {
      code: this.verificationCode,
      secret: this.secretKey
    }, { headers })
      .subscribe({
        next: (response) => {
          console.log('✅ 2FA activé avec succès:', response);
          this.verificationSuccess = true;
          this.isLoading = false;
          this.snackBar.open('✅ Authentification à deux facteurs activée !', 'Fermer', { duration: 5000 });
          
          setTimeout(() => {
            this.dialogRef.close({ success: true, enabled: true });
          }, 2000);
        },
        error: (error) => {
          console.error('❌ Erreur activation 2FA:', error);
          this.isLoading = false;
          this.snackBar.open('Code incorrect. Veuillez réessayer.', 'Fermer', { duration: 3000 });
        }
      });
  }

  disable2FA(): void {
    if (this.verificationCode.length !== 6) {
      this.snackBar.open('Le code doit contenir 6 chiffres', 'Fermer', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post<any>(`${this.apiUrl}/auth/2fa/disable`, {
      code: this.verificationCode
    }, { headers })
      .subscribe({
        next: (response) => {
          console.log('✅ 2FA désactivé avec succès:', response);
          this.isLoading = false;
          this.snackBar.open('✅ Authentification à deux facteurs désactivée', 'Fermer', { duration: 3000 });
          this.dialogRef.close({ success: true, enabled: false });
        },
        error: (error) => {
          console.error('❌ Erreur désactivation 2FA:', error);
          this.isLoading = false;
          this.snackBar.open('Code incorrect. Veuillez réessayer.', 'Fermer', { duration: 3000 });
        }
      });
  }

  copySecretKey(): void {
    navigator.clipboard.writeText(this.secretKey).then(() => {
      this.snackBar.open('Clé copiée dans le presse-papiers', 'Fermer', { duration: 2000 });
    });
  }

  onlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
}
