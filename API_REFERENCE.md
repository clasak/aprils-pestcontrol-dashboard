# API Reference - April's Pest Control Dashboard

Base URL: `http://localhost:4000` (development)

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

## Table of Contents

1. [Contacts API](#contacts-api)
2. [Leads API](#leads-api)
3. [Deals API](#deals-api)
4. [Response Formats](#response-formats)
5. [Error Handling](#error-handling)

---

## Contacts API

### GET /sales/contacts

Get paginated list of contacts with filters.

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 20, options: 10, 20, 50, 100)
search: string (searches name, email, phone, company)
type: string (residential, commercial, property_manager, referral_partner, vendor, other)
status: string (active, inactive, do_not_contact)
tags: string (comma-separated)
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "companyId": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1-555-123-4567",
      "type": "residential",
      "status": "active",
      "city": "San Francisco",
      "state": "CA",
      "tags": ["vip", "referral"],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### GET /sales/contacts/:id

Get single contact by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    // ... full contact object
  }
}
```

---

### POST /sales/contacts

Create new contact.

**Request Body:**
```json
{
  "companyId": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1-555-123-4567",
  "type": "residential",
  "status": "active",
  "addressLine1": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "postalCode": "94102",
  "tags": ["vip"],
  "customFields": {
    "preferred_service_day": "Tuesday"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* created contact */ },
  "message": "Contact created successfully"
}
```

---

### PUT /sales/contacts/:id

Update existing contact.

**Request Body:** (all fields optional)
```json
{
  "email": "newemail@example.com",
  "phone": "+1-555-999-8888",
  "status": "inactive"
}
```

---

### DELETE /sales/contacts/:id

Soft delete contact (sets deleted_at timestamp).

**Response:**
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

---

### POST /sales/contacts/:id/restore

Restore soft-deleted contact.

---

### GET /sales/contacts/search/autocomplete?q=john

Autocomplete search for contacts (returns top 10 matches).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "label": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-123-4567",
      "companyName": "ABC Corp"
    }
  ]
}
```

---

### GET /sales/contacts/export/csv

Export all contacts to CSV format.

**Response:**
```json
{
  "success": true,
  "data": "First Name,Last Name,Email,Phone,Type,Status,Company Name,City,State\nJohn,Doe,..."
}
```

---

## Leads API

### GET /sales/leads

Get paginated list of leads with filters.

**Query Parameters:**
```
page: number
limit: number
search: string
status: string (new, contacted, qualified, unqualified, nurturing, converted, lost)
assignedTo: uuid
priority: string (low, medium, high, urgent)
minScore: number (0-100)
maxScore: number (0-100)
fromDate: ISO date
toDate: ISO date
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "contactId": "uuid",
      "contact": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "title": "Ant infestation - residential",
      "status": "new",
      "priority": "high",
      "leadScore": 85,
      "leadSource": "Google Ads",
      "estimatedValueCents": 50000,
      "assignedTo": "uuid",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

---

### GET /sales/leads/statistics

Get lead funnel metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 250,
    "newLeads": 45,
    "qualified": 120,
    "converted": 85,
    "conversionRate": 34.0,
    "averageScore": 68.5,
    "byStatus": {
      "new": 45,
      "contacted": 30,
      "qualified": 120,
      "nurturing": 15,
      "converted": 85,
      "lost": 40
    }
  }
}
```

---

### POST /sales/leads

Create new lead.

**Request Body:**
```json
{
  "companyId": "uuid",
  "contactId": "uuid",
  "title": "Termite inspection needed",
  "description": "Customer called about termite damage",
  "priority": "high",
  "leadSource": "Phone Call",
  "leadSourceCategory": "direct",
  "serviceType": "Termite Treatment",
  "pestTypes": ["termites"],
  "estimatedValueCents": 150000,
  "expectedCloseDate": "2024-02-15",
  "assignedTo": "uuid"
}
```

---

### POST /sales/leads/:id/assign

Assign lead to a user.

**Request Body:**
```json
{
  "assignedTo": "user-uuid"
}
```

---

### POST /sales/leads/:id/qualify

Mark lead as qualified or disqualified.

**Request Body:**
```json
{
  "isQualified": true,
  "notes": "Customer has budget and timeline confirmed"
}
```

---

### POST /sales/leads/:id/convert

Convert lead to deal.

**Request Body:**
```json
{
  "dealId": "newly-created-deal-uuid"
}
```

---

### POST /sales/leads/:id/mark-lost

Mark lead as lost.

**Request Body:**
```json
{
  "reason": "Budget constraints"
}
```

---

## Deals API

### GET /sales/deals

Get paginated list of deals.

**Query Parameters:**
```
page: number
limit: number
search: string
status: string (open, won, lost, cancelled)
stage: string (lead, inspection_scheduled, quote_sent, negotiation, closed_won, etc.)
assignedTo: uuid
salesRepId: uuid
minValue: number (dollars)
maxValue: number (dollars)
fromDate: ISO date
toDate: ISO date
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "contactId": "uuid",
      "contact": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "title": "Annual pest control contract",
      "status": "open",
      "stage": "negotiation",
      "dealValueCents": 250000,
      "winProbability": 70,
      "weightedValueCents": 175000,
      "expectedCloseDate": "2024-02-28",
      "daysInPipeline": 12,
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

---

### GET /sales/deals/pipeline

Get pipeline Kanban view (deals grouped by stage).

**Response:**
```json
{
  "success": true,
  "data": {
    "pipeline": {
      "lead": [ /* array of deals */ ],
      "inspection_scheduled": [ /* array of deals */ ],
      "quote_sent": [ /* array of deals */ ],
      // ... for all 9 stages
    },
    "summary": {
      "totalDeals": 45,
      "totalValue": 1250000,
      "totalWeightedValue": 875000,
      "stageValues": {
        "lead": 100000,
        "inspection_scheduled": 250000,
        // ...
      },
      "stageCounts": {
        "lead": 8,
        "inspection_scheduled": 5,
        // ...
      }
    }
  }
}
```

---

### GET /sales/deals/forecast

Get revenue forecast.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalDeals": 45,
      "totalValue": 1250000,
      "weightedValue": 875000
    },
    "monthlyForecast": {
      "2024-02": {
        "dealCount": 12,
        "totalValue": 450000,
        "weightedValue": 315000
      },
      "2024-03": {
        "dealCount": 8,
        "totalValue": 300000,
        "weightedValue": 210000
      }
    }
  }
}
```

---

### GET /sales/deals/statistics

Get deal metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "open": 45,
    "won": 85,
    "lost": 20,
    "winRate": 80.95,
    "totalValue": 3750000,
    "avgDealSize": 25000
  }
}
```

---

### POST /sales/deals

Create new deal.

**Request Body:**
```json
{
  "companyId": "uuid",
  "contactId": "uuid",
  "leadId": "uuid",
  "title": "Quarterly pest control service",
  "dealValueCents": 75000,
  "recurringRevenueCents": 25000,
  "serviceFrequency": "quarterly",
  "contractLengthMonths": 12,
  "expectedCloseDate": "2024-03-15",
  "assignedTo": "uuid",
  "pestTypes": ["ants", "roaches"],
  "serviceAddressLine1": "123 Main St",
  "serviceCity": "San Francisco",
  "serviceState": "CA"
}
```

---

### POST /sales/deals/:id/move-stage

Move deal to different pipeline stage.

**Request Body:**
```json
{
  "stage": "quote_sent"
}
```

**Effect:**
- Updates stage
- Recalculates win probability
- Adds entry to stage history
- Resets stage duration counter

---

### POST /sales/deals/:id/mark-won

Mark deal as won.

**Request Body:**
```json
{
  "wonReason": "Beat competitor on price and service quality"
}
```

**Effect:**
- Sets status to "won"
- Sets stage to "closed_won"
- Sets actual close date
- Sets win probability to 100%
- Weighted value = deal value

---

### POST /sales/deals/:id/mark-lost

Mark deal as lost.

**Request Body:**
```json
{
  "lostReason": "Budget constraints",
  "lostToCompetitor": "ABC Pest Control"
}
```

**Effect:**
- Sets status to "lost"
- Sets stage to "closed_lost"
- Sets actual close date
- Sets win probability to 0%
- Weighted value = 0

---

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Error Handling

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "email must be a valid email",
    "firstName should not be empty"
  ]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Contact with ID abc-123 not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Authentication

All API requests require a valid JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token should include:
- `userId` - User ID
- `companyId` - Company ID (for multi-tenant filtering)
- `roles` - Array of user roles

Tokens expire after 7 days (configurable via JWT_EXPIRES_IN env var).

---

## Rate Limiting

- Default: 100 requests per minute per IP
- Configurable via RATE_LIMIT_MAX and RATE_LIMIT_TTL env vars
- Returns 429 Too Many Requests when exceeded

---

## Data Types

### Money
All monetary values are stored as integers in cents:
- `dealValueCents: 250000` = $2,500.00
- `recurringRevenueCents: 50000` = $500.00

Convert to dollars by dividing by 100.

### Dates
All dates are ISO 8601 format with timezone:
- `2024-01-15T14:30:00Z` (UTC)
- `2024-01-15T14:30:00-08:00` (PST)

### UUIDs
All IDs are UUID v4 format:
- `550e8400-e29b-41d4-a716-446655440000`

---

## Postman Collection

Import this OpenAPI spec to Postman:
`http://localhost:4000/api-json`

