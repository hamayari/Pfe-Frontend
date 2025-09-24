import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-nomenclature-type-label',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule
  ],
  template: `
    <mat-chip [color]="getColor()" [class.selected]="true">
      {{ type }}
    </mat-chip>
  `,
  styles: [`
    mat-chip {
      font-size: 12px;
    }
    mat-chip.selected {
      opacity: 1;
      font-weight: 600;
    }
  `]
})
export class NomenclatureTypeLabelComponent {
  @Input() type: string = '';

  getColor(): string {
    switch (this.type?.toLowerCase()) {
      case 'application': return 'primary';
      case 'structure': return 'accent';
      case 'zone': return 'warn';
      default: return 'primary';
    }
  }
}


