import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-client-space',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="client-space-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>person</mat-icon>
            Espace Client
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Espace client (à implémenter)</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .client-space-container {
      padding: 20px;
    }
  `]
})
export class ClientSpaceComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}







































