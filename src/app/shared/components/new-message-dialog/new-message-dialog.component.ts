import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

export interface NewMessageDialogData {
  senderName: string;
  preview: string;
  conversationName?: string;
}

export type NewMessageDialogResult = 'open' | 'snooze_15' | 'snooze_60' | 'close';

@Component({
  selector: 'gp-new-message-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="nm-root">
      <div class="nm-title">Nouveau message</div>
      <div class="nm-body">
        <div class="nm-sender">De: <strong>{{ data.senderName }}</strong></div>
        <div class="nm-conv" *ngIf="data.conversationName">Dans: {{ data.conversationName }}</div>
        <div class="nm-preview">“{{ data.preview }}”</div>
      </div>
      <div class="nm-actions">
        <button mat-stroked-button (click)="close('snooze_15')">Snooze 15 min</button>
        <button mat-stroked-button (click)="close('snooze_60')">Snooze 1 h</button>
        <button mat-flat-button color="primary" (click)="close('open')">Ouvrir</button>
      </div>
    </div>
  `,
  styles: [`
    .nm-root { padding: 12px; }
    .nm-title { font-weight: 700; margin-bottom: 8px; }
    .nm-sender, .nm-conv { font-size: 13px; color: #444; margin-bottom: 4px; }
    .nm-preview { margin-top: 6px; font-style: italic; color: #111; }
    .nm-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; }
  `]
})
export class NewMessageDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: NewMessageDialogData,
    private ref: MatDialogRef<NewMessageDialogComponent, NewMessageDialogResult>
  ) {}

  close(result: NewMessageDialogResult) {
    this.ref.close(result);
  }
}


