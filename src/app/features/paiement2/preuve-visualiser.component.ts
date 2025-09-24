import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FactureService } from './services/facture.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-preuve-visualiser',
  templateUrl: './preuve-visualiser.component.html',
  styleUrls: ['./preuve-visualiser.component.scss']
})
export class PreuveVisualiserComponent implements OnInit {
  preuveUrl: SafeResourceUrl | null = null;
  erreur: string | null = null;

  constructor(
    private factureService: FactureService,
    @Inject(MAT_DIALOG_DATA) public data: { factureId: string },
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    if (this.data.factureId) {
      this.factureService.getPreuve(this.data.factureId).subscribe({
        next: (blob: any) => {
          if (blob && blob.size > 0) {
            const url = URL.createObjectURL(blob);
            this.preuveUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          } else {
            this.erreur = "Aucune preuve disponible pour cette facture.";
          }
        },
        error: () => {
          this.erreur = "Erreur lors du chargement de la preuve.";
        }
      });
    } else {
      this.erreur = "Identifiant de facture manquant.";
    }
  }
} 