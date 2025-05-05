#!/usr/bin/env python
"""
CORS Issue Fixer

This script fixes common CORS issues by:
1. Updating Django settings to enable CORS
2. Ensuring middleware is correctly configured
3. Adding commonly needed origins to allowed list
"""

import os
import re
import sys
import json

def fix_settings():
    """Update Django settings to fix CORS issues"""
    settings_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'LLMediCare', 'settings.py')
    
    if not os.path.exists(settings_file):
        print(f"❌ Settings file not found at {settings_file}")
        return False
    
    with open(settings_file, 'r') as f:
        content = f.read()
    
    # List of changes to make
    changes = []
    
    # 1. Ensure CORS_ALLOW_ALL_ORIGINS is set to True
    if 'CORS_ALLOW_ALL_ORIGINS = True' not in content:
        if 'CORS_ALLOW_ALL_ORIGINS' in content:
            # Update existing setting
            content = re.sub(
                r'CORS_ALLOW_ALL_ORIGINS\s*=\s*False',
                'CORS_ALLOW_ALL_ORIGINS = True  # Temporarily allow all origins for testing',
                content
            )
            changes.append("Updated CORS_ALLOW_ALL_ORIGINS to True")
        else:
            # Add the setting
            cors_section = "\n# CORS settings\nCORS_ALLOW_ALL_ORIGINS = True  # Temporarily allow all origins for testing\n"
            if 'DATABASES' in content:
                # Add after DATABASES section
                content = re.sub(
                    r'(DATABASES\s*=\s*\{.*?\}\n)',
                    r'\1\n' + cors_section,
                    content,
                    flags=re.DOTALL
                )
            else:
                # Add to end of file
                content += cors_section
            changes.append("Added CORS_ALLOW_ALL_ORIGINS = True")
    
    # 2. Ensure CORS_ALLOW_CREDENTIALS is set to True
    if 'CORS_ALLOW_CREDENTIALS = True' not in content:
        if 'CORS_ALLOW_CREDENTIALS' in content:
            # Update existing setting
            content = re.sub(
                r'CORS_ALLOW_CREDENTIALS\s*=\s*False',
                'CORS_ALLOW_CREDENTIALS = True',
                content
            )
            changes.append("Updated CORS_ALLOW_CREDENTIALS to True")
        else:
            # Add the setting after CORS_ALLOW_ALL_ORIGINS
            if 'CORS_ALLOW_ALL_ORIGINS' in content:
                content = content.replace(
                    'CORS_ALLOW_ALL_ORIGINS = True',
                    'CORS_ALLOW_ALL_ORIGINS = True  # Temporarily allow all origins for testing\nCORS_ALLOW_CREDENTIALS = True',
                    1
                )
            else:
                content += "\nCORS_ALLOW_CREDENTIALS = True\n"
            changes.append("Added CORS_ALLOW_CREDENTIALS = True")
    
    # 3. Ensure CORS_ALLOWED_ORIGINS is set but commented out
    required_origins = [
        '"http://localhost:3000"',
        '"https://splendorous-melba-fc5384.netlify.app"'
    ]
    
    if 'CORS_ALLOWED_ORIGINS' not in content:
        # Add commented CORS_ALLOWED_ORIGINS
        origins_str = ',\n#     '.join(required_origins)
        cors_config = f'\n# Keep these commented until we resolve the issue\n# CORS_ALLOWED_ORIGINS = [\n#     {origins_str}\n# ]\n'
        
        if 'CORS_ALLOW_CREDENTIALS = True' in content:
            # Add after CORS_ALLOW_CREDENTIALS
            content = content.replace(
                'CORS_ALLOW_CREDENTIALS = True',
                'CORS_ALLOW_CREDENTIALS = True' + cors_config,
                1
            )
        else:
            content += cors_config
        changes.append("Added commented CORS_ALLOWED_ORIGINS")
    
    # 4. Ensure CORS_ALLOW_HEADERS is set to wildcard
    if 'CORS_ALLOW_HEADERS = [\'*\']' not in content:
        if 'CORS_ALLOW_HEADERS' in content:
            # Update existing setting
            if re.search(r'CORS_ALLOW_HEADERS\s*=\s*\[\s*\'\*\'\s*\]', content):
                pass  # Already set correctly
            else:
                content = re.sub(
                    r'CORS_ALLOW_HEADERS\s*=\s*\[.*?\]',
                    "CORS_ALLOW_HEADERS = ['*']",
                    content,
                    flags=re.DOTALL
                )
                changes.append("Updated CORS_ALLOW_HEADERS to ['*']")
        else:
            # Add the setting
            content += "\n# Allow all headers for testing\nCORS_ALLOW_HEADERS = ['*']\n"
            changes.append("Added CORS_ALLOW_HEADERS = ['*']")
    
    # 5. Ensure CORS_ALLOW_METHODS includes all methods
    all_methods = [
        "'DELETE'",
        "'GET'",
        "'OPTIONS'",
        "'PATCH'",
        "'POST'",
        "'PUT'",
    ]
    if not re.search(r'CORS_ALLOW_METHODS\s*=\s*\[', content):
        # Add the setting
        methods_str = ',\n    '.join(all_methods)
        cors_methods = f"CORS_ALLOW_METHODS = [\n    {methods_str},\n]"
        content += f"\n{cors_methods}\n"
        changes.append("Added CORS_ALLOW_METHODS with all methods")
    
    # Write the updated content back to the file
    with open(settings_file, 'w') as f:
        f.write(content)
    
    # Report changes
    if changes:
        print("✅ Updated Django settings:")
        for change in changes:
            print(f"  - {change}")
    else:
        print("✓ Django settings already correctly configured for CORS")
    
    return True

