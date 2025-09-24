import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Components
import { UserListComponent } from './pages/user-list/user-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';

// Services
import { UserService } from './services/user.service';

// Shared Components
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

const routes: Routes = [
  {
    path: '',
    component: UserListComponent,
    data: {
      title: 'User Management',
      breadcrumb: 'Users'
    }
  }
];

@NgModule({
  declarations: [
    // No standalone components should be declared here
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    
    // Import standalone components instead of declaring them
    UserListComponent,
    UserFormComponent,
    
    // Material Modules
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    
    // Forms
    FormsModule,
    ReactiveFormsModule,
    
    // Shared Components
    ConfirmationDialogComponent
  ],
  providers: [
    UserService
  ]
})
export class UsersModule { }
