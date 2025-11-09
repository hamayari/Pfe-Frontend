import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [MatIconModule],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [ style({ opacity: 0, transform: 'scale(0.95)' }), animate('300ms ease', style({ opacity: 1, transform: 'scale(1)' })) ]),
      transition(':leave', [ animate('200ms ease', style({ opacity: 0, transform: 'scale(0.95)' })) ])
    ])
  ],
  template: `
    <div [@fadeInOut] style="text-align:center;margin-top:3em">
      <mat-icon style="font-size:4em;color:#b71c1c;background:#fff;border-radius:50%;box-shadow:0 2px 8px #b71c1c33;padding:0.2em;">block</mat-icon>
      <h2 style="color:#b71c1c;margin-top:1em;">Accès refusé</h2>
      <p style="font-size:1.2em;color:#333;">Vous n'avez pas les droits pour accéder à cette page.<br>
      Si vous pensez qu'il s'agit d'une erreur, contactez l'administrateur.</p>
      <button (click)="goHome()" style="margin-top:2em;padding:0.9em 2.2em;font-size:1.1em;background:#1976d2;color:white;border:none;border-radius:4px;cursor:pointer;box-shadow:0 2px 8px #1976d233;outline:2px solid #fff;">Retour à l'accueil</button>
    </div>
  `
})
export class AccessDeniedComponent {
  constructor(private router: Router) {}
  goHome() {
    this.router.navigate(['/']);
  }
} 













































