import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-nomenclature-management',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './nomenclature-management.component.html',
  styleUrls: ['./nomenclature-management.component.scss']
})
export class NomenclatureManagementComponent {
  isLoading = false;
  nomenclatures: any[] = [];
}
