# Contributing to April's Pest Control Dashboard

Thank you for your interest in contributing to April's Pest Control Dashboard! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Working with DevGru Team](#working-with-devgru-team)

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Focus on constructive feedback
- Prioritize the success of the project and the pest control industry
- Maintain professional communication

## Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- Docker and Docker Compose
- Git
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/aprils-pestcontrol/dashboard.git
   cd aprils_pestcontrol_Dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Start services with Docker**
   ```bash
   npm run docker:up
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

6. **Start development servers**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - API Docs: http://localhost:4000/api/docs

## Development Workflow

### Branching Strategy

- `main` - Production branch (protected, requires PR approval)
- `develop` - Staging branch (default branch for PRs)
- `feature/[name]` - Feature development branches
- `fix/[name]` - Bug fix branches
- `hotfix/[name]` - Emergency production fixes

### Creating a Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-new-feature
```

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring (no functionality change)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Examples:**
```
feat(crm): add lead scoring algorithm

Implemented ML-based lead scoring using historical conversion data.
Scores are updated in real-time when lead attributes change.

Closes #123
```

```
fix(routing): resolve route optimization timeout

Fixed timeout issue when optimizing routes with >50 appointments.
Added pagination and background processing for large route sets.

Fixes #456
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Define explicit types (avoid `any`)
- Use interfaces for data structures

```typescript
// Good
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

// Avoid
const customer: any = { ... };
```

### Naming Conventions

- **Variables/Functions**: camelCase (`getUserById`, `leadScore`)
- **Classes/Interfaces**: PascalCase (`CustomerService`, `LeadData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- **Files**: kebab-case (`customer-service.ts`, `lead-scoring.util.ts`)

### Code Organization

```
src/
├── frontend/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page-level components
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Redux store and slices
│   ├── services/        # API client services
│   └── utils/           # Utility functions
├── backend/
│   ├── modules/         # Feature modules (CRM, scheduling, etc.)
│   ├── shared/          # Shared services and utilities
│   ├── config/          # Configuration files
│   └── database/        # Migrations and seeds
└── shared/
    ├── types/           # Shared TypeScript types
    └── utils/           # Shared utility functions
```

### React Components

Use functional components with hooks:

```typescript
import React, { useState, useEffect } from 'react';

interface Props {
  customerId: string;
}

export const CustomerProfile: React.FC<Props> = ({ customerId }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    // Fetch customer data
  }, [customerId]);

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

### API Design

Follow RESTful conventions:

```typescript
// Good
GET    /api/v1/customers           // List customers
POST   /api/v1/customers           // Create customer
GET    /api/v1/customers/:id       // Get customer
PATCH  /api/v1/customers/:id       // Update customer
DELETE /api/v1/customers/:id       // Delete customer

// Nested resources
GET    /api/v1/customers/:id/appointments
POST   /api/v1/customers/:id/appointments
```

## Testing Requirements

### Coverage Requirements

- **Unit Tests**: 80%+ coverage for business logic
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows

### Writing Tests

**Unit Test Example:**
```typescript
import { calculateLeadScore } from './lead-scoring';

describe('Lead Scoring', () => {
  it('should assign high score to commercial properties', () => {
    const lead = {
      propertyType: 'commercial',
      propertySize: 5000,
      location: 'downtown'
    };

    const score = calculateLeadScore(lead);
    expect(score).toBeGreaterThan(75);
  });
});
```

**Integration Test Example:**
```typescript
import request from 'supertest';
import { app } from '../src/app';

describe('Customer API', () => {
  it('POST /customers should create a new customer', async () => {
    const response = await request(app)
      .post('/api/v1/customers')
      .send({
        name: 'ABC Pest Control',
        email: 'contact@abc.com'
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
  });
});
```

### Running Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage
npm run test:coverage

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## Pull Request Process

### Before Submitting

1. **Ensure tests pass**
   ```bash
   npm run test
   npm run lint
   ```

2. **Update documentation** if needed

3. **Add/update tests** for new features

4. **Run the application** locally and verify

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### Review Process

1. **Automated checks** must pass (tests, linting)
2. **Code review** by technical-lead or senior developer
3. **Approval required** before merging
4. **Squash and merge** to develop

### After Merge

- Delete your feature branch
- Verify deployment to staging
- Monitor for issues

## Working with DevGru Team

This project uses AI agents for development coordination:

### Agent Roles

- `@ceo-cofounder` - Strategic decisions
- `@software-architect` - Architecture questions
- `@technical-lead` - Development coordination
- `@product-manager` - Feature requirements
- `@code-reviewer` - Code quality reviews

### When to Consult Agents

**Architecture Questions:**
```bash
claude "@software-architect should we use microservices or monolith for this feature?"
```

**Feature Clarification:**
```bash
claude "@product-manager what are the acceptance criteria for the quote builder?"
```

**Code Review:**
```bash
claude "@code-reviewer review the changes in src/modules/crm/"
```

## Questions or Issues?

- **Technical Questions**: Ask in #dev-support channel or consult @technical-lead
- **Feature Questions**: Ask @product-manager
- **Architecture Decisions**: Consult @software-architect
- **Bug Reports**: Create an issue with reproduction steps

---

Thank you for contributing to April's Pest Control Dashboard!
