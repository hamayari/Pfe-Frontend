import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';

interface Application {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

interface GeographicZone {
  id: string;
  name: string;
  country: string;
  region: string;
  code: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

interface Structure {
  id: string;
  name: string;
  type: string;
  location: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

@Component({
  selector: 'app-nomenclatures-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatChipsModule,
    MatMenuModule,
    MatTabsModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  templateUrl: './nomenclatures-management.component.html',
  styleUrls: ['./nomenclatures-management.component.scss']
})
export class NomenclaturesManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Data sources
  applicationsDataSource = new MatTableDataSource<Application>([]);
  zonesDataSource = new MatTableDataSource<GeographicZone>([]);
  structuresDataSource = new MatTableDataSource<Structure>([]);

  // Forms
  applicationForm: FormGroup;
  zoneForm: FormGroup;
  structureForm: FormGroup;

  // UI State
  selectedTab = 0;
  isLoading = false;
  searchTerm = '';

  // Sample data
  applications: Application[] = [
    {
      id: '1',
      name: 'Application Web Principale',
      code: 'APP-WEB-001',
      description: 'Application web principale pour la gestion des conventions',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-03-20')
    },
    {
      id: '2',
      name: 'Application Mobile',
      code: 'APP-MOB-001',
      description: 'Application mobile pour les utilisateurs sur terrain',
      status: 'active',
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-04-15')
    },
    {
      id: '3',
      name: 'Application API',
      code: 'APP-API-001',
      description: 'API REST pour l\'intégration avec d\'autres systèmes',
      status: 'inactive',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-02-28')
    }
  ];

  geographicZones: GeographicZone[] = [
    {
      id: '1',
      name: 'Tunis',
      country: 'Tunisie',
      region: 'Nord',
      code: 'TN-TUN',
      status: 'active',
      createdAt: new Date('2024-01-10')
    },
    {
      id: '2',
      name: 'Sfax',
      country: 'Tunisie',
      region: 'Centre',
      code: 'TN-SFA',
      status: 'active',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '3',
      name: 'Sousse',
      country: 'Tunisie',
      region: 'Centre',
      code: 'TN-SOU',
      status: 'active',
      createdAt: new Date('2024-01-20')
    },
    {
      id: '4',
      name: 'Gabès',
      country: 'Tunisie',
      region: 'Sud',
      code: 'TN-GAB',
      status: 'inactive',
      createdAt: new Date('2024-02-05')
    }
  ];

  structures: Structure[] = [
    {
      id: '1',
      name: 'Direction Générale',
      type: 'Administration',
      location: 'Tunis',
      address: '123 Avenue Habib Bourguiba, Tunis',
      contactPerson: 'Ahmed Ben Ali',
      phone: '+216 71 123 456',
      email: 'contact@dg.gov.tn',
      status: 'active',
      createdAt: new Date('2024-01-05')
    },
    {
      id: '2',
      name: 'Agence Régionale Sfax',
      type: 'Agence Régionale',
      location: 'Sfax',
      address: '456 Rue de la République, Sfax',
      contactPerson: 'Fatma Mansouri',
      phone: '+216 74 234 567',
      email: 'sfax@agency.gov.tn',
      status: 'active',
      createdAt: new Date('2024-01-12')
    },
    {
      id: '3',
      name: 'Centre de Formation',
      type: 'Formation',
      location: 'Sousse',
      address: '789 Boulevard de la Méditerranée, Sousse',
      contactPerson: 'Mohamed Karray',
      phone: '+216 73 345 678',
      email: 'formation@sousse.gov.tn',
      status: 'active',
      createdAt: new Date('2024-01-18')
    }
  ];

  displayedColumns = ['name', 'code', 'description', 'status', 'createdAt', 'actions'];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.applicationForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: ['', Validators.required],
      status: ['active']
    });

    this.zoneForm = this.fb.group({
      name: ['', Validators.required],
      country: ['', Validators.required],
      region: ['', Validators.required],
      code: ['', Validators.required],
      status: ['active']
    });

