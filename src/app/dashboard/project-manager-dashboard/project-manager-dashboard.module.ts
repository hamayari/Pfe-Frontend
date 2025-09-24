import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProjectManagerDashboardComponent } from './project-manager-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectManagerDashboardComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ProjectManagerDashboardModule { }


