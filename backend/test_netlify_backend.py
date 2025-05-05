#!/usr/bin/env python
"""
Netlify Backend Test Script

This script tests the Netlify-deployed backend to ensure it's properly
responding to requests and handling CORS correctly.
"""

import requests
import json
import sys

NETLIFY_BACKEND = "https://devserver-main--splendorous-melba-fc5384.netlify.app"

def test_backend_connection():
    """Test basic connection to the backend"""
    print(f"\nTesting connection to Netlify backend: {NETLIFY_BACKEND}")
    
    try:
        # Try to connect to the root URL
        response = requests.get(f"{NETLIFY_BACKEND}/", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code < 400:
            print("✅ Connection successful!")
        else:
            print(f"❌ Backend returned error status: {response.status_code}")
        
        # Try to connect to the admin URL
        response = requests.get(f"{NETLIFY_BACKEND}/admin/", timeout=10)
        print(f"\nAdmin URL Status: {response.status_code}")
        
        if response.status_code < 400:
            print("✅ Django admin interface is accessible")
        else:
            print("❌ Django admin interface is not accessible")
            
    except requests.RequestException as e:
        print(f"❌ Connection failed: {e}")
        return False
    
    return True

def test_cors_preflight():
    """Test CORS preflight requests"""
    print(f"\nTesting CORS preflight (OPTIONS) request")
    
    try:
        url = f"{NETLIFY_BACKEND}/api/user/users/fetch-by-email/"
        headers = {
            'Origin': 'https://splendorous-melba-fc5384.netlify.app',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type,Accept'
        }
        
        response = requests.options(url, headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        print("CORS Headers:")
        
        # Check important CORS headers
        cors_headers = [
            'Access-Control-Allow-Origin', 
            'Access-Control-Allow-Methods',
            'Access-Control-Allow-Headers',
            'Access-Control-Allow-Credentials'
        ]
        
        for header in cors_headers:
            if header in response.headers:
                print(f"  ✅ {header}: {response.headers[header]}")
            else:
                print(f"  ❌ {header}: Missing")
        
        if ('Access-Control-Allow-Origin' in response.headers and
            'Access-Control-Allow-Methods' in response.headers):
            print("\n✅ CORS preflight requests are working correctly")
        else:
            print("\n❌ CORS preflight requests are not properly configured")
        
    except requests.RequestException as e:
        print(f"❌ CORS test failed: {e}")
        return False
    
    return True

def test_api_endpoints():
    """Test actual API endpoints"""
    print(f"\nTesting API endpoints")
    
    endpoints = [
        "/api/user/users/fetch-by-email/?email=test@example.com"
    ]
    
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://splendorous-melba-fc5384.netlify.app'
    }
    
    for endpoint in endpoints:
        url = f"{NETLIFY_BACKEND}{endpoint}"
        print(f"\nTesting endpoint: {endpoint}")
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            print(f"Status Code: {response.status_code}")
            
            if 'Access-Control-Allow-Origin' in response.headers:
                print(f"✅ CORS header present: {response.headers['Access-Control-Allow-Origin']}")
            else:
                print("❌ Missing CORS headers in response")
            
            if response.status_code < 400:
                print("✅ API endpoint is working")
            else:
                print(f"❌ API endpoint returned error: {response.status_code}")
                
        except requests.RequestException as e:
            print(f"❌ Request failed: {e}")
    
    return True

def main():
    """Main function"""
    print("==== Netlify Backend Test ====")
    
    # Test basic connection
    test_backend_connection()
    
    # Test CORS preflight
    test_cors_preflight()
    
    # Test API endpoints
    test_api_endpoints()
    
    print("\n==== Test Complete ====")
    print("\nFor frontend connection testing:")
    print("1. Open your frontend application")
    print("2. Navigate to /api-config.html")
    print("3. Set the API URL to:", NETLIFY_BACKEND)
    print("4. Test the connection using the 'Test Connection' button")
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 