import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NomenclatureListComponent } from './nomenclature-list/nomenclature-list.component';
import { NomenclatureFormComponent } from './nomenclature-form/nomenclature-form.component';
import { NomenclatureDetailComponent } from './nomenclature-detail/nomenclature-detail.component';

const routes: Routes = [
  {
    path: '',
    component: NomenclatureListComponent,
    data: { title: 'Gestion des Nomenclatures' }
  },
  {
    path: 'new',
    component: NomenclatureFormComponent,
    data: { title: 'Nouvelle Nomenclature' }
  },
  {
    path: ':id',
    component: NomenclatureDetailComponent,
    data: { title: 'Détails de la Nomenclature' }
  },
  {
    path: ':id/edit',
    component: NomenclatureFormComponent,
    data: { title: 'Modifier la Nomenclature' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NomenclatureRoutingModule { }
