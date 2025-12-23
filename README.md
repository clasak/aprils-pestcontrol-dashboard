# April's Pest Control Dashboard

A comprehensive CRM platform designed specifically for pest control companies - better than Salesforce, built for the industry.

**Product of CompassIQ**

## Overview

April's Pest Control Dashboard is an all-in-one business management platform that combines:
- **CRM & Sales Pipeline**: Lead management, opportunity tracking, quote generation
- **Scheduling & Dispatch**: Smart routing, recurring services, technician assignment
- **Service Management**: Digital service reports, treatment tracking, customer portal
- **Compliance**: EPA/FIFRA chemical tracking, OSHA safety logs, audit trails
- **Analytics**: Real-time dashboards, KPI tracking, forecasting

## Why Better Than Salesforce?

| Feature | Salesforce | April's Dashboard |
|---------|-----------|-------------------|
| **Cost** | $150-300/user/month + implementation | $50-100/user/month all-inclusive |
| **Deployment** | 3-6 months + consultants | 1-2 weeks self-service |
| **Route Optimization** | $50+/user add-on required | Built-in with 20-40% fuel savings |
| **Chemical Tracking** | Custom build required | Native EPA compliance |
| **Mobile Offline** | Limited functionality | Full offline capability |
| **Pest Control Fit** | Generic, requires customization | Pre-built industry workflows |

## Key Features

### 🎯 Sales & CRM
- AI-powered lead scoring and routing
- Visual pipeline with drag-and-drop
- Quote builder with e-signature
- Commission tracking
- Territory management

### 📅 Scheduling & Routing
- Intelligent route optimization (saves 20-40% fuel)
- Recurring service automation
- Real-time technician tracking
- Customer notifications (SMS/email)
- Weather-based rescheduling

### 🏠 Service Management
- Digital service reports with photos
- Treatment protocol workflows
- Property diagrams with markup
- Customer signature capture
- Service history tracking

### ⚗️ Compliance & Safety
- EPA/FIFRA chemical usage logs
- MSDS library and lot tracking
- Technician certification management
- OSHA incident reporting
- 7-year audit trail retention

### 📊 Analytics & Reporting
- Real-time KPI dashboards
- Pipeline and revenue forecasting
- Operational metrics (completion rate, utilization)
- Customer health scores
- Pre-built report templates

### 📱 Mobile App
- Offline-first Progressive Web App
- Works on 3G networks
- Daily schedule with navigation
- Service completion forms
- Photo capture and uploads

## Quick Start

### For Developers

