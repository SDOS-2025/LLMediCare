import os
import sys
import django
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'LLMediCare.settings')
django.setup()

# Now import Django models and database connection
from django.db import connection
from user_session.models import Session, User

def clear_all_sessions():
    """Reset all session data and chat history"""
    try:
        # 1. Get information about existing sessions first (for logging)
        sessions = Session.objects.all()
        session_count = sessions.count()
        
        logger.info(f"Found {session_count} sessions in the database")
        
        # Show some details about the first few sessions
        total_chats = 0
        for i, session in enumerate(sessions):
            if i < 5:  # Only show details for a few sessions
                chat_count = len(session.session_chats) if session.session_chats else 0
                if session.user_email:
                    logger.info(f"Session {session.id} for user {session.user_email.email} has {chat_count} chats")
                else:
                    logger.info(f"Session {session.id} (no user) has {chat_count} chats")
            if session.session_chats:
                total_chats += len(session.session_chats)
        
        logger.info(f"Found a total of {total_chats} chat messages across all sessions")
        
        # 2. Try to clear using Django ORM first
        logger.info("Attempting to clear session_chats using Django ORM...")
        updated_count = 0
        
        for session in sessions:
            if session.session_chats and len(session.session_chats) > 0:
                session.session_chats = []
                session.save(update_fields=["session_chats"])
                updated_count += 1
        
        logger.info(f"Updated {updated_count} sessions using Django ORM")
        
        # 3. Use direct SQL as a more aggressive approach
        logger.info("Using direct SQL to ensure all session_chats are empty...")
        
        with connection.cursor() as cursor:
            # This will set ALL session_chats to empty arrays, regardless of previous state
            cursor.execute("UPDATE user_session_session SET session_chats = '[]'")
            rows_affected = cursor.rowcount
            logger.info(f"SQL UPDATE affected {rows_affected} rows")
        
        # 4. Verify that it worked
        logger.info("Verifying all sessions are empty...")
        non_empty_sessions = Session.objects.exclude(session_chats=[]).count()
        
        if non_empty_sessions > 0:
            logger.warning(f"Found {non_empty_sessions} sessions that still have chat history!")
            # Final aggressive approach - delete and recreate all sessions
            logger.warning("Taking aggressive approach: deleting all sessions and recreating empty ones")
            
            # Save user emails first
            user_emails = []
            for session in Session.objects.all():
                if session.user_email and session.user_email.email not in user_emails:
                    user_emails.append(session.user_email.email)
            
            # Delete all sessions
            Session.objects.all().delete()
            logger.info(f"Deleted all {session_count} sessions")
            
            # Recreate one empty session per user
            for email in user_emails:
                try:
                    user = User.objects.get(email=email)
                    Session.objects.create(user_email=user, session_chats=[])
                    logger.info(f"Created new empty session for user {email}")
                except User.DoesNotExist:
                    logger.warning(f"User with email {email} no longer exists, skipping")
        else:
            logger.info("SUCCESS: All sessions now have empty chat history")
            
        return True
    except Exception as e:
        logger.error(f"Error clearing sessions: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == '__main__':
    logger.info("Starting session clearing process...")
    success = clear_all_sessions()
    if success:
        logger.info("Successfully cleared all sessions!")
    else:
        logger.error("Failed to clear all sessions") 