<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366F1,50:8B5CF6,100:A855F7&height=180&section=header&text=Gestion%20Pro%20%E2%80%94%20Frontend&fontSize=38&fontColor=ffffff&fontAlignY=40&desc=Enterprise%20Commercial%20Management%20Platform&descSize=16&descAlignY=62&descColor=e0d7ff" width="100%" />
</div>
<div align="center">

Full-stack enterprise platform — Angular 15 · Spring Boot 3 · MongoDB · Gemini AI
Final Year Engineering Project @ Centre National d'Informatique (CNI), Tunisia
🚀 Live Demo · 📦 Backend Repo · 📬 Contact
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
CategoryValue🔗 REST Endpoints70+🗄️ MongoDB Entities44⚙️ Backend Services95+🧩 Angular Components50+🔐 User Roles6🧪 Unit Tests95+🐳 DevOpsJenkins + Docker📊 MonitoringPrometheus + Grafana

✨ Features
<details>
<summary><b>🔐 Authentication & Security</b></summary>
<br/>
FeatureDescriptionJWT AuthenticationSecure token-based login with auto-refresh and expiry managementTwo-Factor Auth (TOTP)QR code scan + time-based one-time password validationAngular Route GuardsRole-based protection on every routeSession ManagementAutomatic token refresh and silent logout on expiryPassword RecoverySecure email-based reset flowHTTP InterceptorsAutomatic token injection on all outgoing requestsAudit TrailComplete login and action history per user
</details>
<details>
<summary><b>📊 Role-Based Dashboards</b></summary>
<br/>
RoleDashboard Features👨‍💼 AdminReal-time system monitoring (CPU, RAM, Disk via Prometheus), full user CRUD, global KPIs and nomenclature config💼 CommercialInteractive sales pipeline, revenue tracking, performance charts, payment deadline calendar🎯 Decision MakerStrategic KPIs, regional heatmaps, AI Chatbot (Gemini AI) for NL analysis and predictions📋 Project ManagerActive project and task management, team overview, shared calendar, validation workflow
</details>
<details>
<summary><b>📝 Convention Management</b></summary>
<br/>
FeatureDescriptionFull CRUDGuided forms, inline editing, and field validationAdvanced SearchPaginated list with multi-filter, sorting, and searchGeographic SelectionZone/region autocomplete selectionLifecycle WorkflowVisual status progression with colored badgesVersion HistoryFull modification timeline with versioningData ExportPDF · Excel · CSV
</details>
<details>
<summary><b>💳 Smart Billing & OCR Validation</b></summary>
<br/>
FeatureDescriptionInvoice GenerationAutomatic creation from conventionsPartial PaymentsPayment tracking with balance managementTesseract OCRAuto data extraction from uploaded payment proofsSmart MatchingAuto-matching of proofs to invoicesDelay IndicatorsColor-coded alerts with multi-channel payment notifications
</details>
<details>
<summary><b>💬 Real-Time Messaging (Slack-style)</b></summary>
<br/>
FeatureDescriptionWebSocket / STOMPBidirectional real-time communicationRich InteractionsFile attachments, emoji reactions, pinned messagesPresenceTyping indicators, online/offline user statusNavigationFull-text search, threaded replies, @mentions
</details>
<details>
<summary><b>🤖 AI Chatbot — Gemini AI</b></summary>
<br/>
FeatureDescriptionNatural LanguageReport generation and business queries in plain languagePredictive AnalyticsStrategic recommendations and forecastsDynamic ChartsOn-the-fly chart generation from queriesContext AwarenessConversation history with context-aware searchMultilingualFR / EN support
</details>
<details>
<summary><b>🔔 Notification Center & KPI Alerts</b></summary>
<br/>
ChannelDescriptionIn-AppUnified inbox for all notification typesEmailBrevo / SMTP integrationSMSTwilio integrationWeb PushBrowser push notificationsAlert EngineConfigurable thresholds with automatic triggering and escalation
</details>

🛠️ Tech Stack
🖥️ Frontend
CategoryTechnologyVersionFrameworkAngular15.2.10LanguageTypeScript4.9.4UI LibraryAngular Material15.2.9Reactive ProgrammingRxJS7.8.0ChartingChart.js + ng2-charts4.4.0 / 4.1.1Maps & HeatmapsLeafletLatestCustom VisualizationD3.jsLatestReal-TimeWebSocket / STOMP—StylingSCSS / Material Design 3—PWAService Workers—
⚙️ Backend (see Pfe-Backend)
CategoryTechnologyVersionFrameworkSpring Boot3.2.0LanguageJava17DatabaseMongoDB7.0AIGemini AI API—OCRTesseract5.4.0EmailBrevo / SMTP—SMSTwilio SDK8.31.1PaymentsStripe Java24.6.0CI/CDJenkins + Docker—API DocsSwagger / OpenAPI3.0MonitoringPrometheus + Grafana—TestingJUnit + Mockito + JaCoCo—

