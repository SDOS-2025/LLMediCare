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
    
    # Test with a flu query
    query = "What are symptoms of flu and cold, and what should I do?"
    print(f"Testing query: '{query}'")
    
    # Get response
    response = await chatbot.generate_response(query)
    print("\nResponse:")
    print("-" * 80)
    print(response)
    print("-" * 80)

if __name__ == "__main__":
    # Run the async function
    asyncio.run(main()) 