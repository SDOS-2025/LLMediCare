from rest_framework.decorators import api_view
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

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize AI agents
ai_agent = EnhancedAIAgent()
chatbot = MedicalChatbot()

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
        
        logger.info(f"Processing query: {query[:50]}...")
        
        try:
            # Run the async function in the event loop
            response = asyncio.run(chatbot.generate_response(query, context))
            
            # Ensure the response has the correct format
            if "**Information**" not in response and "**Symptoms**" not in response:
                # Add Information section if missing
                response = "**Information**\n- Based on your query, here is what you should know\n\n" + response
            
            if "**Recommendations**" not in response:
                # Add Recommendations section if missing
                response += "\n\n**Recommendations**\n- Please consult with a healthcare professional\n- Keep track of your symptoms\n- Follow proper health guidelines"
            
            if "**Medical Disclaimer**" not in response:
                # Add Medical Disclaimer section if missing
                response += "\n\n**Medical Disclaimer**\n- This information is for general guidance only\n- Not a substitute for professional medical advice\n- Consult your healthcare provider for specific advice"
            
            if "**Next Steps**" not in response:
                # Add Next Steps section if missing
                response += "\n\n**Next Steps**\n- Consider scheduling an appointment with your doctor\n- Document any specific concerns\n- Follow up with a healthcare professional as needed"
            
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
        
        context = {'appointment_info': appointment_info}
        response = asyncio.run(chatbot.generate_response(query, context))
        return Response({'response': response})
    except Exception as e:
        logger.error(f"Error processing appointment query: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def summarize_report(request):
    """Summarize medical reports"""
    try:
        report_text = request.data.get('report_text')
        
        if not report_text:
            return Response({'error': 'Report text is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        context = {'report_text': report_text}
        response = asyncio.run(chatbot.generate_response("Please summarize this medical report", context))
        return Response({'summary': response})
    except Exception as e:
        logger.error(f"Error summarizing report: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def process_medical_query(request):
    """Process medical-specific queries"""
    try:
        query = request.data.get('query')
        
        if not query:
            return Response({'error': 'Query is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        response = asyncio.run(chatbot.generate_response(query))
        return Response({'response': response})
    except Exception as e:
        logger.error(f"Error processing medical query: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST', 'OPTIONS'])
def clear_conversation(request):
    """Clear conversation memory"""
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        response = Response()
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
        response["Access-Control-Allow-Credentials"] = "true"
        return response
        
    try:
        logger.info("Clearing conversation memory")
        # Clear both AI agent and chatbot memory
        ai_agent.clear_memory()
        chatbot.clear_history()
        
        response = Response({
            'status': 'success',
            'message': 'Conversation memory cleared successfully'
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