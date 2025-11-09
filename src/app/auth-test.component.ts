import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-test-container">
      <h1>Authentication Test Component</h1>
      <p>This is a test component for authentication functionality.</p>
    </div>
  `,
  styles: [`
    .auth-test-container {
      padding: 20px;
      text-align: center;
    }
  `]
})
export class AuthTestComponent {
  constructor() {}
}














































