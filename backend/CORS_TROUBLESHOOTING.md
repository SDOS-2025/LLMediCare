# CORS Troubleshooting Guide

This guide provides instructions for testing and resolving CORS (Cross-Origin Resource Sharing) issues in the LLMediCare application.

## Overview

CORS issues typically appear when:

- The backend doesn't send proper CORS headers
- The frontend is making requests from an origin that's not allowed
- There are issues with credentials (cookies, authentication headers)

## Tools for Testing and Fixing

We've created several tools to help diagnose and resolve CORS issues:

### 1. Test API Directly

The `test_api_direct.py` script tests API endpoints directly from the command line to determine if the issue is with the API itself or with CORS/browser policies.

```bash
cd LLMediCare/backend
python test_api_direct.py NGROK_URL [EMAIL]

# Example:
python test_api_direct.py https://abc-xyz.ngrok-free.app aditya22031@iiitd.ac.in
```

### 2. Update CORS Settings

The `update_cors_settings.py` script allows you to view, update, and test your CORS configuration:

```bash
# To view current CORS allowed origins:
python update_cors_settings.py show

# To add new origins to the allowed list:
python update_cors_settings.py add https://example.com https://another-domain.com

# To test CORS configuration:
python update_cors_settings.py test https://abc-xyz.ngrok-free.app
```

## Common Issues and Solutions

### 1. Missing CORS Headers

**Symptoms**: Browser console shows errors like:

```
Access to fetch at 'https://api.example.com' from origin 'https://frontend.example.com'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

**Solution**:

- Ensure that your middleware is correctly configured in settings.py
- Check that the origin making the request is included in your allowed origins
- Run `python update_cors_settings.py test` to verify CORS headers

### 2. Problems with Credentials

**Symptoms**: Browser console shows errors like:

```
Access to fetch at 'https://api.example.com' from origin 'https://frontend.example.com'
has been blocked by CORS policy: The value of the 'Access-Control-Allow-Credentials'
header in the response is '' which must be 'true' when the request's credentials mode is 'include'.
```

**Solution**:

- Make sure `CORS_ALLOW_CREDENTIALS = True` is set in settings.py
- If specific origins need credentials, they must be explicitly listed (not wildcards)
- Frontend fetch requests must include `credentials: 'include'` option

### 3. Preflight Request Issues

**Symptoms**: Browser sends OPTIONS request that fails or doesn't get proper response

**Solution**:

- Ensure your CORS middleware correctly handles OPTIONS requests
- Check that Access-Control-Allow-Methods includes all methods your API uses
- Verify Access-Control-Allow-Headers includes all headers your requests send

## Testing with Browsers

For browser-based testing:

1. Open DevTools (F12) and go to the Network tab
2. Filter for XHR/Fetch requests
3. Look for failed requests with CORS errors
4. Examine the request and response headers

## Debugging the Middleware

Our custom `CORSMiddleware` includes logging to help diagnose issues:

1. Enable DEBUG level logging in your Django settings
2. Look for log entries showing request origins and response headers
3. Check if the correct headers are being set based on request origin

## Getting Help

If you're still experiencing CORS issues after trying these solutions:

1. Capture the exact error message from the browser console
2. Note which URL and HTTP method is failing
3. Record both the request headers (especially Origin) and response headers
4. Share this information when asking for help
