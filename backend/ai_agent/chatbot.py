import requests
import json
from typing import Dict, List, Optional
import logging
from .ai_handler import EnhancedAIAgent
import os
from pathlib import Path
import pickle
import traceback
import asyncio

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OllamaModel:
    """Wrapper for Ollama API to provide a consistent interface for text generation"""
    def __init__(self, base_url, model_name):
        self.base_url = base_url
        self.model_name = model_name
        self.available = self.test_connection()
        if self.available:
            logger.info(f"Initialized OllamaModel with model: {model_name}")
        else:
            logger.error(f"Failed to initialize OllamaModel: Ollama service not available at {base_url}")
        
    def test_connection(self) -> bool:
        """Test if Ollama API is available"""
        try:
            response = requests.get(f"{self.base_url}/tags", timeout=5)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Error connecting to Ollama API: {str(e)}")
            return False
        
    async def generate_text(self, prompt: str) -> str:
        """Generate text using the Ollama API"""
        try:
            if not self.available:
                return "I apologize, but the AI service is currently unavailable. Please try again later."
                
            logger.info(f"Generating text with model: {self.model_name}")
            response = requests.post(
                f"{self.base_url}/generate",
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "top_k": 40,
                        "num_predict": 2048,
                    }
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Error from Ollama API: {response.status_code} - {response.text}")
                return "I apologize, but I'm having trouble processing your request right now."
                
            result = response.json()
            return result.get("response", "")
            
        except Exception as e:
            logger.error(f"Error generating text: {str(e)}")
            logger.error(traceback.format_exc())
            return "Sorry, I encountered an error while generating a response."

