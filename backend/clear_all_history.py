import os
import sys
import django
import logging
import shutil
import json
from django.db import connection

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
        # 1. Clear all session chats from the database - MOST IMPORTANT
        logger.info("Clearing session chats from the Session model...")
        sessions = Session.objects.all()
        session_count = sessions.count()
        
        logger.info(f"Found {session_count} sessions to clear")
        
        # Log some details about the sessions before clearing
        for i, session in enumerate(sessions):
            if i < 5:  # Only log details for the first 5 sessions to avoid too much output
                chat_count = len(session.session_chats) if session.session_chats else 0
                logger.info(f"Session {session.id} for {session.user_email.name} has {chat_count} chats")
        
        # Clear the session chats
        for session in sessions:
            # Save the original length for logging
            original_length = len(session.session_chats) if session.session_chats else 0
            
            # Clear the chats
            session.session_chats = []
            session.save()
            
            logger.info(f"Cleared {original_length} chats from session {session.id}")
        
        logger.info(f"Successfully cleared chats from {session_count} sessions")
        
        # 2. Verify that sessions are actually empty
        empty_sessions = 0
        non_empty_sessions = 0
        
        for session in Session.objects.all():
            if not session.session_chats or len(session.session_chats) == 0:
                empty_sessions += 1
            else:
                non_empty_sessions += 1
                logger.warning(f"Session {session.id} still has {len(session.session_chats)} chats after clearing")
        
        logger.info(f"Verification: {empty_sessions} sessions are empty, {non_empty_sessions} still have chats")
        
        if non_empty_sessions > 0:
            logger.warning("Some sessions still have chats. Attempting more aggressive clearing...")
            
            # Try direct SQL update as a last resort
            try:
                cursor = connection.cursor()
                cursor.execute("UPDATE user_session_session SET session_chats = '[]'")
                logger.info("Applied direct SQL update to clear session_chats")
            except Exception as e:
                logger.error(f"Error applying direct SQL update: {str(e)}")
        
        # 3. Delete all user-specific conversation history directories
        ai_agent_dir = os.path.join(os.path.dirname(__file__), 'ai_agent')
        
        # Ensure directories exist to prevent future errors
        chatbot_histories_dir = os.path.join(ai_agent_dir, 'conversation_histories')
        agent_histories_dir = os.path.join(ai_agent_dir, 'agent_histories')
        os.makedirs(chatbot_histories_dir, exist_ok=True)
        os.makedirs(agent_histories_dir, exist_ok=True)
        logger.info(f"Ensured history directories exist")
        
        # Clear all chatbot conversation histories
        if os.path.exists(chatbot_histories_dir):
            # Count the files to be deleted
            chatbot_files = [f for f in os.listdir(chatbot_histories_dir) if f.endswith('.pkl')]
            
            # Delete each file
            for file_name in chatbot_files:
                file_path = os.path.join(chatbot_histories_dir, file_name)
                os.remove(file_path)
                logger.info(f"Removed chatbot history file: {file_name}")
                
            logger.info(f"Cleared {len(chatbot_files)} chatbot history files")
        else:
            logger.info("No chatbot histories directory found")
            
        # Clear all AI agent memory histories
        agent_histories_dir = os.path.join(ai_agent_dir, 'agent_histories')
        if os.path.exists(agent_histories_dir):
            # Count the files to be deleted
            agent_files = [f for f in os.listdir(agent_histories_dir) if f.endswith('.pkl')]
            
            # Delete each file
            for file_name in agent_files:
                file_path = os.path.join(agent_histories_dir, file_name)
                os.remove(file_path)
                logger.info(f"Removed agent history file: {file_name}")
                
            logger.info(f"Cleared {len(agent_files)} agent history files")
        else:
            logger.info("No agent histories directory found")
        
        # 4. Remove any legacy history pickle files
        for file_name in ['conversation_history.pkl', 'agent_history.pkl']:
            file_path = os.path.join(ai_agent_dir, file_name)
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Removed legacy history file: {file_path}")
        
        # 5. Clear all user instances from the cache in views.py
        from ai_agent.views import user_chatbots, user_ai_agents
        
        # Clear the user chatbot cache
        user_count = len(user_chatbots)
        user_chatbots.clear()
        user_ai_agents.clear()
        logger.info(f"Cleared {user_count} cached user instances")
        
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