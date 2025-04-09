import asyncio
import logging
import requests
import json
import sys
import os

# Add parent directory to path so we can import modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_api():
    """Test the chatbot API endpoint to verify responses are not duplicated"""
    
    print("Testing chatbot API endpoint...")
    
    url = 'http://localhost:8000/api/ai/chat/'
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    # Test with the broken arm query
    payload = {
        'query': 'I was at the gym and doing gym, I broke my arm what are the things should we consider for now?'
    }
    
    try:
        print(f"Sending request to {url}...")
        response = requests.post(url, headers=headers, json=payload)
        
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            text_response = data.get('response', '')
            
            print("\nAPI Response:")
            print("-" * 80)
            print(text_response)
            print("-" * 80)
            
            # Count the number of section headers in the response
            sections = ["**Information**", "**Symptoms**", "**Recommendations**", "**Medical Disclaimer**", "**Next Steps**"]
            section_count = 0
            
            for section in sections:
                section_count += text_response.count(section)
            
            print(f"Number of section headers found: {section_count}")
            print(f"Expected number of section headers: 4")
            
            if section_count > 4:
                print("❌ ISSUE DETECTED: Duplicate sections found in API response!")
            else:
                print("✅ TEST PASSED: No duplicate sections detected in API response.")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        print("❌ TEST FAILED: Could not connect to the API endpoint.")
        print("Make sure the server is running with: python manage.py runserver")

if __name__ == "__main__":
    test_api() 