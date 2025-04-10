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
import pytesseract
from PIL import Image
import numpy as np
import io
import base64
import sys
import re

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Tesseract path for Windows
if os.name == 'nt':  # Windows
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    # Alternative common locations
    if not os.path.exists(pytesseract.pytesseract.tesseract_cmd):
        potential_paths = [
            r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
            r'C:\Program Files\Tesseract-OCR\tesseract.exe',
            r'C:\Tesseract-OCR\tesseract.exe'
        ]
        for path in potential_paths:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                break

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
    def __init__(self, user_id=None):
        self.base_url = "http://localhost:11434/api"
        self.model = "gemma:2b"  # Using Google's Gemma 2B model
        self.user_id = user_id or "default"
        self.ai_agent = EnhancedAIAgent(user_id=self.user_id)
        self.conversation_history = []
        self.max_history = 10
        
        # Create a directory for user conversation histories
        self.history_dir = os.path.join(os.path.dirname(__file__), "conversation_histories")
        os.makedirs(self.history_dir, exist_ok=True)
        
        # Set history file specific to this user
        self.history_file = os.path.join(self.history_dir, f"history_{self.user_id}.pkl")
        
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
        Apply formatting to the model's response to make it more structured and readable
        with bullet points and proper section formatting
        """
        # Remove any extra whitespace
        text = text.strip()
        
        # If the text is empty, return a default message
        if not text:
            return "I apologize, but I couldn't generate a proper response. Please try asking your question again."
        
        # Format the response with Markdown styling for better visual appearance
        formatted_text = text
        
        # Ensure section headers use proper Markdown format
        # Replace any headers that don't use ## format
        header_patterns = [
            (r'(?im)^(summary|overview)[:]\s*$', '## Summary\n'),
            (r'(?im)^(symptoms|signs)[:]\s*$', '## Symptoms\n'),
            (r'(?im)^(diagnosis|condition|disease)[:]\s*$', '## Diagnosis\n'),
            (r'(?im)^(treatment|therapy|management)[:]\s*$', '## Treatment\n'),
            (r'(?im)^(medications|prescription|drug)[:]\s*$', '## Medications\n'),
            (r'(?im)^(recommendations|advice|suggestions)[:]\s*$', '## Recommendations\n'),
            (r'(?im)^(prevention|precautions)[:]\s*$', '## Prevention\n'),
            (r'(?im)^(warnings|cautions|alerts)[:]\s*$', '## Important Warnings\n'),
            (r'(?im)^(follow.?up|next.?steps)[:]\s*$', '## Follow-up Steps\n'),
            (r'(?im)^(key medical findings)[:]\s*$', '## Key Medical Findings\n'),
            (r'(?im)^(report summary)[:]\s*$', '## Report Summary\n'),
            (r'(?im)^(diagnosed conditions)[:]\s*$', '## Diagnosed Conditions\n')
        ]
        
        # Process each section pattern
        for pattern, replacement in header_patterns:
            formatted_text = re.sub(pattern, replacement, formatted_text)
        
        # Process each line
        lines = formatted_text.split('\n')
        formatted_lines = []
        in_list = False
        in_numbered_list = False
        expected_next_number = 1
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                # Keep paragraph breaks
                formatted_lines.append('')
                in_list = False
                in_numbered_list = False
                expected_next_number = 1
                continue
            
            # Check if this line is already a properly formatted section header (## Header)
            if re.match(r'^##\s+.+', line):
                # Add spacing before headers (except the first one)
                if i > 0 and formatted_lines and formatted_lines[-1] != '':
                    formatted_lines.append('')
                
                formatted_lines.append(line)
                in_list = False
                in_numbered_list = False
                expected_next_number = 1
                continue
            
            # Check if this is a numbered list item
            numbered_match = re.match(r'^(\d+)\.?\s+(.+)', line)
            if numbered_match:
                number = int(numbered_match.group(1))
                content = numbered_match.group(2)
                
                # Ensure proper sequential numbering
                if not in_numbered_list or number == expected_next_number:
                    formatted_lines.append(f"{number}. {content}")
                    in_numbered_list = True
                    expected_next_number = number + 1
                else:
                    # If the number doesn't match what we expect, force the correct number
                    formatted_lines.append(f"{expected_next_number}. {content}")
                    expected_next_number += 1
                
                in_list = False
                continue
                
            # Check if this is a bullet list item
            if re.match(r'^[-*•]\s+.+', line):
                # Format existing bullet points consistently
                if line.startswith('•') or line.startswith('*'):
                    line = '- ' + line[1:].lstrip()
                formatted_lines.append(line)
                in_list = True
                in_numbered_list = False
                expected_next_number = 1
                continue
                
            # Format short phrases as bullet points if they're not already
            elif len(line) < 100 and not line.endswith('.') and not re.match(r'^[A-Z].*[\.\?!]$', line):
                # Convert to a list item if it's not a complete sentence
                formatted_lines.append(f"- {line}")
                in_list = True
                in_numbered_list = False
                expected_next_number = 1
                continue
            
            # Regular paragraph text
            formatted_lines.append(line)
            in_list = False
            in_numbered_list = False
            expected_next_number = 1
        
        # Join the lines back together
        formatted_text = '\n'.join(formatted_lines)
        
        # Add a disclaimer if not already present
        if "disclaimer" not in formatted_text.lower() and "note:" not in formatted_text.lower():
            formatted_text += "\n\n*Disclaimer: This information is provided for educational purposes only and should not replace professional medical advice.*"
        
        # Ensure consistent spacing between sections
        # Replace multiple consecutive newlines with just two
        formatted_text = re.sub(r'\n{3,}', '\n\n', formatted_text)
        
        logger.info(f"Formatted response with improved styling, length: {len(formatted_text)} characters")
        
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

    async def process_medical_image(self, image_data: bytes) -> Dict:
        """
        Process a medical report image using OCR and analyze the content
        
        Args:
            image_data: The raw image data in bytes
        
        Returns:
            A dictionary containing the extracted text and analysis
        """
        try:
            # Log the image size for debugging
            logger.info(f"Processing image of size: {len(image_data)} bytes")
            
            # Convert image bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Log image details
            logger.info(f"Image format: {image.format}, size: {image.size}, mode: {image.mode}")
            
            # Optimize image for OCR processing
            # Resize large images to speed up processing
            max_dimension = 2000  # Maximum width or height
            if max(image.size) > max_dimension:
                # Calculate new dimensions while preserving aspect ratio
                ratio = max_dimension / max(image.size)
                new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
                image = image.resize(new_size, Image.LANCZOS)
                logger.info(f"Resized image to {new_size} for faster processing")
            
            # Convert to grayscale for better OCR
            image = image.convert('L')
            
            # Improve contrast using histogram equalization
            img_array = np.array(image)
            # Simple contrast enhancement
            img_array = ((img_array - img_array.min()) / (img_array.max() - img_array.min()) * 255).astype(np.uint8)
            image = Image.fromarray(img_array)
            
            # Verify Tesseract is installed
            try:
                tesseract_version = pytesseract.get_tesseract_version()
                logger.info(f"Tesseract version: {tesseract_version}")
            except Exception as e:
                logger.error(f"Tesseract not properly installed: {str(e)}")
                return {
                    "success": False,
                    "error": "Tesseract OCR is not properly installed. Please ensure Tesseract is installed and configured correctly."
                }
            
            # Extract text using OCR with optimized settings
            try:
                # Use optimized OCR configuration
                custom_config = r'--oem 3 --psm 6 -l eng'  # Optimized settings for text documents
                logger.info("Starting OCR extraction with optimized settings...")
                extracted_text = pytesseract.image_to_string(image, config=custom_config)
                logger.info(f"OCR extraction completed: {len(extracted_text)} characters extracted")
            except Exception as e:
                logger.error(f"OCR extraction failed: {str(e)}")
                return {
                    "success": False,
                    "error": f"OCR extraction failed: {str(e)}. Please ensure Tesseract is installed correctly."
                }
            
            if not extracted_text or len(extracted_text.strip()) < 10:
                logger.warning("Insufficient text extracted from image")
                return {
                    "success": False,
                    "error": "Could not extract sufficient text from the image. Please upload a clearer image."
                }
            
            # Process the extracted text with the LLM
            prompt = (
                "You are a medical expert assistant analyzing a doctor's report. "
                "Below is the text extracted from a medical report using OCR. "
                "There might be some errors or unclear parts due to the OCR process. "
                "Please analyze this report and provide the following information in a structured format:\n\n"
                
                "## Report Summary\n"
                "Provide a concise summary of the key points in the report.\n\n"
                
                "## Key Medical Findings\n"
                "List the most important medical findings, test results, and observations from the report.\n\n"
                
                "## Diagnosed Conditions\n"
                "Identify any diagnosed conditions, diseases, or health issues mentioned in the report.\n\n"
                
                "## Medications & Treatments\n"
                "List all medications, dosages, treatment plans, or therapies mentioned in the report.\n\n"
                
                "## Recommendations\n"
                "Provide detailed recommendations based on the report including:\n"
                "- Lifestyle modifications\n"
                "- Diet changes\n"
                "- Exercise recommendations\n"
                "- Follow-up appointments\n"
                "- When to seek immediate medical attention\n\n"
                
                "## Important Warnings\n"
                "Highlight any warnings, precautions, or critical information the patient should be aware of.\n\n"
                
                f"REPORT TEXT:\n{extracted_text}\n\n"
                
                "Format your response with clear section headings and bullet points for easy readability. "
                "If some parts of the text are unclear or seem like OCR errors, use your medical knowledge to make reasonable interpretations, "
                "but indicate when you're unsure about certain details."
            )
            
            # Generate the analysis using the LLM
            analysis = await self.llm_model.generate_text(prompt)
            
            return {
                "success": True,
                "extracted_text": extracted_text,
                "analysis": analysis
            }
            
        except Exception as e:
            logger.error(f"Error processing medical image: {str(e)}", exc_info=True)
            error_message = f"Error processing image: {str(e)}"
            logger.error(f"Detailed error: {error_message}")
            return {
                "success": False,
                "error": error_message
            }

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
                
            # Determine if this is a follow-up question related to a medical report
            is_followup_question = context.get('is_followup_question', False)
            has_report_context = context.get('report_text') or context.get('report_analysis')
            
            # Check if the query appears unrelated to the medical report context
            # This helps avoid forcing all responses to be about the medical report
            if is_followup_question and has_report_context:
                # Check if the query appears to be about a completely different topic
                medical_keywords = [
                    "report", "scan", "test", "results", "diagnosis", "doctor", 
                    "medical", "hospital", "treatment", "cancer", "tumor", "medication",
                    "prescription", "therapy", "doctor", "health", "symptom"
                ]
                
                # Simple heuristic to check if query is likely unrelated to the report
                query_lower = query.lower()
                contains_medical_term = any(keyword in query_lower for keyword in medical_keywords)
                
                # If the query seems completely unrelated, don't treat it as a follow-up
                if not contains_medical_term and len(query.split()) > 3:
                    logger.info("Query appears unrelated to medical report context - responding as general query")
                    # Clear the context for this specific query to avoid forcing a medical report response
                    is_followup_question = False
                    
            # Get additional knowledge if necessary
            knowledge_info = await self._get_additional_knowledge(query)
            
            # Determine conversation mode and needed information
            should_ask_about_symptoms = self._should_ask_about_symptoms(query)
            should_ask_about_medication = self._should_ask_about_medication(query)
            
            # Build the base prompt for the model 
            prompt = (
                "You are a friendly and helpful medical assistant named MediCare. "
                "Your goal is to provide helpful medical information in a warm, conversational manner. "
                "You should structure your responses with clear section headings (using ## for main sections) and bullet points (using -) for better readability. "
                "Always organize information into categories and present them in a structured format. "
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
                
            # Include medical report context only when it's relevant to the current question
            if context.get('report_text') and is_followup_question:
                prompt += "Previously Uploaded Medical Report Text:\n"
                prompt += f"{context.get('report_text')}\n\n"
                
            if context.get('report_analysis') and is_followup_question:
                prompt += "Previous Analysis of the Medical Report:\n"
                prompt += f"{context.get('report_analysis')}\n\n"
                prompt += (
                    "The user is asking a follow-up question that may be related to their medical report. "
                    "If their question is clearly about the report, reference specific information from it. "
                    "If their question seems unrelated to the report (like a general medical question), "
                    "answer it normally without forcing connections to the report.\n\n"
                )
            
            # Add conversation guidance
            prompt += (
                "Guidelines for your response:\n"
                "1. Structure your response with clear section headings (## Section Name)\n"
                "2. Use bullet points (- ) for each key point to improve readability\n"
                "3. If you need to use numbered lists, start from 1 and use sequential numbers (1, 2, 3...)\n"
                "4. Group related information under appropriate sections\n" 
                "5. Provide accurate information in a helpful way\n"
                "6. Address the user's specific concerns directly\n"
                "7. Use simple language and explain any medical terms\n"
                "8. Keep your tone conversational and warm despite the structured format\n"
                "9. Include a disclaimer that this is informational and not a replacement for professional medical advice\n"
            )
            
            # Add section format examples
            prompt += (
                "Format examples - use formats like these as appropriate for your response:\n"
                "## Summary\n"
                "- Key point 1\n"
                "- Key point 2\n\n"
                "## Recommendations\n"
                "1. First recommendation\n"
                "2. Second recommendation\n"
                "3. Third recommendation\n\n"
            )
            
            # Add specific questions about symptoms if relevant
            if should_ask_about_symptoms:
                prompt += "9. Ask follow-up questions about their symptoms\n"
                
            # Add specific questions about medication if relevant
            if should_ask_about_medication:
                prompt += "9. Ask follow-up questions about their current medications\n"
            
            # Get the raw response from the model
            logger.info(f"Sending prompt to LLM model. Prompt length: {len(prompt)} characters")
            raw_response = await self.llm_model.generate_text(prompt)
            logger.info(f"Received raw response. Length: {len(raw_response)} characters")
            
            # Apply formatting to preserve natural conversation flow while improving structure
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