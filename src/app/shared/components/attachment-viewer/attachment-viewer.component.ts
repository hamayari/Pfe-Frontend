import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface AttachmentViewerData {
  url: string;
  name: string;
}

@Component({
  selector: 'gp-attachment-viewer',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="av-root">
      <div class="av-header">
        <div class="title">{{ data.name }}</div>
        <button mat-stroked-button (click)="download()">Télécharger</button>
      </div>
      <div class="av-body">
        <ng-container [ngSwitch]="fileKind">
          <img *ngSwitchCase="'image'" [src]="data.url" class="av-image" />
          <iframe *ngSwitchCase="'pdf'" [src]="data.url" class="av-iframe"></iframe>
          <div *ngSwitchDefault class="av-generic">
            Aperçu non supporté. Cliquez sur Télécharger.
          </div>
        </ng-container>
      </div>
      <div class="av-actions">
        <button mat-flat-button color="primary" (click)="close()">Fermer</button>
      </div>
    </div>
  `,
  styles: [`
    .av-root { width: 80vw; max-width: 900px; }
    .av-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .title { font-weight: 700; }
    .av-body { min-height: 60vh; background: #f8f9fa; display: flex; align-items: center; justify-content: center; }
    .av-image { max-width: 100%; max-height: 60vh; object-fit: contain; }
    .av-iframe { width: 100%; height: 60vh; border: none; }
    .av-actions { display: flex; justify-content: flex-end; margin-top: 8px; }
  `]
})
export class AttachmentViewerComponent {
  fileKind: 'image' | 'pdf' | 'other' = 'other';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AttachmentViewerData,
    private ref: MatDialogRef<AttachmentViewerComponent>
  ) {
    const lower = (data?.name || '').toLowerCase();
    if (/(\.png|\.jpg|\.jpeg|\.gif|\.webp)$/.test(lower)) this.fileKind = 'image';
    else if (/\.pdf$/.test(lower)) this.fileKind = 'pdf';
    else this.fileKind = 'other';
  }

  download() {
    window.open(this.data.url, '_blank');
  }

  close() { this.ref.close(); }
}


