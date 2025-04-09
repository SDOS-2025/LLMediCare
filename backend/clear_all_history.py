import os
import sys
import django
import logging
import shutil
import json

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'LLMediCare.settings')
django.setup()

# Now import Django models
from user_session.models import Session
from ai_agent.chatbot import MedicalChatbot
from ai_agent.ai_handler import EnhancedAIAgent

def clear_all_user_history():
    """Clear all user history data"""
    try:
        # 1. Clear all session chats from the database
        sessions = Session.objects.all()
        session_count = sessions.count()
        
        for session in sessions:
            session.session_chats = []
            session.save()
        
        logger.info(f"Cleared chats from {session_count} sessions")
        
        # 2. Delete the AI agent's conversation history files
        chatbot = MedicalChatbot()
        ai_agent = EnhancedAIAgent()
        
        # Clear the chatbot's conversation history
        chatbot_result = chatbot.clear_history()
        logger.info(f"Cleared chatbot conversation history: {chatbot_result}")
        
        # Clear the AI agent's memory
        ai_agent.clear_memory()
        logger.info("Cleared AI agent memory")
        
        # 3. Remove any history pickle files
        ai_agent_dir = os.path.join(os.path.dirname(__file__), 'ai_agent')
        
        for file_name in ['conversation_history.pkl', 'agent_history.pkl']:
            file_path = os.path.join(ai_agent_dir, file_name)
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Removed history file: {file_path}")
        
        return True
    except Exception as e:
        logger.error(f"Error clearing history: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == '__main__':
    logger.info("Starting history clearing process...")
    success = clear_all_user_history()
    if success:
        logger.info("Successfully cleared all user history!")
    else:
        logger.error("Failed to clear all user history") 