1. **Clone and Install**
   ```bash
   cd aprils_pestcontrol_Dashboard
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

3. **Database Setup**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Deploy Development Server**

   **Option A: Docker (Recommended for first-time setup)**
   ```bash
   npm run deploy:dev
   ```
   This starts all services in Docker containers with hot reload enabled.

   **Option B: Local Services (Faster for active development)**
   ```bash
   npm run deploy:localhost
   ```
   This runs services locally (database still uses Docker).

   **Option C: Manual Development**
   ```bash
   npm run dev
   ```
   Runs frontend and backend concurrently (requires database to be running).

### For Users

1. **Sign Up**: Create your account at dashboard.aprilspestcontrol.com
2. **Import Data**: Use our CSV import for existing customers
3. **Configure**: Set up your service types, pricing, and territories
4. **Train Team**: 30-minute onboarding videos for each role
5. **Go Live**: Start scheduling and tracking services

## Documentation

- [Project Context](./.claude/PROJECT_CONTEXT.md) - Development guidelines and architecture
- [Research Findings](./docs/RESEARCH_FINDINGS.md) - Industry analysis and requirements
- [Architecture](./docs/ARCHITECTURE.md) - System design and technical decisions
- [Product Requirements](./docs/PRD_MVP.md) - Feature specifications
- [User Flows](./docs/USER_FLOWS.md) - Journey maps and workflows
- [API Documentation](./docs/API.md) - REST API reference

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit
- **UI Components**: Material-UI (MUI)
- **Maps**: Google Maps Platform
- **Charts**: Recharts
- **Real-time**: Socket.io client

### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: NestJS
- **Database**: PostgreSQL 15+ with TimescaleDB
- **Cache**: Redis 7+
- **Queue**: BullMQ
- **Storage**: AWS S3

### Infrastructure
- **Cloud**: AWS (primary)
- **Containers**: Docker + Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Datadog
- **Logging**: AWS CloudWatch

### Third-Party Services
- **Auth**: Auth0
- **Email**: SendGrid
- **SMS**: Twilio
- **Payments**: Stripe
- **Analytics**: Mixpanel

## Project Structure

```
aprils_pestcontrol_Dashboard/
├── .claude/                    # AI agents and project context
│   ├── agents/                 # DevGru software team
│   └── PROJECT_CONTEXT.md      # Development guidelines
├── docs/                       # Documentation
│   ├── RESEARCH_FINDINGS.md
│   ├── ARCHITECTURE.md
│   ├── PRD_MVP.md
│   └── API.md
├── src/                        # Source code
│   ├── frontend/              # React web app
│   ├── backend/               # NestJS API
│   ├── mobile/                # PWA configuration
│   ├── shared/                # Shared types and utilities
│   └── database/              # Migrations and seeds
├── tests/                     # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/                   # Build and deployment scripts
├── .github/                   # GitHub Actions workflows
└── README.md                  # This file
```

## Development Workflow

### Branching Strategy
- `main` - Production (protected)
- `develop` - Staging (default branch)
- `feature/*` - Feature development
- `hotfix/*` - Emergency fixes

### Commit Convention
We use Conventional Commits:
```
feat: Add chemical inventory tracking
fix: Resolve route optimization bug
docs: Update API documentation
refactor: Simplify lead scoring algorithm
test: Add E2E tests for quote generation
```

### Pull Request Process
1. Create feature branch from `develop`
2. Implement with tests (80%+ coverage)
3. Submit PR with description and screenshots
4. Code review by technical-lead
5. Merge to `develop` (auto-deploy to staging)
6. Production deployment from `main` (manual approval)

## Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## DevGru Software Team

This project is developed using the DevGru Software Team - a coordinated set of AI agents:

**Leadership**
- `ceo-cofounder` - Strategic vision and business decisions
- `software-architect` - System design and architecture
- `technical-lead` - Development coordination
- `product-manager` - Requirements and user stories

**Development**
- `frontend-developer` - React UI implementation
- `backend-developer` - API and business logic
- `database-engineer` - Schema design and optimization
- `mobile-developer` - PWA optimization

**Quality & Operations**
- `qa-test-engineer` - Testing strategy
- `security-engineer` - Security audits
- `devops-engineer` - Infrastructure and deployment

## Roadmap

### Phase 1: MVP (Months 1-3) ✅ In Progress
- Core CRM (contacts, leads, pipeline)
- Quote builder with e-signature
- Calendar scheduling and basic routing
- Service reports with photos
- Mobile app for technicians
- Basic reporting dashboards

### Phase 2: Growth (Months 4-6)
- Advanced route optimization
- Chemical inventory management
- EPA compliance reporting
- Customer self-service portal
- Commission tracking
- Territory management

### Phase 3: Enterprise (Months 7-12)
- AI churn prediction
- Automated billing and payments
- Advanced integrations (QuickBooks, etc.)
- Multi-location franchise support
- Predictive analytics

### Phase 4: Market Leadership (Year 2+)
- Computer vision pest identification
- IoT smart trap integration
- Voice AI for customer service
- White-label for enterprise

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Security

For security issues, please email security@aprilspestcontrol.com instead of using the issue tracker.

## License

Proprietary - All rights reserved

## Company

**CompassIQ** - Building better software for pest control companies.

This product is part of the CompassIQ suite of business management solutions.

## Support

- **Documentation**: https://docs.aprilspestcontrol.com
- **Support Email**: support@aprilspestcontrol.com
- **Sales**: sales@aprilspestcontrol.com

---

**Built with ❤️ for the pest control industry**

Making the world's best CRM for pest control companies - better than Salesforce, designed for you.
