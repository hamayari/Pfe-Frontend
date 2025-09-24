import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-audit-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Historique d'audit</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Historique des actions d'audit du système</p>
        <!-- Add your audit history table here -->
      </mat-card-content>
    </mat-card>
  `
})
export class AuditHistoryComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    // Load audit history data
  }
}







































