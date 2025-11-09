import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-monitoring',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="admin-monitoring-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>monitor</mat-icon>
            Monitoring Système
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Système de monitoring (à implémenter)</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-monitoring-container {
      padding: 20px;
    }
  `]
})
export class AdminMonitoringComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}














































