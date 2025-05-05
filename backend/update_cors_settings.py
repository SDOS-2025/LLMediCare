#!/usr/bin/env python
"""
Update CORS Settings Script

This script updates the CORS_ALLOWED_ORIGINS in settings.py and can test
the current CORS configuration to ensure it's correctly set up.
"""

import os
import re
import sys
import json
import requests

# Fix the path to settings.py
SETTINGS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'LLMediCare', 'settings.py')

def get_current_cors_origins():
    """Read the current CORS_ALLOWED_ORIGINS from settings.py"""
    if not os.path.exists(SETTINGS_FILE):
        print(f"Error: Settings file not found at {SETTINGS_FILE}")
        return []
    
    with open(SETTINGS_FILE, 'r') as f:
        content = f.read()
    
    cors_pattern = r'CORS_ALLOWED_ORIGINS\s*=\s*\[(.*?)\]'
    match = re.search(cors_pattern, content, re.DOTALL)
    
    if match:
        origins_text = match.group(1).strip()
        origins = []
        for line in origins_text.split('\n'):
            # Extract quoted strings
            for quoted_str in re.findall(r'[\'"](.+?)[\'"]', line):
                if quoted_str:
                    origins.append(quoted_str)
        return origins
    else:
        print("Could not find CORS_ALLOWED_ORIGINS in settings.py")
        return []

def update_cors_origins(new_origins):
    """Update the CORS_ALLOWED_ORIGINS in settings.py"""
    if not os.path.exists(SETTINGS_FILE):
        print(f"Error: Settings file not found at {SETTINGS_FILE}")
        return False
    
    current_origins = get_current_cors_origins()
    
    # Combine current and new origins, removing duplicates
    updated_origins = list(set(current_origins + new_origins))
    
    # Format the list for settings.py
    origins_str = ',\n    '.join([f'"{origin}"' for origin in updated_origins])
    cors_config = f'CORS_ALLOWED_ORIGINS = [\n    {origins_str}\n]'
    
    with open(SETTINGS_FILE, 'r') as f:
        content = f.read()
    
    # Replace the CORS_ALLOWED_ORIGINS section
    cors_pattern = r'CORS_ALLOWED_ORIGINS\s*=\s*\[.*?\]'
    updated_content = re.sub(cors_pattern, cors_config, content, flags=re.DOTALL)
    
    if updated_content == content:
        print("Warning: CORS_ALLOWED_ORIGINS not found or no changes made")
        return False
    
    # Write the updated content back to the file
    with open(SETTINGS_FILE, 'w') as f:
        f.write(updated_content)
    
    print(f"Updated CORS_ALLOWED_ORIGINS with: {', '.join(new_origins)}")
    return True

def test_cors_config(base_url):
    """Test the CORS configuration with an OPTIONS request"""
    test_url = f"{base_url}/api/user/users/fetch-by-email/"
    origins_to_test = [
        "https://splendorous-melba-fc5384.netlify.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    print(f"\nTesting CORS configuration at {test_url}")
    
    for origin in origins_to_test:
        print(f"\nTesting with Origin: {origin}")
        headers = {
            'Origin': origin,
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type,Accept',
        }
        
        try:
            # Send OPTIONS request to test CORS headers
            response = requests.options(test_url, headers=headers, timeout=10)
            
            print(f"Status Code: {response.status_code}")
            print("Response Headers:")
            for header, value in response.headers.items():
                print(f"  {header}: {value}")
            
            # Check for critical CORS headers
            if 'Access-Control-Allow-Origin' in response.headers:
                if response.headers['Access-Control-Allow-Origin'] == origin or response.headers['Access-Control-Allow-Origin'] == '*':
                    print(f"✅ Origin {origin} is allowed")
                else:
                    print(f"❌ Origin mismatch. Expected {origin}, got {response.headers['Access-Control-Allow-Origin']}")
            else:
                print("❌ Missing Access-Control-Allow-Origin header")
                
            # Also test a GET request
            print(f"\nTesting GET request with Origin: {origin}")
            get_headers = {
                'Origin': origin,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            response = requests.get(f"{test_url}?email=test@example.com", headers=get_headers, timeout=10)
            
            print(f"Status Code: {response.status_code}")
            print("CORS Headers:")
            for header in ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers']:
                if header in response.headers:
                    print(f"  {header}: {response.headers[header]}")
                else:
                    print(f"  {header}: ❌ Missing")
                    
        except requests.RequestException as e:
            print(f"Error testing CORS for {origin}: {e}")

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage:")
        print("  1. To update CORS origins:")
        print("     python update_cors_settings.py add ORIGIN1 ORIGIN2 ...")
        print("     Example: python update_cors_settings.py add https://example.com http://localhost:3000")
        print("\n  2. To view current CORS origins:")
        print("     python update_cors_settings.py show")
        print("\n  3. To test CORS configuration:")
        print("     python update_cors_settings.py test BACKEND_URL")
        print("     Example: python update_cors_settings.py test https://abc-xyz.ngrok-free.app")
        return 1
    
    cmd = sys.argv[1].lower()
    
    if cmd == "show":
        origins = get_current_cors_origins()
        print("\nCurrent CORS_ALLOWED_ORIGINS:")
        for origin in origins:
            print(f"  - {origin}")
        print()
        
    elif cmd == "add" and len(sys.argv) > 2:
        origins_to_add = sys.argv[2:]
        update_cors_origins(origins_to_add)
        print("\nUpdated CORS_ALLOWED_ORIGINS:")
        for origin in get_current_cors_origins():
            print(f"  - {origin}")
        print()
        
    elif cmd == "test" and len(sys.argv) > 2:
        backend_url = sys.argv[2].strip().rstrip('/')
        test_cors_config(backend_url)
        
    else:
        print("Invalid command or missing arguments. Run the script without arguments for usage information.")
        return 1
        
    return 0

if __name__ == "__main__":
    sys.exit(main()) 