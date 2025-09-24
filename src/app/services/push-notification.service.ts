import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  // Remplace par ta clé publique VAPID générée côté backend
  readonly VAPID_PUBLIC_KEY = 'REPLACE_WITH_YOUR_PUBLIC_VAPID_KEY';
  isSubscribed = false;

  constructor(private swPush: SwPush, private http: HttpClient) {}

  subscribeToNotifications(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.swPush.isEnabled) {
        reject('Service Worker Push non activé');
        return;
      }
      Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
          reject('Permission refusée pour les notifications push');
          return;
        }
        this.swPush.requestSubscription({
          serverPublicKey: this.VAPID_PUBLIC_KEY
        })
        .then(sub => {
          this.http.post('/api/push/subscribe', sub).subscribe({
            next: () => {
              this.isSubscribed = true;
              resolve('Notifications push activées');
            },
            error: (err) => {
              reject('Erreur lors de l’enregistrement de l’abonnement push');
            }
          });
        })
        .catch(err => {
          reject('Erreur abonnement push : ' + err);
        });
      });
    });
  }

  unsubscribeFromNotifications(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.swPush.subscription.pipe().subscribe(sub => {
        if (sub) {
          sub.unsubscribe().then(() => {
            this.isSubscribed = false;
            resolve('Notifications push désactivées');
          }).catch(err => {
            reject('Erreur lors de la désactivation des notifications push');
          });
        } else {
          resolve('Aucun abonnement push à désactiver');
        }
      });
    });
  }

  listenToMessages() {
    this.swPush.messages.subscribe(msg => {
      console.log('Notification push reçue', msg);
    });
  }
} 