📁 Architecture
src/
│
├── app/
│   ├── 🔐 auth/                         # Login · 2FA · Password reset
│   │
│   ├── 📊 dashboard/
│   │   ├── admin-dashboard/             # System monitoring + user mgmt
│   │   ├── commercial-dashboard/        # Sales pipeline + revenue
│   │   ├── decision-maker-dashboard/    # KPIs + heatmaps + AI chatbot
│   │   └── project-manager-dashboard/  # Tasks + teams + calendar
│   │
│   ├── 🧩 features/
│   │   ├── convention-management/       # Convention lifecycle (CRUD)
│   │   ├── invoice-management/          # Billing + partial payments
│   │   ├── messaging-page/              # Real-time chat (WebSocket)
│   │   ├── chatbot-decideur/            # Gemini AI assistant
│   │   ├── monitoring-system/           # KPI widgets + alerts
│   │   ├── payment-proofs/              # OCR upload & validation
│   │   ├── reports/                     # Report generation
│   │   └── predictive-analytics/        # Forecasting & trends
│   │
│   ├── ⚙️  services/                    # 60+ Angular services
│   ├── 🛡️  guards/                      # Role-based route guards
│   ├── 📐 models/                       # TypeScript interfaces
│   ├── 🔁 shared/                       # Reusable components & pipes
│   └── 🔩 core/                         # JWT interceptors + error handling
│
├── assets/
│   └── i18n/                            # Translations — FR / EN
│
└── environments/                        # Dev / Production config

🚀 Installation
Prerequisites
ToolVersionNode.js18+npm9+Angular CLI15.2.10GitLatest
Quick Start
bash# Clone the repository
git clone https://github.com/hamayari/gestion-pro-frontend.git
cd gestion-pro-frontend

# Install dependencies
npm install

# Start the development server
npm start

✅ App runs at http://localhost:4200
⚠️ Backend must be running at http://localhost:8080

Environment Configuration
typescript// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  wsUrl:  'ws://localhost:8080/ws',
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  enableChatbot: true,
  enableNotifications: true,
  enableWebSocket: true,
  geminiApiKey: 'YOUR_GEMINI_API_KEY',   // ← replace with your key
  enableMonitoring: true,
  metricsInterval: 30000
};
Available Scripts
CommandDescriptionnpm startDev server → http://localhost:4200npm run buildProduction build → dist/npm run build:statsBuild + bundle analyzernpm run lintESLint checknpm run lint:fixAuto-fix lint issuesnpm run formatPrettier formatting

👥 Roles & Permissions
RoleRouteAccess Level🔴 SUPER_ADMIN/adminFull system access + monitoring🟠 ADMIN/adminUser management + nomenclatures🟢 COMMERCIAL/commercialConventions + invoices + clients🔵 DECISION_MAKER/decideurAnalytics + KPIs + AI chatbot🟣 PROJECT_MANAGER/project-managerProjects + tasks + teams⚪ USER/homeRead-only view

📈 Performance
Lighthouse Targets
MetricTargetFirst Contentful Paint< 1.5sTime to Interactive< 3.5sLighthouse Score90+
Optimizations Applied
OptimizationStatusLazy loading of all feature modules✅OnPush Change Detection strategy✅TrackBy in all *ngFor loops✅Virtual Scrolling for large datasets✅Image lazy loading✅Service Workers (PWA-ready)✅Bundle optimization · Tree shaking · AOT Compilation✅

🔒 Security
MeasureStatusJWT with auto-refresh and expiry management✅Role-based route guards on every protected page✅Input sanitization via DomSanitizer✅CSRF token protection✅Content Security Policy headers✅XSS Prevention · Secure HTTP headers✅Client-side input validation on all forms✅

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
FeatureStatusARIA labels on all interactive components✅Full keyboard navigation✅WCAG AA color contrast✅Screen reader friendly✅Semantic HTML throughout✅

🤝 Contributing
bashgit checkout -b feature/YourFeature
git commit -m "feat: add YourFeature"
git push origin feature/YourFeature
# → Open a Pull Request

📄 License
Distributed under the MIT License — see LICENSE for details.

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366F1,50:8B5CF6,100:A855F7&height=100&section=footer" width="100%"/>
  <br/>
  <b>Made with ❤️ by <a href="https://www.linkedin.com/in/mohamed-amine-ayari-34917b222">Mohamed Amine Ayari</a></b>
  <br/><br/>
  ⭐ If this project helped you, please give it a star — it means a lot!
</div>
