import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-payment-proofs',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="payment-proofs-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>receipt</mat-icon>
            Justificatifs de Paiement
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Gestion des justificatifs de paiement (à implémenter)</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .payment-proofs-container {
      padding: 20px;
    }
  `]
})
export class PaymentProofsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}







































