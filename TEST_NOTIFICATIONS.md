# Guide de Test - Notifications de Messages

## 📋 Vue d'ensemble

Le composant de messagerie possède un système de notifications de type "Messenger" qui s'affiche en bas à droite de l'écran lorsqu'un utilisateur connecté reçoit un message.

## 🎯 Fonctionnalités des Notifications

### 1. **Affichage Automatique**
- Les notifications apparaissent automatiquement quand un message est reçu
- Position : Coin inférieur droit de l'écran
- Style : Carte blanche avec ombre, avatar de l'expéditeur, nom et aperçu du message
- Durée : 10 secondes (auto-dismiss)

### 2. **Conditions d'Affichage**
Les notifications s'affichent UNIQUEMENT si :
- ✅ L'utilisateur est connecté
- ✅ Le message provient d'une autre personne (pas de notification pour ses propres messages)
- ✅ La conversation d'où provient le message n'est PAS actuellement sélectionnée

### 3. **Code Responsable**
Fichier : `messaging.component.ts`

**Lignes 1890-1903** - Logique de notification :
```typescript
// Notification Messenger-like
if (msg.senderId !== this.currentUserId) {
  const item = {
    conversationId,
    senderName: msg.senderName || 'Utilisateur',
    preview: String(msg.content || '').slice(0, 120),
    conv
  } as any;
  if (!Array.isArray(this.incomingNotifications)) this.incomingNotifications = [] as any;
  this.incomingNotifications.unshift(item);
  setTimeout(() => {
    this.incomingNotifications = this.incomingNotifications.filter(x => x !== item);
  }, 10000);
}
```

**Lignes 493-504** - Template de notification :
```html
<div class="messenger-popups" *ngIf="incomingNotifications.length">
  <div class="popup-card" *ngFor="let n of incomingNotifications">
    <img class="popup-avatar" [src]="getDefaultAvatar(n.senderName)" />
    <div class="popup-content" (click)="openFromNotification(n)">
      <div class="popup-title">{{ n.senderName }}</div>
      <div class="popup-preview">{{ n.preview }}</div>
    </div>
    <button class="popup-close" (click)="dismissNotification(n)">
      <mat-icon>close</mat-icon>
    </button>
  </div>
</div>
```

## 🧪 Méthodes de Test

### **Méthode 1 : Test avec Deux Navigateurs (Recommandé)**

1. **Ouvrir deux navigateurs différents** (ex: Chrome et Firefox)
   
2. **Navigateur 1 - Utilisateur A** :
   ```
   - Se connecter avec un compte utilisateur (ex: admin)
   - Aller sur la page de messagerie
   - Sélectionner une conversation
   ```

3. **Navigateur 2 - Utilisateur B** :
   ```
   - Se connecter avec un autre compte (ex: user1)
   - Aller sur la page de messagerie
   - Sélectionner UNE AUTRE conversation (pas celle de l'Utilisateur A)
   ```

4. **Envoyer un message** :
   ```
   - Depuis Navigateur 1, envoyer un message à l'Utilisateur B
   - Observer la notification apparaître en bas à droite du Navigateur 2
   ```

5. **Vérifier** :
   - ✅ Notification apparaît avec avatar, nom et aperçu du message
   - ✅ Notification disparaît après 10 secondes
   - ✅ Cliquer sur la notification ouvre la conversation
   - ✅ Cliquer sur le bouton X ferme la notification immédiatement

### **Méthode 2 : Test avec Onglets Incognito**

1. **Onglet Normal** :
   ```
   - Se connecter avec le compte A
   - Ouvrir la messagerie
   ```

2. **Onglet Incognito** :
   ```
   - Se connecter avec le compte B
   - Ouvrir la messagerie
   - Sélectionner une conversation différente
   ```

3. **Tester l'envoi de messages** entre les deux comptes

### **Méthode 3 : Test Manuel avec Console DevTools**

Pour tester rapidement sans second utilisateur :

1. **Ouvrir la console DevTools** (F12)

2. **Injecter une notification de test** :
```javascript
// Récupérer le composant Angular
const component = ng.getComponent(document.querySelector('app-messaging'));

// Ajouter une notification de test
component.incomingNotifications = [{
  conversationId: 'test-conv-123',
  senderName: 'Jean Dupont',
  preview: 'Ceci est un message de test pour vérifier les notifications',
  conv: { id: 'test-conv-123', name: 'Test' }
}];

// Forcer la détection des changements
ng.applyChanges(component);

// La notification devrait apparaître en bas à droite
```

3. **Tester le dismiss automatique** :
```javascript
// La notification disparaîtra automatiquement après 10 secondes
// Ou vous pouvez la supprimer manuellement :
component.dismissNotification(component.incomingNotifications[0]);
ng.applyChanges(component);
```

