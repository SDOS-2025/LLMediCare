import os
import sys
import django
import logging
import sqlite3

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'LLMediCare.settings')
django.setup()

# Now import Django models and database connection
from django.db import connection
from user_session.models import Session, User
from django.utils import timezone

def reset_frontend_history():
    """Completely reset all chat history by removing and recreating sessions"""
    try:
        # 1. First get a list of all users
        users = User.objects.all()
        logger.info(f"Found {users.count()} users in the system")
        
        # 2. Check existing sessions
        sessions = Session.objects.all()
        logger.info(f"Found {sessions.count()} existing sessions")
        
        # 3. Delete ALL existing sessions
        logger.info("Deleting all existing sessions...")
        Session.objects.all().delete()
        logger.info("All sessions deleted")
        
        # 4. Create one new session for each user
        new_sessions = []
        for user in users:
            new_session = Session.objects.create(
                user_email=user,
                session_chats=[],
                created_at=timezone.now()
            )
            new_sessions.append(new_session)
            logger.info(f"Created new session {new_session.id} for user {user.email}")
        
        logger.info(f"Created {len(new_sessions)} new sessions")
        
        # 5. Additionally, try to directly manipulate the SQLite database
        try:
            # Connect directly to SQLite database
            db_path = 'db.sqlite3'
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Try to vacuum the database to reclaim space
            logger.info("Vacuuming the database to reclaim space...")
            cursor.execute("VACUUM")
            
            # Commit changes and close connection
            conn.commit()
            conn.close()
            logger.info("Database vacuum completed")
        except Exception as e:
            logger.warning(f"Failed to vacuum database: {e}")
            # Continue with the script even if this part fails
        
        logger.info("Frontend history reset completed successfully")
        return True
    except Exception as e:
        logger.error(f"Error resetting frontend history: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == '__main__':
    logger.info("Starting frontend history reset process...")
    success = reset_frontend_history()
    if success:
        logger.info("Successfully reset all frontend history!")
    else:
        logger.error("Failed to reset frontend history") 