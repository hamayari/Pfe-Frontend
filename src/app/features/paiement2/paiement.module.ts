import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FactureListComponent } from './facture-list.component';
import { PreuveVisualiserComponent } from './preuve-visualiser.component';
import { RecuPdfComponent } from './recu-pdf.component';
import { NotificationComponent } from './notification.component';
import { PaiementRoutingModule } from './paiement-routing.module';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';

@NgModule({
  declarations: [
    PreuveVisualiserComponent
  ],
  imports: [
    CommonModule,
    PaiementRoutingModule,
    MatDialogModule,
    FormsModule,
    MaterialModule
  ],
  exports: []
})
export class PaiementModule {} 