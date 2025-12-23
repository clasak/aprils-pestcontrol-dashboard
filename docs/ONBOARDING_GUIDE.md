# April's Pest Control - Onboarding Guide

Welcome to your new CRM Dashboard! This guide will help you get started with managing your sales pipeline, leads, and customer data.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Leads](#managing-leads)
4. [Pipeline Management](#pipeline-management)
5. [Creating Quotes](#creating-quotes)
6. [Importing Data](#importing-data)
7. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Logging In

1. Go to your dashboard URL (provided by your administrator)
2. Enter your email and password
3. Click "Sign In"

If you forgot your password, click "Forgot Password" to receive a reset link.

### First-Time Setup

After logging in for the first time:

1. **Review your profile** - Click your name in the top right corner
2. **Set your preferences** - Time zone, notification settings
3. **Familiarize yourself** with the navigation menu on the left

---

## Dashboard Overview

### Main Dashboard

The main dashboard shows:

- **Key Metrics**: Total pipeline value, win rate, leads this month
- **Recent Activity**: Latest updates across your accounts
- **Pipeline Summary**: Quick view of opportunities by stage
- **Upcoming Tasks**: Items requiring your attention

### Navigation

The left sidebar provides access to:

| Section | Purpose |
|---------|---------|
| **Dashboard** | Overview and quick metrics |
| **Sales** | Leads, pipeline, contacts, quotes |
| **Operations** | Service scheduling and dispatch |
| **Admin** | Settings, users, data import |

---

## Managing Leads

### What is a Lead?

A lead is a potential customer who has shown interest in your services but hasn't been converted to an opportunity yet.

### Creating a New Lead

1. Go to **Sales → Leads**
2. Click **"Add Lead"**
3. Fill in the required information:
   - Name (First and Last)
   - Contact info (phone, email)
   - Property address
   - Lead source (how they found you)
   - Pest type (what problem they're reporting)
4. Click **"Save"**

### Lead Statuses

| Status | Description |
|--------|-------------|
| **New** | Fresh lead, not yet contacted |
| **Contacted** | Initial contact made |
| **Qualified** | Confirmed interest and need |
| **Unqualified** | Not a good fit |
| **Nurturing** | Not ready now, follow up later |
| **Converted** | Became an opportunity |
| **Lost** | Decided not to proceed |

### Converting a Lead

When a lead is ready to move forward:

1. Open the lead record
2. Click **"Convert to Opportunity"**
3. Review/edit the information
4. Click **"Convert"**

This creates:
- A new Contact record
- A new Opportunity in the pipeline

---

## Pipeline Management

### The 9-Stage Pipeline

Your sales pipeline has 9 stages:

| Stage | Probability | Description |
|-------|-------------|-------------|
| **Lead** | 10% | Initial inquiry |
| **Inspection Scheduled** | 15% | On-site visit booked |
| **Inspection Completed** | 25% | Visited, preparing quote |
| **Quote Sent** | 50% | Proposal delivered |
| **Negotiation** | 60% | Discussing terms |
| **Verbal Commitment** | 75% | Customer agreed verbally |
| **Contract Sent** | 90% | Awaiting signature |
| **Closed Won** | 100% | Deal completed! |
| **Closed Lost** | 0% | Did not proceed |

### Using the Kanban Board

1. Go to **Sales → Pipeline**
2. View opportunities as cards organized by stage
3. **Drag and drop** cards to move between stages
4. Click a card to view/edit details

### Moving Opportunities Forward

When you're ready to advance a deal:

1. Click on the opportunity card
2. Update the relevant information:
   - Next steps
   - Expected close date
   - Deal amount
3. Change the stage
4. Add any notes about the interaction
5. Click **"Save"**

---

## Creating Quotes

### Building a Quote

1. Go to **Sales → Quotes** or click "Create Quote" from an opportunity
2. Select the customer/opportunity
3. Add service line items:
   - Service type (One-time treatment, monthly service, etc.)
   - Pricing
   - Service frequency
   - Contract length
4. Review the total
5. Click **"Generate PDF"** to preview
6. Click **"Send Quote"** to email to customer

### Quote Statuses

| Status | Description |
|--------|-------------|
| **Draft** | Being created, not sent |
| **Sent** | Delivered to customer |
| **Viewed** | Customer opened the quote |
| **Accepted** | Customer approved |
| **Rejected** | Customer declined |
| **Expired** | Validity period ended |

---

## Importing Data

### Preparing Your Data

Before importing, ensure your CSV file has:

1. **Headers in the first row**
2. **One record per row**
3. **Required fields** filled in for each record

### Using the Import Tool

1. Go to **Admin → Import Data**
2. Click **"Upload File"** or drag your CSV
3. Select the data type (Leads, Contacts, Accounts, Opportunities)
4. **Map your columns** to the system fields:
   - The system will try to auto-detect mappings
   - Review and adjust as needed
5. **Preview** the first few records
6. Click **"Import"**

### Import Templates

Download pre-formatted templates from the Import page:

- **Leads Template** - For importing new leads
- **Contacts Template** - For importing existing customers
- **Accounts Template** - For businesses/properties
- **Opportunities Template** - For existing deals

### Common Import Issues

| Issue | Solution |
|-------|----------|
| "Required field missing" | Ensure all required columns have values |
| "Invalid date format" | Use MM/DD/YYYY or YYYY-MM-DD |
| "Invalid phone number" | Remove special characters, use 10 digits |
| "Duplicate email" | Check for existing records with same email |

---

## Tips & Best Practices

### Daily Routine

1. **Check your dashboard** for new leads and tasks
2. **Follow up on stale opportunities** (no activity in 7+ days)
3. **Log all customer interactions** (calls, emails, meetings)
4. **Update opportunity stages** after each customer touchpoint

### Lead Management

- **Respond quickly** to new leads (within 1 hour is ideal)
- **Set follow-up reminders** for leads not ready to commit
- **Document everything** in notes for future reference
- **Use lead scoring** to prioritize your time

### Pipeline Health

- Keep **next steps updated** for every opportunity
- **Expected close dates** should be realistic
- **Don't let deals stagnate** - if nothing has changed in 2 weeks, something's wrong
- **Update amounts** as you learn more about the customer's needs

### Forecasting

- Use **Commit** for deals with verbal/written commitment
- Use **Best Case** for deals likely to close this period
- Use **Pipeline** for everything else
- Update forecasts **weekly** for accurate projections

---

## Getting Help

### In-App Help

- Look for the **?** icon for contextual help
- Check tooltips by hovering over icons

### Support

For technical issues or questions:
- Email: support@compassiq.com
- Phone: (555) 123-4567

### Training Resources

Additional training materials available:
- Video tutorials (coming soon)
- Weekly webinars (contact support to register)

---

## Quick Reference Card

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | New Lead |
| `Ctrl + S` | Save current record |
| `Esc` | Close modal/dialog |
| `/` | Focus search bar |

### Status Color Codes

- 🟢 **Green**: Positive/Complete
- 🟡 **Yellow**: Warning/Pending
- 🔴 **Red**: Error/Overdue
- 🔵 **Blue**: Information/In Progress

---

*Last Updated: December 2024*
*Powered by CompassIQ*

