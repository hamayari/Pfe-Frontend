import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Models and Services
import { Nomenclature } from 'src/app/core/models/nomenclature.model';
import { NomenclatureService } from 'src/app/core/services/nomenclature.service';

// Components
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-nomenclature-detail',
  templateUrl: './nomenclature-detail.component.html',
  styleUrls: ['./nomenclature-detail.component.scss']
})
export class NomenclatureDetailComponent implements OnInit, OnDestroy {
  // Data
  loading = true;
  nomenclature: Nomenclature | null = null;
  relatedNomenclatures: Nomenclature[] = [];
  
  // UI State
  activeTabIndex = 0;
  
  // Destroy subject
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private nomenclatureService: NomenclatureService
  ) {}

  ngOnInit(): void {
    this.loadNomenclature();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Load nomenclature data
   */
  private loadNomenclature(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.snackBar.open('Identifiant de nomenclature invalide', 'Fermer', { duration: 5000 });
      this.goBack();
      return;
    }
    
    this.loading = true;
    
    this.nomenclatureService.getNomenclatureById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (nomenclature) => {
          this.nomenclature = nomenclature;
          this.loadRelatedNomenclatures(nomenclature);
          this.loading = false;
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
   * Load related nomenclatures (children, same type, etc.)
   */
  private loadRelatedNomenclatures(nomenclature: Nomenclature): void {
    // Load children if any
    if (nomenclature.children && nomenclature.children.length > 0) {
      this.relatedNomenclatures = [...nomenclature.children];
      return;
    }
    
    // Otherwise load nomenclatures of the same type
    this.nomenclatureService.getNomenclatures({
      type: nomenclature.type,
      limit: 5,
      isActive: true
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        // Filter out the current nomenclature and take up to 5
        this.relatedNomenclatures = response.data
          .filter(item => item.id !== nomenclature.id)
          .slice(0, 5);
      },
      error: (error) => {
        console.error('Error loading related nomenclatures:', error);
      }
    });
  }
  
  /**
   * Navigate to edit mode
   */
  editNomenclature(): void {
    if (this.nomenclature) {
      this.router.navigate(['edit'], { relativeTo: this.route });
    }
  }
  
  /**
   * Delete confirmation dialog
   */
  confirmDelete(): void {
    if (!this.nomenclature) return;
    
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      data: {
        title: 'Supprimer la nomenclature',
        message: `Êtes-vous sûr de vouloir supprimer la nomenclature "${this.nomenclature.label}" ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn',
        showDeleteIcon: true
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result && this.nomenclature) {
        this.deleteNomenclature(this.nomenclature.id);
      }
    });
  }
  
  /**
   * Delete nomenclature
   */
  private deleteNomenclature(id: string): void {
    this.loading = true;
    
    this.nomenclatureService.deleteNomenclature(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Nomenclature supprimée avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: (error) => {
          console.error('Error deleting nomenclature:', error);
          this.loading = false;
          
          let errorMessage = 'Une erreur est survenue lors de la suppression';
          
          if (error.status === 400) {
            errorMessage = 'Impossible de supprimer une nomenclature utilisée';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
        }
      });
  }
  
  /**
   * Toggle nomenclature status
   */
  toggleStatus(): void {
    if (!this.nomenclature) return;
    
    const newStatus = !(this.nomenclature.isActive ?? false);
    
    this.nomenclatureService.toggleStatus(this.nomenclature.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.nomenclature) {
            this.nomenclature.isActive = newStatus;
            this.snackBar.open(
              `Nomenclature ${newStatus ? 'activée' : 'désactivée'} avec succès`,
              'Fermer',
              { duration: 3000 }
            );
          }
        },
        error: (error) => {
          console.error('Error updating nomenclature status:', error);
          this.snackBar.open(
            'Une erreur est survenue lors de la mise à jour du statut',
            'Fermer',
            { duration: 5000 }
          );
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
   * Navigate to parent nomenclature if available
   */
  navigateToParent(): void {
    if (this.nomenclature?.parent) {
      this.router.navigate(['../', this.nomenclature.parent.id], { relativeTo: this.route });
    }
  }
  
  /**
   * Navigate to related nomenclature
   */
  navigateToNomenclature(id: string): void {
    this.router.navigate(['../', id], { relativeTo: this.route });
  }
  
  /**
   * Get badge color based on status
   */
  getStatusColor(isActive: boolean | undefined): string {
    return isActive ? 'primary' : 'warn';
  }
  
  /**
   * Get status text
   */
  getStatusText(isActive: boolean | undefined): string {
    return isActive ? 'Actif' : 'Inactif';
  }
  
  /**
   * Format date
   */
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  /**
   * Check if metadata exists and has values
   */
  hasMetadata(metadata: any): boolean {
    return metadata && Object.keys(metadata).length > 0;
  }
  
  /**
   * Track by function for ngFor
   */
  trackById(index: number, item: any): string {
    return item.id || index;
  }

  /**
   * Get metadata key as string
   */
  getMetadataKey(key: unknown): string {
    return String(key);
  }
}
