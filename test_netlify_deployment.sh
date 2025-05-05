#!/bin/bash

# Test Netlify Deployment Script
# This script helps diagnose issues with the Netlify deployment

# Set up environment
FRONTEND_URL="https://splendorous-melba-fc5384.netlify.app"
BACKEND_URL="https://devserver-main--splendorous-melba-fc5384.netlify.app"

echo "===== LLMediCare Netlify Deployment Test ====="
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL: $BACKEND_URL"
echo

# Test backend connectivity
echo "1. Testing Backend Connectivity..."
echo "   Sending request to $BACKEND_URL"

# Use curl to test connectivity
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL")
if [ "$RESPONSE" == "000" ]; then
    echo "   ❌ Connection failed: Could not connect to backend"
else
    echo "   ✅ Connection successful! HTTP Status: $RESPONSE"
fi

# Test OPTIONS preflight
echo
echo "2. Testing CORS Preflight Request..."
echo "   Sending OPTIONS request to $BACKEND_URL/api/user/users/fetch-by-email/"

CORS_RESPONSE=$(curl -s -I -X OPTIONS \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Accept" \
  "$BACKEND_URL/api/user/users/fetch-by-email/")

echo "   Response headers:"
echo "$CORS_RESPONSE" | grep -i "access-control" || echo "   ❌ No CORS headers found in response"

# Test API endpoint
echo
echo "3. Testing API Endpoint..."
echo "   Sending GET request to $BACKEND_URL/api/user/users/fetch-by-email/"

API_RESPONSE=$(curl -s -H "Origin: $FRONTEND_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  "$BACKEND_URL/api/user/users/fetch-by-email/?email=test@example.com")

if [ -z "$API_RESPONSE" ]; then
    echo "   ❌ No response body received"
else
    echo "   ✅ Response received"
    echo "   Response preview: ${API_RESPONSE:0:100}..."
fi

# Check for React warning fixes
echo
echo "4. Testing React Warnings..."
if [ -f "LLMediCare/frontend/netlify.toml" ]; then
    if grep -q "CI=false" "LLMediCare/frontend/netlify.toml"; then
        echo "   ✅ CI=false is set in netlify.toml (warnings won't fail build)"
    else
        echo "   ❌ CI=false not found in netlify.toml"
    fi
else
    echo "   ❌ netlify.toml not found in frontend directory"
fi

# Summary
echo
echo "===== Test Summary ====="
echo "1. To fix CORS issues, deploy the Netlify functions"
echo "2. To fix React warnings, ensure CI=false is set in the build command"
echo "3. For detailed browser testing, open $FRONTEND_URL/netlify-test.html"
echo
echo "See NETLIFY_DEPLOYMENT.md for detailed deployment instructions" 