Or access Swagger UI at:
`http://localhost:4000/api`

---

## Examples

### Create Contact, Lead, and Deal Flow

```bash
# 1. Create Contact
curl -X POST http://localhost:4000/sales/contacts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "my-company-uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+1-555-234-5678",
    "type": "residential",
    "city": "Los Angeles",
    "state": "CA"
  }'

# Response: { "success": true, "data": { "id": "contact-uuid", ... } }

# 2. Create Lead for Contact
curl -X POST http://localhost:4000/sales/leads \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "my-company-uuid",
    "contactId": "contact-uuid",
    "title": "Rodent control needed",
    "priority": "high",
    "leadSource": "Website Form",
    "estimatedValueCents": 85000
  }'

# Response: { "success": true, "data": { "id": "lead-uuid", "leadScore": 75, ... } }

# 3. Qualify Lead
curl -X POST http://localhost:4000/sales/leads/lead-uuid/qualify \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "isQualified": true,
    "notes": "Budget confirmed, needs service ASAP"
  }'

# 4. Create Deal from Lead
curl -X POST http://localhost:4000/sales/deals \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "my-company-uuid",
    "contactId": "contact-uuid",
    "leadId": "lead-uuid",
    "title": "Rodent control contract",
    "dealValueCents": 85000,
    "stage": "inspection_scheduled",
    "expectedCloseDate": "2024-02-15"
  }'

# Response: { "success": true, "data": { "id": "deal-uuid", "winProbability": 20, ... } }

# 5. Convert Lead
curl -X POST http://localhost:4000/sales/leads/lead-uuid/convert \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "dealId": "deal-uuid"
  }'

# 6. Move Deal Through Pipeline
curl -X POST http://localhost:4000/sales/deals/deal-uuid/move-stage \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "stage": "quote_sent"
  }'

# 7. Mark Deal as Won
curl -X POST http://localhost:4000/sales/deals/deal-uuid/mark-won \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "wonReason": "Excellent service record, competitive pricing"
  }'
```

---

**API Version:** 1.0.0
**Last Updated:** 2025-12-22
