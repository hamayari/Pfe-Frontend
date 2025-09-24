import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet
  ],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: [`
    /* Styles globaux pour l'application */
    body {
      margin: 0;
      padding: 0;
      font-family: 'Roboto', sans-serif;
    }
  `]
})
export class AppComponent {
  title = 'Gestion Pro';
}