def fix_middleware():
    """Ensure middleware is correctly configured in settings.py"""
    settings_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'LLMediCare', 'settings.py')
    
    if not os.path.exists(settings_file):
        print(f"❌ Settings file not found at {settings_file}")
        return False
    
    with open(settings_file, 'r') as f:
        content = f.read()
    
    # Check if corsheaders middleware is in MIDDLEWARE
    cors_middleware = "'corsheaders.middleware.CorsMiddleware'"
    custom_middleware = "'user_session.middleware.CORSMiddleware'"
    
    middleware_changes = []
    
    if cors_middleware not in content:
        # Add corsheaders middleware at the beginning of MIDDLEWARE
        content = re.sub(
            r'(MIDDLEWARE\s*=\s*\[)',
            f'\\1\n    {cors_middleware},  # Should be at the top',
            content
        )
        middleware_changes.append(f"Added {cors_middleware}")
    
    # Ensure corsheaders middleware is before other middleware
    middleware_match = re.search(r'MIDDLEWARE\s*=\s*\[(.*?)\]', content, re.DOTALL)
    if middleware_match:
        middleware_list = middleware_match.group(1).strip().split(',')
        middleware_list = [m.strip() for m in middleware_list if m.strip()]
        
        # Find positions of the middleware
        cors_index = -1
        common_index = -1
        for i, m in enumerate(middleware_list):
            if cors_middleware in m:
                cors_index = i
            if "'django.middleware.common.CommonMiddleware'" in m:
                common_index = i
        
        # Ensure corsheaders middleware is before CommonMiddleware
        if cors_index > common_index and common_index != -1:
            print("⚠️ CorsMiddleware should be placed before CommonMiddleware")
            # This would require more complex manipulation, so just alert the user
    
    # Check custom middleware
    if custom_middleware not in content and "'user_session.middleware.CorsHeaderMiddleware'" not in content:
        # Add custom middleware after corsheaders middleware
        content = re.sub(
            r'(MIDDLEWARE\s*=\s*\[\s*\n.*?corsheaders\.middleware\.CorsMiddleware.*?\n)',
            f'\\1    {custom_middleware},  # Our custom CORS middleware\n',
            content,
            flags=re.DOTALL
        )
        middleware_changes.append(f"Added {custom_middleware}")
    elif "'user_session.middleware.CorsHeaderMiddleware'" in content:
        # Update old middleware name to new one
        content = content.replace(
            "'user_session.middleware.CorsHeaderMiddleware'",
            custom_middleware
        )
        middleware_changes.append("Updated middleware class name to CORSMiddleware")
    
    # Write the updated content back to the file
    with open(settings_file, 'w') as f:
        f.write(content)
    
    # Report changes
    if middleware_changes:
        print("✅ Updated middleware configuration:")
        for change in middleware_changes:
            print(f"  - {change}")
    else:
        print("✓ Middleware already correctly configured")
    
    return True

def fix_frontend_config():
    """Check and fix frontend API configuration"""
    api_config_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend', 'src', 'utils', 'api-config.js')
    
    if not os.path.exists(api_config_file):
        print(f"⚠️ Frontend API config file not found at {api_config_file}")
        return False
    
    with open(api_config_file, 'r') as f:
        content = f.read()
    
    # List of changes to make
    changes = []
    
    # 1. Check if withCredentials is set to false
    if 'withCredentials: false' not in content:
        content = re.sub(
            r'withCredentials:\s*true',
            'withCredentials: false, // No credentials mode to avoid CORS issues',
            content
        )
        changes.append("Set withCredentials to false in axios config")
    
    # 2. Add retry logic for failed requests
    if 'retry' not in content and 'interceptors.response.use' in content:
        # Add retry logic to the error handler in the response interceptor
        retry_code = """
        // Add retry functionality for network errors
        if (error.message.includes("Network Error") || error.code === "ECONNABORTED") {
          const originalRequest = error.config;
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            console.log("[API] Retrying request after network error...");
            return new Promise(resolve => setTimeout(() => resolve(api(originalRequest)), 1000));
          }
        }
"""
        content = content.replace(
            'if (error.response) {',
            retry_code + '      if (error.response) {',
            1
        )
        changes.append("Added retry logic for network errors")
    
    # Write the updated content back to the file
    with open(api_config_file, 'w') as f:
        f.write(content)
    
    # Report changes
    if changes:
        print("✅ Updated frontend API configuration:")
        for change in changes:
            print(f"  - {change}")
    else:
        print("✓ Frontend API config already correctly configured")
    
    return True

def main():
    """Main function to fix all CORS issues"""
    print("==== CORS Issue Fixer ====\n")
    
    print("Fixing Django settings...")
    fix_settings()
    
    print("\nFixing middleware configuration...")
    fix_middleware()
    
    print("\nFixing frontend API configuration...")
    fix_frontend_config()
    
    print("\n==== Fix Complete ====")
    print("\nNext steps:")
    print("1. Restart your Django server")
    print("2. Run 'python test_api_direct.py YOUR_NGROK_URL' to verify the API works")
    print("3. Check the frontend to see if CORS issues are resolved")
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 