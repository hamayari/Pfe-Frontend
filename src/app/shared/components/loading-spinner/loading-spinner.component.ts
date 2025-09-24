import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-spinner" [class.overlay]="overlay" [class.small]="size === 'small'" [class.large]="size === 'large'">
      <div class="spinner">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
      </div>
      <div class="loading-text" *ngIf="showText">{{ text }}</div>
    </div>
  `,
  styles: [`
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .loading-spinner.overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      z-index: 1000;
    }

    .spinner {
      display: flex;
      gap: 4px;
    }

    .bounce1, .bounce2, .bounce3 {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #1976d2;
      animation: bounce 1.4s ease-in-out infinite both;
    }

    .bounce1 {
      animation-delay: -0.32s;
    }

    .bounce2 {
      animation-delay: -0.16s;
    }

    .bounce3 {
      animation-delay: 0s;
    }

    .loading-spinner.small .bounce1,
    .loading-spinner.small .bounce2,
    .loading-spinner.small .bounce3 {
      width: 6px;
      height: 6px;
    }

    .loading-spinner.large .bounce1,
    .loading-spinner.large .bounce2,
    .loading-spinner.large .bounce3 {
      width: 12px;
      height: 12px;
    }

    .loading-text {
      margin-top: 12px;
      color: #666;
      font-size: 14px;
    }

    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() overlay: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() text: string = 'Chargement...';
  @Input() showText: boolean = true;
}






























