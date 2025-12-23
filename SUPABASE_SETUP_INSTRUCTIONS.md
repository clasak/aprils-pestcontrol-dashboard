# Supabase Setup Instructions

## Quick Setup (5 minutes)

Your Vercel deployment needs a cloud Supabase project. Follow these steps:

### Step 1: Create Supabase Project (2 minutes)

1. **Go to Supabase:** https://app.supabase.com
2. **Sign in** (use GitHub for fastest setup)
3. **Click "New Project"**
4. **Fill in details:**
   - **Name:** `aprils-pestcontrol-crm` (or any name you prefer)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users (e.g., `us-east-1`)
   - **Pricing Plan:** Free tier is fine for now
5. **Click "Create new project"**
6. **Wait ~2 minutes** for project to provision

### Step 2: Run Database Migrations (3 minutes)

Once your project is ready:

#### Option A: Using Supabase SQL Editor (Easiest)

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste each migration file in order:
   - First: `supabase/migrations/20231223000001_create_core_tables.sql`
   - Second: `supabase/migrations/20231223000002_create_crm_tables.sql`
   - Third: `supabase/migrations/20231223000003_create_rls_policies.sql`
   - Fourth: `supabase/migrations/20231223000004_auth_trigger.sql`
   - Fifth: `supabase/migrations/20231223000005_update_to_nine_stages.sql`
   - Sixth: `supabase/migrations/20231223000006_seed_organizations.sql`
   - Seventh: `supabase/migrations/20231223000007_storage_setup.sql`
4. Run each query by clicking **"Run"**

#### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project (get project ref from dashboard URL)
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Step 3: Get Your Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### Step 4: Add to Vercel

Now add these to your Vercel project:

```bash
# Run the setup script
./scripts/setup-vercel-env.sh
```

Or manually:

```bash
# Add VITE_SUPABASE_URL
echo "https://your-project.supabase.co" | npx vercel env add VITE_SUPABASE_URL production

# Add VITE_SUPABASE_ANON_KEY
echo "your-anon-key-here" | npx vercel env add VITE_SUPABASE_ANON_KEY production
```

### Step 5: Configure Supabase Auth URLs

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL:**
   - `https://aprils-pestcontrol-dashboard-fronte.vercel.app`
3. Add to **Redirect URLs:**
   - `https://aprils-pestcontrol-dashboard-fronte.vercel.app/**`
   - `http://localhost:3000/**` (for local development)
   - `http://localhost:3001/**` (for local development)

### Step 6: Redeploy Vercel

```bash
# Trigger a new deployment
npx vercel --prod
```

Or go to Vercel dashboard → Deployments → Redeploy

---

## Verification Checklist

✅ Supabase project created  
✅ All 7 migrations run successfully  
✅ Storage buckets created (logos, attachments, avatars)  
✅ Environment variables added to Vercel  
✅ Auth URLs configured in Supabase  
✅ Vercel redeployed  

---

## Testing Your Deployment

1. Visit your Vercel URL
2. Open browser console (F12)
3. You should see: `🔌 Supabase: Cloud (https://your-project.supabase.co)`
4. Try to sign up/login
5. ✅ Success!

---

## Troubleshooting

### "Failed to fetch" errors
- Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Vercel
- Verify the values are correct (no extra spaces)
- Redeploy after adding variables

### "Invalid API key" errors
- Make sure you're using the **anon/public** key, not the service_role key
- The anon key should start with `eyJ`

### Authentication redirect errors
- Add your Vercel URL to Supabase Auth → URL Configuration
- Include the `/**` wildcard for redirect URLs

### Database connection errors
- Verify all migrations ran successfully
- Check Supabase dashboard → Database → Tables to see if tables exist
- Look at Supabase logs for errors

---

## Local Development

For local development, you can use the local Supabase instance:

```bash
# Start local Supabase
supabase start

# Your app will automatically use:
# URL: http://127.0.0.1:54321
# Key: (demo key from supabase.ts)
```

No environment variables needed for local development!

---

## Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Check Logs:**
  - Vercel: Dashboard → Deployments → [deployment] → Logs
  - Supabase: Dashboard → Logs

