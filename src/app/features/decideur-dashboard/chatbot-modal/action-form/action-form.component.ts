import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-action-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="action-form-container">
      <div class="form-header">
        <h4>
          <mat-icon>{{ getActionIcon() }}</mat-icon>
          {{ getActionTitle() }}
        </h4>
        <button mat-icon-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="form-content">
        <!-- Formulaire pour créer une convention -->
        <div *ngIf="action === 'create_convention'" class="form-fields">
          <mat-form-field appearance="outline">
            <mat-label>Titre</mat-label>
            <input matInput [(ngModel)]="formData.title" placeholder="Ex: Convention 2025">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Référence</mat-label>
            <input matInput [(ngModel)]="formData.reference" placeholder="Ex: CONV-2025-001">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Structure ID</mat-label>
            <input matInput [(ngModel)]="formData.structureId" placeholder="ID de la structure">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Application ID</mat-label>
            <input matInput [(ngModel)]="formData.applicationId" placeholder="ID de l'application">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Gouvernorat</mat-label>
            <input matInput [(ngModel)]="formData.governorate" placeholder="Ex: Tunis">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Montant (DT)</mat-label>
            <input matInput type="number" [(ngModel)]="formData.amount" placeholder="5000">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date de début</mat-label>
            <input matInput [matDatepicker]="startPicker" [(ngModel)]="formData.startDate">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date de fin</mat-label>
            <input matInput [matDatepicker]="endPicker" [(ngModel)]="formData.endDate">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>
        </div>

        <!-- Formulaire pour créer une facture -->
        <div *ngIf="action === 'create_facture'" class="form-fields">
          <mat-form-field appearance="outline">
            <mat-label>Numéro de facture</mat-label>
            <input matInput [(ngModel)]="formData.invoiceNumber" placeholder="Ex: INV-2025-001">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Convention ID</mat-label>
            <input matInput [(ngModel)]="formData.conventionId" placeholder="ID de la convention">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Montant (DT)</mat-label>
            <input matInput type="number" [(ngModel)]="formData.amount" placeholder="1000">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date d'émission</mat-label>
            <input matInput [matDatepicker]="issuePicker" [(ngModel)]="formData.issueDate">
            <mat-datepicker-toggle matSuffix [for]="issuePicker"></mat-datepicker-toggle>
            <mat-datepicker #issuePicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date d'échéance</mat-label>
            <input matInput [matDatepicker]="duePicker" [(ngModel)]="formData.dueDate">
            <mat-datepicker-toggle matSuffix [for]="duePicker"></mat-datepicker-toggle>
            <mat-datepicker #duePicker></mat-datepicker>
          </mat-form-field>
        </div>

        <!-- Formulaire pour envoyer un rappel -->
        <div *ngIf="action === 'send_reminder'" class="form-fields">
          <mat-form-field appearance="outline">
            <mat-label>Convention ID</mat-label>
            <input matInput [(ngModel)]="formData.conventionId" placeholder="ID de la convention">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Jours avant échéance</mat-label>
            <input matInput type="number" [(ngModel)]="formData.daysBeforeExpiry" placeholder="3">
          </mat-form-field>
        </div>

        <!-- Formulaire pour envoyer une notification -->
        <div *ngIf="action === 'send_notification'" class="form-fields">
          <mat-form-field appearance="outline">
            <mat-label>Destinataire ID</mat-label>
            <input matInput [(ngModel)]="formData.recipientId" placeholder="ID de l'utilisateur">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Sujet</mat-label>
            <input matInput [(ngModel)]="formData.subject" placeholder="Ex: Rappel important">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Message</mat-label>
            <textarea 
              matInput 
              [(ngModel)]="formData.message" 
              placeholder="Votre message..."
              rows="4"></textarea>
          </mat-form-field>
        </div>

        <!-- Formulaire pour marquer comme payée -->
        <div *ngIf="action === 'mark_as_paid'" class="form-fields">
          <mat-form-field appearance="outline">
            <mat-label>Facture ID</mat-label>
            <input matInput [(ngModel)]="formData.invoiceId" placeholder="ID de la facture">
          </mat-form-field>
        </div>
      </div>

      <div class="form-actions">
        <button mat-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
          Annuler
        </button>
        <button mat-raised-button color="primary" (click)="onSubmit()">
          <mat-icon>check</mat-icon>
          Exécuter
        </button>
      </div>
    </div>
  `,
  styles: [`
    .action-form-container {
      margin: 16px 0;
      background: white;
      border-radius: 12px;
      border: 2px solid #6a11cb;
      box-shadow: 0 4px 20px rgba(106, 17, 203, 0.15);
      overflow: hidden;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
      color: white;

      h4 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 16px;
        font-weight: 600;

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }

      button {
        color: white;
      }
    }

    .form-content {
      padding: 20px;
    }

    .form-fields {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;

      mat-form-field {
        width: 100%;
      }

      .full-width {
        grid-column: 1 / -1;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 20px;
      border-top: 1px solid #e0e0e0;
      background: #f8f9ff;

      button {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
  `]
})
export class ActionFormComponent implements OnInit {
  @Input() action: string = '';
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();

  formData: any = {};

  ngOnInit(): void {
    this.initializeFormData();
  }

  initializeFormData(): void {
    switch (this.action) {
      case 'create_convention':
        this.formData = {
          title: '',
          reference: '',
          structureId: '',
          applicationId: '',
          governorate: '',
          amount: '',
          startDate: '',
          endDate: ''
        };
        break;
      case 'create_facture':
        this.formData = {
          invoiceNumber: '',
          conventionId: '',
          amount: '',
          issueDate: '',
          dueDate: ''
        };
        break;
      case 'send_reminder':
        this.formData = {
          conventionId: '',
          daysBeforeExpiry: 3
        };
        break;
      case 'send_notification':
        this.formData = {
          recipientId: '',
          subject: '',
          message: '',
          type: 'SYSTEM'
        };
        break;
      case 'mark_as_paid':
        this.formData = {
          invoiceId: ''
        };
        break;
    }
  }

  getActionTitle(): string {
    const titles: { [key: string]: string } = {
      'create_convention': 'Créer une Convention',
      'create_facture': 'Créer une Facture',
      'send_reminder': 'Programmer un Rappel',
      'send_notification': 'Envoyer une Notification',
      'mark_as_paid': 'Marquer comme Payée'
    };
    return titles[this.action] || 'Action';
  }

  getActionIcon(): string {
    const icons: { [key: string]: string } = {
      'create_convention': 'description',
      'create_facture': 'receipt',
      'send_reminder': 'notifications',
      'send_notification': 'email',
      'mark_as_paid': 'check_circle'
    };
    return icons[this.action] || 'settings';
  }

  onSubmit(): void {
    // Convertir les dates en format ISO
    const data = { ...this.formData };
    if (data.startDate) data.startDate = this.formatDate(data.startDate);
    if (data.endDate) data.endDate = this.formatDate(data.endDate);
    if (data.issueDate) data.issueDate = this.formatDate(data.issueDate);
    if (data.dueDate) data.dueDate = this.formatDate(data.dueDate);

    this.formSubmit.emit(data);
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  private formatDate(date: any): string {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  }
}
