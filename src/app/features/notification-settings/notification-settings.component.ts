import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConventionService } from '../../services/convention.service';
import { InvoiceService } from '../../services/invoice.service';

import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface NotificationPreferences {
  id?: string;
  userId: string;
  
  // Email notifications
  emailEnabled: boolean;
  emailFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  emailTypes: {
    conventions: boolean;
    invoices: boolean;
    payments: boolean;
    system: boolean;
    security: boolean;
  };
  
  // SMS notifications
  smsEnabled: boolean;
  smsTypes: {
    urgent: boolean;
    overdue: boolean;
    system: boolean;
  };
  
  // Push notifications
  pushEnabled: boolean;
  pushTypes: {
    conventions: boolean;
    invoices: boolean;
    payments: boolean;
    system: boolean;
  };
  
  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  quietHoursDays: string[];
  
  // Thresholds
  thresholds: {
    overdueInvoices: number;
    lowBalance: number;
    systemErrors: number;
  };
  
  // Channels
  channels: {
    email: string;
    sms: string;
    slack?: string;
    teams?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatDividerModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatChipsModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatListModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="notification-settings-container">
      <mat-card class="settings-header">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>notifications_active</mat-icon>
            Paramètres de Notifications
          </mat-card-title>
          <mat-card-subtitle>
            Configurez vos préférences de notifications pour rester informé
          </mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <div class="settings-content">
        <mat-tab-group>
          <!-- Onglet Email -->
          <mat-tab label="Email">
            <mat-card class="settings-card">
              <mat-card-content>
                <div class="setting-section">
                  <div class="setting-header">
                    <mat-slide-toggle 
                      [(ngModel)]="preferences.emailEnabled"
                      (change)="onEmailToggle()">
                      Notifications par email
                    </mat-slide-toggle>
                  </div>
                  
                  <div class="setting-content" [class.disabled]="!preferences.emailEnabled">
                    <mat-form-field appearance="outline">
                      <mat-label>Fréquence d'envoi</mat-label>
                      <mat-select [(ngModel)]="preferences.emailFrequency">
                        <mat-option value="immediate">Immédiat</mat-option>
                        <mat-option value="hourly">Toutes les heures</mat-option>
                        <mat-option value="daily">Quotidien</mat-option>
                        <mat-option value="weekly">Hebdomadaire</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Adresse email</mat-label>
                      <input matInput [(ngModel)]="preferences.channels.email" 
                             type="email" placeholder="votre@email.com">
                    </mat-form-field>

                    <div class="notification-types">
                      <h4>Types de notifications</h4>
                      <div class="type-grid">
                        <mat-checkbox [(ngModel)]="preferences.emailTypes.conventions">
                          Conventions
                        </mat-checkbox>
                        <mat-checkbox [(ngModel)]="preferences.emailTypes.invoices">
                          Factures
                        </mat-checkbox>
                        <mat-checkbox [(ngModel)]="preferences.emailTypes.payments">
                          Paiements
                        </mat-checkbox>
                        <mat-checkbox [(ngModel)]="preferences.emailTypes.system">
                          Système
                        </mat-checkbox>
                        <mat-checkbox [(ngModel)]="preferences.emailTypes.security">
                          Sécurité
                        </mat-checkbox>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-tab>

          <!-- Onglet SMS -->
          <mat-tab label="SMS">
            <mat-card class="settings-card">
              <mat-card-content>
                <div class="setting-section">
                  <div class="setting-header">
                    <mat-slide-toggle 
                      [(ngModel)]="preferences.smsEnabled"
                      (change)="onSmsToggle()">
                      Notifications par SMS
                    </mat-slide-toggle>
                  </div>
                  
                  <div class="setting-content" [class.disabled]="!preferences.smsEnabled">
                    <mat-form-field appearance="outline">
                      <mat-label>Numéro de téléphone</mat-label>
                      <input matInput [(ngModel)]="preferences.channels.sms" 
                             type="tel" placeholder="+33 6 12 34 56 78">
                    </mat-form-field>

                    <div class="notification-types">
                      <h4>Types de notifications</h4>
                      <div class="type-grid">
                        <mat-checkbox [(ngModel)]="preferences.smsTypes.urgent">
                          Urgences
                        </mat-checkbox>
                        <mat-checkbox [(ngModel)]="preferences.smsTypes.overdue">
                          Échéances dépassées
                        </mat-checkbox>
                        <mat-checkbox [(ngModel)]="preferences.smsTypes.system">
                          Alertes système
                        </mat-checkbox>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-tab>

          <!-- Onglet Push -->
          <mat-tab label="Push">
            <mat-card class="settings-card">
              <mat-card-content>
                <div class="setting-section">
                  <div class="setting-header">
                    <mat-slide-toggle 
                      [(ngModel)]="preferences.pushEnabled"
                      (change)="onPushToggle()">
                      Notifications push
                    </mat-slide-toggle>
                  </div>
                  
                  <div class="setting-content" [class.disabled]="!preferences.pushEnabled">
                    <div class="notification-types">
                      <h4>Types de notifications</h4>
                      <div class="type-grid">
                        <mat-checkbox [(ngModel)]="preferences.pushTypes.conventions">
                          Conventions
                        </mat-checkbox>
                        <mat-checkbox [(ngModel)]="preferences.pushTypes.invoices">
                          Factures
                        </mat-checkbox>
                        <mat-checkbox [(ngModel)]="preferences.pushTypes.payments">
                          Paiements
                        </mat-checkbox>
                        <mat-checkbox [(ngModel)]="preferences.pushTypes.system">
                          Système
                        </mat-checkbox>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-tab>

          <!-- Onglet Heures Silencieuses -->
          <mat-tab label="Heures Silencieuses">
            <mat-card class="settings-card">
              <mat-card-content>
                <div class="setting-section">
                  <div class="setting-header">
                    <mat-slide-toggle 
                      [(ngModel)]="preferences.quietHoursEnabled"
                      (change)="onQuietHoursToggle()">
                      Activer les heures silencieuses
                    </mat-slide-toggle>
                  </div>
                  
                  <div class="setting-content" [class.disabled]="!preferences.quietHoursEnabled">
                    <div class="time-range">
                      <mat-form-field appearance="outline">
                        <mat-label>Début</mat-label>
                        <input matInput [(ngModel)]="preferences.quietHoursStart" 
                               type="time">
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Fin</mat-label>
                        <input matInput [(ngModel)]="preferences.quietHoursEnd" 
                               type="time">
                      </mat-form-field>
                    </div>

                    <div class="days-selection">
                      <h4>Jours d'application</h4>
                      <div class="days-grid">
                        <mat-checkbox [(ngModel)]="quietHoursDays.monday">Lundi</mat-checkbox>
                        <mat-checkbox [(ngModel)]="quietHoursDays.tuesday">Mardi</mat-checkbox>
                        <mat-checkbox [(ngModel)]="quietHoursDays.wednesday">Mercredi</mat-checkbox>
                        <mat-checkbox [(ngModel)]="quietHoursDays.thursday">Jeudi</mat-checkbox>
                        <mat-checkbox [(ngModel)]="quietHoursDays.friday">Vendredi</mat-checkbox>
                        <mat-checkbox [(ngModel)]="quietHoursDays.saturday">Samedi</mat-checkbox>
                        <mat-checkbox [(ngModel)]="quietHoursDays.sunday">Dimanche</mat-checkbox>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-tab>

          <!-- Onglet Seuils -->
          <mat-tab label="Seuils">
            <mat-card class="settings-card">
              <mat-card-content>
                <div class="setting-section">
                  <h3>Seuils d'alerte</h3>
                  
                  <div class="threshold-item">
                    <label>Factures en retard (jours)</label>
                    <mat-slider [(ngModel)]="preferences.thresholds.overdueInvoices" 
                               min="1" max="30" step="1">
                    </mat-slider>
                    <span class="threshold-value">{{ preferences.thresholds.overdueInvoices }} jours</span>
                  </div>

                  <div class="threshold-item">
                    <label>Solde faible (€)</label>
                    <mat-slider [(ngModel)]="preferences.thresholds.lowBalance" 
                               min="100" max="10000" step="100">
                    </mat-slider>
                    <span class="threshold-value">{{ preferences.thresholds.lowBalance }}€</span>
                  </div>

                  <div class="threshold-item">
                    <label>Erreurs système (nombre)</label>
                    <mat-slider [(ngModel)]="preferences.thresholds.systemErrors" 
                               min="1" max="100" step="1">
                    </mat-slider>
                    <span class="threshold-value">{{ preferences.thresholds.systemErrors }} erreurs</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-tab>

          <!-- Onglet Gabarits -->
          <mat-tab label="Gabarits">
            <mat-card class="settings-card">
              <mat-card-content>
                <div class="setting-section">
                  <div class="setting-header">
                    <mat-form-field appearance="outline">
                      <mat-label>Type de notification</mat-label>
                      <mat-select [(ngModel)]="templateEditor.type" (selectionChange)="loadTemplatesForType()">
                        <mat-option value="PREVENTIVE">Préventive (J-X)</mat-option>
                        <mat-option value="OVERDUE">Échéance dépassée</mat-option>
                        <mat-option value="CONFIRMATION">Confirmation (payée/non payée)</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="setting-content">
                    <div class="type-grid" style="margin-bottom:12px">
                      <mat-form-field appearance="outline">
                        <mat-label>Contexte</mat-label>
                        <mat-select [(ngModel)]="previewEntityType">
                          <mat-option value="invoice">Facture</mat-option>
                          <mat-option value="convention">Convention</mat-option>
                        </mat-select>
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Sélection</mat-label>
                        <mat-select [(ngModel)]="previewSelectedId" (openedChange)="onPreviewSelectOpen()">
                          <mat-option *ngFor="let it of (previewEntityType==='invoice' ? cachedInvoices : cachedConventions)" [value]="it.id">
                            {{ previewEntityType==='invoice' ? (it.invoiceNumber || it.reference) : (it.reference || it.title) }}
                          </mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>
                    <h4>Email</h4>
                    <div class="type-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>Sujet</mat-label>
                        <input matInput [(ngModel)]="templateEditor.email.subject" placeholder="Sujet email">
                      </mat-form-field>
                      <div></div>
                    </div>
                    <mat-form-field appearance="outline" style="width:100%">
                      <mat-label>Corps</mat-label>
                      <textarea matInput rows="6" [(ngModel)]="templateEditor.email.content" placeholder="Contenu email avec variables (ex: [[invoiceNumber]], [[dueDate]])"></textarea>
                    </mat-form-field>

                    <h4>SMS</h4>
                    <mat-form-field appearance="outline" style="width:100%">
                      <mat-label>Message SMS</mat-label>
                      <textarea matInput rows="3" [(ngModel)]="templateEditor.sms.content" placeholder="Contenu SMS (ex: [[invoiceNumber]] due [[dueDate]])"></textarea>
                    </mat-form-field>

                    <div class="actions-section">
                      <button mat-raised-button color="primary" (click)="previewTemplate()">
                        <mat-icon>visibility</mat-icon>
                        Aperçu
                      </button>
                      <button mat-raised-button color="accent" (click)="saveTemplates()">
                        <mat-icon>save</mat-icon>
                        Enregistrer les gabarits
                      </button>
                    </div>

                    <div *ngIf="templatePreview.subject || templatePreview.content" style="margin-top:12px">
                      <mat-card>
                        <mat-card-header>
                          <mat-card-title>Aperçu</mat-card-title>
                        </mat-card-header>
                        <mat-card-content>
                          <div><strong>Sujet:</strong> {{ templatePreview.subject || '—' }}</div>
                          <div style="white-space:pre-wrap; margin-top:8px"><strong>Contenu:</strong>\n{{ templatePreview.content || '—' }}</div>
                        </mat-card-content>
                      </mat-card>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-tab>
        </mat-tab-group>

        <!-- Actions -->
        <div class="actions-section">
          <button mat-raised-button color="warn" (click)="resetToDefaults()">
            <mat-icon>restore</mat-icon>
            Réinitialiser
          </button>
          
          <button mat-raised-button color="primary" (click)="saveSettings()" 
                  [disabled]="isLoading">
            <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
            <mat-icon *ngIf="!isLoading">save</mat-icon>
            {{ isLoading ? 'Sauvegarde...' : 'Sauvegarder' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-settings-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .settings-header {
      margin-bottom: 20px;
    }

    .settings-header mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .settings-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .settings-card {
      margin-bottom: 20px;
    }

    .setting-section {
      margin-bottom: 24px;
    }

    .setting-header {
      margin-bottom: 16px;
    }

    .setting-content {
      padding-left: 20px;
    }

    .setting-content.disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    .notification-types {
      margin-top: 20px;
    }

    .notification-types h4 {
      margin-bottom: 12px;
      color: #333;
    }

    .type-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .time-range {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }

    .days-selection h4 {
      margin-bottom: 12px;
      color: #333;
    }

    .days-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 8px;
    }

    .threshold-item {
      margin-bottom: 24px;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .threshold-item label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }

    .threshold-value {
      display: block;
      margin-top: 8px;
      font-weight: bold;
      color: #2196f3;
      text-align: center;
    }

    .actions-section {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .actions-section button {
      min-width: 120px;
    }

    @media (max-width: 768px) {
      .notification-settings-container {
        padding: 10px;
      }

      .time-range {
        grid-template-columns: 1fr;
      }

      .type-grid {
        grid-template-columns: 1fr;
      }

      .days-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .actions-section {
        flex-direction: column;
      }

      .actions-section button {
        width: 100%;
      }
    }
  `]
})
export class NotificationSettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  preferences: NotificationPreferences = {
    userId: '',
    emailEnabled: true,
    emailFrequency: 'daily',
    emailTypes: {
      conventions: true,
      invoices: true,
      payments: true,
      system: false,
      security: true
    },
    smsEnabled: false,
    smsTypes: {
      urgent: true,
      overdue: true,
      system: false
    },
    pushEnabled: true,
    pushTypes: {
      conventions: true,
      invoices: true,
      payments: true,
      system: false
    },
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    quietHoursDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    thresholds: {
      overdueInvoices: 7,
      lowBalance: 1000,
      systemErrors: 10
    },
    channels: {
      email: '',
      sms: ''
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  quietHoursDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  } = {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  };

  isLoading = false;

  // Template editor state
  templateEditor: any = {
    type: 'PREVENTIVE',
    email: { subject: '', content: '' },
    sms: { content: '' }
  };
  templatePreview: { subject?: string; content?: string } = {};

  // Contexte de prévisualisation (données réelles)
  previewEntityType: 'invoice' | 'convention' = 'invoice';
  previewSelectedId: string = '';
  cachedInvoices: any[] = [];
  cachedConventions: any[] = [];

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private conventionService: ConventionService,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    this.loadPreferences();
    this.syncQuietHoursDays();
  }

  loadTemplatesForType(): void {
    this.notificationService.getTemplatesByType(this.templateEditor.type)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (templates) => {
          const emailTpl = templates.find((t: any) => t.channel === 'EMAIL');
          const smsTpl = templates.find((t: any) => t.channel === 'SMS');
          this.templateEditor.email.subject = emailTpl?.subject || '';
          this.templateEditor.email.content = emailTpl?.content || '';
          this.templateEditor.sms.content = smsTpl?.content || '';
        }
      });
  }

  previewTemplate(): void {
    if (!this.previewSelectedId) {
      this.templatePreview = {
        subject: this.templateEditor.email.subject || '',
        content: this.templateEditor.email.content || ''
      };
      return;
    }
    if (this.previewEntityType === 'invoice') {
      this.ensureInvoices(() => this.previewWithInvoice());
    } else {
      this.ensureConventions(() => this.previewWithConvention());
    }
  }

  onPreviewSelectOpen(): void {
    if (this.previewEntityType === 'invoice') {
      this.ensureInvoices();
    } else {
      this.ensureConventions();
    }
  }

  private ensureInvoices(done?: () => void): void {
    if (this.cachedInvoices.length > 0) { if (done) done(); return; }
    this.invoiceService.getAllInvoices().pipe(takeUntil(this.destroy$)).subscribe({
      next: (arr) => { this.cachedInvoices = arr || []; if (done) done(); },
      error: () => { if (done) done(); }
    });
  }

  private ensureConventions(done?: () => void): void {
    if (this.cachedConventions.length > 0) { if (done) done(); return; }
    this.conventionService.getAllConventions().pipe(takeUntil(this.destroy$)).subscribe({
      next: (arr) => { this.cachedConventions = arr || []; if (done) done(); },
      error: () => { if (done) done(); }
    });
  }

  private replaceVars(text: string, vars: Record<string,string>): string {
    return Object.keys(vars).reduce((acc, k) => acc.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), vars[k] ?? ''), text);
  }

  private previewWithInvoice(): void {
    const it = this.cachedInvoices.find(i => String(i.id) === String(this.previewSelectedId));
    if (!it) { this.templatePreview = { subject: this.templateEditor.email.subject || '', content: this.templateEditor.email.content || '' }; return; }
    const vars: Record<string,string> = {
      userName: String(it.commercialName || it.createdBy || ''),
      invoiceNumber: String(it.invoiceNumber || it.reference || ''),
      amount: String(it.amount ?? ''),
      dueDate: it.dueDate ? new Date(it.dueDate).toLocaleDateString() : '',
      clientName: String(it.clientName || it.clientEmail || ''),
      daysOverdue: it.dueDate ? String(Math.max(0, Math.ceil((Date.now() - new Date(it.dueDate).getTime())/86400000))) : '0',
      paidDate: it.paidDate ? new Date(it.paidDate).toLocaleDateString() : ''
    };
    this.templatePreview = {
      subject: this.replaceVars(this.templateEditor.email.subject || '', vars),
      content: this.replaceVars(this.templateEditor.email.content || '', vars)
    };
  }

  private previewWithConvention(): void {
    const it = this.cachedConventions.find(c => String(c.id) === String(this.previewSelectedId));
    if (!it) { this.templatePreview = { subject: this.templateEditor.email.subject || '', content: this.templateEditor.email.content || '' }; return; }
    const vars: Record<string,string> = {
      userName: String(it.commercialName || it.createdBy || ''),
      conventionReference: String(it.reference || ''),
      conventionTitle: String(it.title || ''),
      amount: String(it.amount ?? ''),
      dueDate: it.dueDate ? new Date(it.dueDate).toLocaleDateString() : ''
    };
    this.templatePreview = {
      subject: this.replaceVars(this.templateEditor.email.subject || '', vars),
      content: this.replaceVars(this.templateEditor.email.content || '', vars)
    };
  }

  saveTemplates(): void {
    const payloads = [
      {
        type: this.templateEditor.type,
        channel: 'EMAIL',
        subject: this.templateEditor.email.subject,
        content: this.templateEditor.email.content,
        active: true
      },
      {
        type: this.templateEditor.type,
        channel: 'SMS',
        content: this.templateEditor.sms.content,
        active: true
      }
    ];
    let saved = 0;
    payloads.forEach(p => {
      this.notificationService.saveTemplate(p)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            saved++;
            if (saved === payloads.length) {
              this.snackBar.open('Gabarits enregistrés', 'Fermer', { duration: 3000 });
            }
          },
          error: () => this.snackBar.open('Erreur sauvegarde gabarit', 'Fermer', { duration: 3000 })
        });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPreferences(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.preferences.userId = currentUser.id;
      this.preferences.channels.email = currentUser.email || '';

      this.notificationService.getNotificationSettings()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (settings) => {
            this.preferences.emailEnabled = !!settings.emailEnabled;
            this.preferences.smsEnabled = !!settings.smsEnabled;
            const days = Array.isArray(settings.reminderDays) ? settings.reminderDays : [7,3,1];
            this.preferences.thresholds.overdueInvoices = days[0] || 7;
          },
          error: () => {
            this.snackBar.open('Chargement des préférences (par défaut)', 'Fermer', { duration: 2000 });
          }
        });
    }
  }

  syncQuietHoursDays(): void {
    this.preferences.quietHoursDays = Object.keys(this.quietHoursDays)
      .filter(day => this.quietHoursDays[day as keyof typeof this.quietHoursDays]);
  }

  onEmailToggle(): void {
    if (!this.preferences.emailEnabled) {
      this.preferences.emailTypes = {
        conventions: false,
        invoices: false,
        payments: false,
        system: false,
        security: false
      };
    }
  }

  onSmsToggle(): void {
    if (!this.preferences.smsEnabled) {
      this.preferences.smsTypes = {
        urgent: false,
        overdue: false,
        system: false
      };
    }
  }

  onPushToggle(): void {
    if (!this.preferences.pushEnabled) {
      this.preferences.pushTypes = {
        conventions: false,
        invoices: false,
        payments: false,
        system: false
      };
    }
  }

  onQuietHoursToggle(): void {
    if (!this.preferences.quietHoursEnabled) {
      this.preferences.quietHoursDays = [];
    } else {
      this.syncQuietHoursDays();
    }
  }

  saveSettings(): void {
    this.isLoading = true;
    this.syncQuietHoursDays();
    const payload = {
      emailEnabled: this.preferences.emailEnabled,
      smsEnabled: this.preferences.smsEnabled,
      autoReminderEnabled: true,
      reminderFrequency: 'daily',
      reminderDays: [
        this.preferences.thresholds.overdueInvoices || 7,
        3,
        1
      ]
    };

    this.notificationService.updateNotificationSettings(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Préférences sauvegardées avec succès', 'Fermer', { duration: 3000 });
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erreur lors de la sauvegarde des préférences', 'Fermer', { duration: 4000 });
          this.isLoading = false;
        }
      });
  }

  resetToDefaults(): void {
    this.preferences = {
      userId: this.preferences.userId,
      emailEnabled: true,
      emailFrequency: 'daily',
      emailTypes: {
        conventions: true,
        invoices: true,
        payments: true,
        system: false,
        security: true
      },
      smsEnabled: false,
      smsTypes: {
        urgent: true,
        overdue: true,
        system: false
      },
      pushEnabled: true,
      pushTypes: {
        conventions: true,
        invoices: true,
        payments: true,
        system: false
      },
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      quietHoursDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      thresholds: {
        overdueInvoices: 7,
        lowBalance: 1000,
        systemErrors: 10
      },
      channels: {
        email: this.preferences.channels.email,
        sms: ''
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.quietHoursDays = {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    };
    
    this.syncQuietHoursDays();
    
    this.snackBar.open('Préférences réinitialisées', 'Fermer', { 
      duration: 3000 
    });
  }
}