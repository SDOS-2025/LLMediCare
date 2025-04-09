import asyncio
import logging
import sys
import os

# Add parent directory to path so we can import modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai_agent.ai_handler import EnhancedAIAgent
from ai_agent.chatbot import MedicalChatbot

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_duplicate_formats():
    """Test to ensure the chatbot doesn't produce duplicate formatted responses"""
    print("Initializing AI agent and chatbot...")
    chatbot = MedicalChatbot()
    
    # ---- Test 1: Test with a raw text response ----
    # This will simulate a response that needs formatting
    raw_response = """
    Broken arms typically show symptoms like pain, swelling, and visible deformity.
    You may not be able to move your arm normally.

    You should immobilize the arm using a sling or splint, apply ice to reduce swelling,
    and take over-the-counter pain relievers. It's important to seek medical attention
    immediately for proper diagnosis and treatment.

    After medical evaluation, follow the doctor's instructions carefully, attend all follow-up
    appointments, and consider physical therapy for recovery.
    """
    
    print("\n--- Test 1: Formatting Raw Text ---")
    formatted = chatbot._format_response(raw_response)
    print(formatted)
    
    # Count sections and check for duplicates
    section_markers = ["**Information**", "**Symptoms**", "**Recommendations**", "**Medical Disclaimer**", "**Next Steps**"]
    section_count = sum(formatted.count(marker) for marker in section_markers)
    print(f"Section count: {section_count} (Expected: 4)")
    assert section_count == 4, "Raw text formatting failed: Incorrect number of sections"
    
    # ---- Test 2: Test with an already formatted response ----
    # This will simulate a model response that already has formatting
    formatted_response = """**Information**
- Broken arms typically cause severe pain, swelling, and visible deformity
- You may experience limited movement or a grating sensation
- The injured area may appear bruised or discolored

**Recommendations**
- Immobilize the injured arm using a sling or splint
- Apply ice wrapped in a cloth to reduce swelling
- Take over-the-counter pain medication

**Medical Disclaimer**
- This information is for general guidance only
- Not a substitute for professional medical advice
- Consult your healthcare provider for specific advice

**Next Steps**
- Go to an emergency room or urgent care immediately
- Ask for an X-ray to confirm the fracture
- Follow the treatment plan from your healthcare provider
"""
    
    print("\n--- Test 2: Already Formatted Text ---")
    re_formatted = chatbot._format_response(formatted_response)
    print(re_formatted)
    
    # Count sections again to check for duplicates
    section_count = sum(re_formatted.count(marker) for marker in section_markers)
    print(f"Section count: {section_count} (Expected: 4)")
    assert section_count == 4, "Already formatted text has duplicate sections"
    
    # ---- Test 3: Test actual API response ----
    # This will test the full generation flow
    print("\n--- Test 3: Full Response Generation ---")
    query = "I broke my arm at the gym, what should I do?"
    
    response = await chatbot.generate_response(query)
    print(response)
    
    # Count sections to check for duplicates
    section_count = sum(response.count(marker) for marker in section_markers)
    print(f"Section count: {section_count} (Expected: 4)")
    assert section_count == 4, "Generated response has duplicate sections"
    
    print("\n✅ All tests passed successfully! No duplicate formatting detected.")

if __name__ == "__main__":
    asyncio.run(test_duplicate_formats()) 