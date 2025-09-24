import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DecisionMakerDashboardComponent } from './decision-maker-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DecisionMakerDashboardComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class DecisionMakerDashboardModule { }


