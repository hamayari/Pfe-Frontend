import { Injectable, ComponentRef, ViewContainerRef, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationToastComponent, ToastNotification, ToastAction } from '../components/notification-toast/notification-toast.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationToastService {
  private notifications$ = new BehaviorSubject<ToastNotification[]>([]);
  private toastComponents: Map<string, ComponentRef<NotificationToastComponent>> = new Map();
  private containerRef?: ViewContainerRef;
  
  constructor() {}
  
  /**
   * Initialiser le conteneur de toasts
   */
  initializeContainer(containerRef: ViewContainerRef): void {
    this.containerRef = containerRef;
  }
  
  /**
   * Obtenir l'observable des notifications
   */
  getNotifications(): Observable<ToastNotification[]> {
    return this.notifications$.asObservable();
  }
  
  /**
   * Afficher une notification de succès
   */
  success(title: string, message: string, options?: Partial<ToastNotification>): string {
    return this.show({
      id: this.generateId(),
      type: 'success',
      title,
      message,
      duration: 5000,
      ...options
    });
  }
  
  /**
   * Afficher une notification d'information
   */
  info(title: string, message: string, options?: Partial<ToastNotification>): string {
    return this.show({
      id: this.generateId(),
      type: 'info',
      title,
      message,
      duration: 4000,
      ...options
    });
  }
  
  /**
   * Afficher une notification d'avertissement
   */
  warning(title: string, message: string, options?: Partial<ToastNotification>): string {
    return this.show({
      id: this.generateId(),
      type: 'warning',
      title,
      message,
      duration: 6000,
      ...options
    });
  }
  
  /**
   * Afficher une notification d'erreur
   */
  error(title: string, message: string, options?: Partial<ToastNotification>): string {
    return this.show({
      id: this.generateId(),
      type: 'error',
      title,
      message,
      duration: 8000,
      persistent: false,
      ...options
    });
  }
  
  /**
   * Afficher une notification personnalisée
   */
  show(notification: ToastNotification): string {
    const currentNotifications = this.notifications$.value;
    const newNotifications = [...currentNotifications, notification];
    
    this.notifications$.next(newNotifications);
    
    // Créer le composant toast si le conteneur est disponible
    if (this.containerRef) {
      this.createToastComponent(notification);
    }
    
    return notification.id;
  }
  
  /**
   * Fermer une notification spécifique
   */
  dismiss(notificationId: string): void {
    const currentNotifications = this.notifications$.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== notificationId);
    
    this.notifications$.next(filteredNotifications);
    
    // Détruire le composant toast
    const componentRef = this.toastComponents.get(notificationId);
    if (componentRef) {
      componentRef.destroy();
      this.toastComponents.delete(notificationId);
    }
  }
  
  /**
   * Fermer toutes les notifications
   */
  dismissAll(): void {
    this.notifications$.next([]);
    
    // Détruire tous les composants toast
    this.toastComponents.forEach(componentRef => componentRef.destroy());
    this.toastComponents.clear();
  }
  
  /**
   * Fermer toutes les notifications d'un type spécifique
   */
  dismissByType(type: ToastNotification['type']): void {
    const currentNotifications = this.notifications$.value;
    const filteredNotifications = currentNotifications.filter(n => n.type !== type);
    
    this.notifications$.next(filteredNotifications);
    
    // Détruire les composants toast correspondants
    this.toastComponents.forEach((componentRef, id) => {
      const notification = currentNotifications.find(n => n.id === id);
      if (notification && notification.type === type) {
        componentRef.destroy();
        this.toastComponents.delete(id);
      }
    });
  }
  
  /**
   * Créer un composant toast
   */
  private createToastComponent(notification: ToastNotification): void {
    if (!this.containerRef) return;
    
    const componentRef = this.containerRef.createComponent(NotificationToastComponent);
    componentRef.instance.notification = notification;
    
    // Gérer la fermeture
    componentRef.instance.dismiss = () => {
      this.dismiss(notification.id);
    };
    
    this.toastComponents.set(notification.id, componentRef);
  }
  
  /**
   * Générer un ID unique
   */
  private generateId(): string {
    return 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * Notifications prédéfinies pour l'application
   */
  
  // Notifications de conventions
  conventionCreated(conventionReference: string, title: string): string {
    return this.success(
      '✅ Convention Créée',
      `Convention ${conventionReference} créée avec succès pour ${title}`,
      {
        duration: 5000,
        actions: [
          {
            label: 'Voir',
            action: () => {
              // TODO: Naviguer vers la convention
              console.log('Voir convention:', conventionReference);
            },
            style: 'primary'
          }
        ]
      }
    );
  }
  
  conventionUpdated(conventionReference: string): string {
    return this.info(
      '📝 Convention Modifiée',
      `Convention ${conventionReference} mise à jour avec succès`,
      { duration: 4000 }
    );
  }
  
  // Notifications de factures
  invoiceGenerated(invoiceNumber: string, amount: number): string {
    return this.info(
      '📄 Facture Générée',
      `Facture ${invoiceNumber} générée (Montant: ${amount}€)`,
      {
        duration: 5000,
        actions: [
          {
            label: 'Envoyer',
            action: () => {
              // TODO: Ouvrir modal d'envoi
              console.log('Envoyer facture:', invoiceNumber);
            },
            style: 'primary'
          }
        ]
      }
    );
  }
  
  invoiceSent(invoiceNumber: string, email: string): string {
    return this.success(
      '📧 Facture Envoyée',
      `Facture ${invoiceNumber} envoyée à ${email}`,
      { duration: 4000 }
    );
  }
  
  invoiceOverdue(invoiceNumber: string, daysOverdue: number): string {
    return this.warning(
      '⚠️ Facture en Retard',
      `Facture ${invoiceNumber} en retard de ${daysOverdue} jours`,
      {
        duration: 8000,
        persistent: false,
        actions: [
          {
            label: 'Relancer',
            action: () => {
              // TODO: Envoyer relance
              console.log('Relancer facture:', invoiceNumber);
            },
            style: 'primary'
          }
        ]
      }
    );
  }
  
  // Notifications de paiements
  paymentReceived(invoiceNumber: string, amount: number, method: string): string {
    return this.success(
      '💰 Paiement Reçu',
      `Paiement de ${amount}€ reçu pour la facture ${invoiceNumber} (${method})`,
      { duration: 5000 }
    );
  }
  
  paymentFailed(invoiceNumber: string, reason: string): string {
    return this.error(
      '❌ Échec de Paiement',
      `Échec du paiement pour la facture ${invoiceNumber}: ${reason}`,
      {
        duration: 8000,
        actions: [
          {
            label: 'Réessayer',
            action: () => {
              // TODO: Réessayer le paiement
              console.log('Réessayer paiement:', invoiceNumber);
            },
            style: 'primary'
          }
        ]
      }
    );
  }
  
  // Notifications système
  systemMaintenance(scheduledTime: string): string {
    return this.warning(
      '🔧 Maintenance Programmée',
      `Maintenance système prévue le ${scheduledTime}`,
      {
        duration: 10000,
        persistent: true,
        actions: [
          {
            label: 'Plus d\'infos',
            action: () => {
              // TODO: Ouvrir modal d'informations
              console.log('Plus d\'infos sur la maintenance');
            },
            style: 'secondary'
          }
        ]
      }
    );
  }
  
  systemError(error: string): string {
    return this.error(
      '🚨 Erreur Système',
      `Une erreur système s'est produite: ${error}`,
      {
        duration: 10000,
        persistent: true,
        actions: [
          {
            label: 'Signaler',
            action: () => {
              // TODO: Ouvrir modal de signalement
              console.log('Signaler erreur:', error);
            },
            style: 'danger'
          }
        ]
      }
    );
  }
  
  // Notifications utilisateur
  userLoggedIn(username: string): string {
    return this.success(
      '👋 Connexion Réussie',
      `Bienvenue ${username} !`,
      { duration: 3000 }
    );
  }
  
  userLoggedOut(): string {
    return this.info(
      '👋 Déconnexion',
      'Vous avez été déconnecté avec succès',
      { duration: 3000 }
    );
  }
  
  passwordChanged(): string {
    return this.success(
      '🔐 Mot de Passe Modifié',
      'Votre mot de passe a été modifié avec succès',
      { duration: 4000 }
    );
  }
  
  // Notifications de validation
  validationError(field: string, message: string): string {
    return this.error(
      '❌ Erreur de Validation',
      `${field}: ${message}`,
      { duration: 6000 }
    );
  }
  
  formSaved(): string {
    return this.success(
      '💾 Formulaire Sauvegardé',
      'Vos modifications ont été sauvegardées',
      { duration: 3000 }
    );
  }
  
  // Notifications de synchronisation
  dataSynced(): string {
    return this.success(
      '🔄 Synchronisation Terminée',
      'Toutes les données ont été synchronisées',
      { duration: 3000 }
    );
  }
  
  syncError(): string {
    return this.error(
      '🔄 Erreur de Synchronisation',
      'Impossible de synchroniser les données',
      {
        duration: 8000,
        actions: [
          {
            label: 'Réessayer',
            action: () => {
              // TODO: Relancer la synchronisation
              console.log('Relancer synchronisation');
            },
            style: 'primary'
          }
        ]
      }
    );
  }
}




