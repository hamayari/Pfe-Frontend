import { Component, Inject, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

import { Convention, ConventionStatus, PaymentTerm, ConventionFormData } from '../../../../core/models/convention.model';
import { ConventionService } from '../../../../core/services/convention.service';
import { NomenclatureService } from '../../../../core/services/nomenclature.service';
import { UserService } from '../../../../core/services/user.service';
import { NotificationToastService } from '../../../../shared/services/notification-toast.service';
import { Nomenclature } from '../../../../core/models/nomenclature.model';
import { User } from '../../../../core/models/user.model';

export interface ConventionFormDialogData {
  mode: 'create' | 'edit' | 'view';
  convention?: Convention;
}

@Component({
  selector: 'app-convention-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './convention-form-dialog.component.html',
  styleUrls: ['./convention-form-dialog.component.scss']
})
export class ConventionFormDialogComponent implements OnInit {
  form: FormGroup;
  conventionForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  isViewMode = false;
  
  // Status options
  statusOptions = [
    { value: 'DRAFT', label: 'Brouillon' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'EXPIRED', label: 'Expirée' },
    { value: 'TERMINATED', label: 'Résiliée' },
    { value: 'RENEWED', label: 'Renouvelée' }
  ];
  
  // Payment term options
  paymentTermOptions = [
    { value: 'IMMEDIATE', label: 'Paiement immédiat' },
    { value: 'NET_7', label: 'Net 7 jours' },
    { value: 'NET_15', label: 'Net 15 jours' },
    { value: 'NET_30', label: 'Net 30 jours' },
    { value: 'NET_60', label: 'Net 60 jours' },
    { value: 'END_OF_MONTH', label: 'Fin de mois' },
    { value: 'CUSTOM', label: 'Personnalisé' }
  ];
  
  // Currency options
  currencyOptions = [
    { value: 'MAD', label: 'MAD - Dirham marocain' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'USD', label: 'USD - Dollar américain' },
    { value: 'GBP', label: 'GBP - Livre sterling' }
  ];
  
  // Filtered options for autocomplete
  filteredApplications: Observable<Nomenclature[]> = new Observable();
  filteredZones: Observable<Nomenclature[]> = new Observable();
  filteredStructures: Observable<Nomenclature[]> = new Observable();
  filteredCommercials: Observable<User[]> = new Observable();
  filteredProjectManagers: Observable<User[]> = new Observable();
  
  // Current date for date validation
  currentDate = new Date();
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ConventionFormDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: ConventionFormDialogData,
    private conventionService: ConventionService,
    private nomenclatureService: NomenclatureService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private notificationToastService: NotificationToastService
  ) {
    this.isEditMode = data.mode === 'edit';
    this.isViewMode = data.mode === 'view';
    
    this.form = this.createForm();
  }
  
  ngOnInit(): void {
    this.setupForm();
    this.loadReferenceData();
    
    // Set up filtered options for autocomplete
    this.setupAutocomplete();
    
    // Handle custom payment term visibility
    this.handleCustomPaymentTerm();
  }
  
  /**
   * Create the form with default values
   */
  private createForm(): FormGroup {
    return this.fb.group({
      // Basic info
      reference: [{ value: '', disabled: this.isViewMode }, [Validators.required, Validators.maxLength(50)]],
      label: [{ value: '', disabled: this.isViewMode }, [Validators.required, Validators.maxLength(200)]],
      description: [{ value: '', disabled: this.isViewMode }, Validators.maxLength(1000)],
      
      // Dates
      startDate: [{ value: null, disabled: this.isViewMode }, Validators.required],
      endDate: [{ value: null, disabled: this.isViewMode }, Validators.required],
      
      // Nomenclature references
      applicationId: [{ value: null, disabled: this.isViewMode }, Validators.required],
      zoneId: [{ value: null, disabled: this.isViewMode }, Validators.required],
      structureId: [{ value: null, disabled: this.isViewMode }, Validators.required],
      
      // User references
      commercialId: [{ value: null, disabled: this.isViewMode }, Validators.required],
      projectManagerId: [{ value: null, disabled: this.isViewMode }],
      
      // Financial info
      totalAmount: [{ value: null, disabled: this.isViewMode }, [Validators.required, Validators.min(0)]],
      currency: [{ value: 'MAD', disabled: this.isViewMode }, Validators.required],
      paymentTerms: [{ value: 'NET_30', disabled: this.isViewMode }],
      customPaymentTermDays: [{ value: null, disabled: true }],
      
      // Status
      status: [{ value: 'DRAFT', disabled: this.isViewMode }, Validators.required],
      
      // Additional info
      notes: [{ value: '', disabled: this.isViewMode }, Validators.maxLength(2000)],
      
      // Terms and conditions
      termsAndConditions: [{ value: '', disabled: this.isViewMode }, Validators.maxLength(5000)],
      
      // Documents (in a real app, this would be a file upload)
      documents: this.fb.array([])
    });
  }
  
  /**
   * Set up form with data if in edit or view mode
   */
  private setupForm(): void {
    if (this.data.convention) {
      const convention = this.data.convention;
      
      // Map the convention data to the form
      this.form.patchValue({
        reference: convention.reference,
        label: convention.label,
        description: convention.description,
        startDate: convention.startDate ? new Date(convention.startDate) : undefined,
        endDate: convention.endDate ? new Date(convention.endDate) : undefined,
        applicationId: convention.application,
        zoneId: convention.governorate,
        structureId: convention.structure,
        commercialId: convention.commercialId,
        projectManagerId: convention.projectManagerId,
        totalAmount: convention.totalAmount,
        currency: convention.currency || 'MAD',
        paymentTerms: convention.paymentTerm || 'NET_30',
        customPaymentTermDays: null,
        status: convention.status,
        notes: convention.description,
        termsAndConditions: convention.description
      });
      
      // In view mode, disable all fields
      if (this.isViewMode) {
        this.form.disable();
      }
    } else if (this.isEditMode) {
      // If in edit mode but no convention data, close the dialog
      this.dialogRef.close();
      this.snackBar.open('Aucune donnée de convention fournie pour édition', 'Fermer', {
        duration: 5000
      });
    } else {
      // In create mode, generate a reference
      this.generateReference();
    }
  }
  
  /**
   * Load reference data for dropdowns
   */
  private loadReferenceData(): void {
    // In a real app, these would be API calls
    // For now, we'll use mock data from services
  }
  
  /**
   * Set up autocomplete for various fields
   */
  private setupAutocomplete(): void {
    // Application autocomplete
    this.filteredApplications = this.form.get('applicationId')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterNomenclatures(value, 'APPLICATION'))
    );
    
    // Zone autocomplete
    this.filteredZones = this.form.get('zoneId')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterNomenclatures(value, 'ZONE'))
    );
    
    // Structure autocomplete
    this.filteredStructures = this.form.get('structureId')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterNomenclatures(value, 'STRUCTURE'))
    );
    
    // Commercial autocomplete
    this.filteredCommercials = this.form.get('commercialId')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterUsers(value, 'COMMERCIAL'))
    );
    
    // Project manager autocomplete
    this.filteredProjectManagers = this.form.get('projectManagerId')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterUsers(value, 'PROJECT_MANAGER'))
    );
  }
  
  /**
   * Handle custom payment term visibility
   */
  private handleCustomPaymentTerm(): void {
    const paymentTermsControl = this.form.get('paymentTerms');
    const customPaymentTermDaysControl = this.form.get('customPaymentTermDays');
    
    if (paymentTermsControl && customPaymentTermDaysControl) {
      paymentTermsControl.valueChanges.subscribe(value => {
        if (value === 'CUSTOM') {
          customPaymentTermDaysControl.enable();
          customPaymentTermDaysControl.setValidators([Validators.required, Validators.min(1), Validators.max(365)]);
        } else {
          customPaymentTermDaysControl.disable();
          customPaymentTermDaysControl.clearValidators();
        }
        customPaymentTermDaysControl.updateValueAndValidity();
      });
    }
  }
  
  /**
   * Generate a reference for new conventions
   */
  private generateReference(): void {
    // In a real app, this would call an API to generate a unique reference
    const prefix = 'CONV';
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    
    this.form.patchValue({
      reference: `${prefix}-${year}-${random}`
    });
  }
  
  /**
   * Filter nomenclatures for autocomplete
   */
  private _filterNomenclatures(value: string | Nomenclature, type: string): Nomenclature[] {
    // In a real app, this would filter the list from the service
    // For now, return an empty array
    return [];
  }
  
  /**
   * Filter users for autocomplete
   */
  private _filterUsers(value: string | User, role: string): User[] {
    // In a real app, this would filter the list from the service
    // For now, return an empty array
    return [];
  }
  
  /**
   * Display function for autocomplete
   */
  displayNomenclature(nomenclature?: Nomenclature): string {
    return nomenclature ? `${nomenclature.code} - ${nomenclature.label}` : '';
  }
  
  /**
   * Display function for user autocomplete
   */
  displayUser(user?: User): string {
    if (!user) return '';
    return `${user.firstName} ${user.lastName} (${user.email})`;
  }
  
  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.isSubmitting = true;
    
    // Prepare the form data
    const formValue = this.form.value;
    const conventionData: ConventionFormData = {
      reference: formValue.reference,
      label: formValue.label,
      clientId: formValue.clientId,
      governorate: formValue.governorate,
      structure: formValue.structure,
      application: formValue.application,
      amount: formValue.totalAmount || 0,
      description: formValue.description,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      applicationId: formValue.applicationId,
      zoneId: formValue.zoneId,
      structureId: formValue.structureId,
      commercialId: formValue.commercialId,
      projectManagerId: formValue.projectManagerId,
      totalAmount: formValue.totalAmount,
      currency: formValue.currency,
      paymentTerm: formValue.paymentTerms,
      paymentTerms: formValue.paymentTerms,
      paymentDueDays: formValue.paymentTerms === 'CUSTOM' ? formValue.customPaymentTermDays : undefined,
      status: formValue.status,
      notes: formValue.notes,
      termsAndConditions: formValue.termsAndConditions
    };
    
    // Call the appropriate service method
    let apiCall: Observable<Convention>;
    
    if (this.isEditMode && this.data.convention) {
      apiCall = this.conventionService.updateConvention(this.data.convention.id, conventionData);
    } else {
      apiCall = this.conventionService.createConvention(conventionData);
    }
    
    // Subscribe to the API call
    apiCall.subscribe({
      next: (result) => {
        this.isSubmitting = false;
        
        // Notification toast moderne
        if (!this.isEditMode) {
          this.notificationToastService.conventionCreated(
            result.reference || 'N/A', 
            result.label || 'Convention'
          );
        } else {
          this.notificationToastService.conventionUpdated(result.reference || 'N/A');
        }
        
        // Snackbar classique (fallback)
        this.snackBar.open(
          `Convention ${this.isEditMode ? 'mise à jour' : 'créée'} avec succès`,
          'Fermer',
          { duration: 3000 }
        );
        this.dialogRef.close('saved');
      },
      error: (error) => {
        console.error('Error saving convention:', error);
        this.isSubmitting = false;
        this.snackBar.open(
          `Une erreur est survenue lors de ${this.isEditMode ? 'la mise à jour' : 'la création'} de la convention`,
          'Fermer',
          { duration: 5000 }
        );
      }
    });
  }
  
  /**
   * Close the dialog
   */
  onCancel(): void {
    this.dialogRef.close();
  }
  
  /**
   * Add a document to the form
   */
  addDocument(): void {
    const documents = this.form.get('documents') as FormArray;
    documents.push(this.fb.group({
      name: ['', Validators.required],
      file: [null, Validators.required],
      description: ['']
    }));
  }
  
  /**
   * Remove a document from the form
   */
  removeDocument(index: number): void {
    const documents = this.form.get('documents') as FormArray;
    documents.removeAt(index);
  }
  
  /**
   * Handle file selection
   */
  onFileSelected(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      const documents = this.form.get('documents') as FormArray;
      const documentGroup = documents.at(index) as FormGroup;
      documentGroup.patchValue({
        file: file,
        name: file.name
      });
    }
  }
  
  /**
   * Get the documents form array
   */
  get documents(): FormArray {
    return this.form.get('documents') as FormArray;
  }
  
  /**
   * Get the form title based on the mode
   */
  get title(): string {
    if (this.isViewMode) return 'Détails de la convention';
    return this.isEditMode ? 'Modifier la convention' : 'Nouvelle convention';
  }
  
  /**
   * Get the submit button text based on the mode
   */
  get submitButtonText(): string {
    return this.isEditMode ? 'Mettre à jour' : 'Créer';
  }
  
  /**
   * Check if the form is in a valid state for submission
   */
  get isFormValid(): boolean {
    return this.form.valid && !this.isSubmitting;
  }

  /**
   * Save the convention
   */
  onSave(): void {
    if (this.form.valid) {
      this.isSubmitting = true;
      // Implementation for saving convention
      this.dialogRef.close();
    }
  }
}
