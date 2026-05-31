div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366F1,50:8B5CF6,100:A855F7&height=180&section=header&text=Gestion%20Pro%20%E2%80%94%20Frontend&fontSize=38&fontColor=ffffff&fontAlignY=40&desc=Enterprise%20Commercial%20Management%20Platform&descSize=16&descAlignY=62&descColor=e0d7ff" width="100%" />
</div>
<br/>
<div align="center">
<a href="https://angular.io/"><img src="https://img.shields.io/badge/Angular-15.2.10-DD0031?style=for-the-badge&logo=angular&logoColor=white"/></a> 
<a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-4.9.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/></a> 
<a href="https://material.angular.io/"><img src="https://img.shields.io/badge/Angular_Material-15.2.9-7C3AED?style=for-the-badge&logo=angular&logoColor=white"/></a> 
<a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white"/></a> 
<a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge"/></a>
<br/><br/>
  <p><b>Full-stack enterprise platform</b> — Angular 15 · Spring Boot 3 · MongoDB · Gemini AI</p>
  <p>Final Year Engineering Project @ <b>Centre National d'Informatique (CNI), Tunisia</b></p>
  <br/>
<a href="#">🚀 Live Demo</a>  · 
<a href="https://github.com/hamayari/Pfe-Backend">📦 Backend Repo</a>  · 
<a href="mailto:hamayari71@gmail.com">📬 Contact</a>
</div>

📌 Table of Contents

Overview
Key Metrics
Features
Tech Stack
Architecture
Installation
Roles & Permissions
Performance
Security
Deployment


🌐 Overview
Gestion Pro is a production-grade enterprise web application that manages the complete lifecycle of commercial conventions and billing, provides role-based analytical dashboards, enables real-time team messaging, and integrates an AI-powered decision-support chatbot — all in a single unified platform.
Built from scratch over 6 months at a national public institution using Agile Scrum methodology with full CI/CD pipelines, automated testing, and containerized deployment.

📊 Key Metrics
<div align="center">
🔗 70+ REST Endpoints🗄️ 44 MongoDB Entities⚙️ 95+ Backend Services🧩 50+ Angular Components🔐 6 User Roles🧪 95+ Unit Tests🐳 Docker + Jenkins CI/CD📊 Prometheus + Grafana
</div>

✨ Features
<details>
<summary>&nbsp;<b>🔐 Authentication & Security</b></summary>
<br/>

JWT Authentication — Secure token-based login with auto-refresh and expiry management
Two-Factor Auth (TOTP) — QR code scan + time-based one-time password validation
Angular Route Guards — Role-based protection on every route
Session Management — Automatic token refresh and silent logout on expiry
Password Recovery — Secure email-based reset flow
HTTP Interceptors — Automatic token injection on all outgoing requests
Audit Trail — Complete login and action history per user

</details>
<details>
<summary>&nbsp;<b>📊 Role-Based Dashboards</b></summary>
<br/>
👨‍💼 Admin Dashboard

Real-time system monitoring (CPU, RAM, Disk via Prometheus)
Full user CRUD with role assignment
Global KPIs, statistics, and nomenclature configuration
Complete audit logs and traceability

💼 Commercial Dashboard

Interactive sales pipeline and revenue tracking
Performance charts and conversion indicators
Payment deadline calendar and leaderboard

🎯 Decision Maker Dashboard

Real-time strategic KPIs and heatmaps
Advanced analytics and trend detection
AI Chatbot (Gemini AI) for natural language data analysis

📋 Project Manager Dashboard

Active project and task management
Team overview, shared calendar, and validation workflow

</details>
<details>
<summary>&nbsp;<b>📝 Convention Management</b></summary>
<br/>

Full CRUD with guided forms, inline editing, and validation
Paginated list with multi-filter, sorting, and advanced search
Geographic zone/region selection with autocomplete
Visual lifecycle workflow with colored status badges
Full modification timeline with versioning history
Data export to PDF, Excel, CSV

</details>
<details>
<summary>&nbsp;<b>💳 Smart Billing & OCR Validation</b></summary>
<br/>

Automatic invoice generation directly from conventions
Partial payment tracking with balance management
Tesseract OCR — automatic data extraction from uploaded payment proofs
Smart auto-matching of proofs to invoices
Color-coded delay indicators and multi-channel payment alerts

</details>
<details>
<summary>&nbsp;<b>💬 Real-Time Messaging (Slack-style)</b></summary>
<br/>

Bidirectional WebSocket communication via STOMP protocol
File attachments, emoji reactions, pinned messages
Typing indicators, online/offline user presence
Full-text message search, threaded replies, @mentions

</details>
<details>
<summary>&nbsp;<b>🤖 AI Chatbot — Powered by Gemini AI</b></summary>
<br/>

Natural language report generation and business queries
Predictive analytics and strategic recommendations
Dynamic on-the-fly chart generation
Context-aware intelligent search with conversation history
FR/EN multilingual support

</details>
<details>
<summary>&nbsp;<b>🔔 Notification Center & KPI Alerts</b></summary>
<br/>

Unified inbox for all notification types
Multi-channel delivery: Email (Brevo) · SMS (Twilio) · In-App · Web Push
Configurable thresholds with automatic alert triggering and escalation
Real-time browser push notifications with unread badge counter

