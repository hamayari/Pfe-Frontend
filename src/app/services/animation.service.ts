import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  constructor() { }

  /**
   * Animation de rebond pour les réactions
   */
  bounceAnimation(element: HTMLElement, duration: number = 300): void {
    element.style.transition = `transform ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
    element.style.transform = 'scale(1.2)';
    
    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, duration / 2);
    
    setTimeout(() => {
      element.style.transition = '';
      element.style.transform = '';
    }, duration);
  }

  /**
   * Animation de pulsation pour les notifications
   */
  pulseAnimation(element: HTMLElement, duration: number = 600): void {
    element.style.animation = `pulse ${duration}ms ease-in-out`;
    
    setTimeout(() => {
      element.style.animation = '';
    }, duration);
  }

  /**
   * Animation de glissement pour les messages
   */
  slideInAnimation(element: HTMLElement, direction: 'left' | 'right' | 'up' | 'down' = 'up', duration: number = 300): void {
    const startTransform = this.getStartTransform(direction);
    const endTransform = 'translate(0, 0)';
    
    element.style.transform = startTransform;
    element.style.opacity = '0';
    element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
    
    // Force reflow
    element.offsetHeight;
    
    element.style.transform = endTransform;
    element.style.opacity = '1';
    
    setTimeout(() => {
      element.style.transition = '';
      element.style.transform = '';
      element.style.opacity = '';
    }, duration);
  }

  /**
   * Animation de réaction avec particules
   */
  reactionParticles(element: HTMLElement, emoji: string): void {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Créer des particules d'emoji
    for (let i = 0; i < 5; i++) {
      this.createParticle(centerX, centerY, emoji, i);
    }
  }

  /**
   * Animation de confetti pour les succès
   */
  confettiAnimation(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    
    for (let i = 0; i < 50; i++) {
      this.createConfetti(rect.left, rect.top, rect.width, rect.height, colors[i % colors.length]);
    }
  }

  /**
   * Animation de vibration pour les erreurs
   */
  shakeAnimation(element: HTMLElement, duration: number = 500): void {
    element.style.animation = `shake ${duration}ms ease-in-out`;
    
    setTimeout(() => {
      element.style.animation = '';
    }, duration);
  }

  private getStartTransform(direction: string): string {
    switch (direction) {
      case 'left': return 'translate(-100%, 0)';
      case 'right': return 'translate(100%, 0)';
      case 'up': return 'translate(0, -100%)';
      case 'down': return 'translate(0, 100%)';
      default: return 'translate(0, -100%)';
    }
  }

  private createParticle(x: number, y: number, emoji: string, index: number): void {
    const particle = document.createElement('div');
    particle.textContent = emoji;
    particle.style.position = 'fixed';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.fontSize = '20px';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    particle.style.transition = 'all 1s ease-out';
    
    document.body.appendChild(particle);
    
    // Animation de dispersion
    const angle = (index * 72) * (Math.PI / 180); // 72° entre chaque particule
    const distance = 100 + Math.random() * 50;
    const endX = x + Math.cos(angle) * distance;
    const endY = y + Math.sin(angle) * distance;
    
    setTimeout(() => {
      particle.style.left = endX + 'px';
      particle.style.top = endY + 'px';
      particle.style.opacity = '0';
      particle.style.transform = 'scale(0.5)';
    }, 50);
    
    // Nettoyer après animation
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 1000);
  }

  private createConfetti(x: number, y: number, width: number, height: number, color: string): void {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.left = (x + Math.random() * width) + 'px';
    confetti.style.top = (y + Math.random() * height) + 'px';
    confetti.style.width = '8px';
    confetti.style.height = '8px';
    confetti.style.backgroundColor = color;
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9999';
    confetti.style.borderRadius = '50%';
    
    document.body.appendChild(confetti);
    
    // Animation de chute
    const animation = confetti.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translateY(${window.innerHeight + 100}px) rotate(${360 + Math.random() * 360}deg)`, opacity: 0 }
    ], {
      duration: 3000 + Math.random() * 2000,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
    
    animation.onfinish = () => {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    };
  }
}

















































