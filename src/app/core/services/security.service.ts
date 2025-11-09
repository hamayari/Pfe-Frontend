import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl, SafeScript } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Nettoie et sécurise le HTML pour éviter les attaques XSS
   */
  sanitizeHtml(html: string): SafeHtml {
    if (!html) return '';
    
    // Supprimer les scripts dangereux
    const cleanHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
    
    return this.sanitizer.sanitize(1, cleanHtml) || '';
  }

  /**
   * Nettoie une URL pour éviter les attaques
   */
  sanitizeUrl(url: string): SafeUrl {
    if (!url) return '';
    
    // Vérifier que l'URL est sécurisée
    const cleanUrl = url.replace(/javascript:/gi, '').replace(/data:/gi, '');
    return this.sanitizer.sanitize(2, cleanUrl) || '';
  }

  /**
   * Valide et nettoie les entrées utilisateur
   */
  sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/[<>]/g, '') // Supprimer les balises HTML
      .replace(/javascript:/gi, '') // Supprimer javascript:
      .replace(/on\w+\s*=/gi, '') // Supprimer les événements
      .trim();
  }

  /**
   * Valide un email
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valide un mot de passe selon les bonnes pratiques
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Génère un token CSRF sécurisé
   */
  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Valide un token CSRF
   */
  validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken && token.length === 64;
  }

  /**
   * Chiffre les données sensibles avant stockage
   */
  encryptSensitiveData(data: string): string {
    // Utiliser une méthode de chiffrement simple (en production, utiliser une librairie dédiée)
    const key = 'GestionPro2024!';
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
  }

  /**
   * Déchiffre les données sensibles
   */
  decryptSensitiveData(encryptedData: string): string {
    try {
      const key = 'GestionPro2024!';
      const data = atob(encryptedData);
      let decrypted = '';
      for (let i = 0; i < data.length; i++) {
        decrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return decrypted;
    } catch (error) {
      console.error('Erreur lors du déchiffrement:', error);
      return '';
    }
  }

  /**
   * Nettoie les données avant stockage dans localStorage
   */
  sanitizeForStorage(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeInput(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeForStorage(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Ne pas stocker de données sensibles
        if (['password', 'token', 'secret', 'key'].some(sensitive => 
          key.toLowerCase().includes(sensitive))) {
          continue;
        }
        sanitized[key] = this.sanitizeForStorage(value);
      }
      return sanitized;
    }
    
    return data;
  }

  /**
   * Valide les permissions utilisateur
   */
  validatePermissions(userRoles: string[], requiredRoles: string[]): boolean {
    if (!userRoles || !requiredRoles) return false;
    return requiredRoles.some(role => userRoles.includes(role));
  }

  /**
   * Nettoie les logs pour éviter les fuites d'informations
   */
  sanitizeLogData(data: any): any {
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeLogData(value);
        }
      }
      return sanitized;
    }
    
    return data;
  }
}