class MedicalChatbot:
    def __init__(self):
        self.base_url = "http://localhost:11434/api"
        self.model = "gemma:2b"  # Using Google's Gemma 2B model
        self.ai_agent = EnhancedAIAgent()
        self.conversation_history = []
        self.max_history = 10
        self.history_file = os.path.join(os.path.dirname(__file__), "conversation_history.pkl")
        
        # Load any existing history
        self._load_history()
        
        # Initialize Gemma model
        self._initialize_gemma()
        
        # Initialize the LLM model interface
        self.llm_model = OllamaModel(self.base_url, self.model)

    def _initialize_gemma(self):
        """Initialize the Gemma model using Ollama"""
        try:
            # Check if Gemma model is already pulled
            response = requests.get(f"{self.base_url}/tags")
            if response.status_code == 200:
                models = response.json().get("models", [])
                if not any(model["name"].startswith("gemma") for model in models):
                    logger.info("Pulling Gemma model...")
                    # Pull the Gemma model
                    response = requests.post(
                        f"{self.base_url}/pull",
                        json={"name": self.model}
                    )
                    if response.status_code != 200:
                        logger.error("Failed to pull Gemma model")
                        raise Exception("Failed to initialize Gemma model")
            logger.info("Gemma model initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Gemma model: {e}")
            raise

    def _load_history(self):
        """Load conversation history from file"""
        try:
            if os.path.exists(self.history_file):
                try:
                    with open(self.history_file, 'rb') as f:
                        self.conversation_history = pickle.load(f)
                        logger.info(f"Loaded {len(self.conversation_history)} conversation history items")
                except (pickle.PickleError, EOFError) as e:
                    logger.error(f"Pickle error loading conversation history: {e}")
                    # File might be corrupted, create a new one
                    os.remove(self.history_file)
                    self.conversation_history = []
            else:
                # Create the directory if it doesn't exist
                os.makedirs(os.path.dirname(self.history_file), exist_ok=True)
                self.conversation_history = []
        except Exception as e:
            logger.error(f"Error loading conversation history: {e}")
            logger.error(traceback.format_exc())
            self.conversation_history = []

    def _save_history(self):
        """Save conversation history to file"""
        try:
            # Create the directory if it doesn't exist
            os.makedirs(os.path.dirname(self.history_file), exist_ok=True)
            
            # Save the history
            with open(self.history_file, 'wb') as f:
                pickle.dump(self.conversation_history, f)
                logger.info(f"Saved {len(self.conversation_history)} conversation history items")
            return True
        except Exception as e:
            logger.error(f"Error saving conversation history: {e}")
            logger.error(traceback.format_exc())
            return False

    def _format_response(self, text: str) -> str:
        """
        Apply lightweight formatting to the model's response
        This preserves the natural flow of the text while making it slightly more readable
        """
        # Remove any extra whitespace
        text = text.strip()
        
        # If the text is empty, return a default message
        if not text:
            return "I apologize, but I couldn't generate a proper response. Please try asking your question again."
        
        # Split the text into paragraphs
        paragraphs = [p.strip() for p in text.split('\n') if p.strip()]
        
        formatted_paragraphs = []
        for i, paragraph in enumerate(paragraphs):
            # Keep the paragraph as is, preserving its natural structure
            formatted_paragraphs.append(paragraph)
        
        # Join the paragraphs with double newlines for better readability
        formatted_text = '\n\n'.join(formatted_paragraphs)
        
        # Log the final length for debugging
        logger.debug(f"Formatted response length: {len(formatted_text)} characters")
        
        return formatted_text

    def _format_section_content(self, content):
        """Format the content of a section with proper bullet points"""
        lines = content.split('\n')
        formatted_lines = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Remove existing bullet points or dashes
            line = line.lstrip('•-*').strip()
            
            # Add bullet point if not already present
            if not line.startswith('-'):
                line = f"- {line}"
                
            formatted_lines.append(line)
            
        return '\n'.join(formatted_lines)

    def _should_ask_about_symptoms(self, query: str) -> bool:
        """
        Determine if we should prompt the user for more symptom information
        """
        query_lower = query.lower()
        symptom_keywords = [
            "symptom", "feel", "sick", "pain", "ache", "hurt", "discomfort", 
            "sore", "unwell", "ill", "suffering", "not feeling", "condition"
        ]
        
        # Check if query contains symptom-related terms but is vague
        has_symptom_terms = any(keyword in query_lower for keyword in symptom_keywords)
        
        # Determine if query is short/vague (simple heuristic)
        is_vague = len(query.split()) < 10
        
        return has_symptom_terms and is_vague
        
    def _should_ask_about_medication(self, query: str) -> bool:
        """
        Determine if we should prompt the user for more medication information
        """
        query_lower = query.lower()
        medication_keywords = [
            "medicine", "medication", "drug", "pill", "prescription", "dose", 
            "taking", "take", "prescribed", "pharmacy", "treatment", "side effect"
        ]
        
        # Check if query mentions medications but is missing specifics
        has_medication_terms = any(keyword in query_lower for keyword in medication_keywords)
        
        # Check if query is likely asking about drug interactions or side effects
        is_interaction_query = "interact" in query_lower or "side effect" in query_lower
        
        return has_medication_terms and not is_interaction_query
        
    async def _get_additional_knowledge(self, query: str) -> str:
        """
        Retrieve additional medical knowledge relevant to the query
        """
        try:
            # Use the AI agent to retrieve relevant knowledge
            knowledge = await self.ai_agent.process_query(query)
            
            # If knowledge is empty or None, return an empty string
            if not knowledge:
                logger.debug("No additional knowledge retrieved")
                return ""
                
            logger.info(f"Retrieved additional knowledge, length: {len(knowledge)} characters")
            return knowledge
            
        except Exception as e:
            logger.error(f"Error retrieving additional knowledge: {str(e)}", exc_info=True)
            return ""

    async def generate_response(self, query: str, context: Dict = None) -> str:
        """
        Generate a conversational response to the user's query
        
        Args:
            query: The user's query
            context: Optional context information such as appointment details or medical records
        """
        try:
            # Default context to empty dict if None
            if context is None:
                context = {}
                
            # Get additional knowledge if necessary
            knowledge_info = await self._get_additional_knowledge(query)
            
            # Determine conversation mode and needed information
            should_ask_about_symptoms = self._should_ask_about_symptoms(query)
            should_ask_about_medication = self._should_ask_about_medication(query)
            
            # Build the base prompt for the model 
            prompt = (
                "You are a friendly and helpful medical assistant named MediCare. "
                "Your goal is to provide helpful medical information in a warm, conversational manner. "
                "Always respond naturally like a real healthcare professional would in a conversation. "
                "Avoid using technical medical terminology unless necessary, and explain any medical terms "
                "you use in simple language. Show empathy and understanding in your responses.\n\n"
                f"User's question: {query}\n\n"
            )
            
            # Add relevant medical knowledge to the prompt if available
            if knowledge_info:
                prompt += f"Relevant medical knowledge: {knowledge_info}\n\n"
                
            # Add context information if available
            if context.get('appointment_info'):
                appointment_info = context.get('appointment_info')
                prompt += "Appointment Information:\n"
                for key, value in appointment_info.items():
                    prompt += f"- {key}: {value}\n"
                prompt += "\n"
                
            if context.get('report_text'):
                prompt += f"Medical Report to Summarize:\n{context.get('report_text')}\n\n"
            
            # Add conversation guidance
            prompt += (
                "Guidelines for your response:\n"
                "1. Be conversational and natural - respond as if you're having a chat\n"
                "2. Use a warm, friendly tone that builds trust\n"
                "3. Provide accurate information in a helpful way\n"
                "4. Address the user's specific concerns directly\n"
                "5. Use simple language and explain any medical terms\n"
                "6. Include a brief note that this is informational and not a replacement for professional medical advice\n"
            )
            
            # Add specific questions about symptoms if relevant
            if should_ask_about_symptoms:
                prompt += "7. Ask follow-up questions about their symptoms if appropriate\n"
                
            # Add specific questions about medication if relevant
            if should_ask_about_medication:
                prompt += "7. Ask follow-up questions about their current medications if appropriate\n"
            
            # Get the raw response from the model
            logger.info(f"Sending prompt to LLM model. Prompt length: {len(prompt)} characters")
            raw_response = await self.llm_model.generate_text(prompt)
            logger.info(f"Received raw response. Length: {len(raw_response)} characters")
            
            # Apply minimal formatting to preserve natural conversation flow
            formatted_response = self._format_response(raw_response)
            
            return formatted_response
            
        except Exception as e:
            # Log the error and return a friendly error message
            logger.error(f"Error generating response: {str(e)}", exc_info=True)
            return "I apologize, but I encountered an issue while processing your question. Please try again or rephrase your question."

    def clear_history(self):
        """Clear the conversation history"""
        logger.info("Clearing chatbot conversation history")
        self.conversation_history = []
        # Make sure the AI agent's memory is also cleared
        self.ai_agent.clear_memory()
        # Clear the saved history file
        if os.path.exists(self.history_file):
            try:
                os.remove(self.history_file)
                logger.info("Removed history file")
            except Exception as e:
                logger.error(f"Error removing history file: {e}")
                logger.error(traceback.format_exc())
        return True 