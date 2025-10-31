# CORS Fix Instructions

## Problem Identified
The OTP registration is failing because of a **CORS (Cross-Origin Resource Sharing)** error. The browser is blocking requests from your Vercel frontend to your Render backend.

### Error Message
```
Access to fetch at 'https://chaitanya-4r5f.onrender.com/api/register/start' 
from origin 'https://chaitanya-subdomain.vercel.app' has been blocked by CORS policy
```

## What Was Fixed

### 1. Enhanced CORS Configuration (`backend/server.js`)
- ✅ Added explicit origin validation function
- ✅ Whitelisted Vercel domain and localhost ports
- ✅ Added regex pattern to allow all Vercel preview deployments (`/\.vercel\.app$/`)
- ✅ Configured proper HTTP methods: GET, POST, PUT, DELETE, OPTIONS
- ✅ Set allowed headers: Content-Type, Authorization, X-Requested-With
- ✅ Added preflight cache (maxAge: 600 seconds)

### 2. Explicit OPTIONS Handler
- ✅ Added `app.options('*', cors(corsOptions))` to handle preflight requests

## Deployment Steps

### Step 1: Update Vercel Domain
In `backend/server.js` line 65, replace the placeholder with your **actual Vercel domain**:

```javascript
const allowedOrigins = [
  'https://your-actual-vercel-domain.vercel.app', // ← UPDATE THIS
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  /\.vercel\.app$/
];
```

### Step 2: Deploy to Render
1. Commit the changes:
   ```bash
   git add backend/server.js
   git commit -m "Fix CORS policy for Vercel frontend"
   git push origin main
   ```

2. Render will auto-deploy (if connected to GitHub)
   - Or manually trigger deployment in Render dashboard

### Step 3: Verify CORS Headers
After deployment, test the endpoint:

```bash
curl -I -X OPTIONS https://chaitanya-4r5f.onrender.com/api/register/start \
  -H "Origin: https://your-vercel-domain.vercel.app" \
  -H "Access-Control-Request-Method: POST"
```

Expected response headers:
```
Access-Control-Allow-Origin: https://your-vercel-domain.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

### Step 4: Test Registration Flow
1. Open your Vercel frontend
2. Fill in personal details
3. Submit registration
4. Check browser console - CORS error should be gone
5. OTP should be sent to email

## Additional Checks

### Environment Variables on Render
Ensure these are set in Render dashboard:
- `SMTP_HOST` (e.g., smtp.gmail.com)
- `SMTP_PORT` (587)
- `SMTP_USER` (your email)
- `SMTP_PASS` (app password)
- `EMAIL_FROM` (sender email address)

### If CORS Still Fails
1. Check Render logs for CORS warnings
2. Verify the exact Vercel domain (no trailing slash)
3. Ensure Render service is running (not sleeping)
4. Try clearing browser cache

## Testing Locally
To test CORS locally before deploying:

1. Start backend:
   ```bash
   cd backend
   npm start
   ```

2. Update frontend API URL to `http://localhost:3000`

3. Test registration flow

## Summary
- **Root Cause**: CORS policy blocking cross-origin requests
- **Solution**: Enhanced CORS configuration with explicit origin whitelist
- **Next Step**: Update Vercel domain in code and redeploy to Render
- **Expected Result**: Registration requests will succeed, OTP emails will be sent

---

**Note**: The regex `/\.vercel\.app$/` allows all Vercel preview deployments automatically, so you don't need to update the code for each preview URL.
