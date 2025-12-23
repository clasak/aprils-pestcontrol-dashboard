# Troubleshooting Guide

## Issue: Seeing "Branch360 Local Preview" or HTML file list instead of Dashboard

If you're seeing a simple HTML page listing files instead of the React dashboard, this means the Vite dev server isn't running or you're accessing the wrong server.

### Solution 1: Restart the Development Server

**For Docker deployment:**
```bash
# Stop all containers
npm run docker:down

# Start fresh
npm run deploy:dev
```

**For localhost deployment:**
```bash
# Stop any running processes (Ctrl+C)
# Then restart
npm run deploy:localhost
```

### Solution 2: Verify Vite Dev Server is Running

Check if the Vite dev server is actually running:

```bash
# Check if port 8080 is in use
lsof -i :8080

# Or check Docker containers
docker-compose ps frontend
```

### Solution 3: Clear Browser Cache

1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use Ctrl+Shift+R (Cmd+Shift+R on Mac)

### Solution 4: Check the Correct URL

Make sure you're accessing:
- ✅ **Correct**: http://localhost:8080
- ❌ **Wrong**: Any other port or local file path

### Solution 5: Verify Frontend is Building

Check the frontend logs:

```bash
# Docker logs
npm run docker:logs:frontend

# Or if running locally, check the terminal where you ran deploy:localhost
```

You should see Vite output like:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
```

### Solution 6: Manual Frontend Start

If deployment scripts aren't working, start manually:

```bash
# Navigate to frontend
cd src/frontend

# Install dependencies (if needed)
npm install

# Start dev server
npm run dev
```

### Solution 7: Check for Port Conflicts

If port 8080 is already in use by another application:

1. **Find what's using port 8080:**
   ```bash
   lsof -i :8080
   ```

2. **Kill the process** or **change the port** in `.env`:
   ```env
   FRONTEND_PORT=3001
   ```

3. **Update vite.config.ts** if needed:
   ```typescript
   server: {
     port: 3001, // Match your .env
   }
   ```

### Solution 8: Verify React App is Loading

Open browser DevTools Console (F12) and check for:
- ✅ No errors
- ✅ React app mounting messages
- ✅ Network requests to `/src/main.tsx`

If you see errors, they'll help identify the issue.

### Solution 9: Rebuild Everything

If nothing works, do a clean rebuild:

```bash
# Stop everything
npm run docker:down

# Clean install
rm -rf node_modules src/*/node_modules
npm install

# Rebuild and start
npm run deploy:dev
```

## Expected Behavior

When working correctly, you should see:

1. **Login Page** (if not authenticated) at http://localhost:8080/auth/login
   - Material-UI styled login form
   - "Welcome Back" heading
   - Email and password fields

2. **Dashboard** (if authenticated) at http://localhost:8080
   - Sidebar navigation with modules
   - "April's Pest Control" branding
   - Module cards (Sales, Operations, etc.)

## Still Not Working?

1. Check `DEPLOYMENT.md` for detailed setup instructions
2. Verify all prerequisites are installed (Node.js 20+, Docker)
3. Check service logs: `npm run docker:logs`
4. Verify environment variables in `.env` file

