# CORS Troubleshooting Tools

This directory contains several tools to help diagnose and fix CORS issues in the LLMediCare application.

## Quick Start Guide

1. **Fix common CORS issues automatically**:

   ```bash
   cd LLMediCare/backend
   python fix_cors.py
   ```

2. **Test your API directly**:

   ```bash
   python test_api_direct.py YOUR_NGROK_URL [EMAIL]
   ```

3. **Check Django configuration**:
   ```bash
   python check_django.py
   ```

## Available Tools

### 1. `fix_cors.py`

This script automatically fixes common CORS issues by:

- Updating Django settings to enable CORS
- Ensuring middleware is correctly configured
- Adding commonly needed origins to allowed list
- Fixing frontend API configuration

### 2. `test_api_direct.py`

Tests API endpoints directly from the command line to determine if the issue is with the API itself or with CORS/browser policies.

```bash
python test_api_direct.py YOUR_NGROK_URL [EMAIL]
```

This script will:

- Test the API with standard headers
- Test the API with browser-like headers
- Test preflight OPTIONS requests
- Detect and report common issues

### 3. `update_cors_settings.py`

Allows you to view, update, and test your CORS configuration:

```bash
# View current CORS allowed origins:
python update_cors_settings.py show

# Add new origins to the allowed list:
python update_cors_settings.py add https://example.com

# Test CORS configuration:
python update_cors_settings.py test YOUR_NGROK_URL
```

### 4. `check_django.py`

Tests if Django is properly configured and running:

```bash
python check_django.py [NGROK_URL]
```

## Frontend Tools

### 1. API Configuration Page

We've added a browser-based tool to update your API URL without redeploying the frontend. To use it:

1. Open your frontend application
2. Navigate to `/api-config.html`
3. Update the API URL to your ngrok URL
4. Click "Update API URL" and refresh the main application

### 2. Enhanced Environment Configuration

The frontend now supports multiple ways to configure the API URL:

1. **Local Storage** (highest priority): Set via the API Configuration page
2. **Runtime Config**: Set via `window.APP_CONFIG` in `netlify-config.js`
3. **Environment Config**: Based on development/production environments

## Common CORS Issues and Solutions

See the detailed [CORS Troubleshooting Guide](CORS_TROUBLESHOOTING.md) for common issues and solutions.

## Next Steps After Fixing CORS

1. Restart your Django server
2. Test your API directly using `test_api_direct.py`
3. Update the frontend API URL using the API Configuration page
4. Test the frontend application
