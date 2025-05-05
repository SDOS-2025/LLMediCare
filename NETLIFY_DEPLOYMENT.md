# Netlify Deployment Guide

This guide provides instructions on how to deploy the LLMediCare application to Netlify and resolve CORS issues.

## Frontend Deployment

1. **Sign in to Netlify** and create a new site from Git.

2. **Select your repository** and use these build settings:

   - Build command: `CI=false npm run build`
   - Publish directory: `build`

3. **Deploy the site** and note the URL Netlify assigns (e.g., `https://splendorous-melba-fc5384.netlify.app`)

## Backend Deployment

1. **Create a new Netlify site** for the backend:

   - Build command: `python manage.py collectstatic --noinput`
   - Publish directory: `staticfiles`

2. **Deploy the backend** and note the URL (e.g., `https://devserver-main--splendorous-melba-fc5384.netlify.app`)

3. **Set up Netlify Functions** to handle CORS:
   - The `netlify/functions` directory contains serverless functions to handle CORS
   - These functions will proxy requests to your Django backend

## Configuration Files

The following configuration files have been set up:

1. **Frontend Configuration**:

   - `frontend/netlify.toml`: Netlify build settings and headers
   - `frontend/src/utils/environment.js`: API URL configuration
   - `frontend/public/netlify-config.js`: Runtime configuration

2. **Backend Configuration**:
   - `backend/netlify.toml`: Netlify build settings, headers, and redirects
   - `backend/netlify/functions/cors-handler.js`: Handles OPTIONS preflight requests
   - `backend/netlify/functions/api-proxy.js`: Proxies API requests to Django

## Fixing CORS Issues

If you're still experiencing CORS issues:

1. **Check the Network Tab** in browser DevTools to see the exact error.

2. **Verify the Origins** in your CORS configuration match the actual frontend URL.

3. **Use the Netlify Functions** to handle CORS for you:

   - Make sure your frontend is sending requests to the Netlify Functions URL
   - The functions will add the necessary CORS headers to responses

4. **Test API Endpoint Directly** using the test tools provided in `netlify-test.html`.

## Troubleshooting

### URL Duplication Issue

If you see URLs being duplicated in requests like:

```
https://devserver-main--splendorous-melba-fc5384.netlify.apphttps://devserver-main--splendorous-melba-fc5384.netlify.app/api/...
```

This has been fixed in the `api-config.js` file by modifying the `debugRequest` function to properly handle absolute URLs.

### 401 Unauthorized Errors

If you're seeing 401 errors:

1. Check if authentication is required for your API
2. Ensure cookies are being properly sent with `credentials: 'include'`
3. Configure your backend to accept credentials from your frontend origin

### Firebase Auth Errors

For Firebase authentication errors (400 responses):

1. Check that your Firebase configuration is correct
2. Verify the API key is valid and has the necessary permissions
3. Make sure the Firebase project is properly set up for the authentication methods you're using

## Deployment Checklist

1. ✅ Update API URLs in frontend configuration
2. ✅ Set up CORS headers in backend
3. ✅ Configure Netlify serverless functions
4. ✅ Test API endpoints directly
5. ✅ Deploy both frontend and backend to Netlify
