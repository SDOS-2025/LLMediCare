from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .ai_handler import EnhancedAIAgent
from .chatbot import MedicalChatbot
import os
from django.conf import settings
import json
from datetime import datetime
import asyncio
from django.http import JsonResponse
from asgiref.sync import sync_to_async
import logging
import traceback
import uuid

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Dictionary to store user-specific chatbot instances
user_chatbots = {}
user_ai_agents = {}

def get_user_id(request):
    """Extract or generate a user ID from the request"""
    # Check if user ID is provided in the request
    user_id = request.data.get('user_id')
    
    # If no user ID provided, check for session ID
    if not user_id:
        user_id = request.session.session_key
    
    # If still no user ID, check cookies
    if not user_id and 'user_id' in request.COOKIES:
        user_id = request.COOKIES.get('user_id')
    
    # If no user ID found, generate a new one
    if not user_id:
        user_id = f"user_{uuid.uuid4().hex[:8]}"
        
    return user_id

def get_chatbot_for_user(user_id):
    """Get or create a chatbot instance for the specified user"""
    if user_id not in user_chatbots:
        # Create new AI agent and chatbot for this user
        user_ai_agents[user_id] = EnhancedAIAgent(user_id=user_id)
        user_chatbots[user_id] = MedicalChatbot(user_id=user_id)
        logger.info(f"Created new chatbot instance for user: {user_id}")
    
    return user_chatbots[user_id]

