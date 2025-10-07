# Production Deployment Guide for WMK CRM

## Google Calendar Integration Setup for Production

### 1. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Enable the Google Calendar API
4. Go to "Credentials" → "OAuth 2.0 Client IDs"
5. Update your OAuth client with:

**Authorized JavaScript origins:**
```
https://wrapmykitchen.info:3001
https://wrapmykitchen.info
```

**Authorized redirect URIs:**
```
https://wrapmykitchen.info:3001/auth/google/callback
```

### 2. Environment Variables for Production

Update `.env.production` with:

```bash
NODE_ENV=production
PRODUCTION_URL=https://wrapmykitchen.info:3001
GOOGLE_CALENDAR_ENABLED=true
```

### 3. File Setup for Production

**IMPORTANT:** After uploading the dist folder, copy the credentials file to the server root:

```bash
# In production server (/home/wrapqrqc/wmkreact/), run:
cp dist/client_secret_1057574229248-gfrdb4give2mt8tpr6v09tl385reeafd.apps.googleusercontent.com.json ./

# Restart the server
pm2 restart wmk-crm
# OR if using node directly:
# pkill -f "node.*start.js" && nohup node dist/start.js &
```

**One-liner deployment script:**
```bash
# Copy this into your production server for easy deployment:
cd /home/wrapqrqc/wmkreact && cp dist/client_secret_1057574229248-gfrdb4give2mt8tpr6v09tl385reeafd.apps.googleusercontent.com.json ./ && pm2 restart wmk-crm
```

### 4. Google Calendar Authentication Process

#### For Users:
1. Go to Calendar page
2. Click "Connect Google Calendar" button
3. Authenticate with Google
4. Grant calendar permissions
5. Events will sync both ways

#### For Admin Setup:
1. Make sure the credentials file is in the server directory
2. Ensure the production URL matches Google Console settings
3. Test the auth flow in production

### 4. Troubleshooting

**Issue: Calendar events not showing**
- Check if Google Calendar is authenticated: `/api/calendar/auth/status`
- Verify Google Console settings match production domain
- Check server logs for Google API errors

**Issue: Console logging too much**
- Fixed: Logging is now limited to development mode only
- In production, only errors will be logged

**Issue: Mobile detection spam**
- Fixed: Mobile detection logs only show in development

### 5. Production Checklist

- [ ] Google Console OAuth settings updated for production domain
- [ ] `.env.production` configured with correct PRODUCTION_URL
- [ ] SSL certificate installed for HTTPS
- [ ] Database connection working
- [ ] Google Calendar credentials file present
- [ ] Test Google Calendar authentication flow
- [ ] Test calendar event creation/sync
- [ ] Verify mobile responsiveness
- [ ] Test all dashboard counters

### 6. Manual Google Calendar Authentication

If automatic flow fails, you can manually authenticate:

1. Visit: `/auth/google` 
2. Complete OAuth flow
3. Should redirect to `/auth/google/callback`
4. Check `/api/calendar/auth/status` should return `{"authenticated": true}`

### 7. Calendar Features Available

- ✅ View local calendar events
- ✅ Create/edit/delete events
- ✅ Sync to Google Calendar (when authenticated)
- ✅ Two-way sync (Google → Local)
- ✅ Event colors and categories
- ✅ Installation scheduling
- ✅ Follow-up reminders
