import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-echeances-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Échéances - {{ data.reference }}</h2>
    <mat-dialog-content>
      <mat-list>
        <mat-list-item *ngFor="let echeance of data.echeances">
          <mat-icon matListItemIcon>schedule</mat-icon>
          <div matListItemTitle>{{ echeance | date:'dd/MM/yyyy' }}</div>
        </mat-list-item>
      </mat-list>
      <p *ngIf="!data.echeances || data.echeances.length === 0">
        Aucune échéance configurée.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Fermer</button>
    </mat-dialog-actions>
  `
})
export class EcheancesModalComponent {
  constructor(
    private dialogRef: MatDialogRef<EcheancesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}







































