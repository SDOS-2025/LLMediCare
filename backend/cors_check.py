"""
CORS Configuration Helper Script

This script helps you check your current CORS configuration and provides guidance
on how to fix common CORS issues.

Run this script before starting your Django server:
python cors_check.py
"""

import os
import sys
import re

def check_settings_file():
    """Check if settings.py exists and contains proper CORS configuration"""
    settings_path = os.path.join('LLMediCare', 'settings.py')
    
    if not os.path.exists(settings_path):
        print(f"Error: {settings_path} not found!")
        return False
    
    with open(settings_path, 'r') as f:
        content = f.read()
    
    # Check for django-cors-headers in INSTALLED_APPS
    if 'corsheaders' not in content:
        print("Error: 'corsheaders' not found in INSTALLED_APPS.")
        print("Add 'corsheaders' to INSTALLED_APPS in your settings.py file.")
        return False
    
    # Check for CorsMiddleware
    if 'corsheaders.middleware.CorsMiddleware' not in content:
        print("Error: CorsMiddleware not found in MIDDLEWARE.")
        print("Add 'corsheaders.middleware.CorsMiddleware' at the beginning of MIDDLEWARE in your settings.py file.")
        return False
    
    # Check CORS configuration
    has_origins = 'CORS_ALLOWED_ORIGINS' in content
    has_all_origins = 'CORS_ALLOW_ALL_ORIGINS = True' in content
    
    if not (has_origins or has_all_origins):
        print("Error: No CORS origin configuration found.")
        print("Add either CORS_ALLOWED_ORIGINS or CORS_ALLOW_ALL_ORIGINS to your settings.py file.")
        return False
    
    return True

def update_cors_origins():
    """Update CORS_ALLOWED_ORIGINS in settings.py"""
    settings_path = os.path.join('LLMediCare', 'settings.py')
    
    with open(settings_path, 'r') as f:
        content = f.read()
    
    # Check if CORS_ALLOWED_ORIGINS is already defined
    if 'CORS_ALLOWED_ORIGINS' in content:
        origins_pattern = r'CORS_ALLOWED_ORIGINS\s*=\s*\[(.*?)\]'
        match = re.search(origins_pattern, content, re.DOTALL)
        
        if match:
            current_origins = match.group(1).strip()
            # Check if Netlify domain is already included
            if 'splendorous-melba-fc5384.netlify.app' not in current_origins:
                new_origins = current_origins
                if current_origins:  # If there are already some origins
                    if not current_origins.endswith(','):
                        new_origins += ','
                    new_origins += '\n    "https://splendorous-melba-fc5384.netlify.app",  # Allow requests from Netlify'
                else:
                    new_origins = '"https://splendorous-melba-fc5384.netlify.app",  # Allow requests from Netlify'
                
                new_content = re.sub(
                    origins_pattern, 
                    f'CORS_ALLOWED_ORIGINS = [{new_origins}]', 
                    content, 
                    flags=re.DOTALL
                )
                
                with open(settings_path, 'w') as f:
                    f.write(new_content)
                
                print("Added 'https://splendorous-melba-fc5384.netlify.app' to CORS_ALLOWED_ORIGINS.")
            else:
                print("CORS_ALLOWED_ORIGINS already includes the Netlify domain.")
        else:
            print("Could not parse CORS_ALLOWED_ORIGINS. Please update manually.")
    else:
        # If CORS_ALLOWED_ORIGINS is not defined, add it
        allowed_hosts_pattern = r'ALLOWED_HOSTS\s*=\s*\[(.*?)\]'
        match = re.search(allowed_hosts_pattern, content, re.DOTALL)
        
        if match:
            # Add after ALLOWED_HOSTS
            new_content = re.sub(
                allowed_hosts_pattern,
                f'ALLOWED_HOSTS = [{match.group(1)}]\n\nCORS_ALLOWED_ORIGINS = [\n    "http://localhost:3000",  # Local development\n    "https://splendorous-melba-fc5384.netlify.app",  # Netlify frontend\n]',
                content,
                flags=re.DOTALL
            )
            
            with open(settings_path, 'w') as f:
                f.write(new_content)
            
            print("Added CORS_ALLOWED_ORIGINS configuration to settings.py.")
        else:
            print("Could not find a good place to add CORS_ALLOWED_ORIGINS. Please update manually.")

def check_cors_credentials():
    """Check if CORS_ALLOW_CREDENTIALS is set properly"""
    settings_path = os.path.join('LLMediCare', 'settings.py')
    
    with open(settings_path, 'r') as f:
        content = f.read()
    
    # Check if CORS_ALLOW_CREDENTIALS is set to True
    if 'CORS_ALLOW_CREDENTIALS = True' not in content:
        # Add CORS_ALLOW_CREDENTIALS
        if 'CORS_ALLOWED_ORIGINS' in content:
            # Add after CORS_ALLOWED_ORIGINS
            new_content = content.replace(
                'CORS_ALLOWED_ORIGINS', 
                'CORS_ALLOWED_ORIGINS', 1
            )
            
            if 'CORS_ALLOW_CREDENTIALS' not in new_content:
                # Find the closing bracket of CORS_ALLOWED_ORIGINS
                origins_end = new_content.find(']', new_content.find('CORS_ALLOWED_ORIGINS'))
                if origins_end != -1:
                    new_content = (
                        new_content[:origins_end+1] +
                        '\n\nCORS_ALLOW_CREDENTIALS = True  # Allow credentials (cookies, auth headers)' +
                        new_content[origins_end+1:]
                    )
                    
                    with open(settings_path, 'w') as f:
                        f.write(new_content)
                    
                    print("Added CORS_ALLOW_CREDENTIALS = True configuration.")
                else:
                    print("Could not find a good place to add CORS_ALLOW_CREDENTIALS. Please update manually.")
        else:
            print("CORS_ALLOWED_ORIGINS not found. Please add CORS_ALLOW_CREDENTIALS manually.")
    else:
        print("CORS_ALLOW_CREDENTIALS is already set to True.")

def main():
    """Main function to run all checks"""
    print("Checking Django CORS configuration...")
    
    if check_settings_file():
        print("CORS middleware and app are properly configured.")
        
        # Update CORS origins if needed
        update_cors_origins()
        
        # Check CORS credentials
        check_cors_credentials()
        
        print("\nCORS check completed. Your settings should allow requests from:")
        print("- Local development (http://localhost:3000)")
        print("- Netlify frontend (https://splendorous-melba-fc5384.netlify.app)")
        print("\nIf you're still having CORS issues, try adding your Netlify domain to ALLOWED_HOSTS as well.")
    else:
        print("\nPlease fix the CORS configuration issues before proceeding.")

if __name__ == "__main__":
    main() 