import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SidenavComponent } from '../sidenav/sidenav.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidenavComponent],
  template: `
    <div class="layout-container">
      <app-header></app-header>
      <div class="main-content">
        <app-sidenav></app-sidenav>
        <div class="content-area">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    
    .main-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    
    .content-area {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }
  `]
})
export class LayoutComponent {
}