    this.structureForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      location: ['', Validators.required],
      address: ['', Validators.required],
      contactPerson: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      status: ['active']
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.applicationsDataSource.data = this.applications;
      this.zonesDataSource.data = this.geographicZones;
      this.structuresDataSource.data = this.structures;
      
      this.applicationsDataSource.paginator = this.paginator;
      this.applicationsDataSource.sort = this.sort;
      
      this.isLoading = false;
    }, 1000);
  }

  applyFilter() {
    const filterValue = this.searchTerm.trim().toLowerCase();
    this.applicationsDataSource.filter = filterValue;
    this.zonesDataSource.filter = filterValue;
    this.structuresDataSource.filter = filterValue;
  }

  // Application methods
  onAddApplication() {
    this.applicationForm.reset({ status: 'active' });
    this.openApplicationDialog();
  }

  onEditApplication(application: Application) {
    this.applicationForm.patchValue({
      name: application.name,
      code: application.code,
      description: application.description,
      status: application.status
    });
    this.openApplicationDialog();
  }

  onDeleteApplication(application: Application) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'application ${application.name} ?`)) {
      this.applications = this.applications.filter(a => a.id !== application.id);
      this.applicationsDataSource.data = this.applications;
      this.snackBar.open('Application supprimée avec succès', 'Fermer', { duration: 3000 });
    }
  }

  // Zone methods
  onAddZone() {
    this.zoneForm.reset({ status: 'active' });
    this.openZoneDialog();
  }

  onEditZone(zone: GeographicZone) {
    this.zoneForm.patchValue({
      name: zone.name,
      country: zone.country,
      region: zone.region,
      code: zone.code,
      status: zone.status
    });
    this.openZoneDialog();
  }

  onDeleteZone(zone: GeographicZone) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la zone ${zone.name} ?`)) {
      this.geographicZones = this.geographicZones.filter(z => z.id !== zone.id);
      this.zonesDataSource.data = this.geographicZones;
      this.snackBar.open('Zone géographique supprimée avec succès', 'Fermer', { duration: 3000 });
    }
  }

  // Structure methods
  onAddStructure() {
    this.structureForm.reset({ status: 'active' });
    this.openStructureDialog();
  }

  onEditStructure(structure: Structure) {
    this.structureForm.patchValue({
      name: structure.name,
      type: structure.type,
      location: structure.location,
      address: structure.address,
      contactPerson: structure.contactPerson,
      phone: structure.phone,
      email: structure.email,
      status: structure.status
    });
    this.openStructureDialog();
  }

  onDeleteStructure(structure: Structure) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la structure ${structure.name} ?`)) {
      this.structures = this.structures.filter(s => s.id !== structure.id);
      this.structuresDataSource.data = this.structures;
      this.snackBar.open('Structure supprimée avec succès', 'Fermer', { duration: 3000 });
    }
  }

  // Dialog methods
  openApplicationDialog() {
    this.snackBar.open('Fonctionnalité de dialogue à implémenter', 'Fermer', { duration: 2000 });
  }

  openZoneDialog() {
    this.snackBar.open('Fonctionnalité de dialogue à implémenter', 'Fermer', { duration: 2000 });
  }

  openStructureDialog() {
    this.snackBar.open('Fonctionnalité de dialogue à implémenter', 'Fermer', { duration: 2000 });
  }

  // Utility methods
  getStatusColor(status: string): string {
    return status === 'active' ? 'success' : 'warn';
  }

  getStatusIcon(status: string): string {
    return status === 'active' ? 'check_circle' : 'cancel';
  }

  getStructureTypeColor(type: string): string {
    switch (type) {
      case 'Administration': return 'primary';
      case 'Agence Régionale': return 'accent';
      case 'Formation': return 'success';
      default: return 'primary';
    }
  }

  exportData(type: 'applications' | 'zones' | 'structures') {
    this.snackBar.open(`Export ${type} en cours...`, 'Fermer', { duration: 2000 });
  }
}





