import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';

// Components
import { NomenclatureListComponent } from './nomenclature-list/nomenclature-list.component';
import { NomenclatureFormComponent } from './nomenclature-form/nomenclature-form.component';
import { NomenclatureDetailComponent } from './nomenclature-detail/nomenclature-detail.component';
import { NomenclatureTreeViewComponent } from './nomenclature-tree-view/nomenclature-tree-view.component';
import { NomenclatureBreadcrumbComponent } from './nomenclature-breadcrumb/nomenclature-breadcrumb.component';
import { NomenclatureTypeLabelComponent } from './nomenclature-type-label/nomenclature-type-label.component';

// Services
import { NomenclatureService } from 'src/app/core/services/nomenclature.service';

// Pipes
import { NomenclatureTypePipe } from './pipes/nomenclature-type.pipe';
import { NomenclatureStatusPipe } from './pipes/nomenclature-status.pipe';

// Routing
import { NomenclatureRoutingModule } from './nomenclature-routing.module';

// Shared Module
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    NomenclatureListComponent,
    NomenclatureFormComponent,
    NomenclatureDetailComponent,
    NomenclatureTreeViewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    
    // Material Modules
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    
    // App Modules
    NomenclatureRoutingModule,
    SharedModule,
    
    // Pipes
    NomenclatureTypePipe,
    NomenclatureStatusPipe
  ],
  providers: [
    NomenclatureService
  ],
  exports: [
    NomenclatureTypePipe,
    NomenclatureStatusPipe
  ]
})
export class NomenclatureModule { }