</details>

🛠️ Tech Stack
Frontend
CategoryTechnologyVersionFrameworkAngular15.2.10LanguageTypeScript4.9.4UI LibraryAngular Material15.2.9Reactive ProgrammingRxJS7.8.0ChartingChart.js + ng2-charts4.4.0 / 4.1.1Maps & HeatmapsLeafletLatestCustom VisualizationD3.jsLatestReal-TimeWebSocket / STOMP—StylingSCSS / Material Design 3—PWAService Workers—
Backend (see Pfe-Backend)
CategoryTechnologyVersionFrameworkSpring Boot3.2.0LanguageJava17DatabaseMongoDB7.0AIGemini AI API—OCRTesseract5.4.0EmailBrevo / SMTP—SMSTwilio SDK8.31.1PaymentsStripe Java24.6.0CI/CDJenkins + Docker—API DocsSwagger / OpenAPI 3.0—MonitoringPrometheus + Grafana—TestingJUnit + Mockito + JaCoCo—

📁 Architecture
src/
├── app/
│   ├── auth/                        # Authentication (login, 2FA, password reset)
│   ├── dashboard/
│   │   ├── admin-dashboard/
│   │   ├── commercial-dashboard/
│   │   ├── decision-maker-dashboard/
│   │   └── project-manager-dashboard/
│   ├── features/
│   │   ├── convention-management/
│   │   ├── invoice-management/
│   │   ├── messaging-page/          # Real-time chat (WebSocket + STOMP)
│   │   ├── chatbot-decideur/        # Gemini AI chatbot
│   │   ├── monitoring-system/       # KPI monitoring
│   │   ├── payment-proofs/          # OCR validation
│   │   ├── reports/
│   │   └── predictive-analytics/
│   ├── services/                    # 60+ Angular services
│   ├── guards/                      # Role-based route guards
│   ├── models/                      # TypeScript interfaces
│   ├── shared/                      # Reusable components & pipes
│   └── core/                        # JWT interceptors, error handling
├── assets/
│   └── i18n/                        # Translation files (FR / EN)
└── environments/                    # Dev / Production config

🚀 Installation
Prerequisites

Node.js 18+ and npm 9+
Angular CLI 15.2.10
Git

Quick Start
bash# 1. Clone the repository
git clone https://github.com/hamayari/gestion-pro-frontend.git
cd gestion-pro-frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm start

App runs at http://localhost:4200
Backend must be running at http://localhost:8080

Environment Configuration
typescript// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  wsUrl: 'ws://localhost:8080/ws',
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  enableChatbot: true,
  enableNotifications: true,
  enableWebSocket: true,
  geminiApiKey: 'YOUR_GEMINI_API_KEY',
  enableMonitoring: true,
  metricsInterval: 30000
};
Available Scripts
bashnpm start              # Dev server — http://localhost:4200
npm run build          # Production build → dist/
npm run build:stats    # Build + bundle analyzer
npm run lint           # ESLint check
npm run lint:fix       # Auto-fix lint issues
npm run format         # Prettier formatting

👥 Roles & Permissions
RoleRouteAccess🔴 SUPER_ADMIN/adminFull system access + monitoring🟠 ADMIN/adminUser management + nomenclatures🟢 COMMERCIAL/commercialConventions + invoices + clients🔵 DECISION_MAKER/decideurAnalytics + KPIs + AI chatbot🟣 PROJECT_MANAGER/project-managerProjects + tasks + teams⚪ USER/homeRead-only view

📈 Performance
MetricTargetFirst Contentful Paint< 1.5sTime to Interactive< 3.5sLighthouse Score90+
Implemented optimizations:

✅ Lazy loading of all feature modules
✅ OnPush Change Detection strategy
✅ TrackBy in all *ngFor loops
✅ Virtual Scrolling for large datasets
✅ Image lazy loading
✅ Service Workers (PWA-ready)
✅ Bundle optimization, Tree shaking, AOT Compilation


🔒 Security

✅ JWT with auto-refresh and expiry management
✅ Role-based route guards on every protected page
✅ Input sanitization via DomSanitizer
✅ CSRF token protection
✅ Content Security Policy headers
✅ XSS Prevention
✅ Secure HTTP headers
✅ Client-side input validation on all forms


🐳 Deployment
Docker
bash# Build the image
docker build -t gestion-pro-frontend .

# Run the container
docker run -p 80:80 gestion-pro-frontend
Dockerfile
dockerfileFROM node:18-alpine AS build
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

♿ Accessibility

✅ ARIA labels on all interactive components
✅ Full keyboard navigation support
✅ WCAG AA color contrast compliance
✅ Screen reader friendly · Semantic HTML throughout


🤝 Contributing
bash# Fork → branch → commit → pull request
git checkout -b feature/YourFeature
git commit -m "feat: add YourFeature"
git push origin feature/YourFeature

📄 License
Distributed under the MIT License — see LICENSE for details.

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366F1,50:8B5CF6,100:A855F7&height=100&section=footer" width="100%"/>
  <br/>
  <b>Made with ❤️ by <a href="https://www.linkedin.com/in/mohamed-amine-ayari-34917b222">Mohamed Amine Ayari</a></b>
  <br/><br/>
  ⭐ If this project helped you, please give it a star — it means a lot!
</div>
