<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366F1,50:8B5CF6,100:A855F7&height=200&section=header&text=Gestion%20Pro&fontSize=52&fontColor=ffffff&fontAlignY=38&desc=Enterprise%20Commercial%20Management%20Platform&descSize=18&descAlignY=58&descColor=e0d7ff" width="100%" />
</div>
<div align="center">
Show Image 
Show Image 
Show Image 
Show Image 
Show Image 
Show Image
<br/>

Full-stack enterprise platform built over 6 months using Agile Scrum
Final Year Engineering Project @ Centre National d'Informatique (CNI), Tunisia

<br/>
🚀 Live Demo  ·  📦 Backend Repo  ·  📬 Contact
</div>
<br/>

📌 Table of Contents

🌐 Overview
📊 Key Metrics
✨ Features
🛠️ Tech Stack
📁 Architecture
🚀 Installation
👥 Roles & Permissions
📈 Performance
🔒 Security
🐳 Deployment


🌐 Overview
Gestion Pro is a production-grade enterprise web application that covers the full commercial lifecycle:

📋 Convention & billing management — complete CRUD, lifecycle workflows, and smart invoice generation
📊 Role-based analytical dashboards — real-time KPIs, heatmaps, and business intelligence
💬 Real-time team messaging — Slack-style WebSocket communication
🤖 AI-powered decision support — Gemini AI chatbot for natural-language analysis and predictions

Built with CI/CD pipelines, automated testing, and fully containerized deployment.

📊 Key Metrics
<br/>
<div align="center">
🔗 REST Endpoints🗄️ MongoDB Entities⚙️ Backend Services🧩 Angular Components70+4495+50+
🔐 User Roles🧪 Unit Tests🐳 DevOps📊 Monitoring695+Jenkins + DockerPrometheus + Grafana
</div>
<br/>

✨ Features
<details>
<summary><b>🔐 &nbsp;Authentication &amp; Security</b></summary>
<br/>
FeatureDescriptionJWT AuthenticationToken-based login with auto-refresh and expiry managementTwo-Factor Auth (TOTP)QR code scan + time-based one-time password (Google Authenticator)Route GuardsRole-based protection enforced on every Angular routeSession ManagementAutomatic token refresh and silent logout on expiryPassword RecoverySecure email-based reset flowHTTP InterceptorsAutomatic token injection on all outgoing requestsAudit TrailComplete login and action history per user
<br/>
</details>
<details>
<summary><b>📊 &nbsp;Role-Based Dashboards</b></summary>
<br/>
RoleKey Features👨‍💼 AdminSystem monitoring (CPU / RAM / Disk via Prometheus), full user CRUD, global KPIs💼 CommercialSales pipeline, revenue tracking, performance charts, payment deadline calendar🎯 Decision MakerStrategic KPIs, regional heatmaps, Gemini AI chatbot for NL analysis📋 Project ManagerTask management, team overview, shared calendar, validation workflow
<br/>
</details>
<details>
<summary><b>📝 &nbsp;Convention Management</b></summary>
<br/>
FeatureDescriptionFull CRUDGuided forms with inline editing and comprehensive field validationAdvanced SearchPaginated list with multi-filter, sorting, and full-text searchGeographic SelectionZone and region autocompleteLifecycle WorkflowVisual status progression with color-coded badgesVersion HistoryComplete modification timeline with versioningData ExportPDF · Excel · CSV
<br/>
</details>
<details>
<summary><b>💳 &nbsp;Smart Billing &amp; OCR Validation</b></summary>
<br/>
FeatureDescriptionInvoice GenerationAutomatic creation directly from conventionsPartial PaymentsPayment tracking with running balance managementTesseract OCRAuto data extraction from uploaded payment proof documentsSmart MatchingAutomatic matching of payment proofs to open invoicesDelay AlertsColor-coded indicators with multi-channel payment notifications
<br/>
</details>
<details>
<summary><b>💬 &nbsp;Real-Time Messaging (Slack-style)</b></summary>
<br/>
FeatureDescriptionWebSocket / STOMPBidirectional real-time communicationRich InteractionsFile attachments, emoji reactions, pinned messagesPresence IndicatorsLive typing indicators and online/offline statusNavigationFull-text search, threaded replies, @mentions
<br/>
</details>
<details>
<summary><b>🤖 &nbsp;AI Chatbot — Gemini AI</b></summary>
<br/>
FeatureDescriptionNatural Language QueriesReport generation and business data queries in plain languagePredictive AnalyticsStrategic recommendations and trend forecastingDynamic ChartsOn-the-fly chart generation from conversational queriesContext AwarenessPersistent conversation history with context-aware searchMultilingualFull FR / EN support
<br/>
</details>
<details>
<summary><b>🔔 &nbsp;Notification Center &amp; KPI Alerts</b></summary>
<br/>
ChannelDescriptionIn-AppUnified inbox for all notification typesEmailBrevo / SMTP integrationSMSTwilio integrationWeb PushBrowser push notificationsAlert EngineConfigurable thresholds with automatic triggering and escalation
<br/>
</details>

