<div align="center">

# 🚀 Enterprise Management Platform - Frontend

### Modern Full-Stack Business Management & Invoicing Application

[![Angular](https://img.shields.io/badge/Angular-15.2.10-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Material](https://img.shields.io/badge/Material_UI-15.2.9-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)](https://material.angular.io/)
[![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)](https://rxjs.dev/)

[Live Demo](#) • [Documentation](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 🎯 Project Overview

**Enterprise-grade Angular application** featuring a sophisticated business management system with real-time communication, AI-powered analytics, and role-based dashboards. Built with modern web technologies and best practices for scalability, performance, and user experience.

### 🌟 Key Highlights

- 🎨 **50+ Reusable Components** - Modular Material Design architecture
- 👥 **4 Specialized Dashboards** - Role-based interfaces (Admin, Sales, Decision Maker, Project Manager)
- 🔐 **Enterprise Security** - JWT authentication with 2FA, route guards, and audit trails
- 💬 **Real-Time Messaging** - WebSocket-powered Slack-like communication
- 🤖 **AI Chatbot Integration** - Gemini AI for predictive analytics and insights
- 📊 **Advanced Data Visualization** - Chart.js, D3.js, interactive heatmaps
- 🌓 **Dark Mode Support** - Fully themed with Material Design 3
- 📱 **Responsive Design** - Mobile-first approach with PWA capabilities

---

## 📑 Table of Contents

- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Performance](#-performance--optimization)
- [Security](#-security)
- [Contributing](#-contributing)

---

## ✨ Core Features

### 🔐 Authentication & Security

<table>
<tr>
<td width="50%">

**Authentication System**
- 🔑 JWT token-based authentication
- � Two-Factor Authentication (2FA) with QR code
- 🔒 Role-based route guards
- 👤 Auto-refresh & session management
- 🔐 Password reset via email
- 🛡️ HTTP interceptors for token injection

</td>
<td width="50%">

**Security Features**
- 📊 Complete audit trail logging
- 🚫 XSS & CSRF protection
- 🔒 Secure HTTP headers
- ✅ Input validation & sanitization
- 🛡️ Content Security Policy
- 🔐 Encrypted local storage

</td>
</tr>
</table>

### 📊 Role-Based Dashboards

<details>
<summary><b>👨‍💼 Administrator Dashboard</b></summary>

- 📈 Real-time system monitoring
- 👥 Complete user management (CRUD)
- 📊 Global statistics & KPIs
- 🔧 Nomenclature configuration
- 📝 Audit logs & traceability
- ⚙️ System settings & permissions

</details>

<details>
<summary><b>💼 Sales Dashboard</b></summary>

- 📊 Interactive sales pipeline
- 💰 Revenue tracking & targets
- 📈 Performance charts
- 🎯 Conversion rate indicators
- 📅 Deadline calendar
- 🏆 Performance leaderboard

</details>

<details>
<summary><b>🎯 Decision Maker Dashboard</b></summary>

- 📊 Real-time strategic KPIs
- 🗺️ Interactive regional heatmaps
- 📈 Advanced analytics & trends
- 🤖 AI chatbot for analysis
- 📉 Predictive charts
- 💡 Automated insights & recommendations

</details>

<details>
<summary><b>📋 Project Manager Dashboard</b></summary>

- 📋 Active project tracking
- ✅ Task management & priorities
- 👥 Team overview
- 📅 Shared calendar
- 📊 Productivity metrics
- 🔄 Validation workflow

</details>

### 📝 Contract Management System

**Complete CRUD Interface**
- ✏️ Intuitive creation with guided forms & validation
- 📋 Paginated lists with advanced sorting & filtering
- 👁️ Detailed view with comprehensive information
- ✏️ Inline editing capabilities
- 🗑️ Secure deletion with confirmation

**Advanced Features**
- 🔄 Visual workflow with colored status badges
- 📅 Integrated calendar for deadline tracking
- 🗺️ Geographic selection with autocomplete
- 💰 Customizable payment terms
- 📜 Detailed history with versioning timeline
- 🔍 Advanced search with multiple filters
- 📊 Multi-format export (PDF, Excel, CSV)

### 💳 Intelligent Invoicing

**Generation & Management**
- 🤖 Automatic generation from contracts
- 📄 Auto-numbering with custom sequences
- 💵 Partial payment tracking
- 📊 Invoice status dashboard
- 📄 PDF preview & download

**OCR Validation**
- 📸 Drag & drop proof upload with preview
- 🔍 Automatic OCR data extraction
- ✅ Intelligent auto-validation & matching
- 📧 Visual reminders with color indicators
- 🔔 Real-time payment notifications

### 🔔 Unified Notification Center

**Centralized Management**
- 📬 Unified inbox for all notifications
- 🔔 Real-time browser push notifications
- 📱 Unread counter badge
- ⚙️ Preferences by channel & type
- 🔍 Advanced filtering (type, date, status)
- ✅ Quick actions (mark, archive, delete)

**Notification Types**
- 📧 Email notifications
- 📱 SMS alerts
- 🔔 In-app notifications
- 💬 Web push notifications
- 🎨 Contextual icons
- 📊 Searchable history archive

### 💬 Real-Time Messaging

**Slack-Style Interface**
- 🔌 Live WebSocket communication
- 💬 Organized conversations
- 📎 File upload & sharing
- 👍 Emoji reactions
- 📌 Pinned messages
- ⌨️ Typing indicators

**Advanced Features**
- 🔍 Full-text message search
- 👥 User presence (online/offline)
- 🔊 Customizable sound notifications
- 📝 Threaded replies
- @ User mentions
- 📜 Saved conversation history

### 📈 KPI & Alert Management

**Interactive Widgets**
- 📊 Chart.js visualizations (line, bar, pie)
- 📉 Custom D3.js visualizations
- 🚨 Visual threshold alerts
- 🔄 Task delegation & escalation
- 📉 Real-time auto-updates
- 💻 System monitoring (CPU, RAM, Disk)

**Configuration**
- 🎯 Customizable thresholds
- 📧 Alert recipient configuration
- 📱 Multi-channel alerts (Email, SMS, Push)
- 📊 Business & technical dashboards
- 🔔 Alert history tracking

### 🤖 AI-Powered Chatbot

**Intelligent Assistant**
- 🧠 Powered by Gemini AI
- 💬 Natural conversational interface
- 📊 Natural language report generation
- 🔮 Predictive analytics & insights
- 📈 Dynamic visualization generation

**Capabilities**
- 🎯 Contextual quick actions
- 📝 Conversation history & resume
- 🔍 Intelligent contextual search
- 💡 Proactive suggestions
- 🌐 Multi-language support (FR/EN)

### 🎨 Modern User Interface

**Design & UX**
- 🎨 Material Design 3 components
- 🌓 Dark/Light theme toggle
- 📱 Fully responsive (mobile, tablet, desktop)
- ♿ WCAG accessibility compliant
- 🎭 Smooth animations & micro-interactions

**Customization**
- 🎯 Optimized UX with visual feedback
- 🌈 Customizable themes & color palettes
- 🔤 Internationalization (FR/EN)
- 🎨 Consistent visual design system
- 📐 Flexible adaptive layouts

### 📊 Data Visualization & Reports

**Interactive Charts**
- 📈 Chart.js interactive charts
- 🗺️ Geographic heatmaps
- 📊 Advanced tables (sort, filter, pagination, export)
- 📉 Real-time WebSocket updates
- 📄 Multi-format export (PDF, Excel, CSV, PNG)

**Visual Indicators**
- 🎯 Progress gauges
- 🔢 Real-time counters
- 🏷️ Status badges
- 📊 Sparklines
- 📱 Responsive adaptation

---

## 🛠️ Tech Stack

### **Frontend Framework**
```
🅰️  Angular 15.2.10          📘  TypeScript 4.9.4
🎨  Angular Material 15.2.9   🔧  RxJS 7.8.0
```

### **UI & Styling**
```
🎨  Material Design 3         💅  SCSS/SASS
🎭  Angular Animations        📱  Flex Layout
🌈  Custom Theming System
```

### **Data Visualization**
```
📊  Chart.js 4.4.0           📈  ng2-charts 4.1.1
🗺️  Leaflet (Heatmaps)       🎯  D3.js (Custom)
```

### **Real-Time Communication**
```
🔌  WebSocket (STOMP)        🌐  HttpClient
📡  RxJS Observables         🔄  Live Updates
```

### **Forms & Validation**
```
📝  Reactive Forms           ✅  Custom Validators
🎯  Material Forms           🔍  Input Masking
```

### **Security & Auth**
```
🔐  JWT Interceptors         🛡️  Route Guards
🔒  CSRF Protection          🚫  XSS Prevention
```

---

## 📁 Project Architecture

```
src/
├── 📂 app/
│   ├── 📂 auth/                          # Authentication Module
│   │   ├── login/                        # Login page with 2FA
│   │   ├── forgot-password/              # Password reset
│   │   └── reset-password/               # New password setup
│   │
│   ├── 📂 dashboard/                     # Role-Based Dashboards
│   │   ├── admin-dashboard/              # Admin control panel
│   │   ├── commercial-dashboard/         # Sales dashboard
│   │   ├── decision-maker-dashboard/     # Executive analytics
│   │   └── project-manager-dashboard/    # Project management
│   │
│   ├── 📂 features/                      # Feature Modules
│   │   ├── convention-management/        # Contract management
│   │   ├── invoice-management/           # Invoicing system
│   │   ├── messaging-page/               # Real-time chat
│   │   ├── chatbot-decideur/             # AI chatbot
│   │   ├── monitoring-system/            # KPI monitoring
│   │   ├── user-management/              # User CRUD
│   │   ├── nomenclature-management/      # System config
│   │   ├── notification-settings/        # Notification prefs
│   │   ├── payment-proofs/               # Payment validation
│   │   ├── reports/                      # Report generation
│   │   └── predictive-analytics/         # AI analytics
│   │
│   ├── 📂 core/                          # Core Services
│   │   ├── services/                     # 60+ Services
│   │   │   ├── auth.service.ts           # Authentication
│   │   │   ├── convention.service.ts     # Contracts
│   │   │   ├── invoice.service.ts        # Invoices
│   │   │   ├── messaging.service.ts      # Chat
│   │   │   ├── websocket.service.ts      # WebSocket
│   │   │   ├── notification.service.ts   # Notifications
│   │   │   ├── chatbot.service.ts        # AI Chatbot
│   │   │   └── kpi-alert.service.ts      # KPI Alerts
│   │   │
│   │   ├── interceptors/                 # HTTP Interceptors
│   │   │   ├── jwt.interceptor.ts        # JWT injection
│   │   │   └── error.interceptor.ts      # Error handling
│   │   │
│   │   ├── guards/                       # Route Guards
│   │   │   ├── auth.guard.ts             # Auth protection
│   │   │   ├── admin.guard.ts            # Admin only
│   │   │   ├── commercial.guard.ts       # Sales only
│   │   │   ├── decision-maker.guard.ts   # Executive only
│   │   │   └── project-manager.guard.ts  # PM only
│   │   │
│   │   └── models/                       # TypeScript Interfaces
│   │       ├── user.model.ts             # User model
│   │       ├── convention.model.ts       # Contract model
│   │       ├── invoice.model.ts          # Invoice model
│   │       └── message.model.ts          # Message model
│   │
│   ├── 📂 shared/                        # Shared Components
│   │   ├── components/                   # Reusable components
│   │   ├── pipes/                        # Custom pipes
│   │   └── modules/                      # Shared modules
│   │
│   └── 📂 layouts/                       # Layout Components
│       ├── admin-layout/                 # Admin layout
│       ├── dashboard/                    # Dashboard layout
│       └── unified-layout/               # Unified layout
│
├── 📂 assets/                            # Static Resources
│   ├── images/                           # Images
│   ├── icons/                            # Icons
│   └── i18n/                             # Translations (FR/EN)
│
├── 📂 environments/                      # Environment Config
│   ├── environment.ts                    # Development
│   └── environment.prod.ts               # Production
│
└── 📂 styles/                            # Global Styles
    ├── _variables.scss                   # SCSS variables
    ├── _themes.scss                      # Theme definitions
    └── styles.scss                       # Main styles
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18+ and **npm** 9+
- **Angular CLI** 15.2.10
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/hamayari/Pfe-Frontend.git
cd Pfe-Frontend

# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at `http://localhost:4200`

### Production Build

```bash
# Optimized production build
npm run build

# Build with bundle analysis
npm run build:stats
```

Production files will be in the `dist/` folder

---

## ⚙️ Configuration

### Environment Setup

Create or modify `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  wsUrl: 'ws://localhost:8080/ws',
  
  // JWT Configuration
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  
  // Feature Flags
  enableChatbot: true,
  enableNotifications: true,
  enableWebSocket: true,
  
  // Gemini AI Configuration
  geminiApiKey: 'YOUR_GEMINI_API_KEY',
  
  // Monitoring
  enableMonitoring: true,
  metricsInterval: 30000
};
```

### Backend Configuration

Ensure the backend API is running and accessible at `http://localhost:8080`

---

## 📚 Available Scripts

```bash
# Development
npm start                    # Dev server on port 4200
npm run start:prod           # Production mode locally

# Build
npm run build                # Production build
npm run build:stats          # Build with bundle analysis

# Code Quality
npm run lint                 # Run ESLint
npm run lint:fix             # Auto-fix linting issues
npm run format               # Format with Prettier
```

---

## 🎨 Theming & Customization

### Toggle Theme

```typescript
// In app.component.ts
toggleTheme() {
  this.isDarkMode = !this.isDarkMode;
  document.body.classList.toggle('dark-theme');
}
```

### Custom Colors

```scss
// In styles/_themes.scss
$primary: mat.define-palette(mat.$indigo-palette);
$accent: mat.define-palette(mat.$pink-palette);
$warn: mat.define-palette(mat.$red-palette);
```

---

## 👥 User Roles & Permissions

| Role | Route | Access Level |
|------|-------|-------------|
| 🔴 **SUPER_ADMIN** | `/admin` | Full system access, monitoring |
| 🟠 **ADMIN** | `/admin` | User management, nomenclatures |
| 🟢 **COMMERCIAL** | `/commercial` | Contracts, invoices, clients |
| 🔵 **DECISION_MAKER** | `/decideur` | Analytics, KPIs, AI chatbot |
| 🟣 **PROJECT_MANAGER** | `/project-manager` | Projects, tasks, teams |
| ⚪ **USER** | `/home` | Read-only access |

---

## 🔌 Backend Integration

### API Configuration

```typescript
// In core/services/api.service.ts
private readonly API_URL = environment.apiUrl;

// Main endpoints
AUTH_ENDPOINT = `${this.API_URL}/auth`;
CONVENTIONS_ENDPOINT = `${this.API_URL}/conventions`;
INVOICES_ENDPOINT = `${this.API_URL}/invoices`;
NOTIFICATIONS_ENDPOINT = `${this.API_URL}/notifications`;
MESSAGES_ENDPOINT = `${this.API_URL}/messages`;
```

### WebSocket Connection

```typescript
// In services/websocket.service.ts
connect() {
  const socket = new SockJS(`${environment.wsUrl}/chat`);
  this.stompClient = Stomp.over(socket);
  
  this.stompClient.connect({}, () => {
    this.subscribeToTopics();
  });
}
```

---

## 📊 Performance & Optimization

### Implemented Optimizations

<table>
<tr>
<td width="50%">

**Code Optimization**
- ✅ Lazy loading modules
- ✅ OnPush change detection
- ✅ TrackBy in ngFor loops
- ✅ Virtual scrolling for large lists
- ✅ AOT compilation

</td>
<td width="50%">

**Asset Optimization**
- ✅ Image lazy loading
- ✅ Service Workers (PWA ready)
- ✅ Bundle optimization
- ✅ Tree shaking
- ✅ Code splitting

</td>
</tr>
</table>

### Performance Targets

- ⚡ First Contentful Paint: **< 1.5s**
- 🚀 Time to Interactive: **< 3.5s**
- 💯 Lighthouse Score: **90+**

---

## 🐳 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t enterprise-management-frontend .

# Run container
docker run -p 80:80 enterprise-management-frontend
```

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist/frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### CI/CD Pipeline

The project includes configuration for:
- ✅ Automated testing
- ✅ Linting & code quality checks
- ✅ Docker image building
- ✅ Automated deployment

---

## 🔒 Security

### Security Features

<table>
<tr>
<td width="50%">

**Authentication & Authorization**
- 🔐 JWT with auto-refresh
- 🛡️ Route guards on all protected pages
- 🔒 Role-based access control (RBAC)
- 📊 Complete audit trail

</td>
<td width="50%">

**Data Protection**
- 🚫 XSS prevention
- 🔒 CSRF tokens
- 🛡️ Content Security Policy
- ✅ Input validation & sanitization
- 🔐 Secure HTTP headers

</td>
</tr>
</table>

---

## ♿ Accessibility

### WCAG Compliance

- ✅ ARIA labels on all interactive components
- ✅ Full keyboard navigation support
- ✅ Color contrast compliance (WCAG AA)
- ✅ Visible focus indicators
- ✅ Screen reader friendly
- ✅ Semantic HTML structure
- ✅ Alt text on all images

---

## 🌍 Internationalization

### Supported Languages

- 🇫🇷 **French** (default)
- 🇬🇧 **English**

### Adding a New Language

```typescript
// In assets/i18n/
// Create language files: fr.json, en.json
{
  "COMMON": {
    "SAVE": "Save",
    "CANCEL": "Cancel",
    "DELETE": "Delete"
  },
  "AUTH": {
    "LOGIN": "Login",
    "LOGOUT": "Logout"
  }
}
```

---

## 📱 Progressive Web App

### PWA Features

- ✅ Service Worker for offline support
- ✅ Web App Manifest
- ✅ Offline mode capabilities
- ✅ Install prompt
- ✅ Push notifications
- ✅ App icons for all platforms

---

## � Testing

### Testing Strategy

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run e2e

# Generate coverage report
npm run test:coverage
```

### Test Coverage

- Unit tests for services and components
- Integration tests for feature modules
- E2E tests for critical user flows

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the project
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Code Style

- Follow Angular style guide
- Use Prettier for formatting
- Run ESLint before committing
- Write meaningful commit messages

---

## � License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## 📧 Contact

**Project Maintainer:** [Your Name]

- 📧 Email: your.email@example.com
- 💼 LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- 🐙 GitHub: [@hamayari](https://github.com/hamayari)

---

## 🙏 Acknowledgments

- Angular team for the amazing framework
- Material Design team for the UI components
- All contributors who helped improve this project

---

<div align="center">

## 🌟 Project Highlights for Recruiters

### **Why This Project Stands Out**

| Category | Achievement |
|----------|-------------|
| 🏗️ **Architecture** | Clean, scalable architecture with 50+ reusable components |
| 🔐 **Security** | Enterprise-grade security with JWT, 2FA, and RBAC |
| 📊 **Complexity** | 4 specialized dashboards, real-time features, AI integration |
| 🎨 **UI/UX** | Modern Material Design 3 with dark mode and accessibility |
| ⚡ **Performance** | Optimized with lazy loading, virtual scrolling, PWA |
| 🧪 **Quality** | Comprehensive testing, linting, and CI/CD pipeline |
| 🌐 **Integration** | WebSocket, REST API, OCR, AI chatbot (Gemini) |
| 📱 **Responsive** | Mobile-first design, works on all devices |

### **Technical Skills Demonstrated**

```
Angular 15 • TypeScript • RxJS • Material Design • WebSocket
Chart.js • D3.js • JWT Authentication • Route Guards • Interceptors
Reactive Forms • State Management • PWA • Docker • CI/CD
SCSS/SASS • Responsive Design • Accessibility • i18n
```

---

### ⭐ If this project helps you, please give it a star!

**Built with ❤️ for modern enterprise management**

[![GitHub stars](https://img.shields.io/github/stars/hamayari/Pfe-Frontend?style=social)](https://github.com/hamayari/Pfe-Frontend)
[![GitHub forks](https://img.shields.io/github/forks/hamayari/Pfe-Frontend?style=social)](https://github.com/hamayari/Pfe-Frontend/fork)

</div>
