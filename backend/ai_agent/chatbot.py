import requests
import json
from typing import Dict, List, Optional
import logging
from .ai_handler import EnhancedAIAgent
import os
from pathlib import Path

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

    def _format_response(self, text):
        """Format the response with proper markdown-style formatting"""
        # Clean up the text first
        text = text.strip()
        
        # Initialize formatted sections
        formatted_sections = []
        
        # Define the expected sections in order
        expected_sections = ["Information", "Symptoms", "Recommendations", "Medical Disclaimer", "Next Steps", "Error"]
        
        # Split the text into lines
        lines = text.split('\n')
        
        # Process each line to identify sections and content
        current_section = None
        current_content = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if this is a section header
            if '**' in line:
                # If we have a previous section, add it to formatted sections
                if current_section and current_content:
                    formatted_sections.append(f"**{current_section}**")
                    formatted_sections.append('\n'.join(current_content))
                
                # Extract new section name
                section_name = line.replace('**', '').strip()
                current_section = section_name
                current_content = []
            else:
                # Format content line with bullet point
                line = line.lstrip('•-*').strip()
                if line:
                    current_content.append(f"- {line}")
        
        # Add the last section if exists
        if current_section and current_content:
            formatted_sections.append(f"**{current_section}**")
            formatted_sections.append('\n'.join(current_content))
        
        # If no sections were found or sections are incomplete, create a complete structure
        if not formatted_sections or len(formatted_sections) < 4:
            # Check if we have any content
            if not formatted_sections:
                # If no sections at all, use the entire text as information
                formatted_sections = [
                    "**Information**",
                    f"- {text}",
                    "\n**Recommendations**",
                    "- Please consult with a healthcare professional for personalized advice\n- Keep track of your symptoms and their duration\n- Follow proper health and safety guidelines",
                    "\n**Medical Disclaimer**",
                    "- This information is for general guidance only\n- Not a substitute for professional medical advice\n- Consult your healthcare provider for specific advice",
                    "\n**Next Steps**",
                    "- Consider scheduling an appointment with your doctor\n- Document any specific concerns or questions\n- Follow up with a healthcare professional as needed"
                ]
            else:
                # If we have some sections but not all, add the missing ones
                existing_sections = [s.replace('**', '') for s in formatted_sections[::2]]
                
                # Add missing sections
                for section in expected_sections:
                    if section not in existing_sections:
                        if section == "Information" or section == "Symptoms":
                            formatted_sections.append(f"\n**{section}**")
                            formatted_sections.append("- No specific information provided")
                        elif section == "Recommendations":
                            formatted_sections.append(f"\n**{section}**")
                            formatted_sections.append("- Please consult with a healthcare professional\n- Keep track of your symptoms\n- Follow proper health guidelines")
                        elif section == "Medical Disclaimer":
                            formatted_sections.append(f"\n**{section}**")
                            formatted_sections.append("- This information is for general guidance only\n- Not a substitute for professional medical advice\n- Consult your healthcare provider for specific advice")
                        elif section == "Next Steps":
                            formatted_sections.append(f"\n**{section}**")
                            formatted_sections.append("- Consider scheduling an appointment with your doctor\n- Document any specific concerns\n- Follow up with a healthcare professional as needed")
        
        # Join sections with proper spacing
        formatted_text = '\n\n'.join(formatted_sections)
        
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
            
            # Prepare the conversation history
            history_text = "\n".join(self.conversation_history[-5:]) if self.conversation_history else ""
            
            # Construct the prompt with medical context and system instructions
            prompt = f"""You are an advanced medical AI assistant powered by Google's Gemma model. Your role is to provide helpful, accurate, and empathetic medical information while maintaining appropriate medical disclaimers.

Medical Context: {medical_context}

Previous Conversation:
{history_text}

User Query: {query}

IMPORTANT FORMATTING INSTRUCTIONS:
1. Structure your response with these exact sections in order:
   **Information** or **Symptoms**
   **Recommendations**
   **Medical Disclaimer**
   **Next Steps**

2. Format each section like this:
   **Section Title**
   - First bullet point
   - Second bullet point
   - Third bullet point

3. Rules for formatting:
   - Start each section with ** before and after the title
   - Use a dash (-) at the start of each line within sections
   - Add one blank line between sections
   - Keep bullet points concise and clear
   - Do not use any other formatting markers

Example format:
**Information**
- First point about the condition
- Second point about the condition
- Third point about the condition

**Recommendations**
- First recommendation
- Second recommendation
- Third recommendation

Please provide your response following this exact format."""

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
                
                # Format the response
                formatted_response = self._format_response(generated_response)
                
                # Update conversation history
                self.conversation_history.append(f"User: {query}\nAssistant: {formatted_response}")
                if len(self.conversation_history) > self.max_history:
                    self.conversation_history.pop(0)
                
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
        return True 