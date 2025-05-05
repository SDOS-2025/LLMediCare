#!/usr/bin/env python
"""
This script updates the ngrok URL in Django settings.py.
Run it with: python update_ngrok.py YOUR_NEW_NGROK_URL
Example: python update_ngrok.py https://abc-123-xyz.ngrok-free.app
"""

import sys
import re
import os

def update_settings_file(new_ngrok_url):
    """Update the settings.py file with the new ngrok URL"""
    settings_path = os.path.join('LLMediCare', 'settings.py')
    
    if not os.path.exists(settings_path):
        print(f"Error: {settings_path} not found!")
        return False
    
    with open(settings_path, 'r') as f:
        content = f.read()
    
    # Update ALLOWED_HOSTS
    allowed_hosts_pattern = r'ALLOWED_HOSTS\s*=\s*\[(.*?)\]'
    match = re.search(allowed_hosts_pattern, content, re.DOTALL)
    
    if match:
        hosts_content = match.group(1)
        
        # Extract domain from URL
        import urllib.parse
        domain = urllib.parse.urlparse(new_ngrok_url).netloc
        
        # Check if any ngrok domain is already in the list
        if '.ngrok-free.app' in hosts_content:
            # Replace existing ngrok domain with new one
            new_hosts_content = re.sub(
                r"'[^']*\.ngrok-free\.app'",
                f"'{domain}'",
                hosts_content
            )
        else:
            # Add the new domain to the list
            if hosts_content.strip():
                if hosts_content.strip().endswith(','):
                    new_hosts_content = f"{hosts_content}\n    '{domain}',  # ngrok tunnel"
                else:
                    new_hosts_content = f"{hosts_content},\n    '{domain}',  # ngrok tunnel"
            else:
                new_hosts_content = f"    '{domain}',  # ngrok tunnel"
        
        # Replace the ALLOWED_HOSTS in the content
        updated_content = re.sub(
            allowed_hosts_pattern,
            f'ALLOWED_HOSTS = [{new_hosts_content}]',
            content,
            flags=re.DOTALL
        )
        
        # Write updated content back to the file
        with open(settings_path, 'w') as f:
            f.write(updated_content)
        
        print(f"✅ Updated {settings_path} with new ngrok domain: {domain}")
        return True
    else:
        print(f"❌ Could not find ALLOWED_HOSTS in {settings_path}")
        return False

def update_restart_script(new_ngrok_url):
    """Update the restart_with_cors.sh script with the new ngrok URL"""
    script_path = 'restart_with_cors.sh'
    
    if not os.path.exists(script_path):
        print(f"Warning: {script_path} not found, skipping update")
        return False
    
    with open(script_path, 'r') as f:
        content = f.read()
    
    # Update the ngrok URL in the script
    updated_content = re.sub(
        r'echo "https://[^"]*"',
        f'echo "{new_ngrok_url}"',
        content
    )
    
    # Write updated content back to the file
    with open(script_path, 'w') as f:
        f.write(updated_content)
    
    print(f"✅ Updated {script_path} with new ngrok URL")
    return True

def main():
    """Main function to update ngrok URLs"""
    if len(sys.argv) < 2:
        print("Error: Please provide the new ngrok URL")
        print("Usage: python update_ngrok.py YOUR_NEW_NGROK_URL")
        print("Example: python update_ngrok.py https://abc-123-xyz.ngrok-free.app")
        return 1
    
    new_ngrok_url = sys.argv[1].strip()
    
    # Validate URL format
    if not new_ngrok_url.startswith("https://") or ".ngrok-free.app" not in new_ngrok_url:
        print("Warning: The URL does not look like a valid ngrok URL")
        print("Expected format: https://abc-123-xyz.ngrok-free.app")
        response = input("Continue anyway? (y/n): ")
        if response.lower() != 'y':
            print("Operation cancelled")
            return 0
    
    print(f"Updating ngrok URL to: {new_ngrok_url}")
    
    settings_updated = update_settings_file(new_ngrok_url)
    script_updated = update_restart_script(new_ngrok_url)
    
    if settings_updated or script_updated:
        print("\nUpdate completed!")
        print("\nReminders:")
        print("1. Remember to restart your Django server")
        print("2. Make sure to update your frontend configuration as well")
        print("3. Run 'python manage.py runserver 0.0.0.0:8000' to start the server")
    else:
        print("\n❌ No files were updated")
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 