🛠️ Tech Stack
🖥️ Frontend
CategoryTechnologyVersionFrameworkAngular15.2.10LanguageTypeScript4.9.4UI LibraryAngular Material15.2.9Reactive ProgrammingRxJS7.8.0ChartingChart.js + ng2-charts4.4.0 / 4.1.1Maps & HeatmapsLeafletLatestCustom VisualizationD3.jsLatestReal-TimeWebSocket / STOMP—StylingSCSS / Material Design 3—PWAService Workers—
<br/>
⚙️ Backend  (see Pfe-Backend)
CategoryTechnologyVersionFrameworkSpring Boot3.2.0LanguageJava17DatabaseMongoDB7.0AIGemini AI API—OCRTesseract5.4.0EmailBrevo / SMTP—SMSTwilio SDK8.31.1PaymentsStripe Java24.6.0CI/CDJenkins + Docker—API DocsSwagger / OpenAPI3.0MonitoringPrometheus + Grafana—TestingJUnit + Mockito + JaCoCo—

📁 Architecture
src/
│
├── app/
│   ├── 🔐 auth/                          # Login · 2FA · Password reset
│   │
│   ├── 📊 dashboard/
│   │   ├── admin-dashboard/              # System monitoring + user mgmt
│   │   ├── commercial-dashboard/         # Sales pipeline + revenue
│   │   ├── decision-maker-dashboard/     # KPIs + heatmaps + AI chatbot
│   │   └── project-manager-dashboard/   # Tasks + teams + calendar
│   │
│   ├── 🧩 features/
│   │   ├── convention-management/        # Convention lifecycle (CRUD)
│   │   ├── invoice-management/           # Billing + partial payments
│   │   ├── messaging-page/               # Real-time chat (WebSocket)
│   │   ├── chatbot-decideur/             # Gemini AI assistant
│   │   ├── monitoring-system/            # KPI widgets + alerts
│   │   ├── payment-proofs/               # OCR upload & validation
│   │   ├── reports/                      # Report generation
│   │   └── predictive-analytics/         # Forecasting & trends
│   │
│   ├── ⚙️  services/                     # 60+ Angular services
│   ├── 🛡️  guards/                       # Role-based route guards
│   ├── 📐 models/                        # TypeScript interfaces
│   ├── 🔁 shared/                        # Reusable components & pipes
│   └── 🔩 core/                          # JWT interceptors + error handling
│
├── assets/
│   └── i18n/                             # Translations — FR / EN
│
└── environments/                         # Dev / Production config

🚀 Installation
Prerequisites
ToolRequired VersionNode.js18+npm9+Angular CLI15.2.10GitLatest
Quick Start
bash# 1. Clone the repository
git clone https://github.com/hamayari/gestion-pro-frontend.git
cd gestion-pro-frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm start

✅ App available at http://localhost:4200
⚠️ Requires backend running at http://localhost:8080

Environment Configuration
typescript// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl:              'http://localhost:8080/api',
  wsUrl:               'ws://localhost:8080/ws',
  tokenKey:            'auth_token',
  refreshTokenKey:     'refresh_token',
  enableChatbot:       true,
  enableNotifications: true,
  enableWebSocket:     true,
  geminiApiKey:        'YOUR_GEMINI_API_KEY',   // ← replace with your key
  enableMonitoring:    true,
  metricsInterval:     30000
};
Available Scripts
CommandDescriptionnpm startDev server → http://localhost:4200npm run buildProduction build → dist/npm run build:statsBuild + bundle analyzernpm run lintESLint checknpm run lint:fixAuto-fix lint issuesnpm run formatPrettier formatting

👥 Roles & Permissions
RoleRouteAccess🔴 SUPER_ADMIN/adminFull system access + monitoring🟠 ADMIN/adminUser management + nomenclatures🟢 COMMERCIAL/commercialConventions + invoices + clients🔵 DECISION_MAKER/decideurAnalytics + KPIs + AI chatbot🟣 PROJECT_MANAGER/project-managerProjects + tasks + teams⚪ USER/homeRead-only view

📈 Performance
Lighthouse Targets
MetricTargetFirst Contentful Paint< 1.5sTime to Interactive< 3.5sLighthouse Score90+
Optimizations Applied
OptimizationStatusLazy loading of all feature modules✅OnPush Change Detection strategy✅TrackBy in all *ngFor loops✅Virtual Scrolling for large datasets✅Image lazy loading✅Service Workers (PWA-ready)✅Tree shaking + AOT Compilation✅

🔒 Security
MeasureStatusJWT with auto-refresh and expiry management✅Role-based route guards on every protected page✅Input sanitization via DomSanitizer✅CSRF token protection✅Content Security Policy headers✅XSS Prevention + Secure HTTP headers✅Client-side input validation on all forms✅

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
  ⭐ Star this repo if it inspired you — it means a lot!
</div>
