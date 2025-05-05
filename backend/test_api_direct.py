#!/usr/bin/env python
"""
Direct API Test Script

This script directly tests the API endpoint that's failing in the frontend.
It helps determine if the issue is with the API itself or with CORS/browser policies.
"""

import requests
import json
import sys
import time

def check_common_issues(response):
    """Check for common API issues and provide suggestions"""
    issues = []
    
    # Check status code
    if response.status_code >= 500:
        issues.append(f"❌ Server error (status {response.status_code}): The server encountered an internal error")
    elif response.status_code == 404:
        issues.append("❌ Not Found (404): The API endpoint doesn't exist at this URL")
    elif response.status_code == 401:
        issues.append("❌ Unauthorized (401): Authentication is required but missing")
    elif response.status_code == 403:
        issues.append("❌ Forbidden (403): The server understood the request but refuses to authorize it")
    
    # Check CORS headers
    if 'Access-Control-Allow-Origin' not in response.headers:
        issues.append("❌ CORS issue: Missing 'Access-Control-Allow-Origin' header")
    
    # Check content type
    content_type = response.headers.get('Content-Type', '')
    if response.status_code < 400 and 'application/json' not in content_type and response.text:
        issues.append(f"⚠️ Unexpected content type: {content_type} (expected application/json)")
        # Check if it looks like HTML
        if response.text.strip().startswith(('<html', '<!DOCTYPE')):
            issues.append("⚠️ Response appears to be HTML instead of JSON. This often means you're hitting a web page, not an API endpoint")
    
    return issues

def test_user_api(base_url, email):
    """Test the user API endpoint directly."""
    url = f"{base_url}/api/user/users/fetch-by-email/"
    params = {'email': email}
    
    print(f"\nTesting user API at {url}")
    print(f"Email parameter: {email}")
    
    try:
        # First, try with standard headers
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        print("\n1. Testing with standard headers:")
        print(f"Headers: {headers}")
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {json.dumps(dict(response.headers), indent=2)}")
        
        # Check for common issues
        issues = check_common_issues(response)
        if issues:
            print("\nIssues detected:")
            for issue in issues:
                print(f"  {issue}")
        
        if response.status_code < 400:
            print("Response Content:")
            try:
                print(json.dumps(response.json(), indent=2))
            except:
                print(response.text[:500])
        else:
            print(f"Error Response: {response.text[:500]}")
            
        # Next, try with browser-like headers
        browser_headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Origin': 'https://splendorous-melba-fc5384.netlify.app',
            'Referer': 'https://splendorous-melba-fc5384.netlify.app/'
        }
        
        print("\n2. Testing with browser-like headers:")
        print(f"Headers: {browser_headers}")
        
        response = requests.get(url, params=params, headers=browser_headers, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {json.dumps(dict(response.headers), indent=2)}")
        
        # Check for common issues
        issues = check_common_issues(response)
        if issues:
            print("\nIssues detected:")
            for issue in issues:
                print(f"  {issue}")
        
        if response.status_code < 400:
            print("Response Content:")
            try:
                print(json.dumps(response.json(), indent=2))
            except:
                print(response.text[:500])
        else:
            print(f"Error Response: {response.text[:500]}")
        
        # Finally, test OPTIONS request (preflight)
        print("\n3. Testing OPTIONS request (preflight):")
        options_headers = {
            'Origin': 'https://splendorous-melba-fc5384.netlify.app',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type,Accept'
        }
        print(f"Headers: {options_headers}")
        
        response = requests.options(url, headers=options_headers, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {json.dumps(dict(response.headers), indent=2)}")
        
        # Check if preflight succeeded
        if 'Access-Control-Allow-Origin' in response.headers and 'Access-Control-Allow-Methods' in response.headers:
            print("\n✅ Preflight request successful")
        else:
            print("\n❌ Preflight request failed - missing CORS headers")
        
    except requests.RequestException as e:
        print(f"Error testing API: {e}")
        return False
        
    return True

def main():
    """Main function to run the test."""
    if len(sys.argv) < 2:
        print("Error: Please provide the ngrok URL")
        print("Usage: python test_api_direct.py NGROK_URL [EMAIL]")
        print("Example: python test_api_direct.py https://abc-xyz.ngrok-free.app aditya22031@iiitd.ac.in")
        return 1
    
    ngrok_url = sys.argv[1].strip().rstrip('/')
    email = sys.argv[2] if len(sys.argv) > 2 else "aditya22031@iiitd.ac.in"
    
    print(f"Testing API at: {ngrok_url}")
    print(f"Using email: {email}")
    
    test_user_api(ngrok_url, email)
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 