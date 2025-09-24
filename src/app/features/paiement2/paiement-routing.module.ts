import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FactureListComponent } from './facture-list.component';
import { PreuveVisualiserComponent } from './preuve-visualiser.component';
import { RecuPdfComponent } from './recu-pdf.component';

const routes: Routes = [
  { path: '', component: FactureListComponent },
  { path: 'preuve/:id', component: PreuveVisualiserComponent },
  { path: 'recu/:id', component: RecuPdfComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaiementRoutingModule {} 