import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

// Models and Services
import { 
  Nomenclature, 
  NomenclatureFormData, 
  NomenclatureType
} from 'src/app/core/models/nomenclature.model';
import { NomenclatureService } from 'src/app/core/services/nomenclature.service';

@Component({
  selector: 'app-nomenclature-form',
  templateUrl: './nomenclature-form.component.html',
  styleUrls: ['./nomenclature-form.component.scss']
})
export class NomenclatureFormComponent implements OnInit, OnDestroy {
  // Form
  nomenclatureForm: FormGroup;
  
  // Data
  loading = false;
  isEditMode = false;
  nomenclatureId: string | null = null;
  
  // Available types and parents
  types = [
    { code: NomenclatureType.GOVERNORATE, label: 'Gouvernorat' },
    { code: NomenclatureType.STRUCTURE, label: 'Structure' },
    { code: NomenclatureType.APPLICATION, label: 'Application' },
    { code: NomenclatureType.STATUS, label: 'Statut' },
    { code: NomenclatureType.PAYMENT_TERM, label: 'Terme de paiement' }
  ];
  parentOptions: Nomenclature[] = [];
  
  // Destroy subject
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private snackBar: MatSnackBar,
    private nomenclatureService: NomenclatureService
  ) {
    this.nomenclatureForm = this.createForm();
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.nomenclatureId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.nomenclatureId;
    
    // Load nomenclature data if in edit mode
    if (this.isEditMode && this.nomenclatureId) {
      this.loadNomenclature(this.nomenclatureId);
    }
    
    // Load parent options based on selected type
    this.nomenclatureForm.get('type')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        this.loadParentOptions(type);
      });
    
    // Initialize parent options if type is already set
    const initialType = this.nomenclatureForm.get('type')?.value;
    if (initialType) {
      this.loadParentOptions(initialType);
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Create the form group
   */
  private createForm(): FormGroup {
    return this.fb.group({
      code: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z0-9_-]+$')
      ]],
      label: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.maxLength(500)
      ]],
      type: [NomenclatureType.APPLICATION, [
        Validators.required
      ]],
      parentId: [null],
      isActive: [true],
      order: [0, [
        Validators.min(0),
        Validators.max(1000)
      ]],
      metadata: this.fb.group({
        // Dynamic metadata fields will be added here
      })
    });
  }
  
  /**
   * Load nomenclature data for editing
   */
  private loadNomenclature(id: string): void {
    this.loading = true;
    
    this.nomenclatureService.getNomenclatureById(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (nomenclature) => {
          this.populateForm(nomenclature);
        },
        error: (error) => {
          console.error('Error loading nomenclature:', error);
          this.snackBar.open(
            'Une erreur est survenue lors du chargement de la nomenclature',
            'Fermer',
            { duration: 5000 }
          );
          this.goBack();
        }
      });
  }
  
  /**
   * Populate form with nomenclature data
   */
  private populateForm(nomenclature: Nomenclature): void {
    this.nomenclatureForm.patchValue({
      code: nomenclature.code,
      label: nomenclature.label,
      description: nomenclature.description || '',
      type: nomenclature.type,
      parentId: nomenclature.parentId || null,
      isActive: nomenclature.isActive,
      order: nomenclature.order || 0,
      metadata: {
        ...nomenclature.metadata
      }
    });
    
    // Add metadata controls dynamically
    this.updateMetadataControls(nomenclature.metadata);
  }
  
  /**
   * Update metadata form controls based on metadata object
   */
  private updateMetadataControls(metadata: Record<string, any> = {}): void {
    const metadataGroup = this.nomenclatureForm.get('metadata') as FormGroup;
    
    // Remove existing controls
    Object.keys(metadataGroup.controls).forEach(key => {
      metadataGroup.removeControl(key);
    });
    
    // Add new controls
    Object.entries(metadata).forEach(([key, value]) => {
      metadataGroup.addControl(key, this.fb.control(value));
    });
  }
  
  /**
   * Load parent options based on selected type
   */
  private loadParentOptions(type: NomenclatureType): void {
    // In a real app, you might want to filter parent options based on type
    // For now, we'll just load all active nomenclatures of the same type
    this.nomenclatureService.getNomenclatures({ 
      type: type,
      isActive: true,
      limit: 100
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        // Filter out the current nomenclature if in edit mode
        this.parentOptions = response.data.filter(item => 
          !this.isEditMode || item.id !== this.nomenclatureId
        );
        
        // If current parent is not in the options (e.g., inactive), add it
        const currentParentId = this.nomenclatureForm.get('parentId')?.value;
        if (currentParentId && !this.parentOptions.some(item => item.id === currentParentId)) {
          this.nomenclatureService.getNomenclatureById(currentParentId)
            .pipe(takeUntil(this.destroy$))
            .subscribe(parent => {
              this.parentOptions = [parent, ...this.parentOptions];
            });
        }
      },
      error: (error) => {
        console.error('Error loading parent options:', error);
        this.parentOptions = [];
      }
    });
  }
  
  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.nomenclatureForm.invalid) {
      this.markFormGroupTouched(this.nomenclatureForm);
      this.snackBar.open(
        'Veuillez corriger les erreurs dans le formulaire',
        'Fermer',
        { duration: 5000 }
      );
      return;
    }
    
    this.loading = true;
    const formData = this.prepareFormData();
    
    const request$ = this.isEditMode && this.nomenclatureId
      ? this.nomenclatureService.updateNomenclature(this.nomenclatureId, formData)
      : this.nomenclatureService.createNomenclature(formData);
    
    request$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (nomenclature) => {
          const message = this.isEditMode 
            ? 'Nomenclature mise à jour avec succès'
            : 'Nomenclature créée avec succès';
            
          this.snackBar.open(message, 'Fermer', { duration: 3000 });
          
          // Navigate to the detail view or back to the list
          if (this.isEditMode) {
            this.router.navigate(['../..', nomenclature.id], { relativeTo: this.route });
          } else {
            this.router.navigate(['..', nomenclature.id], { relativeTo: this.route });
          }
        },
        error: (error) => {
          console.error('Error saving nomenclature:', error);
          
          let errorMessage = 'Une erreur est survenue lors de la sauvegarde';
          
          if (error.status === 409) {
            errorMessage = 'Un élément avec ce code existe déjà';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
        }
      });
  }
  
  /**
   * Prepare form data for submission
   */
  private prepareFormData(): NomenclatureFormData {
    const formValue = this.nomenclatureForm.value;
    
    // Clean up the data
    const formData: NomenclatureFormData = {
      name: formValue.name || formValue.label || '',
      code: formValue.code.trim(),
      label: formValue.label.trim(),
      description: formValue.description ? formValue.description.trim() : undefined,
      type: formValue.type,
      isActive: formValue.isActive,
      order: formValue.order || 0,
      parentId: formValue.parentId || undefined,
      metadata: { ...formValue.metadata }
    };
    
    // Remove empty metadata fields
    if (formData.metadata) {
      Object.keys(formData.metadata).forEach(key => {
        if (formData.metadata![key] === '' || formData.metadata![key] === null) {
          delete formData.metadata![key];
        }
      });
    }
    
    // Remove metadata if empty
    if (formData.metadata && Object.keys(formData.metadata).length === 0) {
      delete formData.metadata;
    }
    
    return formData;
  }
  
  /**
   * Mark all form controls as touched to trigger validation
   */
  private markFormGroupTouched(formGroup: FormGroup | any): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        (control as any).markAsTouched();
      }
    });
  }
  
  /**
   * Navigate back
   */
  goBack(): void {
    this.location.back();
  }
  
  /**
   * Helper to get form controls
   */
  get f(): { [key: string]: AbstractControl } {
    return this.nomenclatureForm.controls;
  }
  
  /**
   * Get metadata form group
   */
  get metadataFormGroup(): FormGroup {
    return this.nomenclatureForm.get('metadata') as FormGroup;
  }
  
  /**
   * Track by function for ngFor
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  /**
   * Compare function for mat-select
   */
  compareWithId(a: any, b: any): boolean {
    return a && b ? a.id === b.id : a === b;
  }

  /**
   * Object reference for template
   */
  Object = Object;
}
