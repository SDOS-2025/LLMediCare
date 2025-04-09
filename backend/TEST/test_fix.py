import asyncio
import logging
import sys
import os

# Add parent directory to path so we can import modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai_agent.ai_handler import EnhancedAIAgent
from ai_agent.chatbot import MedicalChatbot

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    # Initialize the chatbot
    print("Initializing AI agent and chatbot...")
    chatbot = MedicalChatbot()
    
    # Test with a broken arm query
    query = "I was at the gym and doing gym, I broke my arm what are the things should we consider for now?"
    print(f"Testing query: '{query}'")
    
    # Get response from chatbot
    response = await chatbot.generate_response(query)
    print("\nChatbot Response:")
    print("-" * 80)
    print(response)
    print("-" * 80)
    
    # Count the number of section headers in the response
    sections = ["**Information**", "**Symptoms**", "**Recommendations**", "**Medical Disclaimer**", "**Next Steps**"]
    section_count = 0
    
    for section in sections:
        section_count += response.count(section)
    
    print(f"Number of section headers found: {section_count}")
    print(f"Expected number of section headers: 4")
    
    if section_count > 4:
        print("❌ ISSUE DETECTED: Duplicate sections found in response!")
    else:
        print("✅ TEST PASSED: No duplicate sections detected.")

if __name__ == "__main__":
    # Run the async function
    asyncio.run(main()) 