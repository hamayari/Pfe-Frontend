<div align="center">

# 🎨 Gestion Pro - Frontend

### Application Web Moderne pour la Gestion Commerciale & Facturation

[![Angular](https://img.shields.io/badge/Angular-15.2.10-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue.svg)](https://www.typescriptlang.org/)
[![Material](https://img.shields.io/badge/Material-15.2.9-purple.svg)](https://material.angular.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 📋 Vue d'Ensemble

Application web moderne et responsive construite avec Angular 15, offrant une expérience utilisateur fluide et intuitive pour la gestion commerciale complète. Interface Material Design avec plus de 50 composants réutilisables et 4 dashboards spécialisés par rôle.

---

## ✨ Fonctionnalités Principales

### 🔐 Authentification & Sécurité
- 🔑 **Connexion JWT** - Authentification sécurisée avec tokens
- 📱 **2FA Intégré** - Scan QR code et validation TOTP
- 🔒 **Guards Angular** - Protection des routes par rôle
- 👤 **Gestion de Session** - Auto-refresh et déconnexion automatique
- 🔐 **Mot de Passe Oublié** - Réinitialisation par email
- 🛡️ **Intercepteurs HTTP** - Injection automatique des tokens
- 📊 **Audit Trail** - Historique complet des connexions

### 📊 Dashboards Spécialisés par Rôle

#### 👨‍💼 Dashboard Administrateur
- 📈 Monitoring système en temps réel
- 👥 Gestion complète des utilisateurs
- 📊 Statistiques globales et KPIs
- 🔧 Configuration des nomenclatures
- 📝 Logs d'audit et traçabilité
- ⚙️ Paramètres système

#### 💼 Dashboard Commercial
- 📊 Pipeline de ventes interactif
- 💰 Suivi des revenus et objectifs
- 📈 Graphiques de performance
- 🎯 Indicateurs de conversion
- 📅 Calendrier des échéances
- 🏆 Classement des performances

#### 🎯 Dashboard Décideur
- 📊 KPIs stratégiques en temps réel
- 🗺️ Heatmaps régionales interactives
- 📈 Analytics avancés et tendances
- 🤖 Chatbot IA pour analyses
- 📉 Graphiques prédictifs
- 💡 Insights et recommandations

#### 📋 Dashboard Chef de Projet
- 📋 Suivi des projets en cours
- ✅ Gestion des tâches et priorités
- 👥 Vue d'ensemble des équipes
- 📅 Calendrier partagé
- 📊 Métriques de productivité
- 🔄 Workflow de validation

### 📝 Gestion des Conventions

#### Interface CRUD Complète
- ✏️ **Création Intuitive** - Formulaires guidés avec validation
- 📋 **Liste Paginée** - Tri, filtrage et recherche avancée
- 👁️ **Vue Détaillée** - Toutes les informations en un coup d'œil
- ✏️ **Édition Rapide** - Modification en ligne
- 🗑️ **Suppression Sécurisée** - Confirmation avant suppression

#### Fonctionnalités Avancées
- 🔄 **Workflow Visuel** - Suivi du cycle de vie avec badges colorés
- 📅 **Calendrier Intégré** - Vue chronologique des échéances
- 🗺️ **Sélection Géographique** - Zones et gouvernorats avec autocomplete
- 💰 **Configuration Paiements** - Termes et conditions personnalisables
- 📜 **Historique Détaillé** - Timeline des modifications avec versioning
- 🔍 **Recherche Avancée** - Filtres multiples et tri dynamique
- 📊 **Export de Données** - PDF, Excel, CSV

### 💳 Facturation Intelligente

#### Génération & Gestion
- 🤖 **Génération Automatique** - Création depuis conventions
- 📄 **Numérotation Auto** - Séquence personnalisable
- 💵 **Paiements Partiels** - Suivi des montants et soldes
- 📊 **Dashboard Factures** - Vue d'ensemble des statuts
- 📄 **Prévisualisation PDF** - Génération et téléchargement

#### Validation OCR
- 📸 **Upload Preuves** - Drag & drop avec prévisualisation
- 🔍 **Extraction OCR** - Lecture automatique des données
- ✅ **Validation Auto** - Matching intelligent
- 📧 **Rappels Visuels** - Indicateurs de retard avec couleurs
- 🔔 **Notifications** - Alertes sur nouveaux paiements

### 🔔 Centre de Notifications

#### Gestion Unifiée
- 📬 **Inbox Unifié** - Toutes les notifications centralisées
- 🔔 **Push Navigateur** - Alertes en temps réel
- 📱 **Badge Compteur** - Nombre de non lues
- ⚙️ **Préférences** - Configuration par canal et type
- 🔍 **Filtrage Avancé** - Par type, date, statut
- ✅ **Actions Rapides** - Marquer, archiver, supprimer

#### Types de Notifications
- 📧 **Email** - Notifications importantes
- 📱 **SMS** - Alertes urgentes
- 🔔 **In-App** - Notifications intégrées
- 💬 **Push Web** - Alertes navigateur
- 🎨 **Icônes Contextuelles** - Visuels adaptés
- 📊 **Historique** - Archive consultable

### 💬 Messagerie Temps Réel

#### Interface Type Slack
- 🔌 **WebSocket Live** - Communication instantanée
- 💬 **Conversations** - Discussions organisées
- 📎 **Pièces Jointes** - Upload et partage de fichiers
- 👍 **Réactions Emoji** - Interactions rapides
- 📌 **Messages Épinglés** - Mise en avant
- ⌨️ **Indicateurs de Frappe** - "X est en train d'écrire..."

#### Fonctionnalités Avancées
- 🔍 **Recherche Messages** - Full-text search
- 👥 **Présence Utilisateurs** - Statuts en ligne/hors ligne
- 🔊 **Notifications Sonores** - Alertes audio personnalisables
- 📝 **Threads** - Réponses organisées
- @ **Mentions** - Notifications ciblées
- 📜 **Historique** - Conversations sauvegardées

### 📈 KPI & Alertes

#### Widgets Interactifs
- 📊 **Graphiques Chart.js** - Lignes, barres, camemberts
- 📉 **Graphiques D3.js** - Visualisations personnalisées
- 🚨 **Alertes Visuelles** - Dépassement de seuils
- 🔄 **Délégation** - Assignation et escalade
- 📉 **Temps Réel** - Mise à jour automatique
- 💻 **Monitoring Système** - CPU, RAM, Disque

#### Configuration
- 🎯 **Seuils Personnalisables** - Définition des limites
- 📧 **Destinataires** - Configuration des alertes
- 📱 **Multi-Canal** - Email, SMS, Push
- 📊 **Tableaux de Bord** - Métriques business et techniques
- 🔔 **Historique Alertes** - Suivi des déclenchements

### 🤖 Chatbot IA Intégré

#### Assistant Intelligent
- 🧠 **Powered by Gemini AI** - Intelligence artificielle avancée
- 💬 **Interface Conversationnelle** - Chat naturel et intuitif
- 📊 **Génération de Rapports** - Demandes en langage naturel
- 🔮 **Analyses Prédictives** - Insights et recommandations
- 📈 **Visualisations Dynamiques** - Graphiques générés à la volée

#### Capacités
- 🎯 **Actions Contextuelles** - Boutons d'action rapide
- 📝 **Historique Conversations** - Sauvegarde et reprise
- 🔍 **Recherche Intelligente** - Compréhension du contexte
- 💡 **Suggestions Proactives** - Recommandations automatiques
- 🌐 **Multi-Langues** - Support FR/EN

### 🎨 Interface Utilisateur

#### Design & UX
- 🎨 **Material Design 3** - Composants modernes et élégants
- 🌓 **Mode Sombre** - Thème clair/sombre avec switch
- 📱 **Responsive** - Adapté mobile, tablette, desktop
- ♿ **Accessible** - ARIA labels et navigation clavier
- 🎭 **Animations Fluides** - Transitions et micro-interactions

#### Personnalisation
- 🎯 **UX Optimisée** - Feedback visuel et états de chargement
- 🌈 **Thèmes Personnalisables** - Couleurs et styles configurables
- 🔤 **Internationalisation** - Support multi-langues (FR/EN)
- 🎨 **Palette de Couleurs** - Cohérence visuelle
- 📐 **Layout Flexible** - Adaptation automatique

### 📊 Visualisations & Rapports

#### Graphiques Interactifs
- 📈 **Chart.js** - Graphiques interactifs (lignes, barres, camemberts)
- 🗺️ **Heatmaps** - Visualisation géographique des données
- 📊 **Tableaux Avancés** - Tri, filtrage, pagination, export
- 📉 **Temps Réel** - Mise à jour automatique via WebSocket
- 📄 **Export Multi-Format** - PDF, Excel, CSV, PNG

#### Indicateurs Visuels
- 🎯 **Jauges** - Indicateurs de progression
- 🔢 **Compteurs** - Métriques en temps réel
- 🏷️ **Badges** - Statuts et notifications
- 📊 **Sparklines** - Mini-graphiques
- 📱 **Responsive** - Adaptation automatique à l'écran

### 🔧 Fonctionnalités Avancées

#### Gestion Complète
- 📅 **Calendrier Intégré** - Gestion d'événements et rappels
- ✅ **Gestion de Tâches** - Todo lists avec priorités
- 👥 **Gestion Utilisateurs** - CRUD complet avec permissions
- 🏢 **Nomenclatures** - Configuration des structures et zones
- 📝 **Audit Logs** - Historique des actions utilisateurs

#### Optimisations
- 🔍 **Recherche Globale** - Recherche cross-module
- 💾 **Cache Intelligent** - Optimisation des performances
- 🔄 **Auto-Save** - Sauvegarde automatique des formulaires
- ⚡ **Lazy Loading** - Chargement à la demande
- 🎯 **Virtual Scrolling** - Listes optimisées

---

## 🛠️ Stack Technique

### Core Framework
```
🅰️ Angular 15.2.10
📘 TypeScript 4.9.4
🎨 Angular Material 15.2.9
🔧 RxJS 7.8.0
```

### UI & Styling
```
🎨 Material Design 3
💅 SCSS/SASS
🎭 Angular Animations
📱 Flex Layout
🌈 Custom Theming
```

### Graphiques & Visualisation
```
📊 Chart.js 4.4.0
📈 ng2-charts 4.1.1
🗺️ Leaflet (Heatmaps)
🎯 D3.js (Custom viz)
```

### Communication
```
🔌 WebSocket (STOMP)
🌐 HttpClient
📡 RxJS Observables
🔄 Real-time Updates
```

### Formulaires & Validation
```
📝 Reactive Forms
✅ Custom Validators
🎯 Angular Material Forms
🔍 Input Masking
```

### Sécurité
```
🔐 JWT Interceptors
🛡️ Route Guards
🔒 CSRF Protection
🚫 XSS Prevention
```

---

## 📁 Architecture du Projet

```
src/
├── 📂 app/
│   ├── 📂 auth/                    # Authentification
│   │   ├── login/                  # Page de connexion
│   │   ├── forgot-password/        # Réinitialisation
│   │   └── reset-password/         # Nouveau mot de passe
│   │
│   ├── 📂 dashboard/               # Dashboards par rôle
│   │   ├── admin-dashboard/        # Dashboard Admin
│   │   ├── commercial-dashboard/   # Dashboard Commercial
│   │   ├── decision-maker-dashboard/ # Dashboard Décideur
│   │   └── project-manager-dashboard/ # Dashboard Chef de Projet
│   │
│   ├── 📂 features/                # Modules fonctionnels
│   │   ├── convention-management/  # Gestion conventions
│   │   ├── invoice-management/     # Gestion factures
│   │   ├── messaging-page/         # Messagerie temps réel
│   │   ├── chatbot-decideur/       # Chatbot IA
│   │   ├── monitoring-system/      # Monitoring & KPIs
│   │   ├── user-management/        # Gestion utilisateurs
│   │   ├── nomenclature-management/# Nomenclatures
│   │   ├── notification-settings/  # Préférences notifications
│   │   ├── payment-proofs/         # Preuves de paiement
│   │   ├── reports/                # Génération rapports
│   │   └── predictive-analytics/   # Analytics prédictifs
│   │
│   ├── 📂 services/                # Services (60+)
│   │   ├── auth.service.ts         # Authentification
│   │   ├── convention.service.ts   # Conventions
│   │   ├── invoice.service.ts      # Factures
│   │   ├── messaging.service.ts    # Messagerie
│   │   ├── websocket.service.ts    # WebSocket
│   │   ├── notification.service.ts # Notifications
│   │   ├── chatbot.service.ts      # Chatbot
│   │   ├── kpi-alert.service.ts    # KPI & Alertes
│   │   └── ...                     # Autres services
│   │
│   ├── 📂 guards/                  # Route guards
│   │   ├── auth.guard.ts           # Protection authentification
│   │   ├── admin.guard.ts          # Protection admin
│   │   ├── commercial.guard.ts     # Protection commercial
│   │   ├── decision-maker.guard.ts # Protection décideur
│   │   └── project-manager.guard.ts# Protection chef de projet
│   │
│   ├── 📂 models/                  # Interfaces TypeScript
│   │   ├── user.model.ts           # Modèle utilisateur
│   │   ├── convention.model.ts     # Modèle convention
│   │   ├── invoice.model.ts        # Modèle facture
│   │   ├── message.model.ts        # Modèle message
│   │   └── ...                     # Autres modèles
│   │
│   ├── 📂 shared/                  # Composants réutilisables
│   │   ├── components/             # Composants partagés
│   │   ├── pipes/                  # Pipes personnalisés
│   │   └── modules/                # Modules partagés
│   │
│   ├── 📂 core/                    # Services core
│   │   ├── interceptors/           # HTTP interceptors
│   │   │   ├── jwt.interceptor.ts  # Injection JWT
│   │   │   └── error.interceptor.ts# Gestion erreurs
│   │   └── services/               # Services core
│   │
│   └── 📂 layouts/                 # Layouts
│       ├── admin-layout/           # Layout admin
│       ├── dashboard/              # Layout dashboard
│       └── unified-layout/         # Layout unifié
│
├── 📂 assets/                      # Ressources statiques
│   ├── images/                     # Images
│   ├── icons/                      # Icônes
│   └── i18n/                       # Traductions
│
├── 📂 environments/                # Configuration
│   ├── environment.ts              # Dev
│   └── environment.prod.ts         # Production
│
└── 📂 styles/                      # Styles globaux
    ├── _variables.scss             # Variables
    ├── _themes.scss                # Thèmes
    └── styles.scss                 # Styles principaux
```

---

## 🚀 Installation & Démarrage

### Prérequis
- Node.js 18+ et npm 9+
- Angular CLI 15.2.10
- Git

### Installation

```bash
# Cloner le repository
git clone https://github.com/hamayari/Pfe-Frontend.git
cd Pfe-Frontend

# Installer les dépendances
npm install

# Lancer en mode développement
npm start
```

L'application sera accessible sur `http://localhost:4200`

### Build Production

```bash
# Build optimisé
npm run build

# Build avec analyse de bundle
npm run build:stats
```

Les fichiers de production seront dans le dossier `dist/`

---

## ⚙️ Configuration

### Fichier environment.ts

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  wsUrl: 'ws://localhost:8080/ws',
  
  // JWT Configuration
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  
  // Features Flags
  enableChatbot: true,
  enableNotifications: true,
  enableWebSocket: true,
  
  // Gemini AI
  geminiApiKey: 'YOUR_GEMINI_API_KEY',
  
  // Monitoring
  enableMonitoring: true,
  metricsInterval: 30000
};
```

### Configuration Backend

Assurez-vous que le backend est configuré et accessible sur `http://localhost:8080`

---

## 📚 Scripts Disponibles

```bash
# Développement
npm start                    # Serveur dev sur port 4200
npm run start:prod           # Mode production local

# Build
npm run build                # Build production
npm run build:stats          # Build avec analyse bundle

# Qualité
npm run lint                 # ESLint
npm run lint:fix             # Fix automatique
npm run format               # Prettier
```

---

## 🎨 Thèmes & Personnalisation

### Changer le Thème

```typescript
// Dans app.component.ts
toggleTheme() {
  this.isDarkMode = !this.isDarkMode;
  document.body.classList.toggle('dark-theme');
}
```

### Couleurs Personnalisées

```scss
// Dans styles/themes.scss
$primary: mat.define-palette(mat.$indigo-palette);
$accent: mat.define-palette(mat.$pink-palette);
$warn: mat.define-palette(mat.$red-palette);
```

---

## 👥 Rôles & Permissions

| Rôle | Route | Fonctionnalités |
|------|-------|-----------------|
| 🔴 **SUPER_ADMIN** | `/admin` | Accès complet, monitoring système |
| 🟠 **ADMIN** | `/admin` | Gestion utilisateurs, nomenclatures |
| 🟢 **COMMERCIAL** | `/commercial` | Conventions, factures, clients |
| 🔵 **DECISION_MAKER** | `/decideur` | Analytics, KPIs, chatbot IA |
| 🟣 **PROJECT_MANAGER** | `/project-manager` | Projets, tâches, équipes |
| ⚪ **USER** | `/home` | Vue lecture seule |

---

## 🔌 Intégration Backend

### Configuration API

```typescript
// Dans core/services/api.service.ts
private readonly API_URL = environment.apiUrl;

// Endpoints principaux
AUTH_ENDPOINT = `${this.API_URL}/auth`;
CONVENTIONS_ENDPOINT = `${this.API_URL}/conventions`;
INVOICES_ENDPOINT = `${this.API_URL}/invoices`;
NOTIFICATIONS_ENDPOINT = `${this.API_URL}/notifications`;
MESSAGES_ENDPOINT = `${this.API_URL}/messages`;
```

### WebSocket Connection

```typescript
// Dans services/websocket.service.ts
connect() {
  const socket = new SockJS(`${environment.wsUrl}/chat`);
  this.stompClient = Stomp.over(socket);
  
  this.stompClient.connect({}, () => {
    this.subscribeToTopics();
  });
}
```

---

## 📊 Performance

### Optimisations Implémentées
- ✅ Lazy Loading des modules
- ✅ OnPush Change Detection
- ✅ TrackBy dans les ngFor
- ✅ Virtual Scrolling pour grandes listes
- ✅ Image lazy loading
- ✅ Service Workers (PWA ready)
- ✅ Bundle optimization
- ✅ Tree shaking
- ✅ AOT Compilation

### Métriques Cibles
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: 90+

---

## 🐳 Déploiement

### Docker

```bash
# Build l'image
docker build -t gestion-pro-frontend .

# Lancer le container
docker run -p 80:80 gestion-pro-frontend
```

### Dockerfile

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🔒 Sécurité

### Bonnes Pratiques Implémentées
- ✅ JWT avec auto-refresh
- ✅ Route guards sur toutes les pages protégées
- ✅ Sanitization des inputs (DomSanitizer)
- ✅ CSRF tokens
- ✅ Content Security Policy
- ✅ XSS Prevention
- ✅ Secure HTTP headers
- ✅ Input validation côté client

---

## ♿ Accessibilité

### Standards Respectés
- ✅ ARIA labels sur tous les composants interactifs
- ✅ Navigation clavier complète
- ✅ Contraste des couleurs (WCAG AA)
- ✅ Focus indicators visibles
- ✅ Screen reader friendly
- ✅ Semantic HTML
- ✅ Alt text sur les images

---

## 🌍 Internationalisation

### Langues Supportées
- 🇫🇷 Français (par défaut)
- 🇬🇧 Anglais

### Ajouter une Langue

```typescript
// Dans assets/i18n/
// Créer fr.json et en.json
{
  "COMMON": {
    "SAVE": "Enregistrer",
    "CANCEL": "Annuler"
  }
}
```

---

## 📱 Progressive Web App

### Fonctionnalités PWA
- ✅ Service Worker
- ✅ Manifest.json
- ✅ Offline mode
- ✅ Install prompt
- ✅ Push notifications
- ✅ App icons

---

## 🤝 Contribution

Les contributions sont les bienvenues! Veuillez suivre ces étapes:

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

<div align="center">

### ⭐ Si ce projet vous aide, n'hésitez pas à lui donner une étoile!

**Développé avec ❤️ pour une gestion commerciale moderne et efficace**

</div>
