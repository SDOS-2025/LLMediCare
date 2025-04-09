import requests
import json
from typing import Dict, List, Optional
import logging
from .ai_handler import EnhancedAIAgent
import os
from pathlib import Path
import pickle
import traceback

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

    def _format_response(self, text):
        """Format the response with proper markdown-style formatting"""
        # Clean up the text first
        text = text.strip()
        
        # Check if the text already has proper formatting
        if (text.count("**Information**") == 1 or text.count("**Symptoms**") == 1) and \
           text.count("**Recommendations**") == 1 and \
           text.count("**Medical Disclaimer**") == 1 and \
           text.count("**Next Steps**") == 1:
            # Text already has the correct sections, just return as is
            logger.info("Response already has correct formatting, using as-is")
            return text
        
        # Initialize formatted sections
        sections = {}
        current_section = None
        current_content = []
        
        # Define the expected sections in order
        expected_sections = ["Information", "Symptoms", "Recommendations", "Medical Disclaimer", "Next Steps"]
        
        # First, check if there are any existing section headers
        has_section_headers = any(f"**{section}**" in text for section in expected_sections)
        
        if has_section_headers:
            # Parse existing sections
            lines = text.split('\n')
            
            # Process each line to identify sections and content
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Check if this is a section header
                if line.startswith('**') and line.endswith('**'):
                    # If we have a previous section, add it to sections
                    if current_section and current_content:
                        sections[current_section] = current_content
                    
                    # Extract new section name
                    section_name = line.replace('**', '').strip()
                    current_section = section_name
                    current_content = []
                else:
                    # Format content line with bullet point if missing
                    line = line.lstrip('•-*').strip()
                    if line and not line.startswith('-'):
                        line = f"- {line}"
                    if line:  # Only add non-empty lines
                        current_content.append(line)
            
            # Add the last section if exists
            if current_section and current_content:
                sections[current_section] = current_content
        else:
            # No sections found, split content into informational paragraphs
            paragraphs = text.split('\n\n')
            
            # Assign paragraphs to appropriate sections
            # First paragraph is usually information
            if paragraphs:
                info_text = paragraphs[0]
                info_lines = []
                for line in info_text.split('\n'):
                    line = line.strip()
                    if line:
                        info_lines.append(f"- {line}")
                sections["Information"] = info_lines
            
            # If there are more paragraphs, use them for recommendations and next steps
            if len(paragraphs) > 1:
                rec_text = paragraphs[1]
                rec_lines = []
                for line in rec_text.split('\n'):
                    line = line.strip()
                    if line:
                        rec_lines.append(f"- {line}")
                sections["Recommendations"] = rec_lines
            
            # Add standard medical disclaimer
            sections["Medical Disclaimer"] = [
                "- This information is for general guidance only",
                "- Not a substitute for professional medical advice",
                "- Consult your healthcare provider for specific advice"
            ]
            
            # Add next steps if available, otherwise use default
            if len(paragraphs) > 2:
                next_text = paragraphs[2]
                next_lines = []
                for line in next_text.split('\n'):
                    line = line.strip()
                    if line:
                        next_lines.append(f"- {line}")
                sections["Next Steps"] = next_lines
            else:
                sections["Next Steps"] = [
                    "- Consider scheduling an appointment with your doctor",
                    "- Document any specific concerns",
                    "- Follow up with a healthcare professional as needed"
                ]
        
        # Ensure we have all required sections
        formatted_output = []
        
        # Add Information or Symptoms section
        if "Information" in sections:
            formatted_output.append("**Information**")
            formatted_output.extend(sections["Information"])
        elif "Symptoms" in sections:
            formatted_output.append("**Symptoms**")
            formatted_output.extend(sections["Symptoms"])
        else:
            formatted_output.append("**Information**")
            formatted_output.append("- Based on your query, here is what you should know")
            formatted_output.append("- Please note this is general information only")
        
        # Add empty line
        formatted_output.append("")
        
        # Add Recommendations section
        if "Recommendations" in sections:
            formatted_output.append("**Recommendations**")
            formatted_output.extend(sections["Recommendations"])
        else:
            formatted_output.append("**Recommendations**")
            formatted_output.append("- Please consult with a healthcare professional")
            formatted_output.append("- Keep track of your symptoms")
            formatted_output.append("- Follow proper health guidelines")
        
        # Add empty line
        formatted_output.append("")
        
        # Add Medical Disclaimer section
        if "Medical Disclaimer" in sections:
            formatted_output.append("**Medical Disclaimer**")
            formatted_output.extend(sections["Medical Disclaimer"])
        else:
            formatted_output.append("**Medical Disclaimer**")
            formatted_output.append("- This information is for general guidance only")
            formatted_output.append("- Not a substitute for professional medical advice")
            formatted_output.append("- Consult your healthcare provider for specific advice")
        
        # Add empty line
        formatted_output.append("")
        
        # Add Next Steps section
        if "Next Steps" in sections:
            formatted_output.append("**Next Steps**")
            formatted_output.extend(sections["Next Steps"])
        else:
            formatted_output.append("**Next Steps**")
            formatted_output.append("- Consider scheduling an appointment with your doctor")
            formatted_output.append("- Document any specific concerns")
            formatted_output.append("- Follow up with a healthcare professional as needed")
        
        # Join formatted sections with proper spacing
        formatted_text = '\n'.join(formatted_output)
        
        # Log the number of sections to help with debugging
        section_markers = ["**Information**", "**Symptoms**", "**Recommendations**", "**Medical Disclaimer**", "**Next Steps**"]
        section_count = sum(formatted_text.count(marker) for marker in section_markers)
        logger.info(f"Formatted response contains {section_count} section markers")
        
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

    async def generate_response(self, query: str, context: Optional[Dict] = None) -> str:
        """
        Generate a response using Gemma model with medical context awareness
        """
        try:
            # First, get relevant medical knowledge from our AI agent
            medical_context = await self.ai_agent.process_query(query)
            
            # Extract important keywords from the query
            keywords = query.lower().split()
            
            # Prepare the conversation history
            history_text = "\n".join(self.conversation_history[-5:]) if self.conversation_history else ""
            
            # Analyze if we have a specific medical condition or situation
            medical_conditions = []
            if any(word in query.lower() for word in ["broke", "broken", "fracture", "injured", "sprain"]):
                medical_conditions.append("injury")
            if any(word in query.lower() for word in ["gym", "workout", "exercise", "training"]):
                medical_conditions.append("fitness-related")
            if any(word in query.lower() for word in ["flu", "cold", "fever", "cough"]):
                medical_conditions.append("illness")
            if any(word in query.lower() for word in ["stress", "anxiety", "depression", "mental"]):
                medical_conditions.append("mental health")
            if any(word in query.lower() for word in ["diet", "nutrition", "food", "eating"]):
                medical_conditions.append("nutrition")
            
            condition_context = ", ".join(medical_conditions) if medical_conditions else "general health"
            
            # Construct the prompt with medical context and system instructions
            prompt = f"""You are an advanced medical AI assistant powered by Google's Gemma model. Your role is to provide helpful, accurate, and empathetic medical information while maintaining appropriate medical disclaimers.

Medical Context: {medical_context}

Query Category: {condition_context}

User Query: {query}

Previous Conversation:
{history_text}

IMPORTANT INSTRUCTIONS:
1. Directly address the user's specific query about {condition_context}
2. Use the medical context provided but adapt it to the user's specific situation
3. Be factually accurate but also empathetic
4. If the query mentions a specific injury or condition, prioritize that information
5. Provide information, recommendations, and any necessary next steps
6. DO NOT use any special formatting, markdown, or section headers in your response
7. Simply provide the raw content as plain text paragraphs
8. I will handle formatting your response appropriately

Please write a helpful, informative response about {condition_context} that addresses the user's query."""

            # Call Ollama API with Gemma model
            response = requests.post(
                f"{self.base_url}/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "top_k": 40,
                        "num_ctx": 4096
                    }
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                generated_response = result.get("response", "")
                
                # Check if the response already has formatting
                contains_formatting = "**Information**" in generated_response or "**Symptoms**" in generated_response
                
                if contains_formatting:
                    # If the model ignored our instructions and already formatted the response,
                    # just extract the main content without re-formatting
                    logger.info("Response already contains formatting, using as-is")
                    formatted_response = generated_response
                else:
                    # Format the plain text response
                    formatted_response = self._format_response(generated_response)
                
                # Update conversation history
                self.conversation_history.append(f"User: {query}\nAssistant: {formatted_response}")
                if len(self.conversation_history) > self.max_history:
                    self.conversation_history.pop(0)
                
                # Save history to persistent storage
                history_saved = self._save_history()
                if not history_saved:
                    logger.warning("Failed to save conversation history")
                
                return formatted_response
            else:
                logger.error(f"Error from Ollama API: {response.status_code}")
                return """**Error**
- I apologize, but I'm having trouble generating a response
- Please try again

**Next Steps**
- Try rephrasing your question
- Check your internet connection
- Contact support if the issue persists"""
        except Exception as e:
            logger.error(f"Error in generate_response: {e}")
            return """**Error**
- I apologize, but I encountered an error
- Please try rephrasing your question

**Next Steps**
- Try asking your question in a different way
- Make sure your question is clear and specific
- Try again in a few moments"""

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