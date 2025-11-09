import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-nomenclature-breadcrumb',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="breadcrumb">
      <mat-icon>home</mat-icon>
      <span>Nomenclatures</span>
    </div>
  `,
  styles: [`
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
    }
  `]
})
export class NomenclatureBreadcrumbComponent {

}





















