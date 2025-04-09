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

async def test_chatbot():
    """Test the chatbot with different queries to verify it's working correctly"""
    
    # Initialize the chatbot
    print("Initializing AI agent and chatbot...")
    ai_agent = EnhancedAIAgent()
    chatbot = MedicalChatbot()
    
    # Test with the broken arm query that was previously failing
    test_query = "I was at the gym and doing gym, I broke my arm what are the things should we consider for now?"
    print(f"\nTesting query: '{test_query}'")
    
    # Get response
    response = await chatbot.generate_response(test_query)
    print("\nResponse:")
    print("-" * 80)
    print(response)
    print("-" * 80)
    
    # Clear history for next test
    chatbot.clear_history()
    
    # Test with a different query for comparison
    test_query2 = "What are common symptoms of flu and cold?"
    print(f"\nTesting query: '{test_query2}'")
    
    # Get response
    response2 = await chatbot.generate_response(test_query2)
    print("\nResponse:")
    print("-" * 80)
    print(response2)
    print("-" * 80)
    
    print("\nTest completed!")

if __name__ == "__main__":
    asyncio.run(test_chatbot()) 