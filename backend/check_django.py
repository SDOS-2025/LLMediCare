#!/usr/bin/env python
"""
Django Configuration Checker

This script checks if Django is properly configured and running.
"""

import os
import sys
import importlib
import subprocess
import socket
import requests
import time
from urllib.parse import urlparse

def check_django_installation():
    """Check if Django is installed and what version"""
    try:
        import django
        print(f"✅ Django is installed (version {django.get_version()})")
        return True
    except ImportError:
        print("❌ Django is not installed. Install it with: pip install django")
        return False

def check_settings():
    """Check if Django settings can be loaded"""
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'LLMediCare.settings')
        import django
        django.setup()
        from django.conf import settings
        
        # Check critical settings
        print(f"✅ Django settings loaded successfully")
        print(f"DEBUG mode: {'ON' if settings.DEBUG else 'OFF'}")
        print(f"ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
        
        # Check CORS settings
        if hasattr(settings, 'CORS_ALLOWED_ORIGINS'):
            print(f"CORS_ALLOWED_ORIGINS: {settings.CORS_ALLOWED_ORIGINS}")
        if hasattr(settings, 'CORS_ALLOW_ALL_ORIGINS'):
            print(f"CORS_ALLOW_ALL_ORIGINS: {settings.CORS_ALLOW_ALL_ORIGINS}")
        if hasattr(settings, 'CORS_ALLOW_CREDENTIALS'):
            print(f"CORS_ALLOW_CREDENTIALS: {settings.CORS_ALLOW_CREDENTIALS}")
            
        return True
    except Exception as e:
        print(f"❌ Error loading Django settings: {e}")
        return False

def check_port_in_use(port):
    """Check if a port is in use"""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(("127.0.0.1", port))
        return False
    except socket.error:
        return True
    finally:
        s.close()

def test_server_startup():
    """Try to start the Django server and check if it responds"""
    try:
        # Check if port 8000 is already in use
        if check_port_in_use(8000):
            print("Port 8000 is already in use. Testing connection to existing server...")
            try:
                response = requests.get("http://127.0.0.1:8000/admin/", timeout=2)
                print(f"✅ Server is already running (status code: {response.status_code})")
                return True
            except requests.RequestException:
                print("❌ Port 8000 is in use but server is not responding")
                return False
        
        print("Starting Django development server for testing...")
        process = subprocess.Popen(
            [sys.executable, "manage.py", "runserver", "--noreload"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait for server to start
        time.sleep(3)
        
        try:
            # Test connection to server
            response = requests.get("http://127.0.0.1:8000/admin/", timeout=2)
            if response.status_code == 200 or response.status_code == 302:
                print(f"✅ Server started successfully (status code: {response.status_code})")
                return True
            else:
                print(f"⚠️ Server responded with status code {response.status_code}")
                return False
        except requests.RequestException as e:
            print(f"❌ Error connecting to server: {e}")
            return False
        finally:
            # Stop the server
            process.terminate()
            stdout, stderr = process.communicate(timeout=5)
            if stderr:
                print(f"Server output: {stderr.decode('utf-8')}")
    except Exception as e:
        print(f"❌ Error testing server: {e}")
        return False

def check_ngrok_url(url):
    """Check if an ngrok URL is valid and accessible"""
    if not url:
        print("No ngrok URL provided")
        return False
        
    parsed = urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        print(f"❌ Invalid URL format: {url}")
        return False
        
    if 'ngrok' not in parsed.netloc:
        print(f"⚠️ URL does not appear to be an ngrok URL: {url}")
        
    try:
        response = requests.get(f"{url}/admin/", timeout=5)
        print(f"✅ ngrok URL is accessible (status code: {response.status_code})")
        return True
    except requests.RequestException as e:
        print(f"❌ Error accessing ngrok URL: {e}")
        return False

def main():
    """Main function to run all checks"""
    print("==== Django Configuration Check ====\n")
    
    # Step 1: Check Django installation
    if not check_django_installation():
        print("\nFix Django installation before continuing")
        return 1
        
    # Step 2: Check settings
    print("\n--- Checking Django Settings ---")
    check_settings()
    
    # Step 3: Test server startup
    print("\n--- Testing Django Server ---")
    test_server_startup()
    
    # Step 4: Check ngrok URL if provided
    if len(sys.argv) > 1:
        print("\n--- Checking ngrok URL ---")
        check_ngrok_url(sys.argv[1])
    
    print("\n==== Check Complete ====")
    return 0

if __name__ == "__main__":
    sys.exit(main()) 