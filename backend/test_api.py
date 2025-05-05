#!/usr/bin/env python
"""
API Test Script

This script tests if your Django API is functioning correctly and can be accessed
from the internet via ngrok.
"""

import sys
import requests
import time
import json

def test_api_connection(base_url):
    """Test basic connection to the API server."""
    print(f"\n1. Testing basic connection to {base_url}...")
    try:
        response = requests.get(base_url, timeout=5)
        print(f"  Status Code: {response.status_code}")
        if response.status_code < 400:
            print("  ✅ Connection successful!")
            return True
        else:
            print("  ❌ Connection failed - received an error status code.")
            return False
    except requests.RequestException as e:
        print(f"  ❌ Connection failed: {e}")
        return False

def test_user_api(base_url):
    """Test access to the user API endpoints."""
    test_email = "test@example.com"
    user_api_url = f"{base_url}/api/user/users/fetch-by-email/?email={test_email}"
    
    print(f"\n2. Testing user API at {user_api_url}...")
    try:
        # Add timestamp to avoid caching
        params = {'_t': int(time.time())}
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        start_time = time.time()
        response = requests.get(
            user_api_url, 
            headers=headers,
            params=params,
            timeout=10
        )
        end_time = time.time()
        
        print(f"  Response time: {(end_time - start_time) * 1000:.2f}ms")
        print(f"  Status Code: {response.status_code}")
        print(f"  Response Headers: {json.dumps(dict(response.headers), indent=2)}")
        
        if response.status_code < 400:
            print("  Response Content:")
            try:
                print(f"  {json.dumps(response.json(), indent=2)}")
            except:
                print(f"  {response.text[:200]}...")
            print("  ✅ User API test successful!")
            return True
        else:
            print("  ❌ User API test failed - error status code.")
            print(f"  Response: {response.text[:200]}...")
            return False
    except requests.RequestException as e:
        print(f"  ❌ User API test failed: {e}")
        return False

def main():
    """Main function to run tests."""
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = "https://b574-2405-201-4018-6162-1c04-5bae-f2aa-34b.ngrok-free.app"
    
    print(f"Testing API endpoints at {base_url}")
    print("=" * 70)
    
    connection_ok = test_api_connection(base_url)
    
    if connection_ok:
        user_api_ok = test_user_api(base_url)
    else:
        print("\n❌ Skipping API tests due to connection failure.")
        user_api_ok = False
    
    print("\nSummary:")
    print("=" * 70)
    print(f"Basic Connection: {'✅ Success' if connection_ok else '❌ Failed'}")
    print(f"User API Access:  {'✅ Success' if user_api_ok else '❌ Failed'}")
    
    if not (connection_ok and user_api_ok):
        print("\nTroubleshooting tips:")
        print("  - Make sure your Django server is running")
        print("  - Verify ngrok is correctly forwarding to your Django port")
        print("  - Check that CORS settings in your Django app are correct")
        print("  - Ensure your firewall isn't blocking the connections")
        print("  - Try using a tool like curl or Postman to test the API manually")

if __name__ == "__main__":
    main() 