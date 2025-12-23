# Vercel Deployment Setup

## Required Environment Variables

To successfully deploy this application on Vercel, you need to configure the following environment variables in your Vercel project settings.

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Select your project (or create one if you haven't)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 2: Configure Vercel Environment Variables

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add the following variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `VITE_APP_NAME` | April's Pest Control Dashboard | All (already in vercel.json) |
| `VITE_APP_VERSION` | 1.0.0 | All (already in vercel.json) |

### Step 3: Redeploy

After adding the environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **•••** menu on the latest deployment
3. Select **Redeploy**
4. ✅ Your deployment should now succeed!

## Verifying Deployment

Once deployed, verify your application:

1. Visit your deployment URL (e.g., `https://your-app.vercel.app`)
2. Check the browser console (F12) - you should see:
   ```
   🔌 Supabase: Cloud (https://xxxxx.supabase.co)
   ```
3. Try logging in to confirm Supabase connection works

## Troubleshooting

### Build Fails with "VITE_SUPABASE_URL is undefined"

- ✅ Make sure environment variables are set in Vercel dashboard
- ✅ Ensure variables are enabled for "Production" environment
- ✅ Redeploy after adding variables

### App loads but can't connect to Supabase

- ✅ Verify your Supabase project is active
- ✅ Check that your Supabase URL and anon key are correct
- ✅ Ensure your Supabase project has the database tables created (run migrations)

### Authentication doesn't work

- ✅ Check Supabase Auth settings
- ✅ Add your Vercel domain to Supabase "Site URL" and "Redirect URLs"
- ✅ Go to Supabase Dashboard → Authentication → URL Configuration
- ✅ Add: `https://your-app.vercel.app` to allowed redirect URLs

## Local Development vs Production

### Local Development
- Uses local Supabase instance: `http://127.0.0.1:54321`
- Uses demo anon key for local development
- No environment variables needed

### Production (Vercel)
- Uses your cloud Supabase project
- Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Environment variables must be set in Vercel dashboard

## Database Migrations

Don't forget to run migrations on your production Supabase instance:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

Or run migrations directly in the Supabase SQL Editor by copying the contents of:
- `supabase/migrations/20231223000001_create_core_tables.sql`
- `supabase/migrations/20231223000002_create_crm_tables.sql`
- `supabase/migrations/20231223000003_create_rls_policies.sql`
- `supabase/migrations/20231223000004_auth_trigger.sql`
- `supabase/migrations/20231223000005_update_to_nine_stages.sql`
- `supabase/migrations/20231223000006_seed_organizations.sql`
- `supabase/migrations/20231223000007_storage_setup.sql`

## Support

If you continue to have issues:
1. Check Vercel deployment logs for specific errors
2. Check Supabase logs for database/auth errors
3. Verify all environment variables are set correctly
4. Ensure your Supabase project is on a paid plan (if needed for your usage)

