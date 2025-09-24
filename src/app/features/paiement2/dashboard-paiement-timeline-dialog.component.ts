import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProcessTimelineComponent, TimelineStep } from '../../shared/components/process-timeline/process-timeline.component';
import { Facture } from './models/facture.model';

@Component({
  selector: 'app-dashboard-paiement-timeline-dialog',
  templateUrl: './dashboard-paiement-timeline-dialog.component.html',
  styleUrls: ['./dashboard-paiement-timeline-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ProcessTimelineComponent
  ]
})
export class DashboardPaiementTimelineDialogComponent {
  steps: TimelineStep[] = [];
  facture: Facture;

  constructor(
    public dialogRef: MatDialogRef<DashboardPaiementTimelineDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { facture: Facture, steps: TimelineStep[] }
  ) {
    this.facture = data.facture;
    this.steps = data.steps;
  }

  close(): void {
    this.dialogRef.close();
  }
} 