import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PermissionService, Permission } from '../../services/permission.service';

@Component({
  selector: 'app-permissions-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './permissions-management.component.html',
  styleUrls: ['./permissions-management.component.scss']
})
export class PermissionsManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Permission>([]);
  displayedColumns: string[] = ['name', 'description', 'resource', 'action', 'roles', 'actions'];
  
  loading = false;
  showForm = false;
  isEditMode = false;
  
  permissionForm: FormGroup;
  selectedPermission: Permission | null = null;
  
  // Filter
  searchTerm = '';
  
  // Available roles
  availableRoles = [
    { id: 'ROLE_ADMIN', name: 'Administrateur' },
    { id: 'ROLE_COMMERCIAL', name: 'Commercial' },
    { id: 'ROLE_PROJECT_MANAGER', name: 'Chef de Projet' },
    { id: 'ROLE_DECISION_MAKER', name: 'Décideur' },
    { id: 'ROLE_CLIENT', name: 'Client' }
  ];
  
  // Available resources
  resources = ['CONVENTION', 'INVOICE', 'USER', 'STRUCTURE', 'APPLICATION', 'REPORT', 'AUDIT_LOG'];
  
  // Available actions
  actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'APPROVE', 'REJECT'];

  constructor(
    private permissionService: PermissionService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.permissionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      resource: ['', Validators.required],
      action: ['', Validators.required],
      roles: [[]]
    });
  }

  ngOnInit(): void {
    this.loadPermissions();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Charger toutes les permissions
   */
  loadPermissions(): void {
    this.loading = true;
    this.permissionService.getAllPermissions().subscribe({
      next: (permissions) => {
        this.dataSource.data = permissions;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des permissions:', error);
        this.snackBar.open('Erreur lors du chargement des permissions', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  /**
   * Filtrer les permissions
   */
  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  /**
   * Afficher le formulaire de création
   */
  showCreateForm(): void {
    this.isEditMode = false;
    this.showForm = true;
    this.permissionForm.reset();
    this.selectedPermission = null;
  }

  /**
   * Afficher le formulaire d'édition
   */
  editPermission(permission: Permission): void {
    this.isEditMode = true;
    this.showForm = true;
    this.selectedPermission = permission;
    this.permissionForm.patchValue({
      name: permission.name,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
      roles: permission.roles || []
    });
  }

  /**
   * Sauvegarder la permission
   */
  savePermission(): void {
    if (this.permissionForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', { duration: 3000 });
      return;
    }

    const permissionData: Permission = {
      ...this.permissionForm.value,
      id: this.selectedPermission?.id || ''
    };

    this.loading = true;

    const operation = this.isEditMode
      ? this.permissionService.updatePermission(this.selectedPermission!.id, permissionData)
      : this.permissionService.createPermission(permissionData);

    operation.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode ? 'Permission mise à jour avec succès' : 'Permission créée avec succès',
          'Fermer',
          { duration: 3000 }
        );
        this.loadPermissions();
        this.cancelForm();
      },
      error: (error) => {
        console.error('Erreur lors de la sauvegarde:', error);
        this.snackBar.open('Erreur lors de la sauvegarde de la permission', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  /**
   * Supprimer une permission
   */
  deletePermission(permission: Permission): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la permission "${permission.name}" ?`)) {
      return;
    }

    this.loading = true;
    this.permissionService.deletePermission(permission.id).subscribe({
      next: () => {
        this.snackBar.open('Permission supprimée avec succès', 'Fermer', { duration: 3000 });
        this.loadPermissions();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.snackBar.open('Erreur lors de la suppression de la permission', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  /**
   * Annuler le formulaire
   */
  cancelForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.selectedPermission = null;
    this.permissionForm.reset();
    this.loading = false;
  }

  /**
   * Obtenir le nom du rôle
   */
  getRoleName(roleId: string): string {
    const role = this.availableRoles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  }

  /**
   * Obtenir la couleur du chip selon l'action
   */
  getActionColor(action: string): string {
    const colors: { [key: string]: string } = {
      'CREATE': 'primary',
      'READ': 'accent',
      'UPDATE': 'accent',
      'DELETE': 'warn',
      'EXPORT': 'primary',
      'APPROVE': 'primary',
      'REJECT': 'warn'
    };
    return colors[action] || '';
  }

  /**
   * Obtenir l'icône selon l'action
   */
  getActionIcon(action: string): string {
    const icons: { [key: string]: string } = {
      'CREATE': 'add_circle',
      'READ': 'visibility',
      'UPDATE': 'edit',
      'DELETE': 'delete',
      'EXPORT': 'download',
      'APPROVE': 'check_circle',
      'REJECT': 'cancel'
    };
    return icons[action] || 'info';
  }
}
