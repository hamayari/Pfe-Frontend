import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-floating-operational-chatbot',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './floating-operational-chatbot.component.html',
  styleUrls: ['./floating-operational-chatbot.component.scss'],
  animations: [
    trigger('slideIn', [
      state('void', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      state('*', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition('void => *', animate('300ms ease-out')),
      transition('* => void', animate('300ms ease-in'))
    ])
  ]
})
export class FloatingOperationalChatbotComponent {
  @Input() userRole: string = 'DECIDEUR';
  
  isChatbotOpen = false;

  openChatbot() {
    this.isChatbotOpen = true;
  }

  closeChatbot() {
    this.isChatbotOpen = false;
  }

  getChatbotTitle(): string {
    switch (this.userRole) {
      case 'DECIDEUR':
      case 'DECISION_MAKER':
        return 'Assistant Opérationnel Décideur';
      case 'COMMERCIAL':
        return 'Assistant Opérationnel Commercial';
      case 'PROJECT_MANAGER':
      case 'CHEF_PROJET':
        return 'Assistant Opérationnel Chef de Projet';
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return 'Assistant Opérationnel Admin';
      default:
        return 'Assistant Opérationnel';
    }
  }

  getChatbotIcon(): string {
    return 'support_agent';
  }

  getChatbotColor(): string {
    switch (this.userRole) {
      case 'DECIDEUR':
      case 'DECISION_MAKER':
        return '#673ab7'; // Violet
      case 'COMMERCIAL':
        return '#2196f3'; // Bleu
      case 'PROJECT_MANAGER':
      case 'CHEF_PROJET':
        return '#4caf50'; // Vert
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return '#f44336'; // Rouge
      default:
        return '#9c27b0'; // Violet par défaut
    }
  }
}
