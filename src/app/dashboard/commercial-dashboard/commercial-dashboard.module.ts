import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CommercialDashboardComponent } from './commercial-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: CommercialDashboardComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CommercialDashboardComponent
  ]
})
export class CommercialDashboardModule { }




