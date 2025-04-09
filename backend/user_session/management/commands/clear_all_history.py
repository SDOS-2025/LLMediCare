import os
import logging
from django.core.management.base import BaseCommand

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Clear all user history data, including session chats and AI agent memory'

    def handle(self, *args, **options):
        try:
            self.stdout.write(self.style.SUCCESS('Starting history clearing process...'))
            
            # Import models here to avoid circular import issues
            from user_session.models import SessionChat
            from ai_agent.chatbot import MedicalChatbot
            from ai_agent.ai_handler import EnhancedAIAgent
            
            # 1. Clear all session chat records from the database
            session_chat_count = SessionChat.objects.count()
            SessionChat.objects.all().delete()
            self.stdout.write(self.style.SUCCESS(f"Deleted {session_chat_count} session chat records"))
            
            # 2. Delete the AI agent's conversation history files
            chatbot = MedicalChatbot()
            ai_agent = EnhancedAIAgent()
            
            # Clear the chatbot's conversation history
            chatbot_result = chatbot.clear_history()
            self.stdout.write(self.style.SUCCESS(f"Cleared chatbot conversation history: {chatbot_result}"))
            
            # Clear the AI agent's memory
            ai_agent.clear_memory()
            self.stdout.write(self.style.SUCCESS("Cleared AI agent memory"))
            
            # 3. Remove any history pickle files
            ai_agent_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'ai_agent')
            
            for file_name in ['conversation_history.pkl', 'agent_history.pkl']:
                file_path = os.path.join(ai_agent_dir, file_name)
                if os.path.exists(file_path):
                    os.remove(file_path)
                    self.stdout.write(self.style.SUCCESS(f"Removed history file: {file_path}"))
            
            self.stdout.write(self.style.SUCCESS('Successfully cleared all user history!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error clearing history: {e}")) 