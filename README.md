<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:4F46E5,100:7C3AED&height=200&section=header&text=Gestion%20Pro%20—%20Frontend&fontSize=42&fontColor=ffffff&fontAlignY=38&desc=Enterprise%20Commercial%20Management%20Platform&descAlignY=58&descSize=18" width="100%"/>


Full-stack enterprise platform built with Angular 15 · Spring Boot 3 · MongoDB · Gemini AI
Developed as a Final Year Engineering Project at the Centre National d'Informatique (CNI), Tunisia

<br/>
🚀 Live Demo · 📖 Backend Repo · 📬 Contact
</div>

<div align="center">
📌 Table of Contents
Overview · Features · Tech Stack · Architecture · Installation · Roles · Performance · Security · Deployment
</div>

🌐 Overview
<table>
<tr>
<td width="60%">
Gestion Pro is a production-grade, full-stack commercial management platform. It handles the full lifecycle of conventions and invoicing, provides role-based analytical dashboards, real-time team messaging, and an AI-powered decision-support chatbot — all in a single, unified interface.
This project was built from scratch during a 6-month internship at a national public institution, applying real-world Agile Scrum methodology with full CI/CD pipelines.
</td>
<td width="40%" align="center">
MetricValue📦 REST Endpoints70+🗄️ MongoDB Entities44⚙️ Backend Services95+🧩 Angular Components50+🔐 User Roles6🧪 Unit Tests95+
</td>
</tr>
</table>

✨ Features
<details>
<summary><b>🔐 Authentication & Security</b></summary>
<br/>
FeatureDescriptionJWT LoginSecure token-based authentication with auto-refresh2FA (TOTP)QR code scan + time-based one-time password validationAngular GuardsRole-based route protection for all pagesSession ManagementAutomatic token refresh and logout on expiryPassword RecoveryEmail-based secure reset flowHTTP InterceptorsAutomatic token injection on every requestAudit TrailComplete login and action history per user
</details>
<details>
<summary><b>📊 Role-Based Dashboards (4 specialized views)</b></summary>
<br/>
👨‍💼 Admin Dashboard

Real-time system monitoring (CPU, RAM, Disk)
Full user CRUD with role assignment
Global KPIs and statistics
Nomenclature configuration
Full audit logs and traceability

💼 Commercial Dashboard

Interactive sales pipeline
Revenue and target tracking
Performance charts and conversion indicators
Payment deadline calendar

🎯 Decision Maker Dashboard

Real-time strategic KPIs
Interactive regional heatmaps
Predictive analytics with trend detection
AI Chatbot powered by Gemini AI

📋 Project Manager Dashboard

Active project and task tracking
Team overview and shared calendar
Productivity metrics and validation workflow

</details>
<details>
<summary><b>📝 Convention Management</b></summary>
<br/>

Full CRUD with guided forms and validation
Advanced search with multi-filter and dynamic sorting
Geographic zone/region selection with autocomplete
Visual lifecycle workflow with colored status badges
Modification timeline with full versioning history
Data export to PDF, Excel, CSV

</details>
<details>
<summary><b>💳 Smart Billing & OCR Validation</b></summary>
<br/>

Automatic invoice generation directly from conventions
Customizable auto-numbering sequences
Partial payment tracking with balance management
Tesseract OCR — automatic data extraction from payment proofs
Smart auto-matching of uploaded proofs to invoices
Color-coded delay indicators and payment alerts

</details>
<details>
<summary><b>💬 Real-Time Messaging (Slack-style)</b></summary>
<br/>

Live bidirectional WebSocket communication (STOMP protocol)
File attachments, emoji reactions, pinned messages
Typing indicators ("X is typing...")
Full-text message search
User online/offline presence
Threaded replies and @mentions

</details>
<details>
<summary><b>🤖 Integrated AI Chatbot (Gemini AI)</b></summary>
<br/>

Natural language report generation
Predictive analytics and business recommendations
Dynamic on-the-fly chart generation
Context-aware intelligent search
Conversation history — save and resume sessions
FR/EN multilingual support

</details>
<details>
<summary><b>🔔 Notification Center & KPI Alerts</b></summary>
<br/>