### **Méthode 4 : Test avec WebSocket en Temps Réel**

Si le WebSocket est configuré :

1. **Vérifier la connexion WebSocket** :
   - Regarder l'indicateur de connexion dans l'en-tête (icône wifi)
   - Doit afficher "Connecté" en vert

2. **Envoyer un message depuis un autre utilisateur** :
   - Le message sera reçu via WebSocket
   - La notification s'affichera automatiquement

## 🔍 Débogage

### Vérifier que les notifications fonctionnent :

1. **Ouvrir la console** et vérifier :
```javascript
// Vérifier l'état du composant
const comp = ng.getComponent(document.querySelector('app-messaging'));
console.log('Notifications actives:', comp.incomingNotifications);
console.log('User ID actuel:', comp.currentUserId);
console.log('WebSocket connecté:', comp.isWebSocketConnected);
```

2. **Vérifier les messages reçus** :
   - Mettre un breakpoint dans `handleRealTimeMessage()` (ligne 1861)
   - Observer si les messages sont bien reçus
   - Vérifier la condition `msg.senderId !== this.currentUserId` (ligne 1891)

3. **Vérifier le CSS** :
   - Les notifications utilisent la classe `.messenger-popups`
   - Position : `position: fixed; right: 16px; bottom: 16px; z-index: 9999;`
   - Si elles n'apparaissent pas, vérifier qu'aucun autre élément ne les cache

## 📊 Résultat Attendu

Quand un message est reçu, vous devriez voir :

```
┌─────────────────────────────────┐
│  👤  Jean Dupont                │
│      Bonjour, comment ça va ?   │  [X]
└─────────────────────────────────┘
```

- **Avatar** : Initiales de l'expéditeur avec couleur
- **Nom** : Nom de l'expéditeur en gras
- **Aperçu** : Premiers 120 caractères du message
- **Bouton X** : Pour fermer manuellement
- **Cliquable** : Cliquer ouvre la conversation

## 🎨 Personnalisation

Pour modifier le comportement des notifications :

### Changer la durée d'affichage :
```typescript
// Ligne 1900-1902
setTimeout(() => {
  this.incomingNotifications = this.incomingNotifications.filter(x => x !== item);
}, 10000); // Changer 10000 (10 secondes) à la valeur souhaitée
```

### Changer la position :
```css
/* Lignes 1653-1661 */
.messenger-popups {
  position: fixed;
  right: 16px;    /* Modifier pour changer la position horizontale */
  bottom: 16px;   /* Modifier pour changer la position verticale */
  /* ... */
}
```

### Ajouter un son :
```typescript
// Dans handleRealTimeMessage(), après ligne 1899
if (msg.senderId !== this.currentUserId) {
  // Jouer un son
  const audio = new Audio('/assets/sounds/notification.mp3');
  audio.play().catch(err => console.log('Audio play failed:', err));
  
  // ... reste du code
}
```

## ✅ Checklist de Test

- [ ] Notification s'affiche quand un message est reçu
- [ ] Notification ne s'affiche PAS pour mes propres messages
- [ ] Notification ne s'affiche PAS si la conversation est déjà ouverte
- [ ] Avatar de l'expéditeur est affiché correctement
- [ ] Nom de l'expéditeur est affiché
- [ ] Aperçu du message (120 caractères max) est affiché
- [ ] Notification disparaît après 10 secondes
- [ ] Cliquer sur la notification ouvre la conversation
- [ ] Cliquer sur le bouton X ferme la notification
- [ ] Plusieurs notifications peuvent s'empiler verticalement
- [ ] Les notifications sont au-dessus de tous les autres éléments (z-index: 9999)

## 🐛 Problèmes Courants

### Notification ne s'affiche pas :
1. Vérifier que `msg.senderId !== this.currentUserId`
2. Vérifier que la conversation n'est pas déjà sélectionnée
3. Vérifier que `incomingNotifications` est bien un tableau
4. Vérifier le CSS (z-index, position)

### Notification ne disparaît pas :
1. Vérifier le setTimeout (ligne 1900)
2. Vérifier que le filtre fonctionne correctement

### Clic sur notification ne fonctionne pas :
1. Implémenter la méthode `openFromNotification(n)` si elle n'existe pas
2. Vérifier que l'événement click est bien propagé

## 📝 Notes

- Le système utilise WebSocket pour la réception en temps réel
- Les notifications sont stockées dans `incomingNotifications: any[]`
- Chaque notification contient : `conversationId`, `senderName`, `preview`, `conv`
- Le système est compatible avec les messages directs et les groupes