@api_view(['POST', 'OPTIONS'])
def process_query(request):
    """Process general queries using the enhanced chatbot"""
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
        response["Access-Control-Allow-Credentials"] = "true"
        return response
        
    try:
        query = request.data.get('query')
        context = request.data.get('context', {})
        
        if not query:
            error_response = Response(
                {'error': 'Query is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            # Add CORS headers to error response
            error_response["Access-Control-Allow-Origin"] = "*"
            error_response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
            error_response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
            error_response["Access-Control-Allow-Credentials"] = "true"
            return error_response
        
        # Get or create user-specific chatbot
        user_id = get_user_id(request)
        chatbot = get_chatbot_for_user(user_id)
        
        logger.info(f"Processing query for user {user_id}: {query[:50]}...")
        
        try:
            # Run the async function in the event loop
            response = asyncio.run(chatbot.generate_response(query, context))
            
            success_response = Response({'response': response})
            
            # Add CORS headers to success response
            success_response["Access-Control-Allow-Origin"] = "*"
            success_response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
            success_response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
            success_response["Access-Control-Allow-Credentials"] = "true"
            
            return success_response
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            logger.error(traceback.format_exc())
            
            # Create a user-friendly error response
            error_message = """**Error**
- I apologize, but I encountered an error processing your query.
- The system might be experiencing technical difficulties.

**Next Steps**
- Please try again in a few moments
- Try rephrasing your question
- If the issue persists, please contact support"""
            
            error_response = Response({'response': error_message, 'error': str(e)})
            
            # Add CORS headers to error response
            error_response["Access-Control-Allow-Origin"] = "*"
            error_response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
            error_response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
            error_response["Access-Control-Allow-Credentials"] = "true"
            
            return error_response
            
    except Exception as e:
        logger.error(f"General error processing query: {e}")
        logger.error(traceback.format_exc())
        
        error_response = Response(
            {
                'error': str(e),
                'response': """**Error**
- I apologize, but I encountered an error processing your request.
- Please try again later."""
            }, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
        # Add CORS headers to error response
        error_response["Access-Control-Allow-Origin"] = "*"
        error_response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        error_response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
        error_response["Access-Control-Allow-Credentials"] = "true"
        
        return error_response

@api_view(['POST'])
def process_appointment_query(request):
    """Process appointment-specific queries"""
    try:
        query = request.data.get('query')
        appointment_info = request.data.get('appointment_info', {})
        
        if not query:
            return Response({'error': 'Query is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create user-specific chatbot
        user_id = get_user_id(request)
        chatbot = get_chatbot_for_user(user_id)
        
        context = {'appointment_info': appointment_info}
        response = asyncio.run(chatbot.generate_response(query, context))
        
        # Add CORS headers
        cors_response = Response({'response': response})
        cors_response["Access-Control-Allow-Origin"] = "*"
        cors_response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        cors_response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
        cors_response["Access-Control-Allow-Credentials"] = "true"
        
        return cors_response
    except Exception as e:
        logger.error(f"Error processing appointment query: {e}")
        error_response = Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Add CORS headers
        error_response["Access-Control-Allow-Origin"] = "*"
        error_response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        error_response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
        error_response["Access-Control-Allow-Credentials"] = "true"
        return error_response

@api_view(['POST'])
def summarize_report(request):
    """Summarize medical reports"""
    try:
        report_text = request.data.get('report_text')
        
        if not report_text:
            return Response({'error': 'Report text is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create user-specific chatbot
        user_id = get_user_id(request)
        chatbot = get_chatbot_for_user(user_id)
        
        context = {'report_text': report_text}
        response = asyncio.run(chatbot.generate_response("Please summarize this medical report", context))
        
        # Add CORS headers
        cors_response = Response({'summary': response})
        cors_response["Access-Control-Allow-Origin"] = "*"
        cors_response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        cors_response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
        cors_response["Access-Control-Allow-Credentials"] = "true"
        
        return cors_response
    except Exception as e:
        logger.error(f"Error summarizing report: {e}")
        error_response = Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Add CORS headers
        error_response["Access-Control-Allow-Origin"] = "*"
        error_response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        error_response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
        error_response["Access-Control-Allow-Credentials"] = "true"
        return error_response

@api_view(['POST'])
def process_medical_query(request):
    """Process medical-specific queries"""
    try:
        query = request.data.get('query')
        
        if not query:
            return Response({'error': 'Query is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create user-specific chatbot
        user_id = get_user_id(request)
        chatbot = get_chatbot_for_user(user_id)
        
        response = asyncio.run(chatbot.generate_response(query))
        
        # Add CORS headers
        cors_response = Response({'response': response})
        cors_response["Access-Control-Allow-Origin"] = "*"
        cors_response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        cors_response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
        cors_response["Access-Control-Allow-Credentials"] = "true"
        
        return cors_response
    except Exception as e:
        logger.error(f"Error processing medical query: {e}")
        error_response = Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Add CORS headers
        error_response["Access-Control-Allow-Origin"] = "*"
        error_response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        error_response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
        error_response["Access-Control-Allow-Credentials"] = "true"
        return error_response

@api_view(['POST', 'OPTIONS'])
def clear_conversation(request):
    """Clear conversation memory for a specific user"""
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        response = Response()
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
        response["Access-Control-Allow-Credentials"] = "true"
        return response
        
    try:
        # Get the user ID
        user_id = get_user_id(request)
        logger.info(f"Clearing conversation memory for user: {user_id}")
        
        # Check if user has a chatbot instance
        if user_id in user_chatbots:
            # Clear both AI agent and chatbot memory
            if user_id in user_ai_agents:
                user_ai_agents[user_id].clear_memory()
            user_chatbots[user_id].clear_history()
            
            # Remove instances from dictionaries to free memory
            user_ai_agents.pop(user_id, None)
            user_chatbots.pop(user_id, None)
            
            logger.info(f"Cleared memory for user {user_id} and removed instances")
        else:
            logger.info(f"No existing chatbot for user {user_id}")
        
        response = Response({
            'status': 'success',
            'message': 'Conversation memory cleared successfully',
            'user_id': user_id
        })
        
        # Add CORS headers
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
        response["Access-Control-Allow-Credentials"] = "true"
        
        return response
        
    except Exception as e:
        logger.error(f"Error clearing conversation: {e}")
        error_response = Response(
            {
                'status': 'error',
                'error': str(e)
            }, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
        # Add CORS headers to error response as well
        error_response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        error_response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        error_response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
        error_response["Access-Control-Allow-Credentials"] = "true"
        
        return error_response

@api_view(['POST', 'OPTIONS'])
@parser_classes([MultiPartParser, FormParser])
def process_medical_report(request):
    """Process an uploaded medical report image using OCR and analyze its content"""
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
        response["Access-Control-Allow-Credentials"] = "true"
        return response
        
    try:
        # Check if file is present in the request
        if 'file' not in request.FILES:
            error_response = Response(
                {'success': False, 'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            return add_cors_headers(error_response)
            
        uploaded_file = request.FILES['file']
        
        # Check file type
        if not uploaded_file.content_type.startswith('image/'):
            error_response = Response(
                {'success': False, 'error': 'Uploaded file must be an image'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            return add_cors_headers(error_response)
            
        # Get user ID
        user_id = request.data.get('user_id')
        if not user_id:
            user_id = get_user_id(request)
            
        # Read file contents
        file_bytes = uploaded_file.read()
        
        # Get the chatbot instance for this user
        chatbot = get_chatbot_for_user(user_id)
        
        logger.info(f"Processing medical report image for user {user_id}, file size: {len(file_bytes)} bytes")
        
        # Process the image with OCR
        try:
            result = asyncio.run(chatbot.process_medical_image(file_bytes))
            
            if not result["success"]:
                error_response = Response(
                    {'success': False, 'error': result.get('error', 'Failed to process image')}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                return add_cors_headers(error_response)
            
            # Success response
            success_response = Response({
                'success': True,
                'extracted_text': result["extracted_text"],
                'analysis': result["analysis"],
                'message': "Medical report processed successfully"
            })
            
            return add_cors_headers(success_response)
            
        except Exception as e:
            logger.error(f"Error in OCR processing: {e}")
            logger.error(traceback.format_exc())
            
            error_response = Response(
                {'success': False, 'error': f"OCR processing error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            return add_cors_headers(error_response)
            
    except Exception as e:
        logger.error(f"General error processing medical report: {e}")
        logger.error(traceback.format_exc())
        
        error_response = Response(
            {'success': False, 'error': f"Error processing report: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        return add_cors_headers(error_response)

def add_cors_headers(response):
    """Add CORS headers to a response"""
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
    response["Access-Control-Allow-Credentials"] = "true"
    return response