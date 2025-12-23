# Deployment Guide

This guide covers deploying April's Pest Control Dashboard to production using Vercel (frontend) and Supabase Cloud (backend/database).

## Prerequisites

- GitHub repository with the codebase
- Vercel account (https://vercel.com)
- Supabase account (https://supabase.com)
- Domain name (optional, for custom domain)

## Architecture Overview

```
┌─────────────────┐      ┌─────────────────────┐
│   Vercel CDN    │      │   Supabase Cloud    │
│   (Frontend)    │◄────►│   (Backend)         │
│                 │      │                     │
│ • React SPA     │      │ • PostgreSQL DB     │
│ • Static Assets │      │ • Auth Service      │
│ • Edge Network  │      │ • Storage           │
└─────────────────┘      │ • Real-time         │
                         │ • Edge Functions    │
                         └─────────────────────┘
```

## Step 1: Supabase Cloud Setup

### 1.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Configure:
   - **Name**: aprils-pest-control
   - **Database Password**: (generate strong password)
   - **Region**: East US (Ohio) - closest to Tampa, FL
   - **Pricing Plan**: Pro (recommended for production)

### 1.2 Apply Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### 1.3 Configure Authentication

1. Go to Authentication > Providers
2. Enable Email provider
3. Configure SMTP settings for production emails:
   - SMTP Host: (your email provider)
   - SMTP Port: 587
   - SMTP User: (your email)
   - SMTP Password: (your password)
   - Sender Email: noreply@yourdomain.com

### 1.4 Configure Storage Buckets

Storage buckets should be created automatically by the migration. Verify:

1. Go to Storage
2. Confirm buckets exist:
   - `attachments` (private)
   - `avatars` (public)
   - `documents` (private)

### 1.5 Get API Keys

1. Go to Settings > API
2. Note down:
   - **Project URL**: `https://YOUR_PROJECT.supabase.co`
   - **Anon Key**: (publishable key for frontend)
   - **Service Role Key**: (secret key for backend - never expose!)

## Step 2: Vercel Deployment

### 2.1 Connect Repository

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select the repository

### 2.2 Configure Build Settings

- **Framework Preset**: Vite
- **Root Directory**: `./` (keep as is)
- **Build Command**: `npm run --workspace=src/frontend build:vercel`
- **Output Directory**: `src/frontend/dist`
- **Install Command**: `npm install`

### 2.3 Environment Variables

Add the following environment variables in Vercel:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_APP_NAME=April's Pest Control
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEMO_MODE=false
```

### 2.4 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Access your site at `https://your-project.vercel.app`

### 2.5 Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your domain: `app.aprilspestcontrol.com`
3. Configure DNS records as instructed
4. Enable SSL (automatic with Vercel)

## Step 3: Post-Deployment Configuration

### 3.1 Update Supabase Auth URLs

1. Go to Supabase > Authentication > URL Configuration
2. Set:
   - **Site URL**: `https://app.aprilspestcontrol.com`
   - **Redirect URLs**: 
     - `https://app.aprilspestcontrol.com/auth/callback`
     - `https://your-project.vercel.app/auth/callback`

### 3.2 Configure RLS Policies

RLS policies are applied via migrations. Verify they're active:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 3.3 Create Initial Organization

Run this in Supabase SQL Editor:

```sql
-- Create April's Pest Control organization
INSERT INTO organizations (name, legal_name, timezone, settings)
VALUES (
  'April''s Pest Control',
  'April''s Pest Control LLC',
  'America/New_York',
  '{"theme": "light", "branding": {"primary_color": "#2E7D32", "company_name": "April''s Pest Control"}}'
);
```

### 3.4 Create Admin User

1. Go to Authentication > Users
2. Click "Add User"
3. Enter admin email and password
4. After user is created, run SQL to set up profile:

```sql
-- Get the auth user ID from the Users table in Supabase dashboard
-- Then create the user profile:
INSERT INTO users (org_id, auth_user_id, email, first_name, last_name, status)
SELECT 
  o.id,
  'AUTH_USER_UUID_HERE',
  'admin@aprilspestcontrol.com',
  'April',
  'Admin',
  'active'
FROM organizations o
WHERE o.name = 'April''s Pest Control';

-- Assign admin role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'admin' AND r.org_id = u.org_id
WHERE u.email = 'admin@aprilspestcontrol.com';
```

## Step 4: Monitoring & Maintenance

### 4.1 Vercel Analytics

1. Enable Analytics in Vercel project settings
2. Monitor:
   - Page load times
   - Core Web Vitals
   - Error rates

### 4.2 Supabase Monitoring

1. Go to Reports in Supabase dashboard
2. Monitor:
   - Database performance
   - API usage
   - Auth statistics

### 4.3 Database Backups

Supabase Pro plan includes:
- Daily automatic backups
- Point-in-time recovery (7 days)

### 4.4 Logs

- **Vercel**: Functions > Logs
- **Supabase**: Logs in dashboard (postgres, auth, storage, edge functions)

## Environment Variables Reference

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGciOi...` |
| `VITE_APP_NAME` | Application name | `April's Pest Control` |
| `VITE_APP_VERSION` | Current version | `1.0.0` |
| `VITE_ENABLE_DEMO_MODE` | Enable demo features | `false` |

### Backend (if using separate NestJS)

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | `eyJhbGciOi...` |
| `SUPABASE_JWT_SECRET` | JWT secret from Supabase | `your-jwt-secret` |
| `DATABASE_URL` | Direct Postgres URL | `postgresql://...` |

## Troubleshooting

### Build Failures

```bash
# Clear Vercel cache
vercel --prod --force

# Check build logs
vercel logs
```

### Database Connection Issues

1. Check connection string in Supabase dashboard
2. Verify IP allowlist (Settings > Database)
3. Check RLS policies aren't blocking requests

### Auth Issues

1. Verify redirect URLs in Supabase
2. Check JWT expiration settings
3. Verify user has correct role assignments

### Storage Issues

1. Verify bucket policies
2. Check file size limits
3. Verify allowed MIME types

## Security Checklist

- [ ] Environment variables are set (not in code)
- [ ] Service role key is NOT exposed to frontend
- [ ] RLS is enabled on all tables
- [ ] CORS settings are configured
- [ ] HTTPS is enforced
- [ ] Rate limiting is configured
- [ ] Database passwords are strong
- [ ] Regular security updates applied

## Rollback Procedure

### Frontend (Vercel)

1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

### Database (Supabase)

1. Go to Database > Backups
2. Select restore point
3. Restore to new database or in-place

## Support

- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Internal Support**: support@compassiq.com

