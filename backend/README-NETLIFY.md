# Using the Netlify Backend Server

This document provides instructions for using the Netlify-deployed backend server instead of ngrok.

## Overview

Instead of using ngrok for exposing your local backend, you can now use the Netlify-deployed backend at:

```
https://devserver-main--splendorous-melba-fc5384.netlify.app
```

This provides a more stable and consistent backend URL that doesn't change every time you restart ngrok.

## Configuration Updates

The following files have been updated to use the Netlify backend:

1. **Frontend Environment**:

   - `frontend/src/utils/environment.js`: Updated production URL
   - `frontend/public/netlify-config.js`: Updated runtime configuration

2. **Backend Settings**:
   - `backend/LLMediCare/settings.py`: Added Netlify backend to ALLOWED_HOSTS
   - `backend/user_session/middleware.py`: Added Netlify backend to allowed origins

## Testing Tools

We've created several tools to help you test the Netlify backend:

### Backend Tests

Run the following script to test the Netlify backend from your local machine:

```bash
python test_netlify_backend.py
```

This will check:

- Basic connectivity to the backend server
- CORS preflight request handling
- API endpoint functionality

### Frontend Tests

Two HTML pages are available for testing the connection from the frontend:

1. **API Configuration Page**:

   - URL: `/api-config.html`
   - Use this to update the API URL to the Netlify backend
   - Test basic connectivity

2. **Netlify Test Page**:
   - URL: `/netlify-test.html`
   - Tests direct connection, CORS preflight, and API endpoints
   - Provides detailed error reporting

## Troubleshooting

If you encounter issues connecting to the Netlify backend:

1. **401 Unauthorized Errors**:

   - The Netlify backend might require authentication
   - Check if there are specific credentials needed for the Netlify deployment

2. **CORS Issues**:

   - Check that your frontend origin is allowed in the backend CORS settings
   - Look for CORS errors in the browser console

3. **Connection Timeouts**:
   - Ensure the Netlify server is running and properly deployed
   - Check Netlify logs for any deployment issues

## Migrating Back to Local Development

If you need to switch back to local development:

1. Open `/api-config.html` in your frontend
2. Click "Reset to Default" to revert to the environment-specific URL
3. Refresh your application to apply the changes

## Next Steps

1. Test the connectivity using the provided testing tools
2. Update your frontend to use the Netlify backend
3. Deploy your frontend to Netlify to ensure everything works end-to-end