Unified inbox for all notification types
Multi-channel delivery: Email · SMS (Twilio) · In-App · Web Push
Configurable thresholds with automatic alert triggering
Alert delegation and escalation workflows
Real-time browser push notifications

</details>

🛠️ Tech Stack
<div align="center">
Frontend
LayerTechnologyVersionFrameworkAngular15.2.10LanguageTypeScript4.9.4UI LibraryAngular Material15.2.9Reactive ProgrammingRxJS7.8.0ChartingChart.js + ng2-charts4.4.0 / 4.1.1Maps & HeatmapsLeafletLatestCustom VizD3.jsLatestReal-TimeWebSocket (STOMP)—StylingSCSS / Material Design 3—PWAService Workers—
Backend (see Pfe-Backend)
LayerTechnologyVersionFrameworkSpring Boot3.2.0LanguageJava17DatabaseMongoDB7.0AIGemini AI API—OCRTesseract5.4.0EmailBrevo (SMTP)—SMSTwilio SDK8.31.1PaymentsStripe Java24.6.0CI/CDJenkins + Docker—API DocsSwagger / OpenAPI 3.0—MonitoringPrometheus + Grafana—
</div>

📁 Architecture
src/
├── app/
│   ├── auth/                        # Authentication (login, 2FA, reset)
│   ├── dashboard/                   # 4 role-based dashboards
│   │   ├── admin-dashboard/
│   │   ├── commercial-dashboard/
│   │   ├── decision-maker-dashboard/
│   │   └── project-manager-dashboard/
│   ├── features/                    # Feature modules
│   │   ├── convention-management/
│   │   ├── invoice-management/
│   │   ├── messaging-page/          # Real-time chat (WebSocket)
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
│   ├── i18n/                        # Translation files (FR / EN)
│   └── icons/
└── environments/                    # Dev / Production config

🚀 Installation
Prerequisites

Node.js 18+ and npm 9+
Angular CLI 15.2.10
Git

Quick Start
bash# 1. Clone the repository
git clone https://github.com/hamayari/Pfe-Frontend.git
cd Pfe-Frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm start

The app runs at http://localhost:4200
Make sure the backend is running at http://localhost:8080

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
  geminiApiKey: 'YOUR_GEMINI_API_KEY',   // ← Replace with your key
  enableMonitoring: true,
  metricsInterval: 30000
};
Available Scripts
bashnpm start              # Development server (port 4200)
npm run build          # Production build → dist/
npm run build:stats    # Production build + bundle analysis
npm run lint           # ESLint check
npm run lint:fix       # Auto-fix lint issues
npm run format         # Prettier formatting

👥 Roles & Permissions
<div align="center">
RoleRouteAccess Level🔴 SUPER_ADMIN/adminFull system access + monitoring🟠 ADMIN/adminUser management + nomenclatures🟢 COMMERCIAL/commercialConventions + invoices + clients🔵 DECISION_MAKER/decideurAnalytics + KPIs + AI chatbot🟣 PROJECT_MANAGER/project-managerProjects + tasks + teams⚪ USER/homeRead-only view
</div>

📊 Performance
<div align="center">
MetricTargetFirst Contentful Paint< 1.5sTime to Interactive< 3.5sLighthouse Score90+
</div>
Optimizations implemented:

✅ Lazy loading of all feature modules
✅ OnPush Change Detection strategy
✅ TrackBy in all *ngFor loops
✅ Virtual Scrolling for large lists
✅ Image lazy loading
✅ Service Workers (PWA-ready)
✅ Bundle optimization, Tree shaking, AOT Compilation


🔒 Security

✅ JWT with auto-refresh and expiry management
✅ Route guards on every protected page
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
✅ Screen reader friendly
✅ Semantic HTML throughout


🤝 Contributing
bash# 1. Fork the project
# 2. Create your feature branch
git checkout -b feature/YourFeature

# 3. Commit your changes
git commit -m "feat: add YourFeature"

# 4. Push and open a Pull Request
git push origin feature/YourFeature

📄 License
Distributed under the MIT License. See LICENSE for details.

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:4F46E5,100:7C3AED&height=100&section=footer" width="100%"/>
Made with ❤️ by Mohamed Amine Ayari
⭐ If this project helped you, please give it a star — it means a lot!
</div>
