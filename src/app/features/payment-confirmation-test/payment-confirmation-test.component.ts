import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-payment-confirmation-test',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="payment-confirmation-test-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>payment</mat-icon>
            Test de Confirmation de Paiement
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Test de confirmation de paiement (à implémenter)</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .payment-confirmation-test-container {
      padding: 20px;
    }
  `]
})
export class PaymentConfirmationTestComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}














































